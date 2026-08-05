import { useState, useEffect } from 'react'
import { X, Star, Heart, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, Truck } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const FREE_SHIPPING_THRESHOLD = 35000

const MiniProductCard = ({ product, onClick, formatPrice }) => {
  const getImages = () => {
    if (product?.imagenes) {
      try {
        const imgs = typeof product.imagenes === 'string' ? JSON.parse(product.imagenes) : product.imagenes
        if (Array.isArray(imgs) && imgs.length > 0) return imgs
      } catch {}
    }
    return product?.imagen ? [product.imagen] : []
  }
  const imgs = getImages()
  const [fit, pos] = (product?.imagen_config || 'contain|center').split('|')
  const discount = product?.descuento_porcentaje || 0
  return (
    <button
      onClick={() => onClick(product)}
      className="group bg-white border border-secondary-100 rounded-xl overflow-hidden hover:border-primary-200 hover:shadow-md transition-all text-left w-full"
    >
      <div className="relative w-full aspect-square bg-secondary-50 overflow-hidden">
        {imgs.length > 0 ? (
          <img src={imgs[0]} alt={product.nombre || product.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            style={{ objectFit: fit || 'contain', objectPosition: pos || 'center' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{discount}%</span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-secondary-800 line-clamp-2 leading-snug mb-1 group-hover:text-primary-600 transition-colors">
          {product.nombre || product.name}
        </p>
        <p className="text-sm font-bold text-secondary-900">{formatPrice(product.precio || product.price || 0)}</p>
      </div>
    </button>
  )
}

const ProductPreview = ({ product, isOpen, onClose, allProducts = [] }) => {
  const { addToCart, cart } = useCart()
  const [activeProduct, setActiveProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedTalla, setSelectedTalla] = useState(null)
  const [selectedPrecio, setSelectedPrecio] = useState(null)
  const [descExpanded, setDescExpanded] = useState(false)

  // activeProduct permite navegar a otro producto sin cerrar el modal
  const currentProduct = activeProduct || product

  const handleNavigate = (p) => {
    setActiveProduct(p)
    setQuantity(1)
    setSelectedImage(0)
    setIsLiked(false)
  }
  
  useEffect(() => {
    if (currentProduct) {
      setDescExpanded(false)
      if (currentProduct.variantes && currentProduct.variantes.length > 0) {
        const sortedVariantes = [...currentProduct.variantes].sort((a, b) => {
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
  }, [currentProduct])

  const getProductName = () => currentProduct?.nombre || currentProduct?.name || 'Producto'
  const getProductPrice = () => {
    if (selectedPrecio !== null) return selectedPrecio
    return currentProduct?.precio || currentProduct?.price || 0
  }
  const getProductDescription = () => currentProduct?.descripcion || currentProduct?.description || ''
  const getProductCategory = () => currentProduct?.categoria || currentProduct?.category || ''
  const getProductDiscount = () => currentProduct?.descuento_porcentaje || currentProduct?.discount || 0
  const getProductTipo = () => currentProduct?.tipo || 'normal'
  const getProductStock = () => {
    if (selectedTalla && currentProduct?.variantes) {
      const variante = currentProduct.variantes.find(v => v.talla === selectedTalla)
      return variante ? variante.stock : currentProduct?.stock || 100
    }
    return currentProduct?.stock || 100
  }

  const getProductImages = () => {
    if (currentProduct?.imagenes) {
      try {
        const imgs = typeof currentProduct.imagenes === 'string' ? JSON.parse(currentProduct.imagenes) : currentProduct.imagenes
        if (Array.isArray(imgs) && imgs.length > 0) return imgs
      } catch (e) {}
    }
    if (currentProduct?.imagen || currentProduct?.image) return [currentProduct.imagen || currentProduct.image]
    return []
  }

  const images = getProductImages()
  const is2x1 = getProductTipo() === '2x1'
  const [imgFit, imgPos] = (currentProduct?.imagen_config || 'contain|center').split('|')
  const recommendedProducts = allProducts.filter(p => p.destacado || p.featured).filter(p => p.id !== currentProduct?.id).slice(0, 6)
  
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
    if (currentProduct && allProducts.length > 0) {
      const related = allProducts
        .filter(p => p.id !== currentProduct.id && (p.categoria || p.category) === getProductCategory())
        .slice(0, 4)
      setRelatedProducts(related)
    }
    setSelectedImage(0)
  }, [currentProduct, allProducts])

  const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0
  }).format(price)

  const originalPrice = getProductDiscount() > 0
    ? Math.round(getProductPrice() / (1 - getProductDiscount() / 100))
    : null

  const handleAddToCart = () => {
    const productWithTalla = {
      ...currentProduct,
      precio: getProductPrice(),
      talla: selectedTalla,
      variante_id: selectedTalla ? currentProduct.variantes?.find(v => v.talla === selectedTalla)?.id : null
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-5xl max-h-[92vh] sm:max-h-[95vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-secondary-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <span className="text-sm text-secondary-500 capitalize font-medium">{getProductCategory()}</span>
          <button onClick={onClose} className="p-2 text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

            {/* Galería de imágenes */}
            <div className="space-y-3">
              {/* Imagen principal */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 bg-secondary-50 rounded-2xl overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={`${getProductName()} ${selectedImage + 1}`}
                    className="w-full h-full"
                    style={{ objectFit: imgFit || 'contain', objectPosition: imgPos || 'center' }}
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
                      <img src={img} alt={`miniatura ${index + 1}`} className="w-full h-full" style={{ objectFit: imgFit || 'contain', objectPosition: imgPos || 'center' }} />
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
                  {(currentProduct.rating > 0) ? (
                    <>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(currentProduct.rating) ? 'text-yellow-400 fill-current' : 'text-secondary-200'}`} />
                      ))}
                      {currentProduct.reviews > 0 && <span className="text-sm text-secondary-500">({currentProduct.reviews} reseñas)</span>}
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

              {/* Descripción con Ver más */}
              {getProductDescription() && (() => {
                const desc = getProductDescription()
                const isLong = desc.length > 180
                return (
                  <div className="text-secondary-600 text-sm leading-relaxed">
                    <p>{isLong && !descExpanded ? desc.slice(0, 180) + '...' : desc}</p>
                    {isLong && (
                      <button
                        onClick={() => setDescExpanded(v => !v)}
                        className="mt-1 text-primary-600 hover:text-primary-700 text-xs font-medium"
                      >
                        {descExpanded ? 'Ver menos ▲' : 'Ver más ▼'}
                      </button>
                    )}
                  </div>
                )
              })()}

              {/* Selector de talles */}
              {currentProduct?.variantes && currentProduct.variantes.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-secondary-700 mb-2 block">Talla:</span>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.variantes.map(variante => (
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
                  <button onClick={() => setQuantity(Math.min(getProductStock() || 1, quantity + 1))} className="px-3 py-2 hover:bg-secondary-100 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Botones */}
              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={getProductStock() === 0}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2 py-3 text-sm sm:text-base font-semibold disabled:opacity-50"
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
              <h3 className="text-base font-semibold text-secondary-800 mb-4">Productos relacionados</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map(p => (
                  <MiniProductCard key={p.id} product={p} onClick={handleNavigate} formatPrice={formatPrice} />
                ))}
              </div>
            </div>
          )}

          {/* Productos recomendados */}
          {recommendedProducts.length > 0 && (
            <div className="mt-8 pt-8 border-t border-secondary-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-primary-500 rounded-full" />
                <h3 className="text-base font-semibold text-secondary-800">Productos recomendados</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                {recommendedProducts.map(p => (
                  <MiniProductCard key={p.id} product={p} onClick={handleNavigate} formatPrice={formatPrice} />
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
