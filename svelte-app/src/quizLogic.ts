import type { AnswerRecord, Question, QuestionData, RoundConfig } from './quizTypes'

export const DEFAULT_TIME_LIMIT_SECONDS = 30

export function validateQuestionData(data: QuestionData): void {
  const topicKeys = new Set(data.topics.map((t) => t.key))

  data.questions.forEach((q) => {
    if (!topicKeys.has(q.topicKey)) {
      throw new Error(`Question ${q.id} has unknown topicKey "${q.topicKey}"`)
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      throw new Error(`Question ${q.id} has invalid correctIndex`)
    }
  })
}

export function buildEligibleQuestionPool(allQuestions: Question[], config: RoundConfig): Question[] {
  if (config.mode === 'mixed') return [...allQuestions]
  return allQuestions.filter((q) => q.topicKey === config.selectedTopicKey)
}

export function shuffleQuestions(questions: Question[]): Question[] {
  const copy = [...questions]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function selectRoundQuestions(allQuestions: Question[], config: RoundConfig): Question[] {
  const eligible = buildEligibleQuestionPool(allQuestions, config)
  const shuffled = shuffleQuestions(eligible)
  const count = Math.min(config.numQuestions, shuffled.length)
  return shuffled.slice(0, count)
}

export function computeScore(records: AnswerRecord[]): number {
  return records.filter((r) => r.isCorrect).length
}

export function computeTotalTime(records: AnswerRecord[]): number {
  return records.reduce((sum, r) => sum + r.timeTakenSeconds, 0)
}

export function aggregateMistakesByTopic(
  records: AnswerRecord[],
  questions: Question[],
): Map<string, number> {
  const byId = new Map<string, Question>()
  questions.forEach((q) => byId.set(q.id, q))

  const mistakes = new Map<string, number>()

  records.forEach((r) => {
    if (r.isCorrect) return
    const q = byId.get(r.questionId)
    if (!q) return
    const current = mistakes.get(q.topicKey) ?? 0
    mistakes.set(q.topicKey, current + 1)
  })

  return mistakes
}

