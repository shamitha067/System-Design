import { Link } from 'react-router-dom';
import { Clock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/StoreContext';

export default function StoreHome() {
  const { state } = useStore();
  const flashSaleProduct = state.products.find(p => p.isFlashSale);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-dark-800 to-dark-900 border-b border-dark-700 py-24 px-8 text-center">
        <div className="absolute inset-0 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 tracking-tight mb-6">
            Gear Up for the Future.
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover premium tech equipment built for developers, engineers, and early adopters.
          </p>
          <Link to="/store/products" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/25 active:scale-95">
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Flash Sale Banner */}
      {flashSaleProduct && (
        <div className="max-w-6xl mx-auto px-8">
          <div className="glass-card overflow-hidden border-accent-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 flex flex-col justify-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent"></div>
                <div className="inline-flex items-center gap-2 text-accent-500 font-bold mb-4 tracking-wider uppercase text-sm">
                  <Zap size={18} className="fill-accent-500" /> Live Flash Sale
                </div>
                <h2 className="text-3xl font-bold mb-4">{flashSaleProduct.name}</h2>
                <p className="text-gray-400 mb-6">{flashSaleProduct.description}</p>
                
                <div className="flex items-end gap-4 mb-6">
                  <span className="text-4xl font-bold text-gray-100">₹{flashSaleProduct.price.toLocaleString()}</span>
                  {flashSaleProduct.originalPrice && (
                    <span className="text-xl text-gray-500 line-through mb-1">₹{flashSaleProduct.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available Inventory</span>
                    <span className="font-bold text-accent-400">{state.inventory.available} / {state.inventory.total}</span>
                  </div>
                  <div className="w-full bg-dark-900 rounded-full h-3 border border-dark-700 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-accent-600 to-accent-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(state.inventory.available / state.inventory.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-dark-900 px-4 py-2 rounded-lg border border-dark-700 text-gray-300 font-mono">
                    <Clock size={16} className="text-accent-500" />
                    02:45:11
                  </div>
                  <Link to={`/store/product/${flashSaleProduct.id}`} className="flex-1 text-center py-3 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-accent-500/20">
                    Buy Now
                  </Link>
                </div>
              </div>
              <div className="hidden md:block relative h-full min-h-[400px]">
                <img src={flashSaleProduct.image} alt={flashSaleProduct.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-800 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Zero Overselling', desc: 'Advanced concurrency protection guarantees you get what you buy.', icon: ShieldCheck },
          { title: 'Lightning Fast', desc: 'Optimized global infrastructure for instant checkout.', icon: Zap },
          { title: 'Premium Support', desc: '24/7 priority support for all our limited edition products.', icon: Clock },
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="glass-card p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-primary-400 mb-4">
                <Icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-200 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
