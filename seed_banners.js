require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: sellers, error: sellerErr } = await supabase.from('users').select('id').eq('role', 'seller').limit(3);
  if (sellerErr) {
    console.error('Error fetching sellers:', sellerErr);
    return;
  }
  console.log('Found sellers from users table:', sellers);

  if (!sellers || sellers.length === 0) {
    console.error('No sellers found in the database. Cannot seed ads.');
    return;
  }

  const seller1 = sellers[0]?.id;
  const seller2 = sellers[1]?.id || seller1;
  const seller3 = sellers[2]?.id || seller1;

  let prod1 = null, prod2 = null, prod3 = null;
  const { data: prods } = await supabase.from('products').select('id, seller_id').limit(10);
  if (prods && prods.length > 0) {
    prod1 = prods.find(p => p.seller_id === seller1)?.id || prods[0].id;
    prod2 = prods.find(p => p.seller_id === seller2)?.id || prods[0].id;
    prod3 = prods.find(p => p.seller_id === seller3)?.id || prods[0].id;
  }

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  const banners = [
    {
      seller_id: seller1, product_id: prod1, placement: 'home_hero',
      starts_at: now.toISOString(), ends_at: nextMonth.toISOString(),
      banner_url: '/banners/ban1.png', headline: 'Festive Ethnic Edit - Sarees & Kurtas from ₹999',
      cta_text: 'Shop Now', budget_inr: 5000, approved_fee_inr: 5000, status: 'active', impressions: 0, clicks: 0
    },
    {
      seller_id: seller2, product_id: prod2, placement: 'home_hero',
      starts_at: now.toISOString(), ends_at: nextMonth.toISOString(),
      banner_url: '/banners/ban2.png', headline: 'Elevate Your Style - Menswear from ₹799',
      cta_text: 'Shop Now', budget_inr: 5000, approved_fee_inr: 5000, status: 'active', impressions: 0, clicks: 0
    },
    {
      seller_id: seller3, product_id: prod3, placement: 'home_hero',
      starts_at: now.toISOString(), ends_at: nextMonth.toISOString(),
      banner_url: '/banners/ban3.png', headline: 'Fun Fits for Little Ones - Kids Fashion from ₹299',
      cta_text: 'Shop Now', budget_inr: 5000, approved_fee_inr: 5000, status: 'active', impressions: 0, clicks: 0
    },
    {
      seller_id: seller1, product_id: prod1, placement: 'home_hero',
      starts_at: now.toISOString(), ends_at: nextMonth.toISOString(),
      banner_url: '/banners/ban4.png', headline: 'Train Harder Look Better - Activewear from ₹599',
      cta_text: 'Shop Now', budget_inr: 5000, approved_fee_inr: 5000, status: 'active', impressions: 0, clicks: 0
    },
    {
      seller_id: seller2, product_id: prod2, placement: 'home_hero',
      starts_at: now.toISOString(), ends_at: nextMonth.toISOString(),
      banner_url: '/banners/ban5.png', headline: 'Sleep in Pure Luxury - Bed Linen from ₹899',
      cta_text: 'Shop Now', budget_inr: 5000, approved_fee_inr: 5000, status: 'active', impressions: 0, clicks: 0
    },
    {
      seller_id: seller3, product_id: prod3, placement: 'home_hero',
      starts_at: now.toISOString(), ends_at: nextMonth.toISOString(),
      banner_url: '/banners/ban6.png', headline: 'Spa Comfort at Home - Bath Linen from ₹449',
      cta_text: 'Shop Now', budget_inr: 5000, approved_fee_inr: 5000, status: 'active', impressions: 0, clicks: 0
    },
    {
      seller_id: seller1, product_id: prod1, placement: 'home_hero',
      starts_at: now.toISOString(), ends_at: nextMonth.toISOString(),
      banner_url: '/banners/ban7.png', headline: 'Transform Your Living Space - Rugs & Curtains from ₹1299',
      cta_text: 'Shop Now', budget_inr: 5000, approved_fee_inr: 5000, status: 'active', impressions: 0, clicks: 0
    },
    {
      seller_id: seller2, product_id: prod2, placement: 'home_hero',
      starts_at: now.toISOString(), ends_at: nextMonth.toISOString(),
      banner_url: '/banners/ban8.png', headline: 'Style Every Corner - Living Decor from ₹349',
      cta_text: 'Shop Now', budget_inr: 5000, approved_fee_inr: 5000, status: 'active', impressions: 0, clicks: 0
    }
  ];

  const { data, error } = await supabase.from('ad_campaigns').insert(banners).select();

  if (error) {
    console.error('Error inserting ads:', error);
  } else {
    console.log('Successfully inserted ads:', data.length);
  }
}

main();
