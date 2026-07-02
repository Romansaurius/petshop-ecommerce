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
  const [selectedTalla, setSelectedTalla] = useState(null)
  const [selectedPrecio, setSelectedPrecio] = useState(null)
  
  useEffect(() => {
    if (product) {
      // Si el producto tiene talles, seleccionar el primero por defecto
      if (product.variantes && product.variantes.length > 0) {
        const sortedVariantes = [...product.variantes].sort((a, b) => {
          const orden = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5 }
          return (orden[a.talla] || 99) - (orden[b.talla] || 99)
        })
        setSelectedTalla(sortedVariantes[0].talla)
        setSelectedPrecio(sortedVariantes[0].precio)
      } else {
        setSelectedTalla(null)
        setSelectedPrecio(null)
      }
    }
  }, [product])

  const getProductName = () => product?.nombre || product?.name || 'Producto'
  const getProductPrice = () => {
    if (selectedPrecio !== null) return selectedPrecio
    return product?.precio || product?.price || 0
  }
  const getProductDescription = () => product?.descripcion || product?.description || ''
  const getProductCategory = () => product?.categoria || product?.category || ''
  const getProductDiscount = () => product?.descuento_porcentaje || product?.discount || 0
  const getProductTipo = () => product?.tipo || 'normal'
  const getProductStock = () => {
    if (selectedTalla && product?.variantes) {
      const variante = product.variantes.find(v => v.talla === selectedTalla)
      return variante ? variante.stock : product?.stock || 100
    }
    return product?.stock || 100
  }

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
  const is2x1 = getProductTipo() === '2x1'
  const RECOMMENDED_IDS = [1, 2, 3, 4, 5]
  const recommendedProducts = allProducts.filter(p => RECOMMENDED_IDS.includes(p.id)).slice(0, 5)
  
  // Calcular total del carrito considerando 2x1
  const cartTotal = (cart || []).reduce((sum, item) => {
    const price = item.precio || item.price || 0
    const unidadesCobradas = item.is2x1 ? Math.ceil(item.quantity / 2) : item.quantity
    return sum + (price * unidadesCobradas)
  }, 0)

  // Calcular progreso con el producto actual
  const unidadesCobradasActual = is2x1 ? Math.ceil(quantity / 2) : quantity
  const totalWithProduct = cartTotal + getProductPrice() * unidadesCobradasActual
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
    const productWithTalla = {
      ...product,
      precio: getProductPrice(),
      talla: selectedTalla,
      variante_id: selectedTalla ? product.variantes?.find(v => v.talla === selectedTalla)?.id : null
    }
    for (let i = 0; i < quantity; i++) addToCart(productWithTalla)
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
          <span className="text-sm text-secondary-500 capitalize font-medium">{getProductCategory()}</span>
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
                  <div className="w-full h-full flex items-center justify-center bg-secondary-100">
                    <svg className="w-16 h-16 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
                  {(product.rating > 0) ? (
                    <>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-secondary-200'}`} />
                      ))}
                      {product.reviews > 0 && <span className="text-sm text-secondary-500">({product.reviews} reseñas)</span>}
                    </>
                  ) : null}
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
                    <span className="text-sm font-semibold text-green-600">Tenés envío gratis!</span>
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

              {/* Selector de talles */}
              {product?.variantes && product.variantes.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-secondary-700 mb-2 block">Talla:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variantes.map(variante => (
                      <button
                        key={variante.id}
                        type="button"
                        onClick={() => {
                          setSelectedTalla(variante.talla)
                          setSelectedPrecio(variante.precio)
                        }}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedTalla === variante.talla
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{variante.talla}</div>
                        <div className="text-xs">{formatPrice(variante.precio)}</div>
                      </button>
                    ))}
                  </div>
                </div>
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
                        <div className="w-full h-full flex items-center justify-center bg-secondary-100 rounded-lg">
                          <svg className="w-8 h-8 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-secondary-800 line-clamp-2 mb-1">{p.nombre || p.name}</p>
                    <p className="text-sm font-bold text-primary-500">{formatPrice(p.precio || p.price || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Productos recomendados */}
          {recommendedProducts.length > 0 && (
            <div className="mt-8 pt-8 border-t border-secondary-100">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-primary-500 rounded-full" />
                <h3 className="text-lg font-bold text-secondary-800">Productos recomendados</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {recommendedProducts.map(p => (
                  <div key={p.id} className="group bg-white border border-secondary-100 rounded-xl p-3 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
                    <div className="w-full h-20 bg-secondary-50 rounded-lg overflow-hidden mb-2">
                      {(p.imagen || p.image) ? (
                        <img src={p.imagen || p.image} alt={p.nombre || p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-7 h-7 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-secondary-800 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">{p.nombre || p.name}</p>
                    <p className="text-xs font-bold text-primary-500">{formatPrice(p.precio || p.price || 0)}</p>
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
