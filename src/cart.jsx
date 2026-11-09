import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const CartContext = createContext(null)
const KEY = 'volta-cart-v1'

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { item } = action
      const existing = state.items.find((i) => i.key === item.key)
      const items = existing
        ? state.items.map((i) => (i.key === item.key ? { ...i, qty: i.qty + item.qty } : i))
        : [...state.items, item]
      return { ...state, items, open: true }
    }
    case 'qty':
      return {
        ...state,
        items: state.items
          .map((i) => (i.key === action.key ? { ...i, qty: i.qty + action.delta } : i))
          .filter((i) => i.qty > 0),
      }
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.key !== action.key) }
    case 'clear':
      return { ...state, items: [] }
    case 'open':
      return { ...state, open: action.open }
    default:
      return state
  }
}

function init() {
  try {
    return { items: JSON.parse(localStorage.getItem(KEY)) ?? [], open: false }
  } catch {
    return { items: [], open: false }
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state.items))
  }, [state.items])

  const value = useMemo(() => {
    const count = state.items.reduce((s, i) => s + i.qty, 0)
    const subtotal = state.items.reduce((s, i) => s + i.qty * i.price, 0)
    return {
      ...state,
      count,
      subtotal,
      add: (item) => dispatch({ type: 'add', item }),
      changeQty: (key, delta) => dispatch({ type: 'qty', key, delta }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
      setOpen: (open) => dispatch({ type: 'open', open }),
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export const useCart = () => useContext(CartContext)
