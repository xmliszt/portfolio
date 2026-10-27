create table "laundro_cafe"."visits" (
  "visitor_id" uuid not null,
  "visited_on" date not null,
  "visit_count" integer not null default 1 check ("visit_count" >= 1),
  "locale" text not null check ("locale" ~ '^[a-z]{2}(-[A-Za-z]{2,4})?$'),
  "country" text check ("country" ~ '^[A-Z]{2}$'),
  "referrer_host" text check (char_length("referrer_host") between 1 and 253),
  "first_seen_at" timestamp with time zone not null default now(),
  "last_seen_at" timestamp with time zone not null default now(),
  primary key ("visitor_id", "visited_on")
);

create index "visits_visited_on_idx" on "laundro_cafe"."visits" ("visited_on");

alter table "laundro_cafe"."visits" enable row level security;
revoke all on table "laundro_cafe"."visits" from public, "anon", "authenticated";
grant select, insert, update, delete on table "laundro_cafe"."visits" to "service_role";
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
