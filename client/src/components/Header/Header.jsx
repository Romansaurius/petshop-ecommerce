import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onOpenCart }) => {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'Todos', value: 'todos', href: '/menu' },
    { name: 'Comederos', value: 'comederos', href: '/menu?category=comederos' },
    { name: 'Juguetes', value: 'juguetes', href: '/menu?category=juguetes' },
    { name: 'Camas', value: 'camas', href: '/menu?category=camas' },
    { name: 'Collares', value: 'collares', href: '/menu?category=collares' },
    { name: 'Rascadores', value: 'rascadores', href: '/menu?category=rascadores' },
    { name: 'Accesorios', value: 'accesorios', href: '/menu?category=accesorios' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="bg-white border-b border-secondary-100 sticky top-0 z-50">
      {/* Shipping bar */}
      <div className="bg-primary-500 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 text-center flex items-center justify-center gap-2 text-xs font-medium tracking-wide">
          <Truck className="w-3.5 h-3.5" />
          <span>Envío gratis a partir de $35.000 · Zona Pilar y alrededores</span>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/logosolo.jpg" alt="MauLu" className="w-10 h-10 object-contain mix-blend-mode-multiply" style={{mixBlendMode:'multiply'}} />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-semibold text-secondary-800 tracking-tight">MauLu</span>
              <span className="text-[10px] text-secondary-400 tracking-widest uppercase">Amor canino actitud felina</span>
            </div>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/perfil" className="flex items-center gap-1.5 text-sm text-secondary-600 hover:text-primary-600 transition-colors">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user?.name}</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors border border-secondary-200 rounded-lg px-2.5 py-1.5">
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="text-xs text-secondary-400 hover:text-secondary-700 transition-colors">
                  Salir
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="text-sm text-secondary-600 hover:text-primary-600 transition-colors font-medium">
                  Entrar
                </Link>
                <Link to="/register" className="btn btn-primary py-2 px-4 text-xs">
                  Registro
                </Link>
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
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nav — desktop */}
        <nav className="hidden md:flex gap-1 py-3 border-t border-secondary-100">
          {categories.map((cat) => {
            const params = new URLSearchParams(location.search);
            const isActive = location.pathname === '/menu' &&
              (params.get('category') === cat.value || (!params.get('category') && cat.value === 'todos'));
            return (
              <Link
                key={cat.value}
                to={cat.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-secondary-100 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </form>

            <nav className="space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.value}
                  to={cat.href}
                  className="flex items-center py-2.5 px-3 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl text-sm font-medium transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-secondary-100 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-3 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl text-sm transition-colors">
                    <User className="w-4 h-4" /><span>Mi perfil</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-3 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl text-sm transition-colors">
                      <span>Panel Admin</span>
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left p-3 text-red-500 hover:bg-red-50 rounded-xl text-sm transition-colors">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-3 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl text-sm transition-colors">
                    <User className="w-4 h-4" /><span>Iniciar sesión</span>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-3 bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors hover:bg-primary-600">
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
