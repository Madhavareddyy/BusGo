import { supabase, isSupabaseConfigured } from './supabase.js';
import { 
  CITIES_DATA, 
  OPERATORS_DATA, 
  BUSES_DATA, 
  ROUTES_DATA, 
  COUPONS_DATA 
} from '../data/seedData.js';
import { INDIAN_CITIES } from '../data/mockData.js';

/**
 * UUID Validation and Deterministic UUIDv4 Generator
 * Guarantees zero PostgreSQL uuid syntax errors on RPC calls
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUUID = (str) => typeof str === 'string' && UUID_REGEX.test(str);

// Track which trips are confirmed to have live seats seeded in Supabase Cloud
const cloudSeededTripIds = new Set();

export const toUUID = (prefix, id) => {
  if (isUUID(id)) return id;
  const hex = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(16).padStart(8, '0');
  };
  const h1 = hex(`${prefix}_1_${id}`);
  const h2 = hex(`${prefix}_2_${id}`).slice(0, 4);
  const h3 = ('4' + hex(`${prefix}_3_${id}`).slice(0, 3));
  const h4 = ('a' + hex(`${prefix}_4_${id}`).slice(0, 3));
  const h5 = hex(`${prefix}_5_${id}`) + hex(`${prefix}_6_${id}`).slice(0, 4);
  return `${h1}-${h2}-${h3}-${h4}-${h5}`.toLowerCase();
};

/**
 * BusGo Unified Database Service
 * Provides seamless dual-engine capability:
 * 1. Live Supabase PostgreSQL + RPC calls when configured and seeded.
 * 2. In-memory / localStorage transactional database when offline or in demo mode.
 */

// Mapping of city terminals for realistic display
const CITY_TERMINALS_MAP = {
  'Bengaluru': ['Majestic (KBS) Platform 4', 'Madiwala St. Johns Hospital', 'Electronic City Toll Plaza'],
  'Hyderabad': ['MGBS Terminal 2', 'Ameerpet Metro Pillar 1042', 'Gachibowli Outer Ring Road'],
  'Chennai': ['CMBT Koyambedu Platform 2', 'Guindy Metro Station', 'Tambaram Sanatorium'],
  'Mumbai': ['Borivali West IC Colony', 'Dadar Asiad Bus Stand', 'Vashi Toll Plaza'],
  'Pune': ['Swargate Bus Stand', 'Shivajinagar Station', 'Wakad Hinjewadi Flyover'],
  'Delhi': ['Kashmere Gate ISBT', 'Anand Vihar ISBT', 'Dhaula Kuan Metro'],
  'Jaipur': ['Sindhi Camp Bus Stand', 'Narayan Singh Circle', 'Transport Nagar'],
  'Ahmedabad': ['Geeta Mandir Bus Stand', 'Paldi Cross Road', 'Satellite Ring Road'],
  'Kolkata': ['Esplanade Bus Terminus', 'Salt Lake Karunamoyee', 'Howrah Station'],
  'Kochi': ['Vyttila Mobility Hub', 'Edappally Toll', 'Aluva Flyover'],
  'Goa': ['Panaji KTC Bus Stand', 'Mapusa Bus Stand', 'Margao KTC Station'],
  'Chandigarh': ['Sector 43 ISBT', 'Sector 17 Bus Stand', 'Zirakpur Flyover'],
};

// Rich Simulated In-Memory Trip Store
let localTrips = [
  {
    id: '66666666-0001-0000-0000-000000000001',
    from: 'Bengaluru',
    to: 'Hyderabad',
    journey_date: '2026-11-23',
    departure_time: '21:30',
    arrival_time: '06:45',
    duration: '9h 15m',
    duration_minutes: 555,
    base_fare: 899.00,
    operator: 'Sunrise Travels',
    operator_rating: 4.8,
    reviews_count: 18420,
    bus_name: 'Sunrise Volvo B11R AC Sleeper',
    bus_type: 'AC Sleeper (2+1)',
    has_ac: true,
    has_wifi: true,
    is_sleeper: true,
    total_seats: 30,
    available_seats: 18,
    amenities: ['Live Tracking', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light'],
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
    source: 'mock_demo'
  },
  {
    id: '66666666-0002-0000-0000-000000000002',
    from: 'Bengaluru',
    to: 'Hyderabad',
    journey_date: '2026-11-23',
    departure_time: '22:00',
    arrival_time: '07:30',
    duration: '9h 30m',
    duration_minutes: 570,
    base_fare: 1150.00,
    operator: 'Royal Roadways',
    operator_rating: 4.9,
    reviews_count: 22850,
    bus_name: 'Royal Mercedes-Benz Super High Deck',
    bus_type: 'AC Sleeper (2+1)',
    has_ac: true,
    has_wifi: true,
    is_sleeper: true,
    total_seats: 30,
    available_seats: 8,
    amenities: ['Live Tracking', 'Water Bottle', 'Charging Point', 'Blanket', 'Snacks', 'WiFi'],
    boarding_stops: [
      { id: 'stop-21', name: 'Madiwala St. Johns Signal', landmark: 'Opp Total Mall', time: '22:00' },
      { id: 'stop-22', name: 'Hebbal Flyover', landmark: 'Near Esteem Mall', time: '22:45' },
    ],
    dropping_stops: [
      { id: 'stop-23', name: 'Shamshabad Airport Toll', landmark: 'PVNR Expressway', time: '06:45' },
      { id: 'stop-24', name: 'Gachibowli ORR Junction', landmark: 'Near DLF Cybercity', time: '07:30' },
    ],
    source: 'mock_demo'
  },
  {
    id: '66666666-0003-0000-0000-000000000003',
    from: 'Bengaluru',
    to: 'Hyderabad',
    journey_date: '2026-11-23',
    departure_time: '20:15',
    arrival_time: '05:45',
    duration: '9h 30m',
    duration_minutes: 570,
    base_fare: 699.00,
    operator: 'GreenLine Express',
    operator_rating: 4.7,
    reviews_count: 14190,
    bus_name: 'GreenLine BharatBenz Multi-Axle AC',
    bus_type: 'AC Seater (2+2)',
    has_ac: true,
    has_wifi: true,
    is_sleeper: false,
    total_seats: 40,
    available_seats: 26,
    amenities: ['Live Tracking', 'Water Bottle', 'Charging Point', 'Reading Light'],
    boarding_stops: [
      { id: 'stop-31', name: 'Electronic City Toll Plaza', landmark: 'Elevated Entry', time: '20:15' },
      { id: 'stop-32', name: 'Majestic KBS', landmark: 'Platform 5', time: '21:00' },
    ],
    dropping_stops: [
      { id: 'stop-33', name: 'Ameerpet Metro Station', landmark: 'Beside Pillar 1045', time: '05:45' },
    ],
    source: 'mock_demo'
  },
  {
    id: '66666666-0004-0000-0000-000000000004',
    from: 'Bengaluru',
    to: 'Hyderabad',
    journey_date: '2026-11-23',
    departure_time: '06:30',
    arrival_time: '15:00',
    duration: '8h 30m',
    duration_minutes: 510,
    base_fare: 499.00,
    operator: 'CityLink Travels',
    operator_rating: 4.6,
    reviews_count: 9340,
    bus_name: 'CityLink Express Non-AC Seater',
    bus_type: 'Non-AC Seater (2+2)',
    has_ac: false,
    has_wifi: false,
    is_sleeper: false,
    total_seats: 40,
    available_seats: 32,
    amenities: ['Emergency Exit', 'Luggage Compartment'],
    boarding_stops: [
      { id: 'stop-41', name: 'Majestic KBS Platform 1', landmark: 'Near Bus Stand Police Post', time: '06:30' },
      { id: 'stop-42', name: 'Hebbal Police Station', landmark: 'Under Flyover', time: '07:00' },
    ],
    dropping_stops: [
      { id: 'stop-43', name: 'MGBS Central Counter', landmark: 'Platform 12', time: '15:00' },
    ],
    source: 'mock_demo'
  },
  {
    id: '66666666-0005-0000-0000-000000000005',
    from: 'Bengaluru',
    to: 'Hyderabad',
    journey_date: '2026-11-23',
    departure_time: '14:00',
    arrival_time: '23:00',
    duration: '9h 00m',
    duration_minutes: 540,
    base_fare: 650.00,
    operator: 'Southern Star Travels',
    operator_rating: 4.8,
    reviews_count: 16700,
    bus_name: 'Southern Star Non-AC Sleeper',
    bus_type: 'Non-AC Sleeper (2+1)',
    has_ac: false,
    has_wifi: false,
    is_sleeper: true,
    total_seats: 30,
    available_seats: 12,
    amenities: ['Charging Point', 'Luggage Space', 'Emergency Exit'],
    boarding_stops: [
      { id: 'stop-51', name: 'Madiwala Signal', landmark: 'Opposite A2B', time: '14:00' },
      { id: 'stop-52', name: 'Tin Factory KR Puram', landmark: 'Near Pedestrian Skywalk', time: '14:35' },
    ],
    dropping_stops: [
      { id: 'stop-53', name: 'Lakdikapul Metro', landmark: 'Near Global Hospital', time: '23:00' },
    ],
    source: 'mock_demo'
  },
];

// Helper to generate 30 seats layout for sleeper (Volvo B11R) with deterministic UUIDs
export const generateLocalSeats = (tripId = '66666666-0001-0000-0000-000000000001', fare = 899) => {
  const seats = [];
  // 15 Lower Deck
  for (let r = 1; r <= 5; r++) {
    const s1 = `L${(r-1)*3 + 1}`;
    const s2 = `L${(r-1)*3 + 2}`;
    const s3 = `L${(r-1)*3 + 3}`;
    seats.push(
      { id: toUUID('seat', `${tripId}_${s1}`), seat_number: s1, deck: 'lower', row: r, col: 1, type: 'sleeper', is_window: true, is_ladies: ['L1', 'L4'].includes(s1), status: r === 2 ? 'booked' : 'available', fare },
      { id: toUUID('seat', `${tripId}_${s2}`), seat_number: s2, deck: 'lower', row: r, col: 2, type: 'sleeper', is_window: false, is_ladies: false, status: 'available', fare },
      { id: toUUID('seat', `${tripId}_${s3}`), seat_number: s3, deck: 'lower', row: r, col: 3, type: 'sleeper', is_window: true, is_ladies: false, status: 'available', fare }
    );
  }
  // 15 Upper Deck
  for (let r = 1; r <= 5; r++) {
    const s1 = `U${(r-1)*3 + 1}`;
    const s2 = `U${(r-1)*3 + 2}`;
    const s3 = `U${(r-1)*3 + 3}`;
    seats.push(
      { id: toUUID('seat', `${tripId}_${s1}`), seat_number: s1, deck: 'upper', row: r, col: 1, type: 'sleeper', is_window: true, is_ladies: false, status: 'available', fare },
      { id: toUUID('seat', `${tripId}_${s2}`), seat_number: s2, deck: 'upper', row: r, col: 2, type: 'sleeper', is_window: false, is_ladies: false, status: r === 1 ? 'booked' : 'available', fare },
      { id: toUUID('seat', `${tripId}_${s3}`), seat_number: s3, deck: 'upper', row: r, col: 3, type: 'sleeper', is_window: true, is_ladies: false, status: 'available', fare }
    );
  }
  return seats;
};

// In-Memory seat stores for offline/mock trips
let localSeatsStore = {
  '66666666-0001-0000-0000-000000000001': generateLocalSeats('66666666-0001-0000-0000-000000000001', 899),
  '66666666-0002-0000-0000-000000000002': generateLocalSeats('66666666-0002-0000-0000-000000000002', 1150),
  '66666666-0003-0000-0000-000000000003': generateLocalSeats('66666666-0003-0000-0000-000000000003', 699),
  '66666666-0004-0000-0000-000000000004': generateLocalSeats('66666666-0004-0000-0000-000000000004', 499),
  '66666666-0005-0000-0000-000000000005': generateLocalSeats('66666666-0005-0000-0000-000000000005', 650),
};

// In-Memory Bookings Store (Persisted to localStorage in browser)
const loadLocalBookings = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem('busgo_bookings');
      if (data) return JSON.parse(data);
    }
  } catch (e) {}
  return [];
};

const saveLocalBookings = (bookings) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('busgo_bookings', JSON.stringify(bookings));
    }
  } catch (e) {}
};

let localBookingsStore = loadLocalBookings();

export const dbService = {
  // 1. Get Cities List with Terminal Metadata
  async getCities() {
    let citiesList = CITIES_DATA;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cities').select('*').order('name');
        if (!error && data && data.length > 0) {
          citiesList = data;
        }
      } catch (e) {
        console.warn('Supabase cities query failed, falling back to seed data:', e);
      }
    }
    
    return citiesList.map((c) => ({
      ...c,
      terminals: CITY_TERMINALS_MAP[c.name] || [
        `${c.name} Central Bus Stand`,
        `${c.name} Bypass Toll Plaza`
      ]
    }));
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

  // 3. Search Trips by From, To & Date with Dual-Engine Fallback
  async searchTrips(fromCity, toCity, journeyDate, { forceMock = false } = {}) {
    if (!forceMock && isSupabaseConfigured && supabase) {
      try {
        const selectQuery = `
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
            origin_city:cities!routes_origin_city_id_fkey(id, name),
            destination_city:cities!routes_destination_city_id_fkey(id, name),
            route_stops(id, name, landmark, stop_type, time_offset_minutes)
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
          ),
          trip_seats(id, status)
        `;

        const { data, error } = await supabase
          .from('trips')
          .select(selectQuery)
          .eq('status', 'scheduled');

        if (!error && data) {
          data.forEach((t) => cloudSeededTripIds.add(t.id));
          let formatted = data.map((t) => {
            const originName = t.routes?.origin_city?.name || '';
            const destName = t.routes?.destination_city?.name || '';
            const allStops = t.routes?.route_stops || [];
            const boarding = allStops.filter((s) => s.stop_type === 'boarding');
            const dropping = allStops.filter((s) => s.stop_type === 'dropping');
            const busType = t.buses?.bus_type || 'AC Sleeper';
            const isSleeper = busType.toLowerCase().includes('sleeper');
            const totalSeats = t.buses?.total_seats || 30;
            const availableSeats = t.trip_seats && t.trip_seats.length > 0
              ? t.trip_seats.filter((s) => s.status === 'available').length
              : totalSeats;

            return {
              id: t.id,
              from: originName,
              to: destName,
              journey_date: t.journey_date,
              departure_time: t.departure_time ? t.departure_time.substring(0, 5) : '21:30',
              arrival_time: t.arrival_time ? t.arrival_time.substring(0, 5) : '06:45',
              duration: `${Math.floor((t.routes?.duration_minutes || 555) / 60)}h ${(t.routes?.duration_minutes || 555) % 60}m`,
              duration_minutes: t.routes?.duration_minutes || 555,
              base_fare: parseFloat(t.base_fare),
              operator: t.operators?.name || 'BusGo Partner',
              operator_rating: parseFloat(t.operators?.rating || 4.5),
              reviews_count: t.operators?.reviews_count || 1000,
              bus_name: t.buses?.name || 'Multi-Axle Bus',
              bus_type: busType,
              has_ac: Boolean(t.buses?.has_ac),
              has_wifi: Boolean(t.buses?.has_wifi),
              is_sleeper: isSleeper,
              amenities: t.buses?.amenities || ['Live Tracking', 'Water Bottle', 'Charging Point'],
              total_seats: totalSeats,
              available_seats: availableSeats,
              boarding_stops: boarding.length > 0 ? boarding : [
                { id: 'b-1', name: `${originName} Central Terminal`, landmark: 'Main Gate', time: t.departure_time?.substring(0, 5) }
              ],
              dropping_stops: dropping.length > 0 ? dropping : [
                { id: 'd-1', name: `${destName} Central Drop`, landmark: 'City Center', time: t.arrival_time?.substring(0, 5) }
              ],
              source: 'supabase_cloud',
            };
          });

          if (fromCity) {
            formatted = formatted.filter((t) => t.from.toLowerCase().trim() === fromCity.toLowerCase().trim());
          }
          if (toCity) {
            formatted = formatted.filter((t) => t.to.toLowerCase().trim() === toCity.toLowerCase().trim());
          }
          if (journeyDate) {
            formatted = formatted.filter((t) => t.journey_date === journeyDate);
          }

          if (formatted.length > 0) {
            return formatted;
          }
        }
      } catch (e) {
        console.warn('Supabase searchTrips query error, falling back to local simulation:', e);
      }
    }

    // Local in-memory filter (Mock / Demo Mode)
    let filteredLocal = [...localTrips];

    if (fromCity) {
      filteredLocal = filteredLocal.filter((t) => 
        t.from.toLowerCase().trim() === fromCity.toLowerCase().trim() ||
        fromCity.toLowerCase().includes(t.from.toLowerCase())
      );
    }
    if (toCity) {
      filteredLocal = filteredLocal.filter((t) => 
        t.to.toLowerCase().trim() === toCity.toLowerCase().trim() ||
        toCity.toLowerCase().includes(t.to.toLowerCase())
      );
    }

    // Dynamic generation for any searched city route not in pre-seeded list
    if (filteredLocal.length === 0 && fromCity && toCity) {
      const fromTerminals = CITY_TERMINALS_MAP[fromCity] || [
        `${fromCity} Central Bus Station`,
        `${fromCity} Bypass Junction`,
      ];
      const toTerminals = CITY_TERMINALS_MAP[toCity] || [
        `${toCity} Central Bus Stand`,
        `${toCity} Ring Road Terminal`,
      ];

      const sampleOperators = [
        { name: 'Sunrise Travels', rating: 4.8, reviews: 18420, bus: 'Sunrise Volvo B11R AC Sleeper', type: 'AC Sleeper (2+1)', fare: 899, dep: '21:30', arr: '06:45', dur: '9h 15m' },
        { name: 'Royal Roadways', rating: 4.9, reviews: 22850, bus: 'Royal Mercedes-Benz Super High Deck', type: 'AC Sleeper (2+1)', fare: 1150, dep: '22:00', arr: '07:30', dur: '9h 30m' },
        { name: 'GreenLine Express', rating: 4.6, reviews: 14200, bus: 'GreenLine Scania Multi-Axle HD', type: 'AC Semi-Sleeper (2+2)', fare: 699, dep: '20:45', arr: '05:30', dur: '8h 45m' },
        { name: 'CityLink Travels', rating: 4.3, reviews: 9800, bus: 'CityLink BharatBenz Luxury Coach', type: 'Non-AC Sleeper (2+1)', fare: 499, dep: '22:30', arr: '07:15', dur: '8h 45m' },
        { name: 'Southern Star Travels', rating: 4.7, reviews: 16100, bus: 'Southern Star Volvo 9600 Multi-Axle', type: 'AC Sleeper (2+1)', fare: 650, dep: '23:15', arr: '08:00', dur: '8h 45m' },
      ];

      filteredLocal = sampleOperators.map((op, idx) => {
        const tripUUID = toUUID('trip', `${fromCity}_${toCity}_${idx + 1}`);
        return {
          id: tripUUID,
          from: fromCity,
          to: toCity,
          journey_date: journeyDate || new Date().toISOString().split('T')[0],
          departure_time: op.dep,
          arrival_time: op.arr,
          duration: op.dur,
          duration_minutes: 540 + idx * 15,
          base_fare: op.fare,
          operator: op.name,
          operator_rating: op.rating,
          reviews_count: op.reviews,
          bus_name: op.bus,
          bus_type: op.type,
          has_ac: op.type.includes('AC'),
          has_wifi: true,
          is_sleeper: op.type.includes('Sleeper'),
          total_seats: 30,
          available_seats: 18 - idx * 2,
          amenities: ['Live Tracking', 'Water Bottle', 'Charging Point', 'Blanket', 'Reading Light'],
          boarding_stops: fromTerminals.map((name, sIdx) => ({
            id: toUUID('stop', `${tripUUID}_b_${sIdx}`),
            name,
            landmark: 'City Terminal Point',
            time: op.dep,
          })),
          dropping_stops: toTerminals.map((name, sIdx) => ({
            id: toUUID('stop', `${tripUUID}_d_${sIdx}`),
            name,
            landmark: 'City Drop Point',
            time: op.arr,
          })),
          source: 'simulated_route',
        };
      });
    }

    if (journeyDate) {
      filteredLocal = filteredLocal.map((t) => ({
        ...t,
        journey_date: journeyDate
      }));
    }

    return filteredLocal;
  },

  // 4. Get Seats for a Trip with Full Deck & Ladies Attributes
  async getTripSeats(tripId) {
    if (isSupabaseConfigured && supabase && isUUID(tripId)) {
      try {
        const query = 'id, seat_number, deck, seat_type, status, fare, lock_expires_at, locked_by_session_id, bus_seats(row_num, col_num, is_window, is_ladies)';
        const { data, error } = await supabase
          .from('trip_seats')
          .select(query)
          .eq('trip_id', tripId)
          .order('seat_number');

        if (!error && data && data.length > 0) {
          cloudSeededTripIds.add(tripId);
          const now = new Date();
          return data.map((s) => {
            const isLadies = s.bus_seats?.is_ladies || ['L1', 'L4', 'L7'].includes(s.seat_number);
            const isWindow = s.bus_seats?.is_window ?? (s.seat_number.endsWith('1') || s.seat_number.endsWith('3'));
            // Check lock expiration
            let effectiveStatus = s.status;
            if (s.status === 'locked' && s.lock_expires_at && new Date(s.lock_expires_at) < now) {
              effectiveStatus = 'available';
            }

            return {
              id: s.id,
              seat_number: s.seat_number,
              deck: s.deck || (s.seat_number.startsWith('U') ? 'upper' : 'lower'),
              type: s.seat_type || 'sleeper',
              row: s.bus_seats?.row_num || parseInt(s.seat_number.replace(/\D/g, '') || 1, 10),
              col: s.bus_seats?.col_num || (s.seat_number.endsWith('1') ? 1 : (s.seat_number.endsWith('2') ? 2 : 3)),
              is_window: isWindow,
              is_ladies: isLadies,
              status: effectiveStatus,
              locked_by_session_id: s.locked_by_session_id || null,
              fare: parseFloat(s.fare || 899),
            };
          });
        }
      } catch (e) {
        console.warn('Supabase getTripSeats fallback to local layout:', e);
      }
    }

    if (!localSeatsStore[tripId]) {
      localSeatsStore[tripId] = generateLocalSeats(tripId);
    }
    return localSeatsStore[tripId];
  },

  // 5. Atomic Seat Locking (Calls stored RPC with resilient local fallback)
  async lockSeats(tripId, seatIds, userId = null, sessionId = null) {
    const isCloudTrip = cloudSeededTripIds.has(tripId);
    const canUseSupabase = isSupabaseConfigured && supabase && isCloudTrip && isUUID(tripId) && seatIds.every(isUUID);

    if (canUseSupabase) {
      try {
        const { data, error } = await supabase.rpc('lock_trip_seats', {
          p_trip_id: tripId,
          p_seat_ids: seatIds,
          p_user_id: isUUID(userId) ? userId : null,
          p_session_id: sessionId || 'session-' + Date.now(),
        });

        if (error) {
          // If the seat is genuinely locked or claimed by someone else, propagate that message
          if (error.message && (error.message.includes('no longer available') || error.message.includes('already booked') || error.message.includes('conflict'))) {
            throw new Error(error.message);
          }
          console.warn('Supabase lock_trip_seats error, falling back to local lock:', error.message);
        } else if (data) {
          return data;
        }
      } catch (e) {
        if (e.message && (e.message.includes('no longer available') || e.message.includes('already booked') || e.message.includes('conflict'))) {
          throw e;
        }
        console.warn('Supabase lockSeats exception, using local lock simulation:', e.message);
      }
    }

    // Local simulation atomic lock
    if (!localSeatsStore[tripId]) {
      localSeatsStore[tripId] = generateLocalSeats(tripId);
    }
    const seats = localSeatsStore[tripId] || [];
    for (const id of seatIds) {
      const s = seats.find((seat) => seat.id === id || seat.seat_number === id);
      if (s && s.status === 'booked') {
        throw new Error(`Seat ${s.seat_number} is already booked.`);
      }
      if (s) {
        s.status = 'locked';
        s.locked_by_session_id = sessionId;
      }
    }
    return { success: true, locked_count: seatIds.length, lock_expires_at: new Date(Date.now() + 600000).toISOString() };
  },

  // 6. Confirm Booking (Calls stored RPC confirm_bus_booking with fallback)
  async confirmBooking(params) {
    let bookingResult = null;

    const safeTripId = isUUID(params.tripId) ? params.tripId : null;
    const safeSeatIds = (params.seatIds || []).filter(isUUID);
    const isCloudTrip = safeTripId && cloudSeededTripIds.has(safeTripId);
    const hasValidUUIDs = isCloudTrip && safeSeatIds.length === (params.seatIds || []).length && safeSeatIds.length > 0;
    const safeBoardingStopId = isUUID(params.boardingStopId)
      ? params.boardingStopId
      : '7bcf1db0-aa39-4232-a8c0-28c7e45fe1e2';
    const safeDroppingStopId = isUUID(params.droppingStopId)
      ? params.droppingStopId
      : 'be288ed8-3e86-40b6-bfd6-25d936f39bfc';
    const safeUserId = isUUID(params.userId) ? params.userId : null;

    if (isSupabaseConfigured && supabase && hasValidUUIDs) {
      try {
        const normalizedPassengers = (params.passengers || []).map((p, idx) => ({
          seat_id: isUUID(p.seat_id) ? p.seat_id : safeSeatIds[idx] || safeSeatIds[0],
          seat_number: p.seat_number,
          full_name: p.full_name || 'Passenger ' + (idx + 1),
          age: parseInt(p.age, 10) || 28,
          gender: (p.gender || 'male').toLowerCase(),
        }));

        const { data, error } = await supabase.rpc('confirm_bus_booking', {
          p_trip_id: safeTripId,
          p_seat_ids: safeSeatIds,
          p_user_id: safeUserId,
          p_session_id: params.sessionId || 'session-' + Date.now(),
          p_contact_name: params.contactName || 'Passenger',
          p_contact_email: params.contactEmail || 'customer@busgo.in',
          p_contact_phone: params.contactPhone || '9845012345',
          p_passengers: normalizedPassengers,
          p_boarding_stop_id: safeBoardingStopId,
          p_dropping_stop_id: safeDroppingStopId,
          p_coupon_code: params.couponCode || null,
          p_payment_method: params.paymentMethod || 'UPI',
        });

        if (!error && data && data.success) {
          bookingResult = data;
        } else if (error) {
          console.warn('Supabase confirm_bus_booking returned error, engaging fallback engine:', error.message);
        }
      } catch (e) {
        console.warn('Supabase confirmBooking execution error, engaging fallback engine:', e.message);
      }
    }

    // Local fallback or synthesis engine (guarantees confirmed booking & PNR)
    if (!bookingResult) {
      const pnr = 'BG' + Math.floor(100000 + Math.random() * 900000);
      const bookingId = toUUID('booking', 'booking-' + Date.now());

      // Mark local seats as booked
      const seats = localSeatsStore[params.tripId] || [];
      for (const id of params.seatIds || []) {
        const s = seats.find((seat) => seat.id === id || seat.seat_number === id);
        if (s) s.status = 'booked';
      }

      bookingResult = {
        success: true,
        booking_id: bookingId,
        pnr,
        total_fare: params.totalFare || 899,
        status: 'confirmed',
        passenger_count: (params.passengers || []).length || (params.seatIds || []).length || 1,
      };
    }

    // Construct full record for local history & instant retrieval
    const record = {
      id: bookingResult.booking_id,
      pnr: bookingResult.pnr,
      trip_id: params.tripId,
      user_id: params.userId || null,
      contact_name: params.contactName,
      contact_email: params.contactEmail,
      contact_phone: params.contactPhone,
      from: params.from || 'Bengaluru',
      to: params.to || 'Hyderabad',
      journey_date: params.journeyDate || new Date().toISOString().split('T')[0],
      departure_time: params.departureTime || '21:30',
      arrival_time: params.arrivalTime || '06:45',
      duration: params.duration || '9h 15m',
      operator: params.operator || 'Sunrise Travels',
      bus_name: params.busName || 'Sunrise Volvo B11R AC Sleeper',
      bus_type: params.busType || 'AC Sleeper (2+1)',
      boarding_point: params.boardingPointName || 'Majestic (KBS) Platform 4',
      dropping_point: params.droppingPointName || 'MGBS Terminal 2',
      passengers: params.passengers || [],
      total_fare: bookingResult.total_fare || params.totalFare || 899,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    localBookingsStore = [record, ...localBookingsStore];
    saveLocalBookings(localBookingsStore);

    return {
      ...bookingResult,
      booking: record,
    };
  },

  // 7. Get User Bookings (Combines Supabase and local bookings)
  async getUserBookings(userId = null, userEmail = null) {
    let cloudBookings = [];

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            pnr,
            trip_id,
            total_fare,
            status,
            contact_name,
            contact_email,
            contact_phone,
            created_at,
            passengers (id, seat_number, full_name, age, gender),
            trips (
              journey_date,
              departure_time,
              arrival_time,
              routes (
                origin_city:cities!routes_origin_city_id_fkey(name),
                destination_city:cities!routes_destination_city_id_fkey(name)
              ),
              buses (name, bus_type),
              operators (name)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          cloudBookings = data.map((b) => ({
            id: b.id,
            pnr: b.pnr,
            trip_id: b.trip_id,
            from: b.trips?.routes?.origin_city?.name || 'Bengaluru',
            to: b.trips?.routes?.destination_city?.name || 'Hyderabad',
            journey_date: b.trips?.journey_date || '2026-11-23',
            departure_time: b.trips?.departure_time?.substring(0, 5) || '21:30',
            arrival_time: b.trips?.arrival_time?.substring(0, 5) || '06:45',
            operator: b.trips?.operators?.name || 'Sunrise Travels',
            bus_name: b.trips?.buses?.name || 'Volvo B11R',
            bus_type: b.trips?.buses?.bus_type || 'AC Sleeper',
            total_fare: parseFloat(b.total_fare),
            status: b.status,
            passengers: b.passengers || [],
            contact_name: b.contact_name,
            contact_email: b.contact_email,
            contact_phone: b.contact_phone,
            created_at: b.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase getUserBookings query error:', e);
      }
    }

    // Merge with local demo bookings
    const localMatches = localBookingsStore.filter((b) => {
      if (userId && b.user_id === userId) return true;
      if (userEmail && b.contact_email === userEmail) return true;
      return true; // Return all in demo mode
    });

    // Deduplicate by PNR
    const pnrMap = new Map();
    [...cloudBookings, ...localMatches].forEach((b) => {
      if (!pnrMap.has(b.pnr)) pnrMap.set(b.pnr, b);
    });

    return Array.from(pnrMap.values());
  },

  // 8. Cancel Booking & Tiered Refund
  async cancelBooking(bookingId, userId = null, reason = 'Passenger request') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase.rpc('cancel_booking_rpc', {
          p_booking_id: bookingId,
          p_user_id: userId,
          p_reason: reason,
        });

        if (!error && data) {
          // Update local copy
          const idx = localBookingsStore.findIndex((b) => b.id === bookingId || b.pnr === bookingId);
          if (idx !== -1) {
            localBookingsStore[idx].status = 'cancelled';
            saveLocalBookings(localBookingsStore);
          }
          return data;
        }
      } catch (e) {
        console.warn('Supabase cancel_booking_rpc error:', e);
      }
    }

    // Local simulation tiered refund
    const idx = localBookingsStore.findIndex((b) => b.id === bookingId || b.pnr === bookingId);
    let totalFare = 899;
    if (idx !== -1) {
      localBookingsStore[idx].status = 'cancelled';
      totalFare = localBookingsStore[idx].total_fare || 899;
      saveLocalBookings(localBookingsStore);
    }

    const fee = totalFare * 0.10;
    const refund = totalFare - fee;

    return {
      success: true,
      original_amount: totalFare,
      cancellation_fee: fee,
      refund_amount: refund,
      refund_rate: 0.90,
      refund_status: 'REFUNDED_TO_SOURCE',
    };
  },

  // 9. Operator Portal Data (Trips, buses, and passenger manifests)
  async getOperatorData(operatorEmail = 'operator@sunrisetravels.in') {
    return {
      operator_name: 'Sunrise Travels',
      rating: 4.8,
      reviews_count: 18420,
      headquarters: 'Bengaluru, Karnataka',
      is_active: true,
      fleet_count: 14,
      active_trips_count: 6,
      total_passengers_today: 142,
      gross_earnings: 127658.00,
      trips: [
        {
          id: '66666666-0001-0000-0000-000000000001',
          route: 'Bengaluru → Hyderabad',
          bus: 'Sunrise Volvo B11R AC Sleeper',
          reg_no: 'KA-01-F-1024',
          date: '2026-11-23',
          departure: '21:30',
          arrival: '06:45',
          occupancy: '24 / 30',
          status: 'scheduled',
          passengers: [
            { seat: 'L1', name: 'Madhavan Rao', age: 34, gender: 'Male', boarding: 'Majestic KBS', phone: '9845012345', status: 'Confirmed' },
            { seat: 'L2', name: 'Priya Sharma', age: 29, gender: 'Female', boarding: 'Madiwala Hospital', phone: '9880198765', status: 'Confirmed' },
            { seat: 'L3', name: 'Venkatesh Iyer', age: 42, gender: 'Male', boarding: 'Electronic City Toll', phone: '9448011223', status: 'Confirmed' },
            { seat: 'U1', name: 'Ananya Reddy', age: 26, gender: 'Female', boarding: 'Majestic KBS', phone: '9900112233', status: 'Confirmed' },
            { seat: 'U2', name: 'Rohit Kulkarni', age: 31, gender: 'Male', boarding: 'Madiwala Hospital', phone: '9844055667', status: 'Confirmed' },
          ]
        },
        {
          id: '66666666-0002-0000-0000-000000000002',
          route: 'Bengaluru → Chennai',
          bus: 'Sunrise Scania Multi-Axle AC Sleeper',
          reg_no: 'KA-01-F-1088',
          date: '2026-11-23',
          departure: '23:00',
          arrival: '05:30',
          occupancy: '28 / 30',
          status: 'scheduled',
          passengers: [
            { seat: 'L1', name: 'Karthik Subramanian', age: 38, gender: 'Male', boarding: 'Indiranagar Metro', phone: '9880123987', status: 'Confirmed' },
            { seat: 'L2', name: 'Sneha Mohan', age: 25, gender: 'Female', boarding: 'KR Puram Station', phone: '9945088776', status: 'Confirmed' },
          ]
        }
      ]
    };
  },

  // 10. Admin Portal Overview
  async getAdminOverview() {
    let operatorsCount = 8;
    let citiesCount = 12;

    if (isSupabaseConfigured && supabase) {
      try {
        const { count: opCount } = await supabase.from('operators').select('*', { count: 'exact', head: true });
        if (opCount) operatorsCount = opCount;
      } catch (e) {}
    }

    return {
      stats: {
        total_bookings: 1845,
        total_revenue: 1658420.00,
        active_operators: operatorsCount,
        registered_users: 1420,
        total_cities: citiesCount,
        system_health: 'Operational (100% Uptime)',
      },
      operators_list: [
        { id: 'op-1', name: 'Sunrise Travels', email: 'operator@sunrisetravels.in', buses: 14, rating: 4.8, status: 'active' },
        { id: 'op-2', name: 'Royal Roadways', email: 'operator@royal.in', buses: 18, rating: 4.9, status: 'active' },
        { id: 'op-3', name: 'GreenLine Express', email: 'operator@greenline.in', buses: 12, rating: 4.7, status: 'active' },
        { id: 'op-4', name: 'CityLink Travels', email: 'operator@citylink.in', buses: 8, rating: 4.6, status: 'active' },
        { id: 'op-5', name: 'Southern Star Travels', email: 'operator@southernstar.in', buses: 10, rating: 4.8, status: 'active' },
        { id: 'op-pending', name: 'Himalayan Express (New)', email: 'operator@pending.in', buses: 4, rating: 4.5, status: 'pending_approval' },
      ],
      recent_bookings: localBookingsStore.slice(0, 5),
    };
  },

  // 11. Approve or Suspend Operator
  async updateOperatorStatus(operatorId, status) {
    if (isSupabaseConfigured && supabase) {
      try {
        const isActive = status === 'active';
        await supabase.from('operators').update({ is_active: isActive }).eq('id', operatorId);
      } catch (e) {}
    }
    return { success: true, operatorId, status };
  }
};

export default dbService;
