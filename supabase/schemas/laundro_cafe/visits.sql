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
