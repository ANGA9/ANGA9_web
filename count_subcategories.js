require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function countSubcategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, parent_id');

  if (error) {
    console.error("Error:", error);
  } else {
    const total = data.length;
    const categories = data.filter(c => !c.parent_id).length;
    const subcategories = data.filter(c => c.parent_id).length;
    console.log(`Total categories table rows: ${total}`);
    console.log(`Main Categories (parent_id is null): ${categories}`);
    console.log(`Subcategories (parent_id is not null): ${subcategories}`);
  }
}

countSubcategories();
