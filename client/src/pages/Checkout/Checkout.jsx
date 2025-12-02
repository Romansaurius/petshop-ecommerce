import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Check } from 'lucide-react'

const Checkout = () => {
  const {
    cart,
    getTotalPrice,
    clearCart,
    updateQuantity,
    removeFromCart
  } = useCart()
  const navigate = useNavigate()

  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [orderNotes, setOrderNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  const validDiscounts = {
    'DESCUENTO10': 0.1,
    'PETSHOP20': 0.2,
    'PRIMERA5': 0.05
  }

  const handleApplyDiscount = () => {
    if (validDiscounts[discountCode.toUpperCase()]) {
      const discountRate = validDiscounts[discountCode.toUpperCase()]
      const discountAmount = getTotalPrice() * discountRate
      setAppliedDiscount(discountAmount)
    } else {
      alert('Código de descuento inválido')
      setAppliedDiscount(0)
    }
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const subtotal = getTotalPrice()
  const discount = appliedDiscount
  const total = subtotal - discount

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Por favor completa toda la información requerida')
      setIsProcessing(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    const orderData = {
      customer: customerInfo,
      items: cart,
      subtotal,
      discount,
      total,
      paymentMethod,
      notes: orderNotes,
      timestamp: new Date().toISOString()
    }

    console.log('Pedido enviado:', orderData)
    
    setOrderComplete(true)
    setIsProcessing(false)
    
    setTimeout(() => {
      clearCart()
      navigate('/')
    }, 3000)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">¡Pedido Confirmado!</h2>
          <p className="text-secondary-600 mb-4">
            Tu pedido ha sido procesado exitosamente. Te contactaremos pronto para confirmar los detalles.
          </p>
          <p className="text-sm text-secondary-500">
            Redirigiendo al inicio en unos segundos...
          </p>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-secondary-600 mb-6">
            Agrega algunos productos antes de proceder al checkout.
          </p>
          <button 
            onClick={() => navigate('/menu')}
            className="btn btn-primary"
          >
            Ver Productos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-secondary-600 hover:text-primary-500 transition-colors"
            >
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
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Tu Carrito de Compras</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-800">{item.name}</h4>
                      <p className="text-sm text-secondary-600">{formatPrice(item.price)} c/u</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-secondary-800">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">Código de Descuento</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ingresa código de descuento"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="input flex-1"
                />
                <button onClick={handleApplyDiscount} className="btn btn-secondary px-6">
                  Aplicar
                </button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-green-600 mt-2">
                  Descuento aplicado: -{formatPrice(appliedDiscount)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Resumen del Pedido</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-secondary-200 pt-2 mt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary-500">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-secondary-800">Información de Contacto</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Dirección (opcional)
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  placeholder="Dirección de entrega si es diferente"
                  className="input w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Notas del pedido (opcional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Instrucciones especiales, alergias, etc."
                  className="input w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Método de Pago
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-500"
                    />
                    <CreditCard className="w-5 h-5 text-secondary-600" />
                    <span>Tarjeta de Crédito/Débito</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-500"
                    />
                    <span className="text-2xl">💵</span>
                    <span>Efectivo</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full btn btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Procesando...' : `Realizar Pedido - ${formatPrice(total)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout