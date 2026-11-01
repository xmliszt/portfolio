alter table "command_center"."campaigns" add column "plan" jsonb not null default '{}';

alter table "command_center"."posts" add column "scheduled_by" text not null default 'user' check ("scheduled_by" in ('user', 'planner'));

alter table "command_center"."posts" add column "wave" smallint;

drop function "command_center"."reschedule_post"(uuid, timestamptz);

create function "command_center"."reschedule_post"("p_post_id" uuid, "p_scheduled_at" timestamptz, "p_scheduled_by" text default 'user')
returns setof "command_center"."posts"
language plpgsql
set search_path = ''
as $$
declare
  v_old timestamptz;
  v_status text;
begin
  select p.scheduled_at, p.status into v_old, v_status
  from command_center.posts p
  where p.id = p_post_id
  for update;
  if not found then
    raise exception 'post % not found', p_post_id;
  end if;
  if v_status = 'posted' then
    raise exception 'A posted post cannot be rescheduled';
  end if;

  return query
  update command_center.posts p
  set
    scheduled_at = case
      when p.id = p_post_id or p.scheduled_at is null or v_old is null then p_scheduled_at
      else p.scheduled_at + (p_scheduled_at - v_old)
    end,
    scheduled_by = case when p.id = p_post_id then p_scheduled_by else p.scheduled_by end,
    status = 'scheduled',
    updated_at = now()
  where p.id = p_post_id
    or (p.parent_post_id = p_post_id and p.kind in ('reply', 'comment') and p.status not in ('posted', 'skipped'))
  returning p.*;
end;
$$;

revoke execute on function "command_center"."reschedule_post"(uuid, timestamptz, text) from public, "anon", "authenticated";
grant execute on function "command_center"."reschedule_post"(uuid, timestamptz, text) to "service_role";
