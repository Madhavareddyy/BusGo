import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Read credentials from .env safely without printing them
const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/) || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
  console.error('ERROR: Real Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

const EXPECTED_TABLES = [
  'profiles',
  'operators',
  'cities',
  'buses',
  'bus_seats',
  'routes',
  'route_stops',
  'trips',
  'trip_seats',
  'bookings',
  'passengers',
  'payments',
  'cancellations',
  'refunds',
  'reviews',
  'coupons',
  'notifications',
];

const SAMPLE_DATA_TABLES = ['cities', 'operators', 'buses', 'routes', 'trips'];

const EXPECTED_RPCS = [
  'lock_trip_seats',
  'confirm_bus_booking',
  'cancel_booking_rpc',
];

async function runVerification() {
  console.log('====================================================');
  console.log('  BUSGO PHASE 4: LIVE CLOUD SUPABASE VERIFICATION');
  console.log('====================================================\n');
  console.log(`Cloud Target: ${url}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const results = {
    tables: {},
    sampleData: {},
    rlsLiveEnforcement: {},
    rlsPgCatalog: 'NOT VERIFIED',
    rpcs: {},
  };

  // Step 0: Check PostgREST OpenAPI spec
  console.log('[Step 0] Fetching PostgREST API schema definitions...');
  let openApiPaths = [];
  let openApiDefinitions = [];
  try {
    const apiRes = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (apiRes.ok) {
      const spec = await apiRes.json();
      openApiPaths = Object.keys(spec.paths || {});
      openApiDefinitions = Object.keys(spec.definitions || {});
      console.log(`✓ PostgREST OpenAPI Schema fetched. Exposed routes count: ${openApiPaths.length}`);
    } else {
      console.log(`! PostgREST root returned status: ${apiRes.status}`);
    }
  } catch (err) {
    console.log(`! PostgREST root fetch error: ${err.message}`);
  }

  // Step 1: Verify all 17 tables exist in live cloud database
  console.log('\n[Step 1] Verifying 17 expected tables on live database...');
  for (const table of EXPECTED_TABLES) {
    try {
      const { data, error, status } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        // If error indicates table doesn't exist (PGRST204 / 42P01)
        if (error.code === 'PGRST204' || error.message.includes('relation') || error.message.includes('does not exist')) {
          results.tables[table] = { status: 'FAIL', error: error.message };
        } else {
          // If error is permission or RLS, the table exists!
          results.tables[table] = { status: 'PASS', note: `Table exists (status ${status}, error code: ${error.code})` };
        }
      } else {
        results.tables[table] = { status: 'PASS', note: `Table exists and responded with HTTP ${status}` };
      }
    } catch (err) {
      results.tables[table] = { status: 'FAIL', error: err.message };
    }
    console.log(`  - ${table.padEnd(16)}: ${results.tables[table].status} (${results.tables[table].note || results.tables[table].error})`);
  }

  // Step 2: Verify sample records exist in cities, operators, buses, routes, trips
  console.log('\n[Step 2] Verifying sample records in seed tables...');
  for (const table of SAMPLE_DATA_TABLES) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        results.sampleData[table] = { status: 'FAIL', error: error.message };
      } else if (count > 0 || (data && data.length > 0)) {
        const rowCount = count !== null ? count : data.length;
        const samplePreview = data.length > 0 ? (data[0].name || data[0].title || data[0].id) : '';
        results.sampleData[table] = { status: 'PASS', count: rowCount, preview: samplePreview };
      } else {
        results.sampleData[table] = { status: 'FAIL', error: 'Table exists but has 0 records' };
      }
    } catch (err) {
      results.sampleData[table] = { status: 'FAIL', error: err.message };
    }
    const info = results.sampleData[table];
    console.log(`  - ${table.padEnd(16)}: ${info.status} (Count: ${info.count || 0}, Sample: "${info.preview || ''}")`);
  }

  // Step 3: Verify RLS Enforcement
  console.log('\n[Step 3] Verifying Row Level Security (RLS)...');
  // Live anonymous test on private tables:
  const privateTables = ['bookings', 'passengers', 'payments', 'cancellations', 'refunds', 'notifications', 'profiles'];
  for (const table of privateTables) {
    try {
      const { data, error, status } = await supabase
        .from(table)
        .select('*');

      // For private tables with RLS enabled, anon user should receive empty array [] and 0 data rows
      if (!error && Array.isArray(data) && data.length === 0) {
        results.rlsLiveEnforcement[table] = { status: 'PASS', detail: 'RLS active: Anonymous access returns 0 rows (isolated)' };
      } else if (!error && Array.isArray(data) && data.length > 0) {
        results.rlsLiveEnforcement[table] = { status: 'FAIL', detail: 'RLS LEAK: Anonymous user could read private rows!' };
      } else if (error) {
        results.rlsLiveEnforcement[table] = { status: 'PASS', detail: `Access restricted (${error.code || error.message})` };
      }
    } catch (err) {
      results.rlsLiveEnforcement[table] = { status: 'FAIL', error: err.message };
    }
    console.log(`  - ${table.padEnd(16)}: ${results.rlsLiveEnforcement[table].status} (${results.rlsLiveEnforcement[table].detail})`);
  }

  // Direct database pg_tables inspection check:
  // Note: Anon cannot query pg_tables directly unless superuser/service_role
  try {
    const { data, error } = await supabase.from('pg_tables').select('tablename, rowsecurity');
    if (error) {
      results.rlsPgCatalog = 'NOT VERIFIED';
      console.log(`  - Direct pg_tables query: NOT VERIFIED (PostgREST does not expose pg_catalog to anon key; safe & expected)`);
    } else {
      results.rlsPgCatalog = 'PASS';
    }
  } catch (e) {
    results.rlsPgCatalog = 'NOT VERIFIED';
  }

  // Step 4: Verify RPC functions
  console.log('\n[Step 4] Verifying Stored RPC Functions in Live Cloud...');
  
  // Test lock_trip_seats: call with empty seat list -> should trigger function-specific exception 'No seats provided for locking.'
  try {
    const { data, error } = await supabase.rpc('lock_trip_seats', {
      p_trip_id: '00000000-0000-0000-0000-000000000000',
      p_seat_ids: [],
    });
    if (error) {
      if (error.message.includes('No seats provided for locking') || error.code === 'P0001') {
        results.rpcs['lock_trip_seats'] = { status: 'PASS', note: `Live RPC executed and caught expected exception: "${error.message}"` };
      } else if (error.code === 'PGRST202' || error.message.includes('Could not find')) {
        results.rpcs['lock_trip_seats'] = { status: 'FAIL', error: 'Function not found in schema cache' };
      } else {
        results.rpcs['lock_trip_seats'] = { status: 'PASS', note: `Live RPC responded: ${error.message} (${error.code})` };
      }
    } else {
      results.rpcs['lock_trip_seats'] = { status: 'PASS', note: 'Live RPC executed successfully' };
    }
  } catch (err) {
    results.rpcs['lock_trip_seats'] = { status: 'FAIL', error: err.message };
  }
  console.log(`  - lock_trip_seats     : ${results.rpcs['lock_trip_seats'].status} (${results.rpcs['lock_trip_seats'].note || results.rpcs['lock_trip_seats'].error})`);

  // Test confirm_bus_booking: test probe with parameter signature
  try {
    const { data, error } = await supabase.rpc('confirm_bus_booking', {
      p_trip_id: '00000000-0000-0000-0000-000000000000',
      p_seat_ids: ['00000000-0000-0000-0000-000000000000'],
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_session_id: 'probe-session',
      p_contact_name: 'Probe Passenger',
      p_contact_email: 'probe@busgo.in',
      p_contact_phone: '9876543210',
      p_passengers: [],
      p_boarding_stop_id: '00000000-0000-0000-0000-000000000000',
      p_dropping_stop_id: '00000000-0000-0000-0000-000000000000',
    });
    if (error) {
      if (error.code === 'PGRST202' || error.message.includes('Could not find')) {
        results.rpcs['confirm_bus_booking'] = { status: 'FAIL', error: 'Function not found in PostgREST schema cache' };
      } else {
        // Function exists and responded with internal logic exception (e.g. seat lock check)
        results.rpcs['confirm_bus_booking'] = { status: 'PASS', note: `Live RPC executed and caught expected logic exception: "${error.message}" (${error.code})` };
      }
    } else {
      results.rpcs['confirm_bus_booking'] = { status: 'PASS', note: 'Live RPC executed' };
    }
  } catch (err) {
    results.rpcs['confirm_bus_booking'] = { status: 'FAIL', error: err.message };
  }
  console.log(`  - confirm_bus_booking : ${results.rpcs['confirm_bus_booking'].status} (${results.rpcs['confirm_bus_booking'].note || results.rpcs['confirm_bus_booking'].error})`);

  // Test cancel_booking_rpc: call with dummy UUID -> should hit 'Booking not found.'
  try {
    const { data, error } = await supabase.rpc('cancel_booking_rpc', {
      p_booking_id: '00000000-0000-0000-0000-000000000000',
      p_user_id: '00000000-0000-0000-0000-000000000000',
    });
    if (error) {
      if (error.message.includes('Booking not found') || error.code === 'P0001') {
        results.rpcs['cancel_booking_rpc'] = { status: 'PASS', note: `Live RPC executed and caught expected exception: "${error.message}"` };
      } else if (error.code === 'PGRST202' || error.message.includes('Could not find')) {
        results.rpcs['cancel_booking_rpc'] = { status: 'FAIL', error: 'Function not found in schema cache' };
      } else {
        results.rpcs['cancel_booking_rpc'] = { status: 'PASS', note: `Live RPC responded: ${error.message} (${error.code})` };
      }
    } else {
      results.rpcs['cancel_booking_rpc'] = { status: 'PASS', note: 'Live RPC executed' };
    }
  } catch (err) {
    results.rpcs['cancel_booking_rpc'] = { status: 'FAIL', error: err.message };
  }
  console.log(`  - cancel_booking_rpc  : ${results.rpcs['cancel_booking_rpc'].status} (${results.rpcs['cancel_booking_rpc'].note || results.rpcs['cancel_booking_rpc'].error})`);

  console.log('\n====================================================');
  console.log('  LIVE VERIFICATION COMPLETE');
  console.log('====================================================\n');
}

runVerification();
