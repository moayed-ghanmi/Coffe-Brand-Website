import { motion } from 'framer-motion'
import { useStore } from '../store'
import { fmtDateTime, money } from '../utils'
import { CheckoutHeader } from './Checkout'

const TRACK = ['Paid', 'Roasting', 'Shipped', 'Delivered']

export default function OrderPage({ id }) {
  const { orders } = useStore()
  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="co">
        <CheckoutHeader />
        <div className="co__empty">
          <h1>Order not found.</h1>
          <a href="#/" className="btn btn--crema">
            Back to the shop
          </a>
        </div>
      </div>
    )
  }

  const reached = TRACK.indexOf(order.status)
  const { customer: c } = order

  return (
    <div className="co">
      <CheckoutHeader />
      <div className="confirm">
        <motion.div className="confirm__icon" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}>
          ✓
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span className="kicker">Order {order.id}</span>
          <h1>Thanks, {c.firstName}! ☕</h1>
          <p className="muted">
            {order.status === 'Cancelled'
              ? 'This order was cancelled.'
              : `A confirmation was sent to ${c.email}. Your beans go into the roaster on the next roast day.`}
          </p>
        </motion.div>

        {order.status !== 'Cancelled' && (
          <motion.ol className="track" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } } }}>
            {TRACK.map((s, i) => (
              <motion.li key={s} className={i <= reached ? 'is-done' : ''} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <span>{i <= reached ? '✓' : i + 1}</span>
                {s === 'Paid' && order.status === 'Pending' ? 'Confirmed' : s}
              </motion.li>
            ))}
          </motion.ol>
        )}

        <motion.div className="confirm__grid" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="confirm__card">
            <h3>Items</h3>
            <ul className="sum-items">
              {order.items.map((i, n) => (
                <li key={n}>
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
            <div className="totals">
              <div className="row">
                <span>Subtotal</span>
                <span>{money(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="row ok">
                  <span>Discount ({order.coupon})</span>
                  <span>−{money(order.discount)}</span>
                </div>
              )}
              <div className="row">
                <span>Shipping · {order.shipping.label}</span>
                <span>{order.shipping.cost ? money(order.shipping.cost) : 'Free'}</span>
              </div>
              <div className="row total">
                <span>Total</span>
                <strong>{money(order.total)}</strong>
              </div>
            </div>
          </div>
          <div className="confirm__card">
            <h3>Delivery</h3>
            <p>
              {c.firstName} {c.lastName}
              <br />
              {c.address}
              <br />
              {c.zip} {c.city}, {c.country}
            </p>
            <h3>Payment</h3>
            <p>{order.payment.method === 'card' ? `${order.payment.brand} •••• ${order.payment.last4}` : 'Cash on delivery'}</p>
            <h3>Placed</h3>
            <p>{fmtDateTime(order.createdAt)}</p>
          </div>
        </motion.div>
        <a href="#shop" className="btn btn--crema">
          Continue shopping
        </a>
      </div>
    </div>
  )
}
