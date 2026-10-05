import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, type OrderStatus } from '../../store/StoreContext';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';

export default function StoreCheckout() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasReservation = !!state.activeReservation;
  const reservationProduct = hasReservation ? state.products.find(p => p.id === state.activeReservation?.productId) : null;
  
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    if (state.activeReservation) {
      const timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
      return () => clearInterval(timer);
    }
  }, [state.activeReservation]);

  const total = hasReservation && reservationProduct
    ? (reservationProduct.price * state.activeReservation!.quantity) * 1.18
    : (state.cart || []).reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 1.18;

  const handlePaymentAction = (action: 'SUCCESS' | 'FAILURE' | 'TIMEOUT') => {
    setProcessing(true);
    
    if (action === 'TIMEOUT') {
      setTimeout(() => {
        alert('Payment Timeout! Retrying...');
        setTimeout(() => {
           // Retry fails
           dispatch({ type: 'RELEASE_RESERVATION' });
           dispatch({ type: 'PAYMENT_FAILED' });
           alert('Retry failed. Payment Failed. Reservation Released.');
           setProcessing(false);
           navigate('/store/products');
        }, 1500);
      }, 2000);
      return;
    }

    setTimeout(() => {
      if (action === 'FAILURE') {
        dispatch({ type: 'RELEASE_RESERVATION' });
        dispatch({ type: 'PAYMENT_FAILED' });
        alert('Payment Failed! Reservation Released and Inventory Restored.');
        setProcessing(false);
        navigate('/store/products');
        return;
      }

      // SUCCESS case
      if (hasReservation && reservationProduct) {
        const newOrder = {
          id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          customer: 'Guest User',
          product: reservationProduct.name,
          quantity: state.activeReservation!.quantity,
          paymentId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          reservationId: state.activeReservation!.id,
          idempotencyKey: state.activeReservation!.idempotencyKey,
          amount: reservationProduct.price * state.activeReservation!.quantity * 1.18,
          status: 'PAYMENT_CONFIRMED' as OrderStatus,
          paymentStatus: 'SUCCESS' as const,
          timestamp: Date.now()
        };
        // Use a new dispatch that skips inventory modifier, or modify PAYMENT_SUCCESS to take quantity
        // Actually since we call CONFIRM_RESERVATION, let's just append the order directly via a new action or just use PAYMENT_SUCCESS and accept we need to fix it.
        // Let's dispatch CONFIRM_RESERVATION first which handles the inventory, then we'll send PAYMENT_SUCCESS_NO_INV
        dispatch({ type: 'CONFIRM_RESERVATION' });
        dispatch({ type: 'ADD_ORDER', payload: newOrder });
      } else {
        (state.cart || []).forEach(item => {
          for(let i=0; i<item.quantity; i++) {
            const newOrder = {
              id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              customer: 'Guest User',
              product: item.product.name,
              quantity: 1,
              paymentId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              reservationId: `RES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              idempotencyKey: `IDEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              amount: item.product.price * 1.18,
              status: 'PAYMENT_CONFIRMED' as OrderStatus,
              paymentStatus: 'SUCCESS' as const,
              timestamp: Date.now()
            };
            dispatch({ type: 'ADD_ORDER', payload: newOrder });
          }
        });
        dispatch({ type: 'CLEAR_CART' });
      }
      
      setProcessing(false);
      setSuccess(true);
    }, 1500);
  };

  if (!hasReservation && (!state.cart || state.cart.length === 0) && !success) {
    navigate('/store/products');
    return null;
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-8 py-16 flex flex-col items-center">
        <div className="w-20 h-20 bg-accent-500/20 text-accent-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Payment Successful!</h2>
        <p className="text-gray-400 mb-8 text-center">Your order has been placed successfully and your flash sale reservation is confirmed.</p>
        
        <div className="w-full bg-dark-900 border border-dark-700 rounded-xl p-6 font-mono text-sm space-y-3 mb-8">
          <div className="text-xs text-gray-500 uppercase tracking-widest border-b border-dark-700 pb-2 mb-4">Transaction Receipt</div>
          <div className="flex justify-between"><span className="text-gray-400">Payment ID</span> <span className="text-gray-200">PAY-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Transaction Status</span> <span className="text-accent-400 font-bold">CONFIRMED</span></div>
          {hasReservation && <div className="flex justify-between"><span className="text-gray-400">Reservation ID</span> <span className="text-gray-200">{state.activeReservation?.id}</span></div>}
          <div className="flex justify-between"><span className="text-gray-400">Idempotency Key</span> <span className="text-gray-200">{hasReservation ? state.activeReservation?.idempotencyKey : `IDEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Amount</span> <span className="text-gray-200">₹{total.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Timestamp</span> <span className="text-gray-200">{new Date().toLocaleString()}</span></div>
        </div>

        <button onClick={() => navigate('/orders')} className="px-8 py-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors font-medium">
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Checkout</h1>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 text-primary-500 font-medium mb-8 pb-4 border-b border-dark-700">
          <ShieldCheck size={24} />
          Secure Payment Gateway
        </div>

        {hasReservation && state.activeReservation && (
          <div className="bg-dark-900 p-6 rounded-lg border border-accent-500/50 mb-8 space-y-3 font-mono text-sm">
            <h3 className="text-accent-500 font-bold text-lg mb-4 flex items-center gap-2">Flash Sale Reservation</h3>
            <div className="flex justify-between">
              <span className="text-gray-400">Product</span>
              <span className="text-gray-200 font-bold">{reservationProduct?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Quantity</span>
              <span className="text-gray-200">{state.activeReservation.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price</span>
              <span className="text-gray-200">₹{reservationProduct?.price.toLocaleString()}</span>
            </div>
            <div className="h-px bg-dark-700 my-2"></div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reservation ID</span>
              <span className="text-gray-200">{state.activeReservation.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span className="text-orange-400 font-bold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                {state.activeReservation.status} → PAYMENT PENDING
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Idempotency Key</span>
              <span className="text-gray-200">{state.activeReservation.idempotencyKey}</span>
            </div>
            <div className="flex justify-between text-alert-400 mt-2 pt-2 border-t border-dark-700">
              <span>Expires In</span>
              <span className="font-bold">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Card Number</label>
            <div className="flex items-center px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-300">
              <CreditCard size={18} className="text-gray-500 mr-3" />
              •••• •••• •••• 4242
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Expiry Date</label>
              <div className="px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-300">
                12/28
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">CVC</label>
              <div className="px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-300">
                •••
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-900 p-6 rounded-lg border border-dark-700 mb-8">
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-gray-300">Total to Pay:</span>
            <span className="text-2xl text-primary-400">₹{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-500 uppercase font-semibold text-center mb-4">Select Payment Simulation Outcome:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => handlePaymentAction('SUCCESS')}
              disabled={processing}
              className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                processing ? 'bg-dark-700 text-gray-500' : 'bg-accent-600/20 hover:bg-accent-600/30 text-accent-400 border border-accent-600/50'
              }`}
            >
              PAYMENT SUCCESS
            </button>
            <button 
              onClick={() => handlePaymentAction('FAILURE')}
              disabled={processing}
              className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                processing ? 'bg-dark-700 text-gray-500' : 'bg-alert-600/20 hover:bg-alert-600/30 text-alert-400 border border-alert-600/50'
              }`}
            >
              PAYMENT FAILURE
            </button>
            <button 
              onClick={() => handlePaymentAction('TIMEOUT')}
              disabled={processing}
              className={`py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                processing ? 'bg-dark-700 text-gray-500' : 'bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/50'
              }`}
            >
              PAYMENT TIMEOUT
            </button>
          </div>
          {processing && (
            <div className="text-center mt-4 text-gray-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Processing Payment...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
