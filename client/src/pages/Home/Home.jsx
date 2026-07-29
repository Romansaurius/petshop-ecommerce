import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import Hero from '../../components/Hero/Hero'
import OffersSlider from '../../components/OffersSlider/OffersSlider'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

const faqs = [
  { question: '¿Cómo realizo una compra?', answer: 'Navegá por nuestro catálogo, elegí los productos y agregalos al carrito. Luego completá tus datos de contacto y elegí el método de pago.' },
  { question: '¿Por qué crear una cuenta?', answer: 'Crear una cuenta te da acceso al programa de fidelización. Acumulá puntos con cada compra, desbloqueá recompensas y accedé a descuentos exclusivos.' },
  { question: '¿Cuáles son los métodos de pago?', answer: 'Aceptamos tarjetas de crédito y débito a través de Mercado Pago. Todos los pagos son procesados de forma segura.' },
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

const SectionHeader = ({ eyebrow, title, link, linkLabel }) => (
  <div className="flex items-end justify-between mb-5 sm:mb-8">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-0.5 h-6 sm:h-8 bg-primary-400 rounded-full" />
      <div>
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-secondary-400 mb-0.5">{eyebrow}</p>
        <h2 className="text-lg sm:text-xl font-semibold text-secondary-800">{title}</h2>
      </div>
    </div>
    {link && (
      <Link to={link} className="text-xs font-medium text-secondary-400 hover:text-secondary-700 transition-colors border-b border-secondary-200 hover:border-secondary-500 pb-0.5 shrink-0 ml-2">
        {linkLabel || 'Ver todos'}
      </Link>
    )}
  </div>
)

const SkeletonSlider = () => (
  <div className="flex gap-5 overflow-hidden">
    {[...Array(4)].map((_, i) => <div key={i} className="bg-secondary-100 rounded-2xl h-72 w-56 shrink-0 animate-pulse" />)}
  </div>
)

const ProductSlider = ({ products, loading, emptyMsg, allProducts, addToCart }) => {
  const ref = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const checkScroll = () => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = ref.current
    if (el) el.addEventListener('scroll', checkScroll, { passive: true })
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [products])

  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 280, behavior: 'smooth' })

  if (loading) return <SkeletonSlider />
  if (!products.length) return <p className="text-center py-10 text-secondary-400 text-sm">{emptyMsg}</p>

  return (
    <div className="relative">
      {canLeft && (
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-secondary-200 shadow-md rounded-full p-1.5 sm:p-2 hover:bg-secondary-50 transition-colors sm:-translate-x-4 hidden sm:flex">
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-secondary-200 shadow-md rounded-full p-1.5 sm:p-2 hover:bg-secondary-50 transition-colors sm:translate-x-4 hidden sm:flex">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />
        </button>
      )}
      <div ref={ref} className="flex gap-3 sm:gap-5 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {products.map(p => (
          <div key={p.id} className="shrink-0 w-44 sm:w-56">
            <ProductCard product={p} onAddToCart={addToCart} allProducts={allProducts} />
          </div>
        ))}
      </div>
    </div>
  )
}

const Home = () => {
  const [allProducts, setAllProducts] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/sections').then(r => r.json()).catch(() => [])
    ]).then(([prods, secs]) => {
      setAllProducts(Array.isArray(prods) ? prods : [])
      setSections(Array.isArray(secs) ? secs : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getSectionProducts = (clave, fallback) => {
    const sec = sections.find(s => s.clave === clave)
    if (sec && sec.productos && sec.productos.length > 0) return sec.productos
    return fallback
  }

  const promos2x1 = allProducts.filter(p => p.tipo === '2x1')
  const promos50  = allProducts.filter(p => (p.descuento_porcentaje || 0) >= 50)

  const lanzamientosFallback = allProducts.filter(p => p.promo_lanzamiento).slice(0, 10)
  const lanzamientos = getSectionProducts('lanzamientos', lanzamientosFallback)

  const naturalFallback = allProducts
    .filter(p => ['snacks', 'premios', 'natural', 'mordedor'].some(k => (p.categoria || '').toLowerCase().includes(k)))
    .slice(0, 10)
  const naturalProducts = getSectionProducts('natural', naturalFallback.length ? naturalFallback : allProducts.slice(0, 10))

  const camasFallback = allProducts.filter(p => (p.categoria || '').toLowerCase().includes('cama')).slice(0, 10)
  const camas = getSectionProducts('camas', camasFallback)

  const juguetesFallback = allProducts.filter(p => (p.categoria || '').toLowerCase().includes('juguete')).slice(0, 10)
  const juguetes = getSectionProducts('juguetes', juguetesFallback)

  const destacadosFallback = allProducts.filter(p => p.destacado || p.featured).slice(0, 10)
  const destacados = getSectionProducts('destacados', destacadosFallback)

  return (
    <div className="bg-white">
      <Hero />

      {/* Slider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OffersSlider />
      </div>

      {/* ── 1. LANZAMIENTOS EXCLUSIVOS ── */}
      <section className="py-8 sm:py-14 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Promos de lanzamiento"
            title="Lanzamientos Exclusivos"
            link="/menu?filter=ofertas"
            linkLabel="Ver ofertas"
          />
          <ProductSlider
            products={lanzamientos}
            loading={loading}
            emptyMsg="Próximamente nuevas promociones de lanzamiento."
            allProducts={allProducts}
            addToCart={addToCart}
          />
          <p className="text-sm text-secondary-500 mt-8 max-w-xl leading-relaxed">
            Aprovechá las ofertas de tiempo limitado por apertura. Descuentos únicos en productos seleccionados para que conozcas todo lo que tenemos para tu mascota.
          </p>
        </div>
      </section>

      {/* ── 2. SELECCIÓN NATURAL ── */}
      <section className="py-8 sm:py-14 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Snacks · Premios · Mordedores · Nutrición premium"
            title="Nuestra Selección Natural"
            link="/menu?category=Snacks Naturales"
            linkLabel="Ver todos"
          />
          <ProductSlider
            products={naturalProducts}
            loading={loading}
            emptyMsg="Próximamente nuestra selección de productos naturales."
            allProducts={allProducts}
            addToCart={addToCart}
          />
          <p className="text-sm text-secondary-500 mt-8 max-w-xl leading-relaxed">
            Cuidar su alimentación también es una forma de demostrar amor. Descubrí productos seleccionados por su calidad, ingredientes naturales y beneficios para el bienestar diario de perros y gatos.
          </p>
        </div>
      </section>

      {/* ── 3. CAMAS PREMIUM ── */}
      <section className="py-8 sm:py-14 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Descanso y confort"
            title="El descanso que se merece"
            link="/menu?category=camas"
            linkLabel="Ver camas"
          />
          {loading ? <SkeletonSlider /> : camas.length > 0 ? (
            <ProductSlider products={camas} loading={false} emptyMsg="" allProducts={allProducts} addToCart={addToCart} />
          ) : (
            <div className="bg-white border border-secondary-100 rounded-2xl p-10 text-center">
              <p className="text-secondary-500 text-sm">Próximamente nuestra selección de camas premium.</p>
              <Link to="/menu" className="btn btn-primary mt-4 text-sm">Ver todos los productos</Link>
            </div>
          )}
          <p className="text-sm text-secondary-500 mt-8 max-w-xl leading-relaxed">
            Porque después de jugar, explorar y compartir momentos únicos, también necesitan un lugar cómodo para descansar y recargar energías.
          </p>
        </div>
      </section>

      {/* ── 4. JUGUETES ── */}
      <section className="py-8 sm:py-14 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Estimulación · Entretenimiento · Diversión"
            title="Ideales para los más juguetones"
            link="/menu?category=juguetes"
            linkLabel="Ver juguetes"
          />
          {loading ? <SkeletonSlider /> : juguetes.length > 0 ? (
            <ProductSlider products={juguetes} loading={false} emptyMsg="" allProducts={allProducts} addToCart={addToCart} />
          ) : (
            <div className="bg-white border border-secondary-100 rounded-2xl p-10 text-center">
              <p className="text-secondary-500 text-sm">Próximamente nuestra selección de juguetes premium.</p>
              <Link to="/menu" className="btn btn-primary mt-4 text-sm">Ver todos los productos</Link>
            </div>
          )}
          <p className="text-sm text-secondary-500 mt-8 max-w-xl leading-relaxed">
            Estimulación mental, entretenimiento y momentos inolvidables para todas las edades y personalidades.
          </p>
        </div>
      </section>

      {/* ── 5. PRODUCTOS DESTACADOS ── */}
      {(loading || destacados.length > 0) && (
        <section className="py-8 sm:py-14 bg-secondary-50 border-t border-secondary-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Lo mejor de nuestra tienda"
              title="Productos Destacados"
              link="/menu"
              linkLabel="Ver todos"
            />
            <ProductSlider
              products={destacados}
              loading={loading}
              emptyMsg=""
              allProducts={allProducts}
              addToCart={addToCart}
            />
            <p className="text-sm text-secondary-500 mt-8 max-w-xl leading-relaxed">
              Los favoritos de nuestros clientes. Productos cuidadosamente seleccionados por calidad, popularidad y el amor que les tienen nuestras mascotas. Descubrí lo que hace especial a cada uno.
            </p>
          </div>
        </section>
      )}

      {/* ── BENEFICIOS ── */}
      <section className="py-14 bg-secondary-50 border-t border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { emoji: '🚚', title: 'Envíos rápidos y seguros', desc: 'Entrega confiable a Malvinas Argentinas, Pilar, San Isidro y alrededores. Envío gratis a partir de $35.000.' },
              { emoji: '🌿', title: 'Alimentación Natural', desc: 'Productos cuidadosamente seleccionados para ofrecer ingredientes naturales, bienestar y una alimentación de calidad para perros y gatos.' },
              { emoji: '🛏️', title: 'Comodidad y Diversión', desc: 'Encontrá camas premium, juguetes y accesorios pensados para acompañar cada etapa de la vida de tu mascota con calidad y amor.' },
            ].map(f => (
              <div key={f.title}>
                <div className="w-12 h-12 bg-white border border-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl shadow-sm">
                  {f.emoji}
                </div>
                <h3 className="font-semibold text-secondary-800 mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-secondary-500 leading-relaxed max-w-xs mx-auto">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 border-t border-secondary-100">
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
