import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const p = path.join(__dirname, '..', 'public', 'questions.json')

const data = JSON.parse(fs.readFileSync(p, 'utf8'))

const keyMap = {
  swarming: 'bees',
  beekeeping_tools: 'hive_management',
  bee_venom_specialty: 'bee_products',
  bee_health: 'hive_management',
  bee_biology: 'bees',
  bee_ethology: 'bees'
}

for (const q of data.questions) {
  if (keyMap[q.topicKey]) q.topicKey = keyMap[q.topicKey]
}

const order = ['bees', 'pollination', 'hive_management', 'bee_products']

const labelByKey = {
  bees: 'Le api',
  pollination: 'Impollinazione',
  hive_management: "Gestione dell'alveare",
  bee_products: "Prodotti dell'alveare"
}

data.topics = order.map((k) => ({ key: k, label: labelByKey[k] }))

fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')

const used = new Set(data.questions.map((q) => q.topicKey))
const declared = new Set(data.topics.map((t) => t.key))
const missing = [...used].filter((k) => !declared.has(k))
const orphan = [...declared].filter((k) => !used.has(k))
console.log('topics:', data.topics.length, 'missing:', missing, 'unused:', orphan)
