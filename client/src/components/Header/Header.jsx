import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, Truck, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoyaltyCard from '../LoyaltyCard/LoyaltyCard';

const Header = ({ onOpenCart }) => {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoyalty, setShowLoyalty] = useState(false);

  const categories = [
    { name: 'Todos', value: 'todos', href: '/menu' },
    { name: 'Promos', value: 'ofertas', href: '/menu?filter=ofertas' },
    { name: 'Snacks Naturales', value: 'Snacks Naturales', href: '/menu?category=Snacks Naturales' },
    { name: 'Juguetes', value: 'juguetes', href: '/menu?category=juguetes' },
    { name: 'Comederos', value: 'comederos', href: '/menu?category=comederos' },
    { name: 'Accesorios', value: 'accesorios', href: '/menu?category=accesorios' },
    { name: 'Camas', value: 'camas', href: '/menu?category=camas' },
    { name: 'Rascadores', value: 'rascadores', href: '/menu?category=rascadores' },
    { name: 'Otros', value: 'otros', href: '/menu?category=otros' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const isActive = (cat) => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category') || params.get('filter');
    return location.pathname === '/menu' &&
      (catParam === cat.value || (!catParam && cat.value === 'todos'));
  };

  return (
    <header className="bg-white border-b border-secondary-100 sticky top-0 z-50">
      {/* Shipping bar */}
      <div className="bg-primary-500 text-white py-1.5">
        <div className="max-w-7xl mx-auto px-4 text-center flex items-center justify-center gap-2 text-xs font-medium">
          <Truck className="w-3 h-3 shrink-0" />
          <span>Envío gratis desde $35.000 · Zona Pilar y alrededores</span>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logosolo.png" alt="MauLu" className="w-8 h-8 object-contain" style={{ mixBlendMode: 'multiply' }} />
            <div className="flex flex-col leading-none">
              <span className="text-base font-semibold text-secondary-800 tracking-tight">MauLu</span>
              <span className="hidden sm:block text-[9px] text-secondary-400 tracking-widest uppercase">Amor canino actitud felina</span>
            </div>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop user actions */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => setShowLoyalty(true)} className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span className="font-medium">Puntos</span>
                </button>
                <Link to="/perfil" className="flex items-center gap-1 text-sm text-secondary-600 hover:text-primary-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user?.name}</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-xs text-secondary-500 hover:text-primary-600 border border-secondary-200 rounded-lg px-2 py-1">
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="text-xs text-secondary-400 hover:text-secondary-700">Salir</button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm text-secondary-600 hover:text-primary-600 font-medium">Entrar</Link>
                <Link to="/register" className="btn btn-primary py-1.5 px-3 text-xs">Registro</Link>
              </div>
            )}

            {/* Cart */}
            <button onClick={onOpenCart} className="relative flex items-center gap-1.5 px-3 py-2 bg-secondary-50 hover:bg-primary-50 border border-secondary-200 hover:border-primary-300 rounded-xl transition-all">
              <ShoppingCart className="w-4 h-4 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-700">{getTotalItems()}</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-secondary-600 hover:text-primary-600">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nav categorías — desktop: scrolleable horizontal */}
        <nav className="hidden md:flex gap-1 py-2 border-t border-secondary-100 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={cat.href}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive(cat)
                  ? 'bg-primary-500 text-white'
                  : 'text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-secondary-100">
          <div className="px-4 py-3 space-y-3">
            {/* Search mobile */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </form>

            {/* Categorías mobile — grid compacto */}
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((cat) => (
                <Link
                  key={cat.value}
                  to={cat.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-center py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                    isActive(cat)
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-50 text-secondary-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* User actions mobile */}
            <div className="pt-2 border-t border-secondary-100 space-y-1">
              {isAuthenticated ? (
                <>
                  <button onClick={() => { setShowLoyalty(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2 p-2.5 text-yellow-600 hover:bg-yellow-50 rounded-xl text-sm">
                    <Star className="w-4 h-4 fill-yellow-400" /><span>Mis Puntos</span>
                  </button>
                  <Link to="/perfil" onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 text-secondary-600 hover:bg-secondary-50 rounded-xl text-sm">
                    <User className="w-4 h-4" /><span>Mi perfil</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 text-secondary-600 hover:bg-secondary-50 rounded-xl text-sm">
                      <span>Panel Admin</span>
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left p-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}
                    className="flex-1 text-center py-2.5 border border-secondary-200 rounded-xl text-sm text-secondary-600 font-medium">
                    Iniciar sesión
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}
                    className="flex-1 text-center py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium">
                    Crear cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showLoyalty && <LoyaltyCard onClose={() => setShowLoyalty(false)} />}
    </header>
  );
};

export default Header;
