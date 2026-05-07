create table "public"."ratings" (
  "id" text not null,
  "positive_rating" bigint default 0,
  "negative_rating" bigint default 0,
  "comment" text
);

alter table "public"."ratings" add constraint "ratings_pkey" primary key ("id");
alter table "public"."ratings" enable row level security;
