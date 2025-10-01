// Simple poll store using localStorage and storage events for cross-tab sync

const STORAGE_KEY = 'livepoll_state_v1';

const initialState = {
  currentQuestion: null, // { id, text, options: string[], startedAtMs, durationSec }
  answers: {}, // { questionId: { optionIndex: count } }
  studentAnswers: {}, // { studentId -> { [questionId]: optionIndex } }
  studentNames: {}, // { studentId -> name }
  kicked: {}, // { studentId -> true }
  history: [], // [{ id, text, options, counts, total, completedAtMs }]
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...initialState };
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed };
  } catch {
    return { ...initialState };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
const listeners = new Set();

function notify() {
  for (const cb of listeners) cb(state);
}

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    state = loadState();
    notify();
  }
});

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getState() {
  return state;
}

function canAskNewQuestionInternal() {
  if (!state.currentQuestion) return true;
  const q = state.currentQuestion;
  const answeredCount = Object.values(state.studentAnswers).filter(
    (ans) => ans && ans[q.id] !== undefined
  ).length;
  const totalKnownStudents = Object.keys(state.studentAnswers).length;
  const timeExpired = Date.now() - q.startedAtMs >= q.durationSec * 1000;
  // Allow new if everyone answered or timer expired
  return totalKnownStudents > 0 && answeredCount >= totalKnownStudents || timeExpired;
}

export function canAskNewQuestion() {
  return canAskNewQuestionInternal();
}

export function createQuestion(text, options, durationSec = 60) {
  if (!text || !Array.isArray(options) || options.length < 2) return false;
  if (!canAskNewQuestionInternal()) return false;
  // archive previous question (if any) with its results
  if (state.currentQuestion) {
    const prev = state.currentQuestion;
    const counts = prev.options.map((_, idx) => state.answers[prev.id]?.[idx] || 0);
    const total = counts.reduce((a, b) => a + b, 0);
    state.history.push({
      id: prev.id,
      text: prev.text,
      options: [...prev.options],
      counts,
      total,
      completedAtMs: Date.now(),
    });
  }
  const id = `${Date.now()}`;
  const q = { id, text, options, startedAtMs: Date.now(), durationSec, completed: false, completedAtMs: null, stoppedRemainingMs: undefined };
  state.currentQuestion = q;
  if (!state.answers[id]) {
    state.answers[id] = {};
  }
  saveState(state);
  notify();
  return true;
}

export function registerStudent(studentId) {
  if (!state.studentAnswers[studentId]) {
    state.studentAnswers[studentId] = {};
    saveState(state);
    notify();
  }
}

export function submitAnswer(studentId, optionIndex) {
  const q = state.currentQuestion;
  if (!q) return { ok: false, reason: 'no_question' };
  if (state.kicked[studentId]) return { ok: false, reason: 'kicked' };
  if (q.stoppedRemainingMs !== undefined) return { ok: false, reason: 'stopped' };
  const timeElapsed = Date.now() - q.startedAtMs;
  if (timeElapsed > q.durationSec * 1000) {
    return { ok: false, reason: 'expired' };
  }
  if (!state.studentAnswers[studentId]) state.studentAnswers[studentId] = {};
  if (state.studentAnswers[studentId][q.id] !== undefined) {
    return { ok: false, reason: 'already_answered' };
  }
  state.studentAnswers[studentId][q.id] = optionIndex;
  state.answers[q.id][optionIndex] = (state.answers[q.id][optionIndex] || 0) + 1;
  saveState(state);
  notify();
  return { ok: true };
}

export function getResults() {
  const q = state.currentQuestion;
  if (!q) return null;
  const counts = q.options.map((_, idx) => state.answers[q.id]?.[idx] || 0);
  const total = counts.reduce((a, b) => a + b, 0);
  return { question: q, counts, total };
}

export function timeRemainingMs() {
  const q = state.currentQuestion;
  if (!q) return 0;
  if (q.stoppedRemainingMs !== undefined) return q.stoppedRemainingMs;
  const end = q.startedAtMs + q.durationSec * 1000;
  return Math.max(0, end - Date.now());
}

export function resetPoll() {
  state = { ...initialState };
  saveState(state);
  notify();
}

// Participants and names
export function setStudentName(studentId, name) {
  state.studentNames[studentId] = name;
  saveState(state);
  notify();
}

export function getParticipants() {
  return Object.keys(state.studentAnswers).map((id) => ({ id, name: state.studentNames[id] || id }));
}

export function kickStudent(studentId) {
  state.kicked[studentId] = true;
  saveState(state);
  notify();
}

export function isKicked(studentId) {
  return !!state.kicked[studentId];
}

export function getHistory() {
  return state.history.slice().reverse();
}

export function stopTimer() {
  const q = state.currentQuestion;
  if (!q) return false;
  if (q.stoppedRemainingMs !== undefined) return true;
  const end = q.startedAtMs + q.durationSec * 1000;
  q.stoppedRemainingMs = Math.max(0, end - Date.now());
  // Also normalize the timer fields so any external computations stay fixed
  q.startedAtMs = Date.now();
  q.durationSec = Math.ceil(q.stoppedRemainingMs / 1000);
  saveState(state);
  notify();
  return true;
}


