require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkMissing() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .is('image_url', null);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`FOUND ${data.length} MISSING IMAGES IN DB:`);
    console.table(data);
  }
}

checkMissing();
