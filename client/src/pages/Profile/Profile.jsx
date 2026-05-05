import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, Package, Star, Gift, ChevronRight, LogOut, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react'

const POINTS_PER_PESO = 1 / 100 // 1 punto cada $100

const statusConfig = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  procesando:  { label: 'Procesando',  color: 'bg-blue-100 text-blue-700',     icon: Package },
  enviado:     { label: 'Enviado',     color: 'bg-purple-100 text-purple-700', icon: ShoppingBag },
  entregado:   { label: 'Entregado',   color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  cancelado:   { label: 'Cancelado',   color: 'bg-red-100 text-red-700',       icon: XCircle },
}

const formatPrice = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumen')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (user?.id) {
      fetch(`/api/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(r => r.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user, isAuthenticated, navigate])

  const totalGastado = orders.reduce((s, o) => s + Number(o.total || 0), 0)
  const puntos = Math.floor(totalGastado * POINTS_PER_PESO)
  const nivel = puntos < 500 ? { name: 'Bronce', next: 500, color: 'text-amber-600' }
              : puntos < 1500 ? { name: 'Plata',  next: 1500, color: 'text-gray-500' }
              : { name: 'Oro', next: null, color: 'text-yellow-500' }

  const handleLogout = () => { logout(); navigate('/') }

  const tabs = [
    { id: 'resumen',  label: 'Resumen' },
    { id: 'pedidos',  label: 'Mis pedidos' },
    { id: 'puntos',   label: 'Puntos y beneficios' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header perfil */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.name || user?.nombre}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`text-xs font-semibold ${nivel.color}`}>Nivel {nivel.name}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Pedidos realizados', value: orders.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
                { label: 'Total gastado',       value: formatPrice(totalGastado), icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
                { label: 'Puntos acumulados',   value: `${puntos} pts`, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Último pedido */}
            {orders.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900">Último pedido</h2>
                  <button onClick={() => setActiveTab('pedidos')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                    Ver todos <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <OrderRow order={orders[0]} />
              </div>
            )}

            {orders.length === 0 && !loading && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Todavía no hiciste ningún pedido</p>
                <Link to="/menu" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                  Ver productos
                </Link>
              </div>
            )}
          </div>
        )}

        {/* PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {loading && (
              <div className="p-10 text-center text-gray-400 text-sm">Cargando pedidos...</div>
            )}
            {!loading && orders.length === 0 && (
              <div className="p-10 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tenés pedidos aún</p>
              </div>
            )}
            {orders.map(order => (
              <div key={order.id} className="p-5">
                <OrderRow order={order} showDetail />
              </div>
            ))}
          </div>
        )}

        {/* PUNTOS */}
        {activeTab === 'puntos' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-gray-900">{puntos} puntos</p>
                  <p className={`text-sm font-medium ${nivel.color}`}>Nivel {nivel.name}</p>
                </div>
              </div>

              {nivel.next && (
                <>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{puntos} pts</span>
                    <span>{nivel.next} pts para {nivel.name === 'Bronce' ? 'Plata' : 'Oro'}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((puntos / nivel.next) * 100, 100)}%` }}
                    />
                  </div>
                </>
              )}
              {!nivel.next && (
                <p className="text-sm text-yellow-600 font-medium">🏆 Nivel máximo alcanzado</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary-500" /> Beneficios por nivel
              </h2>
              <div className="space-y-3">
                {[
                  { nivel: 'Bronce', pts: '0–499 pts',   beneficios: 'Acceso a ofertas exclusivas para miembros' },
                  { nivel: 'Plata',  pts: '500–1499 pts', beneficios: '5% de descuento en peluquería + acceso anticipado a promos' },
                  { nivel: 'Oro',    pts: '1500+ pts',    beneficios: '10% de descuento en toda la tienda + envío gratis siempre' },
                ].map(({ nivel: n, pts, beneficios }) => (
                  <div key={n} className={`p-4 rounded-xl border ${nivel.name === n ? 'border-primary-200 bg-primary-50' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">{n}</span>
                      <span className="text-xs text-gray-400">{pts}</span>
                    </div>
                    <p className="text-xs text-gray-600">{beneficios}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-500">
              <p className="font-medium text-gray-700 mb-1">¿Cómo acumulo puntos?</p>
              <p>Ganás <strong>1 punto por cada $100</strong> que gastás en la tienda. Los puntos se acreditan automáticamente al completar un pedido.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function OrderRow({ order, showDetail }) {
  const cfg = statusConfig[order.estado] || statusConfig.pendiente
  const Icon = cfg.icon
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Pedido #{order.id}</p>
          {showDetail && order.productos && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.productos}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {order.created_at ? new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(order.total || 0)}
        </p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
      </div>
    </div>
  )
}
