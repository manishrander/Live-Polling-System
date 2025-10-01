import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { kickStudent } from './store'

const ChatWidget = ({ currentUserName = 'You', canKick = false }) => {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('chat') // 'chat' | 'participants'
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)


  useEffect(() => {
    if (!socketRef.current) {
      const url = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:4960')
      socketRef.current = io(url, {
        transports: ['websocket', 'polling'],
        withCredentials: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 500,
      })
      socketRef.current.on('connect', () => {
        setConnected(true)
        // Join after successful connection to avoid lost buffered emits in edge environments
        socketRef.current?.emit('chat:join', { name: currentUserName || 'User' })
      })
      socketRef.current.on('connect_error', () => setConnected(false))
      socketRef.current.on('disconnect', () => setConnected(false))
      socketRef.current.on('chat:message', (payload) => setMessages(m => [...m, payload]))
      socketRef.current.on('chat:history', (history) => {
        // Load chat history from MongoDB
        if (Array.isArray(history)) {
          setMessages(history)
        }
      })
      socketRef.current.on('chat:participants', (list) => {
        // list is [{ id, name }]
        setParticipants(Array.isArray(list) ? list : [])
        setTick(t => t + 1)
      })
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect')
        socketRef.current.off('connect_error')
        socketRef.current.off('disconnect')
        socketRef.current.off('chat:message')
        socketRef.current.off('chat:history')
        socketRef.current.off('chat:participants')
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const [tick, setTick] = useState(0)

  function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return
    const text = input.trim()
    setMessages(m => [...m, { from: currentUserName, text, me: true }])
    socketRef.current?.emit('chat:message', text)
    setInput('')
  }

  return (
    <>
      <button className="fab chat-fab" onClick={() => setOpen(v => !v)} aria-label="Chat">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={connected ? "1" : "0.4"}/>
        </svg>
      </button>
      {open && (
        <div className="chat-modal">
          <div className="tabbar">
            <button className={tab === 'chat' ? 'tab active' : 'tab'} onClick={() => setTab('chat')}>Chat</button>
            <button className={tab === 'participants' ? 'tab active' : 'tab'} onClick={() => setTab('participants')}>Participants</button>
          </div>
          {!connected && (
            <div className="chat-body" style={{ padding: 12 }}>
              <div className="bubble">Connecting to chat server…</div>
            </div>
          )}
          {tab === 'chat' && connected && (
            <div className="chat-body">
              {messages.map((m, idx) => (
                <div key={idx} className={"bubble" + (m.me ? ' me' : '')}>
                  {!m.me && <div className="bubble-author">{m.from}</div>}
                  <div className="bubble-text">{m.text}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 'participants' && (
            <div className="participants">
              <div className="participants-head">
                <span>Name</span>
                {canKick && <span>Action</span>}
              </div>
              <ul>
                {participants.map(p => (
                  <li key={p.id}>
                    <span>{p.name}</span>
                    {canKick && <button className="link" onClick={() => kickStudent(p.id)}>Kick out</button>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tab === 'chat' && (
            <form className="chat-input" onSubmit={sendMessage}>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message" />
              <button className="pill-cta" type="submit" disabled={!connected}>Send</button>
            </form>
          )}
        </div>
      )}
    </>
  )
}

export default ChatWidget


