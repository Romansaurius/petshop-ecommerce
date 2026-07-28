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
    if (searchFromUrl) setSearchTerm(searchFromUrl)
  }, [searchParams])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        const data = await response.json()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error('Error cargando productos:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadBrands = async () => {
      try {
        const response = await fetch('/api/products/brands')
        const data = await response.json()
        setBrands([{ id: 0, nombre: 'todas' }, ...data])
      } catch (error) {
        console.error('Error cargando marcas:', error)
      }
    }

    loadProducts()
    loadBrands()
  }, [])

  useEffect(() => {
    let filtered = products

    if (selectedCategory === 'ofertas') {
      filtered = filtered.filter(p => (p.descuento_porcentaje || p.discount || 0) >= 40 || p.tipo === '2x1')
        .sort((a, b) => (b.descuento_porcentaje || b.discount || 0) - (a.descuento_porcentaje || a.discount || 0))
    } else if (selectedCategory === 'importados') {
      filtered = filtered.filter(p => p.tipo === 'importado')
    } else if (selectedCategory !== 'todos') {
      filtered = filtered.filter(p =>
        (p.categoria || p.category || '') === selectedCategory
      )
    }

    if (selectedBrand !== 'todas') {
      filtered = filtered.filter(p => (p.marca || p.brand) === selectedBrand)
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        (p.nombre || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion || p.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.marca || p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return (a.precio || a.price || 0) - (b.precio || b.price || 0)
      if (sortBy === 'price-desc') return (b.precio || b.price || 0) - (a.precio || a.price || 0)
      if (sortBy === 'featured') return ((b.destacado || b.featured) ? 1 : 0) - ((a.destacado || a.featured) ? 1 : 0)
      return (a.nombre || a.name || '').localeCompare(b.nombre || b.name || '')
    })

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedBrand, sortBy, searchTerm])

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-secondary-500">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="py-8 bg-gradient-to-b from-secondary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Catálogo</p>
          <div className="flex items-end justify-between">
            <h1 className="text-3xl font-bold text-secondary-800">Productos para mascotas</h1>
            <span className="text-sm text-secondary-400">{filteredProducts.length} productos</span>
          </div>
        </div>

        {/* Controles: búsqueda + marca + orden + vista */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm"
          />

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-3 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm min-w-[160px]"
          >
            {brands.map(brand => (
              <option key={brand.id} value={brand.nombre}>
                {brand.nombre === 'todas' ? 'Todas las marcas' : brand.nombre}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm min-w-[180px]"
          >
            <option value="name">Nombre A-Z</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="featured">Destacados primero</option>
          </select>

          <div className="flex bg-white border-2 border-secondary-200 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-secondary-600 hover:bg-secondary-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-secondary-600 hover:bg-secondary-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grilla de productos */}
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
          : 'space-y-4'
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

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-secondary-400 text-lg mb-4">No se encontraron productos</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('todos'); setSelectedBrand('todas') }}
              className="btn btn-primary"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu
