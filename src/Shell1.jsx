import { createContext, useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Puffy, Twinkle, Pip } from './Friends.jsx'
import { ThemeBar } from './DoraKit.jsx'

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }
const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const TabCtx = createContext({ tab: 'home', setTab: () => {} })
const TABS = [['home', '🏠', 'Home'], ['tasks', '✅', 'Tasks'], ['timer', '⏱️', 'Timer'], ['calendar', '🗓️', 'Calendar'], ['schedule', '📅', 'Schedule'], ['habits', '🌱', 'Habits'], ['notes', '📝', 'Notes'], ['settings', '⚙️', 'Settings']]
const COMP = { puffy: ['Puffy', Puffy], twinkle: ['Twinkle', Twinkle], pip: ['Pip', Pip] }
const MAP = { Timer: 'timer', Stopwatch: 'timer', Schedule: 'schedule', Calendar: 'calendar', Rewards: 'calendar' }
const field = 'w-full rounded-xl px-3 py-2 bg-white/80 border-2 outline-none'
const btn = 'rounded-xl px-4 py-2 font-semibold text-white shadow'
const MOTTO = ['Small steps still count.', 'Pick one task and start it now.', 'Done is better than perfect!', 'Take a break when you need one.', 'You have got this!']

const Panel = ({ title, children }) => (
  <div className="mt-6 first:mt-0 rounded-[2rem] p-[3px] shadow-xl" style={{ background: 'linear-gradient(135deg,var(--a),var(--b))' }}>
    <div className="rounded-[calc(2rem-3px)] bg-white/70 backdrop-blur-xl p-4 sm:p-6 text-slate-800">
      {title && <h2 className="text-2xl font-bold mb-3">{title}</h2>}{children}
    </div>
  </div>
)

export function Pane({ id, children }) {
  const { tab } = useContext(TabCtx)
  return <div style={{ display: tab === id ? 'block' : 'none' }}>{children}</div>
}

/* ---------- Name / pet / companion form (used for first-time setup and Settings) ---------- */
function ProfileForm({ supabase, meta, label, onDone }) {
  const [name, setName] = useState(meta.name || '')
  const [pet, setPet] = useState(meta.pet || '')
  const [comp, setComp] = useState(meta.companion || 'puffy')
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null)
  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return setMsg('Please enter your name.')
    setBusy(true); setMsg(null)
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim(), pet: pet.trim(), companion: comp, onboarded: true } })
    setBusy(false)
    if (error) setMsg(error.message); else { setMsg('Saved!'); onDone?.() }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <input className={field} style={{ borderColor: 'var(--b)' }} placeholder="Your name" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
      <input className={field} style={{ borderColor: 'var(--b)' }} placeholder="Pet's name (optional)" maxLength={40} value={pet} onChange={(e) => setPet(e.target.value)} />
      <div className="flex gap-2 justify-center">
        {Object.entries(COMP).map(([k, [label2, C]]) => (
          <button type="button" key={k} onClick={() => setComp(k)} aria-pressed={comp === k} className="w-20 rounded-2xl p-2 border-2 bg-white/70"
            style={{ borderColor: comp === k ? 'var(--a)' : 'transparent' }}><C /><span className="text-xs font-semibold">{label2}</span></button>
        ))}
      </div>
      <button disabled={busy} className={`${btn} w-full`} style={{ background: 'var(--a)' }}>{busy ? 'Saving…' : label}</button>
      {msg && <p className="text-center text-sm" role="status">{msg}</p>}
    </form>
  )
}

/* ---------- Home ---------- */
function Home({ uid, email, meta, todos }) {
  const { setTab } = useContext(TabCtx)
  const [ev, setEv] = useState(() => load(`dw_events_${uid}`, []))
  const [hb, setHb] = useState(() => load(`dw_habits_${uid}`, []))
  useEffect(() => {
    const id = setInterval(() => { setEv(load(`dw_events_${uid}`, [])); setHb(load(`dw_habits_${uid}`, [])) }, 2000)
    return () => clearInterval(id)
  }, [uid])
  const d = new Date(); const nowKey = `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  const name = meta.name || email.split('@')[0]
  const [cname, C] = COMP[meta.companion] || COMP.puffy
  const done = todos.filter((t) => t.is_completed).length
  const next = todos.filter((t) => !t.is_completed).slice(-1)[0]
  const act = ev.filter((e) => `${e.date}T${e.time}` >= nowKey).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
  const hDone = hb.filter((h) => h.days.includes(ymd(d))).length
  return (
    <>
      <Panel>
        <div className="flex items-center gap-3">
          <motion.div className="w-20 shrink-0" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}><C /></motion.div>
          <div>
            <h1 className="text-2xl font-bold">Hey, {name}! 💙</h1>
            <p>{cname} is happy to see you again!{meta.pet ? ` 🐾 ${meta.pet} says hi!` : ''}</p>
            <p className="text-sm opacity-70">{d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
        <p className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-sm">💬 {MOTTO[d.getDate() % MOTTO.length]}</p>
      </Panel>
      <Panel title="Today">
        {todos.length ? (
          <>
            <p className="mb-1">{done} of {todos.length} tasks done</p>
            <div className="h-3 rounded-full bg-white/80 overflow-hidden mb-3"><div className="h-full rounded-full transition-all" style={{ width: `${(done / todos.length) * 100}%`, background: 'linear-gradient(90deg,var(--a),var(--b))' }} /></div>
            <p>📌 Next task: <b>{next ? next.title : 'All done! 🎉'}</b></p>
          </>
        ) : <button className={btn} style={{ background: 'var(--a)' }} onClick={() => setTab('tasks')}>Add your first task</button>}
        <p className="mt-1">📅 Next activity: <b>{act ? `${act.title} (${act.date === ymd(d) ? 'today' : act.date} ${act.time})` : 'nothing planned'}</b></p>
        {hb.length > 0 && <p className="mt-1">🌱 Habits today: <b>{hDone} of {hb.length}</b></p>}
        <div className="flex gap-2 mt-4">
          <button className={`${btn} flex-1`} style={{ background: 'var(--a)' }} onClick={() => setTab('timer')}>⏳ Start timer</button>
          <button className={`${btn} flex-1`} style={{ background: 'var(--a)' }} onClick={() => setTab('tasks')}>➕ Add task</button>
        </div>
      </Panel>
    </>
  )
}

/* ---------- Habits ---------- */
const streakOf = (days) => { let c = 0; const d = new Date(); if (!days.includes(ymd(d))) d.setDate(d.getDate() - 1); while (days.includes(ymd(d))) { c++; d.setDate(d.getDate() - 1) } return c }
function Habits({ uid }) {
  const key = `dw_habits_${uid}`
  const [hs, setHs] = useState(() => load(key, [])); const [n, setN] = useState('')
  useEffect(() => { save(key, hs) }, [hs, key])
  const t = ymd(new Date())
  const toggle = (id) => setHs((p) => p.map((h) => (h.id === id ? { ...h, days: h.days.includes(t) ? h.days.filter((x) => x !== t) : [...h.days, t] } : h)))
  const add = (e) => { e.preventDefault(); if (!n.trim()) return; setHs((p) => [...p, { id: crypto.randomUUID(), name: n.trim(), days: [] }]); setN('') }
  const week = Array(7).fill(0).map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return ymd(d) })
  return (
    <Panel title="Habits">
      <form onSubmit={add} className="flex gap-2 mb-4">
        <input className={field} style={{ borderColor: 'var(--b)' }} placeholder="New habit (e.g. drink water)" maxLength={60} value={n} onChange={(e) => setN(e.target.value)} />
        <button className={btn} style={{ background: 'var(--a)' }}>Add</button>
      </form>
      {!hs.length && <p className="text-center opacity-70">🌱 No habits yet. Add one above!</p>}
      <ul className="space-y-2">
        {hs.map((h) => (
          <li key={h.id} className="rounded-2xl bg-white/80 px-3 py-2">
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(h.id)} aria-pressed={h.days.includes(t)} className="w-8 h-8 rounded-full border-2 text-white" style={{ background: h.days.includes(t) ? 'var(--a)' : '#fff', borderColor: 'var(--a)' }}>{h.days.includes(t) ? '✓' : ''}</button>
              <b className="flex-1 min-w-0 break-words">{h.name}</b><span>🔥 {streakOf(h.days)}</span>
              <button aria-label="Delete habit" onClick={() => setHs((p) => p.filter((x) => x.id !== h.id))}>🗑️</button>
            </div>
            <div className="flex gap-1 mt-2 ml-10">{week.map((d) => <i key={d} className="w-3 h-3 rounded-full" style={{ background: h.days.includes(d) ? 'var(--a)' : '#0002' }} />)}</div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/* ---------- Notes ---------- */
function Notes({ uid }) {
  const key = `dw_notes_${uid}`
  const blank = { id: null, title: '', body: '' }
  const [notes, setNotes] = useState(() => load(key, [])); const [f, setF] = useState(blank); const [q, setQ] = useState('')
  useEffect(() => { save(key, notes) }, [notes, key])
  const submit = (e) => {
    e.preventDefault()
    if (!f.title.trim() && !f.body.trim()) return
    const item = { ...f, id: f.id || crypto.randomUUID(), at: Date.now() }
    setNotes((p) => (f.id ? p.map((x) => (x.id === f.id ? item : x)) : [item, ...p])); setF(blank)
  }
  const shown = notes.filter((x) => `${x.title} ${x.body}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <Panel title="Notes">
      <form onSubmit={submit} className="space-y-2 mb-4">
        <input className={field} style={{ borderColor: 'var(--b)' }} placeholder="Title" maxLength={80} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <textarea className={field} style={{ borderColor: 'var(--b)' }} rows={3} placeholder="Write something…" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <button className={btn} style={{ background: 'var(--a)' }}>{f.id ? 'Save note' : 'Add note'}</button>
      </form>
      <input className={`${field} mb-3`} style={{ borderColor: 'var(--b)' }} placeholder="🔍 Search notes" value={q} onChange={(e) => setQ(e.target.value)} />
      {!notes.length && <p className="text-center opacity-70">📝 No notes yet.</p>}
      <ul className="space-y-2">
        {shown.map((x) => (
          <li key={x.id} className="rounded-2xl bg-white/80 px-3 py-2">
            <div className="flex items-start gap-2"><b className="flex-1 break-words">{x.title || 'Untitled'}</b>
              <button aria-label="Edit note" onClick={() => setF(x)}>✏️</button>
              <button aria-label="Delete note" onClick={() => setNotes((p) => p.filter((y) => y.id !== x.id))}>🗑️</button></div>
            <p className="text-sm whitespace-pre-wrap break-words">{x.body}</p>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/* ---------- Settings ---------- */
function Settings({ supabase, meta }) {
  return (
    <>
      <Panel title="Profile"><ProfileForm supabase={supabase} meta={meta} label="Save profile" /></Panel>
      <Panel title="Look and feel"><ThemeBar /></Panel>
      <Panel title="Account"><button className={btn} style={{ background: 'var(--a)' }} onClick={() => supabase.auth.signOut()}>Sign out</button></Panel>
    </>
  )
}

/* ---------- Shell: sidebar (desktop), bottom bar (mobile), first-time setup ---------- */
export function Shell({ supabase, session, todos, children }) {
  const [tab, setTabRaw] = useState(() => load('dw_tab', 'home'))
  const setTab = (t) => { setTabRaw(t); save('dw_tab', t); window.scrollTo({ top: 0 }) }
  useEffect(() => {
    const nav = (e) => { setTabRaw(e.detail); save('dw_tab', e.detail) }
    const map = (e) => { if (MAP[e.detail]) nav({ detail: MAP[e.detail] }) }
    addEventListener('dw-nav', nav); addEventListener('dw-tab', map); addEventListener('dw-extab', map)
    return () => { removeEventListener('dw-nav', nav); removeEventListener('dw-tab', map); removeEventListener('dw-extab', map) }
  }, [])
  const meta = session.user.user_metadata || {}
  const item = ([id, icon, label], cls) => (
    <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
      className={`${cls} font-semibold`} style={tab === id ? { background: 'var(--a)', color: '#fff' } : { color: '#334' }}>
      <span className="text-xl">{icon}</span><span>{label}</span>
    </button>
  )
  return (
    <TabCtx.Provider value={{ tab, setTab }}>
      <nav className="hidden md:flex fixed left-3 top-3 bottom-3 w-52 z-30 flex-col gap-1 rounded-[2rem] bg-white/70 backdrop-blur-xl p-3 shadow-xl border-2 border-white">
        <p className="px-3 py-2 font-bold text-lg text-slate-800">🌈 Dora World</p>
        {TABS.map((t) => item(t, 'flex items-center gap-3 rounded-2xl px-3 py-2 text-left'))}
      </nav>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex overflow-x-auto bg-white/90 backdrop-blur border-t-2 border-white px-1 py-1">
        {TABS.map((t) => item(t, 'flex flex-col items-center shrink-0 w-[4.5rem] rounded-xl py-1 text-[11px]'))}
      </nav>
      <div className="max-w-xl mx-auto">{children}</div>
      {!meta.onboarded && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md"><Panel title="Welcome! Let's set you up 🎉"><ProfileForm supabase={supabase} meta={meta} label="Let's go!" /></Panel></div>
        </div>
      )}
    </TabCtx.Provider>
  )
}

export { Home, Habits, Notes, Settings }
