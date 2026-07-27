-- Run in Supabase SQL Editor
-- Tracks which slang words each user has seen in Slang Drop.

create table if not exists public.user_word_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  word_id uuid not null references public.slang_words(id) on delete cascade,
  seen_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

alter table public.user_word_progress enable row level security;

drop policy if exists "Users can select own word progress" on public.user_word_progress;
drop policy if exists "Users can insert own word progress" on public.user_word_progress;
drop policy if exists "Users can update own word progress" on public.user_word_progress;

create policy "Users can select own word progress"
  on public.user_word_progress
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own word progress"
  on public.user_word_progress
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own word progress"
  on public.user_word_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
