import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Heart, User, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Todos', value: 'todos', icon: '🐾', href: '/menu' },
    { name: 'Comederos', value: 'comederos', icon: '🍽️', href: '/menu?category=comederos' },
    { name: 'Juguetes', value: 'juguetes', icon: '🎾', href: '/menu?category=juguetes' },
    { name: 'Camas', value: 'camas', icon: '🛏️', href: '/menu?category=camas' },
    { name: 'Collares', value: 'collares', icon: '🦴', href: '/menu?category=collares' },
    { name: 'Rascadores', value: 'rascadores', icon: '🪜', href: '/menu?category=rascadores' },
    { name: 'Accesorios', value: 'accesorios', icon: '🎒', href: '/menu?category=accesorios' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-secondary-100 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>🚚 Envío GRATIS en compras superiores a $100.000</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-lg">
              <span className="text-white font-bold text-2xl">🐾</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-secondary-800 group-hover:text-primary-600 transition-colors">MauLu</span>
              <span className="text-xs text-secondary-500 -mt-1">PetShop</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos para tu mascota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-secondary-50 hover:bg-white"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-secondary-400" />
              <button 
                type="submit"
                className="absolute right-2 top-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg transition-colors text-sm font-medium"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Mobile */}
            <button className="md:hidden p-2 text-secondary-600 hover:text-primary-500 transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                  <User className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">Hola, {user?.name}</span>
                </div>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="p-2 text-secondary-600 hover:text-primary-500 transition-colors">
                    ⚙️
                  </Link>
                )}
                <button onClick={logout} className="text-sm text-secondary-600 hover:text-primary-500 transition-colors">
                  Salir
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login" className="flex items-center space-x-1 px-3 py-1.5 text-secondary-600 hover:text-primary-500 transition-colors rounded-lg hover:bg-primary-50">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Entrar</span>
                </Link>
                <Link to="/register" className="flex items-center space-x-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  <span className="text-sm font-medium">Registro</span>
                </Link>
              </div>
            )}

            {/* Cart */}
            <Link to="/checkout" className="relative group">
              <div className="flex items-center space-x-2 px-3 py-2 bg-secondary-100 hover:bg-primary-50 rounded-xl transition-all duration-200 group-hover:scale-105">
                <ShoppingCart className="h-5 w-5 text-secondary-600 group-hover:text-primary-600" />
                <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-700">
                  {getTotalItems() > 0 ? `${getTotalItems()}` : '0'}
                </span>
              </div>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-secondary-600 hover:text-primary-500 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex space-x-1 py-4 border-t border-secondary-100 overflow-x-auto">
          {categories.map((category) => {
            const isActive = location.pathname === '/menu' && 
              (new URLSearchParams(location.search).get('category') === category.value || 
               (!new URLSearchParams(location.search).get('category') && category.value === 'todos'));
            
            return (
              <Link
                key={category.value}
                to={category.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive 
                    ? 'bg-primary-500 text-white shadow-lg transform scale-105' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-secondary-100 animate-slide-up">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.value}
                  to={category.href}
                  className="flex items-center space-x-3 py-3 px-4 text-secondary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-secondary-100 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-primary-50 rounded-lg">
                    <User className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-primary-700">Hola, {user?.name}</span>
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center space-x-2 p-3 text-secondary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                      <span>⚙️</span>
                      <span>Panel Admin</span>
                    </Link>
                  )}
                  <button onClick={logout} className="w-full text-left p-3 text-secondary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="flex items-center space-x-2 p-3 text-secondary-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                    <User className="h-5 w-5" />
                    <span>Iniciar Sesión</span>
                  </Link>
                  <Link to="/register" className="flex items-center space-x-2 p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                    <span>Crear Cuenta</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;