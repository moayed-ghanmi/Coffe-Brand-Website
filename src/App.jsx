import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { CartProvider } from './cart'
import { Hero, Marquee, Nav } from './components/Top'
import { Shop } from './components/Shop'
import { Explore, Footer, Plans, Process, Reviews } from './components/Sections'
import { CartDrawer, ProductModal } from './components/Overlays'

export default function App() {
  const [product, setProduct] = useState(null)
  const close = useCallback(() => setProduct(null), [])

  return (
    <CartProvider>
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
    </CartProvider>
  )
}
