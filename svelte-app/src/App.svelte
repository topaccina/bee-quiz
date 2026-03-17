<script lang="ts">
  import {
    DEFAULT_TIME_LIMIT_SECONDS,
    aggregateMistakesByTopic,
    computeScore,
    computeTotalTime,
    selectRoundQuestions,
    validateQuestionData
  } from './quizLogic'
  import type {
    AnswerRecord,
    Question,
    QuestionData,
    RoundConfig,
    RoundMode,
    Topic
  } from './quizTypes'

  type AppState = 'setup' | 'quiz' | 'results'

  type TimerState = {
    remainingSeconds: number
    totalSeconds: number
  }

  let appState: AppState = 'setup'
  let questionData: QuestionData | null = null
  let loadError: string | null = null

  let config: RoundConfig = {
    numQuestions: 5,
    mode: 'mixed'
  }

  let roundQuestions: Question[] = []
  let currentIndex = 0
  let answerRecords: AnswerRecord[] = []
  let completedIds = new Set<string>()
  let timer: TimerState | null = null

  let timerHandle: ReturnType<typeof setTimeout> | null = null

  $: currentQuestion = roundQuestions[currentIndex]
  $: totalAvailable = computeTotalAvailable()
  $: canStartQuiz = !!(questionData && questionData.questions.length > 0)
  $: score = computeScore(answerRecords)
  $: totalTime = computeTotalTime(answerRecords)
  $: topicMistakes =
    questionData && roundQuestions.length > 0
      ? aggregateMistakesByTopic(answerRecords, roundQuestions)
      : new Map<string, number>()
  $: topicsByKey = buildTopicsByKey()
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

  $: if (appState === 'quiz' && currentQuestion && timer) {
    if (timerHandle) clearTimeout(timerHandle)
    if (timer.remainingSeconds <= 0) {
      completeQuestion(null)
    } else {
      timerHandle = setTimeout(() => {
        if (!timer) return
        timer = {
          ...timer,
          remainingSeconds: Math.max(timer.remainingSeconds - 1, 0)
        }
      }, 1000)
    }
  }

  function computeTotalAvailable(): number {
    if (!questionData) return 0
    if (config.mode === 'mixed') return questionData.questions.length
    // If single-topic mode but no topic chosen yet, show total questions
    if (!config.selectedTopicKey) return questionData.questions.length
    return questionData.questions.filter(
      (q) => q.topicKey === config.selectedTopicKey
    ).length
  }

  function buildTopicsByKey(): Map<string, Topic> {
    const map = new Map<string, Topic>()
    questionData?.topics.forEach((t) => map.set(t.key, t))
    return map
  }

  function changeMode(mode: RoundMode) {
    config = {
      ...config,
      mode,
      selectedTopicKey: mode === 'single' ? config.selectedTopicKey : undefined
    }
  }

  function changeNumQuestions(value: number) {
    if (Number.isNaN(value)) return
    const clamped = Math.max(1, Math.min(50, value))
    config = { ...config, numQuestions: clamped }
  }

  function changeTopic(topicKey: string) {
    config = { ...config, selectedTopicKey: topicKey }
  }

  function startRound(withConfig: RoundConfig = config) {
    if (!questionData) return

    let effectiveConfig = withConfig

    // If single-topic mode but no topic chosen or no eligible questions,
    // gracefully fall back to mixed mode so the quiz still starts.
    let selected = selectRoundQuestions(questionData.questions, effectiveConfig)
    if (selected.length === 0) {
      effectiveConfig = { ...withConfig, mode: 'mixed', selectedTopicKey: undefined }
      selected = selectRoundQuestions(questionData.questions, effectiveConfig)
    }

    roundQuestions = selected
    currentIndex = 0
    answerRecords = []
    completedIds = new Set()
    config = effectiveConfig
    appState = 'quiz'

    const first = roundQuestions[0]
    const limit = (first?.timeLimitSeconds ?? DEFAULT_TIME_LIMIT_SECONDS) | 0
    timer = {
      remainingSeconds: limit,
      totalSeconds: limit
    }
  }

  function resetToSetup() {
    appState = 'setup'
    roundQuestions = []
    currentIndex = 0
    answerRecords = []
    completedIds = new Set()
    timer = null
    if (timerHandle) clearTimeout(timerHandle)
  }

  function completeQuestion(chosenIndex: number | null) {
    if (!currentQuestion) return
    if (completedIds.has(currentQuestion.id)) return

    const limit =
      (currentQuestion.timeLimitSeconds ?? DEFAULT_TIME_LIMIT_SECONDS) | 0
    const remaining = timer?.remainingSeconds ?? limit
    const timeTaken = Math.min(limit, Math.max(0, limit - remaining))

    const isCorrect =
      chosenIndex !== null && chosenIndex === currentQuestion.correctIndex

    answerRecords = [
      ...answerRecords,
      {
        questionId: currentQuestion.id,
        chosenIndex,
        isCorrect,
        timeTakenSeconds: timeTaken
      }
    ]

    completedIds = new Set(completedIds).add(currentQuestion.id)
    timer = null
    if (timerHandle) clearTimeout(timerHandle)
  }

  function selectAnswer(index: number) {
    if (!currentQuestion) return
    if (completedIds.has(currentQuestion.id)) return
    if (timer && timer.remainingSeconds <= 0) return
    completeQuestion(index)
  }

  function nextQuestion() {
    if (currentIndex + 1 >= roundQuestions.length) {
      appState = 'results'
      timer = null
      if (timerHandle) clearTimeout(timerHandle)
      return
    }
    const nextIndex = currentIndex + 1
    const nextQuestion = roundQuestions[nextIndex]
    const limit =
      (nextQuestion.timeLimitSeconds ?? DEFAULT_TIME_LIMIT_SECONDS) | 0
    currentIndex = nextIndex
    timer = {
      remainingSeconds: limit,
      totalSeconds: limit
    }
  }

  $: isCompleted = !!currentAnswer
  $: timeRemaining = timer?.remainingSeconds ?? 0
  $: timeTotal = timer?.totalSeconds ?? DEFAULT_TIME_LIMIT_SECONDS
  $: timeProgress = timeTotal > 0 ? (timeRemaining / timeTotal) * 100 : 0
</script>

<main class="shell">
  <header class="shell-header">
    <div class="brand">
      <div class="brand-mark">B</div>
      <div class="brand-copy">
        <h1>BeeWise Quiz</h1>
        <p>Allenamento mirato su api, impollinazione e alveari.</p>
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
            ? 'Impostazione'
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
    <div class="layout-grid">
      <section class="card">
        <div class="card-header">
          <h2>Configura la sessione</h2>
          <p>Scegli quante domande e da quali argomenti vuoi esercitarti.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.9rem;">
          <div>
            <div class="field-label-row">
              <span>Numero di domande</span>
              <span>{config.numQuestions} / 20</span>
            </div>
            <div class="range-row">
              <input
                type="range"
                min="1"
                max="20"
                value={config.numQuestions}
                on:input={(e) => changeNumQuestions(+e.currentTarget.value)}
              />
              <input
                type="number"
                min="1"
                max="20"
                value={config.numQuestions}
                on:input={(e) => changeNumQuestions(+e.currentTarget.value)}
              />
            </div>
            <p class="helper-text">
              Il numero effettivo di domande verrà adattato alle domande disponibili.
            </p>
          </div>

          <div>
            <p class="field-label-row">
              <span>Modalità argomenti</span>
            </p>
            <div class="pill-choices">
              <button
                type="button"
                class={`pill-button ${config.mode === 'mixed' ? 'pill-button--active' : ''}`}
                on:click={() => changeMode('mixed')}
              >
                <span>Argomenti misti</span>
                <span>Le domande possono provenire da qualsiasi argomento.</span>
              </button>
              <button
                type="button"
                class={`pill-button ${config.mode === 'single' ? 'pill-button--active' : ''}`}
                on:click={() => changeMode('single')}
              >
                <span>Argomento singolo</span>
                <span>Ti concentri su un solo argomento alla volta.</span>
              </button>
            </div>
          </div>

          {#if config.mode === 'single'}
            <div>
              <p class="field-label-row">
                <span>Argomento</span>
              </p>
              <select
                class="select"
                bind:value={config.selectedTopicKey}
                on:change={(e) => changeTopic(e.currentTarget.value)}
              >
                <option value="">Seleziona un argomento…</option>
                {#each questionData.topics as t}
                  <option value={t.key}>{t.label}</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>

        <div
          style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.9rem; gap: 0.8rem;"
        >
          <p style="font-size: 0.8rem; color: var(--text-muted);">
            {#if questionData && questionData.questions.length > 0}
              <span style="color: var(--text-main); font-weight: 500;">
                {questionData.questions.length} domande
              </span>
              {' '}disponibili nel tuo set.
            {:else}
              Nessuna domanda trovata nel file questions.json.
            {/if}
          </p>

          <button
            type="button"
            class="primary-btn"
            disabled={!canStartQuiz}
            on:click={() => startRound(config)}
          >
            Avvia quiz
          </button>
        </div>
      </section>

      <aside class="card card-muted">
        <div class="card-header">
          <h2>Consigli rapidi</h2>
          <p>Inizia con poche domande e concentrati sugli argomenti che conosci meno.</p>
        </div>
        <p class="helper-text">
          Puoi modificare il set di domande per adattarlo ai tuoi obiettivi di studio.
        </p>
        <p class="helper-text" style="margin-top: 0.6rem;">
          Ogni domanda ha un tempo limite: se il tempo scade, la risposta viene considerata errata.
        </p>
      </aside>
    </div>
  {:else if appState === 'quiz' && currentQuestion}
    <div class="layout-grid">
      <section class="card">
        <div class="top-bar">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span
              style="border-radius:999px;background:rgba(15,23,42,0.95);padding:0.2rem 0.7rem;border:1px solid rgba(51,65,85,0.9);"
            >
              Q{currentIndex + 1}
              {' / '}
              {roundQuestions.length}
            </span>
            <span style="color:var(--text-muted);display:none;">
              Score:
              {' '}
              <span style="color: var(--text-main); font-weight: 600;">{score}</span>
            </span>
          </div>
          <div class="timer-shell">
            <span style="color:var(--text-muted);font-size:0.78rem;">
              Tempo rimanente
            </span>
            <div class="timer-bar">
              <div
                class="timer-fill"
                style={`width: ${timeProgress}%; background: ${
                  timeRemaining <= 3
                    ? '#f87171'
                    : timeRemaining <= 7
                      ? '#facc15'
                      : '#22c55e'
                };`}
              />
            </div>
            <span
              class="timer-value"
              style={`font-size: 0.8rem; color: ${
                timeRemaining <= 3
                  ? '#fecaca'
                  : timeRemaining <= 7
                    ? '#fef9c3'
                    : '#bbf7d0'
              };`}
            >
              {timeRemaining}s
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
                disabled={Boolean(currentAnswer) || timeRemaining <= 0}
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

        <div
          style="margin-top: 0.9rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;"
        >
          <p style="font-size: 0.8rem; color: var(--text-muted);">
            {#if currentAnswer}
              Leggi la spiegazione, poi passa alla prossima domanda.
            {:else if timeRemaining <= 0}
              Tempo scaduto: questa domanda viene conteggiata come errata.
            {:else}
              Seleziona un&apos;opzione per confermare la risposta.
            {/if}
          </p>
          <div style="display:flex; gap:0.5rem;">
            <button
            type="button"
            class="secondary-btn"
            disabled={!isCompleted && timeRemaining > 0}
            on:click={nextQuestion}
          >
            {currentIndex + 1 >= roundQuestions.length ? 'Vedi risultati' : 'Domanda successiva'}
            </button>
            <button
              type="button"
              class="secondary-btn"
              on:click={resetToSetup}
            >
              Esci dal quiz
            </button>
          </div>
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
          {@const averageTime = totalQuestions
            ? Math.round(totalTime / totalQuestions)
            : 0}
          {@const missedCount = totalQuestions - score}

          <div class="summary-grid">
            <div class="summary-tile">
              <p class="summary-label">Domande totali</p>
              <p class="summary-value">{totalQuestions}</p>
            </div>
            <div class="summary-tile">
              <p class="summary-label">Risposte corrette</p>
              <p class="summary-value" style="color:#6ee7b7;">{score}</p>
            </div>
            <div class="summary-tile">
              <p class="summary-label">Percentuale</p>
              <p class="summary-value">{percentage}%</p>
            </div>
            <div class="summary-tile">
              <p class="summary-label">Domande sbagliate</p>
              <p class="summary-value" style="color:#facc15;">{missedCount}</p>
            </div>
            <div class="summary-tile">
              <p class="summary-label">Tempo totale</p>
              <p class="summary-value">{totalTime}s</p>
            </div>
            <div class="summary-tile">
              <p class="summary-label">Media per domanda</p>
              <p class="summary-value">{averageTime}s</p>
            </div>
          </div>

          <div style="margin-top: 1rem; display:flex; flex-wrap:wrap; gap:0.6rem;">
            <button type="button" class="primary-btn" on:click={() => startRound(config)}>
              Ripeti con le stesse impostazioni
            </button>
            <button type="button" class="secondary-btn" on:click={resetToSetup}>
              Cambia impostazioni
            </button>
          </div>
        {/if}
      </section>

      <aside class="card card-muted">
        <div class="card-header">
          <h2>Dove hai sbagliato</h2>
          <p>Argomenti con almeno una domanda errata o fuori tempo.</p>
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
