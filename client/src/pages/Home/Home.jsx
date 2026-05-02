import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import Hero from '../../components/Hero/Hero'
import OffersSlider from '../../components/OffersSlider/OffersSlider'
import { Tag, Package, Globe } from 'lucide-react'

const SectionHeader = ({ icon: Icon, title, subtitle, color }) => (
  <div className="flex items-center space-x-4 mb-8">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-md`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-secondary-900">{title}</h2>
      {subtitle && <p className="text-secondary-500 text-sm">{subtitle}</p>}
    </div>
  </div>
)

const Home = () => {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setAllProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const offerProducts = allProducts.filter(p => (p.descuento_porcentaje || p.discount || 0) > 0)
  const products2x1 = allProducts.filter(p => p.tipo === '2x1')
  const importedProducts = allProducts.filter(p => p.tipo === 'importado')
  const featuredProducts = allProducts.filter(p => p.destacado || p.featured).slice(0, 4)

  const renderSection = (products, emptyMsg) => {
    if (loading) return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-secondary-100 rounded-2xl h-72 animate-pulse" />
        ))}
      </div>
    )
    if (products.length === 0) return (
      <div className="text-center py-10 text-secondary-400">{emptyMsg}</div>
    )
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} allProducts={allProducts} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OffersSlider />
      </div>

      {/* Sección Ofertas */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <SectionHeader
              icon={Tag}
              title="🔥 Ofertas"
              subtitle="Productos con descuento activo"
              color="bg-red-500"
            />
            <Link to="/menu?filter=ofertas" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Ver todas →
            </Link>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            {renderSection(offerProducts, 'No hay productos en oferta por el momento.')}
          </div>
        </div>
      </section>

      {/* Sección 2x1 */}
      <section className="py-12 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <SectionHeader
              icon={Package}
              title="🎁 Productos 2x1"
              subtitle="Llevá dos al precio de uno"
              color="bg-purple-500"
            />
            <Link to="/menu?filter=2x1" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
            {renderSection(products2x1, 'No hay productos 2x1 disponibles por el momento.')}
          </div>
        </div>
      </section>

      {/* Sección Importados */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <SectionHeader
              icon={Globe}
              title="✈️ Importados"
              subtitle="Productos traídos directo del exterior"
              color="bg-blue-500"
            />
            <Link to="/menu?filter=importados" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            {renderSection(importedProducts, 'No hay productos importados disponibles por el momento.')}
          </div>
        </div>
      </section>

      {/* Destacados */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">⭐ Destacados</h2>
                <p className="text-secondary-500 text-sm">Los favoritos de nuestros clientes</p>
              </div>
              <Link to="/menu" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} allProducts={allProducts} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-12 bg-white border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold text-secondary-800 mb-1">Envío Gratis</h3>
              <p className="text-sm text-secondary-500">En compras superiores a $75.000 en toda CABA y parte de GBA</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-secondary-800 mb-1">Tecnología Wi-Fi</h3>
              <p className="text-sm text-secondary-500">Comederos automáticos con control desde tu smartphone</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="font-semibold text-secondary-800 mb-1">Calidad Premium</h3>
              <p className="text-sm text-secondary-500">Productos seleccionados para el bienestar de tu mascota</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
