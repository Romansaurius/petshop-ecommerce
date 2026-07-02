import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const offers = [
  {
    id: 1,
    eyebrow: 'Beneficio exclusivo',
    title: 'Envío gratis',
    subtitle: 'En compras superiores a $35.000',
    description: 'Malvinas Argentinas · Pilar · San Isidro y alrededores',
    link: '/menu',
    buttonText: 'Ver productos',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop',
    accent: 'from-teal-600 to-emerald-500',
  },
  {
    id: 2,
    eyebrow: 'Tecnología para mascotas',
    title: 'Comederos Wi-Fi',
    subtitle: 'Hasta 30% de descuento',
    description: 'Controlá la alimentación de tu mascota desde el celular',
    link: '/menu?category=comederos',
    buttonText: 'Ver comederos',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop',
    accent: 'from-primary-600 to-orange-400',
  },
  {
    id: 3,
    eyebrow: 'Promoción especial',
    title: 'Juguetes 2 x 1',
    subtitle: 'En productos seleccionados',
    description: 'Para perros y gatos — mientras dure el stock',
    link: '/menu?filter=2x1',
    buttonText: 'Ver promociones',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop',
    accent: 'from-violet-600 to-indigo-500',
  },
];

const OffersSlider = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % offers.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      style={{ height: '320px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {offers.map(offer => (
          <div
            key={offer.id}
            className={`min-w-full h-full bg-gradient-to-r ${offer.accent} flex`}
          >
            {/* Text side */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-14 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-2">{offer.eyebrow}</p>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-1">{offer.title}</h2>
              <p className="text-lg md:text-xl font-medium opacity-90 mb-2">{offer.subtitle}</p>
              <p className="text-sm opacity-70 mb-6 hidden md:block">{offer.description}</p>
              <Link
                to={offer.link}
                className="inline-flex items-center self-start bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105"
              >
                {offer.buttonText}
              </Link>
            </div>

            {/* Image side */}
            <div className="flex-1 relative hidden sm:block">
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/20" />
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent(p => (p - 1 + offers.length) % offers.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrent(p => (p + 1) % offers.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {offers.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default OffersSlider;
