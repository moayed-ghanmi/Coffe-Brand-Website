import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { money } from '../utils'
import { Empty } from './ui'

export default function Coupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore()
  const [f, setF] = useState({ code: '', type: 'percent', value: 10 })
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const code = f.code.trim().toUpperCase().replace(/\s+/g, '')
    const value = +f.value
    if (!/^[A-Z0-9]{3,20}$/.test(code)) return setErr('Use 3–20 letters or digits.')
    if (!(value > 0) || (f.type === 'percent' && value > 100)) return setErr('Enter a valid discount value.')
    if (coupons.some((c) => c.code === code)) return setErr('That code already exists.')
    addCoupon({ code, type: f.type, value, active: true, uses: 0 })
    setF({ code: '', type: 'percent', value: 10 })
    setErr('')
  }

  return (
    <>
      <form className="panel coupon-form" onSubmit={submit}>
        <label className="field">
          <span>Code</span>
          <input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="ROAST20" />
        </label>
        <label className="field">
          <span>Type</span>
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            <option value="percent">% off</option>
            <option value="fixed">$ off</option>
          </select>
        </label>
        <label className="field">
          <span>Value</span>
          <input type="number" min="1" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
        </label>
        <button className="btn btn--crema btn--sm">Create code</button>
        {err && <p className="bad small span-all">{err}</p>}
      </form>

      <div className="coupons">
        <AnimatePresence initial={false}>
          {coupons.map((c) => (
            <motion.div key={c.code} layout className={`coupon ${c.active ? '' : 'is-off'}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="coupon__value">{c.type === 'percent' ? `${c.value}%` : money(c.value)}</div>
              <div className="grow">
                <b className="coupon__code">{c.code}</b>
                <div className="muted small">
                  {c.type === 'percent' ? 'percent off' : 'off the order'} · used {c.uses}×
                </div>
              </div>
              <button
                className={`switch ${c.active ? 'is-on' : ''}`}
                role="switch"
                aria-checked={c.active}
                aria-label={`${c.code} active`}
                onClick={() => updateCoupon(c.code, { active: !c.active })}
              >
                <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
              <button className="link small bad" onClick={() => deleteCoupon(c.code)}>
                Delete
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {!coupons.length && <Empty>No promo codes yet.</Empty>}
      </div>
    </>
  )
}
