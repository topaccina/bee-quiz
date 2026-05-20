-- BeeWise Quiz — Supabase schema (MVP option_1..option_4)
--
-- Setup (once per project):
-- 1. Create a project at https://supabase.com
-- 2. In SQL Editor, paste and run this entire file
-- 3. Project Settings → API: copy Project URL and anon public key
-- 4. In Netlify: Site → Environment variables → add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (same values), then redeploy
-- 5. Import CSV → JSON, then seed: `npm run import:questions` then `npm run seed:supabase` (or `npm run refresh:questions`)

create table if not exists public.questions (
  id text primary key,
  topic_key text not null,
  topic_label text not null,
  text text not null,
  option_1 text not null,
  option_2 text not null,
  option_3 text not null,
  option_4 text not null,
  correct_index smallint not null,
  explanation text not null default '',
  time_limit_seconds integer not null default 25,
  constraint questions_correct_index_range check (correct_index >= 0 and correct_index < 4)
);

create index if not exists questions_topic_key_idx on public.questions (topic_key);

alter table public.questions enable row level security;

drop policy if exists "Public read questions" on public.questions;
create policy "Public read questions"
  on public.questions
  for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies for anon — edit content in Supabase Dashboard (Table Editor)
-- or connect with a role that bypasses RLS (e.g. service role in local seed script only).
