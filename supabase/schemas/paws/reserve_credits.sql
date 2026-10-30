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

revoke execute on function "paws"."reserve_credits"(date, integer, integer) from public, "anon", "authenticated";
grant execute on function "paws"."reserve_credits"(date, integer, integer) to "service_role";
