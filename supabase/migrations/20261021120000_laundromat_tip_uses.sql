alter table "laundro_cafe"."tips"
  add column "uses" integer not null default 1 check ("uses" between 1 and 15);

create table "laundro_cafe"."tip_spends" (
  "attempt" uuid primary key,
  "tip_number" integer not null references "laundro_cafe"."tips" ("number"),
  "machine_id" text,
  "spent_at" timestamptz not null default now()
);

create index "tip_spends_tip_number_idx" on "laundro_cafe"."tip_spends" ("tip_number");

alter table "laundro_cafe"."tip_spends" enable row level security;

revoke all on table "laundro_cafe"."tip_spends" from "anon", "authenticated";
grant select, insert on table "laundro_cafe"."tip_spends" to "service_role";

insert into "laundro_cafe"."tip_spends" ("attempt", "tip_number", "machine_id", "spent_at")
select coalesce("spent_attempt", gen_random_uuid()), "number", "spent_machine_id", "spent_at"
from "laundro_cafe"."tips"
where "spent_at" is not null;

drop function "laundro_cafe"."fulfill_tip"(text, integer, text, text);

create function "laundro_cafe"."fulfill_tip"(
  "p_session_id" text,
  "p_amount_cents" integer,
  "p_token_hash" text,
  "p_email" text default null,
  "p_uses" integer default 1
)
returns "laundro_cafe"."tips"
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tip laundro_cafe.tips;
begin
  update laundro_cafe.tips
  set email = p_email
  where session_id = p_session_id and email is null and p_email is not null
  returning * into v_tip;
  if found then
    return v_tip;
  end if;

  select * into v_tip from laundro_cafe.tips where session_id = p_session_id;
  if found then
    return v_tip;
  end if;

  perform pg_advisory_xact_lock(hashtext('laundro_cafe.tips'));

  select * into v_tip from laundro_cafe.tips where session_id = p_session_id;
  if found then
    return v_tip;
  end if;

  insert into laundro_cafe.tips ("number", session_id, amount_cents, token_hash, email, uses)
  select coalesce(max("number"), 0) + 1, p_session_id, p_amount_cents, p_token_hash, p_email, p_uses
  from laundro_cafe.tips
  returning * into v_tip;

  return v_tip;
end;
$$;

revoke execute on function "laundro_cafe"."fulfill_tip"(text, integer, text, text, integer) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."fulfill_tip"(text, integer, text, text, integer) to "service_role";

drop function "laundro_cafe"."spend_tip"(text, uuid, text);

-- Also writes the latest spend to `tips.spent_*`, which the build deployed before this migration still reads.
create function "laundro_cafe"."spend_tip"(
  "p_token_hash" text,
  "p_attempt" uuid,
  "p_machine_id" text
)
returns table ("outcome" text, "spent_at" timestamptz, "uses_left" integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tip laundro_cafe.tips;
  v_spend laundro_cafe.tip_spends;
  v_used integer;
begin
  select * into v_tip from laundro_cafe.tips where token_hash = p_token_hash for update;
  if not found then
    return query select 'unknown'::text, null::timestamptz, null::integer;
    return;
  end if;

  select count(*) into v_used from laundro_cafe.tip_spends where tip_number = v_tip.number;

  select * into v_spend from laundro_cafe.tip_spends
  where attempt = p_attempt and tip_number = v_tip.number;
  if found then
    return query select 'spent'::text, v_spend.spent_at, v_tip.uses - v_used;
    return;
  end if;

  if v_used >= v_tip.uses then
    return query
      select 'already-spent'::text, max(s.spent_at), 0
      from laundro_cafe.tip_spends s
      where s.tip_number = v_tip.number;
    return;
  end if;

  insert into laundro_cafe.tip_spends (attempt, tip_number, machine_id)
  values (p_attempt, v_tip.number, p_machine_id)
  returning * into v_spend;

  update laundro_cafe.tips
  set spent_at = v_spend.spent_at, spent_attempt = p_attempt, spent_machine_id = p_machine_id
  where "number" = v_tip.number;

  return query select 'spent'::text, v_spend.spent_at, v_tip.uses - v_used - 1;
end;
$$;

revoke execute on function "laundro_cafe"."spend_tip"(text, uuid, text) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."spend_tip"(text, uuid, text) to "service_role";
