import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { View } from '@react-three/drei'
import { useCart } from '../cart'
import { HeroScene } from '../three/Scenes'

export function Nav() {
  const { count, setOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const links = [
    ['Shop', '#shop'],
    ['Explore', '#explore'],
    ['Process', '#process'],
    ['Subscribe', '#plans'],
  ]

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <motion.div className="nav__progress" style={{ scaleX: progress }} />
      <a href="#top" className="logo" aria-label="Volta home">
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
          <rect width="32" height="32" rx="9" fill="var(--crema)" />
          <path d="M9 8l7 17 7-17" fill="none" stroke="#1a0f0a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        VOLTA
      </a>
      <nav className={`nav__links ${menu ? 'is-open' : ''}`}>
        {links.map(([l, h]) => (
          <a key={l} href={h} onClick={() => setMenu(false)}>
            {l}
          </a>
        ))}
      </nav>
      <div className="nav__actions">
        <a href="#plans" className="btn btn--ghost btn--sm hide-sm">
          Join the club
        </a>
        <button className="cart-btn" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 7h12l-1 13H7L6 7z" />
            <path d="M9 7a3 3 0 016 0" />
          </svg>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={count}
              className="cart-btn__count"
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </button>
        <button className="burger" onClick={() => setMenu((m) => !m)} aria-label="Menu">
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

const words = ['BREW', 'THE', 'FUTURE.']

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__glow" />
      <div className="hero__grid" />
      <div className="hero__copy">
        <motion.div
          className="chip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="chip__dot" /> NEW · Nyeri Volt limited drop is live
        </motion.div>
        <h1 className="hero__title">
          {words.map((w, i) => (
            <span className="word-mask" key={w}>
              <motion.span
                className={i === 2 ? 'crema' : ''}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="hero__sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          Specialty coffee, roasted to order and shipped within 72 hours. Traceable beans, electric flavor, zero compromise.
        </motion.p>
        <motion.div
          className="hero__cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <a href="#shop" className="btn btn--crema">
            Shop the beans <span aria-hidden>→</span>
          </a>
          <a href="#plans" className="btn btn--ghost">
            Start a subscription
          </a>
        </motion.div>
        <motion.ul
          className="hero__stats"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 1 } } }}
        >
          {[
            ['48h', 'Roast to ship'],
            ['14', 'Partner farms'],
            ['4.9★', '12k reviews'],
          ].map(([n, l]) => (
            <motion.li key={l} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <strong>{n}</strong>
              <span>{l}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <motion.div
        className="hero__3d"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        <View className="view-fill">
          <HeroScene />
        </View>
        <div className="hero__tag hero__tag--a">
          <span className="dot" /> 93°C · perfect extraction
        </div>
        <div className="hero__tag hero__tag--b">Single origin · Guji</div>
      </motion.div>
      <a href="#shop" className="scroll-hint" aria-label="Scroll to shop">
        <span />
      </a>
    </section>
  )
}

export function Marquee({ items, reverse = false, variant = 'crema' }) {
  const row = [...items, ...items]
  return (
    <div className={`marquee marquee--${variant}`}>
      <div className={`marquee__track ${reverse ? 'is-reverse' : ''}`}>
        {row.map((t, i) => (
          <span key={i}>
            {t} <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  )
}
