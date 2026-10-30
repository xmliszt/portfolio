drop policy "paws room players send" on "realtime"."messages";
drop policy "paws room guests never send" on "realtime"."messages";

create policy "paws room members send"
on "realtime"."messages"
for insert
to "authenticated"
with check (
  (select realtime.topic()) like 'paws:room:%'
  and "realtime"."messages"."extension" in ('broadcast', 'presence')
  and (select paws.room_role((select realtime.topic()))) is not null
);
