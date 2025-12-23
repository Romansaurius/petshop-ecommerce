import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import { Filter, Grid, List, Star, TrendingUp } from 'lucide-react'

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
    const searchFromUrl = searchParams.get('search')
    
    if (categoryFromUrl) {
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

    if (selectedCategory !== 'todos') {
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
    return categories.map(cat => ({
      ...cat,
      count: cat.nombre === 'todos' 
        ? products.length 
        : products.filter(p => (p.categoria || p.category) === cat.nombre).length
    }))
  }

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'todos': '🐾',
      'comederos': '🍽️',
      'juguetes': '🎾',
      'camas': '🛏️',
      'collares': '🦴',
      'rascadores': '🪜',
      'accesorios': '🎒',
      'alimentos': '🥘',
      'higiene': '🧼',
      'salud': '💊'
    }
    return icons[categoryName] || '📦'
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="text-6xl mb-4">🐾</div>
        <p className="text-xl text-secondary-600">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="py-8 bg-gradient-to-b from-secondary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-4">
            🐾 Productos para Mascotas
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Encuentra todo lo que tu mascota necesita para ser feliz y saludable
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-secondary-500">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>{products.length} productos disponibles</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Calidad premium garantizada</span>
            </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {getCategoryStats().map(category => (
                <button
                  key={category.id}
                  className={`flex flex-col items-center p-4 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category.nombre
                      ? 'bg-primary-500 text-white shadow-lg transform scale-105'
                      : 'bg-secondary-50 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 hover:scale-105'
                  }`}
                  onClick={() => setSelectedCategory(category.nombre)}
                >
                  <span className="text-2xl mb-2">{getCategoryIcon(category.nombre)}</span>
                  <span className="text-sm capitalize">{category.nombre}</span>
                  <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                    selectedCategory === category.nombre
                      ? 'bg-white/20 text-white'
                      : 'bg-secondary-200 text-secondary-600'
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
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-secondary-700 mb-4">
              No se encontraron productos
            </h3>
            <p className="text-lg text-secondary-500 mb-8 max-w-md mx-auto">
              Intenta con otros términos de búsqueda o explora diferentes categorías
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('todos')
                setSelectedBrand('todas')
              }}
              className="btn btn-primary px-8 py-3"
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