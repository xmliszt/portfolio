#!/usr/bin/env bash
# Helper to create local storage buckets in a linked Supabase project.
# Requires: supabase CLI linked to a project (`supabase link --project-ref <ref>`)

set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "supabase CLI not found. Install: https://supabase.com/docs/guides/cli"
  exit 1
fi

BUCKETS=("photos")

for b in "${BUCKETS[@]}"; do
  echo "Creating bucket: $b (public)"
  if supabase storage create-bucket "$b" --public; then
    echo "Bucket $b created"
  else
    echo "Bucket $b may already exist or creation failed"
  fi
done

# Optional: upload files from local folder if present
LOCAL_DIR="supabase/storage/photos"
if [ -d "$LOCAL_DIR" ]; then
  echo "Uploading files from $LOCAL_DIR to photos bucket..."
  for f in "$LOCAL_DIR"/*; do
    if [ -f "$f" ]; then
      echo "Uploading $f"
      # The supabase CLI may not provide a direct upload command; recommend using the JS client in a small script
      echo "Note: Upload skipped. Use a small Node script with @supabase/supabase-js or the dashboard to upload files."
    fi
  done
fi

echo "Done."
