create table if not exists "paws"."meows" (
  "key" text primary key,
  "storage_path" text not null,
  "text" text not null,
  "voice" jsonb not null,
  "created_by" uuid references auth.users on delete set null,
  "report_count" integer not null default 0,
  "blocked" boolean not null default false,
  "created_at" timestamptz not null default now()
);

create table if not exists "paws"."cats" (
  "user_id" uuid primary key references auth.users on delete cascade,
  "look" jsonb not null,
  "voice" jsonb not null,
  "meow_key" text references "paws"."meows" ("key") on delete set null,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create index if not exists "cats_meow_key_idx" on "paws"."cats" using btree ("meow_key");

create table if not exists "paws"."meow_reports" (
  "meow_key" text not null references "paws"."meows" ("key") on delete cascade,
  "reporter_id" uuid not null references auth.users on delete cascade,
  "created_at" timestamptz not null default now(),
  primary key ("meow_key", "reporter_id")
);

create table if not exists "paws"."meow_attempts" (
  "id" bigint generated always as identity primary key,
  "user_id" uuid references auth.users on delete set null,
  "ip_hash" text,
  "outcome" text not null check (
    "outcome" in ('generated', 'reused', 'borrowed', 'refusedByUs', 'refusedByProvider', 'failed')
  ),
  "credits" integer not null default 0,
  "created_at" timestamptz not null default now()
);

create index if not exists "meow_attempts_user_day_idx"
  on "paws"."meow_attempts" using btree ("user_id", "created_at");
create index if not exists "meow_attempts_ip_day_idx"
  on "paws"."meow_attempts" using btree ("ip_hash", "created_at");

create table if not exists "paws"."daily_credits" (
  "day" date primary key,
  "credits" integer not null default 0
);

alter table "paws"."meows" enable row level security;
alter table "paws"."cats" enable row level security;
alter table "paws"."meow_reports" enable row level security;
alter table "paws"."meow_attempts" enable row level security;
alter table "paws"."daily_credits" enable row level security;

create or replace function "paws"."count_meow_report"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update paws.meows
  set
    report_count = report_count + 1,
    blocked = blocked or report_count + 1 >= 2
  where key = new.meow_key;
  return new;
end;
$$;

drop trigger if exists "meow_reports_count" on "paws"."meow_reports";
create trigger "meow_reports_count"
  after insert on "paws"."meow_reports"
  for each row execute function "paws"."count_meow_report"();

create or replace function "paws"."reserve_credits"(p_day date, p_amount integer, p_cap integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_amount > p_cap then
    return false;
  end if;
  insert into paws.daily_credits as existing (day, credits)
  values (p_day, p_amount)
  on conflict (day) do update
    set credits = existing.credits + p_amount
    where existing.credits + p_amount <= p_cap;
  return found;
end;
$$;

create or replace function "paws"."release_credits"(p_day date, p_amount integer)
returns void
language sql
security definer
set search_path = ''
as $$
  update paws.daily_credits
  set credits = greatest(credits - p_amount, 0)
  where day = p_day;
$$;

grant all on table
  "paws"."meows",
  "paws"."cats",
  "paws"."meow_reports",
  "paws"."meow_attempts",
  "paws"."daily_credits"
to "service_role";

revoke all on table
  "paws"."meows",
  "paws"."cats",
  "paws"."meow_reports",
  "paws"."meow_attempts",
  "paws"."daily_credits"
from "anon", "authenticated";

revoke execute on function "paws"."reserve_credits"(date, integer, integer) from public, "anon", "authenticated";
revoke execute on function "paws"."release_credits"(date, integer) from public, "anon", "authenticated";
revoke execute on function "paws"."count_meow_report"() from public, "anon", "authenticated";
grant execute on function "paws"."reserve_credits"(date, integer, integer) to "service_role";
grant execute on function "paws"."release_credits"(date, integer) to "service_role";
