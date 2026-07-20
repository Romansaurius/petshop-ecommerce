import { useState, useEffect } from 'react'
import { Gift, Star, Lock, X } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

const categoriaConfig = {
  normal:   { label: 'Normal',   color: 'bg-gray-100 text-gray-600',     border: 'border-gray-200' },
  gold:     { label: 'Gold',     color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
  platinum: { label: 'Platinum', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
}

const LoyaltyCard = ({ onClose }) => {
  const [loyalty, setLoyalty] = useState({ puntos: 0, puntos_historicos: 0, nivel: 'normal', nivel_expira: null })
  const [canjes, setCanjes] = useState([])
  const [historial, setHistorial] = useState([])
  const [canjeando, setCanjeando] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [tab, setTab] = useState('canjes')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/loyalty/perfil', { headers }).then(r => r.json()),
      fetch('/api/loyalty/canjes').then(r => r.json()),
      fetch('/api/loyalty/historial', { headers }).then(r => r.json()),
    ]).then(([perfil, canjesData, historialData]) => {
      if (perfil.puntos !== undefined) setLoyalty(perfil)
      setCanjes(Array.isArray(canjesData) ? canjesData : [])
      setHistorial(Array.isArray(historialData) ? historialData : [])
    }).catch(() => {})
  }, [])

  const handleCanjear = async (canje) => {
    if (loyalty.puntos < canje.puntos_requeridos) return
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
        setLoyalty(prev => ({ ...prev, puntos: prev.puntos - canje.puntos_requeridos }))
        // Refrescar historial
        fetch('/api/loyalty/historial', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
          .then(r => r.json()).then(d => { if (Array.isArray(d)) setHistorial(d) })
      } else {
        setMensaje({ tipo: 'error', texto: data.error })
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' })
    }
    setCanjeando(null)
    setTimeout(() => setMensaje(null), 5000)
  }

  const puedeVerGold = loyalty.puntos_historicos >= 1000
  const puedeVerPlatinum = loyalty.puntos_historicos >= 1750

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 text-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-7 h-7" />
            <div>
              <h2 className="text-lg font-bold">Mis Puntos</h2>
              <p className="text-sm opacity-90">{loyalty.puntos} pts disponibles</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {mensaje && (
            <div className={`p-3 rounded-xl text-sm font-medium ${mensaje.tipo === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {mensaje.texto}
            </div>
          )}

          {/* Puntos y nivel */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Puntos históricos</p>
              <p className="text-xs text-gray-400">{loyalty.puntos_historicos} pts acumulados</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">{loyalty.puntos}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoriaConfig[loyalty.nivel]?.color || categoriaConfig.normal.color}`}>
                {loyalty.nivel.charAt(0).toUpperCase() + loyalty.nivel.slice(1)}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['canjes', 'historial'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {t === 'canjes' ? 'Canjes disponibles' : 'Historial'}
              </button>
            ))}
          </div>

          {/* Canjes */}
          {tab === 'canjes' && (
            <div className="space-y-4">
              {['normal', 'gold', 'platinum'].map(cat => {
                const cfg = categoriaConfig[cat]
                const bloqueado = (cat === 'gold' && !puedeVerGold) || (cat === 'platinum' && !puedeVerPlatinum)
                const canjesCat = canjes.filter(c => c.categoria === cat)
                if (canjesCat.length === 0) return null
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      {bloqueado && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {cat === 'gold' ? '1000 pts históricos' : '1750 pts históricos'}
                        </span>
                      )}
                    </div>
                    <div className={`space-y-2 ${bloqueado ? 'opacity-50 pointer-events-none' : ''}`}>
                      {canjesCat.map(canje => {
                        const sinPuntos = loyalty.puntos < canje.puntos_requeridos
                        const locked = bloqueado || sinPuntos
                        return (
                          <div key={canje.id} className={`bg-white rounded-xl border p-3 flex items-center justify-between ${locked ? 'border-gray-100' : cfg.border}`}>
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-sm font-semibold text-gray-900 truncate">{canje.nombre}</p>
                              <p className="text-xs text-gray-500 truncate">{canje.descripcion}</p>
                              <p className={`text-xs font-bold mt-0.5 ${sinPuntos ? 'text-gray-400' : 'text-primary-600'}`}>
                                {canje.puntos_requeridos} pts
                                {canje.tipo === 'porcentaje' && ` → ${canje.valor_descuento}% OFF`}
                                {canje.tipo === 'monto_fijo' && ` → ${fmt(canje.valor_descuento)} OFF`}
                                {canje.tipo === 'envio_gratis' && ` → Envío gratis`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCanjear(canje)}
                              disabled={locked || canjeando === canje.id}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                                locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                              }`}
                            >
                              {canjeando === canje.id ? '...' : locked ? <Lock className="w-3 h-3" /> : 'Canjear'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {canjes.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6">No hay canjes disponibles</p>
              )}
            </div>
          )}

          {/* Historial */}
          {tab === 'historial' && (
            <div className="space-y-2">
              {historial.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6">No realizaste canjes aún</p>
              )}
              {historial.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
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
          )}

          <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-xl text-xs text-primary-700">
            <Star className="w-4 h-4 shrink-0" />
            <span>Ganás <strong>1 punto</strong> por cada $100 en compras</span>
          </div>

          <button onClick={onClose} className="btn btn-primary w-full">Continuar comprando</button>
        </div>
      </div>
    </div>
  )
}

export default LoyaltyCard
