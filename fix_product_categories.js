require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: products } = await supabase.from('products').select('id, name, category_id');
  const { data: categories } = await supabase.from('categories').select('id, name, parent_id');
  const { data: pc } = await supabase.from('product_categories').select('*');

  for (const p of products) {
    let currentCatId = p.category_id;
    if (!currentCatId) {
      const existingPc = pc.find(x => x.product_id === p.id);
      if (existingPc) {
        currentCatId = existingPc.category_id;
      }
    }

    let childCatId = currentCatId;
    let parentCatId = null;

    const currentCat = categories.find(c => c.id === childCatId);
    
    if (currentCat && currentCat.parent_id) {
      parentCatId = currentCat.parent_id;
    } else if (currentCat && !currentCat.parent_id) {
      parentCatId = currentCat.id;
      const possibleChildren = categories.filter(c => c.parent_id === parentCatId);
      if (possibleChildren.length > 0) {
        childCatId = possibleChildren[0].id;
      } else {
        childCatId = null;
      }
    } else {
      // randomly pick Menswear -> T-Shirts (or whatever is first child of Menswear)
      const menswear = categories.find(c => c.name === "Menswear");
      if (menswear) {
        parentCatId = menswear.id;
        const possibleChildren = categories.filter(c => c.parent_id === menswear.id);
        if (possibleChildren.length > 0) {
          childCatId = possibleChildren[0].id;
        }
      }
    }

    if (parentCatId && childCatId) {
      await supabase.from('product_categories').delete().eq('product_id', p.id);
      await supabase.from('product_categories').insert([
        { product_id: p.id, category_id: parentCatId, position: 0 },
        { product_id: p.id, category_id: childCatId, position: 1 }
      ]);
      console.log(`Updated ${p.name}: ${parentCatId} -> ${childCatId}`);
    } else {
      console.log(`Skipping ${p.name}, still no parent/child`);
    }
  }

  console.log("Done updating products!");
}

run();
