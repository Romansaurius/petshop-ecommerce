import { useState } from 'react';
import { Plus, Eye, Star, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductPreview from './ProductPreview';
import ProductImageGallery from './ProductImageGallery';

const ProductCard = ({ product, onAddToCart, viewMode = 'grid', allProducts = [] }) => {
  const { addToCart } = useCart();
  const [showPreview, setShowPreview] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const hasVariantes = product?.variantes?.length > 0;
  const sortedVariantes = hasVariantes
    ? [...product.variantes].sort((a, b) => {
        const orden = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 }
        return (orden[a.talla] || 99) - (orden[b.talla] || 99)
      })
    : [];
  const [selectedVariante, setSelectedVariante] = useState(sortedVariantes[0] || null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getProductName = () => product.nombre || product.name || 'Producto sin nombre';
  const getProductPrice = () => product.precio || product.price || 0;
  const getProductDescription = () => product.descripcion || product.description || 'Sin descripción';
  const getProductCategory = () => product.categoria || product.category || 'general';
  const getProductImages = () => {
    // Si tiene múltiples imágenes en formato JSON
    if (product.imagenes) {
      try {
        const images = typeof product.imagenes === 'string' 
          ? JSON.parse(product.imagenes) 
          : product.imagenes;
        return Array.isArray(images) ? images : [];
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    }
    // Si solo tiene una imagen
    if (product.imagen || product.image) {
      return [product.imagen || product.image];
    }
    return [];
  };
  const getProductDiscount = () => product.descuento_porcentaje || product.discount || 0;
  const getProductFeatured = () => product.destacado || product.featured || false;
  const getProductTipo = () => product.tipo || 'normal';

  const handleAddToCart = async () => {
    setIsAdding(true);

    if (hasVariantes && !selectedVariante) {
      setShowPreview(true)
      setIsAdding(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const productToAdd = hasVariantes
      ? { ...product, precio: selectedVariante.precio, talla: selectedVariante.talla, variante_id: selectedVariante.id }
      : product;

    if (onAddToCart) {
      onAddToCart(productToAdd);
    } else {
      addToCart(productToAdd);
    }

    setIsAdding(false);
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < Math.floor(rating)
            ? 'text-amber-400 fill-current'
            : 'text-secondary-200'
        }`}
      />
    ));
  };

  const originalPrice = getProductDiscount() 
    ? Math.round(getProductPrice() / (1 - getProductDiscount() / 100))
    : null;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-secondary-100">
        <div className="flex p-6">
          <div className="relative w-32 h-32 flex-shrink-0 mr-6">
            <ProductImageGallery 
              images={getProductImages()}
              productName={getProductName()}
              className="w-full h-full rounded-xl"
            />
            
{/* Badges - vista lista */}
              {getProductDiscount() > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{getProductDiscount()}%
                </div>
              )}
              {(product?.tiene_talles && product?.variantes?.length > 0) && (
                <div className={`absolute -top-2 ${getProductDiscount() > 0 ? '-left-14' : '-left-2'} bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full`}>
                  Talles
                </div>
              )}
              {getProductFeatured() && (
                <div className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Destacado
                </div>
              )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-secondary-800 line-clamp-1">
                {getProductName()}
              </h3>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'text-red-500 bg-red-50' : 'text-secondary-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <p className="text-secondary-600 mb-3 line-clamp-2">
              {getProductDescription()}
            </p>
            
            {product.rating > 0 ? (
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center space-x-0.5">
                  {renderStars(product.rating)}
                </div>
                {product.reviews > 0 && <span className="text-xs text-secondary-400">({product.reviews})</span>}
              </div>
            ) : null}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {originalPrice !== null && (
                  <span className="text-sm text-secondary-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary-500">
                  {formatPrice(getProductPrice())}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreview(true)}
                  className="p-2 text-secondary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="btn btn-primary flex items-center gap-2 px-6 py-2 disabled:opacity-50"
                >
                  {isAdding ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {isAdding ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-secondary-100 hover:border-secondary-200 hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
           onClick={() => setShowPreview(true)}>
        <div className="relative overflow-hidden">
          <ProductImageGallery
            images={getProductImages()}
            productName={getProductName()}
            className="w-full h-52"
          />

          {/* Badges */}
          {getProductDiscount() > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{getProductDiscount()}%
            </div>
          )}
          {getProductTipo() === '2x1' && (
            <div className="absolute bottom-3 left-3 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              2×1
            </div>
          )}
          {getProductTipo() === 'importado' && (
            <div className="absolute bottom-3 left-3 bg-secondary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Importado
            </div>
          )}
          {getProductFeatured() && (
            <div className="absolute top-3 right-3 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Destacado
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-1.5 rounded-full shadow-sm transition-all ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white text-secondary-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowQuickPreview(true); }}
              className="p-1.5 bg-white text-secondary-400 hover:text-primary-600 rounded-full shadow-sm transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-sm text-secondary-800 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {getProductName()}
          </h3>

          {/* Selector de talles */}
          {hasVariantes && (
            <div className="mb-2.5">
              <div className="flex flex-wrap gap-1">
                {sortedVariantes.map(v => (
                  <button
                    key={v.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedVariante(v); }}
                    className={`px-2 py-0.5 text-[11px] border rounded-lg font-medium transition-colors ${
                      selectedVariante?.id === v.id
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-secondary-200 text-secondary-400 hover:border-primary-300'
                    }`}
                  >
                    {v.talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              {originalPrice !== null && (
                <span className="text-[11px] text-secondary-300 line-through">{formatPrice(originalPrice)}</span>
              )}
              <span className="text-base font-semibold text-secondary-800">
                {hasVariantes && selectedVariante ? formatPrice(selectedVariante.precio) : formatPrice(getProductPrice())}
              </span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
              disabled={isAdding}
              className="btn btn-primary px-3 py-2 text-xs disabled:opacity-50"
            >
              {isAdding
                ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Agregar</span></>
              }
            </button>
          </div>
        </div>
      </div>

      <ProductPreview
        product={product}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        allProducts={allProducts}
      />
    </>
  );
};

export default ProductCard;