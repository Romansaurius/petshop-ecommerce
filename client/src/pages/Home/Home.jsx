import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import Hero from '../../components/Hero/Hero'
import OffersSlider from '../../components/OffersSlider/OffersSlider'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const { addToCart } = useCart()

  useEffect(() => {
    // Productos destacados para mascotas con imágenes reales
    const products = [
      {
        id: 1,
        name: 'Comedero Automático Wi-Fi Premium',
        price: 89999,
        category: 'comederos',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop',
        description: 'Comedero automático con Wi-Fi, capacidad 2.5L, control por app móvil',
        rating: 4.8,
        reviews: 124,
        featured: true,
        discount: 15
      },
      {
        id: 2,
        name: 'Collar GPS Inteligente',
        price: 35999,
        category: 'collares',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop',
        description: 'Collar con GPS y monitor de actividad para mascotas',
        rating: 4.6,
        reviews: 92,
        featured: true
      },
      {
        id: 3,
        name: 'Juguete Interactivo Pelota LED',
        price: 15999,
        category: 'juguetes',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop',
        description: 'Pelota interactiva con luces LED y sonidos para perros',
        rating: 4.7,
        reviews: 156,
        featured: true,
        discount: 20
      },
      {
        id: 4,
        name: 'Cama Térmica para Gatos',
        price: 32999,
        category: 'camas',
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop',
        description: 'Cama con calefacción suave para gatos, perfecta para invierno',
        rating: 4.8,
        reviews: 56,
        featured: true
      }
    ]
    setFeaturedProducts(products)
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <Hero />
      
      {/* Offers Slider */}
      <OffersSlider />
      
      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4">
              🐾 Productos Destacados para tu Mascota
            </h2>
            <p className="text-lg text-secondary-600">
              Comederos automáticos Wi-Fi y los mejores productos para el cuidado de tu mascota
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/menu" 
              className="btn btn-primary text-lg px-8 py-4"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4">
              ¿Por qué elegir nuestros productos?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                Tecnología Wi-Fi
              </h3>
              <p className="text-secondary-600">
                Comederos automáticos con conectividad Wi-Fi y control desde tu smartphone
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                Envío Gratis
              </h3>
              <p className="text-secondary-600">
                Envío gratuito en compras superiores a $50.000 en toda Argentina
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                Calidad Premium
              </h3>
              <p className="text-secondary-600">
                Productos de alta calidad seleccionados especialmente para el bienestar de tu mascota
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home