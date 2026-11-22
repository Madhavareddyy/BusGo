-- ====================================================================
-- BusGo Master Database Schema: All 17 Relational Tables & RLS Policies
-- File: supabase/migrations/20261122_complete_schema.sql
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
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

-- 2. OPERATORS (Bus Companies / Fleets)
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

-- 3. CITIES (Indian Departure & Arrival Hubs)
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BUSES (Operator Fleet Vehicles)
CREATE TABLE IF NOT EXISTS public.buses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bus_type TEXT NOT NULL, -- 'AC Sleeper (2+1)', 'AC Seater (2+2)', 'Non-AC Sleeper', 'Volvo Multi-Axle'
  has_ac BOOLEAN DEFAULT TRUE,
  has_wifi BOOLEAN DEFAULT FALSE,
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BUS_SEATS (Physical Seat Matrix per Bus)
CREATE TABLE IF NOT EXISTS public.bus_seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL, -- e.g. 'L1', 'L2', 'U1', 'U2'
  deck TEXT NOT NULL DEFAULT 'lower' CHECK (deck IN ('lower', 'upper')),
  row_num INTEGER NOT NULL,
  col_num INTEGER NOT NULL,
  seat_type TEXT NOT NULL DEFAULT 'seater' CHECK (seat_type IN ('seater', 'sleeper')),
  is_window BOOLEAN DEFAULT FALSE,
  is_ladies BOOLEAN DEFAULT FALSE,
  UNIQUE(bus_id, seat_number)
);

-- 6. ROUTES (Interstate Bus Corridors)
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin_city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  destination_city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  distance_km INTEGER NOT NULL CHECK (distance_km > 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_different_cities CHECK (origin_city_id != destination_city_id)
);

-- 7. ROUTE_STOPS (Boarding & Dropping Points with Landmark & Offset)
CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  stop_type TEXT NOT NULL CHECK (stop_type IN ('boarding', 'dropping')),
  name TEXT NOT NULL, -- e.g. 'Majestic (KBS) Platform 4'
  landmark TEXT,
  time_offset_minutes INTEGER NOT NULL DEFAULT 0, -- offset from scheduled departure
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TRIPS (Scheduled Journeys on Specific Dates)
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

-- 9. TRIP_SEATS (Dynamic Seat Inventory per Scheduled Trip)
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

-- 10. BOOKINGS (Customer Reservations with Unique PNR)
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

-- 11. PASSENGERS (Passenger Manifest Details)
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

-- 12. PAYMENTS (Transaction Ledger - Simulated)
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

-- 13. CANCELLATIONS (Cancellation Audit Records)
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

-- 14. REFUNDS (Disbursement Ledger - Simulated)
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

-- 15. REVIEWS (Verified Passenger Ratings)
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

-- 16. COUPONS (Discounts & Promo Engine)
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

-- 17. NOTIFICATIONS (User Alert Feed)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'booking' CHECK (notification_type IN ('booking', 'trip', 'offer', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_trips_route_date ON public.trips(route_id, journey_date);
CREATE INDEX IF NOT EXISTS idx_trip_seats_trip_status ON public.trip_seats(trip_id, status);
CREATE INDEX IF NOT EXISTS idx_trip_seats_lock_expires ON public.trip_seats(lock_expires_at);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON public.bookings(pnr);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
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

-- Public Read-Only catalog tables (Everyone can browse buses, cities, routes, trips, seats, reviews, coupons)
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

-- Bookings & Private Data
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
