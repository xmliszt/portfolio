#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const dir = path.join(__dirname, '..', 'supabase', 'storage', 'photos');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_DB_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function run() {
  if (!fs.existsSync(dir)) {
    console.error('Photos directory not found:', dir);
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile());
  if (files.length === 0) {
    console.log('No files to upload in', dir);
    return;
  }

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileBuffer = fs.readFileSync(filePath);
    console.log('Uploading', file);
    const { data, error } = await supabase.storage.from('photos').upload(file, fileBuffer, { upsert: true });
    if (error) {
      console.error('Upload failed for', file, error);
    } else {
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(file);
      console.log('Uploaded', file, '->', urlData.publicUrl);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
