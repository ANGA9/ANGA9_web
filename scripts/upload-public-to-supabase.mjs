import { createClient } from '@supabase/supabase-js';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'public-assets';
const PUBLIC_DIR = join(__dirname, '..', 'public');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets.find((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" exists.`);
    return;
  }
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: '20MB',
  });
  if (createErr) throw createErr;
  console.log(`Created public bucket "${BUCKET}".`);
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function uploadFile(absPath) {
  const rel = relative(PUBLIC_DIR, absPath).split(sep).join('/');
  const ext = extname(absPath).toLowerCase();
  const contentType = MIME[ext];
  if (!contentType) {
    return { rel, status: 'skipped', reason: `unsupported ext ${ext}` };
  }
  const body = await readFile(absPath);
  const { error } = await supabase.storage.from(BUCKET).upload(rel, body, {
    contentType,
    upsert: true,
    cacheControl: '31536000',
  });
  if (error) return { rel, status: 'error', reason: error.message };
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(rel);
  return { rel, status: 'ok', url: data.publicUrl };
}

async function main() {
  await ensureBucket();
  const files = [];
  for await (const f of walk(PUBLIC_DIR)) files.push(f);
  console.log(`Found ${files.length} files in public/. Uploading...`);

  const results = [];
  const concurrency = 6;
  let idx = 0;
  async function worker() {
    while (idx < files.length) {
      const i = idx++;
      const r = await uploadFile(files[i]);
      results.push(r);
      const tag = r.status === 'ok' ? 'OK ' : r.status === 'skipped' ? 'SKIP' : 'ERR';
      console.log(`[${tag}] ${r.rel}${r.reason ? ' - ' + r.reason : ''}`);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));

  const ok = results.filter((r) => r.status === 'ok').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const errors = results.filter((r) => r.status === 'error');
  console.log(`\nDone. ok=${ok} skipped=${skipped} errors=${errors.length}`);
  if (errors.length) {
    console.log('Errors:');
    for (const e of errors) console.log(`  ${e.rel}: ${e.reason}`);
    process.exit(1);
  }
  console.log(`\nPublic URL base: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
