require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: categories } = await supabase.from('categories').select('id, name, parent_id');
  const mains = categories.filter(c => !c.parent_id);
  console.log("Main Categories:", mains.map(c => c.name));
  
  if (mains.length > 0) {
    const subs = categories.filter(c => c.parent_id === mains[0].id);
    console.log(`Subs for ${mains[0].name}:`, subs.map(c => c.name));
  }
}

run();
