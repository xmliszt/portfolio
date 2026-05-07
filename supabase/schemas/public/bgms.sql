CREATE TABLE IF NOT EXISTS "public"."bgms" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "artist" "text" NOT NULL,
    "external_url" "text" NOT NULL
);

alter table "public"."bgms" add constraint "bgms_pkey" primary key ("id");
alter table "public"."bgms" enable row level security;
