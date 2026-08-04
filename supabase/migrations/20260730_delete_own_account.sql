-- Apple App Store Guideline 5.1.1(v): account deletion must remove the auth user
-- and associated app data. Call via supabase.rpc('delete_own_account').

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.user_daily_activity where user_id = uid;
  delete from public.user_word_progress where user_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
