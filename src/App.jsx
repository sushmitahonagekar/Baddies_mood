import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Cursor, Sky, Greeting, ThemeBar, Tools, useToast } from './DoraKit.jsx'
import { Friends } from './Friends.jsx'
import { Door, Cheer, ExtrasPanel } from './Extras.jsx'
import { Shell, Pane, Home, Habits, Notes, Settings } from './Shell.jsx'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

/* ---------- Floating glow bubbles ---------- */
const BUBBLES = [
  { c: '#ff7ac6', s: 260, x: '5%',  y: '10%', d: 14 },
  { c: '#4de1ff', s: 320, x: '70%', y: '5%',  d: 18 },
  { c: '#a77bff', s: 300, x: '60%', y: '65%', d: 16 },
  { c: '#ffe14d', s: 220, x: '8%',  y: '70%', d: 20 },
  { c: '#ff7ac6', s: 140, x: '85%', y: '45%', d: 12 },
  { c: '#4de1ff', s: 120, x: '30%', y: '85%', d: 15 },
]
function Bubbles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
      {BUBBLES.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.s, height: b.s, left: b.x, top: b.y,
            background: `radial-gradient(circle at 30% 30%, #fff9, ${b.c}aa 55%, ${b.c}00 72%)`,
            filter: 'blur(6px)', boxShadow: `0 0 80px ${b.c}66`,
          }}
          animate={{ y: [0, -50, 20, 0], x: [0, 30, -30, 0], scale: [1, 1.08, 0.95, 1] }}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
        />
      ))}
    </div>
  )
}

/* ---------- Mascot: idle | happy | surprised ---------- */
function Mascot({ mood }) {
  const eyes = {
    idle: (<><ellipse cx="42" cy="52" rx="6" ry="8" fill="#3b2a5a" /><ellipse cx="78" cy="52" rx="6" ry="8" fill="#3b2a5a" /></>),
    happy: (<><path d="M34 54 Q42 42 50 54" stroke="#3b2a5a" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M70 54 Q78 42 86 54" stroke="#3b2a5a" strokeWidth="5" fill="none" strokeLinecap="round" /></>),
    surprised: (<><circle cx="42" cy="50" r="10" fill="#fff" stroke="#3b2a5a" strokeWidth="3" /><circle cx="78" cy="50" r="10" fill="#fff" stroke="#3b2a5a" strokeWidth="3" /><circle cx="42" cy="50" r="4" fill="#3b2a5a" /><circle cx="78" cy="50" r="4" fill="#3b2a5a" /></>),
  }
  const mouth = {
    idle: <path d="M48 72 Q60 82 72 72" stroke="#3b2a5a" strokeWidth="5" fill="none" strokeLinecap="round" />,
    happy: <path d="M44 70 Q60 94 76 70 Z" fill="#ff5c93" stroke="#3b2a5a" strokeWidth="4" strokeLinejoin="round" />,
    surprised: <ellipse cx="60" cy="78" rx="7" ry="9" fill="#ff5c93" stroke="#3b2a5a" strokeWidth="3.5" />,
  }
  const body = {
    idle: { y: [0, -6, 0], rotate: 0 },
    happy: { y: [0, -22, 0], rotate: [0, -8, 8, 0] },
    surprised: { y: [0, -14, 0], scale: [1, 1.15, 1] },
  }
  return (
    <motion.svg
      viewBox="0 0 120 120" className="w-28 h-28 mx-auto drop-shadow-xl"
      key={mood} animate={body[mood]}
      transition={{ duration: mood === 'idle' ? 2.5 : 0.6, repeat: mood === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
    >
      <defs>
        <radialGradient id="mb" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#ffe9a8" /><stop offset="100%" stopColor="#ffb4d9" />
        </radialGradient>
      </defs>
      <path d="M30 24 Q24 6 40 12" stroke="#a77bff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M90 24 Q96 6 80 12" stroke="#4de1ff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="64" rx="48" ry="44" fill="url(#mb)" stroke="#3b2a5a" strokeWidth="4" />
      <circle cx="28" cy="70" r="7" fill="#ff7ac6" opacity=".5" />
      <circle cx="92" cy="70" r="7" fill="#ff7ac6" opacity=".5" />
      {eyes[mood]}{mouth[mood]}
    </motion.svg>
  )
}

/* ---------- Shared card ---------- */
const Card = ({ children, className = '' }) => (
  <div className={`rounded-[2rem] p-[3px] bg-gradient-to-br from-pink-300 via-cyan-300 to-purple-300 shadow-[0_20px_60px_-15px_rgba(167,123,255,.5)] ${className}`}>
    <div className="rounded-[calc(2rem-3px)] bg-white/60 backdrop-blur-xl p-4 sm:p-8">{children}</div>
  </div>
)

const bigButton = 'w-full rounded-2xl py-3 font-semibold text-white bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 shadow-lg disabled:opacity-60'

/* ---------- Login / Sign up (email + password) ---------- */
function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [isError, setIsError] = useState(true)

  const cleanEmail = email.trim().toLowerCase()
  const isSignup = mode === 'signup'

  function say(text, error = true) { setMsg(text); setIsError(error) }

  async function submit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return say('Enter a valid email address.')
    if (password.length < 8) return say('Password must be at least 8 characters.')
    setBusy(true); setMsg(null)

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password })
      setBusy(false)
      if (error) return say(error.message)
      if (data.user && data.user.identities?.length === 0) return say('This email already has an account. Log in instead.')
      if (!data.session) {
        const { error: e2 } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
        if (e2) say('Account created. Check your email to confirm it, then log in.', false)
      }
      // if a session came back, onAuthStateChange takes the user to the dashboard
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      setBusy(false)
      if (error) say(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <motion.div initial={{ scale: 0.85, opacity: 0, rotate: -3 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }} className="w-full max-w-md">
        <Mascot mood={isSignup ? 'happy' : 'idle'} />
        <Card className="-mt-6">
          <h1 className="text-3xl font-bold text-center mt-4">{isSignup ? 'Join the fun!' : 'Hop in!'}</h1>
          <p className="text-center text-purple-900/60 mb-6">
            {isSignup ? 'Create your account with an email and password.' : 'Log in with your email and password.'}
          </p>
          <form onSubmit={submit} className="space-y-4">
            <input type="email" autoComplete="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 bg-white/80 border-2 border-pink-200 focus:border-purple-400 outline-none text-lg" />
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder="Password (8+ characters)" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl px-4 py-3 pr-16 bg-white/80 border-2 border-cyan-200 focus:border-purple-400 outline-none text-lg" />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-purple-700 underline">
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} disabled={busy} className={bigButton}>
              {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
            </motion.button>
          </form>
          <button type="button" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setMsg(null) }}
            className="w-full mt-4 text-sm text-purple-700 underline">
            {isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}
          </button>
          {msg && (
            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className={`mt-4 text-center text-sm ${isError ? 'text-rose-600' : 'text-emerald-700'}`} role="alert">
              {msg}
            </motion.p>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

/* ---------- Animated checkbox ---------- */
function Check({ checked, onClick }) {
  return (
    <motion.button type="button" onClick={onClick} aria-pressed={checked} aria-label="Toggle task"
      whileTap={{ scale: 0.7 }} animate={{ scale: checked ? [1, 1.35, 1] : 1, rotate: checked ? [0, 20, 0] : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 12 }}
      className={`shrink-0 w-8 h-8 rounded-full border-[3px] grid place-items-center ${checked ? 'bg-gradient-to-br from-pink-400 to-purple-500 border-transparent' : 'bg-white border-purple-300'}`}>
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <motion.path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
          initial={false} animate={{ pathLength: checked ? 1 : 0 }} transition={{ duration: 0.25 }} />
      </svg>
    </motion.button>
  )
}

/* ---------- Dashboard ---------- */
function Dashboard({ session }) {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mood, setMood] = useState('idle')
  const moodTimer = useRef()

  const react = useCallback((m) => {
    setMood(m)
    clearTimeout(moodTimer.current)
    moodTimer.current = setTimeout(() => setMood('idle'), 1800)
  }, [])

  useEffect(() => {
    supabase.from('todos').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setError(error.message); else setTodos(data)
      setLoading(false)
    })
    return () => clearTimeout(moodTimer.current)
  }, [])

  async function add(e) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    setTitle(''); react('surprised')
    const { data, error } = await supabase.from('todos').insert({ title: t }).select().single()
    if (error) { setError(error.message); setTitle(t) } else setTodos((p) => [data, ...p])
  }

  async function toggle(todo, ev) {
    const next = !todo.is_completed
    setTodos((p) => p.map((x) => (x.id === todo.id ? { ...x, is_completed: next } : x)))
    if (next) {
      const r = ev.currentTarget.getBoundingClientRect()
      confetti({
        particleCount: 110, spread: 85, startVelocity: 38,
        origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
        colors: ['#ff7ac6', '#4de1ff', '#a77bff', '#ffe14d'],
      })
      react('happy'); dispatchEvent(new CustomEvent('dw-done'))
    }
    const { error } = await supabase.from('todos').update({ is_completed: next }).eq('id', todo.id)
    if (error) { setError(error.message); setTodos((p) => p.map((x) => (x.id === todo.id ? todo : x))) }
  }

  async function remove(todo) {
    setTodos((p) => p.filter((x) => x.id !== todo.id))
    const { error } = await supabase.from('todos').delete().eq('id', todo.id)
    if (error) { setError(error.message); setTodos((p) => [todo, ...p]) }
  }

  const done = todos.filter((t) => t.is_completed).length
  const { toast, toastNode } = useToast()

  return (
    <div className="min-h-screen px-4 py-8 pb-24 md:pb-8 md:pl-60">
      <Cursor />
      <Sky />
      <Friends /><Door /><Cheer />
      <div className="max-w-xl mx-auto">
        <Shell supabase={supabase} session={session} todos={todos}><Pane id="home"><Home uid={session.user.id} email={session.user.email} meta={session.user.user_metadata || {}} todos={todos} /></Pane><Pane id="tasks">
        <Mascot mood={mood} />
        <Card className="-mt-6">
          <div className="flex items-center justify-between mt-4 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold">My tasks</h1>
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-purple-700 underline">Sign out</button>
          </div>
          <p className="text-purple-900/60 mb-4">{todos.length ? `${done} of ${todos.length} done` : 'Nothing yet. Add your first task below.'}</p>

          <Greeting name={session.user.email} />
          <div className="h-3 rounded-full bg-white/70 overflow-hidden mb-5">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400"
              animate={{ width: todos.length ? `${(done / todos.length) * 100}%` : '0%' }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
          </div>

          <form onSubmit={add} className="flex gap-2 mb-5">
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="What needs doing?"
              className="flex-1 min-w-0 rounded-2xl px-4 py-3 bg-white/80 border-2 border-pink-200 focus:border-purple-400 outline-none" />
            <motion.button whileHover={{ scale: 1.08, rotate: -2 }} whileTap={{ scale: 0.9 }}
              animate={{ boxShadow: ['0 0 0 0 #ff7ac680', '0 0 0 12px #ff7ac600'] }}
              transition={{ boxShadow: { duration: 1.6, repeat: Infinity } }}
              className="rounded-2xl px-5 font-semibold text-white bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
              Add task
            </motion.button>
          </form>

          {error && <p className="mb-3 text-sm text-rose-600" role="alert">{error}</p>}
          {loading && <p className="text-center text-purple-900/60">Loading your tasks…</p>}

          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {todos.map((t) => (
                <motion.li key={t.id} layout
                  initial={{ opacity: 0, scale: 0.6, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, rotate: 8, transition: { duration: 0.3 } }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  className="flex items-center gap-3 rounded-2xl bg-white/70 border-2 border-white px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
                  <Check checked={t.is_completed} onClick={(e) => toggle(t, e)} />
                  <span className="relative flex-1 min-w-0 break-words text-base sm:text-lg">
                    <motion.span animate={{ opacity: t.is_completed ? 0.45 : 1 }}>{t.title}</motion.span>
                    <motion.span aria-hidden className="absolute left-0 top-1/2 h-[3px] rounded bg-pink-400 origin-left w-full"
                      initial={false} animate={{ scaleX: t.is_completed ? 1 : 0 }} transition={{ duration: 0.35 }} />
                  </span>
                  <motion.button onClick={() => remove(t)} aria-label="Delete task" whileHover={{ scale: 1.2, rotate: 12 }} whileTap={{ scale: 0.8 }}
                    className="shrink-0 text-xl">🗑️</motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Card>
        </Pane><Pane id="timer"><Tools uid={session.user.id} toast={toast} tabs={['Timer', 'Stopwatch']} /></Pane><Pane id="calendar"><ExtrasPanel uid={session.user.id} /></Pane><Pane id="schedule"><Tools uid={session.user.id} toast={toast} tabs={['Schedule']} /></Pane><Pane id="habits"><Habits uid={session.user.id} /></Pane><Pane id="notes"><Notes uid={session.user.id} /></Pane><Pane id="settings"><Settings supabase={supabase} meta={session.user.user_metadata || {}} /></Pane></Shell>
        {toastNode}
        <p className="text-center text-xs mt-4" style={{ color: 'var(--foot)' }}>Signed in as {session.user.email}</p>
      </div>
    </div>
  )
}

/* ---------- Root ---------- */
export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <>
      <Bubbles />
      {session === undefined ? null : session ? <Dashboard session={session} /> : <Login />}
    </>
  )
}