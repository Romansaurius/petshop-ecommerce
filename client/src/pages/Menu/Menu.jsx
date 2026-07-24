import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import { Filter, Grid, List } from 'lucide-react'

const Menu = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedBrand, setSelectedBrand] = useState('todas')
  const [sortBy, setSortBy] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const { addToCart } = useCart()

  // Obtener parámetros de URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    const filterFromUrl = searchParams.get('filter')
    const searchFromUrl = searchParams.get('search')
    
    if (filterFromUrl) {
      setSelectedCategory(filterFromUrl)
    } else if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])

  // Cargar productos desde la base de datos
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

    const loadCategories = async () => {
      try {
        const response = await fetch('/api/products/categories')
        const data = await response.json()
        setCategories([{ id: 0, nombre: 'todos' }, ...data])
      } catch (error) {
        console.error('Error cargando categorías:', error)
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
    loadCategories()
    loadBrands()
  }, [])

  useEffect(() => {
    let filtered = products

    if (selectedCategory === 'ofertas') {
      filtered = filtered.filter(p => (p.descuento_porcentaje || p.discount || 0) > 0)
        .sort((a, b) => (b.descuento_porcentaje || b.discount || 0) - (a.descuento_porcentaje || a.discount || 0))
    } else if (selectedCategory === '2x1') {
      filtered = filtered.filter(p => p.tipo === '2x1')
    } else if (selectedCategory === 'importados') {
      filtered = filtered.filter(p => p.tipo === 'importado')
    } else if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => 
        (product.categoria || product.category) === selectedCategory
      )
    }

    if (selectedBrand !== 'todas') {
      filtered = filtered.filter(product => 
        (product.marca || product.brand) === selectedBrand
      )
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        (product.nombre || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.descripcion || product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.marca || product.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.precio || a.price || 0) - (b.precio || b.price || 0)
      if (sortBy === 'price-desc') return (b.precio || b.price || 0) - (a.precio || a.price || 0)
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'featured') return ((b.destacado || b.featured) ? 1 : 0) - ((a.destacado || a.featured) ? 1 : 0)
      return (a.nombre || a.name || '').localeCompare(b.nombre || b.name || '')
    })

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedBrand, sortBy, searchTerm])

  const getCategoryStats = () => {
    const specialCats = [
      { id: 'ofertas', nombre: 'ofertas', count: products.filter(p => (p.descuento_porcentaje || p.discount || 0) > 0).length },
      { id: '2x1', nombre: '2x1', count: products.filter(p => p.tipo === '2x1').length },
      { id: 'importados', nombre: 'importados', count: products.filter(p => p.tipo === 'importado').length },
    ]
    const normalCats = categories.map(cat => ({
      ...cat,
      count: cat.nombre === 'todos'
        ? products.length
        : products.filter(p => (p.categoria || p.category) === cat.nombre).length
    }))
    return [...normalCats, ...specialCats]
  }

  const getCategoryLabel = (name) => {
    const labels = { 'todos': 'Todos', 'ofertas': 'Ofertas', '2x1': '2 x 1', 'importados': 'Importados', 'snacks': 'Mordedores y Snacks Naturales' }
    return labels[name] || name.charAt(0).toUpperCase() + name.slice(1)
  }

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
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Catálogo</p>
          <div className="flex items-end justify-between">
            <h1 className="text-3xl font-bold text-secondary-800">Productos para mascotas</h1>
            <span className="text-sm text-secondary-400">{products.length} productos</span>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-8 space-y-6">
          {/* Search, Sort and Brand Filter */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-4 py-4 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm min-w-[150px]"
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
                className="px-4 py-4 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm min-w-[200px]"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="rating">Mejor valorados</option>
                <option value="featured">Destacados</option>
              </select>
              
              <div className="flex bg-white border-2 border-secondary-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-secondary-100">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-secondary-600" />
              <h3 className="text-lg font-semibold text-secondary-800">Categorías</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {getCategoryStats().map(category => (
                <button
                  key={category.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
                    selectedCategory === category.nombre
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-secondary-50 text-secondary-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                  onClick={() => setSelectedCategory(category.nombre)}
                >
                  <span>{getCategoryLabel(category.nombre)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === category.nombre
                      ? 'bg-white/20 text-white'
                      : 'bg-secondary-200 text-secondary-500'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
        }`}>
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

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-6 h-6 text-secondary-400" />
            </div>
            <h3 className="text-xl font-bold text-secondary-700 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-secondary-500 mb-6 max-w-sm mx-auto text-sm">
              Intenta con otros términos de búsqueda o explorá diferentes categorías
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('todos')
                setSelectedBrand('todas')
              }}
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