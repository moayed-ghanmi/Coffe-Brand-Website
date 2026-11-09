import { useEffect, useState } from 'react'

export const money = (n) => `$${(Math.round(n * 100) / 100).toFixed(2)}`
export const shortMoney = (n) => `$${Math.round(n).toLocaleString('en-US')}`
export const fmtDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const fmtDateTime = (ts) =>
  new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

/* Hash routing: "#/path" is a page, any other hash (e.g. "#shop") is an anchor on the home page. */
const pathOf = (hash) => (hash.startsWith('#/') ? hash.slice(1) : '/')

export function useRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return pathOf(hash)
}

export const navigate = (path) => {
  window.location.hash = path
}

/* Readable text color on top of a given background color. */
export function inkFor(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.55 ? '#1a0f0a' : '#f5e9d8'
}

export const STATUS_COLORS = {
  Pending: '#d9a441',
  Paid: '#c98a4b',
  Roasting: '#e07a3f',
  Shipped: '#8fb3c9',
  Delivered: '#8fbf7a',
  Cancelled: '#a8484a',
}
