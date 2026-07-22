-- Run in Supabase SQL Editor
alter table public.profiles
  add column if not exists gender text
  check (gender is null or gender in ('female', 'male', 'neutral'));
