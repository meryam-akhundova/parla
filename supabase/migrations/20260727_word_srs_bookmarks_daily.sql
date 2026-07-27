-- Spaced repetition + bookmarks on word progress, and daily lesson activity for home.

alter table public.user_word_progress
  add column if not exists correct_count int not null default 0,
  add column if not exists wrong_count int not null default 0,
  add column if not exists ease_factor real not null default 2.5,
  add column if not exists interval_days real not null default 0,
  add column if not exists repetitions int not null default 0,
  add column if not exists due_at timestamptz default now(),
  add column if not exists bookmarked boolean not null default false,
  add column if not exists bookmarked_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- Backfill: seen words without a due date become reviewable soon
update public.user_word_progress
set due_at = coalesce(due_at, seen_at, now())
where due_at is null;

create table if not exists public.user_daily_activity (
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null,
  slang_done int not null default 0,
  vibe_done int not null default 0,
  ear_done int not null default 0,
  primary key (user_id, activity_date)
);

alter table public.user_daily_activity enable row level security;

drop policy if exists "Users can select own daily activity" on public.user_daily_activity;
drop policy if exists "Users can insert own daily activity" on public.user_daily_activity;
drop policy if exists "Users can update own daily activity" on public.user_daily_activity;

create policy "Users can select own daily activity"
  on public.user_daily_activity
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily activity"
  on public.user_daily_activity
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily activity"
  on public.user_daily_activity
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
