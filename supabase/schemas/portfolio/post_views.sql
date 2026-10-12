create table "portfolio"."post_views" (
  "slug" text not null,
  "view" bigint not null default 0
);

alter table "portfolio"."post_views" add constraint "post_views_pkey" primary key ("slug");
alter table "portfolio"."post_views" enable row level security;

grant all on table "portfolio"."post_views" to "anon", "authenticated", "service_role";
