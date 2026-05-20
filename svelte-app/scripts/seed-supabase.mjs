/**
 * Full replace of public/questions from public/questions.json.
 *
 * Requires in svelte-app/.env: SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL (or SUPABASE_URL).
 *
 *   npm run import:questions   # CSV → questions.json (run first when CSV changes)
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
  auth: { persistSession: false, autoRefreshToken: false },
})

const topicMap = new Map(topics.map((t) => [t.key, t.label]))

const questionPayload = questions.map((q) => ({
  id: q.id,
  topic_key: q.topicKey,
  topic_label: topicMap.get(q.topicKey) ?? q.topicKey,
  text: q.text,
  option_1: q.options[0],
  option_2: q.options[1],
  option_3: q.options[2],
  option_4: q.options[3],
  correct_index: q.correctIndex,
  explanation: q.explanation ?? '',
  time_limit_seconds: q.timeLimitSeconds ?? 25,
}))

const { error: delErr } = await supabase.from('questions').delete().neq('id', '')
if (delErr) {
  console.error('questions delete:', delErr.message)
  process.exit(1)
}
console.log('Cleared existing questions.')

const chunk = 200
for (let i = 0; i < questionPayload.length; i += chunk) {
  const slice = questionPayload.slice(i, i + chunk)
  const { error: insErr } = await supabase.from('questions').insert(slice)
  if (insErr) {
    console.error('questions insert:', insErr.message)
    process.exit(1)
  }
  console.log(`Inserted questions ${i + 1}–${i + slice.length} of ${questionPayload.length}`)
}

console.log('Done. Questions:', questionPayload.length)
