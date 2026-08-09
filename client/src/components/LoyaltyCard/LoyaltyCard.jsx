import { useState, useEffect, useRef } from 'react'
import { Gift, Star, Lock, X, Copy, Check } from 'lucide-react'

const WHATSAPP_NUM = '5491173943004' // ← cambiá por el número real del negocio

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)

const categoriaConfig = {
  normal:   { label: 'Normal',   color: 'bg-gray-100 text-gray-600',     border: 'border-gray-200' },
  gold:     { label: 'Gold',     color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
  platinum: { label: 'Platinum', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
}

function instruccionPorTipo(tipo, nombre, codigo) {
  if (tipo === 'porcentaje' || tipo === 'monto_fijo' || tipo === 'descuento')
    return { texto: 'Poné este código en el carrito para aplicar el descuento.', whatsapp: null }
  if (tipo === 'producto')
    return { texto: 'Poné este código en el carrito para canjear tu producto gratis.', whatsapp: null }
  if (tipo === 'servicio') {
    const msg = encodeURIComponent(`Hola! Quiero canjear mi premio: *${nombre}*. Mi código es: *${codigo}*`)
    return { texto: 'Contactanos por WhatsApp para coordinar tu servicio.', whatsapp: `https://wa.me/${WHATSAPP_NUM}?text=${msg}` }
  }
  return { texto: 'Guardá este código para usar tu beneficio.', whatsapp: null }
}

const LoyaltyCard = ({ onClose }) => {
  const [loyalty, setLoyalty] = useState({ puntos: 0, puntos_historicos: 0, nivel: 'normal', nivel_expira: null })
  const [canjes, setCanjes] = useState([])
  const [historial, setHistorial] = useState([])
  const [canjeando, setCanjeando] = useState(null)
  const [resultado, setResultado] = useState(null) // { codigo, nombre, tipo, instruccion, whatsappUrl }
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('canjes')
  const [copied, setCopied] = useState(null)
  const resultadoRef = useRef(null)

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
    setError(null)
    setResultado(null)
    try {
      const res = await fetch('/api/loyalty/canjear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ canje_id: canje.id })
      })
      const data = await res.json()
      if (res.ok) {
        const tipo = data.tipo || canje.tipo
        const { texto, whatsapp } = instruccionPorTipo(tipo, canje.nombre, data.codigo)
        setResultado({ codigo: data.codigo, nombre: canje.nombre, tipo, instruccion: texto, whatsappUrl: whatsapp })
        setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }
        Promise.all([
          fetch('/api/loyalty/perfil', { headers }).then(r => r.json()),
          fetch('/api/loyalty/historial', { headers }).then(r => r.json()),
        ]).then(([perfil, hist]) => {
          if (perfil.puntos !== undefined) setLoyalty(perfil)
          if (Array.isArray(hist)) setHistorial(hist)
        })
      } else {
        setError(data.error || 'Error al canjear')
      }
    } catch {
      setError('Error de conexión')
    }
    setCanjeando(null)
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const puedeVerGold = loyalty.puntos_historicos >= 1000
  const puedeVerPlatinum = loyalty.puntos_historicos >= 2000

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
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">

          {/* Resultado de canje */}
          {resultado && (
            <div ref={resultadoRef} className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">🎉 ¡Canje exitoso! — {resultado.nombre}</p>
              {resultado.tipo !== 'servicio' && (
                <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2 mb-2">
                  <span className="font-mono text-sm font-bold text-gray-900 tracking-wider flex-1">{resultado.codigo}</span>
                  <button onClick={() => copyCode(resultado.codigo)} className="text-green-700 hover:text-green-900">
                    {copied === resultado.codigo ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
              <p className="text-xs text-green-700 mb-2">{resultado.instruccion}</p>
              {resultado.whatsappUrl && (
                <a href={resultado.whatsappUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Coordinar por WhatsApp
                </a>
              )}
              <button onClick={() => setResultado(null)} className="block mt-2 text-xs text-green-600 hover:underline">Cerrar</button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
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

          {/* CANJES */}
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
                          {cat === 'gold' ? '1.000 pts históricos' : '2.000 pts históricos'}
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
                                {canje.tipo === 'descuento' && canje.valor_descuento > 0 && ` → ${canje.valor_descuento}% OFF`}
                                {canje.tipo === 'envio_gratis' && ` → Envío gratis`}
                                {canje.tipo === 'servicio' && ` → Servicio`}
                                {canje.tipo === 'producto' && ` → Producto gratis`}
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

          {/* HISTORIAL */}
          {tab === 'historial' && (
            <div className="space-y-2">
              {historial.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6">No realizaste canjes aún</p>
              )}
              {historial.map(h => {
                const { texto, whatsapp } = instruccionPorTipo(h.tipo, h.nombre, h.codigo)
                return (
                  <div key={h.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm text-gray-900">{h.nombre}</p>
                      <p className="text-xs font-bold text-red-500 shrink-0">-{h.puntos_gastados} pts</p>
                    </div>
                    {h.tipo !== 'servicio' && (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 mb-1">
                        <span className="font-mono text-sm font-bold text-gray-800 tracking-wider flex-1">{h.codigo}</span>
                        <button onClick={() => copyCode(h.codigo)} className="text-primary-600 hover:text-primary-800">
                          {copied === h.codigo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">{texto} · {new Date(h.created_at).toLocaleDateString('es-AR')}</p>
                    {whatsapp && (
                      <a href={whatsapp} target="_blank" rel="noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Coordinar por WhatsApp
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Info beneficios */}
          <div className="bg-primary-50 rounded-xl border border-primary-100 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-primary-700 font-medium">
              <Star className="w-3.5 h-3.5 shrink-0" />
              <span>Ganás 1 punto por cada $100 en compras</span>
            </div>
            <div className="text-xs text-primary-600 space-y-1 pt-1 border-t border-primary-100">
              <p><span className="font-semibold text-yellow-600">Gold</span> (1.000 pts históricos) — 5% OFF en cada compra, tope $7.500 · Canjes exclusivos Gold</p>
              <p><span className="font-semibold text-purple-600">Platinum</span> (2.000 pts históricos) — 5% OFF en cada compra, tope $10.000 · Envío gratis Zona Norte · Canjes exclusivos Platinum</p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-primary w-full">Continuar comprando</button>
        </div>
      </div>
    </div>
  )
}

export default LoyaltyCard
