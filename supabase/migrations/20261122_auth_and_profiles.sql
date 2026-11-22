-- ====================================================================
-- BusGo Migration: Authentication, Profiles, and Role-Based Security
-- File: supabase/migrations/20261122_auth_and_profiles.sql
-- ====================================================================

-- 1. Create Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'suspended')),
  company_name TEXT,       -- Applicable for bus operators
  fleet_size INTEGER,      -- Applicable for bus operators
  registration_number TEXT,-- Bus operator GST / Transport Permit
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for high-performance role & email queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Security Helper Functions
-- Function to safely verify if the caller is an active administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  );
$$;

-- Function to safely verify if the caller is an active approved operator
CREATE OR REPLACE FUNCTION public.is_approved_operator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'operator' AND status = 'active'
  );
$$;

-- 4. Row Level Security Policies
-- A. Any authenticated user can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- B. Admins can read all user profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- C. Users can update their own personal info (Full name, phone, city)
-- Note: Role and Status can NEVER be updated by the user directly!
CREATE POLICY "Users can update own details"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
  );

-- D. Admins can update any profile (e.g. approving operators, suspending accounts)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Automatic Profile Provisioning Trigger on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_status TEXT;
  v_company TEXT;
  v_fleet INT;
  v_reg_no TEXT;
  v_city TEXT;
BEGIN
  -- Read requested role from signup metadata
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');

  -- SECURITY ENFORCEMENT:
  -- The 'admin' role can NEVER be granted via ordinary public registration!
  IF v_role = 'admin' THEN
    v_role := 'customer';
  END IF;

  -- Operator onboarding workflow:
  -- New operators are placed in 'pending_approval' until reviewed by an administrator.
  IF v_role = 'operator' THEN
    v_status := 'pending_approval';
    v_company := new.raw_user_meta_data->>'company_name';
    v_fleet := (new.raw_user_meta_data->>'fleet_size')::INT;
    v_reg_no := new.raw_user_meta_data->>'registration_number';
    v_city := new.raw_user_meta_data->>'city';
  ELSE
    v_status := 'active';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    status,
    company_name,
    fleet_size,
    registration_number,
    city,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    v_role,
    v_status,
    v_company,
    v_fleet,
    v_reg_no,
    v_city,
    NOW(),
    NOW()
  );

  RETURN new;
END;
$$;

-- Trigger firing on every new auth.users signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
