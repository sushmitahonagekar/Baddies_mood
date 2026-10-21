import { motion } from 'framer-motion'

const ink = '#3b2a5a'
const bob = (d = 3, y = 10) => ({ animate: { y: [0, -y, 0] }, transition: { duration: d, repeat: Infinity, ease: 'easeInOut' } })

function Say({ text }) {
  return (
    <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow border-2 border-white">
      {text}
    </div>
  )
}

/* Puffy: a friendly cloud that waves */
export function Puffy() {
  return (
    <svg viewBox="0 0 130 90" className="w-full drop-shadow-lg">
      <motion.g animate={{ rotate: [0, 25, 0, 25, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} style={{ originX: '110px', originY: '55px' }}>
        <ellipse cx="120" cy="40" rx="8" ry="12" fill="#fff" stroke={ink} strokeWidth="3" />
      </motion.g>
      <path d="M25 78 Q4 78 8 58 Q10 42 28 44 Q32 22 56 24 Q74 10 92 28 Q114 28 114 50 Q124 74 100 78 Z" fill="#fff" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <ellipse cx="46" cy="52" rx="5" ry="7" fill={ink} /><ellipse cx="78" cy="52" rx="5" ry="7" fill={ink} />
      <circle cx="34" cy="62" r="6" fill="#ff9ccf" opacity=".7" /><circle cx="90" cy="62" r="6" fill="#ff9ccf" opacity=".7" />
      <path d="M52 64 Q62 74 72 64" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/* Twinkle: a star with a face */
export function Twinkle() {
  return (
    <motion.svg viewBox="0 0 100 100" className="w-full drop-shadow-lg" animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
      <polygon points="50,5 61,38 96,38 68,58 78,92 50,72 22,92 32,58 4,38 39,38" fill="#ffd23f" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="41" cy="48" r="4" fill={ink} /><circle cx="59" cy="48" r="4" fill={ink} />
      <path d="M42 58 Q50 67 58 58" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </motion.svg>
  )
}

/* Pip: a little robot that walks along the bottom */
export function Pip() {
  const leg = (x, d) => (
    <motion.rect x={x} y="66" width="9" height="16" rx="4" fill="#8fd3ff" stroke={ink} strokeWidth="3"
      animate={{ y: [66, 62, 66] }} transition={{ duration: 0.5, repeat: Infinity, delay: d }} />
  )
  return (
    <svg viewBox="0 0 80 90" className="w-full drop-shadow-lg">
      <line x1="40" y1="8" x2="40" y2="20" stroke={ink} strokeWidth="3" />
      <motion.circle cx="40" cy="7" r="5" fill="#ff5a4d" stroke={ink} strokeWidth="2.5" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      <rect x="14" y="20" width="52" height="34" rx="12" fill="#fff" stroke={ink} strokeWidth="3.5" />
      <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.95, 1] }} style={{ originY: '36px' }}>
        <circle cx="30" cy="36" r="5" fill="#1e90ff" /><circle cx="50" cy="36" r="5" fill="#1e90ff" />
      </motion.g>
      <path d="M33 46 Q40 51 47 46" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="20" y="54" width="40" height="16" rx="6" fill="#8fd3ff" stroke={ink} strokeWidth="3.5" />
      {leg(24, 0)}{leg(47, 0.25)}
    </svg>
  )
}

export function Friends() {
  return (
    <div className="dw-sky fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden>
      <motion.div className="absolute top-[118px] right-1 w-[72px] md:top-24 md:right-[4%] md:w-36" {...bob(4, 10)}>
        <div className="hidden md:block"><Say text="You can do it!" /></div><Puffy />
      </motion.div>
      <motion.div className="absolute top-[130px] left-2 w-12 md:top-[42%] md:left-[3%] md:w-24" {...bob(3, 8)}><Twinkle /></motion.div>
      <motion.div className="absolute bottom-1 left-0 w-14 md:w-20" animate={{ x: [-120, (typeof innerWidth === 'number' ? innerWidth : 1200) + 120] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}><Pip /></motion.div>
    </div>
  )
}