import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const states = {
  exitoso: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50',
    title: '¡Pago aprobado!',
    msg: 'Tu pedido fue confirmado. Te contactaremos pronto para coordinar la entrega.',
    clear: true
  },
  fallido: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    title: 'El pago no se completó',
    msg: 'Hubo un problema con tu pago. Podés intentarlo de nuevo.',
    clear: false
  },
  pendiente: {
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    title: 'Pago pendiente',
    msg: 'Tu pago está siendo procesado. Te avisaremos cuando se confirme.',
    clear: false
  }
}

export default function PaymentResult({ status }) {
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [params] = useSearchParams()
  const cfg = states[status] || states.fallido
  const Icon = cfg.icon

  useEffect(() => {
    if (cfg.clear) {
      clearCart()
      const t = setTimeout(() => navigate('/'), 5000)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className={`bg-white rounded-2xl border border-gray-100 p-10 max-w-md w-full text-center shadow-sm`}>
        <div className={`w-16 h-16 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-5`}>
          <Icon className={`w-8 h-8 ${cfg.color}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{cfg.title}</h2>
        <p className="text-gray-500 mb-6">{cfg.msg}</p>
        {params.get('payment_id') && (
          <p className="text-xs text-gray-400 mb-6">ID de pago: {params.get('payment_id')}</p>
        )}
        <div className="flex flex-col gap-3">
          {status === 'fallido' && (
            <button onClick={() => navigate('/checkout')} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Intentar de nuevo
            </button>
          )}
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
            Volver al inicio
          </button>
        </div>
        {cfg.clear && <p className="text-xs text-gray-400 mt-4">Redirigiendo en 5 segundos...</p>}
      </div>
    </div>
  )
}
