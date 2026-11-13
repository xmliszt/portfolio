create table "laundro_cafe"."book_votes" (
  "book_id" bigint not null,
  "visitor_id" uuid not null,
  "created_at" timestamp with time zone not null default now()
);

alter table "laundro_cafe"."book_votes" add constraint "book_votes_pkey" primary key ("book_id", "visitor_id");
alter table "laundro_cafe"."book_votes" add constraint "book_votes_book_id_fkey" foreign key ("book_id") references "laundro_cafe"."books"("id") on delete cascade;

create index "book_votes_visitor_id_idx" on "laundro_cafe"."book_votes" using btree ("visitor_id");

alter table "laundro_cafe"."book_votes" enable row level security;

grant all on table "laundro_cafe"."book_votes" to "service_role";

create trigger "book_votes_count"
  after insert or delete on "laundro_cafe"."book_votes"
  for each row execute function "laundro_cafe"."count_book_vote"();
