import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, Package, Star, Gift, ChevronRight, LogOut, ShoppingBag, Clock, CheckCircle, XCircle, Lock } from 'lucide-react'

const statusConfig = {
  pendiente:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  procesando: { label: 'Procesando', color: 'bg-blue-100 text-blue-700',     icon: Package },
  enviado:    { label: 'Enviado',    color: 'bg-purple-100 text-purple-700', icon: ShoppingBag },
  entregado:  { label: 'Entregado',  color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  cancelado:  { label: 'Cancelado',  color: 'bg-red-100 text-red-700',       icon: XCircle },
}

const nivelConfig = {
  normal:   { label: 'Normal',   color: 'text-gray-500',    bg: 'bg-gray-100',    next: 1000, nextLabel: 'Gold' },
  gold:     { label: 'Gold',     color: 'text-yellow-600',  bg: 'bg-yellow-50',   next: 1750, nextLabel: 'Platinum' },
  platinum: { label: 'Platinum', color: 'text-purple-600',  bg: 'bg-purple-50',   next: null, nextLabel: null },
}

const categoriaConfig = {
  normal:   { label: 'Normal',   color: 'bg-gray-100 text-gray-600',       border: 'border-gray-200' },
  gold:     { label: 'Gold',     color: 'bg-yellow-100 text-yellow-700',   border: 'border-yellow-200' },
  platinum: { label: 'Platinum', color: 'bg-purple-100 text-purple-700',   border: 'border-purple-200' },
}

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loyaltyData, setLoyaltyData] = useState({ puntos: 0, puntos_historicos: 0, nivel: 'normal', nivel_expira: null })
  const [canjes, setCanjes] = useState([])
  const [historialCanjes, setHistorialCanjes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumen')
  const [canjeando, setCanjeando] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`/api/orders/user/${user.id}`, { headers }).then(r => r.json()),
      fetch('/api/loyalty/perfil', { headers }).then(r => r.json()),
      fetch('/api/loyalty/canjes').then(r => r.json()),
      fetch('/api/loyalty/historial', { headers }).then(r => r.json()),
    ]).then(([ordersData, loyalty, canjesData, historial]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      if (loyalty.puntos !== undefined) setLoyaltyData(loyalty)
      setCanjes(Array.isArray(canjesData) ? canjesData : [])
      setHistorialCanjes(Array.isArray(historial) ? historial : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [user, isAuthenticated, navigate])

  const handleCanjear = async (canje) => {
    if (loyaltyData.puntos < canje.puntos_requeridos) return
    setCanjeando(canje.id)
    try {
      const res = await fetch('/api/loyalty/canjear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ canje_id: canje.id })
      })
      const data = await res.json()
      if (res.ok) {
        setMensaje({ tipo: 'ok', texto: data.mensaje })
        setLoyaltyData(prev => ({ ...prev, puntos: prev.puntos - canje.puntos_requeridos }))
        // Refrescar nivel
        fetch('/api/loyalty/perfil', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then(r => r.json()).then(d => { if (d.puntos !== undefined) setLoyaltyData(d) })
      } else {
        setMensaje({ tipo: 'error', texto: data.error })
      }
    } catch { setMensaje({ tipo: 'error', texto: 'Error de conexión' }) }
    setCanjeando(null)
    setTimeout(() => setMensaje(null), 5000)
  }

  const handleLogout = () => { logout(); navigate('/') }

  const { puntos, puntos_historicos, nivel, nivel_expira } = loyaltyData
  const nivelCfg = nivelConfig[nivel] || nivelConfig.normal
  const totalGastado = orders.reduce((s, o) => s + Number(o.total || 0), 0)

  const puedeVerGold = puntos_historicos >= 1000
  const puedeVerPlatinum = puntos_historicos >= 1750

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'pedidos', label: 'Mis pedidos' },
    { id: 'canjes',  label: 'Canjes' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {mensaje && (
          <div className={`mb-4 p-4 rounded-xl text-sm font-medium ${mensaje.tipo === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.name || user?.nombre}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${nivelCfg.bg} ${nivelCfg.color}`}>
                  {nivelCfg.label}
                </span>
                {nivel_expira && (
                  <span className="text-xs text-gray-400">
                    hasta {new Date(nivel_expira).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>
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
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
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
                { label: 'Total gastado', value: fmt(totalGastado), icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
                { label: 'Puntos disponibles', value: `${puntos} pts`, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
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

            {/* Barra de nivel */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">Progreso de nivel</p>
                  <p className="text-xs text-gray-500">{puntos_historicos} puntos históricos</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${nivelCfg.bg} ${nivelCfg.color}`}>{nivelCfg.label}</span>
              </div>
              {nivelCfg.next && (
                <>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{puntos_historicos} pts</span>
                    <span>{nivelCfg.next} pts → {nivelCfg.nextLabel}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((puntos_historicos / nivelCfg.next) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Te faltan <strong>{Math.max(nivelCfg.next - puntos_historicos, 0)} pts</strong> para desbloquear {nivelCfg.nextLabel}
                  </p>
                </>
              )}
              {!nivelCfg.next && <p className="text-sm text-purple-600 font-medium">🏆 Nivel máximo alcanzado</p>}
            </div>

            {/* Beneficios activos */}
            {nivel !== 'normal' && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Tus beneficios activos</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  {nivel === 'gold' && <>
                    <p>✅ 5% OFF pasivo en todas tus compras (tope $7.500)</p>
                    <p>✅ Acceso a productos con precio especial Gold</p>
                    <p>✅ Acceso a canjes exclusivos Gold</p>
                  </>}
                  {nivel === 'platinum' && <>
                    <p>✅ 7% OFF pasivo en todas tus compras (tope $10.000)</p>
                    <p>✅ Envío gratis a todo Buenos Aires</p>
                    <p>✅ Acceso a productos con precio especial Platinum</p>
                    <p>✅ Acceso a canjes exclusivos Platinum</p>
                  </>}
                </div>
              </div>
            )}

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
            {loading && <div className="p-10 text-center text-gray-400 text-sm">Cargando pedidos...</div>}
            {!loading && orders.length === 0 && (
              <div className="p-10 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tenés pedidos aún</p>
              </div>
            )}
            {orders.map(order => (
              <div key={order.id} className="p-5"><OrderRow order={order} showDetail /></div>
            ))}
          </div>
        )}

        {/* CANJES */}
        {activeTab === 'canjes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Tus puntos disponibles</p>
                <p className="text-xs text-gray-500">{puntos_historicos} pts históricos</p>
              </div>
              <p className="text-2xl font-bold text-primary-600">{puntos} pts</p>
            </div>

            {['normal', 'gold', 'platinum'].map(cat => {
              const cfg = categoriaConfig[cat]
              const bloqueado = (cat === 'gold' && !puedeVerGold) || (cat === 'platinum' && !puedeVerPlatinum)
              const canjesCat = canjes.filter(c => c.categoria === cat)

              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    {bloqueado && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {cat === 'gold' ? 'Necesitás 1000 pts históricos' : 'Necesitás 1750 pts históricos'}
                      </span>
                    )}
                    {!bloqueado && cat !== 'normal' && nivel !== cat && nivel !== 'platinum' && (
                      <span className="text-xs text-gray-400">Canjeá algo de esta categoría para activar el nivel</span>
                    )}
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${bloqueado ? 'opacity-50 pointer-events-none' : ''}`}>
                    {canjesCat.map(canje => {
                      const sinPuntos = puntos < canje.puntos_requeridos
                      const locked = bloqueado || sinPuntos
                      return (
                        <div key={canje.id} className={`bg-white rounded-2xl border p-4 relative ${locked ? 'border-gray-100' : cfg.border}`}>
                          {locked && (
                            <div className="absolute top-3 right-3">
                              <Lock className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2 pr-6">
                            <h3 className="font-semibold text-sm text-gray-900">{canje.nombre}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{canje.descripcion}</p>
                          {canje.tipo === 'descuento' && canje.tope_descuento > 0 && (
                            <p className="text-xs text-gray-400 mb-2">Tope: {fmt(canje.tope_descuento)}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${sinPuntos ? 'text-gray-400' : 'text-primary-600'}`}>
                              {canje.puntos_requeridos} pts
                            </span>
                            <button
                              onClick={() => handleCanjear(canje)}
                              disabled={locked || canjeando === canje.id}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                                locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                              }`}
                            >
                              {canjeando === canje.id ? '...' : locked ? 'Bloqueado' : 'Canjear'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Historial de canjes */}
            {historialCanjes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Historial de canjes</h2>
                <div className="space-y-3">
                  {historialCanjes.map(h => (
                    <div key={h.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{h.nombre}</p>
                        <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleDateString('es-AR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-red-500">-{h.puntos_gastados} pts</p>
                        <p className="text-xs text-gray-400 font-mono">{h.codigo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
