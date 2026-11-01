create table "command_center"."post_metrics" (
  "id" bigint generated always as identity primary key,
  "post_id" uuid not null references "command_center"."posts" ("id") on delete cascade,
  "checkpoint" text not null check ("checkpoint" in ('1h', '24h', '7d', 'extra')),
  "captured_at" timestamptz not null default now(),
  "views" integer,
  "likes" integer,
  "comments" integer,
  "shares" integer,
  "saves" integer,
  "clicks" integer,
  "upvotes" integer,
  "rank" integer
);

create index "post_metrics_post_id_captured_at_idx" on "command_center"."post_metrics" ("post_id", "captured_at");

alter table "command_center"."post_metrics" enable row level security;
revoke all on table "command_center"."post_metrics" from public, "anon", "authenticated";
grant all on table "command_center"."post_metrics" to "service_role";
