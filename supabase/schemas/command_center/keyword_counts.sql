create table "command_center"."keyword_counts" (
  "keyword_id" uuid not null references "command_center"."keywords" ("id") on delete cascade,
  "day" date not null,
  "source" text not null default 'x',
  "count" integer not null,
  "fetched_at" timestamptz not null default now(),
  primary key ("keyword_id", "day", "source")
);

alter table "command_center"."keyword_counts" enable row level security;
revoke all on table "command_center"."keyword_counts" from public, "anon", "authenticated";
grant all on table "command_center"."keyword_counts" to "service_role";
