import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Bell, Sun, Moon, MapPin, 
  Utensils, Clock, LayoutGrid, ChefHat, ShieldCheck, Coffee
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../lib/utils';

export interface HeaderProps {
  onCartClick?: () => void;
  onWaiterClick?: () => void;
  tableNumber?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick, onWaiterClick, tableNumber }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const isAdminPath = currentPath.startsWith('/admin');

  const appModes = [
    { path: `/${tableNumber ? `?table=${tableNumber}` : ''}`, label: language === 'da' ? 'Menukort' : 'Menu', icon: Utensils, match: (p: string) => p === '/' },
    { path: `/order-tracking${tableNumber ? `?table=${tableNumber}` : ''}`, label: language === 'da' ? 'Bestillinger' : 'Orders', icon: Clock, match: (p: string) => p.startsWith('/order-tracking') },
    { path: '/admin/tables', label: language === 'da' ? 'Borde & Kasse' : 'Tables POS', icon: LayoutGrid, match: (p: string) => p === '/admin' || p === '/admin/tables' },
    { path: '/admin/kitchen', label: language === 'da' ? 'Køkken (KDS)' : 'Kitchen', icon: ChefHat, match: (p: string) => p.startsWith('/admin/kitchen') },
    { path: '/admin/reports', label: language === 'da' ? 'Administration' : 'Admin', icon: ShieldCheck, match: (p: string) => p.startsWith('/admin/') && p !== '/admin/tables' && p !== '/admin/kitchen' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* Top Universal Mode Bar (Always visible on Desktop, shown on mobile if on admin page) */}
      <div className={cn("bg-slate-950 text-white px-3 sm:px-4 py-1.5 border-b border-slate-800", !isAdminPath && "hidden md:block")}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-xs text-slate-300 mr-1 hidden sm:inline">Cafe Vitus:</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {appModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = mode.match(currentPath);
              return (
                <button
                  key={mode.label}
                  type="button"
                  onClick={() => navigate(mode.path)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-bold text-slate-400 shrink-0 hidden lg:block">
            Snekkersten Havn • DKK
          </div>
        </div>
      </div>

      {/* Main Brand & Controls Header */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-15 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate(`/${tableNumber ? `?table=${tableNumber}` : ''}`)}
                className="flex items-center gap-2 sm:gap-3 text-left cursor-pointer group"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
                  <Coffee className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-base sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Cafe Vitus
                  </div>
                  <p className="text-[9px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 hidden xs:block">
                    Snekkersten Havn
                  </p>
                </div>
              </button>

              {/* Scanned Table Pill Badge (Fixed via Table QR) */}
              {tableNumber && (
                <div
                  className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 font-extrabold text-[11px] sm:text-xs shadow-2xs shrink-0"
                >
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600" />
                  <span>Bord {tableNumber}</span>
                </div>
              )}
            </div>

            {/* Action Buttons with high-touch targets */}
            <div className="flex items-center gap-1 sm:gap-2.5">
              {/* Language Switch */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="min-h-[38px] px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
              >
                {language === 'en' ? '🇩🇰 DA' : '🇬🇧 EN'}
              </button>

              {/* Dark / Light Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Waiter Call Button */}
              {onWaiterClick && (
                <button
                  type="button"
                  onClick={onWaiterClick}
                  className="min-h-[38px] flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 animate-pulse shrink-0" />
                  <span className="hidden sm:inline">{t.waiter.callWaiter}</span>
                </button>
              )}

              {/* Cart Button */}
              {onCartClick && (
                <button
                  type="button"
                  onClick={onCartClick}
                  className="min-h-[38px] flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer relative"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{t.cart.title}</span>
                  {itemCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 dark:bg-slate-900 text-white dark:text-amber-400 text-[11px] font-black shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
