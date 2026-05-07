Photography assets and local upload helper

This document explains how to seed and upload photography placeholder assets to the Supabase `photos` storage bucket for local development.

Files
- `supabase/storage/photos/` — local folder where placeholder images are stored in the repo.
- `scripts/supabase-upload-photos.js` — Node script that uploads all files under `supabase/storage/photos` to the `photos` bucket using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- `scripts/supabase-upload-photos.sh` — convenience shell wrapper.

Usage
1. Link your supabase CLI (optional for uploads via dashboard):
   supabase link --project-ref tvstbbuidvwgelgidaqy

2. Create the photos bucket if needed:
   bash scripts/supabase-create-buckets.sh

3. Upload placeholder images to the linked project:
   export SUPABASE_URL="<your-supabase-url>"
   export SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
   bash scripts/supabase-upload-photos.sh

Notes
- The uploader uses the service role key to perform storage uploads; keep this key secret.
- SVG placeholders are committed to the repo so the photography hobby page renders in local dev without needing dashboard uploads.
- To upload real photos, replace files in `supabase/storage/photos/` and re-run the uploader script.
- If you prefer using the dashboard to upload files, you can skip the uploader step and upload manually.
