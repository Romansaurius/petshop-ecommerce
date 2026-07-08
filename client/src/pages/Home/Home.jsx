import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import Hero from '../../components/Hero/Hero'
import OffersSlider from '../../components/OffersSlider/OffersSlider'
import { ChevronDown, ChevronUp } from 'lucide-react'

const brands = [
  { initials: 'RC', name: 'Royal Canin' },
  { initials: 'HP', name: "Hill's Pet" },
  { initials: 'PR', name: 'Pro Plan' },
  { initials: 'EU', name: 'Eukanuba' },
  { initials: 'KG', name: 'Kong' },
  { initials: 'FL', name: 'Flexi' },
]

const faqs = [
  { question: '¿Cómo realizo una compra?', answer: 'Navegá por nuestro catálogo, elegí los productos y agregalos al carrito. Luego completá tus datos de contacto y elegí el método de pago.' },
  { question: '¿Por qué crear una cuenta?', answer: 'Crear una cuenta te da acceso al programa de fidelización. Acumulá puntos con cada compra, desbloqueá recompensas y accedé a descuentos exclusivos en peluquería.' },
  { question: '¿Cuáles son los métodos de pago?', answer: 'Aceptamos tarjetas de crédito y débito, transferencia bancaria y efectivo. Todos los pagos son procesados de forma segura.' },
  { question: '¿Cómo funciona el envío?', answer: 'Realizamos envíos a Malvinas Argentinas, Pilar, San Isidro y alrededores. Las compras superiores a $35.000 tienen envío gratis.' },
  { question: '¿Puedo devolver un producto?', answer: 'Sí, aceptamos devoluciones dentro de los 30 días de recibido el producto, siempre que esté en su estado original.' },
]

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-secondary-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-medium text-secondary-800 text-sm">{question}</span>
        {open ? <ChevronUp className="w-4 h-4 text-secondary-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-secondary-400 shrink-0" />}
      </button>
      {open && <p className="pb-5 text-secondary-500 text-sm leading-relaxed">{answer}</p>}
    </div>
  )
}

const SectionBlock = ({ accent, label, subtitle, children, link, linkLabel }) => (
  <section className="py-14">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-0.5 h-8 ${accent} rounded-full`} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-secondary-400 mb-0.5">{subtitle}</p>
            <h2 className="text-xl font-semibold text-secondary-800">{label}</h2>
          </div>
        </div>
        {link && (
          <Link to={link} className="text-xs font-medium text-secondary-400 hover:text-secondary-700 transition-colors border-b border-secondary-200 hover:border-secondary-500 pb-0.5">
            {linkLabel || 'Ver todos'}
          </Link>
        )}
      </div>
      {children}
    </div>
  </section>
)

const Skeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
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
      .then(r => r.json())
      .then(data => { setAllProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const offerProducts    = allProducts.filter(p => (p.descuento_porcentaje || 0) > 0).sort((a, b) => b.descuento_porcentaje - a.descuento_porcentaje).slice(0, 4)
  const products2x1      = allProducts.filter(p => p.tipo === '2x1').slice(0, 4)
  const importedProducts = allProducts.filter(p => p.tipo === 'importado').slice(0, 4)
  const featuredProducts = allProducts.filter(p => p.destacado).slice(0, 4)

  const renderGrid = (products, emptyMsg) => {
    if (loading) return <Skeleton />
    if (!products.length) return <p className="text-center py-10 text-secondary-400 text-sm">{emptyMsg}</p>
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} allProducts={allProducts} />)}
      </div>
    )
  }

  return (
    <div className="bg-white">
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OffersSlider />
      </div>

      <div className="border-t border-secondary-100" />

      <SectionBlock accent="bg-red-400" subtitle="Descuentos activos" label="Ofertas" link="/menu?filter=ofertas" linkLabel="Ver todas">
        {renderGrid(offerProducts, 'No hay productos en oferta por el momento.')}
      </SectionBlock>

      <div className="border-t border-secondary-100" />

      <SectionBlock accent="bg-primary-400" subtitle="Promociones especiales" label="2 × 1" link="/menu?filter=2x1" linkLabel="Ver todos">
        {renderGrid(products2x1, 'No hay productos 2x1 disponibles.')}
      </SectionBlock>

      <div className="border-t border-secondary-100" />

      <SectionBlock accent="bg-secondary-400" subtitle="Directo del exterior" label="Importados" link="/menu?filter=importados" linkLabel="Ver todos">
        {renderGrid(importedProducts, 'No hay productos importados disponibles.')}
      </SectionBlock>

      {(loading || featuredProducts.length > 0) && (
        <>
          <div className="border-t border-secondary-100" />
          <SectionBlock accent="bg-amber-400" subtitle="Los más elegidos" label="Destacados" link="/menu" linkLabel="Ver todos">
            {loading ? <Skeleton /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {featuredProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} allProducts={allProducts} />)}
              </div>
            )}
          </SectionBlock>
        </>
      )}

      {/* Marcas */}
      <section className="py-14 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-secondary-400 mb-2">Nuestros proveedores</p>
            <h2 className="text-xl font-semibold text-secondary-800">Marcas con las que trabajamos</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {brands.map(b => (
              <div key={b.name} className="bg-white rounded-2xl p-4 border border-secondary-100 text-center hover:border-primary-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-600 font-bold text-sm">{b.initials}</span>
                </div>
                <p className="text-xs font-medium text-secondary-600">{b.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-14 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { emoji: '🚚', title: 'Envío Gratis', desc: 'A partir de $35.000 · Malvinas Argentinas, Pilar, San Isidro y alrededores' },
              { emoji: '📱', title: 'Tecnología Wi-Fi', desc: 'Comederos automáticos con control desde tu smartphone' },
              { emoji: '✨', title: 'Calidad Premium', desc: 'Productos seleccionados para el bienestar de tu mascota' },
            ].map(f => (
              <div key={f.title}>
                <div className="w-12 h-12 bg-secondary-50 border border-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">
                  {f.emoji}
                </div>
                <h3 className="font-semibold text-secondary-800 mb-1 text-sm">{f.title}</h3>
                <p className="text-xs text-secondary-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-secondary-400 mb-2">Ayuda</p>
            <h2 className="text-xl font-semibold text-secondary-800">Preguntas frecuentes</h2>
          </div>
          <div className="bg-white rounded-2xl border border-secondary-100 px-6">
            {faqs.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
