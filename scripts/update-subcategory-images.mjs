import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const BASE_URL = 'https://plfaugkadavxenpqawzw.supabase.co/storage/v1/object/public/public-assets/categories/';

const updates = {
  "menswear-chinos": "chinos_icon.png",
  "womenswear-bodysuits": "bodysuits_icon.png",
  "womenswear-culottes": "culottes_icon.png",
  "womenswear-kimonos": "kimonos_icon.png",
  "womenswear-abayas": "abayas_icon.png",
  "womenswear-nightgowns": "nightgowns_icon.png",
  "kids-infants-graphic-tees": "graphic_tees_icon.png",
  "kids-infants-denim": "denim_icon.png",
  "kids-infants-school-uniforms": "school_uniforms_icon.png",
  "kids-infants-frocks": "frocks_icon.png",
  "kids-infants-leggings": "kids_leggings_icon.png",
  "kids-infants-tutus": "tutus_icon.png",
  "kids-infants-hair-accessories": "hair_accessories_icon.png",
  "kids-infants-onesies": "onesies_icon.png",
  "kids-infants-sleepsuits": "sleepsuits_icon.png",
  "kids-infants-bibs": "bibs_icon.png"
};

async function run() {
  console.log("Updating database records...");
  for (const [slug, filename] of Object.entries(updates)) {
    const imageUrl = BASE_URL + filename;
    const { data, error } = await supabase
      .from('categories')
      .update({ image_url: imageUrl })
      .eq('slug', slug);

    if (error) {
      console.error(`Error updating ${slug}:`, error.message);
    } else {
      console.log(`Updated ${slug} -> ${filename}`);
    }
  }
  console.log("Done.");
}

run();
