create function "laundro_cafe"."record_visit"(
  "p_visitor_id" uuid,
  "p_locale" text,
  "p_country" text default null,
  "p_referrer_host" text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into laundro_cafe.visits as v (visitor_id, visited_on, locale, country, referrer_host)
  values (p_visitor_id, (now() at time zone 'utc')::date, p_locale, p_country, p_referrer_host)
  on conflict (visitor_id, visited_on) do update
  set visit_count = v.visit_count + 1, last_seen_at = now();
$$;

revoke execute on function "laundro_cafe"."record_visit"(uuid, text, text, text) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."record_visit"(uuid, text, text, text) to "service_role";
