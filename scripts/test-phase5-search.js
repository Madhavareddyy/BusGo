import fs from 'fs';
import path from 'path';

// Load .env into process.env before importing services
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const { dbService } = await import('../src/services/db.js');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runPhase5TestSuite() {
  console.log('====================================================');
  console.log('  BUSGO PHASE 5: BUS SEARCH, FILTERS & SORTING TEST');
  console.log('====================================================\n');

  // Test 1: Dynamic Cities Autocomplete
  console.log('[1] Testing Dynamic City Autocomplete:');
  const cities = await dbService.getCities();
  assert(Array.isArray(cities) && cities.length >= 12, `Loaded ${cities.length} dynamic cities from database`);
  const hasBlr = cities.some(c => c.name === 'Bengaluru' && c.code === 'BLR');
  const hasHyd = cities.some(c => c.name === 'Hyderabad' && c.code === 'HYD');
  assert(hasBlr && hasHyd, 'Bengaluru (BLR) and Hyderabad (HYD) present with city codes');
  const hasTerminals = cities.every(c => Array.isArray(c.terminals) && c.terminals.length > 0);
  assert(hasTerminals, 'All cities include terminal and boarding point metadata for autocomplete');

  // Test 2: Live Supabase Search
  console.log('\n[2] Testing Live Supabase Bus Search (BLR → HYD, 2026-11-23):');
  let liveTrips = [];
  try {
    liveTrips = await dbService.searchTrips('Bengaluru', 'Hyderabad', '2026-11-23', { forceMock: false });
  } catch (e) {
    console.error('Error fetching live trips:', e);
  }

  assert(liveTrips.length > 0, `Live Supabase search returned ${liveTrips.length} scheduled trip(s)`);
  if (liveTrips.length > 0) {
    const trip = liveTrips[0];
    assert(trip.operator === 'Sunrise Travels', `Operator verified as: "${trip.operator}"`);
    assert(trip.has_ac === true && trip.is_sleeper === true, `Bus specs verified: AC Sleeper (${trip.bus_type})`);
    assert(trip.base_fare === 899, `Base fare verified as: ₹${trip.base_fare}`);
    assert(trip.available_seats > 0 && trip.available_seats <= 30, `Available seats count verified from live trip_seats: ${trip.available_seats} seats`);
    assert(trip.departure_time === '21:30' && trip.arrival_time === '06:45', `Timings verified: ${trip.departure_time} → ${trip.arrival_time} (${trip.duration})`);
    assert(trip.boarding_stops.length > 0 && trip.dropping_stops.length > 0, `Boarding & dropping stops attached: ${trip.boarding_stops.length} boarding, ${trip.dropping_stops.length} dropping`);
    assert(trip.source === 'supabase_cloud', 'Trip source verified as: "supabase_cloud"');
  }

  // Test 3: Live Supabase Empty Result Handling
  console.log('\n[3] Testing Live Supabase Empty Result State (BLR → HYD, 2029-01-01):');
  const emptyTrips = await dbService.searchTrips('Bengaluru', 'Hyderabad', '2029-01-01', { forceMock: false });
  assert(Array.isArray(emptyTrips) && emptyTrips.length === 0, 'Non-existent trip date returns empty array [] triggering empty-result UI state');

  // Test 4: Mock Mode Dual-Engine Resilience
  console.log('\n[4] Testing Mock/Demo Fallback Engine:');
  const mockTrips = await dbService.searchTrips('Bengaluru', 'Hyderabad', '2026-11-23', { forceMock: true });
  assert(mockTrips.length === 5, `Mock mode provides ${mockTrips.length} diverse trips covering all filter test permutations`);
  const mockOperators = new Set(mockTrips.map(t => t.operator));
  assert(mockOperators.size >= 4, `Mock mode includes ${mockOperators.size} distinct operators for filtering`);

  // Test 5: Multi-Facet Filtering Logic
  console.log('\n[5] Testing Multi-Facet Filters on Bus Dataset:');
  
  // 5a: AC Filter
  const acTrips = mockTrips.filter(t => t.has_ac);
  const nonAcTrips = mockTrips.filter(t => !t.has_ac);
  assert(acTrips.length === 3 && nonAcTrips.length === 2, `AC filter accurately isolates ${acTrips.length} AC buses and ${nonAcTrips.length} Non-AC buses`);

  // 5b: Sleeper vs Seater Filter
  const sleeperTrips = mockTrips.filter(t => t.is_sleeper);
  const seaterTrips = mockTrips.filter(t => !t.is_sleeper);
  assert(sleeperTrips.length === 3 && seaterTrips.length === 2, `Sleeper filter accurately isolates ${sleeperTrips.length} Sleeper buses and ${seaterTrips.length} Seaters`);

  // 5c: Price Range Slider Filter
  const under700 = mockTrips.filter(t => t.base_fare <= 700);
  assert(under700.length === 3, `Price filter (≤ ₹700) accurately selects 3 buses (₹499, ₹650, ₹699)`);

  // 5d: Departure Time Buckets
  const getBucket = (timeStr) => {
    const h = parseInt(timeStr.split(':')[0], 10);
    if (h < 6) return 'early_morning';
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'night';
  };
  const morningTrips = mockTrips.filter(t => getBucket(t.departure_time) === 'morning');
  const afternoonTrips = mockTrips.filter(t => getBucket(t.departure_time) === 'afternoon');
  const nightTrips = mockTrips.filter(t => getBucket(t.departure_time) === 'night');
  assert(morningTrips.length === 1 && morningTrips[0].departure_time === '06:30', 'Morning time bucket (6 AM - 12 PM) matches CityLink 06:30 AM');
  assert(afternoonTrips.length === 1 && afternoonTrips[0].departure_time === '14:00', 'Afternoon time bucket (12 PM - 6 PM) matches Southern Star 14:00 PM');
  assert(nightTrips.length === 3, 'Night time bucket (After 6 PM) matches 3 overnight sleeper coaches');

  // 5e: Operator Filter
  const royalOnly = mockTrips.filter(t => t.operator === 'Royal Roadways');
  assert(royalOnly.length === 1 && royalOnly[0].base_fare === 1150, 'Operator filter for "Royal Roadways" matches premium ₹1150 coach');

  // Test 6: Sorting Logic
  console.log('\n[6] Testing Sorting Algorithms:');

  // 6a: Price Ascending (Cheapest First)
  const priceAsc = [...mockTrips].sort((a, b) => a.base_fare - b.base_fare);
  const isPriceAsc = priceAsc.every((t, i, arr) => i === 0 || arr[i - 1].base_fare <= t.base_fare);
  assert(isPriceAsc && priceAsc[0].base_fare === 499, `Price Ascending: Cheapest bus first (₹${priceAsc[0].base_fare} → ₹${priceAsc[priceAsc.length - 1].base_fare})`);

  // 6b: Price Descending (Highest First)
  const priceDesc = [...mockTrips].sort((a, b) => b.base_fare - a.base_fare);
  const isPriceDesc = priceDesc.every((t, i, arr) => i === 0 || arr[i - 1].base_fare >= t.base_fare);
  assert(isPriceDesc && priceDesc[0].base_fare === 1150, `Price Descending: Luxury bus first (₹${priceDesc[0].base_fare} → ₹${priceDesc[priceDesc.length - 1].base_fare})`);

  // 6c: Earliest Departure
  const depAsc = [...mockTrips].sort((a, b) => a.departure_time.localeCompare(b.departure_time));
  assert(depAsc[0].departure_time === '06:30', `Earliest Departure: 06:30 AM departure sorted first`);

  // 6d: Shortest Duration
  const durAsc = [...mockTrips].sort((a, b) => a.duration_minutes - b.duration_minutes);
  assert(durAsc[0].duration_minutes === 510, `Shortest Duration: 8h 30m (510 min) trip sorted first`);

  // 6e: Top Rated
  const ratingDesc = [...mockTrips].sort((a, b) => b.operator_rating - a.operator_rating);
  assert(ratingDesc[0].operator_rating === 4.9, `Top Rated: 4.9 ★ (Royal Roadways) sorted first`);

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5TestSuite();
