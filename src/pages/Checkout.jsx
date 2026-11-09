import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../cart'
import { couponDiscount, useStore } from '../store'
import { money, navigate } from '../utils'

const COUNTRIES = ['Tunisia', 'France', 'Germany', 'Italy', 'Spain', 'United Kingdom', 'United States', 'Canada', 'Morocco', 'Algeria']
const STEPS = ['Details', 'Delivery', 'Payment']
const FREE_SHIP = 50

const SHIPPING = [
  { id: 'standard', label: 'Standard', eta: '3–5 business days', cost: (s) => (s >= FREE_SHIP ? 0 : 5) },
  { id: 'express', label: 'Express', eta: '1–2 business days', cost: () => 12 },
  { id: 'pickup', label: 'Roastery pickup', eta: 'Ready in 24h · Volta Roastery, Sfax', cost: () => 0 },
]

/* ---------- card helpers ---------- */
const digits = (v) => v.replace(/\D/g, '')
const formatCard = (v) => digits(v).slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
const formatExp = (v) => {
  const d = digits(v).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}
function brandOf(num) {
  if (/^4/.test(num)) return 'VISA'
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard'
  if (/^3[47]/.test(num)) return 'AMEX'
  return 'CARD'
}
function luhn(num) {
  let sum = 0
  let alt = false
  for (let i = num.length - 1; i >= 0; i--) {
    let d = +num[i]
    if (alt) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    alt = !alt
  }
  return num.length >= 13 && sum % 10 === 0
}
function validExp(v) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v)
  if (!m) return false
  const mo = +m[1]
  const yr = 2000 + +m[2]
  const now = new Date()
  return mo >= 1 && mo <= 12 && (yr > now.getFullYear() || (yr === now.getFullYear() && mo >= now.getMonth() + 1))
}

function validate(step, f) {
  const e = {}
  if (step === 0) {
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email'
    for (const k of ['firstName', 'lastName', 'address', 'city', 'zip']) if (!f[k].trim()) e[k] = 'Required'
  }
  if (step === 2 && f.pay === 'card') {
    if (!f.cardName.trim()) e.cardName = 'Required'
    if (!luhn(digits(f.cardNumber))) e.cardNumber = 'Card number is invalid'
    if (!validExp(f.exp)) e.exp = 'Invalid date'
    if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = '3–4 digits'
  }
  return e
}

function Field({ label, error, className = '', children, ...props }) {
  return (
    <label className={`field ${error ? 'has-error' : ''} ${className}`}>
      <span>{label}</span>
      {children ?? <input {...props} />}
      <AnimatePresence>
        {error && (
          <motion.em initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.em>
        )}
      </AnimatePresence>
    </label>
  )
}

function CardPreview({ form, flipped }) {
  return (
    <div className="ccard-wrap">
      <motion.div className="ccard" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 110, damping: 15 }}>
        <div className="ccard__face ccard__front">
          <div className="ccard__row">
            <span className="ccard__chip" />
            <b>{brandOf(digits(form.cardNumber))}</b>
          </div>
          <div className="ccard__num">{form.cardNumber || '•••• •••• •••• ••••'}</div>
          <div className="ccard__row">
            <div>
              <small>Card holder</small>
              <span>{form.cardName.toUpperCase() || 'YOUR NAME'}</span>
            </div>
            <div className="right">
              <small>Expires</small>
              <span>{form.exp || 'MM/YY'}</span>
            </div>
          </div>
        </div>
        <div className="ccard__face ccard__back">
          <div className="ccard__strip" />
          <div className="ccard__cvc">
            <small>CVC</small>
            <span>{form.cvc || '•••'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const slide = {
  enter: (d) => ({ opacity: 0, x: d * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (d) => ({ opacity: 0, x: d * -40 }),
}

export default function Checkout() {
  const cart = useCart()
  const store = useStore()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [errors, setErrors] = useState({})
  const [flipped, setFlipped] = useState(false)
  const [code, setCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponMsg, setCouponMsg] = useState('')
  const [processing, setProcessing] = useState(false)
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', phone: '', address: '', city: '', zip: '', country: 'Tunisia',
    shipping: 'standard', pay: 'card', cardName: '', cardNumber: '', exp: '', cvc: '',
  })

  const set = (k) => (e) => {
    let v = e.target.value
    if (k === 'cardNumber') v = formatCard(v)
    if (k === 'exp') v = formatExp(v)
    if (k === 'cvc') v = digits(v).slice(0, 4)
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const subtotal = cart.subtotal
  const discount = couponDiscount(coupon, subtotal)
  const method = SHIPPING.find((m) => m.id === form.shipping)
  const shipCost = method.cost(subtotal)
  const total = subtotal - discount + shipCost

  const go = (to) => {
    setDir(to > step ? 1 : -1)
    setStep(to)
  }
  const next = () => {
    const e = validate(step, form)
    setErrors(e)
    if (Object.keys(e).length === 0) go(step + 1)
  }

  const applyCoupon = (e) => {
    e.preventDefault()
    const c = store.findCoupon(code)
    setCoupon(c)
    setCouponMsg(c ? `${c.code} applied` : 'That code is not valid')
  }

  const placeOrder = () => {
    const e = validate(2, form)
    setErrors(e)
    if (Object.keys(e).length) return
    setProcessing(true)
    // Simulated payment authorization delay.
    setTimeout(() => {
      const num = digits(form.cardNumber)
      const order = store.placeOrder({
        customer: {
          email: form.email.trim(), firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim(),
          address: form.address.trim(), city: form.city.trim(), zip: form.zip.trim(), country: form.country,
        },
        items: cart.items.map(({ id, name, color, variant, price, qty }) => ({ id, name, color, variant, price, qty })),
        shipping: { method: method.id, label: method.label, cost: shipCost },
        payment: form.pay === 'card' ? { method: 'card', brand: brandOf(num), last4: num.slice(-4) } : { method: 'cod' },
        coupon: coupon?.code ?? null,
        discount,
        subtotal,
        total,
      })
      navigate(`/order/${order.id}`)
      cart.clear()
    }, 1600)
  }

  if (!cart.items.length && !processing) {
    return (
      <div className="co">
        <CheckoutHeader />
        <div className="co__empty">
          <h1>Your cart is empty.</h1>
          <p className="muted">Add some beans before checking out.</p>
          <a href="#shop" className="btn btn--crema">
            Back to the shop
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="co">
      <CheckoutHeader />
      <div className="co__wrap">
        <section className="co__main">
          <div className="stepper">
            {STEPS.map((s, i) => (
              <button key={s} disabled={i > step} onClick={() => go(i)} className={i === step ? 'is-active' : i < step ? 'is-done' : ''}>
                <span>{i < step ? '✓' : i + 1}</span>
                {s}
              </button>
            ))}
            <motion.div className="stepper__bar" animate={{ scaleX: step / (STEPS.length - 1) }} />
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <div className="co__panel">
                  <h2>Contact</h2>
                  <div className="fields">
                    <Field className="span2" label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
                    <Field label="Phone (optional)" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} />
                  </div>
                  <h2>Shipping address</h2>
                  <div className="fields">
                    <Field label="First name" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
                    <Field label="Last name" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
                    <Field className="span2" label="Address" autoComplete="street-address" value={form.address} onChange={set('address')} error={errors.address} />
                    <Field label="City" autoComplete="address-level2" value={form.city} onChange={set('city')} error={errors.city} />
                    <Field label="Postal code" autoComplete="postal-code" value={form.zip} onChange={set('zip')} error={errors.zip} />
                    <Field className="span2" label="Country">
                      <select value={form.country} onChange={set('country')}>
                        {COUNTRIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="co__panel">
                  <div className="recap">
                    <div>
                      <small>Contact</small>
                      <span>{form.email}</span>
                    </div>
                    <div>
                      <small>Ship to</small>
                      <span>
                        {form.address}, {form.zip} {form.city}, {form.country}
                      </span>
                    </div>
                    <button className="link small" onClick={() => go(0)}>
                      Change
                    </button>
                  </div>
                  <h2>Delivery method</h2>
                  <div className="choices" role="radiogroup">
                    {SHIPPING.map((m) => (
                      <label key={m.id} className={`choice ${form.shipping === m.id ? 'is-active' : ''}`}>
                        <input type="radio" name="shipping" value={m.id} checked={form.shipping === m.id} onChange={set('shipping')} />
                        <span className="choice__dot" />
                        <div className="grow">
                          <strong>{m.label}</strong>
                          <p className="muted small">{m.eta}</p>
                        </div>
                        <strong>{m.cost(subtotal) === 0 ? 'Free' : money(m.cost(subtotal))}</strong>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="co__panel">
                  <h2>Payment</h2>
                  <div className="choices choices--row" role="radiogroup">
                    {[
                      ['card', 'Credit / debit card'],
                      ['cod', 'Cash on delivery'],
                    ].map(([id, label]) => (
                      <label key={id} className={`choice ${form.pay === id ? 'is-active' : ''}`}>
                        <input type="radio" name="pay" value={id} checked={form.pay === id} onChange={set('pay')} />
                        <span className="choice__dot" />
                        <strong>{label}</strong>
                      </label>
                    ))}
                  </div>
                  {form.pay === 'card' ? (
                    <div className="pay">
                      <CardPreview form={form} flipped={flipped} />
                      <div className="fields">
                        <Field className="span2" label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={form.cardNumber} onChange={set('cardNumber')} error={errors.cardNumber} />
                        <Field className="span2" label="Name on card" autoComplete="cc-name" value={form.cardName} onChange={set('cardName')} error={errors.cardName} />
                        <Field label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={form.exp} onChange={set('exp')} error={errors.exp} />
                        <Field label="CVC" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={form.cvc} onChange={set('cvc')} onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)} error={errors.cvc} />
                      </div>
                      <p className="muted small">Demo mode: use test card 4242 4242 4242 4242 with any future date. No real charge is made.</p>
                    </div>
                  ) : (
                    <p className="muted cod-note">Pay in cash when your beans arrive. Your order is confirmed once it is roasted.</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="co__nav">
            {step > 0 ? (
              <button className="btn btn--ghost" onClick={() => go(step - 1)}>
                ← Back
              </button>
            ) : (
              <a href="#shop" className="btn btn--ghost">
                ← Continue shopping
              </a>
            )}
            {step < 2 ? (
              <button className="btn btn--crema" onClick={next}>
                Continue to {STEPS[step + 1].toLowerCase()} →
              </button>
            ) : (
              <button className="btn btn--crema" onClick={placeOrder} disabled={processing}>
                {processing ? (
                  <>
                    <span className="spinner" /> Processing…
                  </>
                ) : (
                  `Place order — ${money(total)}`
                )}
              </button>
            )}
          </div>
        </section>

        <aside className="co__summary">
          <h2>Order summary</h2>
          <ul className="sum-items">
            {cart.items.map((i) => (
              <li key={i.key}>
                <span className="swatch swatch--sm" style={{ background: i.color }}>
                  <b>{i.qty}</b>
                </span>
                <div className="grow">
                  <strong>{i.name}</strong>
                  <p className="muted small">{i.variant}</p>
                </div>
                <span>{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <form className="promo" onSubmit={applyCoupon}>
            <input placeholder="Promo code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Promo code" />
            <button className="btn btn--ghost btn--sm">Apply</button>
          </form>
          {couponMsg && <p className={`small promo__msg ${coupon ? 'ok' : 'bad'}`}>{couponMsg}</p>}
          <div className="totals">
            <div className="row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="row ok">
                <span>Discount ({coupon.code})</span>
                <span>−{money(discount)}</span>
              </div>
            )}
            <div className="row">
              <span>Shipping · {method.label}</span>
              <span>{shipCost === 0 ? 'Free' : money(shipCost)}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <motion.strong key={total} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                {money(total)}
              </motion.strong>
            </div>
          </div>
          <p className="muted small trust">🔒 Encrypted checkout · ☕ Roasted within 48h · ↺ 30-day freshness guarantee</p>
        </aside>
      </div>
    </div>
  )
}

export function CheckoutHeader() {
  return (
    <header className="co__top">
      <a href="#/" className="logo" aria-label="Volta home">
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
          <rect width="32" height="32" rx="9" fill="var(--crema)" />
          <path d="M9 8l7 17 7-17" fill="none" stroke="#1a0f0a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        VOLTA
      </a>
      <span className="secure">🔒 Secure checkout</span>
    </header>
  )
}
