import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, Users, ShoppingBag, TrendingUp, Gift, LayoutGrid, X, Check, Truck } from 'lucide-react'

const Admin = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [canjes, setCanjes] = useState([])
  const [coupons, setCoupons] = useState([])
  const [loyaltyTab, setLoyaltyTab] = useState('canjes')
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [couponForm, setCouponForm] = useState({
    codigo: '',
    nombre: '',
    tipo: 'monto_fijo',
    valor: '',
    fecha_expiracion: '',
    usos_maximos: ''
  })
  const [showCanjeForm, setShowCanjeForm] = useState(false)
  const [editingCanje, setEditingCanje] = useState(null)
  const [canjeForm, setCanjeForm] = useState({
    nombre: '', descripcion: '', puntos_requeridos: '', categoria: 'normal', tipo: 'porcentaje', valor_descuento: '', tope_descuento: ''
  })
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [sections, setSections] = useState([])
  const [sectionProducts, setSectionProducts] = useState({}) // { seccion_id: [prod_id, ...] }
  const [sectionSearch, setSectionSearch] = useState('')
  const [activeSectionId, setActiveSectionId] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    description: '',
    image: null,
    featured: false,
    discount: 0,
    stock: 100,
    tipo: 'normal',
    esProductoPorTalles: false,
    tallesSeleccionados: { S: false, M: false, L: false, XL: false, XXL: false },
    preciosTalles: { S: '', M: '', L: '', XL: '', XXL: '' }
  })
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [shippingZones, setShippingZones] = useState([])
  const [shippingCities, setShippingCities] = useState([])
  const [shippingConfig, setShippingConfig] = useState({ envio_gratis_activo: false, monto_envio_gratis: 50000, retiro_local_activo: true })
  const [shippingTab, setShippingTab] = useState('zones')
  const [zoneForm, setZoneForm] = useState({ nombre: '', precio: '', monto_envio_gratis: '' })
  const [editingZone, setEditingZone] = useState(null)
  const [showZoneForm, setShowZoneForm] = useState(false)
  const [cityForm, setCityForm] = useState({ nombre: '', provincia: '', shipping_zone_id: '' })
  const [editingCity, setEditingCity] = useState(null)
  const [showCityForm, setShowCityForm] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login')
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    loadProducts()
    loadOrders()
    loadCanjes()
    loadCoupons()
    loadBrands()
    loadCategories()
    loadSections()
    loadShipping()
  }, [])

  const loadShipping = async () => {
    try {
      const token = localStorage.getItem('token')
      const [zonesRes, citiesRes, configRes] = await Promise.all([
        fetch('/api/shipping/zones'),
        fetch('/api/shipping/cities', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/shipping/config')
      ])
      const zones = zonesRes.ok ? await zonesRes.json().catch(() => []) : []
      const cities = citiesRes.ok ? await citiesRes.json().catch(() => []) : []
      const cfg = configRes.ok ? await configRes.json().catch(() => null) : null
      setShippingZones(Array.isArray(zones) ? zones : [])
      setShippingCities(Array.isArray(cities) ? cities : [])
      if (cfg && cfg.id) setShippingConfig(cfg)
    } catch (e) { console.error('loadShipping error:', e) }
  }

  const handleZoneSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingZone ? `/api/shipping/zones/${editingZone.id}` : '/api/shipping/zones'
    const method = editingZone ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ nombre: zoneForm.nombre, precio: parseFloat(zoneForm.precio), monto_envio_gratis: zoneForm.monto_envio_gratis ? parseFloat(zoneForm.monto_envio_gratis) : null, activo: true }) })
    if (res.ok) { loadShipping(); setZoneForm({ nombre: '', precio: '', monto_envio_gratis: '' }); setEditingZone(null); setShowZoneForm(false) }
    else { const d = await res.json(); alert(d.error || 'Error') }
  }

  const handleDeleteZone = async (id) => {
    if (!confirm('¿Eliminar zona?')) return
    const res = await fetch(`/api/shipping/zones/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    if (res.ok) loadShipping()
    else { const d = await res.json(); alert(d.error || 'Error') }
  }

  const handleCitySubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingCity ? `/api/shipping/cities/${editingCity.id}` : '/api/shipping/cities'
    const method = editingCity ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(cityForm) })
    if (res.ok) { loadShipping(); setCityForm({ nombre: '', provincia: '', shipping_zone_id: '' }); setEditingCity(null); setShowCityForm(false) }
    else { const d = await res.json(); alert(d.error || 'Error') }
  }

  const handleDeleteCity = async (id) => {
    if (!confirm('¿Eliminar ciudad?')) return
    await fetch(`/api/shipping/cities/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    loadShipping()
  }

  const handleSaveConfig = async () => {
    const res = await fetch('/api/shipping/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(shippingConfig)
    })
    if (res.ok) alert('Configuración guardada')
    else alert('Error al guardar')
  }

  const loadSections = async () => {
    try {
      const res = await fetch('/api/sections')
      const data = await res.json()
      if (Array.isArray(data)) {
        setSections(data)
        const map = {}
        data.forEach(s => { map[s.id] = (s.productos || []).map(p => p.id) })
        setSectionProducts(map)
      }
    } catch (e) { console.error('Error cargando secciones:', e) }
  }

  const saveSectionProducts = async (sectionId) => {
    try {
      const res = await fetch(`/api/sections/${sectionId}/productos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ producto_ids: sectionProducts[sectionId] || [] })
      })
      if (res.ok) {
        alert('Sección guardada correctamente')
        loadSections()
      } else alert('Error al guardar')
    } catch { alert('Error de conexión') }
  }

  const toggleProductInSection = (sectionId, productId) => {
    setSectionProducts(prev => {
      const current = prev[sectionId] || []
      if (current.includes(productId)) {
        return { ...prev, [sectionId]: current.filter(id => id !== productId) }
      }
      if (current.length >= 5) { alert('Máximo 5 productos por sección'); return prev }
      return { ...prev, [sectionId]: [...current, productId] }
    })
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/products/categories')
      const data = await response.json()
      setCategories(data)
      if (data.length > 0 && !productForm.category) {
        setProductForm(prev => ({ ...prev, category: data[0].nombre }))
      }
    } catch (error) {
      console.error('Error cargando categorías:', error)
    }
  }

  const loadBrands = async () => {
    try {
      const response = await fetch('/api/products/brands')
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error('Error cargando marcas:', error)
    }
  }

  const loadCanjes = async () => {
    try {
      const res = await fetch('/api/loyalty/admin/canjes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      const data = await res.json()
      setCanjes(Array.isArray(data) ? data : [])
    } catch (e) { console.error('Error cargando canjes:', e) }
  }

  const loadCoupons = async () => {
    try {
      const response = await fetch('/api/loyalty/coupons', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      console.error('Error cargando cupones:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error cargando productos:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error cargando pedidos:', error)
      setOrders([])
    }
  }

  const handleCanjeSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const url = editingCanje ? `/api/loyalty/admin/canjes/${editingCanje.id}` : '/api/loyalty/admin/canjes'
    const method = editingCanje ? 'PUT' : 'POST'
    const body = { ...canjeForm, puntos_requeridos: parseInt(canjeForm.puntos_requeridos), valor_descuento: parseFloat(canjeForm.valor_descuento) || 0, tope_descuento: parseFloat(canjeForm.tope_descuento) || 0, activo: editingCanje ? editingCanje.activo : true }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
    if (res.ok) { loadCanjes(); setCanjeForm({ nombre: '', descripcion: '', puntos_requeridos: '', categoria: 'normal', tipo: 'porcentaje', valor_descuento: '', tope_descuento: '' }); setEditingCanje(null); setShowCanjeForm(false) }
    else { const d = await res.json(); alert(d.error || 'Error') }
  }

  const handleEditCanje = (c) => {
    setEditingCanje(c)
    setCanjeForm({ nombre: c.nombre, descripcion: c.descripcion || '', puntos_requeridos: c.puntos_requeridos.toString(), categoria: c.categoria, tipo: c.tipo, valor_descuento: c.valor_descuento?.toString() || '', tope_descuento: c.tope_descuento?.toString() || '' })
    setShowCanjeForm(true)
  }

  const handleDeleteCanje = async (id) => {
    if (!confirm('¿Desactivar este canje?')) return
    await fetch(`/api/loyalty/admin/canjes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    loadCanjes()
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('nombre', productForm.name)
    formData.append('descripcion', productForm.description)
    formData.append('precio', productForm.price)
    formData.append('categoria', productForm.category)
    formData.append('marca', productForm.brand)
    formData.append('destacado', productForm.featured)
    formData.append('descuento_porcentaje', productForm.discount || 0)
    formData.append('stock', productForm.stock || 100)
    formData.append('tipo', productForm.tipo || 'normal')
    
    // Procesar variantes de talles
    if (productForm.esProductoPorTalles) {
      const variantes = []
      Object.entries(productForm.tallesSeleccionados).forEach(([talla, seleccionado]) => {
        if (seleccionado && productForm.preciosTalles[talla]) {
          variantes.push({
            talla,
            precio: productForm.preciosTalles[talla],
            stock: productForm.stock || 100
          })
        }
      })
      formData.append('variantes', JSON.stringify(variantes))
    } else {
      formData.append('variantes', JSON.stringify([]))
    }
    
    if (productForm.image && productForm.image.length > 0) {
      for (let i = 0; i < productForm.image.length; i++) {
        formData.append('imagenes', productForm.image[i])
      }
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const result = await response.json()
      
      if (response.ok) {
        loadProducts()
        setProductForm({ name: '', price: '', category: categories[0]?.nombre || '', brand: '', description: '', image: null, featured: false, discount: 0, stock: 100, tipo: 'normal', esProductoPorTalles: false, tallesSeleccionados: { S: false, M: false, L: false, XL: false, XXL: false }, preciosTalles: { S: '', M: '', L: '', XL: '', XXL: '' } })
        setEditingProduct(null)
        setShowProductForm(false)
      } else {
        console.error('Error del servidor:', result)
        alert(`Error: ${result.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error de red:', error)
      alert('Error de conexión')
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    
    // Procesar variantes existentes
    const tallesSeleccionados = { S: false, M: false, L: false, XL: false, XXL: false }
    const preciosTalles = { S: '', M: '', L: '', XL: '', XXL: '' }
    
    if (product.variantes && product.variantes.length > 0) {
      product.variantes.forEach(v => {
        tallesSeleccionados[v.talla] = true
        preciosTalles[v.talla] = v.precio.toString()
      })
    }
    
    setProductForm({
      name: product.nombre || product.name,
      price: (product.precio || product.price || 0).toString(),
      category: product.categoria || product.category,
      brand: product.marca || '',
      description: product.descripcion || product.description || '',
      image: null,
      featured: product.destacado || product.featured || false,
      discount: product.descuento_porcentaje || product.discount || 0,
      stock: product.stock || 0,
      tipo: product.tipo || 'normal',
      esProductoPorTalles: product.tiene_talles || false,
      tallesSeleccionados,
      preciosTalles
    })
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          loadProducts()
        } else {
          alert('Error al eliminar el producto')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error de conexión')
      }
    }
  }

  const handleCouponSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingCoupon ? `/api/loyalty/coupons/${editingCoupon.id}` : '/api/loyalty/coupons'
      const method = editingCoupon ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...couponForm,
          activo: editingCoupon ? editingCoupon.activo : true
        })
      })
      
      if (response.ok) {
        loadCoupons()
        setCouponForm({ codigo: '', nombre: '', tipo: 'monto_fijo', valor: '', fecha_expiracion: '', usos_maximos: '' })
        setEditingCoupon(null)
        setShowCouponForm(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Error al guardar cupón')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    }
  }

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      codigo: coupon.codigo,
      nombre: coupon.nombre,
      tipo: coupon.tipo,
      valor: coupon.valor.toString(),
      fecha_expiracion: coupon.fecha_expiracion ? coupon.fecha_expiracion.split('T')[0] : '',
      usos_maximos: coupon.usos_maximos ? coupon.usos_maximos.toString() : ''
    })
    setShowCouponForm(true)
  }

  const handleDeleteCoupon = async (id) => {
    if (confirm('¿Estás seguro de eliminar este cupón?')) {
      try {
        const response = await fetch(`/api/loyalty/coupons/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          loadCoupons()
        } else {
          const error = await response.json()
          alert(error.error || 'Error al eliminar cupón')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error de conexión')
      }
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ estado: newStatus })
      })
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, estado: newStatus } : o))
      } else {
        alert('Error al actualizar el estado')
      }
    } catch {
      alert('Error de conexión')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white shadow-sm border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-primary-500">??�?Panel de Administración</h1>
            <div className="text-sm text-secondary-600">
              Bienvenido, {user?.name}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-primary-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Productos</p>
                <p className="text-2xl font-bold text-secondary-900">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pedidos Hoy</p>
                <p className="text-2xl font-bold text-secondary-900">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Ventas Hoy</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {formatPrice(orders.reduce((sum, order) => sum + order.total, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-secondary-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
                { id: 'products', name: 'Productos', icon: Package },
                { id: 'orders', name: 'Pedidos', icon: ShoppingBag },
                { id: 'sections', name: 'Secciones', icon: LayoutGrid },
                { id: 'shipping', name: 'Envíos', icon: Truck },
                { id: 'loyalty', name: 'Fidelización', icon: Gift }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-secondary-800">Dashboard General</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Pedidos Recientes</h3>
                <div className="space-y-3">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-secondary-600">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(order.total)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
                <div className="space-y-3">
                  {products.slice(0, 3).map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.nombre || product.name}</p>
                        <p className="text-sm text-secondary-600">{product.categoria || product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(product.precio || product.price || 0)}</p>
                        <p className="text-sm text-secondary-400">Sin ventas aún</p>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-sm text-secondary-400 text-center py-4">No hay productos cargados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-secondary-800">Productos para Mascotas</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </button>
            </div>

            {showProductForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto my-8">
                  <div className="sticky top-0 bg-white p-6 border-b border-secondary-200 rounded-t-xl">
                    <h3 className="text-lg font-semibold">
                      {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
                    </h3>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        className="input w-full"
                      />
                    </div>
                    
                    {/* Talles/variantes - va ANTES del precio */}
                    <div>
                      <label className="flex items-center space-x-2 mb-3">
                        <input
                          type="checkbox"
                          checked={productForm.esProductoPorTalles}
                          onChange={(e) => setProductForm({...productForm, esProductoPorTalles: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-secondary-700">Producto por talles/variantes</span>
                      </label>

                      {productForm.esProductoPorTalles && (
                        <div className="ml-2 p-4 bg-secondary-50 rounded-lg space-y-3 mb-3">
                          <p className="text-xs text-secondary-600">Seleccioná los talles disponibles y sus precios. El precio base se tomará del talle más barato.</p>
                          {['S', 'M', 'L', 'XL', 'XXL'].map(talla => (
                            <div key={talla} className="flex items-center space-x-3">
                              <label className="flex items-center space-x-2 min-w-[60px]">
                                <input
                                  type="checkbox"
                                  checked={productForm.tallesSeleccionados[talla]}
                                  onChange={(e) => {
                                    const newTalles = { ...productForm.tallesSeleccionados, [talla]: e.target.checked }
                                    const newPrecios = { ...productForm.preciosTalles }
                                    // Calcular precio mínimo de talles activos
                                    const preciosActivos = Object.entries(newTalles)
                                      .filter(([t, sel]) => sel && newPrecios[t])
                                      .map(([t]) => parseFloat(newPrecios[t]))
                                      .filter(p => !isNaN(p))
                                    const minPrecio = preciosActivos.length > 0 ? Math.min(...preciosActivos) : ''
                                    setProductForm({
                                      ...productForm,
                                      tallesSeleccionados: newTalles,
                                      price: minPrecio.toString()
                                    })
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm font-medium">{talla}</span>
                              </label>
                              {productForm.tallesSeleccionados[talla] && (
                                <input
                                  type="number"
                                  placeholder={`Precio ${talla}`}
                                  value={productForm.preciosTalles[talla]}
                                  onChange={(e) => {
                                    const newPrecios = { ...productForm.preciosTalles, [talla]: e.target.value }
                                    const preciosActivos = Object.entries(productForm.tallesSeleccionados)
                                      .filter(([t, sel]) => sel && newPrecios[t])
                                      .map(([t]) => parseFloat(newPrecios[t]))
                                      .filter(p => !isNaN(p))
                                    const minPrecio = preciosActivos.length > 0 ? Math.min(...preciosActivos) : productForm.price
                                    setProductForm({
                                      ...productForm,
                                      preciosTalles: newPrecios,
                                      price: minPrecio.toString()
                                    })
                                  }}
                                  className="input w-full text-sm"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Precio {productForm.esProductoPorTalles ? <span className="text-xs text-secondary-400 font-normal">(se calcula automáticamente del talle más barato)</span> : ''}
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className={`input w-full ${productForm.esProductoPorTalles ? 'bg-secondary-50 text-secondary-500' : ''}`}
                        readOnly={productForm.esProductoPorTalles}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="input w-full"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.nombre}>
                            {category.nombre.charAt(0).toUpperCase() + category.nombre.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Marca (opcional)
                      </label>
                      <input
                        type="text"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                        placeholder="Ej: Royal Canin, Pedigree, etc."
                        className="input w-full"
                      />
                      {brands.length > 0 && (
                        <div className="mt-1 text-xs text-secondary-500">
                          Marcas existentes: {brands.map(b => b.nombre).join(', ')}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        className="input w-full h-20 resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Imágenes (máximo 5)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setProductForm({...productForm, image: e.target.files})}
                        className="input w-full"
                      />
                      <p className="text-xs text-secondary-500 mt-1">
                        Puedes seleccionar hasta 5 imágenes
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Stock
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                          className="input w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Descuento (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={productForm.discount}
                          onChange={(e) => setProductForm({...productForm, discount: e.target.value})}
                          className="input w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-secondary-700">Producto destacado</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Tipo de producto</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'normal', label: 'Normal', emoji: '?��' },
                          { value: '2x1', label: '2x1', emoji: '??' },
                          { value: 'importado', label: 'Importado', emoji: '?��?' }
                        ].map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setProductForm({...productForm, tipo: opt.value})}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                              productForm.tipo === opt.value
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                            }`}
                          >
                            <span className="text-xl mb-1">{opt.emoji}</span>
                            <span className="text-xs font-medium">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                      {productForm.discount > 0 && productForm.tipo !== 'normal' && (
                        <p className="text-xs text-green-600 mt-1">??Con descuento, aparecerá también en Ofertas</p>
                      )}
                      {productForm.discount > 0 && productForm.tipo === 'normal' && (
                        <p className="text-xs text-green-600 mt-1">??Con descuento, aparecerá en la sección Ofertas</p>
                      )}
                    </div>
                    
                    <div className="sticky bottom-0 bg-white pt-4 border-t border-secondary-200 flex space-x-3">
                      <button type="submit" className="btn btn-primary flex-1">
                        {editingProduct ? 'Actualizar' : 'Agregar'}
                      </button>
<button
                         type="button"
                         onClick={() => {
                           setShowProductForm(false)
                           setEditingProduct(null)
                           setProductForm({ name: '', price: '', category: 'comederos', description: '', image: null, featured: false, discount: 0, stock: 100, tipo: 'normal', esProductoPorTalles: false, tallesSeleccionados: { S: false, M: false, L: false, XL: false, XXL: false }, preciosTalles: { S: '', M: '', L: '', XL: '', XXL: '' } })
                         }}
                         className="btn btn-secondary flex-1"
                       >
                        Cancelar
                      </button>
                    </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {product.imagen && (
                            <img 
                              src={product.imagen} 
                              alt={product.nombre || product.name}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-secondary-900">
                              {product.nombre || product.name}
                              {(product.destacado || product.featured) && (
                                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                  �?Destacado
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-secondary-500">
                              {product.marca || 'Sin marca'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {product.categoria || product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          (product.stock || 0) > 10 
                            ? 'bg-green-100 text-green-800' 
                            : (product.stock || 0) > 0 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock || 0} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-secondary-900">
                          {formatPrice(product.precio || product.price || 0)}
                        </div>
                        {(product.descuento_porcentaje || product.discount) > 0 && (
                          <div className="text-xs text-green-600">
                            {product.descuento_porcentaje || product.discount}% OFF
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-secondary-800">Gestión de Pedidos</h2>
            
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {orders.length === 0 && (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-secondary-400">No hay pedidos todavía</td></tr>
                  )}
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-secondary-900">{order.cliente_nombre || 'Invitado'}</p>
                        <p className="text-xs text-secondary-500">{order.cliente_email || order.email_contacto || ''}</p>
                        <p className="text-xs text-secondary-500">{order.cliente_telefono || order.telefono_contacto || ''}</p>
                        {!order.usuario_id && (
                          <span className="text-[10px] bg-secondary-100 text-secondary-500 px-1.5 py-0.5 rounded-full">Sin cuenta</span>
                        )}
                        {order.cp_alerta && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                            ?��? CP {order.cp_alerta === 'mismatch' ? 'no coincide' : 'no verificado'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-secondary-900">{order.cantidad_items || 0} items</p>
                        <p className="text-xs text-secondary-500 max-w-xs truncate">{order.productos || '-'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-secondary-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                          order.estado === 'enviado' ? 'bg-blue-100 text-blue-800' :
                          order.estado === 'procesando' ? 'bg-yellow-100 text-yellow-800' :
                          order.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.estado || 'pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-secondary-400 mb-1">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('es-AR') : ''}
                        </div>
                        <select
                          value={order.estado || 'pendiente'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-secondary-200 rounded px-2 py-1"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="procesando">Procesando</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            {!activeSectionId ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-800 mb-1">Secciones de la Home</h2>
                  <p className="text-sm text-secondary-400">Seleccioná una sección para editar sus productos destacados.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sections.map(section => {
                    const count = (sectionProducts[section.id] || []).length
                    return (
                      <button
                        key={section.id}
                        onClick={() => { setActiveSectionId(section.id); setSectionSearch('') }}
                        className="card p-6 text-left hover:border-primary-300 hover:shadow-md transition-all border-2 border-transparent"
                      >
                        <h3 className="font-semibold text-secondary-800 mb-1">{section.nombre}</h3>
                        <p className="text-xs text-secondary-400">{count}/5 productos seleccionados</p>
                        <div className="mt-3 text-xs text-primary-500 font-medium">Editar &rarr;</div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (() => {
              const section = sections.find(s => s.id === activeSectionId)
              const selected = sectionProducts[activeSectionId] || []
              const filtered = products.filter(p =>
                !sectionSearch || (p.nombre || '').toLowerCase().includes(sectionSearch.toLowerCase())
              )
              return (
                <>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveSectionId(null)}
                      className="text-sm text-secondary-500 hover:text-secondary-800 flex items-center gap-1"
                    >
                      &larr; Volver
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-secondary-800">{section?.nombre}</h2>
                      <p className="text-xs text-secondary-400">{selected.length}/5 productos seleccionados</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Buscar producto por nombre..."
                      value={sectionSearch}
                      onChange={e => setSectionSearch(e.target.value)}
                      className="input max-w-sm text-sm"
                    />
                    <button
                      onClick={() => saveSectionProducts(activeSectionId)}
                      className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Guardar
                    </button>
                  </div>

                  {selected.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-primary-50 rounded-xl border border-primary-100">
                      {selected.map(id => {
                        const p = products.find(x => x.id === id)
                        if (!p) return null
                        return (
                          <div key={id} className="flex items-center gap-1.5 bg-white border border-primary-200 rounded-lg px-2.5 py-1.5 text-xs">
                            {p.imagen && <img src={p.imagen} alt="" className="w-5 h-5 rounded object-cover" />}
                            <span className="font-medium text-secondary-700 max-w-[120px] truncate">{p.nombre}</span>
                            <button onClick={() => toggleProductInSection(activeSectionId, id)} className="text-secondary-400 hover:text-red-500 ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filtered.map(p => {
                      const isSelected = selected.includes(p.id)
                      return (
                        <button
                          key={p.id}
                          onClick={() => toggleProductInSection(activeSectionId, p.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary-400 bg-primary-50'
                              : 'border-secondary-100 hover:border-secondary-300 bg-white'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 shrink-0">
                            {p.imagen
                              ? <img src={p.imagen} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-secondary-300 text-lg">?��</div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-secondary-800 truncate">{p.nombre}</p>
                            <p className="text-[11px] text-secondary-400">{formatPrice(p.precio || 0)}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-primary-500 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-800">Zonas de Envío</h2>
              <div className="flex gap-2">
                {['zones', 'cities', 'config'].map(t => (
                  <button key={t} onClick={() => setShippingTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      shippingTab === t ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                    }`}>
                    {t === 'zones' ? 'Zonas' : t === 'cities' ? 'Ciudades' : 'Configuración'}
                  </button>
                ))}
              </div>
            </div>

            {shippingTab === 'zones' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => { setShowZoneForm(true); setEditingZone(null); setZoneForm({ nombre: '', precio: '', monto_envio_gratis: '' }) }} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nueva Zona
                  </button>
                </div>
                {showZoneForm && (
                  <form onSubmit={handleZoneSubmit} className="card p-4 flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">Nombre</label>
                      <input required value={zoneForm.nombre} onChange={e => setZoneForm({ ...zoneForm, nombre: e.target.value })} className="input w-full" placeholder="Ej: CABA" />
                    </div>
                    <div className="w-36">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">Precio ($)</label>
                      <input required type="number" min="0" value={zoneForm.precio} onChange={e => setZoneForm({ ...zoneForm, precio: e.target.value })} className="input w-full" placeholder="6000" />
                    </div>
                    <div className="w-44">
                      <label className="block text-xs font-medium text-secondary-600 mb-1">Envío gratis desde ($)</label>
                      <input type="number" min="0" value={zoneForm.monto_envio_gratis} onChange={e => setZoneForm({ ...zoneForm, monto_envio_gratis: e.target.value })} className="input w-full" placeholder="Sin mínimo" />
                    </div>
                    <button type="submit" className="btn btn-primary px-4">{editingZone ? 'Guardar' : 'Agregar'}</button>
                    <button type="button" onClick={() => { setShowZoneForm(false); setEditingZone(null) }} className="btn btn-secondary px-4">Cancelar</button>
                  </form>
                )}
                <div className="card overflow-hidden">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Zona</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Precio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Envío gratis desde</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Ciudades</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {shippingZones.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-secondary-400">No hay zonas configuradas</td></tr>}
                      {shippingZones.map(z => (
                        <tr key={z.id} className="hover:bg-secondary-50">
                          <td className="px-6 py-4 font-medium text-secondary-800">{z.nombre}</td>
                          <td className="px-6 py-4 text-secondary-700">{formatPrice(z.precio)}</td>
                          <td className="px-6 py-4 text-sm">
                            {z.monto_envio_gratis ? <span className="text-green-600 font-medium">{formatPrice(z.monto_envio_gratis)}</span> : <span className="text-secondary-400">-</span>}
                          </td>
                          <td className="px-6 py-4 text-secondary-500 text-sm">{shippingCities.filter(c => c.shipping_zone_id === z.id).length} ciudades</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingZone(z); setZoneForm({ nombre: z.nombre, precio: z.precio, monto_envio_gratis: z.monto_envio_gratis || '' }); setShowZoneForm(true) }} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteZone(z.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {shippingTab === 'cities' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => { setShowCityForm(true); setEditingCity(null); setCityForm({ nombre: '', provincia: '', shipping_zone_id: shippingZones[0]?.id || '' }) }} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nueva Ciudad
                  </button>
                </div>
                {showCityForm && (
                  <form onSubmit={handleCitySubmit} className="card p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-secondary-600 mb-1">Ciudad</label>
                      <input required value={cityForm.nombre} onChange={e => setCityForm({ ...cityForm, nombre: e.target.value })} className="input w-full" placeholder="Ej: Pilar" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-secondary-600 mb-1">Provincia</label>
                      <input value={cityForm.provincia} onChange={e => setCityForm({ ...cityForm, provincia: e.target.value })} className="input w-full" placeholder="Ej: Buenos Aires" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-secondary-600 mb-1">Zona</label>
                      <select required value={cityForm.shipping_zone_id} onChange={e => setCityForm({ ...cityForm, shipping_zone_id: e.target.value })} className="input w-full">
                        <option value="">Seleccionar...</option>
                        {shippingZones.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary px-4">{editingCity ? 'Guardar' : 'Agregar'}</button>
                      <button type="button" onClick={() => { setShowCityForm(false); setEditingCity(null) }} className="btn btn-secondary px-4">Cancelar</button>
                    </div>
                  </form>
                )}
                <div className="card overflow-hidden">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Ciudad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Provincia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Zona</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {shippingCities.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-secondary-400">No hay ciudades configuradas</td></tr>}
                      {shippingCities.map(c => (
                        <tr key={c.id} className="hover:bg-secondary-50">
                          <td className="px-6 py-4 font-medium text-secondary-800">{c.nombre}</td>
                          <td className="px-6 py-4 text-secondary-600 text-sm">{c.provincia || '-'}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{c.zona_nombre}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingCity(c); setCityForm({ nombre: c.nombre, provincia: c.provincia || '', shipping_zone_id: c.shipping_zone_id }); setShowCityForm(true) }} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteCity(c.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {shippingTab === 'config' && (
              <div className="card p-6 max-w-md space-y-5">
                <h3 className="font-semibold text-secondary-800">Configuración general de envíos</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-secondary-700">Retiro en local (gratis)</span>
                  <input type="checkbox" checked={!!shippingConfig.retiro_local_activo} onChange={e => setShippingConfig({ ...shippingConfig, retiro_local_activo: e.target.checked })} className="w-4 h-4" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-secondary-700">Activar envío gratis por monto mínimo</span>
                  <input type="checkbox" checked={!!shippingConfig.envio_gratis_activo} onChange={e => setShippingConfig({ ...shippingConfig, envio_gratis_activo: e.target.checked })} className="w-4 h-4" />
                </label>
                {shippingConfig.envio_gratis_activo && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">Monto mínimo para envío gratis ($)</label>
                    <input type="number" min="0" value={shippingConfig.monto_envio_gratis} onChange={e => setShippingConfig({ ...shippingConfig, monto_envio_gratis: e.target.value })} className="input w-full" />
                  </div>
                )}
                <button onClick={handleSaveConfig} className="btn btn-primary w-full">Guardar configuración</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-800">Sistema de Fidelización</h2>
              <div className="flex gap-2">
                {['canjes', 'cupones'].map(t => (
                  <button key={t} onClick={() => setLoyaltyTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      loyaltyTab === t ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                    }`}>
                    {t === 'canjes' ? 'Canjes' : 'Cupones'}
                  </button>
                ))}
              </div>
            </div>

            {loyaltyTab === 'canjes' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => { setShowCanjeForm(true); setEditingCanje(null); setCanjeForm({ nombre: '', descripcion: '', puntos_requeridos: '', categoria: 'normal', tipo: 'porcentaje', valor_descuento: '', tope_descuento: '' }) }} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Canje
                  </button>
                </div>

                {showCanjeForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                      <div className="p-6 border-b border-secondary-200">
                        <h3 className="text-lg font-semibold">{editingCanje ? 'Editar Canje' : 'Nuevo Canje'}</h3>
                      </div>
                      <form onSubmit={handleCanjeSubmit} className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre</label>
                          <input required value={canjeForm.nombre} onChange={e => setCanjeForm({ ...canjeForm, nombre: e.target.value })} className="input w-full" placeholder="Ej: Descuento 10%" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Descripción</label>
                          <textarea value={canjeForm.descripcion} onChange={e => setCanjeForm({ ...canjeForm, descripcion: e.target.value })} className="input w-full h-16 resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Puntos requeridos</label>
                            <input required type="number" min="1" value={canjeForm.puntos_requeridos} onChange={e => setCanjeForm({ ...canjeForm, puntos_requeridos: e.target.value })} className="input w-full" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Categoría</label>
                            <select value={canjeForm.categoria} onChange={e => setCanjeForm({ ...canjeForm, categoria: e.target.value })} className="input w-full">
                              <option value="normal">Normal</option>
                              <option value="gold">Gold</option>
                              <option value="platinum">Platinum</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Tipo</label>
                            <select value={canjeForm.tipo} onChange={e => setCanjeForm({ ...canjeForm, tipo: e.target.value })} className="input w-full">
                              <option value="porcentaje">Porcentaje</option>
                              <option value="monto_fijo">Monto fijo</option>
                              <option value="envio_gratis">Envío gratis</option>
                              <option value="nivel">Nivel</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Valor descuento</label>
                            <input type="number" min="0" value={canjeForm.valor_descuento} onChange={e => setCanjeForm({ ...canjeForm, valor_descuento: e.target.value })} className="input w-full" placeholder="0" />
                          </div>
                        </div>
                        {canjeForm.tipo === 'porcentaje' && (
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Tope descuento ($)</label>
                            <input type="number" min="0" value={canjeForm.tope_descuento} onChange={e => setCanjeForm({ ...canjeForm, tope_descuento: e.target.value })} className="input w-full" placeholder="Sin tope" />
                          </div>
                        )}
                        <div className="flex gap-3 pt-2">
                          <button type="submit" className="btn btn-primary flex-1">{editingCanje ? 'Guardar' : 'Crear'}</button>
                          <button type="button" onClick={() => { setShowCanjeForm(false); setEditingCanje(null) }} className="btn btn-secondary flex-1">Cancelar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="card overflow-hidden">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Puntos</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Categoría</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {canjes.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-secondary-400">No hay canjes configurados</td></tr>}
                      {canjes.map(c => (
                        <tr key={c.id} className="hover:bg-secondary-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-secondary-800">{c.nombre}</p>
                            {c.descripcion && <p className="text-xs text-secondary-400 truncate max-w-[180px]">{c.descripcion}</p>}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-primary-600">{c.puntos_requeridos} pts</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              c.categoria === 'platinum' ? 'bg-purple-100 text-purple-700' :
                              c.categoria === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-secondary-100 text-secondary-600'
                            }`}>{c.categoria}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-secondary-600">{c.tipo}</td>
                          <td className="px-4 py-3 text-sm">
                            {c.tipo === 'porcentaje' ? `${c.valor_descuento}%` :
                             c.tipo === 'monto_fijo' ? formatPrice(c.valor_descuento) :
                             c.tipo === 'envio_gratis' ? 'Envío gratis' : c.tipo}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              c.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>{c.activo ? 'Activo' : 'Inactivo'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleEditCanje(c)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteCanje(c.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {loyaltyTab === 'cupones' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowCouponForm(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Cupón
                  </button>
                </div>

                <div className="card overflow-hidden">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Código</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Nombre</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Usos</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {coupons.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-secondary-400">No hay cupones</td></tr>}
                      {coupons.map(coupon => (
                        <tr key={coupon.id} className="hover:bg-secondary-50">
                          <td className="px-4 py-3 font-mono text-sm font-semibold">{coupon.codigo}</td>
                          <td className="px-4 py-3 text-sm">{coupon.nombre}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {coupon.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : formatPrice(coupon.valor)}
                          </td>
                          <td className="px-4 py-3 text-xs text-secondary-500">
                            {coupon.usos_actuales || 0}{coupon.usos_maximos ? `/${coupon.usos_maximos}` : ''}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded ${
                              coupon.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>{coupon.activo ? 'Activo' : 'Inactivo'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => handleEditCoupon(coupon)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Cupón */}
            {showCouponForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-md w-full">
                  <div className="p-6 border-b border-secondary-200">
                    <h3 className="text-lg font-semibold">
                      {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón de Descuento'}
                    </h3>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleCouponSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Código del Cupón
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.codigo}
                          onChange={(e) => setCouponForm({...couponForm, codigo: e.target.value.toUpperCase()})}
                          className="input w-full font-mono"
                          placeholder="Ej: DESCUENTO20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Nombre del Cupón
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.nombre}
                          onChange={(e) => setCouponForm({...couponForm, nombre: e.target.value})}
                          className="input w-full"
                          placeholder="Ej: Descuento de Bienvenida"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Tipo de Descuento
                          </label>
                          <select
                            value={couponForm.tipo}
                            onChange={(e) => setCouponForm({...couponForm, tipo: e.target.value})}
                            className="input w-full"
                          >
                            <option value="monto_fijo">Monto Fijo</option>
                            <option value="porcentaje">Porcentaje</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Valor
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={couponForm.valor}
                            onChange={(e) => setCouponForm({...couponForm, valor: e.target.value})}
                            className="input w-full"
                            placeholder={couponForm.tipo === 'porcentaje' ? '20' : '5000'}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Fecha de Expiración (opcional)
                          </label>
                          <input
                            type="date"
                            value={couponForm.fecha_expiracion}
                            onChange={(e) => setCouponForm({...couponForm, fecha_expiracion: e.target.value})}
                            className="input w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            Usos Máximos (opcional)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={couponForm.usos_maximos}
                            onChange={(e) => setCouponForm({...couponForm, usos_maximos: e.target.value})}
                            className="input w-full"
                            placeholder="Ilimitado"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <button type="submit" className="btn btn-primary flex-1">
                          {editingCoupon ? 'Actualizar' : 'Crear'} Cupón
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCouponForm(false)
                            setEditingCoupon(null)
                            setCouponForm({ codigo: '', nombre: '', tipo: 'monto_fijo', valor: '', fecha_expiracion: '', usos_maximos: '' })
                          }}
                          className="btn btn-secondary flex-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin