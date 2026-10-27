create function "laundro_cafe"."record_visit"(
  "p_visitor_id" uuid,
  "p_locale" text,
  "p_country" text default null,
  "p_referrer_host" text default null,
  "p_legacy_visitor_id" uuid default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into laundro_cafe.visits as v (visitor_id, visited_on, visit_count, locale, country, referrer_host, first_seen_at, last_seen_at)
  select p_visitor_id, visited_on, visit_count, locale, country, referrer_host, first_seen_at, last_seen_at
  from laundro_cafe.visits
  where visitor_id = p_legacy_visitor_id and p_legacy_visitor_id <> p_visitor_id
  on conflict (visitor_id, visited_on) do update
  set visit_count = v.visit_count + excluded.visit_count,
    locale = case when excluded.first_seen_at < v.first_seen_at then excluded.locale else v.locale end,
    country = case when excluded.first_seen_at < v.first_seen_at then excluded.country else v.country end,
    referrer_host = case when excluded.first_seen_at < v.first_seen_at then excluded.referrer_host else v.referrer_host end,
    first_seen_at = least(v.first_seen_at, excluded.first_seen_at),
    last_seen_at = greatest(v.last_seen_at, excluded.last_seen_at);

  delete from laundro_cafe.visits
  where visitor_id = p_legacy_visitor_id and p_legacy_visitor_id <> p_visitor_id;

  insert into laundro_cafe.visits as v (visitor_id, visited_on, locale, country, referrer_host)
  values (p_visitor_id, (now() at time zone 'utc')::date, p_locale, p_country, p_referrer_host)
  on conflict (visitor_id, visited_on) do update
  set visit_count = v.visit_count + 1, last_seen_at = now();
$$;

revoke execute on function "laundro_cafe"."record_visit"(uuid, text, text, text, uuid) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."record_visit"(uuid, text, text, text, uuid) to "service_role";
