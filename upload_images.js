require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const imagesToUpload = [
  { slug: 'bedding-euro-shams', file: 'bedding_euro_shams_1782372895918.png' },
  { slug: 'bedding-bed-skirts', file: 'bedding_bed_skirts_1782372907614.png' },
  { slug: 'floor-coverings-area-rugs', file: 'floor_coverings_area_rugs_1782372917901.png' },
  { slug: 'window-treatments-blackout-curtains', file: 'window_treatments_blackout_curtains_1782372928777.png' },
  { slug: 'floor-coverings-runners', file: 'floor_coverings_runners_1782372940882.png' },
  { slug: 'window-treatments-sheers', file: 'window_treatments_sheers_1782372953639.png' },
  { slug: 'window-treatments-cafe-curtains', file: 'window_treatments_cafe_curtains_1782372963987.png' },
  { slug: 'floor-coverings-shag-carpets', file: 'floor_coverings_shag_carpets_1782372974924.png' },
  { slug: 'floor-coverings-persian-rugs', file: 'floor_coverings_persian_rugs_1782373013467.png' },
  { slug: 'window-treatments-roller-blinds', file: 'window_treatments_roller_blinds_1782373022884.png' },
  { slug: 'window-treatments-roman-shades', file: 'window_treatments_roman_shades_1782373034932.png' },
  { slug: 'floor-coverings-bath-mats', file: 'floor_coverings_bath_mats_1782373046914.png' },
  { slug: 'window-treatments-venetian-blinds', file: 'window_treatments_venetian_blinds_1782373058002.png' },
  { slug: 'window-treatments-curtain-rods', file: 'window_treatments_curtain_rods_1782373067342.png' },
  { slug: 'floor-coverings-kitchen-mats', file: 'floor_coverings_kitchen_mats_1782373079152.png' },
  { slug: 'window-treatments-finials', file: 'window_treatments_finials_1782373091047.png' },
  { slug: 'window-treatments-tie-backs', file: 'window_treatments_tie_backs_1782373101809.png' },
  { slug: 'kitchen-textiles-aprons', file: 'kitchen_textiles_aprons_1782373128860.png' }
];

const artifactsDir = path.join(require('os').homedir(), '.gemini', 'antigravity-ide', 'brain', '24689ab6-76c8-4dd5-85ce-7c024e99427c');

async function uploadAll() {
  for (const item of imagesToUpload) {
    const filePath = path.join(artifactsDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.log('Skipping missing file:', item.file);
      continue;
    }
    const buffer = fs.readFileSync(filePath);
    const fileName = `category-${item.slug}-${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from('public-assets')
      .upload(fileName, buffer, { contentType: 'image/png', upsert: true });

    if (error) {
      console.error('Upload error for', item.slug, error);
    } else {
      const publicUrl = supabase.storage.from('public-assets').getPublicUrl(fileName).data.publicUrl;
      console.log(`[x] ${item.slug}: ${publicUrl}`);
      
      // Update DB
      await supabase.from('categories').update({ image_url: publicUrl }).eq('slug', item.slug);
    }
  }
}

uploadAll();
