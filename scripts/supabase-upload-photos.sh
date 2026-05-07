#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "node not found. Install Node.js to run the uploader script."
  exit 1
fi

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Please export SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script."
  echo "Alternatively, link the CLI with 'supabase link' and use environment variables."
  exit 1
fi

node scripts/supabase-upload-photos.js
