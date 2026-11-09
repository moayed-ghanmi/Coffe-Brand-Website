import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { fmtDate, money, shortMoney, STATUS_COLORS } from '../utils'
import { customerName, StatusChip } from './ui'

const DAY = 864e5

export default function Dashboard() {
  const { orders, products } = useStore()

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'Cancelled')
    const revenue = valid.reduce((s, o) => s + o.total, 0)
    const customers = new Set(orders.map((o) => o.customer.email)).size

    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const days = Array.from({ length: 14 }, (_, i) => {
      const from = start.getTime() - (13 - i) * DAY
      const dayOrders = valid.filter((o) => o.createdAt >= from && o.createdAt < from + DAY)
      return { from, revenue: dayOrders.reduce((s, o) => s + o.total, 0), count: dayOrders.length }
    })
    const week = days.slice(7).reduce((s, d) => s + d.revenue, 0)
    const prevWeek = days.slice(0, 7).reduce((s, d) => s + d.revenue, 0)

    const units = {}
    for (const o of valid) for (const i of o.items) units[i.id] = (units[i.id] ?? 0) + i.qty
    const top = products
      .map((p) => ({ ...p, units: units[p.id] ?? 0 }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)

    const byStatus = Object.keys(STATUS_COLORS).map((s) => ({ s, n: orders.filter((o) => o.status === s).length }))

    return {
      revenue,
      count: valid.length,
      aov: valid.length ? revenue / valid.length : 0,
      customers,
      days,
      maxDay: Math.max(1, ...days.map((d) => d.revenue)),
      trend: prevWeek ? ((week - prevWeek) / prevWeek) * 100 : 0,
      top,
      maxUnits: Math.max(1, ...top.map((t) => t.units)),
      byStatus,
      lowStock: products.filter((p) => p.stock < 10),
    }
  }, [orders, products])

  const kpis = [
    ['Revenue', shortMoney(stats.revenue), `${stats.trend >= 0 ? '▲' : '▼'} ${Math.abs(stats.trend).toFixed(0)}% vs last week`, stats.trend >= 0],
    ['Orders', stats.count, `${orders.filter((o) => o.status === 'Pending').length} awaiting payment`],
    ['Avg. order', money(stats.aov), 'Excludes cancelled'],
    ['Customers', stats.customers, `${stats.lowStock.length} products low on stock`],
  ]

  return (
    <div className="adm-grid">
      {kpis.map(([label, value, sub, up], i) => (
        <motion.div key={label} className="kpi" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <span className="muted small">{label}</span>
          <strong>{value}</strong>
          <span className={`small ${up === true ? 'ok' : up === false ? 'bad' : 'muted'}`}>{sub}</span>
        </motion.div>
      ))}

      <section className="panel span-3">
        <div className="panel__head">
          <h3>Revenue · last 14 days</h3>
          <span className="muted small">{shortMoney(stats.days.reduce((s, d) => s + d.revenue, 0))}</span>
        </div>
        <div className="chart">
          {stats.days.map((d, i) => (
            <div key={d.from} className="chart__col" title={`${fmtDate(d.from)} · ${money(d.revenue)} · ${d.count} orders`}>
              <motion.div
                className="chart__bar"
                initial={{ height: 0 }}
                animate={{ height: `${(d.revenue / stats.maxDay) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.03, type: 'spring', damping: 18 }}
              >
                <span>{d.revenue ? shortMoney(d.revenue) : ''}</span>
              </motion.div>
              <small>{new Date(d.from).getDate()}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <h3>Order status</h3>
        </div>
        <ul className="bars">
          {stats.byStatus.map(({ s, n }) => (
            <li key={s}>
              <span className="row small">
                <span>{s}</span>
                <b>{n}</b>
              </span>
              <div className="bars__track">
                <motion.span style={{ background: STATUS_COLORS[s] }} initial={{ scaleX: 0 }} animate={{ scaleX: n / Math.max(1, orders.length) }} transition={{ delay: 0.3 }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel span-2">
        <div className="panel__head">
          <h3>Recent orders</h3>
          <a href="#/admin/orders" className="link small">
            View all →
          </a>
        </div>
        <table className="table">
          <tbody>
            {orders.slice(0, 6).map((o) => (
              <tr key={o.id}>
                <td>
                  <b>{o.id}</b>
                  <div className="muted small">{fmtDate(o.createdAt)}</div>
                </td>
                <td>{customerName(o)}</td>
                <td>
                  <StatusChip status={o.status} />
                </td>
                <td className="num">{money(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel span-2">
        <div className="panel__head">
          <h3>Top products</h3>
          <span className="muted small">units sold</span>
        </div>
        <ul className="bars">
          {stats.top.map((p) => (
            <li key={p.id}>
              <span className="row small">
                <span>
                  <i className="dot-c" style={{ background: p.color }} /> {p.name}
                </span>
                <b>{p.units}</b>
              </span>
              <div className="bars__track">
                <motion.span style={{ background: 'var(--crema)' }} initial={{ scaleX: 0 }} animate={{ scaleX: p.units / stats.maxUnits }} transition={{ delay: 0.3 }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel span-2">
        <div className="panel__head">
          <h3>Low stock</h3>
          <a href="#/admin/products" className="link small">
            Manage →
          </a>
        </div>
        {stats.lowStock.length ? (
          <ul className="low-list">
            {stats.lowStock.map((p) => (
              <li key={p.id}>
                <i className="dot-c" style={{ background: p.color }} />
                <span className="grow">{p.name}</span>
                <span className={p.stock === 0 ? 'bad' : 'warn'}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted small">All products are well stocked.</p>
        )}
      </section>
    </div>
  )
}
