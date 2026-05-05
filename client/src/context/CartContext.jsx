import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Genera o recupera un ID único por navegador
const getDeviceId = () => {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('device_id', id)
  }
  return id
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const cartKey = `cart_${getDeviceId()}`

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem(cartKey)
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      const normalizedProduct = {
        ...product,
        precio: product.precio || product.price || 0,
        nombre: product.nombre || product.name || 'Producto sin nombre',
        imagen: product.imagen || product.image || (product.imagenes && product.imagenes.length > 0 ? product.imagenes[0] : null),
        imagenes: product.imagenes || (product.imagen ? [product.imagen] : [])
      }

      const is2x1 = product.tipo === '2x1'
      
      if (existingItem) {
        if (existingItem.quantity >= 10) {
          alert('Máximo 10 unidades por producto')
          return prevCart
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { ...normalizedProduct, quantity: 1, is2x1 }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => {
      const price = item.precio || 0
      const unidadesCobradas = item.is2x1 ? Math.ceil(item.quantity / 2) : item.quantity
      return sum + (price * unidadesCobradas)
    }, 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}