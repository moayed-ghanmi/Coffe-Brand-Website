import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { PLANS, REVIEWS, STEPS } from '../data'
import { SectionHead, reveal } from './Shop'
import { Marquee } from './Top'

const TILES = [
  { title: 'Cold Brew Lab', text: '18-hour steeped concentrate, delivered chilled.', tag: 'NEW', bg: 'linear-gradient(135deg,#1a2a05,#d4ff3a 160%)', span: 'wide' },
  { title: 'Barista Academy', text: 'Free video courses from latte art to dialing in.', tag: 'FREE', bg: 'linear-gradient(135deg,#1e0f2e,#b18cff 170%)' },
  { title: 'Gift Cards', text: 'Instant e-gift, any amount.', bg: 'linear-gradient(135deg,#2e1206,#ff5b2e 170%)' },
  { title: 'Brew Gear', text: 'Grinders, kettles and drippers we actually use.', tag: 'SOON', bg: 'linear-gradient(135deg,#06222a,#3ae0ff 170%)' },
  { title: 'Wholesale', text: 'Fresh-roast programs for cafés and offices.', bg: 'linear-gradient(135deg,#2a2005,#ffc93c 170%)' },
]

export function Explore() {
  return (
    <section className="section" id="explore">
      <SectionHead kicker="Explore" title={<>More than <span className="lime">a bag of beans.</span></>} />
      <div className="tiles">
        {TILES.map((t, i) => (
          <motion.a
            href="#shop"
            key={t.title}
            className={`tile ${t.span === 'wide' ? 'tile--wide' : ''}`}
            style={{ background: t.bg }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
          >
            <div className="tile__orb" />
            {t.tag && <span className="badge">{t.tag}</span>}
            <div className="tile__copy">
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </div>
            <span className="tile__arrow">↗</span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

export function Process() {
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], ['10%', '-35%'])
  const line = useTransform(scrollYProgress, [0.15, 0.6], [0, 1])

  return (
    <section className="section process" id="process" ref={ref}>
      <motion.h2 className="giant" style={{ x }} aria-hidden>
        SEED TO CUP · SEED TO CUP ·
      </motion.h2>
      <SectionHead kicker="Process" title={<>From farm to <span className="lime">your first sip.</span></>} />
      <div className="steps">
        <motion.div className="steps__line" style={{ scaleX: line }} />
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            className="step"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: i * 0.12, duration: 0.7 }}
          >
            <span className="step__n">{s.n}</span>
            <h3>{s.title}</h3>
            <p className="muted">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function Plans() {
  return (
    <section className="section" id="plans">
      <SectionHead kicker="Subscribe" title={<>Never run <span className="lime">dry.</span></>}>
        <p className="muted center">Fresh coffee on autopilot. Skip, swap or cancel anytime.</p>
      </SectionHead>
      <div className="plans">
        {PLANS.map((p, i) => (
          <motion.div
            key={p.name}
            className={`plan ${p.featured ? 'plan--featured' : ''}`}
            initial={{ opacity: 0, y: 50, rotateX: 12 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
          >
            {p.featured && <span className="badge">Most popular</span>}
            <h3>{p.name}</h3>
            <p className="plan__bags">{p.bags}</p>
            <p className="plan__price">
              ${p.price}
              <span>/mo</span>
            </p>
            <ul>
              {p.perks.map((perk) => (
                <li key={perk}>⚡ {perk}</li>
              ))}
            </ul>
            <a href="#shop" className={`btn block ${p.featured ? 'btn--dark' : 'btn--ghost'}`}>
              Choose {p.name}
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function Reviews() {
  return (
    <section className="reviews">
      <motion.div {...reveal} className="section-head">
        <span className="kicker">12,000+ five-star reviews</span>
      </motion.div>
      <div className="marquee marquee--plain">
        <div className="marquee__track slow">
          {[...REVIEWS, ...REVIEWS].map((r, i) => (
            <figure className="review" key={i}>
              <div className="stars">★★★★★</div>
              <blockquote>“{r.text}”</blockquote>
              <figcaption>{r.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <Marquee items={['ROASTED TO ORDER', 'DIRECT TRADE', 'CARBON NEUTRAL SHIPPING', 'FREE OVER $50']} reverse />
      <div className="footer__top">
        <motion.div {...reveal} className="footer__news">
          <h3>Get first dibs on limited drops.</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.currentTarget.reset()
              e.currentTarget.querySelector('button').textContent = 'Subscribed ✓'
            }}
          >
            <input type="email" required placeholder="you@email.com" aria-label="Email" />
            <button className="btn btn--lime">Subscribe</button>
          </form>
        </motion.div>
        <div className="footer__cols">
          {[
            ['Shop', ['All coffee', 'Subscriptions', 'Gift cards', 'Brew gear']],
            ['Company', ['Our farms', 'Journal', 'Careers', 'Wholesale']],
            ['Help', ['Shipping', 'Returns', 'FAQ', 'Contact']],
          ].map(([h, ls]) => (
            <div key={h}>
              <h4>{h}</h4>
              {ls.map((l) => (
                <a key={l} href="#top">
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="footer__word" aria-hidden>
        VOLTA
      </div>
      <p className="footer__legal muted small">© 2026 Volta Coffee Roasters. Demo storefront — no real payments are processed.</p>
    </footer>
  )
}
