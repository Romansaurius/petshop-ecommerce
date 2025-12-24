import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductImageGallery = ({ images = [], productName, className = "" }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className={`bg-secondary-100 flex items-center justify-center ${className}`}>
        <div className="text-6xl">🐾</div>
      </div>
    );
  }

  // Si solo hay una imagen, mostrarla sin navegación
  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img 
          src={images[0]} 
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {/* Imagen principal */}
      <img 
        src={images[currentImageIndex]} 
        alt={`${productName} - Imagen ${currentImageIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* Botones de navegación */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-secondary-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-secondary-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Indicadores de imagen */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentImageIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;