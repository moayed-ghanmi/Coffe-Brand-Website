import { STATUS_COLORS } from '../utils'
import { ORDER_STATUSES } from '../store'

export function StatusChip({ status }) {
  return (
    <span className="status" style={{ '--c': STATUS_COLORS[status] }}>
      <i />
      {status}
    </span>
  )
}

export function StatusSelect({ value, onChange }) {
  return (
    <select
      className="status-select"
      style={{ '--c': STATUS_COLORS[value] }}
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Order status"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  )
}

export function Empty({ children }) {
  return <div className="adm-empty muted">{children}</div>
}

export const customerName = (o) => `${o.customer.firstName} ${o.customer.lastName}`
export const itemCount = (o) => o.items.reduce((n, i) => n + i.qty, 0)
