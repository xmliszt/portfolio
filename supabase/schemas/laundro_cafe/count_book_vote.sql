create or replace function "laundro_cafe"."count_book_vote"()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update laundro_cafe.books set vote_count = vote_count + 1 where id = new.book_id;
    return new;
  end if;
  update laundro_cafe.books set vote_count = greatest(vote_count - 1, 0) where id = old.book_id;
  return old;
end;
$$;

revoke execute on function "laundro_cafe"."count_book_vote"() from public, "anon", "authenticated";
