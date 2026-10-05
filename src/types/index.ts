import { Timestamp } from 'firebase/firestore';

export type Language = 'en' | 'da';
export type Theme = 'dark' | 'light';

export type LocalizedString = Record<Language, string>;

export type DietTag = 'vegan' | 'vegetarian' | 'gluten-free' | 'sugar-free' | 'dairy-free' | 'chef-pick';

export type MealPeriod = 'breakfast' | 'lunch' | 'dinner' | 'all-day';

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
  mealPeriods?: MealPeriod[];
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

// Table Reservations with No-Show Protection Fee
export type ReservationStatus = 'confirmed' | 'seated' | 'completed' | 'no-show' | 'cancelled';
export type TablePreference = 'indoor' | 'outdoor-harbor' | 'bar' | 'any';

export interface TableReservation {
  id: string;
  reservationCode: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guestsCount: number;
  tablePreference: TablePreference;
  assignedTableNumber?: string;
  specialRequests?: string;
  depositPerPerson: number; // e.g. 50 DKK
  totalDeposit: number; // guestsCount * depositPerPerson
  depositPaid: boolean;
  status: ReservationStatus;
  createdAt: number;
  updatedAt: number;
}

// Enos-style Staff Management & Payroll
export type StaffRole = 'waiter' | 'chef' | 'bartender' | 'dishwasher' | 'manager';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface StaffMember {
  id: string;
  pin: string; // 4-digit PIN for clock-in/out
  name: string;
  role: StaffRole;
  phone: string;
  email: string;
  hourlyWage: number; // DKK per hour
  active: boolean;
  workingDays: DayOfWeek[];
  color: string;
  createdAt: number;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  breakMinutes: number;
  plannedHours: number;
  estimatedWage: number; // DKK
  status: 'scheduled' | 'completed' | 'absent';
}

// Digital Stempelur (Live Attendance & Clock In / Out)
export interface AttendanceLog {
  id: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  checkInTime: number; // timestamp
  checkOutTime?: number; // timestamp
  breakMinutes: number;
  totalHours?: number;
  earnedWage?: number; // DKK
  status: 'active' | 'completed';
  notes?: string;
}

// Enos-style Egenkontrol (Food Safety, Temperatures & Hygiene)
export interface TemperatureLog {
  id: string;
  unitName: string; // e.g. 'Køleskab 1 (Kød & Fisk)', 'Fryser 1', 'Varmholdelse'
  unitType: 'fridge' | 'freezer' | 'hot-holding';
  temperature: number; // °C
  maxAllowed: number; // e.g. 5°C or -18°C
  isCompliant: boolean;
  checkedBy: string;
  timestamp: number;
  notes?: string;
}

export interface HygieneCheckItem {
  id: string;
  label: LocalizedString;
  checked: boolean;
}

export interface HygieneChecklist {
  id: string;
  type: 'opening' | 'closing' | 'delivery';
  title: LocalizedString;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedBy?: string;
  completedAt?: number;
  items: HygieneCheckItem[];
}
