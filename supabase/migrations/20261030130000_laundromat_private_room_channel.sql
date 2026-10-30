create policy "laundromat room visitors receive"
on "realtime"."messages"
for select
to "anon", "authenticated"
using (
  (select realtime.topic()) = 'laundromat:room'
  and "realtime"."messages"."extension" in ('broadcast', 'presence')
);

create policy "laundromat room visitors send"
on "realtime"."messages"
for insert
to "anon", "authenticated"
with check (
  (select realtime.topic()) = 'laundromat:room'
  and "realtime"."messages"."extension" in ('broadcast', 'presence')
);
