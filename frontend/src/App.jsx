import React from 'react'
import StudentPanel from './StudentPanel.jsx'
import TeacherPanel from './TeacherPanel.jsx'
import RoleSelect from './RoleSelect.jsx'

// Get backend URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4970'

const App = () => {
  const [role, setRole] = React.useState('')
  const [pendingRole, setPendingRole] = React.useState('')
  const [theme, setTheme] = React.useState(() => localStorage.getItem('livepoll_theme') || 'light')
  
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('livepoll_theme', theme)
  }, [theme])
  
  function selectRole(next) {
    setPendingRole(next)
    // Don't auto-navigate for student - require Continue button click
  }
  
  function continueFromLanding() {
    if (pendingRole) setRole(pendingRole)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="container">
      {!role ? (
        <RoleSelect role={pendingRole} onSelect={selectRole} onContinue={continueFromLanding} />
      ) : (
        <>
          {(() => {
            const isStudentOnboarding = role === 'student' && !localStorage.getItem('livepoll_student_name')
            if (isStudentOnboarding) return null
            return (
              <header className="topbar">
                <h1>Live Polling</h1>
                <div className="role-switch">
                  <button onClick={() => setRole('teacher')} disabled={role === 'teacher'}>Teacher</button>
                  <button onClick={() => setRole('student')} disabled={role === 'student'}>Student</button>
                  <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme === 'light' ? 'Dark mode' : 'Light mode'}</button>
                </div>
              </header>
            )
          })()}
          {role === 'teacher' ? <TeacherPanel apiUrl={API_URL} /> : <StudentPanel apiUrl={API_URL} />}
        </>
      )}
      <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  )
}

export default App
