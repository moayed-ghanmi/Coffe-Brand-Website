import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCTS, SIZES } from './data'

/*
 * Client-side "backend" for the demo: products, orders and coupons persist in localStorage.
 * Swap these actions for API calls when a real server exists.
 */
const KEY = 'volta-store-v1'
export const ORDER_STATUSES = ['Pending', 'Paid', 'Roasting', 'Shipped', 'Delivered', 'Cancelled']
const FLOW = ['Pending', 'Paid', 'Roasting', 'Shipped', 'Delivered']
const DAY = 864e5

const STOCK = { 'ethiopia-guji': 64, 'colombia-huila': 48, 'kenya-nyeri': 6, 'brazil-cerrado': 82, 'guatemala-antigua': 9, 'volta-espresso': 37 }

const DEFAULT_COUPONS = [
  { code: 'BREW10', type: 'percent', value: 10, active: true, uses: 4 },
  { code: 'WELCOME5', type: 'fixed', value: 5, active: true, uses: 2 },
  { code: 'SUMMER25', type: 'percent', value: 25, active: false, uses: 11 },
]

const NAMES = [
  ['Maya', 'Rossi'], ['Tom', 'Keller'], ['Lina', 'Saad'], ['Yassine', 'Ben Ali'], ['Jo', 'Parker'], ['Amira', 'Trabelsi'],
  ['Lucas', 'Martin'], ['Sofia', 'Garcia'], ['Noah', 'Weber'], ['Ines', 'Haddad'], ['Omar', 'Chaabane'], ['Emma', 'Dubois'],
]
const CITIES = [['Tunis', 'Tunisia'], ['Sfax', 'Tunisia'], ['Paris', 'France'], ['Berlin', 'Germany'], ['London', 'United Kingdom'], ['New York', 'United States']]

// Deterministic PRNG so the seeded demo data is stable.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function history(status, createdAt) {
  if (status === 'Cancelled') return [{ status: 'Pending', at: createdAt }, { status: 'Cancelled', at: createdAt + DAY / 3 }]
  return FLOW.slice(0, FLOW.indexOf(status) + 1).map((s, i) => ({
    status: s,
    at: createdAt + i * DAY * 0.9,
  }))
}

function seedOrders(products) {
  const r = rng(42)
  const pick = (arr) => arr[Math.floor(r() * arr.length)]
  const now = Date.now()
  const orders = Array.from({ length: 24 }, () => {
    const [firstName, lastName] = pick(NAMES)
    const [city, country] = pick(CITIES)
    const items = Array.from({ length: 1 + Math.floor(r() * 3) }, () => {
      const p = pick(products)
      const s = pick(SIZES)
      return { id: p.id, name: p.name, color: p.color, variant: `${s.label} · Whole Bean`, price: Math.round(p.price * s.mult), qty: 1 + Math.floor(r() * 2) }
    })
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const shippingCost = subtotal >= 50 ? 0 : 5
    const createdAt = now - Math.floor(r() * 14 * DAY)
    const age = (now - createdAt) / DAY
    const status =
      age > 7 ? (r() < 0.1 ? 'Cancelled' : 'Delivered') : age > 4 ? 'Shipped' : age > 2 ? 'Roasting' : age > 1 ? 'Paid' : r() < 0.5 ? 'Pending' : 'Paid'
    const email = `${firstName}.${lastName}`.toLowerCase().replace(/\s/g, '') + '@example.com'
    return {
      createdAt,
      customer: { email, firstName, lastName, phone: '', address: `${10 + Math.floor(r() * 180)} Roastery Lane`, city, zip: String(1000 + Math.floor(r() * 8999)), country },
      items,
      shipping: { method: 'standard', label: 'Standard', cost: shippingCost },
      payment: status === 'Pending' ? { method: 'cod' } : { method: 'card', brand: r() < 0.6 ? 'Visa' : 'Mastercard', last4: String(1000 + Math.floor(r() * 8999)) },
      coupon: null,
      discount: 0,
      subtotal,
      total: subtotal + shippingCost,
      status,
      history: history(status, createdAt),
    }
  })
  return orders
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((o, i, arr) => ({ ...o, id: `VLT-${1000 + arr.length - i}` }))
}

function seed() {
  const products = PRODUCTS.map((p) => ({ ...p, stock: STOCK[p.id] ?? 30, active: true }))
  return { products, orders: seedOrders(products), coupons: DEFAULT_COUPONS }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved?.products && saved?.orders && saved?.coupons) return saved
  } catch {
    /* fall through to seed */
  }
  return seed()
}

export function couponDiscount(coupon, subtotal) {
  if (!coupon) return 0
  const d = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
  return Math.min(Math.round(d * 100) / 100, subtotal)
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  // Keep multiple tabs (e.g. storefront + admin) in sync.
  useEffect(() => {
    const on = (e) => e.key === KEY && e.newValue && setState(JSON.parse(e.newValue))
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const value = useMemo(() => {
    const patch = (fn) => setState((s) => ({ ...s, ...fn(s) }))
    const nextId = () => `VLT-${Math.max(1000, ...state.orders.map((o) => +o.id.split('-')[1] || 0)) + 1}`

    return {
      ...state,
      findCoupon: (code) => state.coupons.find((c) => c.active && c.code === code.trim().toUpperCase()) ?? null,

      placeOrder(draft) {
        const now = Date.now()
        const status = draft.payment.method === 'card' ? 'Paid' : 'Pending'
        const order = {
          ...draft,
          id: nextId(),
          createdAt: now,
          status,
          history: status === 'Paid' ? [{ status: 'Pending', at: now }, { status: 'Paid', at: now }] : [{ status: 'Pending', at: now }],
        }
        patch((s) => ({
          orders: [order, ...s.orders],
          products: s.products.map((p) => {
            const qty = order.items.filter((i) => i.id === p.id).reduce((n, i) => n + i.qty, 0)
            return qty ? { ...p, stock: Math.max(0, p.stock - qty) } : p
          }),
          coupons: s.coupons.map((c) => (c.code === order.coupon ? { ...c, uses: c.uses + 1 } : c)),
        }))
        return order
      },

      updateOrderStatus: (id, status) =>
        patch((s) => ({
          orders: s.orders.map((o) => (o.id === id && o.status !== status ? { ...o, status, history: [...o.history, { status, at: Date.now() }] } : o)),
        })),

      updateProduct: (id, changes) => patch((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...changes } : p)) })),
      addProduct: (product) => patch((s) => ({ products: [...s.products, product] })),
      deleteProduct: (id) => patch((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addCoupon: (coupon) => patch((s) => ({ coupons: [...s.coupons.filter((c) => c.code !== coupon.code), coupon] })),
      updateCoupon: (code, changes) => patch((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, ...changes } : c)) })),
      deleteCoupon: (code) => patch((s) => ({ coupons: s.coupons.filter((c) => c.code !== code) })),

      resetDemo: () => setState(seed()),
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export const useStore = () => useContext(StoreContext)
