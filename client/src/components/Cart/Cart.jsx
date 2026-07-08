import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();

  const fmt = (p) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(p);

  if (!isOpen) return null;

  const FREE_SHIPPING = 35000;
  const total = getTotalPrice();
  const falta = FREE_SHIPPING - total;
  const pct = Math.min((total / FREE_SHIPPING) * 100, 100);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-500" />
            <h2 className="font-semibold text-secondary-800">Carrito ({getTotalItems()})</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-secondary-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-7 h-7 text-secondary-300" />
              </div>
              <p className="font-medium text-secondary-700 mb-1">Tu carrito está vacío</p>
              <p className="text-sm text-secondary-400 mb-6">Agregá productos para comenzar</p>
              <button onClick={onClose} className="btn btn-primary text-sm">Seguir comprando</button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.variante_id ? `${item.id}_${item.variante_id}` : item.id}
                  className="flex items-center gap-3 p-3 bg-secondary-50 rounded-xl">
                  <div className="w-14 h-14 bg-secondary-100 rounded-xl overflow-hidden shrink-0">
                    {item.imagen
                      ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-secondary-300 text-xl">🐾</div>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-800 truncate">
                      {item.nombre}
                      {item.talla && <span className="text-primary-500 ml-1 text-xs">({item.talla})</span>}
                    </p>
                    {item.is2x1 ? (
                      <p className="text-xs text-primary-600 font-medium">
                        2×1 · Pagás {Math.ceil(item.quantity / 2)} × {fmt(item.precio || 0)}
                      </p>
                    ) : (
                      <p className="text-xs text-secondary-400">{fmt(item.precio || 0)} c/u</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1), item.variante_id)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors">
                      <Minus className="w-3 h-3 text-secondary-600" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-secondary-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1), item.variante_id)}
                      disabled={item.quantity >= 10}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors disabled:opacity-40">
                      <Plus className="w-3 h-3 text-secondary-600" />
                    </button>
                  </div>

                  <button onClick={() => removeFromCart(item.id, item.variante_id)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-secondary-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-secondary-100 px-5 py-4 space-y-4">
            {/* Envío gratis bar */}
            <div className="bg-secondary-50 rounded-xl p-3">
              <p className="text-xs text-secondary-600 mb-2">
                {falta > 0
                  ? <>Te faltan <strong className="text-secondary-800">{fmt(falta)}</strong> para envío gratis 🚚</>
                  : <span className="text-primary-600 font-medium">✓ ¡Tenés envío gratis!</span>
                }
              </p>
              <div className="w-full bg-secondary-200 rounded-full h-1.5">
                <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-500">Total</span>
              <span className="text-lg font-semibold text-secondary-800">{fmt(total)}</span>
            </div>

            <button
              className="w-full btn btn-primary py-3 font-semibold"
              onClick={() => { navigate('/checkout'); onClose(); }}
            >
              Finalizar compra
            </button>
            <button onClick={onClose} className="w-full btn btn-secondary py-2.5 text-sm">
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
