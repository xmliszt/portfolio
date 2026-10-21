create or replace function "laundro_cafe"."spend_tip"(
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

  return query select 'spent'::text, v_spend.spent_at, v_tip.uses - v_used - 1;
end;
$$;

drop index "laundro_cafe"."tips_spent_attempt_idx";

alter table "laundro_cafe"."tips"
  drop column "spent_at",
  drop column "spent_attempt",
  drop column "spent_machine_id";
