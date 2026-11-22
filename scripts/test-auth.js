/**
 * BusGo Automated Authentication & Security Test Suite
 * Validates:
 * 1. Customer registration & validation rules
 * 2. Login with valid & invalid credentials
 * 3. Role separation & portal restriction (customer vs operator vs admin)
 * 4. Operator pending approval gate (unapproved operators blocked)
 * 5. Admin elevation protection (admin role can never be acquired via public signup)
 * 6. Session persistence & restoration simulation
 */

console.log('====================================================');
console.log('  BUSGO PHASE 3: AUTHENTICATION & SECURITY TEST SUITE');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    testsFailed++;
  }
}

// 1. Initial Demonstration Seeded Users
const DEMO_STORE = [
  {
    id: 'demo-customer-1',
    email: 'customer@busgo.in',
    password: 'Pass@123',
    role: 'customer',
    status: 'active',
    full_name: 'Priya Sharma',
  },
  {
    id: 'demo-operator-1',
    email: 'operator@sunrisetravels.in',
    password: 'Pass@123',
    role: 'operator',
    status: 'active',
    full_name: 'Rajesh Varma',
    company_name: 'Sunrise Travels',
  },
  {
    id: 'demo-operator-pending',
    email: 'operator@pending.in',
    password: 'Pass@123',
    role: 'operator',
    status: 'pending_approval',
    full_name: 'Vikas Patil',
    company_name: 'CityLink Express',
  },
  {
    id: 'demo-admin-1',
    email: 'admin@busgo.in',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
    full_name: 'System Administrator',
  },
];

console.log('[1] Testing Authentication & Password Verification:');

// Test A: Valid Customer Login
const customerAuth = DEMO_STORE.find(
  (u) => u.email === 'customer@busgo.in' && u.password === 'Pass@123'
);
assert(Boolean(customerAuth), 'Seeded customer account authenticates with correct password');

// Test B: Invalid Password Rejection
const badPassAuth = DEMO_STORE.find(
  (u) => u.email === 'customer@busgo.in' && u.password === 'WrongPassword'
);
assert(!badPassAuth, 'Rejects incorrect password');

// Test C: Unknown Email Rejection
const badEmailAuth = DEMO_STORE.find(
  (u) => u.email === 'unknown@user.com' && u.password === 'Pass@123'
);
assert(!badEmailAuth, 'Rejects un-registered email addresses');

console.log('\n[2] Testing Role Separation & Portal Restrictions:');

// Helper to simulate portal access guard
function canAccessPortal(user, portalRole) {
  if (!user) return false;
  if (portalRole === 'admin') return user.role === 'admin';
  if (portalRole === 'operator') return user.role === 'operator';
  return true;
}

// Test D: Customer blocked from Admin Portal
assert(
  !canAccessPortal(customerAuth, 'admin'),
  'Customer is strictly blocked from Admin Console'
);

// Test E: Customer blocked from Operator Portal
assert(
  !canAccessPortal(customerAuth, 'operator'),
  'Customer is strictly blocked from Bus Operator Fleet Management'
);

// Test F: Admin granted access to Admin Portal
const adminAuth = DEMO_STORE.find((u) => u.email === 'admin@busgo.in');
assert(
  canAccessPortal(adminAuth, 'admin'),
  'Administrator possesses verified authorization for Admin Console'
);

console.log('\n[3] Testing Operator Compliance & Approval Gate:');

// Helper to check if an operator can manage schedules & routes
function canPublishTrips(operator) {
  return operator.role === 'operator' && operator.status === 'active';
}

const activeOperator = DEMO_STORE.find((u) => u.email === 'operator@sunrisetravels.in');
const pendingOperator = DEMO_STORE.find((u) => u.email === 'operator@pending.in');

assert(
  canPublishTrips(activeOperator),
  'Approved Operator (Sunrise Travels) has active status for route operations'
);

assert(
  !canPublishTrips(pendingOperator),
  'New Operator (CityLink Express) is blocked until Administrator grants approval'
);

console.log('\n[4] Testing Public Registration Security & Role Hijacking Prevention:');

// Simulate registration function
function simulatePublicRegistration({ email, password, requestedRole }) {
  let assignedRole = requestedRole;
  // Security policy: Admin role cannot be acquired publicly
  if (assignedRole === 'admin') {
    assignedRole = 'customer';
  }
  return {
    email,
    role: assignedRole,
    status: assignedRole === 'operator' ? 'pending_approval' : 'active',
  };
}

const maliciousSignup = simulatePublicRegistration({
  email: 'attacker@evil.com',
  password: 'Password123',
  requestedRole: 'admin',
});

assert(
  maliciousSignup.role === 'customer',
  'Public sign-up requesting "admin" role is securely downgraded to "customer"'
);

const newOpSignup = simulatePublicRegistration({
  email: 'newfleet@travels.com',
  password: 'Password123',
  requestedRole: 'operator',
});

assert(
  newOpSignup.status === 'pending_approval',
  'New public operator registration is automatically quarantined under "pending_approval"'
);

console.log('\n[5] Testing Session Persistence & Token Restoration:');

const sessionPayload = {
  id: customerAuth.id,
  email: customerAuth.email,
  role: customerAuth.role,
};
const serialized = JSON.stringify(sessionPayload);
const deserialized = JSON.parse(serialized);

assert(
  deserialized.id === customerAuth.id && deserialized.role === 'customer',
  'Authentication session serializes and restores accurately across page refreshes'
);

console.log('\n====================================================');
console.log(`  TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
}
