import { Timestamp } from 'firebase/firestore';

export type Language = 'en' | 'da';
export type Theme = 'dark' | 'light';

export type LocalizedString = Record<Language, string>;

export type DietTag = 'vegan' | 'vegetarian' | 'gluten-free' | 'sugar-free' | 'dairy-free' | 'chef-pick';

export interface Customization {
  id: string;
  name: LocalizedString;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: LocalizedString;
  price: number; // Additional price in DKK
}

export interface Category {
  id: string;
  name: LocalizedString;
  icon: string; // Lucide icon name
  sortOrder: number;
  active: boolean;
}

export interface MenuItem {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number; // DKK
  categoryId: string;
  image?: string;
  tags: DietTag[];
  customizations: Customization[];
  available: boolean;
  createdAt: number;
  updatedAt: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'counter';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: LocalizedString;
  quantity: number;
  unitPrice: number;
  selectedCustomizations: SelectedCustomization[];
  customerNote?: string;
  totalPrice: number;
}

export interface SelectedCustomization {
  customizationId: string;
  customizationName: LocalizedString;
  selectedOptions: CustomizationOption[];
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tip: number;
  tipPercentage?: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod?: PaymentMethod;
  customerNote?: string;
  createdAt: number;
  updatedAt: number;
}

export type TableStatus = 'empty' | 'occupied' | 'bill-requested' | 'waiter-called';

export interface Table {
  id: string;
  number: string;
  status: TableStatus;
  currentOrderIds: string[];
  capacity: number;
}

export type WaiterCallType = 'bill' | 'napkin-water' | 'order-question' | 'special-request';

export interface WaiterCall {
  id: string;
  tableId: string;
  tableNumber: string;
  type: WaiterCallType;
  message?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: number;
  active: boolean;
  createdAt: number;
}

export interface StockItem {
  id: string;
  name: LocalizedString;
  quantity: number;
  unit: string;
  criticalLevel: number;
  costPerUnit: number;
  category: string;
  updatedAt: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: number;
  createdAt: number;
}

export interface CartItem {
  id: string; // unique cart item id
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  customerNote?: string;
  totalPrice: number;
}

export interface AdminSettings {
  pin: string;
  restaurantName: string;
  currency: string;
  taxRate: number;
}
