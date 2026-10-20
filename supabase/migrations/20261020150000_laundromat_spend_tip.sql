alter table "laundro_cafe"."tips" add column "spent_attempt" uuid;

create function "laundro_cafe"."spend_tip"(
  "p_token_hash" text,
  "p_attempt" uuid
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
  set spent_at = now(), spent_attempt = p_attempt
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

revoke execute on function "laundro_cafe"."spend_tip"(text, uuid) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."spend_tip"(text, uuid) to "service_role";
