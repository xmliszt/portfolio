create table "paws"."meow_attempts" (
  "id" bigint generated always as identity primary key,
  "user_id" uuid references auth.users on delete set null,
  "ip_hash" text,
  "outcome" text not null check (
    "outcome" in ('generated', 'reused', 'borrowed', 'refusedByUs', 'refusedByProvider', 'failed')
  ),
  "credits" integer not null default 0,
  "created_at" timestamptz not null default now()
);

create index "meow_attempts_user_day_idx"
  on "paws"."meow_attempts" using btree ("user_id", "created_at");
create index "meow_attempts_ip_day_idx"
  on "paws"."meow_attempts" using btree ("ip_hash", "created_at");

alter table "paws"."meow_attempts" enable row level security;
revoke all on table "paws"."meow_attempts" from public, "anon", "authenticated";
grant all on table "paws"."meow_attempts" to "service_role";
