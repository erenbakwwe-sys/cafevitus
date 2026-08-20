import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, ChefHat, UtensilsCrossed, QrCode, 
  Package, Wallet, Ticket, BarChart3, LogOut,
  Moon, Sun, Menu, X, Globe, Compass, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import LoginPage from './LoginPage';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/admin', end: true, icon: LayoutGrid, label: 'Tables & POS', daLabel: 'Borde & Kasse' },
  { path: '/admin/kitchen', icon: ChefHat, label: 'Kitchen (KDS)', daLabel: 'Køkkendisplay (KDS)' },
  { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Management', daLabel: 'Menustyring' },
  { path: '/admin/qr-codes', icon: QrCode, label: 'QR Generator', daLabel: 'Bord QR Koder' },
  { path: '/admin/stock', icon: Package, label: 'Stock & Inventory', daLabel: 'Lagerstyring' },
  { path: '/admin/expenses', icon: Wallet, label: 'Income & Expenses', daLabel: 'Indtægter & Udgifter' },
  { path: '/admin/coupons', icon: Ticket, label: 'Coupons & Loyalty', daLabel: 'Rabatkoder & Tilbud' },
  { path: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics', daLabel: 'Rapporter & Analyse' },
];

export default function AdminLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/90 dark:bg-[#070B14]/90 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-amber-400 p-[2px] shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-sky-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold Outfit text-slate-950 dark:text-white leading-tight">
              Cafe Vitus
            </h1>
            <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Staff & POS Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200",
                isActive 
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 scale-101" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{language === 'da' ? item.daLabel : item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200/80 dark:border-slate-700 font-bold text-xs shadow-sm"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
            <span>{isDark ? 'Lyst' : 'Mørkt'}</span>
          </button>
          <button
            onClick={toggleLanguage}
            className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200/80 dark:border-slate-700 font-bold text-xs shadow-sm uppercase"
          >
            <Globe className="w-4 h-4 text-sky-500" />
            <span>{language}</span>
          </button>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold text-xs transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{language === 'da' ? 'Log ud' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Top Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-[#070B14]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-sky-500" />
          <h1 className="text-lg font-black Outfit text-slate-950 dark:text-white">Cafe Vitus Admin</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <main className="flex-1 w-full min-h-screen pt-16 lg:pt-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
