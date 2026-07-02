import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ShoppingCart, CheckCircle } from 'lucide-react'

const CartToast = ({ product, onClose }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!product) return null

  const imagen = product.imagen || product.image ||
    (Array.isArray(product.imagenes) && product.imagenes.length > 0 ? product.imagenes[0] : null)
  const nombre = product.nombre || product.name || 'Producto'
  const precio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(product.precio || product.price || 0)

  return (
    <div className="fixed top-4 right-4 z-[100] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-in">
      {/* Barra de progreso */}
      <div className="h-1 bg-primary-500 animate-shrink" />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Producto agregado</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          {imagen ? (
            <img src={imagen} alt={nombre} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-secondary-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{nombre} {product.talla && <span className="text-primary-500">({product.talla})</span>}</p>
            <p className="text-sm text-primary-600 font-bold mt-0.5">{precio}</p>
            {product.is2x1 && (
              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">2x1</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { navigate('/checkout'); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Ir al carrito
          </button>
          <button
            onClick={onClose}
            className="flex-1 text-sm font-semibold py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartToast