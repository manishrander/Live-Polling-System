import React, { useEffect, useMemo, useState } from 'react'
import { getState, subscribe, registerStudent, submitAnswer, getResults, timeRemainingMs, isKicked, setStudentName } from './store'
import ChatWidget from './ChatWidget.jsx'

function getOrCreateStudentId() {
  const key = 'livepoll_student_id_v1'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = `student_${Math.random().toString(36).slice(2)}_${Date.now()}`
    sessionStorage.setItem(key, id)
  }
  return id
}

const StudentPanel = () => {
  const [state, setState] = useState(getState())
  const [name, setName] = useState(localStorage.getItem('livepoll_student_name') || '')
  const [confirmed, setConfirmed] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [selected, setSelected] = useState(null)

  const studentId = useMemo(() => getOrCreateStudentId(), [])

  useEffect(() => {
    registerStudent(studentId)
    const unsub = subscribe(setState)
    const interval = setInterval(() => setNow(Date.now()), 250)
    return () => { unsub(); clearInterval(interval) }
  }, [studentId])

  const q = state.currentQuestion
  const results = getResults()
  const remainingMs = timeRemainingMs()

  function formatMsAsMMSS(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000))
    const minutes = Math.floor(total / 60).toString().padStart(2, '0')
    const seconds = (total % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  const hasAnswered = q && state.studentAnswers[studentId] && state.studentAnswers[studentId][q.id] !== undefined
  const expired = q ? (Date.now() - q.startedAtMs > q.durationSec * 1000) : false

  function saveName(e) {
    e.preventDefault()
    if (!name.trim()) return
    localStorage.setItem('livepoll_student_name', name.trim())
    setStudentName(studentId, name.trim())
    registerStudent(studentId)
    setConfirmed(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (selected === null || selected === undefined) return
    submitAnswer(studentId, selected)
  }

  if (isKicked(studentId)) {
    return (
      <div className="kicked-out">
        <div className="brand-pill">Intervue Poll</div>
        <h2>You’ve been Kicked out!</h2>
        <p>Looks like the teacher had removed you from the poll system. Please try again sometime.</p>
      </div>
    )
  }

  if (!confirmed) {
    return (
      <div className="landing">
        <div className="brand-pill">✦ Intervue Poll</div>
        <h1 className="landing-title">Let’s <span>Get Started</span></h1>
        <p className="landing-sub">If you’re a student, you’ll be able to <b>submit your answers</b>, participate in live polls, and see how your responses compare with your classmates</p>
        <form onSubmit={saveName} className="card" style={{maxWidth: 560, width: '100%'}}>
          <label>Enter your Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <div style={{ display:'flex', justifyContent:'center' }}>
            <button type="submit" className="cta" disabled={!name.trim()}>Continue</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="header-row">
        <div className="name-chip" onClick={() => {
          const el = document.querySelector('#qbox');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}>👤 {name}</div>
        {q && !hasAnswered && !expired && (
          <div className="countdown">⏱ <span className="timer-red">{formatMsAsMMSS(remainingMs)}</span></div>
        )}
      </div>

      {!q && (
        <div className="wait-screen">
          <div className="brand-pill">✦ Intervue Poll</div>
          <div className="spinner"></div>
          <h2>Wait for the teacher to ask questions..</h2>
        </div>
      )}
      
      {q && !hasAnswered && !expired && (
        <form id="qbox" className="question-card" onSubmit={handleSubmit}>
          <div className="q-header">
            <div className="q-title">Question 1</div>
            <div className="q-timer">⏱ <span className="timer-red">{formatMsAsMMSS(remainingMs)}</span></div>
          </div>
          <div className="q-stem">{q.text}</div>
          <ul className="option-list">
            {q.options.map((opt, idx) => (
              <li key={idx} className={"option" + (selected === idx ? ' selected' : '')} onClick={() => setSelected(idx)}>
                <span className="number-pill">{idx + 1}</span>
                <span className="option-text">{opt}</span>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button type="submit" className="submit-cta" disabled={selected === null}>Submit</button>
          </div>
        </form>
      )}

      {(hasAnswered || expired) && results && (
        <div className="question-card">
          <div className="q-header">
            <div className="q-title">Results</div>
            <div className="q-timer">⏱ <span className="timer-red">--:--</span></div>
          </div>
          <div className="q-stem">{results.question.text}</div>
          <ul className="results" style={{ padding: 16 }}>
            {results.question.options.map((opt, idx) => {
              const count = results.counts[idx]
              const pct = results.total ? Math.round((count / results.total) * 100) : 0
              return (
                <li key={idx} className="result-row">
                  <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                    <span className="number-pill">{idx + 1}</span>
                    {opt}
                  </span>
                  <span>{pct}%</span>
                  <div className="bar"><div className="fill" style={{ width: `${pct}%` }}></div></div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <ChatWidget currentUserName={name || 'Student'} />
    </div>
  )
}

export default StudentPanel
