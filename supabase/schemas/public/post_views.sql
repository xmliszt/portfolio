create table "public"."post_views" (
  "slug" text not null,
  "view" bigint not null default 0
);

alter table "public"."post_views" add constraint "post_views_pkey" primary key ("slug");
alter table "public"."post_views" enable row level security;
