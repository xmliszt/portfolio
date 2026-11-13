create or replace function "laundro_cafe"."latest_visible_book_notes"("p_book_ids" bigint[])
returns setof "laundro_cafe"."book_notes"
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (book_id) *
  from laundro_cafe.book_notes
  where book_id = any (p_book_ids) and hidden_at is null
  order by book_id, created_at desc, id desc;
$$;

revoke execute on function "laundro_cafe"."latest_visible_book_notes"(bigint[]) from public, "anon", "authenticated";
grant execute on function "laundro_cafe"."latest_visible_book_notes"(bigint[]) to "service_role";
