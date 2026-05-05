import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import Hero from '../../components/Hero/Hero'
import OffersSlider from '../../components/OffersSlider/OffersSlider'
import { Tag, Package, Globe } from 'lucide-react'

const SectionHeader = ({ icon: Icon, title, subtitle, color }) => (
  <div className="flex items-center space-x-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-md`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-secondary-900">{title}</h2>
      {subtitle && <p className="text-secondary-500 text-sm">{subtitle}</p>}
    </div>
  </div>
)

const brands = [
  { initials: 'RC', name: 'Royal Canin', color: 'from-blue-400 to-blue-600' },
  { initials: 'HP', name: "Hill's Pet", color: 'from-red-400 to-red-600' },
  { initials: 'PR', name: 'Pro Plan', color: 'from-green-400 to-green-600' },
  { initials: 'EU', name: 'Eukanuba', color: 'from-purple-400 to-purple-600' },
  { initials: 'KG', name: 'Kong', color: 'from-orange-400 to-orange-600' },
  { initials: 'FL', name: 'Flexi', color: 'from-pink-400 to-pink-600' },
]

const Skeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-secondary-100 rounded-2xl h-72 animate-pulse" />
    ))}
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

  const offerProducts = allProducts
    .filter(p => (p.descuento_porcentaje || p.discount || 0) > 0)
    .sort((a, b) => (b.descuento_porcentaje || b.discount || 0) - (a.descuento_porcentaje || a.discount || 0))
    .slice(0, 4)

  const products2x1 = allProducts.filter(p => p.tipo === '2x1').slice(0, 4)
  const importedProducts = allProducts.filter(p => p.tipo === 'importado').slice(0, 4)
  const featuredProducts = allProducts.filter(p => p.destacado || p.featured).slice(0, 4)

  const renderSection = (products, emptyMsg, link) => {
    if (loading) return <Skeleton />
    if (products.length === 0) return (
      <div className="text-center py-10 text-secondary-400">{emptyMsg}</div>
    )
    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} allProducts={allProducts} />
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to={link} className="inline-flex items-center space-x-2 btn btn-primary px-8 py-3">
            <span>Ver todos</span>
            <span>→</span>
          </Link>
        </div>
      </>
    )
  }

  return (
    <div>
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OffersSlider />
      </div>

      {/* Ofertas */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <SectionHeader icon={Tag} title="🔥 Ofertas" subtitle="Los mejores descuentos del momento" color="bg-red-500" />
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            {renderSection(offerProducts, 'No hay productos en oferta por el momento.', '/menu?filter=ofertas')}
          </div>
        </div>
      </section>

      {/* 2x1 */}
      <section className="py-12 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <SectionHeader icon={Package} title="🎁 Productos 2x1" subtitle="Llevá dos al precio de uno" color="bg-purple-500" />
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
            {renderSection(products2x1, 'No hay productos 2x1 disponibles por el momento.', '/menu?filter=2x1')}
          </div>
        </div>
      </section>

      {/* Importados */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <SectionHeader icon={Globe} title="✈️ Importados" subtitle="Productos traídos directo del exterior" color="bg-blue-500" />
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            {renderSection(importedProducts, 'No hay productos importados disponibles por el momento.', '/menu?filter=importados')}
          </div>
        </div>
      </section>

      {/* Destacados */}
      {(loading || featuredProducts.length > 0) && (
        <section className="py-12 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">⭐ Destacados</h2>
                <p className="text-secondary-500 text-sm">Los favoritos de nuestros clientes</p>
              </div>
            </div>
            {loading ? <Skeleton /> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} allProducts={allProducts} />
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Link to="/menu" className="inline-flex items-center space-x-2 btn btn-primary px-8 py-3">
                    <span>Ver todos los productos</span>
                    <span>→</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Marcas */}
      <section className="py-12 bg-white border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary-800 mb-2">Marcas con las que trabajamos</h2>
            <p className="text-secondary-500 text-sm">Trabajamos con los mejores proveedores para garantizar la calidad</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {brands.map(brand => (
              <div key={brand.name} className="group bg-secondary-50 hover:bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${brand.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-bold text-sm">{brand.initials}</span>
                </div>
                <h3 className="font-medium text-secondary-800 text-xs">{brand.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold text-secondary-800 mb-1">Envío Gratis</h3>
              <p className="text-sm text-secondary-500">En compras superiores a $75.000 · Toda CABA y parte de GBA</p>
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
