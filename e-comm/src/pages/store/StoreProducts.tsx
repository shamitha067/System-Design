import { Link } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { ShoppingCart, Zap } from 'lucide-react';

export default function StoreProducts() {
  const { state, dispatch } = useStore();

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    dispatch({ type: 'ADD_TO_CART', payload: product });
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-100 mb-2">All Products</h1>
      <p className="text-gray-400 mb-8">Browse our collection of premium gear.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {state.products.map(product => (
          <Link to={`/store/product/${product.id}`} key={product.id} className="group glass-card overflow-hidden flex flex-col hover:border-primary-500/50 transition-colors relative">
            {product.isFlashSale && (
              <div className="absolute top-4 right-4 z-10 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Zap size={14} className="fill-white" /> FLASH SALE
              </div>
            )}
            
            <div className="aspect-video overflow-hidden bg-dark-900 relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-800 to-transparent opacity-60"></div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-200 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
              
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-100">₹{product.price.toLocaleString()}</div>
                  {product.originalPrice && (
                    <div className="text-xs text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</div>
                  )}
                </div>
                <button 
                  onClick={(e) => handleAddToCart(e, product)}
                  className="p-2.5 bg-dark-700 hover:bg-primary-600 text-gray-300 hover:text-white rounded-lg transition-colors border border-dark-600 hover:border-primary-500"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
