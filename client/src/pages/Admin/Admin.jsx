import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, Users, ShoppingBag, TrendingUp, Gift, Eye } from 'lucide-react'

const Admin = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loyaltyPrograms, setLoyaltyPrograms] = useState([])
  const [loyaltyStats, setLoyaltyStats] = useState({})
  const [coupons, setCoupons] = useState([])
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [couponForm, setCouponForm] = useState({
    codigo: '',
    nombre: '',
    tipo: 'monto_fijo',
    valor: '',
    fecha_expiracion: '',
    usos_maximos: ''
  })
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'comederos',
    description: '',
    image: null,
    featured: false,
    discount: 0
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login')
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    loadProducts()
    loadOrders()
    loadLoyaltyPrograms()
    loadLoyaltyStats()
    loadCoupons()
  }, [])

  const loadLoyaltyStats = async () => {
    try {
      const response = await fetch('/api/loyalty/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setLoyaltyStats(data)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error cargando pedidos:', error)
      // Fallback a datos mock
      const mockOrders = [
        { id: 1, customer: 'Juan Pérez', items: 3, total: 150000, status: 'pendiente', date: '2024-01-15' },
        { id: 2, customer: 'María García', items: 2, total: 105000, status: 'completado', date: '2024-01-15' }
      ]
      setOrders(mockOrders)
    }
  }

  const loadLoyaltyPrograms = async () => {
    try {
      const response = await fetch('/api/loyalty/programs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setLoyaltyPrograms(data)
    } catch (error) {
      console.error('Error cargando programas:', error)
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    
    const formData = new FormData()
    formData.append('nombre', productForm.name)
    formData.append('descripcion', productForm.description)
    formData.append('precio', productForm.price)
    formData.append('categoria', productForm.category)
    formData.append('destacado', productForm.featured || false)
    formData.append('descuento_porcentaje', productForm.discount || 0)
    
    if (productForm.image) {
      formData.append('imagen', productForm.image)
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

      if (response.ok) {
        loadProducts()
        setProductForm({ name: '', price: '', category: 'comederos', description: '', image: null, featured: false, discount: 0 })
        setEditingProduct(null)
        setShowProductForm(false)
      } else {
        alert('Error al guardar producto')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar producto')
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description
    })
    setShowProductForm(true)
  }

  const handleDeleteProduct = (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
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
            <h1 className="text-2xl font-bold text-primary-500">🛠️ Panel de Administración</h1>
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
                        <p className="text-sm text-secondary-600">15 vendidos</p>
                      </div>
                    </div>
                  ))}
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
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
                  </h3>
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
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Precio
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        className="input w-full"
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
                        <option value="comederos">Comederos</option>
                        <option value="juguetes">Juguetes</option>
                        <option value="camas">Camas</option>
                        <option value="collares">Collares</option>
                        <option value="rascadores">Rascadores</option>
                        <option value="accesorios">Accesorios</option>
                      </select>
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
                        Imagen
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
                        className="input w-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    
                    <div className="flex space-x-3">
                      <button type="submit" className="btn btn-primary flex-1">
                        {editingProduct ? 'Actualizar' : 'Agregar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false)
                          setEditingProduct(null)
                          setProductForm({ name: '', price: '', category: 'comederos', description: '' })
                        }}
                        className="btn btn-secondary flex-1"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
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
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">{product.nombre || product.name}</div>
                          <div className="text-sm text-secondary-500">{product.descripcion || product.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {product.categoria || product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {formatPrice(product.precio || product.price || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {order.items} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completado' ? 'bg-green-100 text-green-800' :
                          order.status === 'en-preparacion' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border border-secondary-200 rounded px-2 py-1"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en-preparacion">En Preparación</option>
                          <option value="completado">Completado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-secondary-800">Sistema de Fidelización</h2>
              <button className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Programa
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loyaltyPrograms.map(program => (
                <div key={program.id} className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{program.nombre}</h3>
                    <Gift className="w-6 h-6 text-primary-500" />
                  </div>
                  <p className="text-secondary-600 mb-2">
                    <strong>Requisito:</strong> {program.compras_requeridas} compras
                  </p>
                  <p className="text-secondary-600 mb-4">
                    <strong>Recompensa:</strong> {program.recompensa}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      program.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {program.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Estadísticas de Fidelización</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{loyaltyStats.usuariosActivos || 0}</div>
                  <div className="text-sm text-secondary-600">Usuarios Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{loyaltyStats.recompensasCanjeadas || 0}</div>
                  <div className="text-sm text-secondary-600">Recompensas Canjeadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{loyaltyStats.tasaRetencion || 0}%</div>
                  <div className="text-sm text-secondary-600">Tasa de Retención</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Cupones de Descuento</h3>
                <button 
                  onClick={() => setShowCouponForm(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Cupón
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Código</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Nombre</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Valor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {coupons.map(coupon => (
                      <tr key={coupon.id}>
                        <td className="px-4 py-2 font-mono text-sm">{coupon.codigo}</td>
                        <td className="px-4 py-2">{coupon.nombre}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {coupon.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : formatPrice(coupon.valor)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            coupon.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {coupon.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin