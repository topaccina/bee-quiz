/**
 * Writes public/questions-documentation.csv from public/questions.json (UTF-8 BOM for Excel).
 * Run from svelte-app: node scripts/export-questions-documentation.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pub = join(__dirname, '..', 'public')
const jsonPath = join(pub, 'questions.json')
const outPath = join(pub, 'questions-documentation.csv')

function cell(v) {
  const s = v == null ? '' : String(v)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const data = JSON.parse(readFileSync(jsonPath, 'utf8'))
const topicLabel = Object.fromEntries(data.topics.map((t) => [t.key, t.label]))

const header = [
  'id',
  'topic_key',
  'topic_label',
  'text',
  'option_1',
  'option_2',
  'option_3',
  'option_4',
  'correct_index',
  'correct_answer',
  'explanation',
  'time_limit_seconds',
]

const lines = [header.join(',')]
for (const q of data.questions) {
  const opts = q.options || []
  const ci = q.correctIndex
  const correct = opts[ci] ?? ''
  lines.push(
    [
      cell(q.id),
      cell(q.topicKey),
      cell(topicLabel[q.topicKey] ?? q.topicKey),
      cell(q.text),
      cell(opts[0]),
      cell(opts[1]),
      cell(opts[2]),
      cell(opts[3]),
      cell(ci),
      cell(correct),
      cell(q.explanation ?? ''),
      cell(q.timeLimitSeconds ?? 25),
    ].join(','),
  )
}

const bom = '\ufeff'
writeFileSync(outPath, bom + lines.join('\n') + '\n', 'utf8')
console.log('Wrote', outPath, 'rows', data.questions.length)
