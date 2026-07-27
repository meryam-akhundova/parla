-- Run in Supabase SQL Editor (or supabase db query --linked)
-- Enrolled languages list; profiles.language stays the active one.
-- Users start with one language and can add more later from Profile.

alter table public.profiles
  add column if not exists languages text[] not null default '{}';

update public.profiles
set languages = array[coalesce(nullif(trim(language), ''), 'turkish')]
where cardinality(languages) = 0;
