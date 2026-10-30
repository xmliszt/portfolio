create or replace function "paws"."release_credits"(p_day date, p_amount integer)
returns void
language sql
security definer
set search_path = ''
as $$
  update paws.daily_credits
  set credits = greatest(credits - p_amount, 0)
  where day = p_day;
$$;

revoke execute on function "paws"."release_credits"(date, integer) from public, "anon", "authenticated";
grant execute on function "paws"."release_credits"(date, integer) to "service_role";
