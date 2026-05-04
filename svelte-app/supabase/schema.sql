-- BeeWise Quiz — Supabase schema
--
-- Setup (once per project):
-- 1. Create a project at https://supabase.com
-- 2. In SQL Editor, paste and run this entire file
-- 3. Project Settings → API: copy Project URL and anon public key
-- 4. In Netlify: Site → Environment variables → add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (same values), then redeploy
-- 5. Seed rows: Table Editor, or from your machine run `npm run seed:supabase` (see .env.example)

create table if not exists public.topics (
  key text primary key,
  label text not null
);

create table if not exists public.questions (
  id text primary key,
  sort_index integer not null default 0,
  text text not null,
  options jsonb not null,
  correct_index integer not null,
  topic_key text not null references public.topics (key) on delete restrict,
  explanation text not null default '',
  time_limit_seconds integer,
  constraint questions_options_is_array check (jsonb_typeof(options) = 'array'),
  constraint questions_options_length check (jsonb_array_length(options) = 4),
  constraint questions_correct_index_range check (correct_index >= 0 and correct_index < 4)
);

create index if not exists questions_sort_index_idx on public.questions (sort_index, id);

alter table public.topics enable row level security;
alter table public.questions enable row level security;

drop policy if exists "Public read topics" on public.topics;
create policy "Public read topics"
  on public.topics
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read questions" on public.questions;
create policy "Public read questions"
  on public.questions
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies for anon — edit content in Supabase Dashboard (Table Editor)
-- or connect with a role that bypasses RLS (e.g. service role in local seed script only).
