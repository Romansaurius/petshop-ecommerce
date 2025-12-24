import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-100">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-secondary-800">
              Carrito ({getTotalItems()})
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-secondary-700 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-secondary-500 mb-6">
                Agrega algunos productos para comenzar
              </p>
              <button 
                onClick={onClose}
                className="btn btn-primary"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">

              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imagen ? (
                      <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-2xl">
                        {item.categoria === 'comederos' ? '🍽️' : 
                         item.categoria === 'juguetes' ? '🎾' :
                         item.categoria === 'camas' ? '🛏️' :
                         item.categoria === 'collares' ? '🦴' : '🐾'}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-secondary-800 truncate">
                      {item.nombre}
                    </h4>
                    <p className="text-sm text-secondary-600">
                      {formatPrice(item.precio || 0)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="p-1 hover:bg-secondary-200 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4 text-secondary-600" />
                    </button>
                    
                    <span className="w-8 text-center font-medium text-secondary-800">
                      {item.quantity}
                    </span>
                    
                    <button 
                      onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1))}
                      disabled={item.quantity >= 10}
                      className="p-1 hover:bg-secondary-200 rounded transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 text-secondary-600" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-secondary-100 p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span className="text-secondary-700">Subtotal:</span>
              <span className="text-secondary-800">{formatPrice(getTotalPrice())}</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between text-xl font-bold border-t border-secondary-200 pt-4">
              <span className="text-secondary-800">Total:</span>
              <span className="text-primary-500">{formatPrice(getTotalPrice())}</span>
            </div>

            {/* Checkout Button */}
            <button 
              className="w-full btn btn-primary"
              onClick={() => {
                navigate('/checkout');
                onClose();
              }}
            >
              Proceder al Checkout
            </button>

            {/* Continue Shopping */}
            <button 
              onClick={onClose}
              className="w-full btn btn-secondary"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;