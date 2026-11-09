import { lazy, Suspense, useEffect } from 'react'
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
  if (path === '/checkout') page = <Checkout />
  else if (path.startsWith('/order/')) page = <OrderPage id={decodeURIComponent(path.slice(7))} />
  else if (path.startsWith('/admin')) page = <Admin path={path} />
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
          {page}
        </Suspense>
      </CartProvider>
    </StoreProvider>
  )
}
