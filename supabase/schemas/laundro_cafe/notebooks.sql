create table "laundro_cafe"."notebooks" (
  "id" bigint generated always as identity not null,
  "number" integer not null,
  "page_count" integer not null default 48,
  "lines_per_page" integer not null default 24,
  "lines_used" integer not null default 0,
  "started_at" timestamp with time zone not null default now(),
  "filled_at" timestamp with time zone
);

alter table "laundro_cafe"."notebooks" add constraint "notebooks_pkey" primary key ("id");
alter table "laundro_cafe"."notebooks" add constraint "notebooks_number_key" unique ("number");
alter table "laundro_cafe"."notebooks" add constraint "notebooks_number_check" check ("number" > 0);
alter table "laundro_cafe"."notebooks" add constraint "notebooks_page_count_check" check ("page_count" > 0);
alter table "laundro_cafe"."notebooks" add constraint "notebooks_lines_per_page_check" check ("lines_per_page" > 0);
alter table "laundro_cafe"."notebooks" add constraint "notebooks_lines_used_check" check ("lines_used" between 0 and "page_count" * "lines_per_page");
create unique index "notebooks_single_current_idx" on "laundro_cafe"."notebooks" using btree ((true)) where "filled_at" is null;
alter table "laundro_cafe"."notebooks" enable row level security;

grant all on table "laundro_cafe"."notebooks" to "service_role";
grant select on table "laundro_cafe"."notebooks" to "anon", "authenticated";

create policy "Notebooks are readable by everyone"
  on "laundro_cafe"."notebooks"
  for select
  to "anon", "authenticated"
  using (true);
