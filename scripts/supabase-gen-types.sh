#!/usr/bin/env bash

set -euo pipefail

output_file="lib/supabase/__generated__/types.ts"
tmp_file="$(mktemp)"

if supabase gen types typescript --project-id tvstbbuidvwgelgidaqy --schema public >"$tmp_file"; then
  mv "$tmp_file" "$output_file"
  exit 0
fi

rm -f "$tmp_file"
exit 1
