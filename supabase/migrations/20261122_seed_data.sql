-- ====================================================================
-- BusGo Master Seed Data: Cities, Operators, Buses, Routes, Trips & Seats
-- File: supabase/migrations/20261122_seed_data.sql
-- ====================================================================

-- 1. SEED CITIES (12 Indian Major Hubs)
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

-- 2. SEED OPERATORS (8 Verified Fictional Operators)
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

-- 3. SEED BUSES (Luxury Sleeper & Seater Fleet)
INSERT INTO public.buses (id, operator_id, registration_number, name, bus_type, has_ac, has_wifi, total_seats, amenities) VALUES
  ('33333333-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001', 'KA-01-F-1024', 'Sunrise Volvo B11R AC Sleeper', 'AC Sleeper (2+1)', TRUE, TRUE, 30, ARRAY['Live Tracking', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light']),
  ('33333333-0002-0000-0000-000000000002', '22222222-0003-0000-0000-000000000003', 'MH-01-AX-9900', 'Royal Mercedes-Benz Super High Deck', 'AC Sleeper (2+1)', TRUE, TRUE, 30, ARRAY['Live Tracking', 'Snack Box', 'Thermal Blanket', 'CCTV Security', 'Charging Point']),
  ('33333333-0003-0000-0000-000000000003', '22222222-0002-0000-0000-000000000002', 'TS-09-UB-4412', 'GreenLine BharatBenz Multi-Axle AC', 'AC Seater (2+2)', TRUE, TRUE, 40, ARRAY['Air Suspension', 'Water Bottle', 'Charging Socket', 'First Aid Box']),
  ('33333333-0004-0000-0000-000000000004', '22222222-0004-0000-0000-000000000004', 'MH-12-Q-5566', 'CityLink Express Air-Suspension', 'Non-AC Seater (2+2)', FALSE, FALSE, 40, ARRAY['Luggage Storage', 'First Aid Box', 'Sanitized Interior']),
  ('33333333-0005-0000-0000-000000000005', '22222222-0005-0000-0000-000000000005', 'TN-01-V-8822', 'Southern Star Volvo Multi-Axle', 'AC Sleeper (2+1)', TRUE, TRUE, 30, ARRAY['Live Tracking', 'Water Bottle', 'Individual Screen', 'Blanket', 'Reading Light'])
ON CONFLICT (registration_number) DO NOTHING;

-- 4. SEED BUS SEATS TEMPLATE FOR BUS 1 (30 Seats: 15 Lower, 15 Upper Deck)
DO $$
DECLARE
  v_bus_id UUID := '33333333-0001-0000-0000-000000000001';
  r INT;
BEGIN
  -- Lower Deck (L1 to L15)
  FOR r IN 1..5 LOOP
    INSERT INTO public.bus_seats (bus_id, seat_number, deck, row_num, col_num, seat_type, is_window)
    VALUES
      (v_bus_id, 'L' || ((r-1)*3 + 1), 'lower', r, 1, 'sleeper', TRUE),
      (v_bus_id, 'L' || ((r-1)*3 + 2), 'lower', r, 2, 'sleeper', FALSE),
      (v_bus_id, 'L' || ((r-1)*3 + 3), 'lower', r, 3, 'sleeper', TRUE)
    ON CONFLICT (bus_id, seat_number) DO NOTHING;

    -- Upper Deck (U1 to U15)
    INSERT INTO public.bus_seats (bus_id, seat_number, deck, row_num, col_num, seat_type, is_window)
    VALUES
      (v_bus_id, 'U' || ((r-1)*3 + 1), 'upper', r, 1, 'sleeper', TRUE),
      (v_bus_id, 'U' || ((r-1)*3 + 2), 'upper', r, 2, 'sleeper', FALSE),
      (v_bus_id, 'U' || ((r-1)*3 + 3), 'upper', r, 3, 'sleeper', TRUE)
    ON CONFLICT (bus_id, seat_number) DO NOTHING;
  END LOOP;
END $$;

-- 5. SEED ROUTES (Major Interstate Corridors)
INSERT INTO public.routes (id, origin_city_id, destination_city_id, distance_km, duration_minutes) VALUES
  ('44444444-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001', '11111111-0002-0000-0000-000000000002', 570, 555), -- BLR -> HYD
  ('44444444-0002-0000-0000-000000000002', '11111111-0001-0000-0000-000000000001', '11111111-0003-0000-0000-000000000003', 345, 390), -- BLR -> CHE
  ('44444444-0003-0000-0000-000000000003', '11111111-0004-0000-0000-000000000004', '11111111-0005-0000-0000-000000000005', 150, 210), -- BOM -> PNQ
  ('44444444-0004-0000-0000-000000000004', '11111111-0005-0000-0000-000000000005', '11111111-0006-0000-0000-000000000006', 450, 600), -- PNQ -> GOA
  ('44444444-0005-0000-0000-000000000005', '11111111-0007-0000-0000-000000000007', '11111111-0008-0000-0000-000000000008', 280, 315)  -- DEL -> JAI
ON CONFLICT DO NOTHING;

-- 6. SEED ROUTE STOPS (Boarding & Dropping Points)
INSERT INTO public.route_stops (route_id, city_id, stop_type, name, landmark, time_offset_minutes, display_order) VALUES
  -- Bengaluru -> Hyderabad (Boarding)
  ('44444444-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001', 'boarding', 'Majestic (KBS) Platform 4', 'Opposite Sangam Cinema', 0, 1),
  ('44444444-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001', 'boarding', 'Madiwala St. Johns Hospital', 'Near Water Tank', 30, 2),
  ('44444444-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001', 'boarding', 'Electronic City Toll Plaza', 'Near Elevated Highway Entry', 60, 3),
  -- Bengaluru -> Hyderabad (Dropping)
  ('44444444-0001-0000-0000-000000000001', '11111111-0002-0000-0000-000000000002', 'dropping', 'MGBS Terminal 2', 'Central Bus Station', 520, 1),
  ('44444444-0001-0000-0000-000000000001', '11111111-0002-0000-0000-000000000002', 'dropping', 'Ameerpet Metro Pillar 1042', 'Opposite Mythrivanam', 545, 2),
  ('44444444-0001-0000-0000-000000000001', '11111111-0002-0000-0000-000000000002', 'dropping', 'Gachibowli Outer Ring Road', 'Near Bio-Diversity Park', 555, 3)
ON CONFLICT DO NOTHING;

-- 7. SEED SCHEDULED TRIPS (Upcoming Dates)
INSERT INTO public.trips (id, route_id, bus_id, operator_id, journey_date, departure_time, arrival_time, base_fare, status) VALUES
  ('66666666-0001-0000-0000-000000000001', '44444444-0001-0000-0000-000000000001', '33333333-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001', CURRENT_DATE + INTERVAL '1 day', '21:30:00', '06:45:00', 899.00, 'scheduled'),
  ('66666666-0002-0000-0000-000000000002', '44444444-0001-0000-0000-000000000001', '33333333-0002-0000-0000-000000000002', '22222222-0003-0000-0000-000000000003', CURRENT_DATE + INTERVAL '1 day', '22:00:00', '07:30:00', 1150.00, 'scheduled'),
  ('66666666-0003-0000-0000-000000000003', '44444444-0001-0000-0000-000000000001', '33333333-0003-0000-0000-000000000002', '22222222-0002-0000-0000-000000000002', CURRENT_DATE + INTERVAL '1 day', '20:15:00', '05:45:00', 699.00, 'scheduled'),
  ('66666666-0004-0000-0000-000000000004', '44444444-0002-0000-0000-000000000002', '33333333-0005-0000-0000-000000000005', '22222222-0005-0000-0000-000000000005', CURRENT_DATE + INTERVAL '1 day', '23:00:00', '05:30:00', 450.00, 'scheduled'),
  ('66666666-0005-0000-0000-000000000005', '44444444-0003-0000-0000-000000000003', '33333333-0004-0000-0000-000000000004', '22222222-0004-0000-0000-000000000004', CURRENT_DATE + INTERVAL '1 day', '18:00:00', '21:30:00', 280.00, 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- 8. INITIALIZE TRIP SEATS FOR TRIP 1 (Copy from Bus Seats)
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

-- 9. SEED COUPONS
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_booking_amount, max_discount, is_active) VALUES
  ('55555555-0001-0000-0000-000000000001', 'BUSGOFIRST', 'percentage', 15.00, 300.00, 250.00, TRUE),
  ('55555555-0002-0000-0000-000000000002', 'SUPERBUS', 'fixed', 150.00, 800.00, 150.00, TRUE),
  ('55555555-0003-0000-0000-000000000003', 'VOLVOLUXE', 'fixed', 100.00, 600.00, 100.00, TRUE),
  ('55555555-0004-0000-0000-000000000004', 'RTCFESTIVE', 'percentage', 10.00, 400.00, 200.00, TRUE)
ON CONFLICT (code) DO NOTHING;
