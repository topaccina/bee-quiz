## BeeWise Quiz – Functional Requirements

### 1. User and session flow
- **Start a new quiz round**
  - User can configure and start a new quiz round from an initial setup state.
  - Application must maintain and switch between three high-level states: setup, active quiz, and results.
- **Quit and reset**
  - User can quit an active quiz, discarding current progress and returning to the setup state.
  - User can start new rounds as many times as desired.

### 2. Quiz configuration
- **Number of questions**
  - User can choose how many questions to include in a round within defined minimum and maximum bounds.
  - Application must limit the chosen number to the number of questions actually available.
- **Topic selection mode**
  - User can choose between:
    - Mixed-topic mode: questions can come from any available topic.
    - Single-topic mode: questions are restricted to one selected topic.
  - When single-topic mode is selected, user must select one topic from the available topic list.
- **Question pool filtering**
  - When a quiz is started, the application must build the pool of eligible questions by:
    - Including all questions when in mixed-topic mode.
    - Including only questions that match the selected topic when in single-topic mode.
  - If there are fewer eligible questions than requested, the quiz must use all available eligible questions.

### 3. Question selection and ordering
- **Randomized question set**
  - For each new round, the application must randomize the order of the eligible questions.
  - The quiz must select a subset of questions based on the configured number of questions, using the randomized order.
- **Per-question data**
  - Each question must provide:
    - A unique identifier.
    - Question text.
    - A finite list of answer options.
    - Index of the correct option.
    - Associated topic key.
    - An explanatory text describing the correct answer.

### 4. Quiz execution
- **Per-question timing**
  - Each question is associated with a fixed time limit (in seconds).
  - A countdown starts when a question becomes active and runs until the user answers or time expires.
  - When the time limit expires without an answer, the question is treated as answered incorrectly and marked as completed.
- **Answer selection**
  - While a question is active and time remains, the user can select exactly one answer option.
  - Once an answer is submitted (either by user choice or by timeout), the question is considered completed and cannot be changed.
  - The system must record, for each question:
    - The index of the chosen option (or a null/empty value if no option was selected before timeout).
    - Whether the chosen answer is correct.
    - Time taken to answer in whole seconds.
- **Single evaluation per question**
  - A question must only be evaluated once; further attempts to answer the same question must be ignored.

### 5. Scoring and progress tracking
- **Score calculation**
  - The quiz maintains a running score as the number of questions answered correctly.
  - Each correctly answered question adds exactly one point; incorrect or timed-out questions add zero points.
- **Time tracking**
  - The quiz maintains the accumulated total time in seconds across all questions in the round.
  - For each answered question, its measured time is added to this total.
- **Question navigation**
  - After completing a question, the user can advance to the next question.
  - When the final question in the round has been completed and advanced, the round is marked as finished and the results state is entered.

### 6. Results and feedback
- **Overall results**
  - After a round is finished, the application must show:
    - Total number of questions in the round.
    - Number of correctly answered questions.
    - Overall percentage score based on correct answers.
    - Total accumulated time for the round.
    - Average time per question, derived from total time and number of questions.
- **Mistake counting**
  - The system counts how many questions in the round were answered incorrectly or timed out.
- **Per-topic error aggregation**
  - For each topic present in the quiz, the system aggregates the number of missed questions (incorrect or timed out) that belong to that topic.
  - Topics with at least one missed question are listed with:
    - Human-readable topic label.
    - Count of missed questions for that topic.
- **Replay options**
  - From the results state, the user can:
    - Start a new round using the same configuration as the completed round.
    - Return to the setup state to adjust configuration and start a different round.

### 7. Data structures and integrity
- **Question consistency**
  - All questions used in a round must exist in the global question set at the time the round is created.
  - Each question’s topic key must correspond to a defined topic label.
- **Answer records**
  - Answer records for a round must refer only to questions that are part of that round.
  - Each answer record must be uniquely associated with a single question identifier in the round.

