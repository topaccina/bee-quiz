/**
 * Converts beewise-quiz-rev_0520.csv (repo root) → public/questions.json
 *
 *   npm run import:questions
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv } from './parse-csv.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const csvPath = join(__dirname, '..', '..', 'beewise-quiz-rev_0520.csv')
const outPath = join(__dirname, '..', 'public', 'questions.json')

const text = readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '')
const rows = parseCsv(text)
const [header, ...dataRows] = rows

const expected = [
  'id',
  'topic_key',
  'topic_label',
  'text',
  'option_1',
  'option_2',
  'option_3',
  'option_4',
  'correct_index',
  'explanation',
  'time_limit_seconds',
]

if (header.join(',') !== expected.join(',')) {
  console.error('Unexpected CSV header:', header)
  process.exit(1)
}

const topicOrder = []
const topicSeen = new Set()
const questions = []

for (const row of dataRows) {
  if (row.length === 1 && row[0] === '') continue
  if (row.length !== expected.length) {
    console.error(`Row ${row[0] ?? '?'}: expected ${expected.length} columns, got ${row.length}`)
    process.exit(1)
  }

  const [
    id,
    topicKey,
    topicLabel,
    textQ,
    o1,
    o2,
    o3,
    o4,
    correctIndexStr,
    explanation,
    timeLimitStr,
  ] = row

  const correctIndex = Number(correctIndexStr)
  const timeLimitSeconds = Number(timeLimitStr)

  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    console.error(`Question ${id}: invalid correct_index ${correctIndexStr}`)
    process.exit(1)
  }

  if (!topicSeen.has(topicKey)) {
    topicSeen.add(topicKey)
    topicOrder.push({ key: topicKey, label: topicLabel })
  }

  questions.push({
    id,
    text: textQ,
    options: [o1, o2, o3, o4],
    correctIndex,
    topicKey,
    explanation: explanation ?? '',
    timeLimitSeconds: Number.isFinite(timeLimitSeconds) ? timeLimitSeconds : 25,
  })
}

const payload = { topics: topicOrder, questions }
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`Wrote ${questions.length} questions, ${topicOrder.length} topics → ${outPath}`)
