require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const imagesToUpload = [
  { slug: 'womenswear-gowns', file: 'evening_gowns_icon_1782285486610.png' },
  { slug: 'bedding-bed-sheets', file: 'bedsheets_icon_1782237221905.png' },
  { slug: 'bath-linen-bath-towels', file: 'towels_icon_1782237254763.png' }
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
