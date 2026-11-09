import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ORDER_STATUSES, useStore } from '../store'
import { fmtDate, fmtDateTime, money, STATUS_COLORS } from '../utils'
import { customerName, Empty, itemCount, StatusChip, StatusSelect } from './ui'

const NEXT = { Pending: 'Paid', Paid: 'Roasting', Roasting: 'Shipped', Shipped: 'Delivered' }

export default function Orders() {
  const { orders, updateOrderStatus } = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState(null)

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return orders.filter(
      (o) =>
        (filter === 'All' || o.status === filter) &&
        (!s || o.id.toLowerCase().includes(s) || customerName(o).toLowerCase().includes(s) || o.customer.email.includes(s)),
    )
  }, [orders, q, filter])

  const open = orders.find((o) => o.id === openId)

  return (
    <>
      <div className="toolbar">
        <input className="search" placeholder="Search orders, customers, emails…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="pills pills--sm">
          {['All', ...ORDER_STATUSES].map((s) => (
            <button key={s} className="pill" aria-selected={filter === s} onClick={() => setFilter(s)}>
              {filter === s && <motion.span layoutId="ord-pill" className="pill__bg" />}
              <span className="pill__label">
                {s} <small>{s === 'All' ? orders.length : orders.filter((o) => o.status === s).length}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel panel--flush">
        {list.length ? (
          <table className="table table--hover">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th className="hide-md">Items</th>
                <th className="hide-md">Payment</th>
                <th className="num">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} onClick={() => setOpenId(o.id)}>
                  <td>
                    <b>{o.id}</b>
                  </td>
                  <td className="muted">{fmtDate(o.createdAt)}</td>
                  <td>
                    {customerName(o)}
                    <div className="muted small">{o.customer.email}</div>
                  </td>
                  <td className="hide-md">{itemCount(o)}</td>
                  <td className="hide-md muted">{o.payment.method === 'card' ? `${o.payment.brand} ••${o.payment.last4}` : 'Cash on delivery'}</td>
                  <td className="num">{money(o.total)}</td>
                  <td>
                    <StatusSelect value={o.status} onChange={(s) => updateOrderStatus(o.id, s)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty>No orders match your filters.</Empty>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="overlay overlay--right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenId(null)}>
            <motion.aside
              className="drawer adm-detail"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="drawer__head">
                <div>
                  <h3>{open.id}</h3>
                  <span className="muted small">{fmtDateTime(open.createdAt)}</span>
                </div>
                <button className="modal__close static" onClick={() => setOpenId(null)} aria-label="Close">
                  ✕
                </button>
              </div>
              <div className="adm-detail__body">
                <div className="row">
                  <StatusChip status={open.status} />
                  {NEXT[open.status] && (
                    <button className="btn btn--crema btn--sm" onClick={() => updateOrderStatus(open.id, NEXT[open.status])}>
                      Mark as {NEXT[open.status]} →
                    </button>
                  )}
                </div>

                <h4>Customer</h4>
                <p>
                  <b>{customerName(open)}</b>
                  <br />
                  <a className="link" href={`mailto:${open.customer.email}`}>
                    {open.customer.email}
                  </a>
                  {open.customer.phone && (
                    <>
                      <br />
                      {open.customer.phone}
                    </>
                  )}
                </p>
                <h4>Ship to · {open.shipping.label}</h4>
                <p className="muted">
                  {open.customer.address}, {open.customer.zip} {open.customer.city}, {open.customer.country}
                </p>

                <h4>Items</h4>
                <ul className="sum-items">
                  {open.items.map((i, n) => (
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
                    <span>{money(open.subtotal)}</span>
                  </div>
                  {open.discount > 0 && (
                    <div className="row ok">
                      <span>Discount ({open.coupon})</span>
                      <span>−{money(open.discount)}</span>
                    </div>
                  )}
                  <div className="row">
                    <span>Shipping</span>
                    <span>{open.shipping.cost ? money(open.shipping.cost) : 'Free'}</span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <strong>{money(open.total)}</strong>
                  </div>
                </div>

                <h4>Timeline</h4>
                <ol className="timeline">
                  {[...open.history].reverse().map((h, n) => (
                    <li key={n} style={{ '--c': STATUS_COLORS[h.status] }}>
                      <b>{h.status}</b>
                      <span className="muted small">{fmtDateTime(h.at)}</span>
                    </li>
                  ))}
                </ol>
                {open.status !== 'Cancelled' && open.status !== 'Delivered' && (
                  <button className="link small bad" onClick={() => updateOrderStatus(open.id, 'Cancelled')}>
                    Cancel order
                  </button>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
