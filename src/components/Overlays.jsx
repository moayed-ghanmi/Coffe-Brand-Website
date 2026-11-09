import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { GRINDS, SIZES } from '../data'
import { useCart } from '../cart'
import { BagScene } from '../three/Scenes'

export function ProductModal({ product, onClose }) {
  const { add } = useCart()
  const [size, setSize] = useState(SIZES[0])
  const [grind, setGrind] = useState(GRINDS[0])
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setSize(SIZES[0])
    setGrind(GRINDS[0])
    setQty(1)
  }, [product])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const unit = product ? Math.round(product.price * size.mult) : 0

  return (
    <AnimatePresence>
      {product && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            style={{ '--accent': product.color === '#1d1d1f' ? '#d4ff3a' : product.color }}
          >
            <button className="modal__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
            <div className="modal__stage">
              <Canvas shadows dpr={[1, 2]}>
                <BagScene product={product} distance={5.2} />
                <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.5} />
              </Canvas>
              <span className="modal__hint">Drag to rotate</span>
            </div>
            <div className="modal__info">
              <span className="kicker">
                {product.origin} · {product.roast} roast
              </span>
              <h3>{product.name}</h3>
              <p className="muted">{product.description}</p>
              <div className="notes">
                {product.notes.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>

              <label className="opt-label">Size</label>
              <div className="opts">
                {SIZES.map((s) => (
                  <button key={s.label} className={`opt ${size === s ? 'is-active' : ''}`} onClick={() => setSize(s)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="opt-label">Grind</label>
              <div className="opts">
                {GRINDS.map((g) => (
                  <button key={g} className={`opt ${grind === g ? 'is-active' : ''}`} onClick={() => setGrind(g)}>
                    {g}
                  </button>
                ))}
              </div>

              <div className="modal__buy">
                <div className="qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                    −
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">
                    +
                  </button>
                </div>
                <button
                  className="btn btn--lime grow"
                  onClick={() => {
                    add({
                      key: `${product.id}-${size.label}-${grind}`,
                      id: product.id,
                      name: product.name,
                      color: product.color,
                      variant: `${size.label} · ${grind}`,
                      price: unit,
                      qty,
                    })
                    onClose()
                  }}
                >
                  Add to cart — ${unit * qty}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const FREE_SHIP = 50

export function CartDrawer() {
  const { items, open, setOpen, subtotal, changeQty, remove, clear } = useCart()
  const [order, setOrder] = useState(null)
  const pct = Math.min(subtotal / FREE_SHIP, 1)

  const checkout = () => {
    setOrder({ id: `VLT-${Math.floor(100000 + Math.random() * 900000)}`, total: subtotal })
    clear()
  }

  const close = () => {
    setOpen(false)
    setTimeout(() => setOrder(null), 400)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="overlay overlay--right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.aside
            className="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Shopping cart"
          >
            <div className="drawer__head">
              <h3>Your cart</h3>
              <button className="modal__close static" onClick={close} aria-label="Close cart">
                ✕
              </button>
            </div>

            {order ? (
              <motion.div className="drawer__done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="done-icon">✓</div>
                <h3>Order confirmed</h3>
                <p className="muted">
                  {order.id} · ${order.total}. Your beans hit the roaster on the next roast day. ☕
                </p>
                <button className="btn btn--lime" onClick={close}>
                  Keep browsing
                </button>
              </motion.div>
            ) : items.length === 0 ? (
              <div className="drawer__empty">
                <p className="muted">Your cart is empty. Time to fix that.</p>
                <a href="#shop" className="btn btn--lime" onClick={close}>
                  Shop coffee
                </a>
              </div>
            ) : (
              <>
                <div className="ship">
                  <p>{pct >= 1 ? '⚡ You unlocked free shipping!' : `Add $${FREE_SHIP - subtotal} more for free shipping`}</p>
                  <div className="ship__bar">
                    <motion.span animate={{ scaleX: pct }} transition={{ type: 'spring', damping: 20 }} />
                  </div>
                </div>
                <ul className="drawer__items">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.li key={i.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                        <span className="swatch" style={{ background: i.color }} />
                        <div className="grow">
                          <strong>{i.name}</strong>
                          <p className="muted small">{i.variant}</p>
                          <div className="qty qty--sm">
                            <button onClick={() => changeQty(i.key, -1)} aria-label="Decrease">
                              −
                            </button>
                            <span>{i.qty}</span>
                            <button onClick={() => changeQty(i.key, 1)} aria-label="Increase">
                              +
                            </button>
                          </div>
                        </div>
                        <div className="right">
                          <strong>${i.price * i.qty}</strong>
                          <button className="link small" onClick={() => remove(i.key)}>
                            Remove
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="drawer__foot">
                  <div className="row">
                    <span>Subtotal</span>
                    <strong>${subtotal}</strong>
                  </div>
                  <div className="row muted small">
                    <span>Shipping</span>
                    <span>{pct >= 1 ? 'Free' : '$5'}</span>
                  </div>
                  <button className="btn btn--lime block" onClick={checkout}>
                    Checkout — ${subtotal + (pct >= 1 ? 0 : 5)}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
