import { useState } from 'react';
import { useStore, type Order, type OrderStatus } from '../store/StoreContext';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, X, AlertTriangle } from 'lucide-react';

const ORDER_STAGES: OrderStatus[] = [
  'CREATED',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

export default function Orders() {
  const { state, dispatch } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStageIndex = (status: OrderStatus) => ORDER_STAGES.indexOf(status);

  const handleRecoverOrder = (order: Order) => {
    dispatch({ type: 'ORDER_RECOVERED', payload: order });
  };

  const simulateOrderServiceFailure = () => {
    const failedOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      customer: 'Simulated User',
      product: 'Product X',
      quantity: 1,
      paymentId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      reservationId: `RES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      idempotencyKey: `IDEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: 299.99,
      status: 'FAILED' as OrderStatus,
      paymentStatus: 'SUCCESS',
      timestamp: Date.now()
    };
    dispatch({ type: 'PAYMENT_SUCCESS', payload: failedOrder });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
          <ShoppingBag className="text-primary-500" size={32} />
          Your Orders
        </h1>
      </div>

      {/* Failure Simulation Demo */}
      <div className="glass-card p-6 border-alert-900/50">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-alert-500">
          <AlertTriangle /> Background Order Recovery Simulation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-400 mb-4 text-sm">
              Simulate a scenario where the <strong>Payment succeeds</strong> but the <strong>Order Service fails</strong>. 
              The successful payment event is retained and placed into a FAILED state, pending recovery via the message queue.
            </p>
            <button 
              onClick={simulateOrderServiceFailure}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-sm font-medium transition-colors"
            >
              Simulate Order Service Failure
            </button>
          </div>
          
          <div className="bg-dark-900 p-4 rounded-lg border border-dark-700 font-mono text-sm space-y-2">
            <div className="flex items-center gap-2 text-gray-400"><CheckCircle size={14} className="text-accent-500"/> Payment Success</div>
            <div className="pl-1 text-gray-600">↓</div>
            <div className="flex items-center gap-2 text-alert-400"><AlertTriangle size={14} /> Order Service Unavailable</div>
            <div className="pl-1 text-gray-600">↓</div>
            <div className="flex items-center gap-2 text-primary-400"><Clock size={14} /> Event queued for recovery</div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900/50 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium text-center">Qty</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Payment Status</th>
                <th className="p-4 font-medium">Order Status</th>
                <th className="p-4 font-medium">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {state.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-gray-500">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                state.orders.map(order => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-dark-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-4 font-mono text-sm text-gray-300">{order.id}</td>
                    <td className="p-4 font-medium text-gray-200">{order.product}</td>
                    <td className="p-4 text-center text-gray-300">{order.quantity}</td>
                    <td className="p-4 text-gray-300 font-mono">₹{order.amount.toLocaleString()}</td>
                    <td className="p-4">
                      {order.paymentStatus === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-accent-500/10 text-accent-500 border border-accent-500/20">
                          <CheckCircle size={12} /> SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-alert-500/10 text-alert-500 border border-alert-500/20">
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(order.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl max-w-3xl w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-8">Order Details</h2>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Order ID</div>
                  <div className="font-mono text-lg">{selectedOrder.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Product</div>
                  <div className="font-medium text-lg">{selectedOrder.product}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Quantity</div>
                  <div className="text-lg">{selectedOrder.quantity} Units</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="font-mono text-xl text-primary-400 font-bold">₹{selectedOrder.amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Idempotency Key</div>
                  <div className="font-mono text-sm text-gray-400">{selectedOrder.idempotencyKey}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Payment ID</div>
                  <div className="font-mono text-sm text-gray-400">{selectedOrder.paymentId || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="relative pt-8">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                <Truck className="text-primary-500" /> Order Timeline
              </h3>
              
              {selectedOrder.status === 'FAILED' ? (
                <div className="bg-alert-900/30 border border-alert-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <AlertTriangle size={32} className="text-alert-500 mb-3" />
                  <h4 className="text-lg font-bold text-alert-400 mb-2">Order Service Failed</h4>
                  <p className="text-gray-400 text-sm mb-4">Payment succeeded but the order creation failed downstream. It has been queued for automatic recovery.</p>
                  <button 
                    onClick={() => { handleRecoverOrder(selectedOrder); setSelectedOrder(null); }}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors text-sm font-bold"
                  >
                    Retry / Recover Now
                  </button>
                </div>
              ) : (
                <div className="flex justify-between relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-0 w-full h-1 bg-dark-700 -z-10 rounded-full"></div>
                  <div 
                    className="absolute top-4 left-0 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-500"
                    style={{ width: `${(getStageIndex(selectedOrder.status) / (ORDER_STAGES.length - 1)) * 100}%` }}
                  ></div>

                  {ORDER_STAGES.map((stage, index) => {
                    const isActive = index <= getStageIndex(selectedOrder.status);
                    const isCurrent = index === getStageIndex(selectedOrder.status);
                    
                    return (
                      <div key={stage} className="flex flex-col items-center gap-3 relative w-24">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                          isActive 
                            ? 'bg-primary-600 text-white shadow-primary-500/25' 
                            : 'bg-dark-800 text-gray-500 border border-dark-600'
                        }`}>
                          {isActive ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div className={`text-xs text-center font-bold ${
                          isCurrent ? 'text-primary-400' : isActive ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {stage.replace(/_/g, ' ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
