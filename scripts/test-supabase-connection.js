import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('  BUSGO SUPABASE CONNECTION HEALTH CHECK');
console.log('====================================================\n');

const envPath = path.resolve(process.cwd(), '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_PUBLISHABLE_KEY=(.*)/) || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

const isPlaceholder = (val) => {
  return !val || val.includes('your-supabase') || val.includes('placeholder') || val === 'https://your-project.supabase.co';
};

console.log(`[Config Check]`);
console.log(`- .env file found: ${fs.existsSync(envPath) ? 'YES' : 'NO'}`);
console.log(`- VITE_SUPABASE_URL set: ${url ? (isPlaceholder(url) ? 'PLACEHOLDER' : url) : 'NOT SET'}`);
console.log(`- VITE_SUPABASE_PUBLISHABLE_KEY set: ${key ? (isPlaceholder(key) ? 'PLACEHOLDER' : 'CONFIGURED (' + key.substring(0, 12) + '...)') : 'NOT SET'}\n`);

if (isPlaceholder(url) || isPlaceholder(key)) {
  console.log('[Status: DEMO / LOCAL FALLBACK ACTIVE]');
  console.log('BusGo is operating in intelligent local/demo mode with persistent database simulation.');
  console.log('To link your remote cloud project:');
  console.log('1. Open .env');
  console.log('2. Replace VITE_SUPABASE_URL with your Project URL (e.g. https://xyzcompany.supabase.co)');
  console.log('3. Replace VITE_SUPABASE_PUBLISHABLE_KEY with your publishable/anon key\n');
} else {
  console.log('[Status: LIVE SUPABASE CREDENTIALS DETECTED]');
  console.log(`Attempting ping to ${url}...`);

  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (res.ok) {
      console.log('✓ Successfully connected to live Supabase backend! Status:', res.status);
    } else {
      console.log('! Supabase answered with status:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('✗ Connection attempt failed:', err.message);
  }
}

console.log('====================================================\n');
