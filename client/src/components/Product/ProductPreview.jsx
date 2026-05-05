import { useState, useEffect } from 'react'
import { X, Star, Heart, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, Truck } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const FREE_SHIPPING_THRESHOLD = 35000

const ProductPreview = ({ product, isOpen, onClose, allProducts = [] }) => {
  const { addToCart, cart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])

  const getProductName = () => product?.nombre || product?.name || 'Producto'
  const getProductPrice = () => product?.precio || product?.price || 0
  const getProductDescription = () => product?.descripcion || product?.description || ''
  const getProductCategory = () => product?.categoria || product?.category || ''
  const getProductDiscount = () => product?.descuento_porcentaje || product?.discount || 0
  const getProductStock = () => product?.stock || 100

  const getProductImages = () => {
    if (product?.imagenes) {
      try {
        const imgs = typeof product.imagenes === 'string' ? JSON.parse(product.imagenes) : product.imagenes
        if (Array.isArray(imgs) && imgs.length > 0) return imgs
      } catch (e) {}
    }
    if (product?.imagen || product?.image) return [product.imagen || product.image]
    return []
  }

  const images = getProductImages()

  const cartTotal = (cart || []).reduce((sum, item) => {
    const price = item.precio || item.price || 0
    return sum + price * (item.quantity || 1)
  }, 0)

  const totalWithProduct = cartTotal + getProductPrice() * quantity
  const shippingProgress = Math.min((totalWithProduct / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - totalWithProduct, 0)

  useEffect(() => {
    if (product && allProducts.length > 0) {
      const related = allProducts
        .filter(p => p.id !== product.id && (p.categoria || p.category) === getProductCategory())
        .slice(0, 4)
      setRelatedProducts(related)
    }
    setSelectedImage(0)
  }, [product, allProducts])

  const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0
  }).format(price)

  const originalPrice = getProductDiscount() > 0
    ? Math.round(getProductPrice() / (1 - getProductDiscount() / 100))
    : null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product)
    setQuantity(1)
  }

  const getCategoryIcon = (category) => {
    const icons = { comederos: '🍽️', juguetes: '🎾', camas: '🛏️', collares: '🦴', rascadores: '🪜', accesorios: '🎒' }
    return icons[category] || '📦'
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-secondary-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <span className="text-sm text-secondary-500 capitalize">{getCategoryIcon(getProductCategory())} {getProductCategory()}</span>
          <button onClick={onClose} className="p-2 text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Galería de imágenes */}
            <div className="space-y-3">
              {/* Imagen principal */}
              <div className="relative w-full h-80 md:h-96 bg-secondary-50 rounded-2xl overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={`${getProductName()} ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    {getCategoryIcon(getProductCategory())}
                  </div>
                )}

                {getProductDiscount() > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{getProductDiscount()}%
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-secondary-700" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all"
                    >
                      <ChevronRight className="w-4 h-4 text-secondary-700" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {selectedImage + 1}/{images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Miniaturas */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-primary-500 shadow-md' : 'border-secondary-200 hover:border-secondary-400'
                      }`}
                    >
                      <img src={img} alt={`miniatura ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info del producto */}
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 leading-tight">{getProductName()}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-secondary-200'}`} />
                  ))}
                  <span className="text-sm text-secondary-500">({product.reviews || 0} reseñas)</span>
                </div>
              </div>

              {/* Precio */}
              <div className="flex items-end space-x-3">
                <span className="text-3xl font-bold text-secondary-900">{formatPrice(getProductPrice())}</span>
                {originalPrice && (
                  <span className="text-lg text-secondary-400 line-through mb-0.5">{formatPrice(originalPrice)}</span>
                )}
                {getProductDiscount() > 0 && (
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mb-0.5">
                    -{getProductDiscount()}% OFF
                  </span>
                )}
              </div>

              {/* Barra de envío gratis */}
              <div className="bg-secondary-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-primary-500" />
                  {remaining === 0 ? (
                    <span className="text-sm font-semibold text-green-600">🎉 ¡Tenés envío gratis!</span>
                  ) : (
                    <span className="text-sm text-secondary-700">
                      Sumá <span className="font-semibold text-secondary-900">{formatPrice(remaining)}</span> más para envío gratis
                    </span>
                  )}
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-secondary-400">
                  <span>$0</span>
                  <span>{formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getProductStock() > 10 ? 'bg-green-500' : getProductStock() > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className="text-sm text-secondary-600">
                  {getProductStock() > 10 ? 'En stock' : getProductStock() > 0 ? `Solo ${getProductStock()} disponibles` : 'Sin stock'}
                </span>
              </div>

              {/* Descripción */}
              {getProductDescription() && (
                <p className="text-secondary-600 text-sm leading-relaxed">{getProductDescription()}</p>
              )}

              {/* Cantidad */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-secondary-700">Cantidad:</span>
                <div className="flex items-center border border-secondary-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-secondary-100 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold text-secondary-800 border-x border-secondary-200">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="px-3 py-2 hover:bg-secondary-100 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={getProductStock() === 0}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3 text-base font-semibold disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-lg border transition-colors ${isLiked ? 'border-red-400 bg-red-50 text-red-500' : 'border-secondary-200 text-secondary-500 hover:border-red-400 hover:text-red-500'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Productos relacionados */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-8 border-t border-secondary-100">
              <h3 className="text-lg font-bold text-secondary-800 mb-4">Productos relacionados</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map(p => (
                  <div key={p.id} className="bg-secondary-50 rounded-xl p-3 hover:shadow-md transition-all cursor-pointer">
                    <div className="w-full h-24 bg-white rounded-lg overflow-hidden mb-2">
                      {(p.imagen || p.image) ? (
                        <img src={p.imagen || p.image} alt={p.nombre || p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">{getCategoryIcon(p.categoria || p.category)}</div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-secondary-800 line-clamp-2 mb-1">{p.nombre || p.name}</p>
                    <p className="text-sm font-bold text-primary-500">{formatPrice(p.precio || p.price || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductPreview
