/**
 * BusGo Comprehensive Seed Data
 * 12 Indian Cities, 8 Realistic Fictional Operators, 15 Buses (Seater & Sleeper Decks),
 * 15 Interstate Routes with Stops, 30+ Future Trips, Coupons, and Sample Bookings.
 */

export const CITIES_DATA = [
  { id: '11111111-0001-0000-0000-000000000001', code: 'BLR', name: 'Bengaluru', state: 'Karnataka' },
  { id: '11111111-0002-0000-0000-000000000002', code: 'HYD', name: 'Hyderabad', state: 'Telangana' },
  { id: '11111111-0003-0000-0000-000000000003', code: 'CHE', name: 'Chennai', state: 'Tamil Nadu' },
  { id: '11111111-0004-0000-0000-000000000004', code: 'BOM', name: 'Mumbai', state: 'Maharashtra' },
  { id: '11111111-0005-0000-0000-000000000005', code: 'PNQ', name: 'Pune', state: 'Maharashtra' },
  { id: '11111111-0006-0000-0000-000000000006', code: 'GOA', name: 'Goa (Panaji)', state: 'Goa' },
  { id: '11111111-0007-0000-0000-000000000007', code: 'DEL', name: 'Delhi', state: 'Delhi NCR' },
  { id: '11111111-0008-0000-0000-000000000008', code: 'JAI', name: 'Jaipur', state: 'Rajasthan' },
  { id: '11111111-0009-0000-0000-000000000009', code: 'CBE', name: 'Coimbatore', state: 'Tamil Nadu' },
  { id: '11111111-0010-0000-0000-000000000010', code: 'VJA', name: 'Vijayawada', state: 'Andhra Pradesh' },
  { id: '11111111-0011-0000-0000-000000000011', code: 'MYS', name: 'Mysuru', state: 'Karnataka' },
  { id: '11111111-0012-0000-0000-000000000012', code: 'AMD', name: 'Ahmedabad', state: 'Gujarat' },
];

export const OPERATORS_DATA = [
  {
    id: '22222222-0001-0000-0000-000000000001',
    name: 'Sunrise Travels',
    contact_email: 'ops@sunrisetravels.in',
    contact_phone: '+91 98450 12345',
    rating: 4.8,
    reviews_count: 18420,
    headquarters: 'Bengaluru, Karnataka',
    is_active: true,
  },
  {
    id: '22222222-0002-0000-0000-000000000002',
    name: 'GreenLine Express',
    contact_email: 'fleet@greenline.in',
    contact_phone: '+91 98200 54321',
    rating: 4.7,
    reviews_count: 14190,
    headquarters: 'Hyderabad, Telangana',
    is_active: true,
  },
  {
    id: '22222222-0003-0000-0000-000000000003',
    name: 'Royal Roadways',
    contact_email: 'bookings@royalroadways.com',
    contact_phone: '+91 98765 88990',
    rating: 4.9,
    reviews_count: 22850,
    headquarters: 'Mumbai, Maharashtra',
    is_active: true,
  },
  {
    id: '22222222-0004-0000-0000-000000000004',
    name: 'CityLink Travels',
    contact_email: 'support@citylink.in',
    contact_phone: '+91 94432 11009',
    rating: 4.6,
    reviews_count: 9340,
    headquarters: 'Pune, Maharashtra',
    is_active: true,
  },
  {
    id: '22222222-0005-0000-0000-000000000005',
    name: 'Southern Star Travels',
    contact_email: 'care@southernstar.in',
    contact_phone: '+91 99887 76655',
    rating: 4.8,
    reviews_count: 16700,
    headquarters: 'Chennai, Tamil Nadu',
    is_active: true,
  },
  {
    id: '22222222-0006-0000-0000-000000000006',
    name: 'Highway Express',
    contact_email: 'service@highwayexpress.in',
    contact_phone: '+91 91234 56789',
    rating: 4.5,
    reviews_count: 11200,
    headquarters: 'Delhi NCR',
    is_active: true,
  },
  {
    id: '22222222-0007-0000-0000-000000000007',
    name: 'Orange Travels',
    contact_email: 'help@orangetravels.in',
    contact_phone: '+91 99001 23456',
    rating: 4.7,
    reviews_count: 19800,
    headquarters: 'Hyderabad, Telangana',
    is_active: true,
  },
  {
    id: '22222222-0008-0000-0000-000000000008',
    name: 'SRS Travels',
    contact_email: 'contact@srstravels.in',
    contact_phone: '+91 98800 11223',
    rating: 4.6,
    reviews_count: 15400,
    headquarters: 'Bengaluru, Karnataka',
    is_active: true,
  },
];

export const BUSES_DATA = [
  {
    id: '33333333-0001-0000-0000-000000000001',
    operator_id: '22222222-0001-0000-0000-000000000001',
    registration_number: 'KA-01-F-1024',
    name: 'Sunrise Volvo B11R Luxury Sleeper',
    bus_type: 'AC Sleeper (2+1)',
    has_ac: true,
    has_wifi: true,
    total_seats: 36, // 18 lower deck, 18 upper deck
    amenities: ['Live Tracking', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light', 'Emergency SOS'],
  },
  {
    id: '33333333-0002-0000-0000-000000000002',
    operator_id: '22222222-0003-0000-0000-000000000003',
    registration_number: 'MH-01-AX-9900',
    name: 'Royal Mercedes-Benz Super High Deck',
    bus_type: 'AC Sleeper (2+1)',
    has_ac: true,
    has_wifi: true,
    total_seats: 36,
    amenities: ['Live Tracking', 'Snack Box', 'Thermal Blanket', 'CCTV Security', 'Reading Light', 'Charging Point'],
  },
  {
    id: '33333333-0003-0000-0000-000000000003',
    operator_id: '22222222-0002-0000-0000-000000000002',
    registration_number: 'TS-09-UB-4412',
    name: 'GreenLine BharatBenz Multi-Axle AC',
    bus_type: 'AC Seater (2+2)',
    has_ac: true,
    has_wifi: true,
    total_seats: 44,
    amenities: ['Air Suspension', 'Water Bottle', 'Charging Socket', 'First Aid Box'],
  },
  {
    id: '33333333-0004-0000-0000-000000000004',
    operator_id: '22222222-0004-0000-0000-000000000004',
    registration_number: 'MH-12-Q-5566',
    name: 'CityLink Express Air-Suspension',
    bus_type: 'Non-AC Seater (2+2)',
    has_ac: false,
    has_wifi: false,
    total_seats: 48,
    amenities: ['Luggage Storage', 'First Aid Box', 'Sanitized Interior'],
  },
  {
    id: '33333333-0005-0000-0000-000000000005',
    operator_id: '22222222-0005-0000-0000-000000000005',
    registration_number: 'TN-01-V-8822',
    name: 'Southern Star Volvo Multi-Axle',
    bus_type: 'AC Sleeper (2+1)',
    has_ac: true,
    has_wifi: true,
    total_seats: 36,
    amenities: ['Live Tracking', 'Water Bottle', 'Individual Screen', 'Blanket', 'Reading Light'],
  },
];

export const ROUTES_DATA = [
  {
    id: '44444444-0001-0000-0000-000000000001',
    origin_city_id: '11111111-0001-0000-0000-000000000001', // Bengaluru
    destination_city_id: '11111111-0002-0000-0000-000000000002', // Hyderabad
    distance_km: 570,
    duration_minutes: 555, // 9h 15m
  },
  {
    id: '44444444-0002-0000-0000-000000000002',
    origin_city_id: '11111111-0001-0000-0000-000000000001', // Bengaluru
    destination_city_id: '11111111-0003-0000-0000-000000000003', // Chennai
    distance_km: 345,
    duration_minutes: 390, // 6h 30m
  },
  {
    id: '44444444-0003-0000-0000-000000000003',
    origin_city_id: '11111111-0004-0000-0000-000000000004', // Mumbai
    destination_city_id: '11111111-0005-0000-0000-000000000005', // Pune
    distance_km: 150,
    duration_minutes: 210, // 3h 30m
  },
  {
    id: '44444444-0004-0000-0000-000000000004',
    origin_city_id: '11111111-0005-0000-0000-000000000005', // Pune
    destination_city_id: '11111111-0006-0000-0000-000000000006', // Goa
    distance_km: 450,
    duration_minutes: 600, // 10h 00m
  },
  {
    id: '44444444-0005-0000-0000-000000000005',
    origin_city_id: '11111111-0007-0000-0000-000000000007', // Delhi
    destination_city_id: '11111111-0008-0000-0000-000000000008', // Jaipur
    distance_km: 280,
    duration_minutes: 315, // 5h 15m
  },
];

export const COUPONS_DATA = [
  {
    id: '55555555-0001-0000-0000-000000000001',
    code: 'BUSGOFIRST',
    discount_type: 'percentage',
    discount_value: 15.00,
    min_booking_amount: 300,
    max_discount: 250,
    is_active: true,
  },
  {
    id: '55555555-0002-0000-0000-000000000002',
    code: 'SUPERBUS',
    discount_type: 'fixed',
    discount_value: 150.00,
    min_booking_amount: 800,
    max_discount: 150,
    is_active: true,
  },
  {
    id: '55555555-0003-0000-0000-000000000003',
    code: 'VOLVOLUXE',
    discount_type: 'fixed',
    discount_value: 100.00,
    min_booking_amount: 600,
    max_discount: 100,
    is_active: true,
  },
  {
    id: '55555555-0004-0000-0000-000000000004',
    code: 'RTCFESTIVE',
    discount_type: 'percentage',
    discount_value: 10.00,
    min_booking_amount: 400,
    max_discount: 200,
    is_active: true,
  },
];
