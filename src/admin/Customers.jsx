import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { fmtDate, money } from '../utils'
import { Empty } from './ui'

export default function Customers() {
  const { orders } = useStore()
  const [q, setQ] = useState('')

  const customers = useMemo(() => {
    const map = new Map()
    for (const o of orders) {
      const c = map.get(o.customer.email) ?? { ...o.customer, orders: 0, spent: 0, last: 0 }
      c.orders += 1
      if (o.status !== 'Cancelled') c.spent += o.total
      c.last = Math.max(c.last, o.createdAt)
      map.set(o.customer.email, c)
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent)
  }, [orders])

  const s = q.trim().toLowerCase()
  const list = customers.filter((c) => !s || `${c.firstName} ${c.lastName} ${c.email} ${c.city}`.toLowerCase().includes(s))

  return (
    <>
      <div className="toolbar">
        <input className="search" placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} />
        <p className="muted small">{customers.length} customers</p>
      </div>
      <div className="panel panel--flush">
        {list.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th className="hide-md">Location</th>
                <th>Orders</th>
                <th className="num">Lifetime spend</th>
                <th className="hide-md">Last order</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.email}>
                  <td>
                    <div className="prod-cell">
                      <span className="adm__avatar">{c.firstName[0]}</span>
                      <div>
                        <b>
                          {c.firstName} {c.lastName}
                        </b>
                        <div className="muted small">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hide-md muted">
                    {c.city}, {c.country}
                  </td>
                  <td>{c.orders}</td>
                  <td className="num">{money(c.spent)}</td>
                  <td className="hide-md muted">{fmtDate(c.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty>No customers found.</Empty>
        )}
      </div>
    </>
  )
}
