/**
 * Creates / repairs the QA test customer account.
 *
 * The test account is OTP-ONLY. It deliberately has no known password.
 * The 123456 code is served by Supabase's server-side test-number feature:
 *   Authentication → Providers → Phone → "Test Phone Numbers and OTPs"
 *   Value: 919876543210=123456      (no +, no spaces, no dashes)
 *
 * Do NOT re-add a password here. The old `testpassword123` shipped as a readable
 * string in the release APK and allowed anyone to sign in as this real,
 * phone-confirmed production user. It has been rotated to a random value.
 *
 * Usage (service-role key is read from the environment, never hardcoded):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node create_test_user.js
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
    'Never hardcode the service-role key — it bypasses all row-level security.'
  );
  process.exit(1);
}

const TEST_PHONE = '+919876543210';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    phone: TEST_PHONE,
    phone_confirm: true,
    user_metadata: { name: 'Test Customer' },
  });

  if (!error) {
    console.log('Test user created:', data.user.id);
    console.log('Sign in with OTP 123456 (configured in the Supabase dashboard).');
    return;
  }

  if (error.message.includes('already exists')) {
    // GoTrue stores phone numbers without the leading "+".
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find((u) => u.phone === TEST_PHONE.replace('+', ''));
    if (user) {
      await supabase.auth.admin.updateUserById(user.id, { phone_confirm: true });
      console.log('Test user already exists; phone confirmed. No password set (OTP-only).');
    } else {
      console.error('User reported as existing but was not found in the list.');
      process.exit(1);
    }
    return;
  }

  console.error('Error creating user:', error);
  process.exit(1);
}

main();
