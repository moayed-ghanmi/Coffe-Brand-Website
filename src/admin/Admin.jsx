import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { navigate } from '../utils'
import Dashboard from './Dashboard'
import Orders from './Orders'
import Products from './Products'
import Customers from './Customers'
import Coupons from './Coupons'

/*
 * Demo-only gate: the password lives in the client bundle and is NOT real security.
 * Replace with server-side authentication before handling real orders.
 */
const DEMO_PASSWORD = 'volta-admin'
const SESSION_KEY = 'volta-admin-session'

const SECTIONS = [
  { path: '/admin', label: 'Dashboard', icon: '◎', el: Dashboard },
  { path: '/admin/orders', label: 'Orders', icon: '☰', el: Orders },
  { path: '/admin/products', label: 'Products', icon: '◫', el: Products },
  { path: '/admin/customers', label: 'Customers', icon: '◉', el: Customers },
  { path: '/admin/coupons', label: 'Promo codes', icon: '%', el: Coupons },
]

function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (pw === DEMO_PASSWORD) onLogin()
    else setError(true)
  }
  return (
    <div className="adm-login">
      <motion.form
        className="adm-login__card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 30 }}
        animate={error ? { x: [0, -10, 10, -6, 6, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        key={error ? 'err' : 'ok'}
      >
        <div className="logo">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden>
            <rect width="32" height="32" rx="9" fill="var(--crema)" />
            <path d="M9 8l7 17 7-17" fill="none" stroke="#1a0f0a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          VOLTA <span className="adm-tag">Admin</span>
        </div>
        <h1>Welcome back</h1>
        <p className="muted small">Sign in to manage orders, products and promotions.</p>
        <label className={`field ${error ? 'has-error' : ''}`}>
          <span>Password</span>
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              setError(false)
            }}
          />
          {error && <em>Wrong password</em>}
        </label>
        <button className="btn btn--crema block">Sign in</button>
        <p className="muted small center">
          Demo password: <code>{DEMO_PASSWORD}</code>
        </p>
        <a href="#/" className="link small center">
          ← Back to store
        </a>
      </motion.form>
    </div>
  )
}

export default function Admin({ path }) {
  const store = useStore()
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [menu, setMenu] = useState(false)

  if (!authed) {
    return (
      <Login
        onLogin={() => {
          sessionStorage.setItem(SESSION_KEY, '1')
          setAuthed(true)
        }}
      />
    )
  }

  const section = SECTIONS.find((s) => s.path === path) ?? SECTIONS[0]
  const Page = section.el
  const pending = store.orders.filter((o) => o.status === 'Pending' || o.status === 'Paid').length

  return (
    <div className="adm">
      <aside className={`adm__side ${menu ? 'is-open' : ''}`}>
        <a href="#/admin" className="logo">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
            <rect width="32" height="32" rx="9" fill="var(--crema)" />
            <path d="M9 8l7 17 7-17" fill="none" stroke="#1a0f0a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          VOLTA <span className="adm-tag">Admin</span>
        </a>
        <nav>
          {SECTIONS.map((s) => (
            <a key={s.path} href={`#${s.path}`} className={s === section ? 'is-active' : ''} onClick={() => setMenu(false)}>
              {s === section && <motion.span layoutId="adm-nav" className="adm__nav-bg" transition={{ type: 'spring', bounce: 0.2 }} />}
              <i>{s.icon}</i>
              <span>{s.label}</span>
              {s.label === 'Orders' && pending > 0 && <b className="adm__count">{pending}</b>}
            </a>
          ))}
        </nav>
        <div className="adm__side-foot">
          <a href="#/" className="btn btn--ghost btn--sm block">
            View store ↗
          </a>
          <button
            className="link small"
            onClick={() => {
              if (confirm('Reset all products, orders and promo codes to the demo data?')) store.resetDemo()
            }}
          >
            Reset demo data
          </button>
          <button
            className="link small"
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY)
              setAuthed(false)
              navigate('/admin')
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="adm__main">
        <header className="adm__top">
          <button className="burger adm__burger" onClick={() => setMenu((m) => !m)} aria-label="Menu">
            <span />
            <span />
          </button>
          <h1>{section.label}</h1>
          <span className="adm__user">
            <span className="adm__avatar">A</span> Admin
          </span>
        </header>
        <AnimatePresence mode="wait">
          <motion.div key={section.path} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            <Page />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
