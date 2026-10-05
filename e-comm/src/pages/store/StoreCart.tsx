import { Link } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function StoreCart() {
  const { state, dispatch } = useStore();

  const handleRemove = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const total = (state.cart || []).reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (!state.cart || state.cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-24 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center text-dark-600 mb-6">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Looks like you haven't added any gear to your cart yet.</p>
        <Link to="/store/products" className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {(state.cart || []).map((item) => (
            <div key={item.product.id} className="glass-card p-4 flex gap-6 items-center">
              <div className="w-24 h-24 bg-dark-900 rounded-lg overflow-hidden shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-200 text-lg mb-1">{item.product.name}</h3>
                <div className="text-primary-400 font-bold">₹{item.product.price.toLocaleString()}</div>
              </div>
              <div className="text-gray-400">
                Qty: {item.quantity}
              </div>
              <button 
                onClick={() => handleRemove(item.product.id)}
                className="p-2 text-gray-500 hover:text-alert-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 h-max">
          <h2 className="text-xl font-bold text-gray-200 mb-6">Order Summary</h2>
          
          <div className="space-y-4 text-sm mb-6 border-b border-dark-700 pb-6">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span className="text-accent-500">Free</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax</span>
              <span>₹{(total * 0.18).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between font-bold text-xl text-gray-100 mb-8">
            <span>Total</span>
            <span>₹{(total * 1.18).toLocaleString()}</span>
          </div>

          <Link 
            to="/store/checkout" 
            className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/25 active:scale-95"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
