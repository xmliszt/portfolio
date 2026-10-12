create table "portfolio"."ratings" (
  "id" text not null,
  "positive_rating" bigint default 0,
  "negative_rating" bigint default 0,
  "comment" text
);

alter table "portfolio"."ratings" add constraint "ratings_pkey" primary key ("id");
alter table "portfolio"."ratings" enable row level security;

grant all on table "portfolio"."ratings" to "anon", "authenticated", "service_role";
