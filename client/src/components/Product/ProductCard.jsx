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

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Simular delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
    
    setIsAdding(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-secondary-300'
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
            
            {getProductDiscount() > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{getProductDiscount()}%
              </div>
            )}
            
            {getProductFeatured() && (
              <div className="absolute -top-2 -left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                ⭐
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
            
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating || 0)}
              </div>
              <span className="text-sm text-secondary-500">({product.reviews || 0})</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {originalPrice && (
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
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-secondary-100 group cursor-pointer"
           onClick={() => setShowPreview(true)}>
        <div className="relative overflow-hidden">
          <ProductImageGallery 
            images={getProductImages()}
            productName={getProductName()}
            className="w-full h-56"
          />
          
          {/* Badges */}
          {getProductDiscount() > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
              -{getProductDiscount()}%
            </div>
          )}
          
          {getProductFeatured() && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
              ⭐ Destacado
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 text-secondary-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowQuickPreview(true)
              }}
              className="p-2 bg-white/90 hover:bg-white text-secondary-600 hover:text-primary-500 rounded-full shadow-lg transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-lg text-secondary-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {getProductName()}
          </h3>
          
          <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
            {getProductDescription()}
          </p>
          
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center space-x-1">
              {renderStars(product.rating || 0)}
            </div>
            <span className="text-sm text-secondary-500">({product.reviews || 0})</span>
          </div>
          
          {/* Price and Add Button */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {originalPrice && (
                <span className="text-sm text-secondary-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-xl font-bold text-primary-500">
                {formatPrice(getProductPrice())}
              </span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart()
              }}
              disabled={isAdding}
              className="btn btn-primary flex items-center gap-2 px-4 py-2 disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
            >
              {isAdding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isAdding ? 'Agregando...' : 'Agregar'}
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