import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { inkFor } from '../utils'
import { Empty } from './ui'

const BLANK = { name: '', origin: '', roast: 'Medium', price: 18, stock: 30, notes: '', color: '#c98a4b', badge: '', description: '' }

function NewProduct({ onDone }) {
  const { products, addProduct } = useStore()
  const [f, setF] = useState(BLANK)
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const id = f.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (!id || !f.origin.trim()) return setErr('Name and origin are required.')
    if (products.some((p) => p.id === id)) return setErr('A product with that name already exists.')
    addProduct({
      id,
      name: f.name.trim(),
      origin: f.origin.trim(),
      roast: f.roast,
      price: Math.max(1, +f.price || 1),
      stock: Math.max(0, Math.floor(+f.stock || 0)),
      notes: f.notes.split(',').map((n) => n.trim()).filter(Boolean).slice(0, 3),
      color: f.color,
      ink: inkFor(f.color),
      badge: f.badge.trim() || undefined,
      description: f.description.trim() || 'A new seasonal coffee from Volta.',
      active: true,
    })
    onDone()
  }

  return (
    <motion.form className="panel new-product" onSubmit={submit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      <div className="panel__head">
        <h3>New product</h3>
      </div>
      <div className="fields fields--3">
        <label className="field">
          <span>Name</span>
          <input value={f.name} onChange={set('name')} placeholder="Sidamo Sunrise" />
        </label>
        <label className="field">
          <span>Origin</span>
          <input value={f.origin} onChange={set('origin')} placeholder="Ethiopia" />
        </label>
        <label className="field">
          <span>Roast</span>
          <select value={f.roast} onChange={set('roast')}>
            <option>Light</option>
            <option>Medium</option>
            <option>Dark</option>
          </select>
        </label>
        <label className="field">
          <span>Price (250g, $)</span>
          <input type="number" min="1" value={f.price} onChange={set('price')} />
        </label>
        <label className="field">
          <span>Stock (bags)</span>
          <input type="number" min="0" value={f.stock} onChange={set('stock')} />
        </label>
        <label className="field">
          <span>Label color</span>
          <input type="color" value={f.color} onChange={set('color')} />
        </label>
        <label className="field span2">
          <span>Tasting notes (comma separated)</span>
          <input value={f.notes} onChange={set('notes')} placeholder="Lemon, Honey, Black tea" />
        </label>
        <label className="field">
          <span>Badge (optional)</span>
          <input value={f.badge} onChange={set('badge')} placeholder="New" />
        </label>
        <label className="field span3">
          <span>Description</span>
          <input value={f.description} onChange={set('description')} />
        </label>
      </div>
      {err && <p className="bad small">{err}</p>}
      <div className="row-end">
        <button type="button" className="btn btn--ghost btn--sm" onClick={onDone}>
          Cancel
        </button>
        <button className="btn btn--crema btn--sm">Add product</button>
      </div>
    </motion.form>
  )
}

export default function Products() {
  const { products, updateProduct, deleteProduct } = useStore()
  const [adding, setAdding] = useState(false)

  return (
    <>
      <div className="toolbar">
        <p className="muted small">
          {products.length} products · {products.filter((p) => p.active).length} live in the store. Changes apply to the storefront instantly.
        </p>
        <button className="btn btn--crema btn--sm" onClick={() => setAdding((a) => !a)}>
          {adding ? 'Close' : '+ New product'}
        </button>
      </div>
      <AnimatePresence>{adding && <NewProduct onDone={() => setAdding(false)} />}</AnimatePresence>

      <div className="panel panel--flush">
        {products.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="hide-md">Roast</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Live</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {products.map((p) => (
                  <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td>
                      <div className="prod-cell">
                        <span className="swatch swatch--sm" style={{ background: p.color }} />
                        <div>
                          <b>{p.name}</b>
                          <div className="muted small">
                            {p.origin} {p.badge && <span className="mini-badge">{p.badge}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-md muted">{p.roast}</td>
                    <td>
                      <div className="money-input">
                        <span>$</span>
                        <input
                          type="number"
                          min="1"
                          value={p.price}
                          aria-label={`${p.name} price`}
                          onChange={(e) => updateProduct(p.id, { price: Math.max(0, +e.target.value) })}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="stock">
                        <button onClick={() => updateProduct(p.id, { stock: Math.max(0, p.stock - 1) })} aria-label="Decrease stock">
                          −
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={p.stock}
                          aria-label={`${p.name} stock`}
                          className={p.stock === 0 ? 'bad' : p.stock < 10 ? 'warn' : ''}
                          onChange={(e) => updateProduct(p.id, { stock: Math.max(0, Math.floor(+e.target.value)) })}
                        />
                        <button onClick={() => updateProduct(p.id, { stock: p.stock + 10 })} aria-label="Restock 10">
                          +10
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className={`switch ${p.active ? 'is-on' : ''}`}
                        role="switch"
                        aria-checked={p.active}
                        aria-label={`${p.name} visible in store`}
                        onClick={() => updateProduct(p.id, { active: !p.active })}
                      >
                        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                      </button>
                    </td>
                    <td className="num">
                      <button
                        className="link small bad"
                        onClick={() => confirm(`Delete ${p.name}? This cannot be undone.`) && deleteProduct(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        ) : (
          <Empty>No products yet.</Empty>
        )}
      </div>
      <p className="muted small">Prices are for 250g; 500g and 1kg are priced at 1.8× and 3.2× automatically.</p>
    </>
  )
}
