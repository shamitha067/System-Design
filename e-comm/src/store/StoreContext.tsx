import React, { createContext, useContext, type ReactNode } from 'react';

export type OrderStatus = 'CREATED' | 'PAYMENT_CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';

export interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  paymentId: string | null;
  reservationId: string;
  idempotencyKey: string;
  amount: number;
  status: OrderStatus;
  paymentStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
  timestamp: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  isFlashSale?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ReservationStatus = 'AVAILABLE' | 'RESERVED' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'RELEASED' | 'SOLD';

export interface Reservation {
  id: string;
  productId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: number;
  idempotencyKey: string;
}

export interface SimulationState {
  inventory: {
    total: number;
    available: number;
    reserved: number;
    sold: number;
  };
  metrics: {
    incomingRequests: number;
    successfulReservations: number;
    rejectedRequests: number;
    duplicateRequests: number;
    paymentSuccess: number;
    paymentFailure: number;
    ordersCreated: number;
    oversoldUnits: number;
  };
  orders: Order[];
  products: Product[];
  cart: CartItem[];
  activeReservation: Reservation | null;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p_salestorm_le',
    name: 'SALESTORM Limited Edition',
    description: 'The ultimate performance gear for true tech enthusiasts. Features advanced concurrency protection.',
    price: 4999,
    originalPrice: 7999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    isFlashSale: true
  },
  {
    id: 'p_dev_keyboard',
    name: 'SysCrafters Mechanical Keyboard',
    description: 'Tactile, responsive, and built for speed. Hot-swappable switches.',
    price: 8500,
    originalPrice: 10000,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'p_tech_backpack',
    name: 'Hacker Pro Backpack',
    description: 'Water-resistant, multiple compartments for your laptop and gadgets.',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  }
];

const initialState: SimulationState = {
  inventory: {
    total: 100,
    available: 100,
    reserved: 0,
    sold: 0,
  },
  metrics: {
    incomingRequests: 0,
    successfulReservations: 0,
    rejectedRequests: 0,
    duplicateRequests: 0,
    paymentSuccess: 0,
    paymentFailure: 0,
    ordersCreated: 0,
    oversoldUnits: 0,
  },
  orders: [],
  products: MOCK_PRODUCTS,
  cart: [],
  activeReservation: null,
};

interface StoreContextType {
  state: SimulationState;
  dispatch: React.Dispatch<any>; // Using any for simplicity in prototype
  reset: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function storeReducer(state: SimulationState, action: any): SimulationState {
  switch (action.type) {
    case 'CREATE_RESERVATION': {
      const { quantity, productId } = action.payload;
      if (state.inventory.available < quantity) {
        return state;
      }
      return {
        ...state,
        inventory: {
          ...state.inventory,
          available: state.inventory.available - quantity,
          reserved: state.inventory.reserved + quantity,
        },
        activeReservation: {
          id: `RES-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          productId,
          quantity,
          status: 'RESERVED',
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
          idempotencyKey: `IDEM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        }
      };
    }
    case 'RELEASE_RESERVATION': {
      if (!state.activeReservation) return state;
      return {
        ...state,
        inventory: {
          ...state.inventory,
          available: state.inventory.available + state.activeReservation.quantity,
          reserved: state.inventory.reserved - state.activeReservation.quantity,
        },
        activeReservation: null
      };
    }
    case 'CONFIRM_RESERVATION': {
      if (!state.activeReservation) return state;
      return {
        ...state,
        inventory: {
          ...state.inventory,
          reserved: state.inventory.reserved - state.activeReservation.quantity,
          sold: state.inventory.sold + state.activeReservation.quantity,
        },
        activeReservation: null
      };
    }
    case 'ADD_ORDER': {
      const exists = state.orders.find(o => o.idempotencyKey === action.payload.idempotencyKey);
      if (exists) return state;
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        metrics: {
          ...state.metrics,
          paymentSuccess: state.metrics.paymentSuccess + 1,
          ordersCreated: state.metrics.ordersCreated + 1,
        }
      };
    }
    case 'RESERVE': {
      if (state.inventory.available <= 0) {
        return {
          ...state,
          metrics: {
            ...state.metrics,
            incomingRequests: state.metrics.incomingRequests + 1,
            rejectedRequests: state.metrics.rejectedRequests + 1,
          }
        };
      }
      return {
        ...state,
        inventory: {
          ...state.inventory,
          available: state.inventory.available - 1,
          reserved: state.inventory.reserved + 1,
        },
        metrics: {
          ...state.metrics,
          incomingRequests: state.metrics.incomingRequests + 1,
          successfulReservations: state.metrics.successfulReservations + 1,
        }
      };
    }
    case 'PAYMENT_SUCCESS': {
      return {
        ...state,
        inventory: {
          ...state.inventory,
          reserved: state.inventory.reserved - 1,
          sold: state.inventory.sold + 1,
        },
        metrics: {
          ...state.metrics,
          paymentSuccess: state.metrics.paymentSuccess + 1,
          ordersCreated: state.metrics.ordersCreated + 1,
        },
        orders: [action.payload, ...state.orders]
      };
    }
    case 'PAYMENT_FAILED': {
      return {
        ...state,
        inventory: {
          ...state.inventory,
          reserved: state.inventory.reserved - 1,
          available: state.inventory.available + 1,
        },
        metrics: {
          ...state.metrics,
          paymentFailure: state.metrics.paymentFailure + 1,
        }
      };
    }
    case 'DUPLICATE_PAYMENT': {
      return {
        ...state,
        metrics: {
          ...state.metrics,
          duplicateRequests: state.metrics.duplicateRequests + 1,
        }
      };
    }
    case 'ORDER_RECOVERED': {
      const updatedOrders = state.orders.map(o => 
        o.id === action.payload.id ? { ...o, status: 'PAYMENT_CONFIRMED' as OrderStatus } : o
      );
      return {
        ...state,
        orders: updatedOrders
      };
    }
    case 'UPDATE_METRICS_BATCH': {
      return {
        ...state,
        inventory: { ...state.inventory, ...action.payload.inventory },
        metrics: { ...state.metrics, ...action.payload.metrics }
      };
    }
    case 'ADD_TO_CART': {
      const product = action.payload;
      const existing = state.cart.find(item => item.product.id === product.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        };
      }
      return { ...state, cart: [...state.cart, { product, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART': {
      const productId = action.payload;
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== productId)
      };
    }
    case 'CLEAR_CART': {
      return { ...state, cart: [] };
    }
    case 'RESET':
      return initialState;
    case 'SET_STATE':
      return action.payload;
    default:
      return state;
  }
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = React.useReducer(storeReducer, initialState);

  const reset = () => dispatch({ type: 'RESET' });

  return (
    <StoreContext.Provider value={{ state, dispatch, reset }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
