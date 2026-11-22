import { supabase, isSupabaseConfigured } from './supabase';
import { 
  CITIES_DATA, 
  OPERATORS_DATA, 
  BUSES_DATA, 
  ROUTES_DATA, 
  COUPONS_DATA 
} from '../data/seedData';

/**
 * BusGo Unified Database Service
 * Provides seamless dual-engine capability:
 * 1. Live Supabase PostgreSQL + RPC calls when configured and seeded.
 * 2. In-memory / localStorage transactional database when offline or in demo mode.
 */

// Simulated In-Memory Trip & Seat Store for Offline/Demo Mode
let localTrips = [
  {
    id: '66666666-0001-0000-0000-000000000001',
    from: 'Bengaluru',
    to: 'Hyderabad',
    journey_date: '2026-11-23',
    departure_time: '21:30',
    arrival_time: '06:45',
    duration: '9h 15m',
    base_fare: 899.00,
    operator: 'Sunrise Travels',
    operator_rating: 4.8,
    bus_name: 'Sunrise Volvo B11R AC Sleeper',
    bus_type: 'AC Sleeper (2+1)',
    has_ac: true,
    has_wifi: true,
    boarding_stops: [
      { id: 'stop-1', name: 'Majestic (KBS) Platform 4', landmark: 'Opposite Sangam Cinema', time: '21:30' },
      { id: 'stop-2', name: 'Madiwala St. Johns Hospital', landmark: 'Near Water Tank', time: '22:00' },
      { id: 'stop-3', name: 'Electronic City Toll Plaza', landmark: 'Near Elevated Highway', time: '22:30' },
    ],
    dropping_stops: [
      { id: 'stop-4', name: 'MGBS Terminal 2', landmark: 'Central Bus Station', time: '06:15' },
      { id: 'stop-5', name: 'Ameerpet Metro Pillar 1042', landmark: 'Opposite Mythrivanam', time: '06:35' },
      { id: 'stop-6', name: 'Gachibowli Outer Ring Road', landmark: 'Near Bio-Diversity Park', time: '06:45' },
    ],
  },
  {
    id: '66666666-0002-0000-0000-000000000002',
    from: 'Bengaluru',
    to: 'Hyderabad',
    journey_date: '2026-11-23',
    departure_time: '22:00',
    arrival_time: '07:30',
    duration: '9h 30m',
    base_fare: 1150.00,
    operator: 'Royal Roadways',
    operator_rating: 4.9,
    bus_name: 'Royal Mercedes-Benz Super High Deck',
    bus_type: 'AC Sleeper (2+1)',
    has_ac: true,
    has_wifi: true,
    boarding_stops: [
      { id: 'stop-21', name: 'Madiwala St. Johns Signal', landmark: 'Opp Total Mall', time: '22:00' },
      { id: 'stop-22', name: 'Hebbal Flyover', landmark: 'Near Esteem Mall', time: '22:45' },
    ],
    dropping_stops: [
      { id: 'stop-23', name: 'Shamshabad Airport Toll', landmark: 'PVNR Expressway', time: '06:45' },
      { id: 'stop-24', name: 'Gachibowli ORR Junction', landmark: 'Near DLF Cybercity', time: '07:30' },
    ],
  },
  {
    id: '66666666-0003-0000-0000-000000000003',
    from: 'Bengaluru',
    to: 'Hyderabad',
    journey_date: '2026-11-23',
    departure_time: '20:15',
    arrival_time: '05:45',
    duration: '9h 30m',
    base_fare: 699.00,
    operator: 'GreenLine Express',
    operator_rating: 4.7,
    bus_name: 'GreenLine BharatBenz Multi-Axle AC',
    bus_type: 'AC Seater (2+2)',
    has_ac: true,
    has_wifi: true,
    boarding_stops: [
      { id: 'stop-31', name: 'Electronic City Toll Plaza', landmark: 'Elevated Entry', time: '20:15' },
      { id: 'stop-32', name: 'Majestic KBS', landmark: 'Platform 5', time: '21:00' },
    ],
    dropping_stops: [
      { id: 'stop-33', name: 'Ameerpet Metro Station', landmark: 'Beside Pillar 1045', time: '05:45' },
    ],
  },
];

// Helper to generate 30 seats layout for sleeper
const generateLocalSeats = (fare = 899) => {
  const seats = [];
  // 15 Lower Deck
  for (let r = 1; r <= 5; r++) {
    seats.push(
      { id: `s-L${(r-1)*3 + 1}`, seat_number: `L${(r-1)*3 + 1}`, deck: 'lower', row: r, col: 1, type: 'sleeper', is_window: true, status: r === 2 ? 'booked' : 'available', fare },
      { id: `s-L${(r-1)*3 + 2}`, seat_number: `L${(r-1)*3 + 2}`, deck: 'lower', row: r, col: 2, type: 'sleeper', is_window: false, status: 'available', fare },
      { id: `s-L${(r-1)*3 + 3}`, seat_number: `L${(r-1)*3 + 3}`, deck: 'lower', row: r, col: 3, type: 'sleeper', is_window: true, status: 'available', fare }
    );
  }
  // 15 Upper Deck
  for (let r = 1; r <= 5; r++) {
    seats.push(
      { id: `s-U${(r-1)*3 + 1}`, seat_number: `U${(r-1)*3 + 1}`, deck: 'upper', row: r, col: 1, type: 'sleeper', is_window: true, status: 'available', fare },
      { id: `s-U${(r-1)*3 + 2}`, seat_number: `U${(r-1)*3 + 2}`, deck: 'upper', row: r, col: 2, type: 'sleeper', is_window: false, status: r === 1 ? 'booked' : 'available', fare },
      { id: `s-U${(r-1)*3 + 3}`, seat_number: `U${(r-1)*3 + 3}`, deck: 'upper', row: r, col: 3, type: 'sleeper', is_window: true, status: 'available', fare }
    );
  }
  return seats;
};

let localSeatsStore = {
  '66666666-0001-0000-0000-000000000001': generateLocalSeats(899),
  '66666666-0002-0000-0000-000000000002': generateLocalSeats(1150),
  '66666666-0003-0000-0000-000000000003': generateLocalSeats(699),
};

export const dbService = {
  // 1. Get Cities List
  async getCities() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cities').select('*').order('name');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase cities query failed, using seed data:', e);
      }
    }
    return CITIES_DATA;
  },

  // 2. Get Operators List
  async getOperators() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('operators').select('*').order('name');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase operators query failed, using seed data:', e);
      }
    }
    return OPERATORS_DATA;
  },

  // 3. Search Trips by From, To & Date
  async searchTrips(fromCity, toCity, journeyDate) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select(`
            id,
            journey_date,
            departure_time,
            arrival_time,
            base_fare,
            status,
            routes!inner(
              id,
              distance_km,
              duration_minutes,
              origin_city:cities!routes_origin_city_id_fkey(name),
              destination_city:cities!routes_destination_city_id_fkey(name)
            ),
            buses!inner(
              id,
              name,
              bus_type,
              has_ac,
              has_wifi,
              total_seats,
              amenities
            ),
            operators!inner(
              id,
              name,
              rating,
              reviews_count
            )
          `)
          .eq('status', 'scheduled');

        if (!error && data && data.length > 0) {
          // Format rows
          return data.map((t) => ({
            id: t.id,
            from: t.routes.origin_city.name,
            to: t.routes.destination_city.name,
            journey_date: t.journey_date,
            departure_time: t.departure_time.substring(0, 5),
            arrival_time: t.arrival_time.substring(0, 5),
            duration: `${Math.floor(t.routes.duration_minutes / 60)}h ${t.routes.duration_minutes % 60}m`,
            base_fare: parseFloat(t.base_fare),
            operator: t.operators.name,
            operator_rating: parseFloat(t.operators.rating),
            bus_name: t.buses.name,
            bus_type: t.buses.bus_type,
            has_ac: t.buses.has_ac,
            has_wifi: t.buses.has_wifi,
          }));
        }
      } catch (e) {
        console.warn('Supabase searchTrips fallback to local data:', e);
      }
    }

    // Local in-memory filter
    return localTrips;
  },

  // 4. Get Seats for a Trip
  async getTripSeats(tripId) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('trip_seats')
          .select('*')
          .eq('trip_id', tripId)
          .order('seat_number');

        if (!error && data && data.length > 0) {
          const now = new Date();
          return data.map((s) => ({
            id: s.id,
            seat_number: s.seat_number,
            deck: s.deck,
            type: s.seat_type,
            // Check lock expiration
            status: s.status === 'locked' && s.lock_expires_at && new Date(s.lock_expires_at) < now ? 'available' : s.status,
            fare: parseFloat(s.fare),
          }));
        }
      } catch (e) {
        console.warn('Supabase getTripSeats fallback:', e);
      }
    }

    return localSeatsStore[tripId] || generateLocalSeats();
  },

  // 5. Atomic Seat Locking (Calls stored RPC)
  async lockSeats(tripId, seatIds, userId = null, sessionId = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('lock_trip_seats', {
          p_trip_id: tripId,
          p_seat_ids: seatIds,
          p_user_id: userId,
          p_session_id: sessionId || 'session-' + Date.now(),
        });

        if (error) throw new Error(error.message);
        return data;
      } catch (e) {
        if (!e.message.includes('function') && !e.message.includes('not found')) {
          throw e;
        }
      }
    }

    // Local simulation atomic lock
    const seats = localSeatsStore[tripId] || [];
    for (const id of seatIds) {
      const s = seats.find((seat) => seat.id === id);
      if (s && s.status === 'booked') {
        throw new Error(`Seat ${s.seat_number} is already booked.`);
      }
      if (s) s.status = 'locked';
    }
    return { success: true, locked_count: seatIds.length, lock_expires_at: new Date(Date.now() + 600000) };
  },

  // 6. Confirm Booking (Calls stored RPC)
  async confirmBooking(params) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('confirm_bus_booking', {
          p_trip_id: params.tripId,
          p_seat_ids: params.seatIds,
          p_user_id: params.userId || null,
          p_session_id: params.sessionId || 'session-' + Date.now(),
          p_contact_name: params.contactName,
          p_contact_email: params.contactEmail,
          p_contact_phone: params.contactPhone,
          p_passengers: params.passengers,
          p_boarding_stop_id: params.boardingStopId || null,
          p_dropping_stop_id: params.droppingStopId || null,
          p_coupon_code: params.couponCode || null,
          p_payment_method: params.paymentMethod || 'UPI',
        });

        if (error) throw new Error(error.message);
        return data;
      } catch (e) {
        if (!e.message.includes('function') && !e.message.includes('not found')) {
          throw e;
        }
      }
    }

    // Local simulation booking
    const pnr = 'BG' + Math.floor(100000 + Math.random() * 900000);
    const bookingId = 'booking-' + Date.now();

    // Mark seats as booked
    const seats = localSeatsStore[params.tripId] || [];
    for (const id of params.seatIds) {
      const s = seats.find((seat) => seat.id === id);
      if (s) s.status = 'booked';
    }

    return {
      success: true,
      booking_id: bookingId,
      pnr,
      total_fare: params.totalFare || 899,
      status: 'confirmed',
      passenger_count: params.passengers.length,
    };
  },

  // 7. Cancel Booking & Refund
  async cancelBooking(bookingId, userId, reason = 'Passenger request') {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('cancel_booking_rpc', {
          p_booking_id: bookingId,
          p_user_id: userId,
          p_reason: reason,
        });

        if (error) throw new Error(error.message);
        return data;
      } catch (e) {
        if (!e.message.includes('function') && !e.message.includes('not found')) {
          throw e;
        }
      }
    }

    // Local simulation refund (Tiered)
    return {
      success: true,
      original_amount: 1780,
      cancellation_fee: 178,
      refund_amount: 1602,
      refund_status: 'DEMO_REFUNDED',
    };
  },
};

export default dbService;
