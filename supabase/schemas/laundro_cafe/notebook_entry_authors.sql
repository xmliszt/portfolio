create table "laundro_cafe"."notebook_entry_authors" (
  "entry_id" bigint not null,
  "visitor_id" uuid not null,
  "created_at" timestamp with time zone not null default now()
);

alter table "laundro_cafe"."notebook_entry_authors" add constraint "notebook_entry_authors_pkey" primary key ("entry_id");
alter table "laundro_cafe"."notebook_entry_authors" add constraint "notebook_entry_authors_entry_id_fkey" foreign key ("entry_id") references "laundro_cafe"."notebook_entries"("id") on delete cascade;
create index "notebook_entry_authors_visitor_id_created_at_idx" on "laundro_cafe"."notebook_entry_authors" using btree ("visitor_id", "created_at" desc);
alter table "laundro_cafe"."notebook_entry_authors" enable row level security;

grant all on table "laundro_cafe"."notebook_entry_authors" to "service_role";
