import { lazy, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CartProvider } from './cart'
import { StoreProvider } from './store'
import { useRoute } from './utils'

const Home = lazy(() => import('./pages/Home'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderPage = lazy(() => import('./pages/OrderPage'))
const Admin = lazy(() => import('./admin/Admin'))

export default function App() {
  const path = useRoute()

  useEffect(() => {
    if (path !== '/') window.scrollTo(0, 0)
  }, [path])

  let page
  let key = 'home'
  if (path === '/checkout') [page, key] = [<Checkout />, 'checkout']
  else if (path.startsWith('/order/')) [page, key] = [<OrderPage id={decodeURIComponent(path.slice(7))} />, 'order']
  else if (path.startsWith('/admin')) [page, key] = [<Admin path={path} />, 'admin']
  else page = <Home />

  return (
    <StoreProvider>
      <CartProvider>
        <Suspense
          fallback={
            <div className="page-loading">
              <span />
            </div>
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {page}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </CartProvider>
    </StoreProvider>
  )
}
