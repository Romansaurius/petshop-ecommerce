import { useState, useEffect } from 'react'
import { X, Star, Heart, ShoppingCart, Plus, Minus, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const ProductPreview = ({ product, isOpen, onClose, allProducts = [] }) => {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])

  const getProductName = () => product?.nombre || product?.name || 'Producto'
  const getProductPrice = () => product?.precio || product?.price || 0
  const getProductDescription = () => product?.descripcion || product?.description || ''
  const getProductCategory = () => product?.categoria || product?.category || ''
  const getProductImage = () => product?.imagen || product?.image
  const getProductDiscount = () => product?.descuento_porcentaje || product?.discount || 0
  const getProductStock = () => product?.stock || 100

  useEffect(() => {
    if (product && allProducts.length > 0) {
      const related = allProducts
        .filter(p => 
          p.id !== product.id && 
          (p.categoria || p.category) === getProductCategory()
        )
        .slice(0, 4)
      setRelatedProducts(related)
    }
  }, [product, allProducts])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const originalPrice = getProductDiscount() > 0 
    ? Math.round(getProductPrice() / (1 - getProductDiscount() / 100))
    : null

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setQuantity(1)
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'comederos': '🍽️',
      'juguetes': '🎾',
      'camas': '🛏️',
      'collares': '🦴',
      'rascadores': '🪜',
      'accesorios': '🎒'
    }
    return icons[category] || '📦'
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-secondary-200 p-6 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(getProductCategory())}</span>
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">{getProductName()}</h1>
              <p className="text-secondary-600 capitalize">{getProductCategory()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Imagen del producto */}
            <div className="space-y-4">
              <div className="relative">
                <div className="w-full h-96 bg-secondary-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {getProductImage() ? (
                    <img 
                      src={getProductImage()} 
                      alt={getProductName()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-9xl">
                      {getCategoryIcon(getProductCategory())}
                    </div>
                  )}
                </div>
                
                {getProductDiscount() > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-lg font-bold px-4 py-2 rounded-full shadow-lg">
                    -{getProductDiscount()}%
                  </div>
                )}
                
                {(product.destacado || product.featured) && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-lg font-bold px-4 py-2 rounded-full shadow-lg">
                    ⭐ Destacado
                  </div>
                )}
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              {/* Precio */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  {originalPrice && (
                    <span className="text-2xl text-secondary-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-primary-500">
                    {formatPrice(getProductPrice())}
                  </span>
                </div>
                {getProductDiscount() > 0 && (
                  <p className="text-green-600 font-medium">
                    ¡Ahorrás {formatPrice(originalPrice - getProductPrice())}!
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 4.5)
                          ? 'text-yellow-400 fill-current'
                          : 'text-secondary-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-secondary-600">({product.reviews || 0} reseñas)</span>
              </div>

              {/* Stock */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  getProductStock() > 10 ? 'bg-green-500' : 
                  getProductStock() > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-secondary-700">
                  {getProductStock() > 10 ? 'En stock' : 
                   getProductStock() > 0 ? `Solo ${getProductStock()} disponibles` : 'Sin stock'}
                </span>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-3">Descripción</h3>
                <p className="text-secondary-600 leading-relaxed">
                  {getProductDescription()}
                </p>
              </div>

              {/* Cantidad y agregar al carrito */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-secondary-700 font-medium">Cantidad:</span>
                  <div className="flex items-center border-2 border-secondary-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-secondary-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="p-2 hover:bg-secondary-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={getProductStock() === 0}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al Carrito
                  </button>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      isLiked 
                        ? 'border-red-500 bg-red-50 text-red-500' 
                        : 'border-secondary-200 text-secondary-600 hover:border-red-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-4 border-2 border-secondary-200 text-secondary-600 hover:border-primary-500 hover:text-primary-500 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Beneficios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-secondary-200">
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span>Envío gratis +$100k</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Garantía 1 año</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-600">
                  <RotateCcw className="w-4 h-4 text-purple-500" />
                  <span>Devolución 30 días</span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos relacionados */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-secondary-200">
              <h3 className="text-2xl font-bold text-secondary-800 mb-6">Productos relacionados</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(relatedProduct => (
                  <div key={relatedProduct.id} className="bg-secondary-50 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <div className="w-full h-32 bg-white rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                      {(relatedProduct.imagen || relatedProduct.image) ? (
                        <img 
                          src={relatedProduct.imagen || relatedProduct.image} 
                          alt={relatedProduct.nombre || relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-3xl">
                          {getCategoryIcon(relatedProduct.categoria || relatedProduct.category)}
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-secondary-800 text-sm line-clamp-2 mb-2">
                      {relatedProduct.nombre || relatedProduct.name}
                    </h4>
                    <p className="text-primary-500 font-bold">
                      {formatPrice(relatedProduct.precio || relatedProduct.price || 0)}
                    </p>
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