alter table "laundro_cafe"."tips"
  add column "email" text check (char_length("email") <= 320);

drop function "laundro_cafe"."fulfill_tip"(text, integer, text);

create function "laundro_cafe"."fulfill_tip"(
  "p_session_id" text,
  "p_amount_cents" integer,
  "p_token_hash" text,
  "p_email" text default null
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

  insert into laundro_cafe.tips ("number", session_id, amount_cents, token_hash, email)
  select coalesce(max("number"), 0) + 1, p_session_id, p_amount_cents, p_token_hash, p_email
  from laundro_cafe.tips
  returning * into v_tip;

  return v_tip;
end;
$$;

revoke execute on function "laundro_cafe"."fulfill_tip"(text, integer, text, text) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."fulfill_tip"(text, integer, text, text) to "service_role";
