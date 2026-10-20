alter table "laundro_cafe"."tips" add column "spent_machine_id" text;

create index "tips_spent_attempt_idx" on "laundro_cafe"."tips" ("spent_attempt");

drop function "laundro_cafe"."spend_tip"(text, uuid);

create function "laundro_cafe"."spend_tip"(
  "p_token_hash" text,
  "p_attempt" uuid,
  "p_machine_id" text
)
returns table ("outcome" text, "spent_at" timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tip laundro_cafe.tips;
begin
  update laundro_cafe.tips
  set spent_at = now(), spent_attempt = p_attempt, spent_machine_id = p_machine_id
  where token_hash = p_token_hash and tips.spent_at is null
  returning * into v_tip;

  if found then
    return query select 'spent'::text, v_tip.spent_at;
    return;
  end if;

  select * into v_tip from laundro_cafe.tips where token_hash = p_token_hash;

  if not found then
    return query select 'unknown'::text, null::timestamptz;
  elsif v_tip.spent_attempt = p_attempt then
    return query select 'spent'::text, v_tip.spent_at;
  else
    return query select 'already-spent'::text, v_tip.spent_at;
  end if;
end;
$$;

revoke execute on function "laundro_cafe"."spend_tip"(text, uuid, text) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."spend_tip"(text, uuid, text) to "service_role";
