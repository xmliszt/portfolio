-- Realtime policies run as the caller, who cannot read "room_members" through RLS.
create function "paws"."room_role"("p_topic" text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role
  from paws.room_members m
  where p_topic like 'paws:room:%'
    and m.room_id = substr(p_topic, char_length('paws:room:') + 1)
    and m.user_id = (select auth.uid())
    and m.last_seen_at > now() - interval '90 seconds';
$$;

revoke execute on function "paws"."room_role"(text) from public, "anon";
grant execute on function "paws"."room_role"(text) to "authenticated", "service_role";
