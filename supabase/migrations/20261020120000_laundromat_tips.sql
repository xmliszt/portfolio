create table "laundro_cafe"."tips" (
  "number" integer primary key,
  "session_id" text not null unique check ("session_id" like 'cs\_%'),
  "amount_cents" integer not null check ("amount_cents" between 100 and 50000),
  "currency" text not null default 'sgd' check ("currency" = 'sgd'),
  "token_hash" text not null unique check ("token_hash" ~ '^[0-9a-f]{64}$'),
  "created_at" timestamptz not null default now()
);

alter table "laundro_cafe"."tips" enable row level security;

revoke all on table "laundro_cafe"."tips" from "anon", "authenticated";

create function "laundro_cafe"."fulfill_tip"(
  "p_session_id" text,
  "p_amount_cents" integer,
  "p_token_hash" text
)
returns "laundro_cafe"."tips"
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tip laundro_cafe.tips;
begin
  select * into v_tip from laundro_cafe.tips where session_id = p_session_id;
  if found then
    return v_tip;
  end if;

  perform pg_advisory_xact_lock(hashtext('laundro_cafe.tips'));

  select * into v_tip from laundro_cafe.tips where session_id = p_session_id;
  if found then
    return v_tip;
  end if;

  insert into laundro_cafe.tips ("number", session_id, amount_cents, token_hash)
  select coalesce(max("number"), 0) + 1, p_session_id, p_amount_cents, p_token_hash
  from laundro_cafe.tips
  returning * into v_tip;

  return v_tip;
end;
$$;

revoke execute on function "laundro_cafe"."fulfill_tip"(text, integer, text) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."fulfill_tip"(text, integer, text) to "service_role";
