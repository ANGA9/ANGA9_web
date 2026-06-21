const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://plfaugkadavxenpqawzw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZmF1Z2thZGF2eGVucHFhd3p3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIzNjY5OCwiZXhwIjoyMDkxODEyNjk4fQ.zjtufWOQ6F41TIoQ5hWoLRs9_2taFB7GCb_OqbpbuwI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    phone: '+919876543210',
    password: 'testpassword123',
    phone_confirm: true,
    user_metadata: {
      name: 'Test Customer'
    }
  });

  if (error) {
    if (error.message.includes('already exists')) {
       console.log('User already exists, updating password...');
       const { data: users } = await supabase.auth.admin.listUsers();
       const user = users.users.find(u => u.phone === '919876543210');
       if (user) {
         await supabase.auth.admin.updateUserById(user.id, { password: 'testpassword123' });
         console.log('Updated existing user password.');
       }
    } else {
       console.error('Error creating user:', error);
    }
  } else {
    console.log('Test user created:', data.user.id);
  }
}

main();
