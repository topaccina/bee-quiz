/**
 * One-time (or repeat) upload of public/questions.json into Supabase.
 *
 * Requires in .env (repo root or cwd): SUPABASE_SERVICE_ROLE_KEY
 * and either VITE_SUPABASE_URL or SUPABASE_URL (project URL).
 *
 *   npm run seed:supabase
 *
 * Run SQL from supabase/schema.sql in the Supabase SQL editor before first seed.
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const jsonPath = join(__dirname, '..', 'public', 'questions.json')

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)?.trim()

if (!url || !serviceKey) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY and/or VITE_SUPABASE_URL (or SUPABASE_URL). See .env.example.',
  )
  process.exit(1)
}

const raw = readFileSync(jsonPath, 'utf8')
const data = JSON.parse(raw)
const { topics, questions } = data

if (!Array.isArray(topics) || !Array.isArray(questions)) {
  console.error('questions.json must have topics and questions arrays')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const topicPayload = topics.map((t) => ({ key: t.key, label: t.label }))
const { error: tErr } = await supabase.from('topics').upsert(topicPayload, {
  onConflict: 'key'
})
if (tErr) {
  console.error('topics upsert:', tErr.message)
  process.exit(1)
}

const questionPayload = questions.map((q, idx) => ({
  id: q.id,
  sort_index: idx,
  text: q.text,
  options: q.options,
  correct_index: q.correctIndex,
  topic_key: q.topicKey,
  explanation: q.explanation ?? '',
  time_limit_seconds: q.timeLimitSeconds ?? null
}))

const chunk = 200
for (let i = 0; i < questionPayload.length; i += chunk) {
  const slice = questionPayload.slice(i, i + chunk)
  const { error: qErr } = await supabase.from('questions').upsert(slice, {
    onConflict: 'id'
  })
  if (qErr) {
    console.error('questions upsert:', qErr.message)
    process.exit(1)
  }
  console.log(`Upserted questions ${i + 1}–${i + slice.length} of ${questionPayload.length}`)
}

console.log('Done. Topics:', topicPayload.length, 'Questions:', questionPayload.length)
