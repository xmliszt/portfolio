drop extension if exists "pg_net";


  create table "public"."bgms" (
    "id" text not null,
    "title" text not null,
    "artist" text not null,
    "external_url" text not null
      );


alter table "public"."bgms" enable row level security;


  create table "public"."post_views" (
    "slug" text not null,
    "view" bigint not null default 0
      );


alter table "public"."post_views" enable row level security;


  create table "public"."ratings" (
    "id" text not null,
    "positive_rating" bigint default 0,
    "negative_rating" bigint default 0,
    "comment" text
      );


alter table "public"."ratings" enable row level security;

CREATE UNIQUE INDEX bgms_pkey ON public.bgms USING btree (id);

CREATE UNIQUE INDEX post_views_pkey ON public.post_views USING btree (slug);

CREATE UNIQUE INDEX ratings_pkey ON public.ratings USING btree (id);

alter table "public"."bgms" add constraint "bgms_pkey" PRIMARY KEY using index "bgms_pkey";

alter table "public"."post_views" add constraint "post_views_pkey" PRIMARY KEY using index "post_views_pkey";

alter table "public"."ratings" add constraint "ratings_pkey" PRIMARY KEY using index "ratings_pkey";

grant delete on table "public"."bgms" to "anon";

grant insert on table "public"."bgms" to "anon";

grant references on table "public"."bgms" to "anon";

grant select on table "public"."bgms" to "anon";

grant trigger on table "public"."bgms" to "anon";

grant truncate on table "public"."bgms" to "anon";

grant update on table "public"."bgms" to "anon";

grant delete on table "public"."bgms" to "authenticated";

grant insert on table "public"."bgms" to "authenticated";

grant references on table "public"."bgms" to "authenticated";

grant select on table "public"."bgms" to "authenticated";

grant trigger on table "public"."bgms" to "authenticated";

grant truncate on table "public"."bgms" to "authenticated";

grant update on table "public"."bgms" to "authenticated";

grant delete on table "public"."bgms" to "service_role";

grant insert on table "public"."bgms" to "service_role";

grant references on table "public"."bgms" to "service_role";

grant select on table "public"."bgms" to "service_role";

grant trigger on table "public"."bgms" to "service_role";

grant truncate on table "public"."bgms" to "service_role";

grant update on table "public"."bgms" to "service_role";

grant delete on table "public"."post_views" to "anon";

grant insert on table "public"."post_views" to "anon";

grant references on table "public"."post_views" to "anon";

grant select on table "public"."post_views" to "anon";

grant trigger on table "public"."post_views" to "anon";

grant truncate on table "public"."post_views" to "anon";

grant update on table "public"."post_views" to "anon";

grant delete on table "public"."post_views" to "authenticated";

grant insert on table "public"."post_views" to "authenticated";

grant references on table "public"."post_views" to "authenticated";

grant select on table "public"."post_views" to "authenticated";

grant trigger on table "public"."post_views" to "authenticated";

grant truncate on table "public"."post_views" to "authenticated";

grant update on table "public"."post_views" to "authenticated";

grant delete on table "public"."post_views" to "service_role";

grant insert on table "public"."post_views" to "service_role";

grant references on table "public"."post_views" to "service_role";

grant select on table "public"."post_views" to "service_role";

grant trigger on table "public"."post_views" to "service_role";

grant truncate on table "public"."post_views" to "service_role";

grant update on table "public"."post_views" to "service_role";

grant delete on table "public"."ratings" to "anon";

grant insert on table "public"."ratings" to "anon";

grant references on table "public"."ratings" to "anon";

grant select on table "public"."ratings" to "anon";

grant trigger on table "public"."ratings" to "anon";

grant truncate on table "public"."ratings" to "anon";

grant update on table "public"."ratings" to "anon";

grant delete on table "public"."ratings" to "authenticated";

grant insert on table "public"."ratings" to "authenticated";

grant references on table "public"."ratings" to "authenticated";

grant select on table "public"."ratings" to "authenticated";

grant trigger on table "public"."ratings" to "authenticated";

grant truncate on table "public"."ratings" to "authenticated";

grant update on table "public"."ratings" to "authenticated";

grant delete on table "public"."ratings" to "service_role";

grant insert on table "public"."ratings" to "service_role";

grant references on table "public"."ratings" to "service_role";

grant select on table "public"."ratings" to "service_role";

grant trigger on table "public"."ratings" to "service_role";

grant truncate on table "public"."ratings" to "service_role";

grant update on table "public"."ratings" to "service_role";


