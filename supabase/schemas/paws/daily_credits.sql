create table "paws"."daily_credits" (
  "day" date primary key,
  "credits" integer not null default 0
);

alter table "paws"."daily_credits" enable row level security;
revoke all on table "paws"."daily_credits" from public, "anon", "authenticated";
grant all on table "paws"."daily_credits" to "service_role";
