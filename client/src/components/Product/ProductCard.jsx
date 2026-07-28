import { useState } from 'react';
import { Plus, Eye, Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ProductPreview from './ProductPreview';
import ProductImageGallery from './ProductImageGallery';

const ProductCard = ({ product, onAddToCart, viewMode = 'grid', allProducts = [] }) => {
  const { addToCart } = useCart();
  const [showPreview, setShowPreview] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const hasVariantes = product?.variantes?.length > 0;
  const sortedVariantes = hasVariantes
    ? [...product.variantes].sort((a, b) => ({ S:1,M:2,L:3,XL:4,XXL:5 }[a.talla]||99) - ({ S:1,M:2,L:3,XL:4,XXL:5 }[b.talla]||99))
    : [];
  const [selectedVariante, setSelectedVariante] = useState(sortedVariantes[0] || null);

  const fmt = p => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);
  const name = () => product.nombre || product.name || 'Producto';
  const price = () => product.precio || product.price || 0;
  const desc = () => product.descripcion || product.description || '';
  const discount = () => product.descuento_porcentaje || product.discount || 0;
  const featured = () => product.destacado || product.featured || false;
  const tipo = () => product.tipo || 'normal';
  const images = () => {
    if (product.imagenes) {
      try {
        const imgs = typeof product.imagenes === 'string' ? JSON.parse(product.imagenes) : product.imagenes;
        if (Array.isArray(imgs) && imgs.length > 0) return imgs;
      } catch {}
    }
    if (product.imagen || product.image) return [product.imagen || product.image];
    return [];
  };

  const originalPrice = discount() > 0 ? Math.round(price() / (1 - discount() / 100)) : null;
  const displayPrice = hasVariantes && selectedVariante ? selectedVariante.precio : price();

  const handleAddToCart = async () => {
    if (hasVariantes && !selectedVariante) { setShowPreview(true); return; }
    setIsAdding(true);
    await new Promise(r => setTimeout(r, 250));
    const p = hasVariantes ? { ...product, precio: selectedVariante.precio, talla: selectedVariante.talla, variante_id: selectedVariante.id } : product;
    (onAddToCart || addToCart)(p);
    setIsAdding(false);
  };

  // ── VISTA LISTA ──
  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white rounded-2xl border border-secondary-100 hover:shadow-md transition-all duration-200 overflow-hidden flex cursor-pointer"
          onClick={() => setShowPreview(true)}>
          <div className="relative w-28 sm:w-36 h-28 sm:h-36 shrink-0">
            <ProductImageGallery images={images()} productName={name()} imagenConfig={product.imagen_config} className="w-full h-full" />
            {discount() > 0 && <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{discount()}%</span>}
            {tipo() === '2x1' && <span className="absolute bottom-1.5 left-1.5 bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2x1</span>}
          </div>
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
            <div>
              <p className="font-semibold text-secondary-800 line-clamp-2 text-sm leading-snug mb-1">{name()}</p>
              <p className="text-xs text-secondary-400 line-clamp-1 sm:line-clamp-2">{desc()}</p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                {originalPrice && <p className="text-xs text-secondary-300 line-through">{fmt(originalPrice)}</p>}
                <p className="text-base font-bold text-secondary-800">{fmt(displayPrice)}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={e => { e.stopPropagation(); setShowPreview(true); }}
                  className="p-2 text-secondary-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); handleAddToCart(); }} disabled={isAdding}
                  className="btn btn-primary flex items-center gap-1 px-3 py-2 text-xs disabled:opacity-50">
                  {isAdding
                    ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><ShoppingCart className="w-3.5 h-3.5" /><span className="hidden sm:inline">Agregar</span></>}
                </button>
              </div>
            </div>
          </div>
        </div>
        <ProductPreview product={product} isOpen={showPreview} onClose={() => setShowPreview(false)} allProducts={allProducts} />
      </>
    );
  }

  // ── VISTA GRID ──
  return (
    <>
      <div className="bg-white rounded-2xl border border-secondary-100 hover:border-secondary-200 hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
        onClick={() => setShowPreview(true)}>

        {/* Imagen */}
        <div className="relative w-full h-40 sm:h-52 overflow-hidden bg-white border-b border-secondary-50">
          <ProductImageGallery images={images()} productName={name()} imagenConfig={product.imagen_config} className="w-full h-full" />

          {/* Badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {discount() > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{discount()}%</span>}
            {tipo() === '2x1' && <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">2x1</span>}
            {tipo() === 'importado' && <span className="bg-secondary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Import.</span>}
          </div>
          {featured() && <span className="absolute top-1.5 right-1.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Dest.</span>}

          {/* Hover actions — solo desktop */}
          <div className="absolute bottom-2 right-2 hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={e => { e.stopPropagation(); setIsLiked(v => !v); }}
              className={`p-1.5 rounded-full shadow transition-all ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-secondary-400 hover:text-red-500'}`}>
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={e => { e.stopPropagation(); setShowPreview(true); }}
              className="p-1.5 bg-white text-secondary-400 hover:text-primary-600 rounded-full shadow transition-all">
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5 sm:p-3 flex flex-col flex-1">
          <p className="font-medium text-xs sm:text-sm text-secondary-800 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors mb-1.5">
            {name()}
          </p>

          {hasVariantes && (
            <div className="flex flex-wrap gap-1 mb-2">
              {sortedVariantes.map(v => (
                <button key={v.id} onClick={e => { e.stopPropagation(); setSelectedVariante(v); }}
                  className={`px-1.5 py-0.5 text-[10px] border rounded font-medium transition-colors ${selectedVariante?.id === v.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-secondary-200 text-secondary-400'}`}>
                  {v.talla}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-1.5">
            <div>
              {originalPrice && <p className="text-[10px] text-secondary-300 line-through leading-none mb-0.5">{fmt(originalPrice)}</p>}
              <p className="text-sm sm:text-base font-bold text-secondary-800">{fmt(displayPrice)}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); handleAddToCart(); }} disabled={isAdding}
              className="btn btn-primary px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs disabled:opacity-50 flex items-center gap-1">
              {isAdding
                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /><span className="hidden sm:inline">Agregar</span></>}
            </button>
          </div>
        </div>
      </div>

      <ProductPreview product={product} isOpen={showPreview} onClose={() => setShowPreview(false)} allProducts={allProducts} />
    </>
  );
};

export default ProductCard;
