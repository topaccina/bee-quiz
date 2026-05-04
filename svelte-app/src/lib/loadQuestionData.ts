import { createClient } from '@supabase/supabase-js'
import type { QuestionData } from '../quizTypes'

type TopicRow = { key: string; label: string }
type QuestionRow = {
  id: string
  text: string
  options: unknown
  correct_index: number
  topic_key: string
  explanation: string
  time_limit_seconds: number | null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === 'string')
}

async function loadFromSupabase(url: string, anonKey: string): Promise<QuestionData> {
  const supabase = createClient(url, anonKey)

  const { data: topicRows, error: topicErr } = await supabase
    .from('topics')
    .select('key, label')
    .order('key', { ascending: true })

  if (topicErr) {
    throw new Error(`Supabase topics: ${topicErr.message}`)
  }

  const { data: questionRows, error: qErr } = await supabase
    .from('questions')
    .select('id, text, options, correct_index, topic_key, explanation, time_limit_seconds')
    .order('sort_index', { ascending: true })
    .order('id', { ascending: true })

  if (qErr) {
    throw new Error(`Supabase questions: ${qErr.message}`)
  }

  const topics = (topicRows ?? []) as TopicRow[]
  const rawQs = (questionRows ?? []) as QuestionRow[]

  const questions = rawQs.map((row) => {
    if (!isStringArray(row.options) || row.options.length !== 4) {
      throw new Error(`Question ${row.id}: options must be an array of 4 strings`)
    }
    const q = {
      id: row.id,
      text: row.text,
      options: row.options,
      correctIndex: row.correct_index,
      topicKey: row.topic_key,
      explanation: row.explanation,
      ...(row.time_limit_seconds != null
        ? { timeLimitSeconds: row.time_limit_seconds }
        : {})
    }
    return q
  })

  return { topics, questions }
}

async function loadFromStaticJson(): Promise<QuestionData> {
  const res = await fetch('/questions.json')
  if (!res.ok) {
    throw new Error(`Failed to load questions.json (${res.status})`)
  }
  return (await res.json()) as QuestionData
}

/**
 * Loads quiz payload: Supabase when VITE_SUPABASE_* is set (e.g. on Netlify), otherwise static `public/questions.json`.
 */
export async function loadQuestionData(): Promise<QuestionData> {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (url && anonKey) {
    return loadFromSupabase(url, anonKey)
  }
  return loadFromStaticJson()
}
