import React from 'react'

const RoleCard = ({ title, desc, selected, onClick }) => (
  <div className={"role-card" + (selected ? ' selected' : '')} onClick={onClick}>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
)

const RoleSelect = ({ role, onSelect, onContinue }) => {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('livepoll_theme') || 'light')
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('livepoll_theme', theme)
  }, [theme])
  return (
    <div className="landing">
      <div className="brand-pill">✦ Intervue Poll</div>
      <button
        className="theme-toggle"
        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        aria-label="Toggle theme"
        style={{ left: 'auto', right: 16, bottom: 'auto', top: 20 }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <h1 className="landing-title">Welcome to the <span>Live Polling System</span></h1>
      <p className="landing-sub">
        Please select the role that best describes you to begin using the live polling system
      </p>
      <div className="role-grid" style={{ marginBottom: 18 }}>
        <RoleCard
          title="I'm a Student"
          desc="Lorem Ipsum is simply dummy text of the printing and typesetting industry"
          selected={role === 'student'}
          onClick={() => onSelect('student')}
        />
        <RoleCard
          title="I'm a Teacher"
          desc="Submit answers and view live poll results in real-time."
          selected={role === 'teacher'}
          onClick={() => onSelect('teacher')}
        />
      </div>
      <button className="cta" onClick={onContinue} disabled={!role} style={{
        marginTop: 24,
        fontSize: "1.16rem",
        width: 240,
        borderRadius: 28,
      }}>Continue</button>
    </div>
  )
}

export default RoleSelect
