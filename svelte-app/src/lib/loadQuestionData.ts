import { createClient } from '@supabase/supabase-js'
import type { QuestionData } from '../quizTypes'

type QuestionRow = {
  id: string
  topic_key: string
  topic_label: string
  text: string
  option_1: string
  option_2: string
  option_3: string
  option_4: string
  correct_index: number
  explanation: string
  time_limit_seconds: number | null
}

async function loadFromSupabase(url: string, anonKey: string): Promise<QuestionData> {
  const supabase = createClient(url, anonKey)

  const { data: questionRows, error: qErr } = await supabase
    .from('questions')
    .select(
      'id, topic_key, topic_label, text, option_1, option_2, option_3, option_4, correct_index, explanation, time_limit_seconds',
    )
    .order('id', { ascending: true })

  if (qErr) {
    throw new Error(`Supabase questions: ${qErr.message}`)
  }

  const rawQs = (questionRows ?? []) as QuestionRow[]
  const topicMap = new Map<string, string>()

  const questions = rawQs.map((row) => {
    if (row.correct_index < 0 || row.correct_index > 3) {
      throw new Error(`Question ${row.id}: correct_index must be between 0 and 3`)
    }
    topicMap.set(row.topic_key, row.topic_label)
    const q = {
      id: row.id,
      text: row.text,
      options: [row.option_1, row.option_2, row.option_3, row.option_4],
      correctIndex: row.correct_index,
      topicKey: row.topic_key,
      explanation: row.explanation,
      ...(row.time_limit_seconds != null
        ? { timeLimitSeconds: row.time_limit_seconds }
        : {})
    }
    return q
  })

  const topics = Array.from(topicMap.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.key.localeCompare(b.key))

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
