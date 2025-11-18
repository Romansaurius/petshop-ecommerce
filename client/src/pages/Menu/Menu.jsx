import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/Product/ProductCard'
import { Filter, Grid, List, Star, TrendingUp } from 'lucide-react'

const Menu = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [sortBy, setSortBy] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
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

  useEffect(() => {
    // Productos para mascotas con imágenes reales
    const petProducts = [
      {
        id: 1,
        name: 'Comedero Automático Wi-Fi Premium',
        price: 89999,
        category: 'comederos',
        description: 'Comedero automático con Wi-Fi, capacidad 2.5L, control por app móvil',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop',
        rating: 4.8,
        reviews: 124,
        featured: true,
        discount: 15
      },
      {
        id: 2,
        name: 'Comedero Automático Wi-Fi Básico',
        price: 59999,
        category: 'comederos',
        description: 'Comedero automático con Wi-Fi básico, capacidad 1.8L',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=500&fit=crop',
        rating: 4.5,
        reviews: 89,
        featured: true
      },
      {
        id: 3,
        name: 'Juguete Interactivo Pelota LED',
        price: 15999,
        category: 'juguetes',
        description: 'Pelota interactiva con luces LED y sonidos para perros',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop',
        rating: 4.7,
        reviews: 156,
        discount: 20
      },
      {
        id: 4,
        name: 'Cama Ortopédica Premium',
        price: 45999,
        category: 'camas',
        description: 'Cama ortopédica con memoria viscoelástica para perros grandes',
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=500&fit=crop',
        rating: 4.9,
        reviews: 78
      },
      {
        id: 5,
        name: 'Collar GPS Inteligente',
        price: 35999,
        category: 'collares',
        description: 'Collar con GPS y monitor de actividad para mascotas',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop',
        rating: 4.6,
        reviews: 92,
        featured: true
      },
      {
        id: 6,
        name: 'Rascador Torre Gigante',
        price: 28999,
        category: 'rascadores',
        description: 'Torre rascadora de 1.5m con múltiples niveles para gatos',
        image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500&h=500&fit=crop',
        rating: 4.4,
        reviews: 67
      },
      {
        id: 7,
        name: 'Transportadora Aérea',
        price: 22999,
        category: 'accesorios',
        description: 'Transportadora aprobada para viajes aéreos, tamaño mediano',
        image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=500&h=500&fit=crop',
        rating: 4.3,
        reviews: 45
      },
      {
        id: 8,
        name: 'Fuente de Agua Automática',
        price: 18999,
        category: 'comederos',
        description: 'Fuente de agua con filtro y circulación continua',
        image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=500&fit=crop',
        rating: 4.7,
        reviews: 103,
        discount: 10
      },
      {
        id: 9,
        name: 'Juguete Cuerda Natural',
        price: 8999,
        category: 'juguetes',
        description: 'Cuerda de algodón natural para perros, ideal para jugar y limpiar dientes',
        image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=500&fit=crop',
        rating: 4.2,
        reviews: 234
      },
      {
        id: 10,
        name: 'Cama Térmica para Gatos',
        price: 32999,
        category: 'camas',
        description: 'Cama con calefacción suave para gatos, perfecta para invierno',
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop',
        rating: 4.8,
        reviews: 56,
        featured: true
      },
      {
        id: 11,
        name: 'Collar Antipulgas Natural',
        price: 12999,
        category: 'collares',
        description: 'Collar con aceites esenciales naturales, repele pulgas y garrapatas',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop',
        rating: 4.1,
        reviews: 189
      },
      {
        id: 12,
        name: 'Rascador Compacto',
        price: 15999,
        category: 'rascadores',
        description: 'Rascador vertical compacto, ideal para espacios pequeños',
        image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&h=500&fit=crop',
        rating: 4.5,
        reviews: 98
      },
      {
        id: 13,
        name: 'Hueso de Juguete XXL',
        price: 6999,
        category: 'juguetes',
        description: 'Hueso de goma resistente para perros grandes, ayuda con la dentición',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=500&fit=crop',
        rating: 4.3,
        reviews: 167
      },
      {
        id: 14,
        name: 'Cama Redonda Suave',
        price: 24999,
        category: 'camas',
        description: 'Cama redonda ultra suave, perfecta para perros y gatos pequeños',
        image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=500&h=500&fit=crop',
        rating: 4.6,
        reviews: 89
      },
      {
        id: 15,
        name: 'Collar LED Recargable',
        price: 18999,
        category: 'collares',
        description: 'Collar LED recargable por USB, ideal para paseos nocturnos',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop',
        rating: 4.4,
        reviews: 134,
        discount: 25
      },
      {
        id: 16,
        name: 'Casa Rascador Deluxe',
        price: 45999,
        category: 'rascadores',
        description: 'Casa rascador con múltiples niveles, túneles y juguetes colgantes',
        image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=500&h=500&fit=crop',
        rating: 4.9,
        reviews: 43,
        featured: true
      }
    ]
    setProducts(petProducts)
    setFilteredProducts(petProducts)
  }, [])

  useEffect(() => {
    let filtered = products

    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      return a.name.localeCompare(b.name)
    })

    setFilteredProducts(filtered)
  }, [products, selectedCategory, sortBy, searchTerm])

  const categories = [
    { value: 'todos', label: 'Todos', icon: '🐾', count: products.length },
    { value: 'comederos', label: 'Comederos', icon: '🍽️', count: products.filter(p => p.category === 'comederos').length },
    { value: 'juguetes', label: 'Juguetes', icon: '🎾', count: products.filter(p => p.category === 'juguetes').length },
    { value: 'camas', label: 'Camas', icon: '🛏️', count: products.filter(p => p.category === 'camas').length },
    { value: 'collares', label: 'Collares', icon: '🦴', count: products.filter(p => p.category === 'collares').length },
    { value: 'rascadores', label: 'Rascadores', icon: '🪜', count: products.filter(p => p.category === 'rascadores').length },
    { value: 'accesorios', label: 'Accesorios', icon: '🎒', count: products.filter(p => p.category === 'accesorios').length }
  ]

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
          {/* Search and Sort */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos para tu mascota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="flex gap-3">
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
              {categories.map(category => (
                <button
                  key={category.value}
                  className={`flex flex-col items-center p-4 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category.value
                      ? 'bg-primary-500 text-white shadow-lg transform scale-105'
                      : 'bg-secondary-50 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 hover:scale-105'
                  }`}
                  onClick={() => setSelectedCategory(category.value)}
                >
                  <span className="text-2xl mb-2">{category.icon}</span>
                  <span className="text-sm">{category.label}</span>
                  <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                    selectedCategory === category.value
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