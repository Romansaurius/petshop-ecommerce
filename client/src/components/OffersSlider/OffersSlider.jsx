import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const OffersSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const offers = [
    {
      id: 1,
      title: "ENVÍO GRATIS",
      subtitle: "En compras +$50.000",
      description: "A todo el país",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
      buttonText: "Aprovechar",
      bgColor: "from-green-500 to-teal-500"
    },
    {
      id: 2,
      title: "COMEDEROS Wi-Fi",
      subtitle: "Hasta 30% OFF",
      description: "Tecnología premium",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800",
      buttonText: "Ver Ofertas",
      bgColor: "from-orange-500 to-red-500"
    },
    {
      id: 3,
      title: "JUGUETES",
      subtitle: "2x1 en seleccionados",
      description: "Para perros y gatos",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
      buttonText: "Comprar",
      bgColor: "from-purple-600 to-blue-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [offers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };

  return (
    <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-2xl shadow-2xl">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`min-w-full h-full bg-gradient-to-r ${offer.bgColor} relative flex items-center`}
          >
            <div className="flex-1 text-white p-8 md:p-12">
              <div className="max-w-md">
                <h2 className="text-4xl md:text-6xl font-bold mb-2">
                  {offer.title}
                </h2>
                <p className="text-xl md:text-2xl mb-4 opacity-90">
                  {offer.subtitle}
                </p>
                <p className="text-lg mb-6 opacity-80">
                  {offer.description}
                </p>
                <button className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105">
                  {offer.buttonText}
                </button>
              </div>
            </div>

            <div className="flex-1 h-full relative">
              <img 
                src={offer.image} 
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {offers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OffersSlider;