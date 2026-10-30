#!/usr/bin/env bash

set -euo pipefail

gen_types() {
  local schema="$1"
  local output_file="$2"
  local tmp_file
  tmp_file="$(mktemp)"

  if supabase gen types typescript --project-id tvstbbuidvwgelgidaqy --schema "$schema" >"$tmp_file"; then
    mv "$tmp_file" "$output_file"
    return 0
  fi

  rm -f "$tmp_file"
  return 1
}

gen_types portfolio lib/supabase/__generated__/types.ts
gen_types laundro_cafe lib/laundromat/supabase/__generated__/types.ts
gen_types paws lib/paws/supabase/__generated__/types.ts
