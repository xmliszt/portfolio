create table "portfolio"."bgms" (
    "id" text not null,
    "title" text not null,
    "artist" text not null,
    "external_url" text not null
);

alter table "portfolio"."bgms" add constraint "bgms_pkey" primary key ("id");
alter table "portfolio"."bgms" enable row level security;

grant all on table "portfolio"."bgms" to "anon", "authenticated", "service_role";
