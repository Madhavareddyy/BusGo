-- ====================================================================
-- BusGo Critical Concurrency Functions & RPC Transactions
-- File: supabase/migrations/20261122_rpcs_and_functions.sql
-- ====================================================================

-- 1. RPC: Atomic Seat Locking (Prevents Race Conditions & Double Selection)
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

  -- Atomic row lock using FOR UPDATE to prevent concurrency collisions
  -- A seat is lockable IF it is 'available' OR (status = 'locked' AND lock_expires_at < NOW())
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

  -- If not all seats could be locked, conflict occurred! Roll back.
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

-- 2. RPC: Atomic Booking Confirmation & Double-Booking Prevention Transaction
CREATE OR REPLACE FUNCTION public.confirm_bus_booking(
  p_trip_id UUID,
  p_seat_ids UUID[],
  p_user_id UUID,
  p_session_id TEXT,
  p_contact_name TEXT,
  p_contact_email TEXT,
  p_contact_phone TEXT,
  p_passengers JSONB, -- Array of {seat_id, seat_number, full_name, age, gender}
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
  v_trip_seat_id UUID;
  v_seat_fare NUMERIC(10,2);
BEGIN
  v_seat_count := array_length(p_seat_ids, 1);
  IF v_seat_count IS NULL OR v_seat_count = 0 THEN
    RAISE EXCEPTION 'Booking failed: No seats specified.';
  END IF;

  -- 1. VERIFY SEATS ARE CURRENTLY LOCKED BY THIS CALLER AND LOCK HAS NOT EXPIRED
  -- Lock rows FOR UPDATE
  PERFORM 1 FROM public.trip_seats
  WHERE trip_id = p_trip_id
    AND id = ANY(p_seat_ids)
    AND status = 'locked'
    AND lock_expires_at >= v_now
    AND (
      (p_user_id IS NOT NULL AND locked_by_user_id = p_user_id)
      OR (p_session_id IS NOT NULL AND locked_by_session_id = p_session_id)
    )
  FOR UPDATE;

  IF (SELECT COUNT(*) FROM public.trip_seats WHERE trip_id = p_trip_id AND id = ANY(p_seat_ids) AND status = 'locked' AND lock_expires_at >= v_now) != v_seat_count THEN
    RAISE EXCEPTION 'Seat lock expired or seat claimed by another passenger. Please select your seats again.';
  END IF;

  -- 2. CALCULATE BASE FARES
  SELECT SUM(fare) INTO v_base_fare
  FROM public.trip_seats
  WHERE trip_id = p_trip_id AND id = ANY(p_seat_ids);

  -- 3. CHECK COUPON (Simulated)
  IF p_coupon_code = 'BUSGOFIRST' THEN
    v_discount := LEAST(v_base_fare * 0.15, 250.00);
  ELSIF p_coupon_code = 'SUPERBUS' THEN
    v_discount := 150.00;
  ELSIF p_coupon_code = 'VOLVOLUXE' THEN
    v_discount := 100.00;
  END IF;

  v_gst := (v_base_fare - v_discount) * 0.05;
  v_total_fare := (v_base_fare - v_discount) + v_convenience_fee + v_gst;

  -- 4. GENERATE COLLISION-FREE PNR (e.g. BG782914)
  LOOP
    v_pnr := 'BG' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.bookings WHERE pnr = v_pnr);
  END LOOP;

  -- 5. INSERT BOOKING RECORD
  INSERT INTO public.bookings (
    pnr,
    user_id,
    trip_id,
    total_fare,
    convenience_fee,
    gst,
    discount_amount,
    coupon_code,
    status,
    payment_status,
    passenger_count,
    contact_name,
    contact_email,
    contact_phone,
    boarding_stop_id,
    dropping_stop_id,
    created_at,
    updated_at
  )
  VALUES (
    v_pnr,
    p_user_id,
    p_trip_id,
    v_total_fare,
    v_convenience_fee,
    v_gst,
    v_discount,
    p_coupon_code,
    'confirmed',
    'paid',
    v_seat_count,
    p_contact_name,
    p_contact_email,
    p_contact_phone,
    p_boarding_stop_id,
    p_dropping_stop_id,
    v_now,
    v_now
  )
  RETURNING id INTO v_booking_id;

  -- 6. INSERT PASSENGER MANIFEST
  FOR v_pas IN SELECT * FROM jsonb_to_recordset(p_passengers) AS x(
    seat_id UUID,
    seat_number TEXT,
    full_name TEXT,
    age INT,
    gender TEXT
  )
  LOOP
    INSERT INTO public.passengers (
      booking_id,
      trip_seat_id,
      seat_number,
      full_name,
      age,
      gender
    )
    VALUES (
      v_booking_id,
      v_pas.seat_id,
      v_pas.seat_number,
      v_pas.full_name,
      v_pas.age,
      v_pas.gender
    );
  END LOOP;

  -- 7. ATOMICALLY UPDATE SEATS TO 'booked'
  UPDATE public.trip_seats
  SET
    status = 'booked',
    locked_at = NULL,
    lock_expires_at = NULL
  WHERE trip_id = p_trip_id AND id = ANY(p_seat_ids);

  -- 8. INSERT PAYMENT RECORD (DEMO_SUCCESS)
  INSERT INTO public.payments (
    booking_id,
    pnr,
    amount,
    currency,
    payment_method,
    gateway_status,
    transaction_ref,
    created_at
  )
  VALUES (
    v_booking_id,
    v_pnr,
    v_total_fare,
    'INR',
    p_payment_method,
    'DEMO_SUCCESS',
    'TXN-' || v_pnr || '-' || FLOOR(RANDOM()*1000)::TEXT,
    v_now
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

-- 3. RPC: Dynamic Tiered Cancellation & Instant Seat Release
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
  -- Fetch booking
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found.';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'This booking has already been cancelled.';
  END IF;

  -- Fetch trip departure time
  SELECT * INTO v_trip FROM public.trips WHERE id = v_booking.trip_id;
  v_departure_ts := (v_trip.journey_date || ' ' || v_trip.departure_time)::TIMESTAMPTZ;

  -- Calculate hours remaining until departure
  v_hours_left := EXTRACT(EPOCH FROM (v_departure_ts - NOW())) / 3600.0;

  -- Determine refund tier
  IF v_hours_left > 24 THEN
    v_refund_rate := 0.90; -- 90% refund
  ELSIF v_hours_left >= 12 THEN
    v_refund_rate := 0.75; -- 75% refund
  ELSIF v_hours_left >= 4 THEN
    v_refund_rate := 0.50; -- 50% refund
  ELSE
    v_refund_rate := 0.00; -- 0% refund
  END IF;

  v_refund_amount := ROUND((v_booking.total_fare - v_booking.convenience_fee) * v_refund_rate, 2);
  v_cancellation_fee := v_booking.total_fare - v_refund_amount;

  -- Update booking
  UPDATE public.bookings
  SET
    status = 'cancelled',
    payment_status = 'refunded',
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- RELEASE SEATS BACK TO 'available'
  UPDATE public.trip_seats
  SET
    status = 'available',
    locked_at = NULL,
    lock_expires_at = NULL,
    locked_by_user_id = NULL,
    locked_by_session_id = NULL
  WHERE id IN (
    SELECT trip_seat_id FROM public.passengers WHERE booking_id = p_booking_id AND trip_seat_id IS NOT NULL
  );

  -- Log Cancellation
  INSERT INTO public.cancellations (
    booking_id,
    pnr,
    cancelled_by_user_id,
    reason,
    original_amount,
    cancellation_fee,
    refund_eligible_amount,
    cancelled_at
  )
  VALUES (
    p_booking_id,
    v_booking.pnr,
    p_user_id,
    p_reason,
    v_booking.total_fare,
    v_cancellation_fee,
    v_refund_amount,
    NOW()
  )
  RETURNING id INTO v_cancellation_id;

  -- Log Refund (DEMO_REFUNDED)
  INSERT INTO public.refunds (
    cancellation_id,
    booking_id,
    pnr,
    refund_amount,
    refund_status,
    refund_mode,
    processed_at
  )
  VALUES (
    v_cancellation_id,
    p_booking_id,
    v_booking.pnr,
    v_refund_amount,
    'DEMO_REFUNDED',
    'ORIGINAL_SOURCE',
    NOW()
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
