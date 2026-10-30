create or replace function "paws"."claim_meow"(p_user_id uuid, p_now timestamptz, p_stale_before timestamptz)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update paws.cats
    set meow_claimed_at = p_now
    where user_id = p_user_id
      and meow_key is null
      and (meow_claimed_at is null or meow_claimed_at < p_stale_before);
  return found;
end;
$$;

revoke execute on function "paws"."claim_meow"(uuid, timestamptz, timestamptz) from public, "anon", "authenticated";
grant execute on function "paws"."claim_meow"(uuid, timestamptz, timestamptz) to "service_role";
