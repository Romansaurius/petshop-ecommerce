import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductImageGallery = ({ images = [], productName, className = '', imagenConfig = 'contain|center' }) => {
  const [idx, setIdx] = useState(0);
  const [fit, pos] = (imagenConfig || 'cover|center').split('|');
  const imgStyle = { objectFit: fit || 'cover', objectPosition: pos || 'center' };

  if (!images || images.length === 0) {
    return (
      <div className={`bg-secondary-100 flex items-center justify-center ${className}`}>
        <span className="text-5xl">🐾</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img
        src={images[idx]}
        alt={`${productName} ${idx + 1}`}
        className="absolute inset-0 w-full h-full transition-opacity duration-300"
        style={imgStyle}
      />

      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx(p => (p - 1 + images.length) % images.length); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-secondary-600 p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); setIdx(p => (p + 1) % images.length); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-secondary-600 p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                className={`rounded-full transition-all ${i === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductImageGallery;
