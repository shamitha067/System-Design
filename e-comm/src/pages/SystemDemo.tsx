import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Server, Network, ShieldCheck, Database, ShoppingCart, 
  CreditCard, Package, Zap, Play, RotateCcw, CheckCircle, AlertTriangle 
} from 'lucide-react';

const ARCH_NODES = [
  { id: 'CUSTOMERS', label: 'CUSTOMERS', icon: Users, desc: '10,000 concurrent users attempting to access the flash sale.' },
  { id: 'LB', label: 'LOAD BALANCER', icon: Network, desc: 'Distributes incoming traffic across multiple API Gateway instances.' },
  { id: 'API', label: 'API GATEWAY', icon: Server, desc: 'Handles rate limiting, authentication, and routing requests.' },
  { id: 'PRODUCT', label: 'PRODUCT SERVICE', icon: Package, desc: 'Serves product catalog and sale details (often cached).' },
  { id: 'CACHE', label: 'CACHE', icon: Zap, desc: 'Redis cache storing temporary reservations and product metadata.' },
  { id: 'INVENTORY', label: 'INVENTORY & RESERVATION', icon: ShieldCheck, desc: 'Critical component handling ACID transactions to prevent overselling.' },
  { id: 'DB', label: 'DATABASE', icon: Database, desc: 'Persistent storage for inventory and permanent records.' },
  { id: 'CHECKOUT', label: 'CHECKOUT', icon: ShoppingCart, desc: 'Assembles the reserved cart and prepares for payment.' },
  { id: 'PAYMENT', label: 'PAYMENT', icon: CreditCard, desc: 'Interfaces with external payment gateways. Handles idempotency.' },
  { id: 'MQ', label: 'MESSAGE QUEUE', icon: Network, desc: 'Kafka/RabbitMQ for async processing and reliable retries.' },
  { id: 'ORDER', label: 'ORDER SERVICE', icon: FileTextIcon, desc: 'Finalizes the order creation asynchronously.' },
];

function FileTextIcon(props: any) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

const INITIAL_METRICS = {
  rps: 0,
  successfulReservations: 0,
  paymentSuccessRate: 0,
  paymentFailureRate: 0,
  ordersCreated: 0,
  currentInventory: 100,
  oversoldUnits: 0,
};

export default function SystemDemo() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [logs, setLogs] = useState<{time: string, msg: string}[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, { time: new Date().toISOString().substring(11, 23), msg }]);
  };

  const runDemo = () => {
    setStatus('running');
    setMetrics(INITIAL_METRICS);
    setLogs([]);
    
    let currentStep = 0;
    
    const sequence = [
      { t: 0, rps: 500, nodes: ['CUSTOMERS', 'LB', 'API'], msg: 'Traffic spike detected (10,000 customers)' },
      { t: 1000, rps: 4500, nodes: ['PRODUCT', 'CACHE'], msg: 'Serving product details from Cache' },
      { t: 2000, rps: 8000, nodes: ['INVENTORY', 'DB'], msg: 'Concurrency control engaged. Reserving inventory.' },
      { t: 3000, rps: 10000, nodes: ['INVENTORY'], metrics: { successfulReservations: 100, currentInventory: 0 }, msg: 'Reservation Created (100 max)' },
      { t: 4000, rps: 2000, nodes: ['CHECKOUT'], msg: '100 Customers moved to checkout' },
      { t: 5000, rps: 500, nodes: ['PAYMENT'], msg: 'Payment Initiated' },
      { t: 6000, rps: 100, nodes: ['PAYMENT'], metrics: { paymentSuccessRate: 95, paymentFailureRate: 5 }, msg: 'Payment Successful (5% simulated failures recovered)' },
      { t: 7000, rps: 50, nodes: ['PAYMENT'], msg: 'Duplicate Payment Prevented via Idempotency Key' },
      { t: 8000, rps: 50, nodes: ['MQ', 'ORDER', 'DB'], msg: 'Order Service unavailable. Queuing events...' },
      { t: 9000, rps: 10, nodes: ['ORDER', 'DB'], metrics: { ordersCreated: 100, paymentSuccessRate: 100, paymentFailureRate: 0 }, msg: 'Order Created (Async Recovery)' },
      { t: 10000, rps: 0, nodes: ['ORDER'], msg: 'Order Confirmed' },
    ];

    const interval = setInterval(() => {
      const step = sequence[currentStep];
      if (!step) {
        clearInterval(interval);
        setStatus('completed');
        setHighlightedNodes(new Set());
        return;
      }
      
      setHighlightedNodes(new Set(step.nodes));
      setMetrics(prev => ({
        ...prev,
        rps: step.rps,
        ...(step.metrics || {})
      }));
      addLog(step.msg);
      
      currentStep++;
    }, 1000);
  };

  const resetDemo = () => {
    setStatus('idle');
    setMetrics(INITIAL_METRICS);
    setLogs([]);
    setHighlightedNodes(new Set());
    setActiveNode(null);
  };

  return (
    <div className="min-h-screen w-full bg-dark-900 text-gray-100 overflow-auto">
      {/* Standalone Header */}
      <header className="flex justify-between items-center p-6 border-b border-dark-700 bg-dark-800 sticky top-0 z-40">
        <div>
          <Link to="/" className="text-xl font-black tracking-widest text-primary-500 flex items-center gap-2 hover:text-primary-400 transition-colors">
            <Zap size={24} />
            SALESTORM
          </Link>
          <h1 className="text-2xl font-bold text-gray-100 mt-1">SYSTEM DEMO</h1>
          <p className="text-sm text-gray-400 mt-1">10,000 Customers. 100 Units. Zero Overselling.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-accent-500 bg-accent-500/10 py-1.5 px-4 rounded-full border border-accent-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
          SYSTEM OPERATIONAL
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-8 w-full max-w-none space-y-8 pb-24">
        <div className="flex justify-end items-center mb-4">
          {status !== 'running' ? (
            <button 
              onClick={status === 'completed' ? resetDemo : runDemo}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${
                status === 'completed' 
                  ? 'bg-dark-700 hover:bg-dark-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/25'
              }`}
            >
              {status === 'completed' ? <RotateCcw size={18}/> : <Play size={18}/>}
              {status === 'completed' ? 'RESET DEMO' : 'RUN COMPLETE DEMO'}
            </button>
          ) : (
            <div className="flex items-center gap-3 px-6 py-3 bg-dark-800 text-primary-400 rounded-lg font-bold">
              <div className="w-4 h-4 rounded-full bg-primary-500 animate-pulse"></div>
              SIMULATION RUNNING
            </div>
          )}
        </div>

      {/* Architecture Diagram */}
      <div className="glass-card p-12 mb-8 relative max-w-7xl mx-auto w-full">
        <h2 className="text-xl font-bold mb-6 text-gray-300">Architecture Flow</h2>
        
        {activeNode && (
          <div className="absolute top-4 right-4 bg-dark-900 border border-primary-500/50 p-4 rounded-lg w-64 shadow-2xl z-20 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-primary-400">{ARCH_NODES.find(n => n.id === activeNode)?.label}</h3>
              <button onClick={() => setActiveNode(null)} className="text-gray-500 hover:text-white">&times;</button>
            </div>
            <p className="text-sm text-gray-300">{ARCH_NODES.find(n => n.id === activeNode)?.desc}</p>
          </div>
        )}

        <div className="flex flex-col gap-8">
          {/* Main Flow */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['CUSTOMERS', 'LB', 'API', 'PRODUCT', 'INVENTORY', 'CHECKOUT', 'PAYMENT', 'ORDER'].map((id, idx) => {
              const node = ARCH_NODES.find(n => n.id === id)!;
              const Icon = node.icon;
              const isHighlight = highlightedNodes.has(id);
              
              return (
                <React.Fragment key={id}>
                  <div 
                    onClick={() => setActiveNode(id)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all w-32 text-center relative ${
                      isHighlight ? 'bg-primary-900/40 border-primary-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' : 'bg-dark-800 border-dark-700 hover:border-gray-500'
                    }`}
                  >
                    <Icon size={32} className={`mb-2 ${isHighlight ? 'text-primary-400' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-gray-300">{node.label}</span>
                  </div>
                  {idx < 7 && <div className={`h-1 w-8 rounded-full ${isHighlight || highlightedNodes.size > 0 ? 'bg-dark-600' : 'bg-dark-700'}`}></div>}
                </React.Fragment>
              );
            })}
          </div>

          {/* Supporting Infrastructure */}
          <div className="flex justify-center gap-16 mt-4 pt-8 border-t border-dark-700/50">
            {['CACHE', 'MQ', 'DB'].map(id => {
              const node = ARCH_NODES.find(n => n.id === id)!;
              const Icon = node.icon;
              const isHighlight = highlightedNodes.has(id);
              
              return (
                <div 
                  key={id}
                  onClick={() => setActiveNode(id)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all w-32 text-center ${
                    isHighlight ? 'bg-accent-900/40 border-accent-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105' : 'bg-dark-900 border-dark-700 hover:border-gray-500'
                  }`}
                >
                  <Icon size={24} className={`mb-2 ${isHighlight ? 'text-accent-400' : 'text-gray-500'}`} />
                  <span className="text-xs font-bold text-gray-400">{node.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {/* Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetricBox title="Requests/sec" value={metrics.rps.toLocaleString()} />
          <MetricBox title="Successful Reservations" value={metrics.successfulReservations} />
          <MetricBox title="Payment Success %" value={`${metrics.paymentSuccessRate}%`} color="text-accent-400" />
          <MetricBox title="Payment Failure %" value={`${metrics.paymentFailureRate}%`} color="text-orange-400" />
          <MetricBox title="Orders Created" value={metrics.ordersCreated} />
          <MetricBox title="Current Inventory" value={metrics.currentInventory} />
          <div className="col-span-2 sm:col-span-3">
            <MetricBox title="Oversold Units" value={metrics.oversoldUnits} color="text-alert-500" highlightZero />
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex flex-col h-80">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 border-b border-dark-700 pb-2">Event Log</h3>
          <div className="flex-1 overflow-y-auto font-mono text-sm space-y-2 flex flex-col-reverse">
            {logs.map((log, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-left-2">
                <span className="text-gray-600 mr-2">[{log.time}]</span>
                <span className="text-gray-300">{log.msg}</span>
              </div>
            )).reverse()}
            {logs.length === 0 && <div className="text-gray-600 text-center mt-8">Waiting for events...</div>}
          </div>
        </div>
      </div>

      {/* Final Screen */}
      {status === 'completed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-dark-900 border-2 border-primary-500/50 rounded-2xl max-w-2xl w-full p-12 text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"></div>
             
             <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-500/20 text-primary-500 rounded-full mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle size={48} />
             </div>
             
             <h2 className="text-5xl font-black text-white mb-12 tracking-widest uppercase">Sale Complete</h2>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-md mx-auto mb-12">
               <ResultRow label="Units Sold" value="100 / 100" color="text-primary-400" />
               <ResultRow label="Overselling" value="0" color="text-alert-400" />
               <ResultRow label="Negative Inventory" value="0" color="text-alert-400" />
               <ResultRow label="Duplicate Payments" value="PREVENTED" color="text-accent-400" />
               <div className="col-span-1 sm:col-span-2">
                 <ResultRow label="System Failures" value="RECOVERED" color="text-primary-400" />
               </div>
             </div>

             <button 
               onClick={resetDemo}
               className="px-12 py-4 bg-dark-800 hover:bg-dark-700 text-white rounded-xl font-bold transition-colors uppercase tracking-widest text-sm border border-dark-600 hover:border-gray-500"
             >
               Close & Reset
             </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function MetricBox({ title, value, color = 'text-gray-100', highlightZero }: { title: string, value: string | number, color?: string, highlightZero?: boolean }) {
  const isZero = value === 0 || value === '0';
  const displayColor = (highlightZero && isZero) ? 'text-primary-400' : color;
  
  return (
    <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl flex flex-col justify-between">
      <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</div>
      <div className={`text-2xl font-black font-mono ${displayColor}`}>{value}</div>
    </div>
  );
}

function ResultRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex justify-between items-center bg-dark-800/50 p-4 rounded-lg border border-dark-700">
      <span className="text-gray-400 font-bold text-sm uppercase">{label}</span>
      <span className={`font-black font-mono text-lg ${color}`}>{value}</span>
    </div>
  );
}
