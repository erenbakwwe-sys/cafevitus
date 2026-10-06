import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { CartItem, MenuItem, SelectedCustomization, PaymentMethod, Language } from '../types';

interface CartState {
  items: CartItem[];
  tip: number;
  tipPercentage: number | null;
  couponCode: string | null;
  couponDiscount: number;
  paymentMethod: PaymentMethod;
  customerNote: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; quantity: number; customizations: SelectedCustomization[]; note?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_TIP'; payload: { amount: number; percentage: number | null } }
  | { type: 'SET_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_NOTE'; payload: string }
  | { type: 'CLEAR_CART' };

function calculateItemTotal(unitPrice: number, quantity: number, customizations: SelectedCustomization[]): number {
  const safeQty = Math.max(1, Math.min(99, Math.floor(quantity)));
  const customizationPrice = customizations.reduce((sum, c) => {
    return sum + c.selectedOptions.reduce((optSum, opt) => optSum + Math.max(0, opt.price), 0);
  }, 0);
  return Math.max(0, (Math.max(0, unitPrice) + customizationPrice) * safeQty);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, quantity, customizations, note } = action.payload;
      const safeQty = Math.max(1, Math.min(99, Math.floor(quantity)));
      const totalPrice = calculateItemTotal(menuItem.price, safeQty, customizations);
      const newItem: CartItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        menuItem,
        quantity: safeQty,
        selectedCustomizations: customizations,
        customerNote: note,
        totalPrice,
      };
      return { ...state, items: [...state.items, newItem] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.id !== id) };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
                totalPrice: calculateItemTotal(item.menuItem.price, quantity, item.selectedCustomizations),
              }
            : item
        ),
      };
    }
    case 'SET_TIP':
      return { ...state, tip: action.payload.amount, tipPercentage: action.payload.percentage };
    case 'SET_COUPON':
      return { ...state, couponCode: action.payload.code, couponDiscount: action.payload.discount };
    case 'REMOVE_COUPON':
      return { ...state, couponCode: null, couponDiscount: 0 };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_NOTE':
      return { ...state, customerNote: action.payload };
    case 'CLEAR_CART':
      return initialCartState;
    default:
      return state;
  }
}

const initialCartState: CartState = {
  items: [],
  tip: 0,
  tipPercentage: null,
  couponCode: null,
  couponDiscount: 0,
  paymentMethod: 'card',
  customerNote: '',
};

interface CartContextType {
  state: CartState;
  addItem: (menuItem: MenuItem, quantity: number, customizations: SelectedCustomization[], note?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setTip: (amount: number, percentage: number | null) => void;
  setCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNote: (note: string) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  const addItem = useCallback((menuItem: MenuItem, quantity: number, customizations: SelectedCustomization[], note?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, quantity, customizations, note } });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);

  const setTip = useCallback((amount: number, percentage: number | null) => {
    dispatch({ type: 'SET_TIP', payload: { amount, percentage } });
  }, []);

  const setCoupon = useCallback((code: string, discount: number) => {
    dispatch({ type: 'SET_COUPON', payload: { code, discount } });
  }, []);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  }, []);

  const setNote = useCallback((note: string) => {
    dispatch({ type: 'SET_NOTE', payload: note });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tipAmount = state.tipPercentage ? subtotal * (state.tipPercentage / 100) : state.tip;
  const total = Math.max(0, subtotal - state.couponDiscount + tipAmount);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        setTip,
        setCoupon,
        removeCoupon,
        setPaymentMethod,
        setNote,
        clearCart,
        subtotal,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
