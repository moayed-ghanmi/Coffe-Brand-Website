import { useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { Hero, Marquee, Nav } from '../components/Top'
import { Shop } from '../components/Shop'
import { Explore, Footer, Plans, Process, Reviews } from '../components/Sections'
import { CartDrawer, ProductModal } from '../components/Overlays'

export default function Home() {
  const [product, setProduct] = useState(null)
  const close = useCallback(() => setProduct(null), [])

  // Arriving from another page with an anchor (e.g. "#shop"): scroll once the sections exist.
  useEffect(() => {
    const h = window.location.hash
    if (h.length > 1 && !h.startsWith('#/')) {
      // Instant jump after initial layout settles; an early smooth scroll gets cancelled on fresh loads.
      const t = setTimeout(() => document.getElementById(h.slice(1))?.scrollIntoView({ behavior: 'instant' }), 350)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee items={['SINGLE ORIGIN', 'ROASTED TO ORDER', 'DIRECT TRADE', '48H FRESH', 'SPECIALTY GRADE 86+']} />
        <Shop onOpen={setProduct} />
        <Explore />
        <Process />
        <Plans />
        <Reviews />
      </main>
      <Footer />
      <ProductModal product={product} onClose={close} />
      <CartDrawer />
      {/* One shared WebGL canvas renders every <View> on the page (hero + product cards). */}
      <Canvas
        className="gl"
        shadows
        dpr={[1, 2]}
        eventSource={document.getElementById('root')}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      >
        <View.Port />
      </Canvas>
    </>
  )
}
