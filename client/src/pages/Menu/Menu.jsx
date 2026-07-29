import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import { Grid, List } from 'lucide-react'

const Menu = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedBrand, setSelectedBrand] = useState('todas')
  const [sortBy, setSortBy] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const { addToCart } = useCart()

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    const filterFromUrl = searchParams.get('filter')
    const searchFromUrl = searchParams.get('search')
    if (filterFromUrl) setSelectedCategory(filterFromUrl)
    else if (categoryFromUrl) setSelectedCategory(categoryFromUrl)
    else setSelectedCategory('todos')
    if (searchFromUrl) setSearchTerm(searchFromUrl)
  }, [searchParams])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await fetch('/api/products').then(r => r.json())
        setProducts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    const loadBrands = async () => {
      try {
        const data = await fetch('/api/products/brands').then(r => r.json())
        setBrands([{ id: 0, nombre: 'todas' }, ...data])
      } catch (e) {}
    }
    loadProducts()
    loadBrands()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    if (selectedCategory === 'ofertas') {
      filtered = filtered.filter(p => p.promo_lanzamiento)
    } else if (selectedCategory === 'importados') {
      filtered = filtered.filter(p => p.tipo === 'importado')
    } else if (selectedCategory !== 'todos') {
      filtered = filtered.filter(p =>
        (p.categoria || p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (selectedBrand !== 'todas') {
      filtered = filtered.filter(p => (p.marca || p.brand) === selectedBrand)
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        (p.nombre || p.name || '').toLowerCase().includes(q) ||
        (p.descripcion || p.description || '').toLowerCase().includes(q) ||
        (p.marca || p.brand || '').toLowerCase().includes(q)
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.precio || 0) - (b.precio || 0)
      if (sortBy === 'price-desc') return (b.precio || 0) - (a.precio || 0)
      if (sortBy === 'discount') {
        const da = a.tipo === '2x1' ? 999 : (a.descuento_porcentaje || 0)
        const db = b.tipo === '2x1' ? 999 : (b.descuento_porcentaje || 0)
        return db - da
      }
      if (sortBy === 'featured') return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0)
      return (a.nombre || '').localeCompare(b.nombre || '')
    })

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedBrand, sortBy, searchTerm])

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-secondary-500 text-sm">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="py-6 bg-gradient-to-b from-secondary-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary-400 mb-0.5">Catálogo</p>
          <div className="flex items-end justify-between">
            <h1 className="text-2xl font-bold text-secondary-800">Productos</h1>
            <span className="text-xs text-secondary-400">{filteredProducts.length} resultados</span>
          </div>
        </div>

        {/* Controles */}
        <div className="space-y-2 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
          />

          <div className="flex gap-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2.5 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
            >
              {brands.map(b => (
                <option key={b.id} value={b.nombre}>
                  {b.nombre === 'todas' ? 'Todas las marcas' : b.nombre}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2.5 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
            >
              <option value="name">Nombre A-Z</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="discount">Mayor descuento</option>
              <option value="featured">Destacados</option>
            </select>

            <div className="flex bg-white border-2 border-secondary-200 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-secondary-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-secondary-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grilla */}
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'
          : 'space-y-3'
        }>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              viewMode={viewMode}
              allProducts={products}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-secondary-400 mb-4">No se encontraron productos</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('todos'); setSelectedBrand('todas'); }}
              className="btn btn-primary"
            >
              Ver todos
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu
