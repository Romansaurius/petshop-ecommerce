import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    eyebrow: 'Compra segura · Entrega confiable',
    title: 'Llega a tu puerta',
    subtitle: 'Envíos rápidos a Malvinas Argentinas, Pilar, San Isidro y alrededores',
    description: 'Envío gratis en compras superiores a $35.000',
    link: '/menu',
    buttonText: 'Ver productos',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop',
    bg: 'from-primary-700 to-primary-500',
    badge: null,
  },
  {
    id: 2,
    eyebrow: 'Lanzamientos Exclusivos',
    title: 'Promociones que no podés perderte',
    subtitle: 'Aprovechá nuestras ofertas especiales de lanzamiento',
    description: null,
    link: '/menu?filter=ofertas',
    buttonText: 'Ver todas las promociones',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop',
    bg: 'from-secondary-800 to-secondary-600',
    badges: ['2×1', '50% OFF'],
  },
  {
    id: 3,
    eyebrow: 'Nutrición · Bienestar · Calidad',
    title: 'Alimentación Natural para una Vida Mejor',
    subtitle: 'Snacks, premios y productos seleccionados por sus ingredientes naturales y beneficios reales',
    description: 'Porque lo que come tu mascota define cómo vive cada día.',
    link: '/menu?category=snacks',
    buttonText: 'Descubrir productos naturales',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop',
    bg: 'from-primary-600 to-primary-400',
    badge: null,
  },
  {
    id: 4,
    eyebrow: 'Tu petshop de confianza',
    title: 'Todo lo que necesitan para vivir mejor',
    subtitle: 'Desde alimentación saludable hasta camas, juguetes y accesorios seleccionados',
    description: 'Comodidad, entretenimiento y bienestar para cada etapa de su vida.',
    link: '/menu',
    buttonText: 'Explorar tienda',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop',
    bg: 'from-secondary-700 to-secondary-500',
    badge: null,
  },
];

const OffersSlider = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height: '320px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-600 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map(slide => (
          <div key={slide.id} className={`min-w-full h-full bg-gradient-to-r ${slide.bg} flex`}>
            {/* Text */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-14 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70 mb-2">{slide.eyebrow}</p>
              <h2 className="text-2xl md:text-4xl font-semibold leading-tight mb-2">{slide.title}</h2>
              <p className="text-sm md:text-base opacity-85 mb-1 leading-relaxed">{slide.subtitle}</p>
              {slide.description && (
                <p className="text-xs opacity-60 mb-5 hidden md:block">{slide.description}</p>
              )}
              {/* Badges para slide 2 */}
              {slide.badges && (
                <div className="flex gap-3 mb-5">
                  {slide.badges.map(b => (
                    <span key={b} className="bg-white text-secondary-800 font-bold text-sm px-4 py-1.5 rounded-full shadow-sm">
                      {b}
                    </span>
                  ))}
                </div>
              )}
              {!slide.badges && <div className="mb-5" />}
              <Link
                to={slide.link}
                className="inline-flex items-center self-start bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                {slide.buttonText}
              </Link>
            </div>

            {/* Image */}
            <div className="flex-1 relative hidden sm:block">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setCurrent(p => (p + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default OffersSlider;
