import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Truck, Store } from 'lucide-react'

const Field = ({ label, required, children, error }) => (
  <div>
    <label className="block text-sm font-medium text-secondary-700 mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

const Checkout = () => {
  const { cart, getTotalPrice, updateQuantity, removeFromCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [zones, setZones] = useState([])
  const [shippingConfig, setShippingConfig] = useState({})
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [shippingMethod, setShippingMethod] = useState('delivery')
  const [selectedZone, setSelectedZone] = useState(null)
  const [selectedOffice, setSelectedOffice] = useState('')

  const OFFICES = [
    { id: 'tortuguitas', label: 'Oficina Tortuguitas', address: 'Los Laureles 991, entre Formosa y Per籀n' },
    { id: 'pilar', label: 'Oficina Pilar', address: '12 de Octubre 56500, Complejo La Ca簽ada, Barrio Los Arces' },
  ]
  const [cpStatus, setCpStatus] = useState(null)
  const [loyaltyNivel, setLoyaltyNivel] = useState('normal')
  const [loyaltyNivelExpira, setLoyaltyNivelExpira] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '',
    provincia: '', ciudad: '', calle: '', numero: '',
    piso: '', depto: '', cp: '', referencias: ''
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo(prev => ({ ...prev, name: user.name || '', email: user.email || '' }))
      // Consultar nivel loyalty
      const token = localStorage.getItem('token')
      fetch('/api/loyalty/perfil', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { if (d.nivel) { setLoyaltyNivel(d.nivel); setLoyaltyNivelExpira(d.nivel_expira) } })
        .catch(() => {})
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    fetch('/api/shipping/zones').then(r => r.json()).then(d => setZones(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/shipping/config').then(r => r.json()).then(setShippingConfig).catch(() => {})
  }, [])

  const allCities = zones.flatMap(z => (z.cities || []).map(c => ({ ...c, zona: z })))
  // Solo Buenos Aires y CABA
  const provincias = [...new Set(allCities.map(c => c.provincia).filter(Boolean))]
    .filter(p => p === 'Buenos Aires' || p === 'Ciudad Aut籀noma de Buenos Aires')
    .sort()
  const zonasByProvincia = customerInfo.provincia
    ? zones.filter(z => (z.cities || []).some(c => c.provincia === customerInfo.provincia))
    : []
  const [selectedZoneId, setSelectedZoneId] = useState('')
  const citiesByZone = selectedZoneId
    ? allCities.filter(c => c.shipping_zone_id === Number(selectedZoneId))
    : []

  const handleProvinciaChange = (prov) => {
    setCustomerInfo(prev => ({ ...prev, provincia: prov, ciudad: '' }))
    setSelectedZone(null)
    setSelectedZoneId('')
  }

  const handleZoneChange = (zoneId) => {
    setSelectedZoneId(zoneId)
    const zone = zones.find(z => z.id === Number(zoneId))
    setSelectedZone(zone || null)
    setCustomerInfo(prev => ({ ...prev, ciudad: '' }))
  }

  const handleCityChange = (cityName) => {
    setCustomerInfo(prev => ({ ...prev, ciudad: cityName }))
  }

  const subtotal = getTotalPrice()
  const discount = appliedDiscount

  // Descuento pasivo por nivel loyalty
  const loyaltyDiscount = (() => {
    if (loyaltyNivel === 'gold') return Math.min(subtotal * 0.05, 7500)
    if (loyaltyNivel === 'platinum') return Math.min(subtotal * 0.05, 10000)
    return 0
  })()
  const totalDiscount = discount + loyaltyDiscount

  // Envio gratis Platinum solo en Zona Norte (id=1)
  const ZONA_NORTE_ID = 1
  const platinumEnvioGratis = loyaltyNivel === 'platinum' && selectedZone?.id === ZONA_NORTE_ID

  const shippingCost = (() => {
    if (shippingMethod === 'pickup') return 0
    if (platinumEnvioGratis) return 0
    if (!selectedZone) return null
    const sub = subtotal - totalDiscount
    const montoGratis = selectedZone.monto_envio_gratis
      ? Number(selectedZone.monto_envio_gratis)
      : (shippingConfig.envio_gratis_activo ? Number(shippingConfig.monto_envio_gratis) : null)
    if (montoGratis !== null && sub >= montoGratis) return 0
    return Number(selectedZone.precio)
  })()

  const total = subtotal - totalDiscount + (shippingCost ?? 0)

  const handleApplyDiscount = async () => {
    const code = discountCode.trim().toUpperCase()
    if (!code) return
    setCouponError('')
    try {
      const res = await fetch(`/api/loyalty/validate-coupon/${code}?subtotal=${subtotal}`)
      const data = await res.json()
      if (!res.ok) { setCouponError(data.error || 'Cup籀n inv獺lido'); setAppliedDiscount(0); setAppliedCoupon(null); return }
      let valor = data.tipo === 'porcentaje'
        ? subtotal * (Number(data.valor) / 100)
        : Number(data.valor)
      // Aplicar tope m獺ximo si existe
      if (data.descuento_maximo && valor > data.descuento_maximo) valor = data.descuento_maximo
      setAppliedDiscount(valor)
      setAppliedCoupon(data)
    } catch {
      setCouponError('Error al verificar el cup籀n')
    }
  }

  const handleCpBlur = async () => {
    const cp = customerInfo.cp.trim()
    const ciudad = customerInfo.ciudad.trim()
    if (!cp || !ciudad || cp.length < 4) return
    setCpStatus('checking')
    try {
      const res = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?codigo_postal=${cp}&max=10`)
      const data = await res.json()
      const localidades = data.localidades || []
      if (!localidades.length) { setCpStatus('unknown'); return }
      const match = localidades.some(l =>
        l.nombre.toLowerCase().includes(ciudad.toLowerCase()) ||
        ciudad.toLowerCase().includes(l.nombre.toLowerCase())
      )
      setCpStatus(match ? 'ok' : 'mismatch')
    } catch {
      setCpStatus(null)
    }
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
      alert('Seleccion獺 una ciudad para calcular el costo de env穩o')
      return
    }
    setIsProcessing(true)
    try {
      const address = shippingMethod === 'pickup'
        ? `Retiro en local${selectedOffice ? ` ??${OFFICES.find(o => o.id === selectedOffice)?.label}: ${OFFICES.find(o => o.id === selectedOffice)?.address}` : ''}`
        : `${customerInfo.calle} ${customerInfo.numero}${customerInfo.piso ? ` P${customerInfo.piso}` : ''}${customerInfo.depto ? ` D${customerInfo.depto}` : ''}, ${customerInfo.ciudad}, ${customerInfo.provincia}${customerInfo.cp ? ` (CP ${customerInfo.cp})` : ''}`

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerInfo: { ...customerInfo, address },
          usuario_id: user?.id || null,
          discount: totalDiscount,
          costo_envio: shippingCost ?? 0,
          metodo_envio: shippingMethod === 'pickup'
            ? 'Retiro en local'
            : `Env穩o a ${customerInfo.ciudad} (${selectedZone?.nombre ?? 'zona a confirmar'})`,
          cp_alerta: ['mismatch', 'unknown'].includes(cpStatus) ? cpStatus : null,
          cupon_codigo: appliedCoupon?.codigo || null
        })
      })
      const data = await res.json()
      if (data.init_point) window.location.href = data.init_point
      else alert('Error al iniciar el pago. Intent獺 de nuevo.')
    } catch {
      alert('Error de conexi籀n. Intent獺 de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  const fmt = (p) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Number(p) || 0)

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold text-secondary-800 mb-2">Tu carrito est獺 vac穩o</h2>
          <p className="text-secondary-600 mb-6">Agreg獺 algunos productos antes de continuar.</p>
          <button onClick={() => navigate('/menu')} className="btn btn-primary">Ver Productos</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-secondary-600 hover:text-primary-500 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Volver</span>
            </button>
            <h1 className="flex-1 text-center text-lg sm:text-2xl font-bold text-secondary-800">Finalizar Pedido</h1>
            <div className="w-16 sm:w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Izquierda: carrito + descuento */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Tu Carrito</h2>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.variante_id ? `${item.id}_${item.variante_id}` : item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary-50 rounded-lg gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-800 text-sm">{item.nombre || item.name} {item.talla && <span className="text-primary-500">({item.talla})</span>}</h4>
                      <p className="text-sm text-secondary-600">{fmt(item.precio || item.price || 0)} c/u</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:gap-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.variante_id)} className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center text-sm">-</button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.variante_id)} className="w-8 h-8 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center text-sm">+</button>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-secondary-800">{fmt((item.precio || item.price || 0) * item.quantity)}</div>
                        <button onClick={() => removeFromCart(item.id, item.variante_id)} className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">C籀digo de Descuento</h3>
              <div className="flex space-x-2">
                <input type="text" placeholder="Ingres獺 tu c籀digo" value={discountCode}
                  onChange={e => { setDiscountCode(e.target.value); setCouponError(''); setAppliedDiscount(0); setAppliedCoupon(null) }}
                  className="input flex-1" />
                <button onClick={handleApplyDiscount} className="btn btn-secondary px-6">Aplicar</button>
              </div>
              {couponError && <p className="text-red-500 mt-2 text-sm">{couponError}</p>}
              {appliedCoupon && (
                <div className="mt-2 text-sm text-green-600 space-y-0.5">
                  <p>??{appliedCoupon.nombre} ??-{fmt(appliedDiscount)}</p>
                  {appliedCoupon.monto_minimo && <p className="text-xs text-secondary-400">Compra m穩nima: {fmt(appliedCoupon.monto_minimo)}</p>}
                  {appliedCoupon.descuento_maximo && <p className="text-xs text-secondary-400">Tope de descuento: {fmt(appliedCoupon.descuento_maximo)}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Derecha: resumen + formulario */}
          <div className="space-y-6">

            {/* Badge nivel loyalty activo */}
            {loyaltyNivel !== 'normal' && (
              <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                loyaltyNivel === 'platinum' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}>
                <span>{loyaltyNivel === 'platinum' ? '??' : '?}</span>
                <span>
                  Nivel <strong>{loyaltyNivel === 'platinum' ? 'Platinum' : 'Gold'}</strong> activo
                  {loyaltyNivelExpira && <span className="font-normal opacity-75"> 繚 vence {new Date(loyaltyNivelExpira).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>}
                  {' ??'}
                  {loyaltyNivel === 'platinum' ? '5% OFF + env穩o gratis' : '5% OFF en esta compra'}
                </span>
              </div>
            )}

            {/* Resumen */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-4">Resumen del Pedido</h2>
              <div className="space-y-2 text-sm">
                {cart.map(item => {
                  const precio = Number(item.precio || item.price || 0)
                  const unidades = item.is2x1 ? Math.ceil(item.quantity / 2) : item.quantity
                  return (
                    <div key={item.variante_id ? `${item.id}_${item.variante_id}` : item.id} className="flex justify-between">
                      <span className="text-secondary-700">{item.nombre || item.name} {item.talla && `(${item.talla})`} ? {item.quantity}</span>
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
                      <span>Descuento cup籀n</span><span>-{fmt(discount)}</span>
                    </div>
                  )}
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>
                        {loyaltyNivel === 'gold' ? '?Descuento Gold (5%)' : '?? Descuento Platinum (5%)'}
                      </span>
                      <span>-{fmt(loyaltyDiscount)}</span>
                    </div>
                  )}
                  {loyaltyNivel === 'platinum' && shippingMethod !== 'pickup' && platinumEnvioGratis && (
                    <div className="flex justify-between text-purple-600 text-xs">
                      <span>Envio gratis Platinum</span><span></span>
                    </div>
                  )}
                  <div className="flex justify-between text-secondary-600">
                    <span>Env穩o</span>
                    <span>
                      {shippingMethod === 'pickup'
                        ? <span className="text-green-600">Gratis (retiro)</span>
                        : shippingCost === null
                          ? <span className="text-secondary-400 italic">Seleccion獺 ciudad</span>
                          : shippingCost === 0
                            ? <span className="text-green-600">Gratis</span>
                            : fmt(shippingCost)
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
                <Field label="Nombre y apellido" required error={fieldErrors.name}>
                  <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} className={`input w-full ${fieldErrors.name ? 'border-red-400' : ''}`} />
                </Field>
                <Field label="Tel矇fono" required error={fieldErrors.phone}>
                  <input type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className={`input w-full ${fieldErrors.phone ? 'border-red-400' : ''}`} />
                </Field>
              </div>

              <Field label="Email" required error={fieldErrors.email}>
                <input type="email" value={customerInfo.email} onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })} className={`input w-full ${fieldErrors.email ? 'border-red-400' : ''}`} />
              </Field>

              {/* M矇todo de entrega */}
              <div>
                <p className="text-sm font-medium text-secondary-700 mb-2">M矇todo de entrega</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setShippingMethod('delivery')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${shippingMethod === 'delivery' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'}`}>
                    <Truck className="w-4 h-4" /> Env穩o a domicilio
                  </button>
                  {shippingConfig.retiro_local_activo && (
                    <button type="button" onClick={() => setShippingMethod('pickup')}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${shippingMethod === 'pickup' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'}`}>
                      <Store className="w-4 h-4" /> Retiro en local
                    </button>
                  )}
                </div>
              </div>

              {/* Oficina de retiro */}
              {shippingMethod === 'pickup' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary-700 flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary-500" /> Eleg穩 la oficina de retiro
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {OFFICES.map(o => (
                      <button key={o.id} type="button" onClick={() => setSelectedOffice(o.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          selectedOffice === o.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-200 hover:border-secondary-300'
                        }`}>
                        <p className="text-sm font-semibold text-secondary-800">{o.label}</p>
                        <p className="text-xs text-secondary-500 mt-0.5">{o.address}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Direcci籀n */}
              {shippingMethod === 'delivery' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-secondary-700">
                    <MapPin className="w-4 h-4 text-primary-500" /> Direcci籀n de env穩o
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Provincia" required error={fieldErrors.provincia}>
                      <select
                        value={customerInfo.provincia}
                        onChange={e => handleProvinciaChange(e.target.value)}
                        className={`input w-full ${fieldErrors.provincia ? 'border-red-400' : ''}`}
                      >
                        <option value="">Seleccion獺 provincia...</option>
                        {provincias.map(p => <option key={p} value={p}>{p === 'Ciudad Aut籀noma de Buenos Aires' ? 'CABA' : p}</option>)}
                      </select>
                    </Field>

                    <Field label="Zona" required>
                      <select
                        value={selectedZoneId}
                        onChange={e => handleZoneChange(e.target.value)}
                        disabled={!customerInfo.provincia}
                        className="input w-full disabled:opacity-50"
                      >
                        <option value="">Seleccion獺 zona...</option>
                        {zonasByProvincia.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                      </select>
                    </Field>
                  </div>

                  <Field label="Ciudad / Localidad" required error={fieldErrors.ciudad}>
                    {citiesByZone.length > 0 ? (
                      <select
                        value={customerInfo.ciudad}
                        onChange={e => handleCityChange(e.target.value)}
                        disabled={!selectedZoneId}
                        className={`input w-full disabled:opacity-50 ${fieldErrors.ciudad ? 'border-red-400' : ''}`}
                      >
                        <option value="">Seleccion獺 ciudad...</option>
                        {citiesByZone.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={customerInfo.ciudad}
                        onChange={e => handleCityChange(e.target.value)}
                        className={`input w-full ${fieldErrors.ciudad ? 'border-red-400' : ''}`}
                        placeholder="Ingres獺 tu ciudad"
                      />
                    )}
                    {selectedZone && customerInfo.ciudad && (
                      <p className="text-xs text-primary-600 mt-1">
                        {platinumEnvioGratis
                          ? 'Envio gratis por tu nivel Platinum'
                          : shippingCost === 0
                            ? 'Envio gratis'
                            : `Costo de env穩o: ${fmt(selectedZone.precio)}${
                                selectedZone.monto_envio_gratis ? ` (gratis desde ${fmt(selectedZone.monto_envio_gratis)})` : ''
                              }`
                        }
                      </p>
                    )}
                    {loyaltyNivel === 'platinum' && selectedZone && selectedZone.id !== ZONA_NORTE_ID && (
                      <p className="text-xs text-amber-600 mt-1">El envio gratis Platinum aplica solo en Zona Norte (Pilar, Escobar, San Miguel y alrededores).</p>
                    )}
                    {!selectedZone && customerInfo.ciudad && (
                      <p className="text-xs text-amber-600 mt-1">Ciudad fuera de nuestras zonas. Te contactaremos para coordinar el env穩o.</p>
                    )}
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Calle" required error={fieldErrors.calle}>
                      <input type="text" value={customerInfo.calle} onChange={e => setCustomerInfo({ ...customerInfo, calle: e.target.value })} className={`input w-full ${fieldErrors.calle ? 'border-red-400' : ''}`} />
                    </Field>
                    <Field label="N繳mero" required error={fieldErrors.numero}>
                      <input type="text" value={customerInfo.numero} onChange={e => setCustomerInfo({ ...customerInfo, numero: e.target.value })} className={`input w-full ${fieldErrors.numero ? 'border-red-400' : ''}`} />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Field label="Piso">
                      <input type="text" value={customerInfo.piso} onChange={e => setCustomerInfo({ ...customerInfo, piso: e.target.value })} className="input w-full" placeholder="Opcional" />
                    </Field>
                    <Field label="Depto">
                      <input type="text" value={customerInfo.depto} onChange={e => setCustomerInfo({ ...customerInfo, depto: e.target.value })} className="input w-full" placeholder="Opcional" />
                    </Field>
                    <Field label="C籀digo Postal">
                      <input
                        type="text"
                        value={customerInfo.cp}
                        onChange={e => { setCustomerInfo({ ...customerInfo, cp: e.target.value }); setCpStatus(null) }}
                        onBlur={handleCpBlur}
                        className={`input w-full ${
                          cpStatus === 'ok' ? 'border-green-400 focus:ring-green-400' :
                          cpStatus === 'mismatch' ? 'border-amber-400 focus:ring-amber-400' : ''
                        }`}
                        placeholder="Opcional"
                      />
                      {cpStatus === 'checking' && <p className="mt-1 text-xs text-secondary-400">Verificando...</p>}
                      {cpStatus === 'ok' && <p className="mt-1 text-xs text-green-600">CP coincide con la ciudad</p>}
                      {cpStatus === 'mismatch' && <p className="mt-1 text-xs text-amber-600">?? El CP no coincide con la ciudad seleccionada. Verific獺 que sea correcto, de lo contrario el pedido no podr獺 realizarse con 矇xito.</p>}
                      {cpStatus === 'unknown' && <p className="mt-1 text-xs text-amber-600">?? No pudimos verificar este CP. Verific獺 que sea correcto, de lo contrario el pedido no podr獺 realizarse con 矇xito.</p>}
                    </Field>
                  </div>

                  <Field label="Referencias">
                    <input type="text" value={customerInfo.referencias} onChange={e => setCustomerInfo({ ...customerInfo, referencias: e.target.value })} className="input w-full" placeholder="Ej: Port籀n azul, timbre 2 (opcional)" />
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


