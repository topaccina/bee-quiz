export type Topic = {
  key: string
  label: string
}

export type Question = {
  id: string
  text: string
  options: string[]
  correctIndex: number
  topicKey: string
  explanation: string
  timeLimitSeconds?: number
}

export type QuestionData = {
  topics: Topic[]
  questions: Question[]
}

export type RoundMode = 'mixed' | 'single'

export type RoundConfig = {
  numQuestions: number
  mode: RoundMode
  selectedTopicKey?: string
}

export type AnswerRecord = {
  questionId: string
  chosenIndex: number | null
  isCorrect: boolean
  timeTakenSeconds: number
}

