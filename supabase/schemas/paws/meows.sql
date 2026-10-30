create table "paws"."meows" (
  "key" text primary key,
  "storage_path" text not null,
  "text" text not null,
  "voice" jsonb not null,
  "created_by" uuid references auth.users on delete set null,
  "report_count" integer not null default 0,
  "blocked" boolean not null default false,
  "created_at" timestamptz not null default now()
);

alter table "paws"."meows" enable row level security;
revoke all on table "paws"."meows" from public, "anon", "authenticated";
grant all on table "paws"."meows" to "service_role";
