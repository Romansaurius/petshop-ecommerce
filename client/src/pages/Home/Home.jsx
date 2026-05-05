import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import Hero from '../../components/Hero/Hero'
import OffersSlider from '../../components/OffersSlider/OffersSlider'
import { Tag, Package, Globe, ChevronDown, ChevronUp } from 'lucide-react'

const brands = [
  { initials: 'RC', name: 'Royal Canin', color: 'from-blue-400 to-blue-600' },
  { initials: 'HP', name: "Hill's Pet", color: 'from-red-400 to-red-600' },
  { initials: 'PR', name: 'Pro Plan', color: 'from-green-400 to-green-600' },
  { initials: 'EU', name: 'Eukanuba', color: 'from-purple-400 to-purple-600' },
  { initials: 'KG', name: 'Kong', color: 'from-orange-400 to-orange-600' },
  { initials: 'FL', name: 'Flexi', color: 'from-pink-400 to-pink-600' },
]

const faqs = [
  {
    question: 'Como realizo una compra?',
    answer: 'Navega por nuestro catalogo, elegi los productos que queres y agregarlos al carrito. Luego completa tus datos de contacto y elegi el metodo de pago. No necesitas crear una cuenta para comprar.'
  },
  {
    question: 'Por que crear una cuenta?',
    answer: 'Crear una cuenta es opcional pero te da acceso al programa de fidelizacion de MauLu. Acumula puntos con cada compra, desbloquea recompensas, accede a descuentos exclusivos en peluqueria y recibe ofertas antes que nadie. Es gratis y vale la pena!'
  },
  {
    question: 'Cuales son los metodos de pago?',
    answer: 'Aceptamos tarjetas de credito y debito, transferencia bancaria y efectivo. Todos los pagos son procesados de forma segura.'
  },
  {
    question: 'Como funciona el envio?',
    answer: 'Realizamos envios a toda CABA y parte del GBA. Las compras superiores a $75.000 tienen envio gratis. Para compras menores, el costo se calcula segun la zona.'
  },
  {
    question: 'Puedo devolver un producto?',
    answer: 'Si, aceptamos devoluciones dentro de los 30 dias de recibido el producto, siempre que este en su estado original y con el embalaje intacto.'
  },
]

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-medium text-gray-800 text-base">{question}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <p className="pb-5 text-gray-500 text-sm leading-relaxed">{answer}</p>
      )}
    </div>
  )
}

const SectionBlock = ({ iconColor, label, subtitle, bgColor, borderColor, children, link, linkLabel }) => (
  <section className="py-14">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className={`w-1 h-10 ${iconColor} rounded-full`} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">{subtitle}</p>
            <h2 className="text-2xl font-bold text-gray-900">{label}</h2>
          </div>
        </div>
        {link && (
          <Link to={link} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors border-b border-gray-300 hover:border-gray-700 pb-0.5">
            {linkLabel || 'Ver todos'}
          </Link>
        )}
      </div>
      <div className={`${bgColor} ${borderColor} border rounded-2xl p-6`}>
        {children}
      </div>
    </div>
  </section>
)

const Skeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
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

  const renderProducts = (products, emptyMsg) => {
    if (loading) return <Skeleton />
    if (products.length === 0) return (
      <p className="text-center py-10 text-gray-400 text-sm">{emptyMsg}</p>
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
    <div className="bg-white">
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OffersSlider />
      </div>

      <SectionBlock
        iconColor="bg-red-500"
        subtitle="Descuentos activos"
        label="Ofertas"
        bgColor="bg-red-50/50"
        borderColor="border-red-100"
        link="/menu?filter=ofertas"
        linkLabel="Ver todas las ofertas"
      >
        {renderProducts(offerProducts, 'No hay productos en oferta por el momento.')}
      </SectionBlock>

      <div className="border-t border-gray-100" />

      <SectionBlock
        iconColor="bg-purple-500"
        subtitle="Promociones especiales"
        label="2 x 1"
        bgColor="bg-purple-50/50"
        borderColor="border-purple-100"
        link="/menu?filter=2x1"
        linkLabel="Ver todos los 2x1"
      >
        {renderProducts(products2x1, 'No hay productos 2x1 disponibles por el momento.')}
      </SectionBlock>

      <div className="border-t border-gray-100" />

      <SectionBlock
        iconColor="bg-blue-500"
        subtitle="Directo del exterior"
        label="Importados"
        bgColor="bg-blue-50/50"
        borderColor="border-blue-100"
        link="/menu?filter=importados"
        linkLabel="Ver todos los importados"
      >
        {renderProducts(importedProducts, 'No hay productos importados disponibles por el momento.')}
      </SectionBlock>

      <div className="border-t border-gray-100" />

      {(loading || featuredProducts.length > 0) && (
        <SectionBlock
          iconColor="bg-amber-400"
          subtitle="Los mas elegidos"
          label="Destacados"
          bgColor="bg-amber-50/30"
          borderColor="border-amber-100"
          link="/menu"
          linkLabel="Ver todos los productos"
        >
          {loading ? <Skeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} allProducts={allProducts} />
              ))}
            </div>
          )}
        </SectionBlock>
      )}

      {/* Marcas */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Nuestros proveedores</p>
            <h2 className="text-2xl font-bold text-gray-900">Marcas con las que trabajamos</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {brands.map(brand => (
              <div key={brand.name} className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 text-center border border-gray-100">
                <div className={`w-12 h-12 bg-gradient-to-br ${brand.color} rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-bold text-sm">{brand.initials}</span>
                </div>
                <h3 className="font-medium text-gray-700 text-xs">{brand.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Ayuda</p>
            <h2 className="text-2xl font-bold text-gray-900">Preguntas frecuentes</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 px-6 divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🚚', title: 'Envio Gratis', desc: 'En compras superiores a $75.000 - Toda CABA y parte de GBA' },
              { icon: '📱', title: 'Tecnologia Wi-Fi', desc: 'Comederos automaticos con control desde tu smartphone' },
              { icon: '💝', title: 'Calidad Premium', desc: 'Productos seleccionados para el bienestar de tu mascota' },
            ].map(f => (
              <div key={f.title}>
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
