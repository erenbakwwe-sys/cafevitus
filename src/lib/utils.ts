import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import { Language } from '../types';

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} kr`;
}

export function formatCurrencyShort(amount: number): string {
  return `${Math.round(amount)} kr`;
}

export function formatDate(timestamp: number, lang: Language = 'en'): string {
  return format(new Date(timestamp), 'dd/MM/yyyy HH:mm', {
    locale: lang === 'da' ? da : enUS,
  });
}

export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'HH:mm');
}

export function formatTimeAgo(timestamp: number, lang: Language = 'en'): string {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: lang === 'da' ? da : enUS,
  });
}

export function getMinutesAgo(timestamp: number): number {
  return differenceInMinutes(new Date(), new Date(timestamp));
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateOrderNumber(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${hours}${minutes}-${random}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'preparing': return 'bg-blue-500';
    case 'ready': return 'bg-green-500';
    case 'delivered': return 'bg-emerald-600';
    case 'paid': return 'bg-purple-500';
    case 'completed': return 'bg-gray-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}

export function getTableStatusColor(status: string): { bg: string; border: string; text: string } {
  switch (status) {
    case 'empty': return { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-400' };
    case 'occupied': return { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-300 dark:border-sky-700', text: 'text-sky-700 dark:text-sky-400' };
    case 'bill-requested': return { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-400' };
    case 'waiter-called': return { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-300 dark:border-red-700', text: 'text-red-700 dark:text-red-400' };
    default: return { bg: 'bg-gray-50 dark:bg-gray-900', border: 'border-gray-300 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-400' };
  }
}
