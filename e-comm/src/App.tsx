import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Activity, FileText, Server, PlayCircle, Store, Package, Zap } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import FlashSale from './pages/FlashSale';
import Simulator from './pages/Simulator';
import Orders from './pages/Orders';
import Architecture from './pages/Architecture';
import SystemDemo from './pages/SystemDemo';
import StoreHome from './pages/store/StoreHome';
import StoreProducts from './pages/store/StoreProducts';
import StoreProductDetails from './pages/store/StoreProductDetails';
import StoreCart from './pages/store/StoreCart';
import StoreCheckout from './pages/store/StoreCheckout';
import { StoreProvider, useStore } from './store/StoreContext';

function Navigation() {
  const location = useLocation();
  const { state } = useStore();
  const cartItemCount = state.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const systemLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/system-demo', label: 'System Demo', icon: PlayCircle },
    { path: '/flash-sale', label: 'Demo Flow', icon: Zap },
    { path: '/simulator', label: 'Simulator', icon: Activity },
    { path: '/orders', label: 'Orders', icon: FileText },
    { path: '/architecture', label: 'Architecture', icon: Server },
  ];

  const storeLinks = [
    { path: '/store', label: 'Store Home', icon: Store },
    { path: '/store/products', label: 'Products', icon: Package },
    { path: '/store/cart', label: 'Cart', icon: ShoppingCart, count: cartItemCount },
  ];

  return (
    <div className="w-64 bg-dark-800 border-r border-dark-700 min-h-screen p-4 flex flex-col shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2 text-primary-500 font-bold text-2xl tracking-wider">
        <Activity size={28} />
        SALESTORM
      </div>
      
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent-500 bg-accent-500/10 py-1.5 px-3 rounded-full border border-accent-500/20 w-max">
          <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
          SYSTEM OPERATIONAL
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Storefront</h3>
          <nav className="space-y-1">
            {storeLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path === '/store/products' && location.pathname.startsWith('/store/product/'));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary-600/10 text-primary-500 font-medium' : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    {link.label}
                  </div>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System Demo</h3>
          <nav className="space-y-1">
            {systemLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-primary-600/10 text-primary-500 font-medium' : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'}`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Link to="/simulator" className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg font-medium shadow-lg shadow-primary-500/25 transition-all active:scale-95">
          <PlayCircle size={18} />
          RUN COMPLETE DEMO
        </Link>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isSystemDemo = location.pathname === '/system-demo';

  if (isSystemDemo) {
    return (
      <Routes>
        <Route path="/system-demo" element={<SystemDemo />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-dark-900 text-gray-100 overflow-hidden">
      <Navigation />
      <main className="flex-1 overflow-auto bg-dark-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/flash-sale" element={<FlashSale />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/store" element={<StoreHome />} />
          <Route path="/store/products" element={<StoreProducts />} />
          <Route path="/store/product/:id" element={<StoreProductDetails />} />
          <Route path="/store/cart" element={<StoreCart />} />
          <Route path="/store/checkout" element={<StoreCheckout />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
