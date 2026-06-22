import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../services/chat'
import { FiSend, FiLogOut, FiUser, FiMail, FiLock, FiMessageCircle, FiAlertCircle } from 'react-icons/fi'

function AuthForm({ onSuccess }) {
  const { register, login, loading } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'register') {
        await register(email, password, displayName)
      } else {
        await login(email, password)
      }
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-deep rounded-3xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg,#4285F4,#EA4335)' }}>
            <FiMessageCircle className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold font-zentry uppercase" style={{ color: '#0a0a0a' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join GGSC'}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
            {mode === 'login' ? 'Sign in to the discussion board' : 'Create your account'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex mb-6 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.04)' }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              className="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300"
              style={mode === m ? { background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', color: '#0a0a0a' } : { color: 'rgba(0,0,0,0.35)' }}>
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'rgba(0,0,0,0.3)' }} />
              <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                style={{ background: 'rgba(0,0,0,0.04)', color: '#0a0a0a' }}
                onFocus={(e) => e.target.style.background = 'rgba(66,133,244,0.06)'}
                onBlur={(e) => e.target.style.background = 'rgba(0,0,0,0.04)'} />
            </div>
          )}
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'rgba(0,0,0,0.3)' }} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ background: 'rgba(0,0,0,0.04)', color: '#0a0a0a' }}
              onFocus={(e) => e.target.style.background = 'rgba(66,133,244,0.06)'}
              onBlur={(e) => e.target.style.background = 'rgba(0,0,0,0.04)'} />
          </div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: 'rgba(0,0,0,0.3)' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ background: 'rgba(0,0,0,0.04)', color: '#0a0a0a' }}
              onFocus={(e) => e.target.style.background = 'rgba(66,133,244,0.06)'}
              onBlur={(e) => e.target.style.background = 'rgba(0,0,0,0.04)'} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg" style={{ background: 'rgba(234,67,53,0.08)', color: '#EA4335' }}>
              <FiAlertCircle size={14} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#4285F4,#EA4335)' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ChatRoom({ groupId }) {
  const { user, token, logout } = useAuth()
  const { messages, sendMessage, connected, error } = useChat(token, groupId)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    sendMessage(trimmed)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col" style={{ height: 'min(600px, 70vh)' }}>
      {/* Header */}
      <div className="glass-deep rounded-t-3xl px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: connected ? '#34A853' : '#EA4335' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.4)' }}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="w-px h-4" style={{ background: 'rgba(0,0,0,0.1)' }} />
          <span className="text-xs font-medium" style={{ color: 'rgba(0,0,0,0.5)' }}>
            #{groupId}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium hidden sm:block" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {user?.displayName}
          </span>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:opacity-60"
            style={{ color: 'rgba(0,0,0,0.35)' }}>
            <FiLogOut size={14} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ background: 'rgba(255,255,255,0.5)' }}>
        {error && (
          <div className="flex items-center gap-2 text-xs font-medium px-4 py-3 rounded-xl" style={{ background: 'rgba(234,67,53,0.08)', color: '#EA4335' }}>
            <FiAlertCircle size={14} />
            {error}
          </div>
        )}

        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FiMessageCircle size={40} style={{ color: 'rgba(0,0,0,0.1)' }} />
            <p className="text-sm mt-3" style={{ color: 'rgba(0,0,0,0.3)' }}>
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.userId === user?.userId
          return (
            <div key={msg.messageId} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isOwn ? 'rounded-tr-md' : 'rounded-tl-md'}`}
                style={isOwn ? { background: 'linear-gradient(135deg,#4285F4,#34A853)', color: '#fff' } : { background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', color: '#0a0a0a' }}>
                {!isOwn && (
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(0,0,0,0.35)' }}>
                    {msg.displayName || msg.userId?.slice(0, 8)}
                  </p>
                )}
                <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-right' : 'text-left'}`} style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)' }}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-deep rounded-b-3xl px-6 py-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-5 py-3 rounded-xl text-sm outline-none transition-all duration-200"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#0a0a0a' }}
            onFocus={(e) => e.target.style.background = 'rgba(66,133,244,0.06)'}
            onBlur={(e) => e.target.style.background = 'rgba(0,0,0,0.04)'} />
          <button onClick={handleSend} disabled={!input.trim() || !connected}
            className="flex items-center justify-center w-11 h-11 rounded-xl text-white transition-all duration-300 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#4285F4,#EA4335)' }}>
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DiscussionBoard() {
  const { isAuthenticated } = useAuth()
  const [groupId, setGroupId] = useState('default')

  return (
    <section id="discussion-board" className="relative min-h-screen flex items-center justify-center px-4 py-24 md:py-32">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <span className="premium-section-label">Connect</span>
          <h2 className="text-4xl md:text-6xl font-zentry font-black uppercase mt-2" style={{ lineHeight: '0.9' }}>
            Discussion<br />
            <span className="gradient-text-google">Board</span>
          </h2>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'rgba(0,0,0,0.4)' }}>
            {isAuthenticated
              ? 'Real-time group chat for the GGSC community'
              : 'Sign in to join the conversation'}
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 self-start">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.35)' }}>Room:</label>
              <select value={groupId} onChange={(e) => setGroupId(e.target.value)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                style={{ background: 'rgba(0,0,0,0.04)', color: '#0a0a0a' }}>
                <option value="default">General</option>
                <option value="tech">Tech</option>
                <option value="events">Events</option>
                <option value="projects">Projects</option>
              </select>
            </div>
            <ChatRoom key={groupId} groupId={groupId} />
          </div>
        ) : (
          <AuthForm />
        )}
      </div>
    </section>
  )
}
