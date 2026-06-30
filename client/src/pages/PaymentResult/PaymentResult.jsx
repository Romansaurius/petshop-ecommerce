import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { Check, X, Clock } from 'lucide-react'

const PaymentResult = ({ status }) => {
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (status === 'success') {
      clearCart()
      const timer = setTimeout(() => navigate('/'), 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const configs = {
    success: {
      icon: <Check className="w-10 h-10 text-green-600" />,
      bg: 'bg-green-100',
      title: 'Pago aprobado!',
      message: 'Tu pedido fue confirmado. Te contactaremos pronto para coordinar la entrega.',
      sub: 'Redirigiendo al inicio en 5 segundos...',
      btnLabel: 'Volver al inicio',
      btnAction: () => navigate('/')
    },
    failure: {
      icon: <X className="w-10 h-10 text-red-600" />,
      bg: 'bg-red-100',
      title: 'Pago rechazado',
      message: 'No se pudo procesar tu pago. Podes intentarlo de nuevo.',
      sub: '',
      btnLabel: 'Intentar de nuevo',
      btnAction: () => navigate('/checkout')
    },
    pending: {
      icon: <Clock className="w-10 h-10 text-yellow-600" />,
      bg: 'bg-yellow-100',
      title: 'Pago pendiente',
      message: 'Tu pago esta siendo procesado. Te avisaremos cuando se confirme.',
      sub: '',
      btnLabel: 'Volver al inicio',
      btnAction: () => navigate('/')
    }
  }

  const config = configs[status] || configs.pending

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className={`w-20 h-20 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {config.icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{config.title}</h2>
        <p className="text-gray-500 mb-2">{config.message}</p>
        {config.sub && <p className="text-sm text-gray-400 mb-6">{config.sub}</p>}
        <button
          onClick={config.btnAction}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-colors mt-4"
        >
          {config.btnLabel}
        </button>
      </div>
    </div>
  )
}

export default PaymentResult
