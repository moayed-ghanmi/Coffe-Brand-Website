import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { View } from '@react-three/drei'
import { ROASTS } from '../data'
import { useStore } from '../store'
import { useCart } from '../cart'
import { BagScene } from '../three/Scenes'

export const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
}

export function SectionHead({ kicker, title, children }) {
  return (
    <motion.div className="section-head" {...reveal}>
      <span className="kicker">{kicker}</span>
      <h2>{title}</h2>
      {children}
    </motion.div>
  )
}

function ProductCard({ product, onOpen }) {
  const { add } = useCart()
  const [hovered, setHovered] = useState(false)
  const inner = useRef()

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    inner.current?.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`)
    inner.current?.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="card"
      style={{ '--accent': product.color === '#2a1810' ? '#d9a066' : product.color }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        inner.current?.style.setProperty('--rx', '0deg')
        inner.current?.style.setProperty('--ry', '0deg')
      }}
      onMouseMove={onMove}
    >
      <div className="card__inner" ref={inner}>
        <button className="card__stage" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
          <div className="card__halo" />
          <View className="view-fill">
            <BagScene product={product} hovered={hovered} />
          </View>
          {product.badge && <span className="badge">{product.badge}</span>}
          <span className="card__roast">{product.roast} roast</span>
        </button>
        <div className="card__body">
          <div className="card__row">
            <div>
              <h3>{product.name}</h3>
              <p className="muted">{product.origin}</p>
            </div>
            <span className="price">${product.price}</span>
          </div>
          <div className="notes">
            {product.notes.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          {product.stock > 0 && product.stock < 10 && <p className="low-stock">Only {product.stock} bags left</p>}
          <div className="card__actions">
            <button className="btn btn--ghost btn--sm" onClick={() => onOpen(product)}>
              Details
            </button>
            <button
              className="btn btn--crema btn--sm"
              disabled={product.stock <= 0}
              onClick={() =>
                add({
                  key: `${product.id}-250g-Whole Bean`,
                  id: product.id,
                  name: product.name,
                  color: product.color,
                  variant: '250g · Whole Bean',
                  price: product.price,
                  qty: 1,
                })
              }
            >
              {product.stock <= 0 ? 'Sold out' : 'Add to cart +'}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export function Shop({ onOpen }) {
  const [filter, setFilter] = useState('All')
  const { products } = useStore()
  const visible = products.filter((p) => p.active)
  const list = filter === 'All' ? visible : visible.filter((p) => p.roast === filter)

  return (
    <section className="section" id="shop">
      <SectionHead kicker="The Lineup" title={<>Beans with <span className="crema">voltage.</span></>}>
        <div className="pills" role="tablist">
          {ROASTS.map((r) => (
            <button key={r} role="tab" aria-selected={filter === r} className="pill" onClick={() => setFilter(r)}>
              {filter === r && <motion.span layoutId="pill" className="pill__bg" transition={{ type: 'spring', bounce: 0.25 }} />}
              <span className="pill__label">{r}</span>
            </button>
          ))}
        </div>
      </SectionHead>
      <motion.div layout className="grid">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={onOpen} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
