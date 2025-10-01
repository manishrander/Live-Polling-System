import React, { useEffect, useState } from 'react'
import { subscribe, getState, createQuestion, canAskNewQuestion, getResults, timeRemainingMs, getHistory } from './store'
import ChatWidget from './ChatWidget.jsx'

const defaultDuration = 60

const TeacherPanel = () => {
  const [state, setState] = useState(getState())
  const [text, setText] = useState('')
  const [optionsArr, setOptionsArr] = useState(['', ''])
  const [duration, setDuration] = useState(defaultDuration)
  const [tick, setTick] = useState(Date.now())
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const unsub = subscribe(setState)
    const interval = setInterval(() => setTick(Date.now()), 250)
    return () => { unsub(); clearInterval(interval) }
  }, [])

  const results = getResults()
  const remaining = timeRemainingMs()
  const isCompleted = remaining <= 0

  function formatMsAsMMSS(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000))
    const minutes = Math.floor(total / 60).toString().padStart(2, '0')
    const seconds = (total % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  function handleCreate(e) {
    e.preventDefault()
    const options = optionsArr.map(s => s.trim()).filter(Boolean)
    createQuestion(text.trim(), options, Number(duration) || defaultDuration)
    setText('')
    setOptionsArr(['', ''])
  }

  const allowNew = canAskNewQuestion()

  const history = getHistory()

  return (
    <div className="panel">
      <div className="brand-pill">✦ Intervue Poll</div>
      <h1 className="landing-title">Let’s <span>Get Started</span></h1>
      <p className="landing-sub">you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>

      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom: 12 }}>
        <button className="pill-cta" onClick={() => setShowHistory(v => !v)}>👁 View Poll history</button>
      </div>

      <form className="card teacher-intro" onSubmit={handleCreate}>
        <div className="field-row">
          <label>Enter your question</label>
          <select className="duration-select" value={duration} onChange={e => setDuration(e.target.value)}>
            <option value={30}>30 seconds ▾</option>
            <option value={60}>60 seconds ▾</option>
            <option value={120}>120 seconds ▾</option>
          </select>
        </div>
        <div className="textarea-wrap">
          <textarea rows={5} maxLength={100} value={text} onChange={e => setText(e.target.value)} placeholder="Type your question" />
          <div className="char-count">{Math.min(text.length, 100)}/100</div>
        </div>

        <div className="options-grid">
          <div>
            <label>Edit Options</label>
            {optionsArr.map((opt, idx) => (
              <div key={idx} className="option-row">
                <span className="number-pill">{idx + 1}</span>
                <input value={opt} onChange={e => setOptionsArr(arr => arr.map((v, i) => i === idx ? e.target.value : v))} placeholder="Option text" />
              </div>
            ))}
            <button type="button" className="link" onClick={() => setOptionsArr(arr => [...arr, ''])}>+ Add More option</button>
          </div>
          <div>
            <label>Is it Correct?</label>
            {optionsArr.map((_, idx) => (
              <div key={idx} className="radio-group">
                <label className="radio"><input type="radio" name={`opt${idx}`} /> <span>Yes</span></label>
                <label className="radio"><input type="radio" name={`opt${idx}`} defaultChecked /> <span>No</span></label>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky-footer">
          <button type="submit" className="cta" disabled={!allowNew || !text.trim()}>Ask Question</button>
        </div>
        {!allowNew && (
          <small>Wait until current question is completed by all students or time expires.</small>
        )}
      </form>

      {results && (
        <div className="card">
          <div className="header-row"><h3>Live Results</h3></div>
          <p>{results.question.text}</p>
          <ul className="results">
            {results.question.options.map((opt, idx) => {
              const count = results.counts[idx]
              const total = results.total
              const pct = total ? Math.round((count / total) * 100) : 0
              return (
                <li key={idx} className="result-row">
                  <span>{opt}</span>
                  <span>{pct}%</span>
                  <div className="bar"><div className="fill" style={{ width: `${pct}%` }}></div></div>
                </li>
              )
            })}
          </ul>
          <div className="actions" style={{ justifyContent:'flex-end' }}>
            <button className="pill-cta" type="button" onClick={() => setShowHistory(true)}>👁 View Poll history</button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="history-overlay">
          <div className="history-container">
            <h2 style={{ fontSize: 'clamp(24px, 5vw, 36px)', marginBottom: 24, textAlign: 'center' }}>View <span style={{ fontWeight: 800 }}>Poll History</span></h2>
            {history.length === 0 && <p style={{ textAlign: 'center' }}>No history yet.</p>}
            {history.map((h, i) => (
              <div key={h.id} className="question-card" style={{ marginBottom: 24 }}>
                <div className="q-header">
                  <div className="q-title">Question {history.length - i}</div>
                  <div className="q-timer">⏱ <span className="timer-red">00:00</span></div>
                </div>
                <div className="q-stem">{h.text}</div>
                <ul className="results" style={{ padding: 16 }}>
                  {h.options.map((opt, idx) => {
                    const count = h.counts[idx]
                    const pct = h.total ? Math.round((count / h.total) * 100) : 0
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
            ))}
            <div className="actions" style={{ justifyContent:'center', marginTop: 24 }}>
              <button className="cta" type="button" onClick={() => setShowHistory(false)}>Ask more question</button>
            </div>
          </div>
        </div>
      )}
      <ChatWidget currentUserName={'Teacher'} canKick={true} />
    </div>
  )
}

export default TeacherPanel
