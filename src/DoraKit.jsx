import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }
const pad = (n) => String(n).padStart(2, '0')
const pill = 'rounded-full px-3 py-1 text-sm font-semibold bg-white/80 border-2 border-white shadow-sm'
const field = 'rounded-xl px-3 py-2 bg-white/80 border-2 outline-none min-w-0'

const THEMES = {
  'Doraemon Blue': { a: '#1e90ff', b: '#8fd3ff', foot: '#2a5a8c', bg: 'linear-gradient(160deg,#e3f4ff,#f6fbff 50%,#d9eeff)' },
  'Nobita Yellow': { a: '#ffb800', b: '#ffe58a', foot: '#7a5a00', bg: 'linear-gradient(160deg,#fff7d6,#fffdf2 50%,#fff0b3)' },
  'Shizuka Pink': { a: '#ff6fb5', b: '#ffc2e2', foot: '#8a3a68', bg: 'linear-gradient(160deg,#ffe8f4,#fff8fc 50%,#ffdcee)' },
  'Gian Red': { a: '#ff5a4d', b: '#ffb0a8', foot: '#8a2f28', bg: 'linear-gradient(160deg,#ffe9e6,#fff8f7 50%,#ffd8d3)' },
  'Night Sky': { a: '#7b6cff', b: '#4a4fb8', foot: '#d6d8ff', bg: 'linear-gradient(160deg,#1d2060,#2b2f80 50%,#161a4d)' },
}

/* ---------- Theme + preference bar ---------- */
export function ThemeBar() {
  const [theme, setTheme] = useState(() => load('dw_theme', 'Doraemon Blue'))
  const [decor, setDecor] = useState(() => load('dw_decor', true))
  const [calm, setCalm] = useState(() => load('dw_calm', false))
  useEffect(() => {
    const t = THEMES[theme] || THEMES['Doraemon Blue']
    const s = document.documentElement.style
    s.setProperty('--a', t.a); s.setProperty('--b', t.b); s.setProperty('--bg', t.bg); s.setProperty('--foot', t.foot)
    save('dw_theme', theme)
  }, [theme])
  useEffect(() => {
    document.documentElement.dataset.decor = decor ? 'on' : 'off'
    document.documentElement.dataset.calm = 'off'
    save('dw_decor', decor); save('dw_calm', calm)
  }, [decor, calm])
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
      {Object.entries(THEMES).map(([n, t]) => (
        <button key={n} title={n} aria-label={`Theme: ${n}`} onClick={() => setTheme(n)}
          style={{ background: t.a }} className={`w-7 h-7 rounded-full border-2 border-white shadow ${theme === n ? 'ring-2 ring-slate-700' : ''}`} />
      ))}
      <button onClick={() => setDecor((d) => !d)} className={pill} aria-pressed={decor}>☁️ Decor {decor ? 'on' : 'off'}</button>

    </div>
  )
}

/* ---------- Floating clouds and twinkling stars ---------- */
export function Sky() {
  return (
    <div className="dw-sky fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="dw-cloud" style={{ top: `${8 + i * 21}%`, animationDuration: `${60 + i * 25}s`, animationDelay: `${-i * 20}s` }} />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="dw-star" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 90}%`, animationDelay: `${(i % 5) * 0.7}s` }}>✦</span>
      ))}
    </div>
  )
}

/* ---------- Custom cursor: dot + trailing ring + star burst on click ---------- */
export function Cursor() {
  const dot = useRef(); const ring = useRef()
  useEffect(() => {
    if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return
    document.documentElement.classList.add('cursor-on')
    let x = -50, y = -50, rx = -50, ry = -50, big = false, raf
    const move = (e) => { x = e.clientX; y = e.clientY; big = !!e.target.closest?.('button,a,input,select,li') }
    const click = (e) => confetti({
      shapes: ['star'], colors: ['#ffd23f', '#4de1ff', '#ff7ac6'], particleCount: 8, spread: 70, startVelocity: 14,
      scalar: 0.6, ticks: 30, gravity: 0.6, origin: { x: e.clientX / innerWidth, y: e.clientY / innerHeight }, disableForReducedMotion: true,
    })
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18
      if (dot.current) dot.current.style.transform = `translate(${x - 5}px,${y - 5}px)`
      if (ring.current) ring.current.style.transform = `translate(${rx - 18}px,${ry - 18}px) scale(${big ? 1.6 : 1})`
      raf = requestAnimationFrame(loop)
    }
    addEventListener('mousemove', move); addEventListener('click', click); loop()
    return () => {
      cancelAnimationFrame(raf); removeEventListener('mousemove', move); removeEventListener('click', click)
      document.documentElement.classList.remove('cursor-on')
    }
  }, [])
  const base = 'fixed top-0 left-0 pointer-events-none z-50 rounded-full'
  return (
    <>
      <div ref={ring} className={`${base} w-9 h-9 border-2`} style={{ borderColor: 'var(--a)', transition: 'scale .15s' }} />
      <div ref={dot} className={`${base} w-2.5 h-2.5`} style={{ background: 'var(--a)' }} />
    </>
  )
}

/* ---------- Greeting + speech bubble ---------- */
const TIPS = ['Small steps still count.', 'Pick one task and start it now.', 'Done is better than perfect!', 'Take a short break when the timer rings.', 'You have got this!']
export function Greeting({ name }) {
  const d = new Date(); const h = d.getHours()
  const hi = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return (
    <div className="mb-4">
      <p className="text-xl font-semibold">{hi}, {(name || 'friend').split('@')[0]}!</p>
      <div className="mt-2 rounded-2xl px-4 py-2 text-sm bg-white/80 border-2" style={{ borderColor: 'var(--b)' }}>💬 {TIPS[d.getDate() % TIPS.length]}</div>
    </div>
  )
}

/* ---------- Toast ---------- */
export function useToast() {
  const [msg, setMsg] = useState(null); const timer = useRef()
  const toast = useCallback((m) => { setMsg(m); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(null), 5000) }, [])
  const toastNode = (
    <AnimatePresence>
      {msg && (
        <motion.div role="status" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 rounded-2xl bg-white px-5 py-3 shadow-xl border-2 font-semibold text-slate-800"
          style={{ borderColor: 'var(--a)' }}>{msg}</motion.div>
      )}
    </AnimatePresence>
  )
  return { toast, toastNode }
}

function beep() {
  try { const c = new AudioContext(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.value = 0.1; o.start(); o.stop(c.currentTime + 0.4) } catch { /* ignore */ }
}

/* ---------- Timer (uses an end timestamp, so it stays accurate in background tabs) ---------- */
function Timer({ sound, setSound, toast }) {
  const [total, setTotal] = useState(25 * 60); const [left, setLeft] = useState(25 * 60); const [run, setRun] = useState(false)
  const [custom, setCustom] = useState(''); const end = useRef(0)
  useEffect(() => {
    if (!run) return
    const id = setInterval(() => {
      const l = Math.max(0, Math.ceil((end.current - Date.now()) / 1000)); setLeft(l)
      if (l === 0) { setRun(false); confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } }); toast('⏰ Time is up! Great job!'); if (sound) beep() }
    }, 250)
    return () => clearInterval(id)
  }, [run, sound, toast])
  const start = () => { const l = left || total; setLeft(l); end.current = Date.now() + l * 1000; setRun(true) }
  const setMin = (m) => { if (m > 0 && m <= 600) { setTotal(m * 60); setLeft(m * 60); setRun(false) } }
  const p = total ? left / total : 0; const R = 52; const C = 2 * Math.PI * R
  const face = left === 0 ? '🎉' : p > 0.75 ? '😴' : p > 0.5 ? '🙂' : p > 0.25 ? '😃' : '😅'
  return (
    <div className="text-center">
      <div className="relative w-44 h-44 mx-auto">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="#fff" fillOpacity=".7" stroke="#0002" strokeWidth="9" />
          <circle cx="60" cy="60" r={R} fill="none" stroke="var(--a)" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} style={{ transition: 'stroke-dashoffset .3s' }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-slate-800">
          <div><div className="text-3xl">{face}</div><div className="text-2xl font-bold tabular-nums">{pad(Math.floor(left / 3600))}:{pad(Math.floor(left / 60) % 60)}:{pad(left % 60)}</div></div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 my-3">
        {[5, 10, 15, 25, 30, 60].map((m) => <button key={m} onClick={() => setMin(m)} className={pill}>{m}m</button>)}
        <input type="number" min="1" max="600" placeholder="min" value={custom} onChange={(e) => setCustom(e.target.value)} onBlur={() => { setMin(Number(custom)); setCustom('') }} className={`${field} w-20`} style={{ borderColor: 'var(--b)' }} aria-label="Custom minutes" />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {run ? <button className={pill} onClick={() => { setLeft(Math.max(0, Math.ceil((end.current - Date.now()) / 1000))); setRun(false) }}>⏸ Pause</button>
          : <button className={pill} onClick={start}>{left > 0 && left < total ? '▶ Resume' : '▶ Start'}</button>}
        <button className={pill} onClick={() => { setRun(false); setLeft(total) }}>↺ Reset</button>
        <button className={pill} onClick={() => { setLeft(total); end.current = Date.now() + total * 1000; setRun(true) }}>⟳ Restart</button>
        <button className={pill} aria-pressed={sound} onClick={() => setSound((s) => !s)}>{sound ? '🔔 Sound on' : '🔕 Sound off'}</button>
      </div>
    </div>
  )
}

/* ---------- Stopwatch (performance.now based, no drift) ---------- */
const fmt = (ms) => `${pad(Math.floor(ms / 60000))}:${pad(Math.floor(ms / 1000) % 60)}.${pad(Math.floor(ms / 10) % 100)}`
function Stopwatch() {
  const [ms, setMs] = useState(0); const [run, setRun] = useState(false); const [laps, setLaps] = useState([])
  const base = useRef(0); const t0 = useRef(0)
  useEffect(() => {
    if (!run) return
    let raf; const f = () => { setMs(base.current + performance.now() - t0.current); raf = requestAnimationFrame(f) }
    raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf)
  }, [run])
  const lap = () => { const prev = laps[0]?.total || 0; setLaps([{ n: laps.length + 1, total: ms, split: ms - prev }, ...laps]) }
  return (
    <div className="text-center">
      <div className="text-5xl font-bold tabular-nums text-slate-800 my-3"><motion.span animate={run ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="inline-block text-3xl mr-2">⏱️</motion.span>{fmt(ms)}</div>
      <div className="flex justify-center gap-2 mb-3">
        {run ? <button className={pill} onClick={() => { base.current += performance.now() - t0.current; setMs(base.current); setRun(false) }}>⏸ Pause</button>
          : <button className={pill} onClick={() => { t0.current = performance.now(); setRun(true) }}>▶ {ms ? 'Resume' : 'Start'}</button>}
        <button className={pill} disabled={!run} onClick={lap}>🚩 Lap</button>
        <button className={pill} onClick={() => { base.current = 0; setMs(0); setRun(false); setLaps([]) }}>↺ Reset</button>
      </div>
      <ul className="max-h-40 overflow-auto text-sm text-slate-700 space-y-1">
        {laps.map((l) => <li key={l.n} className="flex justify-between rounded-xl bg-white/70 px-3 py-1"><span>Lap {l.n}</span><span className="tabular-nums">{fmt(l.split)} <span className="opacity-60">({fmt(l.total)})</span></span></li>)}
      </ul>
    </div>
  )
}

/* ---------- Schedule (saved in this browser with localStorage, per user) ---------- */
const CATS = { Study: ['📚', '#1e90ff'], Fun: ['🎈', '#ff6fb5'], Work: ['💼', '#8a6cff'], Chill: ['🍡', '#ffb800'] }
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function Schedule({ uid, toast }) {
  const key = `dw_events_${uid}`
  const [ev, setEv] = useState(() => load(key, []))
  const blank = { id: null, title: '', date: todayStr(), time: '09:00', cat: 'Study' }
  const [f, setF] = useState(blank)
  const evRef = useRef(ev)
  useEffect(() => { evRef.current = ev; save(key, ev) }, [ev, key])
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      const due = evRef.current.filter((e) => !e.fired && new Date(`${e.date}T${e.time}`).getTime() <= now)
      if (!due.length) return
      setEv((p) => p.map((e) => (due.some((d) => d.id === e.id) ? { ...e, fired: true } : e)))
      toast(`🔔 ${due[0].title} is due now!`); confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } })
    }, 15000)
    return () => clearInterval(id)
  }, [toast])
  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim()) return
    const item = { ...f, title: f.title.trim(), id: f.id || crypto.randomUUID(), fired: false }
    setEv((p) => (f.id ? p.map((x) => (x.id === f.id ? item : x)) : [...p, item])); setF(blank)
  }
  const sorted = [...ev].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const t = todayStr()
  const Row = ({ e }) => (
    <li className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-slate-800 border-l-4" style={{ borderColor: CATS[e.cat][1] }}>
      <span className="text-xl">{CATS[e.cat][0]}</span>
      <span className="flex-1 min-w-0 break-words"><b>{e.title}</b><br /><span className="text-xs opacity-70">{e.date} · {e.time}</span></span>
      <button aria-label="Edit event" onClick={() => setF(e)}>✏️</button>
      <button aria-label="Delete event" onClick={() => setEv((p) => p.filter((x) => x.id !== e.id))}>🗑️</button>
    </li>
  )
  const today = sorted.filter((e) => e.date === t); const next = sorted.filter((e) => e.date > t)
  return (
    <div className="text-slate-800">
      <form onSubmit={submit} className="grid grid-cols-2 gap-2 mb-4">
        <input className={`${field} col-span-2`} style={{ borderColor: 'var(--b)' }} placeholder="Event title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={80} />
        <input type="date" className={field} style={{ borderColor: 'var(--b)' }} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <input type="time" className={field} style={{ borderColor: 'var(--b)' }} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
        <select className={field} style={{ borderColor: 'var(--b)' }} value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}>{Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}</select>
        <motion.button whileTap={{ scale: 0.92 }} className="rounded-xl font-semibold text-white" style={{ background: 'var(--a)' }}>{f.id ? 'Save changes' : 'Add event'}</motion.button>
      </form>
      {!ev.length && <p className="text-center opacity-70">🌟 No events yet. Add your first one above!</p>}
      {today.length > 0 && <><h3 className="font-semibold mb-1">Today</h3><ul className="space-y-2 mb-3">{today.map((e) => <Row key={e.id} e={e} />)}</ul></>}
      {next.length > 0 && <><h3 className="font-semibold mb-1">Upcoming</h3><ul className="space-y-2">{next.map((e) => <Row key={e.id} e={e} />)}</ul></>}
      <p className="text-xs opacity-60 mt-3">Events are saved in this browser only. Reminders show while this page is open.</p>
    </div>
  )
}

/* ---------- Tools panel ---------- */
export function Tools({ uid, toast, tabs = ['Timer', 'Stopwatch', 'Schedule'] }) {
  const [tab, setTab] = useState(tabs[0]); const [sound, setSound] = useState(false)
  useEffect(() => { const h = (e) => { if (tabs.includes(e.detail)) setTab(e.detail) }; addEventListener('dw-tab', h); return () => removeEventListener('dw-tab', h) }, [])
  return (
    <div id="dw-tools" className="mt-6 rounded-[2rem] p-[3px] shadow-xl" style={{ background: 'linear-gradient(135deg,var(--a),var(--b))' }}>
      <div className="rounded-[calc(2rem-3px)] bg-white/70 backdrop-blur-xl p-5">
        <div className="flex gap-2 justify-center mb-4" role="tablist">
          {[['Timer', '⏳'], ['Stopwatch', '⏱️'], ['Schedule', '📅']].filter(([n]) => tabs.includes(n)).map(([n, i]) => (
            <button key={n} role="tab" aria-selected={tab === n} onClick={() => setTab(n)}
              className="rounded-full px-4 py-2 font-semibold border-2 border-white shadow-sm"
              style={tab === n ? { background: 'var(--a)', color: '#fff' } : { background: '#fffc', color: '#334' }}>{i} {n}</button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }}>
            {tab === 'Timer' && <Timer sound={sound} setSound={setSound} toast={toast} />}
            {tab === 'Stopwatch' && <Stopwatch />}
            {tab === 'Schedule' && <Schedule uid={uid} toast={toast} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}