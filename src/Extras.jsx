import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }
const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fire = (name, detail) => dispatchEvent(new CustomEvent(name, { detail }))
const pill = 'rounded-full px-3 py-1 text-sm font-semibold border-2 border-white shadow-sm'
const ink = '#3b2a5a'

/* ---------- Bun the bunny cheers when a task is completed ---------- */
const CHEERS = ['Yay!', 'Great job!', 'You rock!', 'Task smashed!', 'Awesome!']
export function Cheer() {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    let t
    const h = () => { setMsg(CHEERS[Math.floor(Math.random() * CHEERS.length)]); clearTimeout(t); t = setTimeout(() => setMsg(null), 2200) }
    addEventListener('dw-done', h)
    return () => { removeEventListener('dw-done', h); clearTimeout(t) }
  }, [])
  return (
    <AnimatePresence>
      {msg && (
        <motion.div initial={{ y: 80, opacity: 0, scale: 0.6 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-40 right-3 z-40 w-20 pointer-events-none">
          <div className="absolute -top-8 right-0 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow">{msg}</div>
          <motion.svg viewBox="0 0 100 110" className="drop-shadow-lg" animate={{ y: [0, -14, 0] }} transition={{ duration: 0.5, repeat: 3 }}>
            <ellipse cx="34" cy="24" rx="9" ry="22" fill="#fff" stroke={ink} strokeWidth="3.5" />
            <ellipse cx="66" cy="24" rx="9" ry="22" fill="#fff" stroke={ink} strokeWidth="3.5" />
            <ellipse cx="34" cy="26" rx="4" ry="14" fill="#ffb4d9" /><ellipse cx="66" cy="26" rx="4" ry="14" fill="#ffb4d9" />
            <circle cx="50" cy="70" r="34" fill="#fff" stroke={ink} strokeWidth="3.5" />
            <path d="M34 66 Q40 58 46 66" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M54 66 Q60 58 66 66" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="30" cy="78" r="6" fill="#ff9ccf" opacity=".7" /><circle cx="70" cy="78" r="6" fill="#ff9ccf" opacity=".7" />
            <path d="M42 80 Q50 90 58 80 Z" fill="#ff5c93" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Rewards: badges + day streak (saved in this browser) ---------- */
const streakOf = (days) => {
  let c = 0; const d = new Date()
  if (!days.includes(ymd(d))) d.setDate(d.getDate() - 1)
  while (days.includes(ymd(d))) { c++; d.setDate(d.getDate() - 1) }
  return c
}
function Rewards({ uid }) {
  const key = `dw_rewards_${uid}`
  const [s, setS] = useState(() => load(key, { total: 0, days: [] }))
  useEffect(() => {
    const h = () => setS((p) => {
      const t = ymd(new Date())
      const n = { total: p.total + 1, days: p.days.includes(t) ? p.days : [...p.days, t].slice(-90) }
      save(key, n); return n
    })
    addEventListener('dw-done', h)
    return () => removeEventListener('dw-done', h)
  }, [key])
  const st = streakOf(s.days)
  const B = [['🌱', 'First task', s.total >= 1], ['⭐', '5 tasks', s.total >= 5], ['🏆', '10 tasks', s.total >= 10], ['🔥', '3-day streak', st >= 3]]
  return (
    <div className="text-center text-slate-800">
      <p className="text-2xl font-bold">🔥 {st} day streak</p>
      <p className="text-sm opacity-70 mb-4">{s.total} tasks completed in total</p>
      <div className="grid grid-cols-2 gap-2">
        {B.map(([i, n, on]) => (
          <motion.div key={n} animate={on ? { scale: [1, 1.08, 1] } : {}} className={`rounded-2xl px-3 py-3 border-2 border-white ${on ? 'bg-white/90' : 'bg-white/40 opacity-50 grayscale'}`}>
            <div className="text-3xl">{i}</div><div className="text-sm font-semibold">{n}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Calendar: week and month views (reads the Schedule events) ---------- */
const CC = { Study: '#1e90ff', Fun: '#ff6fb5', Work: '#8a6cff', Chill: '#ffb800' }
function Calendar({ uid }) {
  const key = `dw_events_${uid}`
  const [ev, setEv] = useState(() => load(key, []))
  const [view, setView] = useState('Month')
  const [cur, setCur] = useState(new Date())
  const [sel, setSel] = useState(ymd(new Date()))
  useEffect(() => { const id = setInterval(() => setEv(load(key, [])), 2000); return () => clearInterval(id) }, [key])
  const on = (d) => ev.filter((e) => e.date === ymd(d)).sort((a, b) => a.time.localeCompare(b.time))
  const move = (n) => { const d = new Date(cur); if (view === 'Month') d.setMonth(d.getMonth() + n, 1); else d.setDate(d.getDate() + 7 * n); setCur(d) }
  let cells
  if (view === 'Month') {
    const y = cur.getFullYear(); const m = cur.getMonth()
    cells = [...Array(new Date(y, m, 1).getDay()).fill(null), ...Array(new Date(y, m + 1, 0).getDate()).fill(0).map((_, i) => new Date(y, m, i + 1))]
  } else {
    const s = new Date(cur); s.setDate(s.getDate() - s.getDay())
    cells = Array(7).fill(0).map((_, i) => { const d = new Date(s); d.setDate(s.getDate() + i); return d })
  }
  const today = ymd(new Date())
  const day = ev.filter((e) => e.date === sel).sort((a, b) => a.time.localeCompare(b.time))
  return (
    <div className="text-slate-800">
      <div className="flex items-center justify-between mb-3 gap-2">
        <button className={`${pill} bg-white/80`} onClick={() => move(-1)} aria-label="Previous">◀</button>
        <b className="text-center">{cur.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</b>
        <button className={`${pill} bg-white/80`} onClick={() => move(1)} aria-label="Next">▶</button>
      </div>
      <div className="flex justify-center gap-2 mb-3">
        {['Week', 'Month'].map((v) => <button key={v} onClick={() => setView(v)} className={pill} style={view === v ? { background: 'var(--a)', color: '#fff' } : { background: '#fffc' }}>{v}</button>)}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold opacity-70 mb-1">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => d ? (
          <button key={i} onClick={() => setSel(ymd(d))}
            className={`rounded-xl p-1 text-sm bg-white/70 border-2 ${view === 'Week' ? 'min-h-20' : 'min-h-11'}`}
            style={{ borderColor: ymd(d) === sel ? 'var(--a)' : ymd(d) === today ? 'var(--b)' : 'transparent' }}>
            <div className="font-semibold">{d.getDate()}</div>
            {view === 'Week' ? on(d).slice(0, 2).map((e) => <div key={e.id} className="truncate text-[10px] rounded px-1 mt-0.5 text-white" style={{ background: CC[e.cat] }}>{e.title}</div>)
              : <div className="flex justify-center gap-0.5 flex-wrap">{on(d).slice(0, 3).map((e) => <i key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: CC[e.cat] }} />)}</div>}
          </button>
        ) : <span key={i} />)}
      </div>
      <h3 className="font-semibold mt-4 mb-1">{sel}</h3>
      {day.length ? <ul className="space-y-1">{day.map((e) => <li key={e.id} className="rounded-xl bg-white/70 px-3 py-1 text-sm border-l-4" style={{ borderColor: CC[e.cat] }}>{e.time} · <b>{e.title}</b></li>)}</ul>
        : <p className="text-sm opacity-70">Nothing planned. Add events in the Schedule tab.</p>}
    </div>
  )
}

export function ExtrasPanel({ uid }) {
  const [tab, setTab] = useState('Calendar')
  useEffect(() => { const h = (e) => setTab(e.detail); addEventListener('dw-extab', h); return () => removeEventListener('dw-extab', h) }, [])
  return (
    <div id="dw-extras" className="mt-6 rounded-[2rem] p-[3px] shadow-xl" style={{ background: 'linear-gradient(135deg,var(--b),var(--a))' }}>
      <div className="rounded-[calc(2rem-3px)] bg-white/70 backdrop-blur-xl p-5">
        <div className="flex gap-2 justify-center mb-4">
          {[['Calendar', '🗓️'], ['Rewards', '🏅']].map(([n, i]) => (
            <button key={n} onClick={() => setTab(n)} className="rounded-full px-4 py-2 font-semibold border-2 border-white shadow-sm"
              style={tab === n ? { background: 'var(--a)', color: '#fff' } : { background: '#fffc', color: '#334' }}>{i} {n}</button>
          ))}
        </div>
        {tab === 'Calendar' ? <Calendar uid={uid} /> : <Rewards uid={uid} />}
      </div>
    </div>
  )
}

/* ---------- Anywhere Door: a quick-travel menu ---------- */
export function Door() {
  const [open, setOpen] = useState(false)
  const go = (tab, id, ex) => {
    setOpen(false)
    if (tab) fire('dw-tab', tab)
    if (ex) fire('dw-extab', ex)
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    else { fire('dw-nav', 'tasks'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }
  const items = [['✅ My tasks', null, null, null], ['⏳ Timer', 'Timer', 'dw-tools'], ['⏱️ Stopwatch', 'Stopwatch', 'dw-tools'], ['📅 Schedule', 'Schedule', 'dw-tools'], ['🗓️ Calendar', null, 'dw-extras', 'Calendar'], ['🏅 Rewards', null, 'dw-extras', 'Rewards']]
  return (
    <div className="fixed bottom-20 right-3 md:bottom-4 z-40">
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, scale: 0.7, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.7, y: 20 }}
            className="absolute bottom-16 right-0 w-44 space-y-1 rounded-2xl bg-white/95 p-2 shadow-xl border-2" style={{ borderColor: 'var(--a)', transformOrigin: 'bottom right' }}>
            {items.map(([label, tab, id, ex]) => (
              <li key={label}><button onClick={() => go(tab, id, ex)} className="w-full text-left rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">{label}</button></li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <motion.button onClick={() => setOpen((o) => !o)} aria-label="Anywhere Door menu" aria-expanded={open}
        whileHover={{ scale: 1.1, rotate: -6 }} whileTap={{ scale: 0.9 }} animate={{ y: [0, -4, 0] }} transition={{ y: { duration: 2, repeat: Infinity } }}
        className="w-14 h-14 rounded-full text-2xl shadow-xl border-2 border-white" style={{ background: 'var(--a)' }}>
        {open ? '✖️' : '🚪'}
      </motion.button>
    </div>
  )
}
