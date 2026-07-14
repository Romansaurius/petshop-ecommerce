import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, MapPin, Truck, Store } from 'lucide-react'

const Field = ({ label, name, required, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-secondary-700 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

const Checkout = () => {
  const { cart, getTotalPrice, clearCart, updateQuantity, removeFromCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [zones, setZones] = useState([])
  const [shippingConfig, setShippingConfig] = useState({})
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const [shippingMethod, setShippingMethod] = useState('delivery') // 'delivery' | 'pickup'
  const [selectedZone, setSelectedZone] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')

  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '',
    provincia: '', ciudad: '', calle: '', numero: '',
    piso: '', depto: '', cp: '', referencias: ''
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo(prev => ({ ...prev, name: user.name || '', email: user.email || '' }))
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    fetch('/api/shipping/zones').then(r => r.json()).then(setZones).catch(() => {})
    fetch('/api/shipping/config').then(r => r.json()).then(setShippingConfig).catch(() => {})
  }, [])

  // Todas las ciudades aplanadas
  const allCities = zones.flatMap(z => (z.cities || []).map(c => ({ ...c, zona: z })))

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName)
    const found = allCities.find(c => c.nombre === cityName)
    setSelectedZone(found ? found.zona : null)
    setCustomerInfo(prev => ({ ...prev, ciudad: cityName }))
  }

  const shippingCost = (() => {
    if (shippingMethod === 'pickup') return 0
    if (!selectedZone) return null
    const subtotal = getTotalPrice() - appliedDiscount
    if (shippingConfig.envio_gratis_activo && subtotal >= shippingConfig.monto_envio_gratis) return 0
    return selectedZone.precio
  })()

  const subtotal = getTotalPrice()
  const discount = appliedDiscount
  const total = subtotal - discount + (shippingCost || 0)

  const validDiscounts = { 'DESCUENTO10': 0.1, 'PETSHOP20': 0.2, 'PRIMERA5': 0.05 }

  const handleApplyDiscount = () => {
    const d = validDiscounts[discountCode.toUpperCase()]
    if (d) setAppliedDiscount(getTotalPrice() * d)
    else { alert('Código de descuento inválido'); setAppliedDiscount(0) }
  }

  const handleQuantityChange = (productId, qty, variante_id = null) => {
    if (qty <= 0) removeFromCart(productId, variante_id)
    else updateQuantity(productId, qty, variante_id)
  }

  const validate = () => {
    const e = {}
    if (!customerInfo.name.trim()) e.name = 'Requerido'
    if (!customerInfo.email.trim()) e.email = 'Requerido'
    if (!customerInfo.phone.trim()) e.phone = 'Requerido'
    if (shippingMethod === 'delivery') {
      if (!customerInfo.provincia.trim()) e.provincia = 'Requerido'
      if (!customerInfo.ciudad.trim()) e.ciudad = 'Requerido'
      if (!customerInfo.calle.trim()) e.calle = 'Requerido'
      if (!customerInfo.numero.trim()) e.numero = 'Requerido'
    }
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (shippingMethod === 'delivery' && shippingCost === null) {
      alert('Seleccioná una ciudad para calcular el costo de envío')
      return
    }
    setIsProcessing(true)
    try {
      const address = shippingMethod === 'pickup'
        ? 'Retiro en local'
        : `${customerInfo.calle} ${customerInfo.numero}${customerInfo.piso ? ` P${customerInfo.piso}` : ''}${customerInfo.depto ? ` D${customerInfo.depto}` : ''}, ${customerInfo.ciudad}, ${customerInfo.provincia}${customerInfo.cp ? ` (CP ${customerInfo.cp})` : ''}`

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerInfo: { ...customerInfo, address },
          usuario_id: user?.id || null,
          discount: appliedDiscount,
          costo_envio: shippingCost || 0,
          metodo_envio: shippingMethod === 'pickup' ? 'Retiro en local' : `Envío a ${customerInfo.ciudad} (${selectedZone?.nombre})`
        })
      })
      const data = await res.json()
      if (data.init_point) window.location.href = data.init_point
      else alert('Error al iniciar el pago. Intentá de nuevo.')
    } catch {
      alert('Error de conexión. Intentá de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  const fmt = (p) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p)

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-secondary-600 mb-6">Agregá algunos productos antes de continuar.</p>
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
            <div />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Columna izquierda: carrito + descuento */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Tu Carrito</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.variante_id ? `${item.id}_${item.variante_id}` : item.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-800">{item.nombre || item.name} {item.talla && <span className="text-primary-500">({item.talla})</span>}</h4>
                      <p className="text-sm text-secondary-600">{fmt(item.precio || item.price || 0)} c/u</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.variante_id)} className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center">-</button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.variante_id)} className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center">+</button>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-secondary-800">{fmt((item.precio || item.price || 0) * item.quantity)}</div>
                        <button onClick={() => removeFromCart(item.id, item.variante_id)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">Código de Descuento</h3>
              <div className="flex space-x-2">
                <input type="text" placeholder="Ingresá tu código" value={discountCode} onChange={e => setDiscountCode(e.target.value)} className="input flex-1" />
                <button onClick={handleApplyDiscount} className="btn btn-secondary px-6">Aplicar</button>
              </div>
              {appliedDiscount > 0 && <p className="text-green-600 mt-2 text-sm">Descuento aplicado: -{fmt(appliedDiscount)}</p>}
            </div>
          </div>

          {/* Columna derecha: resumen + formulario */}
          <div className="space-y-6">

            {/* Resumen */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Resumen del Pedido</h2>
              <div className="space-y-2 text-sm">
                {cart.map(item => {
                  const precio = item.precio || item.price || 0
                  const unidades = item.is2x1 ? Math.ceil(item.quantity / 2) : item.quantity
                  return (
                    <div key={item.variante_id ? `${item.id}_${item.variante_id}` : item.id} className="flex justify-between">
                      <span className="text-secondary-700">{item.nombre || item.name} {item.talla && `(${item.talla})`} × {item.quantity}</span>
                      <span className="font-medium">{fmt(precio * unidades)}</span>
                    </div>
                  )
                })}
                <div className="border-t border-secondary-200 pt-3 space-y-2 mt-2">
                  <div className="flex justify-between text-secondary-600">
                    <span>Subtotal</span><span>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span><span>-{fmt(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-secondary-600">
                    <span>Envío</span>
                    <span>
                      {shippingMethod === 'pickup' ? 'Gratis (retiro)' :
                        shippingCost === null ? <span className="text-secondary-400 italic">Seleccioná ciudad</span> :
                        shippingCost === 0 ? <span className="text-green-600">Gratis</span> :
                        fmt(shippingCost)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-secondary-200 pt-2">
                    <span>Total</span>
                    <span className="text-primary-600">{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmitOrder} className="card p-6 space-y-5">
              <h3 className="text-lg font-semibold text-secondary-800">Datos de contacto</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nombre y apellido" name="name" required error={fieldErrors.name}>
                  <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} className={`input w-full ${fieldErrors.name ? 'border-red-400' : ''}`} />
                </Field>
                <Field label="Teléfono" name="phone" required error={fieldErrors.phone}>
                  <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className={`input w-full ${fieldErrors.phone ? 'border-red-400' : ''}`} />
                </Field>
              </div>

              <Field label="Email" name="email" required error={fieldErrors.email}>
                <input type="email" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} className={`input w-full ${fieldErrors.email ? 'border-red-400' : ''}`} />
              </Field>

              {/* Método de envío */}
              <div>
                <p className="text-sm font-medium text-secondary-700 mb-2">Método de entrega</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setShippingMethod('delivery')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${shippingMethod === 'delivery' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'}`}>
                    <Truck className="w-4 h-4" /> Envío a domicilio
                  </button>
                  {shippingConfig.retiro_local_activo && (
                    <button type="button" onClick={() => setShippingMethod('pickup')}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${shippingMethod === 'pickup' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'}`}>
                      <Store className="w-4 h-4" /> Retiro en local
                    </button>
                  )}
                </div>
              </div>

              {/* Dirección de envío */}
              {shippingMethod === 'delivery' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-secondary-700">
                    <MapPin className="w-4 h-4 text-primary-500" /> Dirección de envío
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Provincia" required error={fieldErrors.provincia}>
                      <input type="text" value={customerInfo.provincia} onChange={e => setCustomerInfo({ ...customerInfo, provincia: e.target.value })} className={`input w-full ${fieldErrors.provincia ? 'border-red-400' : ''}`} placeholder="Ej: Buenos Aires" />
                    </Field>
                    <Field label="Ciudad / Localidad" required error={fieldErrors.ciudad}>
                      <input
                        type="text"
                        list="cities-list"
                        value={selectedCity}
                        onChange={e => handleCityChange(e.target.value)}
                        className={`input w-full ${fieldErrors.ciudad ? 'border-red-400' : ''}`}
                        placeholder="Escribí o seleccioná"
                      />
                      <datalist id="cities-list">
                        {allCities.map(c => <option key={c.id} value={c.nombre} />)}
                      </datalist>
                      {selectedZone && (
                        <p className="text-xs text-primary-600 mt-1">
                          Zona: {selectedZone.nombre} — Envío: {shippingCost === 0 ? 'Gratis' : fmt(selectedZone.precio)}
                        </p>
                      )}
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Calle" required error={fieldErrors.calle}>
                      <input type="text" value={customerInfo.calle} onChange={e => setCustomerInfo({ ...customerInfo, calle: e.target.value })} className={`input w-full ${fieldErrors.calle ? 'border-red-400' : ''}`} />
                    </Field>
                    <Field label="Número" required error={fieldErrors.numero}>
                      <input type="text" value={customerInfo.numero} onChange={e => setCustomerInfo({ ...customerInfo, numero: e.target.value })} className={`input w-full ${fieldErrors.numero ? 'border-red-400' : ''}`} />
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Piso">
                      <input type="text" value={customerInfo.piso} onChange={e => setCustomerInfo({ ...customerInfo, piso: e.target.value })} className="input w-full" placeholder="Opcional" />
                    </Field>
                    <Field label="Depto">
                      <input type="text" value={customerInfo.depto} onChange={e => setCustomerInfo({ ...customerInfo, depto: e.target.value })} className="input w-full" placeholder="Opcional" />
                    </Field>
                    <Field label="Código Postal">
                      <input type="text" value={customerInfo.cp} onChange={e => setCustomerInfo({ ...customerInfo, cp: e.target.value })} className="input w-full" placeholder="Opcional" />
                    </Field>
                  </div>

                  <Field label="Referencias">
                    <input type="text" value={customerInfo.referencias} onChange={e => setCustomerInfo({ ...customerInfo, referencias: e.target.value })} className="input w-full" placeholder="Ej: Portón azul, timbre 2 (opcional)" />
                  </Field>
                </div>
              )}

              <button type="submit" disabled={isProcessing} className="w-full bg-[#009ee3] hover:bg-[#0088cc] text-white py-4 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3">
                {isProcessing
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirigiendo...</>
                  : <>Pagar {fmt(total)} con Mercado Pago</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
