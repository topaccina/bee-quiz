<script lang="ts">
  import {
    aggregateMistakesByTopic,
    computeScore,
    selectRoundQuestions,
    validateQuestionData
  } from './quizLogic'
  import type { AnswerRecord, Question, QuestionData } from './quizTypes'

  const ROUND_QUESTION_COUNT = 20

  type AppState = 'setup' | 'quiz' | 'results'

  let appState: AppState = 'setup'
  let questionData: QuestionData | null = null
  let loadError: string | null = null

  let roundQuestions: Question[] = []
  let currentIndex = 0
  let answerRecords: AnswerRecord[] = []
  let completedIds = new Set<string>()

  $: currentQuestion = roundQuestions[currentIndex]
  $: totalAvailable = questionData?.questions?.length ?? 0
  $: canStartQuiz = !!(questionData && questionData.questions.length > 0)
  $: score = computeScore(answerRecords)
  $: topicMistakes =
    questionData && roundQuestions.length > 0
      ? aggregateMistakesByTopic(answerRecords, roundQuestions)
      : new Map<string, number>()
  $: topicsByKey = new Map((questionData?.topics ?? []).map((t) => [t.key, t]))
  $: currentAnswer =
    currentQuestion &&
    answerRecords.find((r) => r.questionId === currentQuestion.id) || null

  async function loadQuestions() {
    try {
      const res = await fetch('/questions.json')
      if (!res.ok) {
        throw new Error(`Failed to load questions.json (${res.status})`)
      }
      const data = (await res.json()) as QuestionData
      validateQuestionData(data)
      questionData = data
    } catch (err) {
      loadError =
        err instanceof Error ? err.message : 'Unknown error loading data'
    }
  }

  loadQuestions()

  function startRound() {
    if (!questionData) return

    const selected = selectRoundQuestions(questionData.questions, {
      numQuestions: ROUND_QUESTION_COUNT
    })

    roundQuestions = selected
    currentIndex = 0
    answerRecords = []
    completedIds = new Set()
    appState = 'quiz'
  }

  function resetToSetup() {
    appState = 'setup'
    roundQuestions = []
    currentIndex = 0
    answerRecords = []
    completedIds = new Set()
  }

  function completeQuestion(chosenIndex: number | null) {
    if (!currentQuestion) return
    if (completedIds.has(currentQuestion.id)) return

    const isCorrect =
      chosenIndex !== null && chosenIndex === currentQuestion.correctIndex

    answerRecords = [
      ...answerRecords,
      {
        questionId: currentQuestion.id,
        chosenIndex,
        isCorrect,
        timeTakenSeconds: 0
      }
    ]

    completedIds = new Set(completedIds).add(currentQuestion.id)
  }

  function selectAnswer(index: number) {
    if (!currentQuestion) return
    if (completedIds.has(currentQuestion.id)) return
    completeQuestion(index)
  }

  function showSolution() {
    if (!currentQuestion) return
    if (completedIds.has(currentQuestion.id)) return
    completeQuestion(null)
  }

  function nextQuestion() {
    if (currentIndex + 1 >= roundQuestions.length) {
      appState = 'results'
      return
    }
    currentIndex = currentIndex + 1
  }

  $: isCompleted = !!currentAnswer
</script>

<main class="shell">
  <header class="shell-header">
    <div class="brand">
      <div class="brand-mark">B</div>
      <div class="brand-copy">
        <h1 class="brand-title">BeeWise Quiz</h1>
        <p class="brand-tagline">Test di apicoltura</p>
      </div>
    </div>
    <div>
      <div class="status-pill">
        <span
          class="status-dot"
          style={`background-color: ${
            appState === 'setup'
              ? '#38bdf8'
              : appState === 'quiz'
                ? '#22c55e'
                : '#fbbf24'
          }`}
        ></span>
        <span>
          {appState === 'setup'
            ? 'Home'
            : appState === 'quiz'
              ? 'Quiz in corso'
              : 'Risultati'}
        </span>
      </div>
    </div>
  </header>

  {#if loadError}
    <section class="card card-muted">
      <div class="card-header">
        <h2>Problema nel caricamento delle domande</h2>
        <p>{loadError}</p>
      </div>
    </section>
  {:else if !questionData}
    <section class="card card-muted">
      <div class="card-header">
        <h2>Caricamento contenuti…</h2>
        <p>Sto caricando domande e argomenti del quiz.</p>
      </div>
    </section>
  {:else if appState === 'setup'}
    <div class="setup-page">
      <section class="card setup-card">
        <div class="setup-meta">
          {#if questionData && questionData.questions.length > 0}
            <p class="setup-stat">Totale domande in catalogo: <strong>{totalAvailable}</strong></p>
            <p class="setup-topics-label">Argomenti</p>
            <ul class="setup-topic-list">
              {#each questionData.topics as t}
                <li>{t.label}</li>
              {/each}
            </ul>
          {:else}
            <p class="setup-stat setup-stat--warn">Nessuna domanda in questions.json.</p>
          {/if}
        </div>

        <div class="setup-actions">
          <button
            type="button"
            class="primary-btn setup-primary"
            disabled={!canStartQuiz}
            on:click={startRound}
          >
            Avvia quiz
          </button>
        </div>
      </section>
    </div>
  {:else if appState === 'quiz' && currentQuestion}
    <div class="layout-grid">
      <section class="card">
        <div class="top-bar">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="quiz-progress-badge">
              Q{currentIndex + 1}
              {' / '}
              {roundQuestions.length}
            </span>
            <span style="color:var(--text-muted);display:none;">
              Punteggio:
              {' '}
              <span style="color: var(--text-main); font-weight: 600;">{score}</span>
            </span>
          </div>
        </div>

        <div style="margin-top: 0.9rem;">
          <div class="question-card">
            <p>{currentQuestion.text}</p>
          </div>

          <div class="answers">
            {#each currentQuestion.options as opt, i}
              {@const isChosen = currentAnswer && currentAnswer.chosenIndex === i}
              {@const isCorrect = i === currentQuestion.correctIndex}

              <button
                type="button"
                class={`answer-btn ${
                  currentAnswer
                    ? isCorrect
                      ? 'answer-btn--correct'
                      : isChosen && !isCorrect
                        ? 'answer-btn--wrong'
                        : ''
                    : ''
                }`}
                disabled={Boolean(currentAnswer)}
                on:click={() => selectAnswer(i)}
              >
                <span>{opt}</span>
                {#if currentAnswer}
                  <span class="answer-meta">
                    {#if isCorrect}
                      Correct
                    {:else if isChosen}
                      Your answer
                    {/if}
                  </span>
                {/if}
              </button>
            {/each}
          </div>

        </div>

        <div class="quiz-footer-actions">
          <button
            type="button"
            class="secondary-btn"
            disabled={Boolean(currentAnswer)}
            on:click={showSolution}
          >
            Mostra soluzione
          </button>
          <button
            type="button"
            class="secondary-btn"
            disabled={!isCompleted}
            on:click={nextQuestion}
          >
            {currentIndex + 1 >= roundQuestions.length ? 'Vedi risultati' : 'Domanda successiva'}
          </button>
          <button type="button" class="secondary-btn" on:click={resetToSetup}>
            Esci dal quiz
          </button>
        </div>
      </section>

      <aside class="card card-muted">
        <div class="card-header">
          <h2>Andamento live</h2>
          <p>Tieni d&apos;occhio come sta andando questa sessione.</p>
        </div>
        <div class="summary-grid">
          <div class="summary-tile">
              <p class="summary-label">Punteggio attuale</p>
            <p class="summary-value">{score}</p>
          </div>
          <div class="summary-tile">
              <p class="summary-label">Domanda</p>
            <p class="summary-value">
              {currentIndex + 1}/{roundQuestions.length}
            </p>
          </div>
        </div>

        {#if currentAnswer}
          <div class="explanation-box">
            <p style="margin:0 0 0.25rem; font-size: 0.8rem; font-weight: 500;">
              Spiegazione
            </p>
            <p style="margin:0; font-size: 0.78rem;">
              {currentQuestion.explanation}
            </p>
          </div>
        {/if}
      </aside>
    </div>
  {:else if appState === 'results'}
    <div class="layout-grid">
      <section class="card">
        <div class="card-header">
          <h2>Riepilogo della sessione</h2>
          <p>Panoramica delle tue risposte in questo quiz.</p>
        </div>

        {#if roundQuestions.length === 0}
          <p class="helper-text">
            Questa sessione non contiene domande registrate. Avvia un nuovo quiz dalla schermata iniziale.
          </p>
        {:else}
          {@const totalQuestions = roundQuestions.length}
          {@const percentage = totalQuestions
            ? Math.round((score / totalQuestions) * 100)
            : 0}
          {@const missedCount = totalQuestions - score}

          <div class="summary-grid">
            <div class="summary-tile">
              <p class="summary-label">Domande totali</p>
              <p class="summary-value">{totalQuestions}</p>
            </div>
            <div class="summary-tile">
              <p class="summary-label">Risposte corrette</p>
              <p class="summary-value summary-value--good">{score}</p>
            </div>
            <div class="summary-tile">
              <p class="summary-label">Percentuale</p>
              <p class="summary-value">{percentage}%</p>
            </div>
            <div class="summary-tile">
              <p class="summary-label">Domande sbagliate</p>
              <p class="summary-value summary-value--miss">{missedCount}</p>
            </div>
          </div>

          <div style="margin-top: 1rem; display:flex; flex-wrap:wrap; gap:0.6rem;">
            <button type="button" class="primary-btn" on:click={startRound}>
              Nuovo quiz
            </button>
            <button type="button" class="secondary-btn" on:click={resetToSetup}>
              Home
            </button>
          </div>
        {/if}
      </section>

      <aside class="card card-muted">
        <div class="card-header">
          <h2>Dove hai sbagliato</h2>
          <p>Argomenti con almeno un errore (risposta sbagliata o soluzione mostrata).</p>
        </div>

        {#if topicMistakes.size === 0}
          <p class="helper-text">
            Ottimo lavoro: non hai sbagliato nessuna domanda in questa sessione.
          </p>
        {:else}
          <ul class="topic-list">
            {#each Array.from(topicMistakes.entries()) as [topicKey, count]}
              <li class="topic-item">
                <span>{topicsByKey.get(topicKey)?.label ?? topicKey}</span>
                <span class="topic-miss">{count} errori</span>
              </li>
            {/each}
          </ul>
        {/if}
      </aside>
    </div>
  {/if}
</main>
