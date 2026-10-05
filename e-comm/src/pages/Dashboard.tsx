import { Users, Package, ShoppingBag, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/StoreContext';

export default function Dashboard() {
  const { state } = useStore();

  const metrics = [
    { label: 'Concurrent Customers', value: '10,000', icon: Users, color: 'text-blue-500' },
    { label: 'Total Inventory', value: '100', icon: Package, color: 'text-purple-500' },
    { label: 'Successful Sales', value: state.inventory.sold.toString(), icon: ShoppingBag, color: 'text-accent-500' },
    { label: 'Oversold Units', value: state.metrics.oversoldUnits.toString(), icon: ShieldAlert, color: 'text-alert-500' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 tracking-tight mb-4">
          SALESTORM
        </h1>
        <p className="text-xl text-gray-400 font-medium">10,000 Customers. 100 Units. Zero Overselling.</p>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
          SALESTORM demonstrates how a high-concurrency flash sale can protect limited inventory while handling payments and order failures.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <div className={`p-3 rounded-full bg-dark-700/50 mb-4 ${m.color}`}>
                <Icon size={32} />
              </div>
              <div className="text-3xl font-bold mb-1">{m.value}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* Flow & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-200">System Flow</h2>
          <div className="flex flex-wrap items-center justify-between text-sm font-medium text-gray-300">
            <FlowStep label="Customers" />
            <FlowArrow />
            <FlowStep label="API Gateway" />
            <FlowArrow />
            <FlowStep label="Inventory" />
            <FlowArrow />
            <FlowStep label="Checkout" />
            <FlowArrow />
            <FlowStep label="Payment" />
            <FlowArrow />
            <FlowStep label="Order Service" />
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-200">Flash Sale Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-dark-700">
              <span className="text-gray-400">Product</span>
              <span className="font-semibold">Product X</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-dark-700">
              <span className="text-gray-400">Flash Sale</span>
              <span className="font-semibold text-accent-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span> LIVE
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-dark-700">
              <span className="text-gray-400">Inventory</span>
              <span className="font-semibold">{state.inventory.available} / 100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span className="font-semibold text-primary-400">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ label }: { label: string }) {
  return (
    <div className="px-4 py-3 bg-dark-700 rounded-lg border border-dark-600 shadow-inner">
      {label}
    </div>
  );
}

function FlowArrow() {
  return <div className="text-gray-600 text-xl font-bold mx-2">→</div>;
}
