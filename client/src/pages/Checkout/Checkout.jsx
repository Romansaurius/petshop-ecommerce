import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Check } from 'lucide-react'
import LoyaltyCard from '../../components/LoyaltyCard/LoyaltyCard'

const Checkout = () => {
  const { cart, getTotalPrice, clearCart, updateQuantity, removeFromCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [orderNotes, setOrderNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [showLoyaltyCard, setShowLoyaltyCard] = useState(false)
  const [userPurchases, setUserPurchases] = useState(3)
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '', address: ''
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [isAuthenticated, user])

  const validDiscounts = {
    'DESCUENTO10': 0.1,
    'PETSHOP20': 0.2,
    'PRIMERA5': 0.05
  }

  const handleApplyDiscount = () => {
    if (validDiscounts[discountCode.toUpperCase()]) {
      setAppliedDiscount(getTotalPrice() * validDiscounts[discountCode.toUpperCase()])
    } else {
      alert('Codigo de descuento invalido')
      setAppliedDiscount(0)
    }
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) removeFromCart(productId)
    else updateQuantity(productId, newQuantity)
  }

  const subtotal = getTotalPrice()
  const discount = appliedDiscount
  const total = subtotal - discount

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Por favor completa toda la informacion requerida')
      setIsProcessing(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    setUserPurchases(prev => prev + 1)
    setOrderComplete(true)
    setIsProcessing(false)

    setTimeout(() => setShowLoyaltyCard(true), 1500)
    setTimeout(() => { clearCart(); navigate('/') }, 8000)
  }

  const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0
  }).format(price)

  if (orderComplete) {
    return (
      <>
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">Pedido Confirmado!</h2>
            <p className="text-secondary-600 mb-4">
              Tu pedido fue procesado. Te contactaremos pronto para confirmar los detalles.
            </p>
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <p className="text-primary-700 font-medium">Felicitaciones!</p>
              <p className="text-sm text-primary-600">Has ganado puntos de fidelidad.</p>
            </div>
            <p className="text-sm text-secondary-500">Redirigiendo al inicio...</p>
          </div>
        </div>
        {showLoyaltyCard && (
          <LoyaltyCard userPurchases={userPurchases} onClose={() => setShowLoyaltyCard(false)} />
        )}
      </>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">Tu carrito esta vacio</h2>
          <p className="text-secondary-600 mb-6">Agrega algunos productos antes de proceder al checkout.</p>
          <button onClick={() => navigate('/menu')} className="btn btn-primary">Ver Productos</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-secondary-600 hover:text-primary-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </button>
            <h1 className="text-2xl font-bold text-secondary-800">Finalizar Pedido</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Tu Carrito</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-800">{item.nombre || item.name}</h4>
                      <p className="text-sm text-secondary-600">{formatPrice(item.precio || item.price || 0)} c/u</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center">-</button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center">+</button>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-secondary-800">{formatPrice((item.precio || item.price || 0) * item.quantity)}</div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">Codigo de Descuento</h3>
              <div className="flex space-x-2">
                <input type="text" placeholder="Ingresa codigo de descuento" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} className="input flex-1" />
                <button onClick={handleApplyDiscount} className="btn btn-secondary px-6">Aplicar</button>
              </div>
              {appliedDiscount > 0 && <p className="text-green-600 mt-2">Descuento aplicado: -{formatPrice(appliedDiscount)}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Resumen del Pedido</h2>
              <div className="space-y-3">
                {cart.map(item => {
                  const precio = item.precio || item.price || 0
                  const is2x1 = item.is2x1
                  const unidadesCobradas = is2x1 ? Math.ceil(item.quantity / 2) : item.quantity
                  const subtotalItem = precio * unidadesCobradas
                  return (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div>
                        <span className="text-secondary-800 font-medium">{item.nombre || item.name}</span>
                        {is2x1 ? (
                          <p className="text-xs text-purple-600 mt-0.5">
                            {item.quantity} unidades · paga {unidadesCobradas} x {formatPrice(precio)}
                          </p>
                        ) : (
                          <p className="text-xs text-secondary-500 mt-0.5">
                            {item.quantity} x {formatPrice(precio)}
                          </p>
                        )}
                      </div>
                      <span className="font-medium text-secondary-800">{formatPrice(subtotalItem)}</span>
                    </div>
                  )
                })}

                <div className="border-t border-secondary-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento ({discountCode.toUpperCase()})</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-secondary-200 pt-2">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-secondary-800">Informacion de Contacto</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre completo *</label>
                  <input type="text" required value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Telefono *</label>
                  <input type="tel" required value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} className="input w-full" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Email *</label>
                <input type="email" required value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} className="input w-full" />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Direccion (opcional)</label>
                <textarea value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="Direccion de entrega" className="input w-full h-20 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Notas del pedido (opcional)</label>
                <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Instrucciones especiales" className="input w-full h-20 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">Metodo de Pago</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50">
                    <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <CreditCard className="w-5 h-5 text-secondary-600" />
                    <span>Tarjeta de Credito/Debito</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50">
                    <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span className="text-2xl">💵</span>
                    <span>Efectivo</span>
                  </label>
                </div>
              </div>

              <button type="submit" disabled={isProcessing} className="w-full btn btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                {isProcessing ? 'Procesando...' : `Realizar Pedido ${formatPrice(total)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
