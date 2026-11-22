-- ====================================================================
-- BUSGO COMPLETE DATABASE MIGRATION SCRIPT (ALL-IN-ONE)
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- SECTION 1: PROFILES & USER ROLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'suspended')),
  company_name TEXT,
  fleet_size INTEGER,
  registration_number TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;
CREATE POLICY "Users can update own details"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
  );

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
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
  IF v_role = 'admin' THEN
    v_role := 'customer';
  END IF;

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
    id, email, full_name, phone, role, status, company_name, fleet_size, registration_number, city, created_at, updated_at
  )
  VALUES (
    new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone', v_role, v_status, v_company, v_fleet, v_reg_no, v_city, NOW(), NOW()
  )
  ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- SECTION 2: THE 16 CORE OPERATIONAL TABLES
-- ====================================================================

-- 2. OPERATORS
CREATE TABLE IF NOT EXISTS public.operators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 4.5 CHECK (rating >= 1.0 AND rating <= 5.0),
  reviews_count INTEGER DEFAULT 0,
  headquarters TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CITIES
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BUSES
CREATE TABLE IF NOT EXISTS public.buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bus_type TEXT NOT NULL,
  has_ac BOOLEAN DEFAULT TRUE,
  has_wifi BOOLEAN DEFAULT FALSE,
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BUS_SEATS
CREATE TABLE IF NOT EXISTS public.bus_seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  deck TEXT NOT NULL DEFAULT 'lower' CHECK (deck IN ('lower', 'upper')),
  row_num INTEGER NOT NULL,
  col_num INTEGER NOT NULL,
  seat_type TEXT NOT NULL DEFAULT 'seater' CHECK (seat_type IN ('seater', 'sleeper')),
  is_window BOOLEAN DEFAULT FALSE,
  is_ladies BOOLEAN DEFAULT FALSE,
  UNIQUE(bus_id, seat_number)
);

-- 6. ROUTES
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  destination_city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  distance_km INTEGER NOT NULL CHECK (distance_km > 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_different_cities CHECK (origin_city_id != destination_city_id)
);

-- 7. ROUTE_STOPS
CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  stop_type TEXT NOT NULL CHECK (stop_type IN ('boarding', 'dropping')),
  name TEXT NOT NULL,
  landmark TEXT,
  time_offset_minutes INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TRIPS
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE RESTRICT,
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE RESTRICT,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE RESTRICT,
  journey_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  base_fare NUMERIC(10,2) NOT NULL CHECK (base_fare > 0),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'departed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TRIP_SEATS
CREATE TABLE IF NOT EXISTS public.trip_seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  bus_seat_id UUID NOT NULL REFERENCES public.bus_seats(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  deck TEXT NOT NULL DEFAULT 'lower',
  seat_type TEXT NOT NULL DEFAULT 'seater',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'locked', 'booked')),
  locked_at TIMESTAMPTZ,
  lock_expires_at TIMESTAMPTZ,
  locked_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  locked_by_session_id TEXT,
  fare NUMERIC(10,2) NOT NULL,
  UNIQUE(trip_id, bus_seat_id),
  UNIQUE(trip_id, seat_number)
);

-- 10. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pnr TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE RESTRICT,
  total_fare NUMERIC(10,2) NOT NULL,
  convenience_fee NUMERIC(10,2) DEFAULT 0.00,
  gst NUMERIC(10,2) DEFAULT 0.00,
  discount_amount NUMERIC(10,2) DEFAULT 0.00,
  coupon_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  passenger_count INTEGER NOT NULL CHECK (passenger_count > 0),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  boarding_stop_id UUID REFERENCES public.route_stops(id),
  dropping_stop_id UUID REFERENCES public.route_stops(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PASSENGERS
CREATE TABLE IF NOT EXISTS public.passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  trip_seat_id UUID REFERENCES public.trip_seats(id) ON DELETE SET NULL,
  seat_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 1 AND age <= 120),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  pnr TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'CARD', 'NETBANKING')),
  gateway_status TEXT NOT NULL DEFAULT 'DEMO_SUCCESS' CHECK (gateway_status IN ('DEMO_SUCCESS', 'DEMO_FAILED')),
  transaction_ref TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. CANCELLATIONS
CREATE TABLE IF NOT EXISTS public.cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  pnr TEXT NOT NULL,
  cancelled_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  original_amount NUMERIC(10,2) NOT NULL,
  cancellation_fee NUMERIC(10,2) NOT NULL,
  refund_eligible_amount NUMERIC(10,2) NOT NULL,
  cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. REFUNDS
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cancellation_id UUID NOT NULL REFERENCES public.cancellations(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  pnr TEXT NOT NULL,
  refund_amount NUMERIC(10,2) NOT NULL,
  refund_status TEXT NOT NULL DEFAULT 'DEMO_REFUNDED' CHECK (refund_status IN ('DEMO_REFUNDED', 'FAILED')),
  refund_mode TEXT NOT NULL DEFAULT 'ORIGINAL_SOURCE',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_booking_amount NUMERIC(10,2) DEFAULT 0.00,
  max_discount NUMERIC(10,2),
  valid_until DATE,
  usage_limit INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'booking' CHECK (notification_type IN ('booking', 'trip', 'offer', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_route_date ON public.trips(route_id, journey_date);
CREATE INDEX IF NOT EXISTS idx_trip_seats_trip_status ON public.trip_seats(trip_id, status);
CREATE INDEX IF NOT EXISTS idx_trip_seats_lock_expires ON public.trip_seats(lock_expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON public.bookings(pnr);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id);

-- Enable RLS
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Catalog Policies (Public read)
CREATE POLICY "Public can view active operators" ON public.operators FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view cities" ON public.cities FOR SELECT USING (TRUE);
CREATE POLICY "Public can view buses" ON public.buses FOR SELECT USING (TRUE);
CREATE POLICY "Public can view bus seats" ON public.bus_seats FOR SELECT USING (TRUE);
CREATE POLICY "Public can view routes" ON public.routes FOR SELECT USING (TRUE);
CREATE POLICY "Public can view route stops" ON public.route_stops FOR SELECT USING (TRUE);
CREATE POLICY "Public can view trips" ON public.trips FOR SELECT USING (status != 'cancelled');
CREATE POLICY "Public can view trip seats" ON public.trip_seats FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (TRUE);

-- Private Data Policies
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can view own passengers" ON public.passengers FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can view own cancellations" ON public.cancellations FOR SELECT TO authenticated USING (
  cancelled_by_user_id = auth.uid() OR public.is_admin()
);
CREATE POLICY "Users can view own refunds" ON public.refunds FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (
  user_id = auth.uid()
);

-- ====================================================================
-- SECTION 3: STORED FUNCTIONS / RPCS (CONCURRENCY CONTROL)
-- ====================================================================

-- 1. LOCK TRIP SEATS
CREATE OR REPLACE FUNCTION public.lock_trip_seats(
  p_trip_id UUID,
  p_seat_ids UUID[],
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locked_count INT;
  v_requested_count INT;
  v_now TIMESTAMPTZ := NOW();
  v_expiry TIMESTAMPTZ := NOW() + INTERVAL '10 minutes';
BEGIN
  v_requested_count := array_length(p_seat_ids, 1);
  IF v_requested_count IS NULL OR v_requested_count = 0 THEN
    RAISE EXCEPTION 'No seats provided for locking.';
  END IF;

  UPDATE public.trip_seats
  SET
    status = 'locked',
    locked_at = v_now,
    lock_expires_at = v_expiry,
    locked_by_user_id = p_user_id,
    locked_by_session_id = p_session_id
  WHERE trip_id = p_trip_id
    AND id = ANY(p_seat_ids)
    AND (
      status = 'available'
      OR (status = 'locked' AND lock_expires_at < v_now)
      OR (status = 'locked' AND locked_by_session_id = p_session_id)
      OR (status = 'locked' AND locked_by_user_id = p_user_id AND p_user_id IS NOT NULL)
    );

  GET DIAGNOSTICS v_locked_count = ROW_COUNT;

  IF v_locked_count != v_requested_count THEN
    RAISE EXCEPTION 'One or more selected seats are no longer available. Please select another seat.';
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'locked_count', v_locked_count,
    'lock_expires_at', v_expiry
  );
END;
$$;

-- 2. CONFIRM BUS BOOKING
CREATE OR REPLACE FUNCTION public.confirm_bus_booking(
  p_trip_id UUID,
  p_seat_ids UUID[],
  p_user_id UUID,
  p_session_id TEXT,
  p_contact_name TEXT,
  p_contact_email TEXT,
  p_contact_phone TEXT,
  p_passengers JSONB,
  p_boarding_stop_id UUID,
  p_dropping_stop_id UUID,
  p_coupon_code TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'UPI'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_seat_count INT;
  v_base_fare NUMERIC(10,2) := 0.00;
  v_convenience_fee NUMERIC(10,2) := 30.00;
  v_gst NUMERIC(10,2) := 0.00;
  v_discount NUMERIC(10,2) := 0.00;
  v_total_fare NUMERIC(10,2) := 0.00;
  v_pnr TEXT;
  v_booking_id UUID;
  v_pas RECORD;
BEGIN
  v_seat_count := array_length(p_seat_ids, 1);
  IF v_seat_count IS NULL OR v_seat_count = 0 THEN
    RAISE EXCEPTION 'Booking failed: No seats specified.';
  END IF;

  PERFORM 1 FROM public.trip_seats
  WHERE trip_id = p_trip_id
    AND id = ANY(p_seat_ids)
    AND status = 'locked'
    AND lock_expires_at >= v_now
  FOR UPDATE;

  IF (SELECT COUNT(*) FROM public.trip_seats WHERE trip_id = p_trip_id AND id = ANY(p_seat_ids) AND status = 'locked' AND lock_expires_at >= v_now) != v_seat_count THEN
    RAISE EXCEPTION 'Seat lock expired or seat claimed by another passenger.';
  END IF;

  SELECT SUM(fare) INTO v_base_fare
  FROM public.trip_seats
  WHERE trip_id = p_trip_id AND id = ANY(p_seat_ids);

  IF p_coupon_code = 'BUSGOFIRST' THEN
    v_discount := LEAST(v_base_fare * 0.15, 250.00);
  ELSIF p_coupon_code = 'SUPERBUS' THEN
    v_discount := 150.00;
  ELSIF p_coupon_code = 'VOLVOLUXE' THEN
    v_discount := 100.00;
  END IF;

  v_gst := (v_base_fare - v_discount) * 0.05;
  v_total_fare := (v_base_fare - v_discount) + v_convenience_fee + v_gst;

  LOOP
    v_pnr := 'BG' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.bookings WHERE pnr = v_pnr);
  END LOOP;

  INSERT INTO public.bookings (
    pnr, user_id, trip_id, total_fare, convenience_fee, gst, discount_amount,
    coupon_code, status, payment_status, passenger_count, contact_name, contact_email,
    contact_phone, boarding_stop_id, dropping_stop_id, created_at, updated_at
  )
  VALUES (
    v_pnr, p_user_id, p_trip_id, v_total_fare, v_convenience_fee, v_gst, v_discount,
    p_coupon_code, 'confirmed', 'paid', v_seat_count, p_contact_name, p_contact_email,
    p_contact_phone, p_boarding_stop_id, p_dropping_stop_id, v_now, v_now
  )
  RETURNING id INTO v_booking_id;

  FOR v_pas IN SELECT * FROM jsonb_to_recordset(p_passengers) AS x(
    seat_id UUID, seat_number TEXT, full_name TEXT, age INT, gender TEXT
  )
  LOOP
    INSERT INTO public.passengers (booking_id, trip_seat_id, seat_number, full_name, age, gender)
    VALUES (v_booking_id, v_pas.seat_id, v_pas.seat_number, v_pas.full_name, v_pas.age, v_pas.gender);
  END LOOP;

  UPDATE public.trip_seats
  SET status = 'booked', locked_at = NULL, lock_expires_at = NULL
  WHERE trip_id = p_trip_id AND id = ANY(p_seat_ids);

  INSERT INTO public.payments (
    booking_id, pnr, amount, currency, payment_method, gateway_status, transaction_ref, created_at
  )
  VALUES (
    v_booking_id, v_pnr, v_total_fare, 'INR', p_payment_method, 'DEMO_SUCCESS',
    'TXN-' || v_pnr || '-' || FLOOR(RANDOM()*1000)::TEXT, v_now
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'booking_id', v_booking_id,
    'pnr', v_pnr,
    'total_fare', v_total_fare,
    'status', 'confirmed',
    'passenger_count', v_seat_count
  );
END;
$$;

-- 3. CANCEL BOOKING
CREATE OR REPLACE FUNCTION public.cancel_booking_rpc(
  p_booking_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT 'Passenger request'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking RECORD;
  v_trip RECORD;
  v_departure_ts TIMESTAMPTZ;
  v_hours_left NUMERIC;
  v_refund_rate NUMERIC;
  v_refund_amount NUMERIC(10,2);
  v_cancellation_fee NUMERIC(10,2);
  v_cancellation_id UUID;
BEGIN
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found.';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'This booking has already been cancelled.';
  END IF;

  SELECT * INTO v_trip FROM public.trips WHERE id = v_booking.trip_id;
  v_departure_ts := (v_trip.journey_date || ' ' || v_trip.departure_time)::TIMESTAMPTZ;
  v_hours_left := EXTRACT(EPOCH FROM (v_departure_ts - NOW())) / 3600.0;

  IF v_hours_left > 24 THEN
    v_refund_rate := 0.90;
  ELSIF v_hours_left >= 12 THEN
    v_refund_rate := 0.75;
  ELSIF v_hours_left >= 4 THEN
    v_refund_rate := 0.50;
  ELSE
    v_refund_rate := 0.00;
  END IF;

  v_refund_amount := ROUND((v_booking.total_fare - v_booking.convenience_fee) * v_refund_rate, 2);
  v_cancellation_fee := v_booking.total_fare - v_refund_amount;

  UPDATE public.bookings
  SET status = 'cancelled', payment_status = 'refunded', updated_at = NOW()
  WHERE id = p_booking_id;

  UPDATE public.trip_seats
  SET status = 'available', locked_at = NULL, lock_expires_at = NULL, locked_by_user_id = NULL, locked_by_session_id = NULL
  WHERE id IN (
    SELECT trip_seat_id FROM public.passengers WHERE booking_id = p_booking_id AND trip_seat_id IS NOT NULL
  );

  INSERT INTO public.cancellations (
    booking_id, pnr, cancelled_by_user_id, reason, original_amount, cancellation_fee, refund_eligible_amount, cancelled_at
  )
  VALUES (
    p_booking_id, v_booking.pnr, p_user_id, p_reason, v_booking.total_fare, v_cancellation_fee, v_refund_amount, NOW()
  )
  RETURNING id INTO v_cancellation_id;

  INSERT INTO public.refunds (
    cancellation_id, booking_id, pnr, refund_amount, refund_status, refund_mode, processed_at
  )
  VALUES (
    v_cancellation_id, p_booking_id, v_booking.pnr, v_refund_amount, 'DEMO_REFUNDED', 'ORIGINAL_SOURCE', NOW()
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'pnr', v_booking.pnr,
    'original_amount', v_booking.total_fare,
    'cancellation_fee', v_cancellation_fee,
    'refund_amount', v_refund_amount,
    'refund_status', 'DEMO_REFUNDED'
  );
END;
$$;

-- ====================================================================
-- SECTION 4: SEED DATA
-- ====================================================================

INSERT INTO public.cities (id, code, name, state) VALUES
  ('11111111-0001-0000-0000-000000000001', 'BLR', 'Bengaluru', 'Karnataka'),
  ('11111111-0002-0000-0000-000000000002', 'HYD', 'Hyderabad', 'Telangana'),
  ('11111111-0003-0000-0000-000000000003', 'CHE', 'Chennai', 'Tamil Nadu'),
  ('11111111-0004-0000-0000-000000000004', 'BOM', 'Mumbai', 'Maharashtra'),
  ('11111111-0005-0000-0000-000000000005', 'PNQ', 'Pune', 'Maharashtra'),
  ('11111111-0006-0000-0000-000000000006', 'GOA', 'Goa (Panaji)', 'Goa'),
  ('11111111-0007-0000-0000-000000000007', 'DEL', 'Delhi', 'Delhi NCR'),
  ('11111111-0008-0000-0000-000000000008', 'JAI', 'Jaipur', 'Rajasthan'),
  ('11111111-0009-0000-0000-000000000009', 'CBE', 'Coimbatore', 'Tamil Nadu'),
  ('11111111-0010-0000-0000-000000000010', 'VJA', 'Vijayawada', 'Andhra Pradesh'),
  ('11111111-0011-0000-0000-000000000011', 'MYS', 'Mysuru', 'Karnataka'),
  ('11111111-0012-0000-0000-000000000012', 'AMD', 'Ahmedabad', 'Gujarat')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.operators (id, name, contact_email, contact_phone, rating, reviews_count, headquarters, is_active) VALUES
  ('22222222-0001-0000-0000-000000000001', 'Sunrise Travels', 'ops@sunrisetravels.in', '+91 98450 12345', 4.8, 18420, 'Bengaluru, Karnataka', TRUE),
  ('22222222-0002-0000-0000-000000000002', 'GreenLine Express', 'fleet@greenline.in', '+91 98200 54321', 4.7, 14190, 'Hyderabad, Telangana', TRUE),
  ('22222222-0003-0000-0000-000000000003', 'Royal Roadways', 'bookings@royalroadways.com', '+91 98765 88990', 4.9, 22850, 'Mumbai, Maharashtra', TRUE),
  ('22222222-0004-0000-0000-000000000004', 'CityLink Travels', 'support@citylink.in', '+91 94432 11009', 4.6, 9340, 'Pune, Maharashtra', TRUE),
  ('22222222-0005-0000-0000-000000000005', 'Southern Star Travels', 'care@southernstar.in', '+91 99887 76655', 4.8, 16700, 'Chennai, Tamil Nadu', TRUE),
  ('22222222-0006-0000-0000-000000000006', 'Highway Express', 'service@highwayexpress.in', '+91 91234 56789', 4.5, 11200, 'Delhi NCR', TRUE),
  ('22222222-0007-0000-0000-000000000007', 'Orange Travels', 'help@orangetravels.in', '+91 99001 23456', 4.7, 19800, 'Hyderabad, Telangana', TRUE),
  ('22222222-0008-0000-0000-000000000008', 'SRS Travels', 'contact@srstravels.in', '+91 98800 11223', 4.6, 15400, 'Bengaluru, Karnataka', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.buses (id, operator_id, registration_number, name, bus_type, has_ac, has_wifi, total_seats, amenities) VALUES
  ('33333333-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001', 'KA-01-F-1024', 'Sunrise Volvo B11R AC Sleeper', 'AC Sleeper (2+1)', TRUE, TRUE, 30, ARRAY['Live Tracking', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light']),
  ('33333333-0002-0000-0000-000000000002', '22222222-0003-0000-0000-000000000003', 'MH-01-AX-9900', 'Royal Mercedes-Benz Super High Deck', 'AC Sleeper (2+1)', TRUE, TRUE, 30, ARRAY['Live Tracking', 'Snack Box', 'Thermal Blanket', 'CCTV Security', 'Charging Point']),
  ('33333333-0003-0000-0000-000000000003', '22222222-0002-0000-0000-000000000002', 'TS-09-UB-4412', 'GreenLine BharatBenz Multi-Axle AC', 'AC Seater (2+2)', TRUE, TRUE, 40, ARRAY['Air Suspension', 'Water Bottle', 'Charging Socket', 'First Aid Box'])
ON CONFLICT (registration_number) DO NOTHING;

DO $$
DECLARE
  v_bus_id UUID := '33333333-0001-0000-0000-000000000001';
  r INT;
BEGIN
  FOR r IN 1..5 LOOP
    INSERT INTO public.bus_seats (bus_id, seat_number, deck, row_num, col_num, seat_type, is_window)
    VALUES
      (v_bus_id, 'L' || ((r-1)*3 + 1), 'lower', r, 1, 'sleeper', TRUE),
      (v_bus_id, 'L' || ((r-1)*3 + 2), 'lower', r, 2, 'sleeper', FALSE),
      (v_bus_id, 'L' || ((r-1)*3 + 3), 'lower', r, 3, 'sleeper', TRUE),
      (v_bus_id, 'U' || ((r-1)*3 + 1), 'upper', r, 1, 'sleeper', TRUE),
      (v_bus_id, 'U' || ((r-1)*3 + 2), 'upper', r, 2, 'sleeper', FALSE),
      (v_bus_id, 'U' || ((r-1)*3 + 3), 'upper', r, 3, 'sleeper', TRUE)
    ON CONFLICT (bus_id, seat_number) DO NOTHING;
  END LOOP;
END $$;

INSERT INTO public.routes (id, origin_city_id, destination_city_id, distance_km, duration_minutes) VALUES
  ('44444444-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001', '11111111-0002-0000-0000-000000000002', 570, 555),
  ('44444444-0002-0000-0000-000000000002', '11111111-0001-0000-0000-000000000001', '11111111-0003-0000-0000-000000000003', 345, 390)
ON CONFLICT DO NOTHING;

INSERT INTO public.route_stops (route_id, city_id, stop_type, name, landmark, time_offset_minutes, display_order) VALUES
  ('44444444-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001', 'boarding', 'Majestic (KBS) Platform 4', 'Opposite Sangam Cinema', 0, 1),
  ('44444444-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001', 'boarding', 'Madiwala St. Johns Hospital', 'Near Water Tank', 30, 2),
  ('44444444-0001-0000-0000-000000000001', '11111111-0002-0000-0000-000000000002', 'dropping', 'MGBS Terminal 2', 'Central Bus Station', 520, 1),
  ('44444444-0001-0000-0000-000000000001', '11111111-0002-0000-0000-000000000002', 'dropping', 'Gachibowli Outer Ring Road', 'Near Bio-Diversity Park', 555, 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.trips (id, route_id, bus_id, operator_id, journey_date, departure_time, arrival_time, base_fare, status) VALUES
  ('66666666-0001-0000-0000-000000000001', '44444444-0001-0000-0000-000000000001', '33333333-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001', CURRENT_DATE + INTERVAL '1 day', '21:30:00', '06:45:00', 899.00, 'scheduled')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trip_seats (trip_id, bus_seat_id, seat_number, deck, seat_type, status, fare)
SELECT
  '66666666-0001-0000-0000-000000000001' AS trip_id,
  bs.id AS bus_seat_id,
  bs.seat_number,
  bs.deck,
  bs.seat_type,
  'available' AS status,
  899.00 AS fare
FROM public.bus_seats bs
WHERE bs.bus_id = '33333333-0001-0000-0000-000000000001'
ON CONFLICT (trip_id, bus_seat_id) DO NOTHING;

INSERT INTO public.coupons (id, code, discount_type, discount_value, min_booking_amount, max_discount, is_active) VALUES
  ('55555555-0001-0000-0000-000000000001', 'BUSGOFIRST', 'percentage', 15.00, 300.00, 250.00, TRUE),
  ('55555555-0002-0000-0000-000000000002', 'SUPERBUS', 'fixed', 150.00, 800.00, 150.00, TRUE),
  ('55555555-0003-0000-0000-000000000003', 'VOLVOLUXE', 'fixed', 100.00, 600.00, 100.00, TRUE)
ON CONFLICT (code) DO NOTHING;
