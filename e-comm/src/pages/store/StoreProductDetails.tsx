import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { ShoppingCart, ShieldCheck, Zap, ArrowLeft, Check } from 'lucide-react';

export default function StoreProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const [added, setAdded] = useState(false);
  
  const product = state.products.find(p => p.id === id);

  if (!product) {
    return <div className="p-8 text-center text-gray-400">Product not found.</div>;
  }

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (state.inventory.available > 0) {
      dispatch({ type: 'CREATE_RESERVATION', payload: { quantity: 1, productId: product.id } });
      navigate('/store/checkout');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-dark-900 min-h-[400px]">
             {product.isFlashSale && (
                <div className="absolute top-6 left-6 z-10 bg-accent-500 text-white text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <Zap size={16} className="fill-white" /> FLASH SALE
                </div>
              )}
            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-100 mb-4">{product.name}</h1>
            
            <div className="flex items-end gap-4 mb-6 pb-6 border-b border-dark-700">
              <span className="text-4xl font-bold text-primary-400">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-gray-300 mb-8 leading-relaxed">
              {product.description}
            </p>

            {product.isFlashSale && (
              <div className="mb-8 p-4 bg-dark-900 rounded-xl border border-dark-700">
                <div className="grid grid-cols-3 gap-4 text-center font-mono text-sm mb-4">
                  <div>
                    <div className="text-gray-400 mb-1">Available</div>
                    <div className="text-2xl font-bold text-accent-500">{state.inventory.available}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Reserved</div>
                    <div className="text-2xl font-bold text-orange-400">{state.inventory.reserved}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Sold</div>
                    <div className="text-2xl font-bold text-primary-400">{state.inventory.sold}</div>
                  </div>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden flex">
                  <div className="bg-accent-500 h-full transition-all" style={{ width: `${(state.inventory.available / state.inventory.total) * 100}%` }}></div>
                  <div className="bg-orange-400 h-full transition-all" style={{ width: `${(state.inventory.reserved / state.inventory.total) * 100}%` }}></div>
                  <div className="bg-primary-500 h-full transition-all" style={{ width: `${(state.inventory.sold / state.inventory.total) * 100}%` }}></div>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <ShieldCheck size={18} className="text-primary-500" />
                Guaranteed Concurrency Protection
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Zap size={18} className="text-accent-500" />
                Instant Checkout & Payment
              </div>
            </div>

            {product.isFlashSale ? (
              <button 
                onClick={handleBuyNow}
                disabled={state.inventory.available === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  state.inventory.available === 0
                    ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/25 active:scale-95'
                }`}
              >
                {state.inventory.available === 0 ? 'SOLD OUT' : <><Zap size={20} /> BUY NOW</>}
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-accent-600 text-white'
                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/25 active:scale-95'
                }`}
              >
                {added ? <><Check size={20} /> Added to Cart</> : <><ShoppingCart size={20} /> Add to Cart</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
