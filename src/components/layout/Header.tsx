import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Bell, Sun, Moon, MapPin, 
  Utensils, Clock, LayoutGrid, ChefHat, ShieldCheck, Coffee, Sparkles,
  Calendar, Users, CheckSquare, Award
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../lib/utils';

export interface HeaderProps {
  onCartClick?: () => void;
  onWaiterClick?: () => void;
  onReserveClick?: () => void;
  tableNumber?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick, onWaiterClick, onReserveClick, tableNumber }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const isAdminPath = currentPath.startsWith('/admin');

  const appModes = [
    { path: `/${tableNumber ? `?table=${tableNumber}` : ''}`, label: t.menu.title, icon: Utensils, match: (p: string) => p === '/' },
    { path: `/order-tracking${tableNumber ? `?table=${tableNumber}` : ''}`, label: t.orderTracking.orders, icon: Clock, match: (p: string) => p.startsWith('/order-tracking') },
    { path: '/admin/reservations', label: t.admin.navigation.reservations, icon: Calendar, match: (p: string) => p.startsWith('/admin/reservations') },
    { path: '/admin/tables', label: t.admin.navigation.tables, icon: LayoutGrid, match: (p: string) => p === '/admin' || p === '/admin/tables' },
    { path: '/admin/kitchen', label: t.admin.navigation.kitchen, icon: ChefHat, match: (p: string) => p.startsWith('/admin/kitchen') },
    { path: '/admin/staff', label: t.admin.navigation.staff, icon: Users, match: (p: string) => p.startsWith('/admin/staff') },
    { path: '/admin/attendance', label: t.admin.navigation.attendance, icon: CheckSquare, match: (p: string) => p.startsWith('/admin/attendance') },
    { path: '/admin/egenkontrol', label: t.admin.navigation.egenkontrol, icon: Award, match: (p: string) => p.startsWith('/admin/egenkontrol') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-2xs">
      {/* Top Universal Mode Bar (Always visible on mobile & desktop with smooth horizontal scroll) */}
      <div className="bg-slate-950 text-white px-2.5 sm:px-4 py-1.5 border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-beacon" />
            <span className="font-black text-[11px] sm:text-xs text-slate-200 mr-1 hidden sm:inline tracking-wide">Cafe Vitus Live:</span>
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
                    "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-amber-400 text-slate-950 shadow-md font-black"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-bold text-slate-400 shrink-0 hidden lg:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{`${t.productCard.harborLocation} • DKK`}</span>
          </div>
        </div>
      </div>

      {/* Main Brand & Controls Header */}
      <div className="bg-white/85 dark:bg-[#070C18]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => navigate(`/${tableNumber ? `?table=${tableNumber}` : ''}`)}
                className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0 transition-transform group-hover:scale-105">
                  <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-serif-luxury group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Cafe Vitus
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 hidden xs:block tracking-wide">
                    {t.productCard.harborLocation}
                  </p>
                </div>
              </button>

              {/* Scanned Table Pill Badge (Fixed via Table QR) */}
              {tableNumber && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 dark:bg-amber-950/60 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-extrabold text-[11px] sm:text-xs shadow-2xs shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-beacon shrink-0" />
                  <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{t.table.tableNumber} {tableNumber}</span>
                </div>
              )}
            </div>


            {/* Action Buttons with high-touch targets */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Admin / Staff Quick Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate('/admin')}
                className={cn(
                  "min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-2xl text-[11px] sm:text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs",
                  isAdminPath
                    ? "bg-amber-400 text-slate-950 shadow-md font-black"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                )}
                title={t.admin.title}
                aria-label={t.admin.title}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="hidden xs:inline">Admin</span>
              </motion.button>

              {/* Segmented Dual-Pill Language Selector */}
              <div className="min-h-[40px] p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setLanguage('da')}
                  className={cn(
                    "px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1",
                    language === 'da'
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                  title="Dansk"
                >
                  <span>🇩🇰</span>
                  <span className="tracking-wide">DA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1",
                    language === 'en'
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                  title="English"
                >
                  <span>🇬🇧</span>
                  <span className="tracking-wide">EN</span>
                </button>
              </div>

              {/* Dark / Light Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
                aria-label={t.common.toggleTheme}
              >
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                </motion.div>
              </motion.button>

              {/* Table Reservation Button */}
              {onReserveClick && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onReserveClick}
                  className="min-h-[40px] flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
                  title={t.reservations.bookTable}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="hidden md:inline">{t.reservations.bookTable}</span>
                </motion.button>
              )}

              {/* Waiter Call Button */}
              {onWaiterClick && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onWaiterClick}
                  className="min-h-[40px] flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-amber-500/15 dark:bg-amber-950/60 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                  <span className="hidden sm:inline">{t.waiter.callWaiter}</span>
                </motion.button>
              )}

              {/* Cart Button */}
              {onCartClick && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onCartClick}
                  className="min-h-[40px] flex items-center gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer relative"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{t.cart.title}</span>
                  {itemCount > 0 && (
                    <motion.span 
                      key={itemCount}
                      initial={{ scale: 0.6, y: -4 }}
                      animate={{ scale: 1, y: 0 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 dark:bg-slate-950 text-slate-950 dark:text-amber-400 text-[11px] font-black shadow-xs shrink-0"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

