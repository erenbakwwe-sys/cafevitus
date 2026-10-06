import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, ArrowRight, MapPin, Coffee, Utensils, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { storage } from '../../lib/storage';
import { seedDatabase } from '../../data/seed';
import { Category, MenuItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

import { Header } from '../../components/layout/Header';
import { Hero3D } from '../../components/shared/Hero3D';
import { CategoryFilter } from '../../components/shared/CategoryFilter';
import { ProductCard } from '../../components/shared/ProductCard';
import { WaiterCallModal } from '../../components/shared/WaiterCallModal';
import { CartDrawer } from '../../components/shared/CartDrawer';
import { ProductDetailModal } from '../../components/shared/ProductDetailModal';
import { MealTimeSelector, getCurrentMealPeriod, SelectedMealMode } from '../../components/shared/MealTimeSelector';
import { TableReservationModal } from '../../components/shared/TableReservationModal';
import { Calendar, Award } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function MenuPage() {
  const [searchParams] = useSearchParams();
  
  // Read table from URL params or stored session
  const urlTable = searchParams.get('table') || searchParams.get('t') || searchParams.get('tableId') || searchParams.get('masa');
  const storedTable = typeof window !== 'undefined' ? (sessionStorage.getItem('cafe_vitus_table') || localStorage.getItem('cafe_vitus_table')) : null;
  
  const [tableParam, setTableParam] = useState<string>(urlTable || storedTable || '1');
  
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const { addItem, itemCount, total } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [selectedMealMode, setSelectedMealMode] = useState<SelectedMealMode>('auto');
  const [loading, setLoading] = useState(true);

  // When a table param is detected in URL from a QR scan
  useEffect(() => {
    if (urlTable) {
      setTableParam(urlTable);
      sessionStorage.setItem('cafe_vitus_table', urlTable);
      localStorage.setItem('cafe_vitus_table', urlTable);
    }
  }, [urlTable, language]);

  useEffect(() => {
    const init = async () => {
      // 1. Instant cache load (0ms): If local cache already has items, render immediately!
      const cachedCats = storage.getLocal<Category>('categories');
      const cachedItems = storage.getLocal<MenuItem>('menu');
      if (cachedItems && cachedItems.length > 0) {
        setCategories(cachedCats.sort((a, b) => a.sortOrder - b.sortOrder));
        setMenuItems(cachedItems);
        setLoading(false);
      } else {
        setLoading(true);
      }

      // 2. Ensure database is seeded with full Danish menu
      await seedDatabase(storage, false);

      // 3. Sync latest data
      const [cats, items] = await Promise.all([
        storage.getAll<Category>('categories'),
        storage.getAll<MenuItem>('menu'),
      ]);
      if (items.length > 0) {
        setCategories(cats.sort((a, b) => a.sortOrder - b.sortOrder));
        setMenuItems(items);
      }
      setLoading(false);
    };

    init();

    const unsubMenu = storage.subscribe<MenuItem>('menu', (updated) => {
      if (updated && updated.length > 0) {
        setMenuItems(updated);
      }
    });

    return () => unsubMenu();
  }, []);

  const handleQuickAdd = (item: MenuItem) => {
    if (item.customizations && item.customizations.length > 0) {
      setSelectedProduct(item);
    } else {
      addItem(item, 1, []);
      const itemName = item.name[language] || item.name.en || item.name.da;
      toast.success(`${itemName} ${t.menu.itemAdded}`);
    }
  };

  const tags = [
    { id: 'chef-pick', label: '★ ' + t.menu.chefPick },
    { id: 'vegan', label: '🌱 ' + t.menu.vegan },
    { id: 'vegetarian', label: '🥗 ' + t.menu.vegetarian },
    { id: 'gluten-free', label: '🌾 ' + t.menu.glutenFree },
  ];

  // Dynamic time-based meal period determination
  const currentAutoPeriod = getCurrentMealPeriod();
  const effectivePeriod = selectedMealMode === 'auto' ? currentAutoPeriod : selectedMealMode;

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = !activeCategory || item.categoryId === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.name[language]?.toLowerCase().includes(query) ||
      item.name.en?.toLowerCase().includes(query) ||
      item.description[language]?.toLowerCase().includes(query) ||
      item.description.en?.toLowerCase().includes(query);
    const matchesTag = !activeTag || item.tags?.includes(activeTag as any);

    // Dynamic Time-Based Meal Period Filtering:
    // If the customer hasn't selected a specific category tab, filter by the current meal period.
    // If the customer explicitly chooses a category tab (e.g. 'Morgenmad'), respect their choice!
    let matchesMealPeriod = true;
    if (!activeCategory && effectivePeriod !== 'all-day') {
      if (item.mealPeriods && item.mealPeriods.length > 0) {
        matchesMealPeriod = item.mealPeriods.includes(effectivePeriod as any) || item.mealPeriods.includes('all-day');
      } else {
        if (effectivePeriod === 'breakfast') {
          matchesMealPeriod = item.categoryId === 'breakfast' || item.categoryId === 'coffee';
        } else if (effectivePeriod === 'lunch') {
          matchesMealPeriod = item.categoryId === 'smorrebrod' || item.categoryId === 'salads' || item.categoryId === 'coffee' || item.categoryId === 'drinks';
        } else if (effectivePeriod === 'dinner') {
          matchesMealPeriod = item.categoryId === 'smorrebrod' || item.categoryId === 'salads' || item.categoryId === 'drinks' || item.categoryId === 'desserts';
        }
      }
    }

    return matchesCategory && matchesSearch && matchesTag && matchesMealPeriod;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2] dark:bg-[#050A14] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-400 pb-20">
      {/* Universal Header with Scanned Table Indicator & Table Reservation */}
      <Header
        tableNumber={tableParam || null}
        onCartClick={() => setIsCartOpen(true)}
        onWaiterClick={() => setIsWaiterModalOpen(true)}
        onReserveClick={() => setIsReservationModalOpen(true)}
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-1 w-full">
        {/* Scanned Table Confirmation Bar for Mobile */}
        {tableParam && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3.5 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-between text-amber-900 dark:text-amber-300 text-xs font-black shadow-2xs backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-beacon" />
              <span>
                {`${t.table.tableNumber} ${tableParam} ${t.productCard.scannedTableActive}`}
              </span>
            </div>
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
              {t.productCard.harborLocation}
            </div>
          </motion.div>
        )}

        {/* 3D Hero Scene */}
        <Hero3D />

        {/* Quick Table Reservation Banner */}
        <div className="mt-4 p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-serif-luxury">
                {t.reservations.quickReserve}
              </h3>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {language === 'da'
                  ? 'Sikr dit bord forud • 50 DKK No-Show depositum modregnes regningen'
                  : 'Guarantee your harbor table • 50 DKK deposit credited to bill'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsReservationModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer whitespace-nowrap shadow-sm self-start sm:self-auto"
          >
            {t.reservations.bookTable}
          </button>
        </div>

        {/* Meal Time Dynamic Switcher (Corner / Top Bar Selector) */}
        <div className="mt-4">
          <MealTimeSelector
            selectedMode={selectedMealMode}
            onSelectMode={setSelectedMealMode}
          />
        </div>

        {/* Search & Dietary Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full pl-10 pr-8 py-3 rounded-2xl bg-white dark:bg-[#0E172A] text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200/90 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-bold shadow-2xs transition-all min-h-[44px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>


          {/* Dietary Tag Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border shadow-2xs whitespace-nowrap min-h-[40px] flex items-center ${
                activeTag === null
                  ? 'bg-slate-950 text-white border-slate-950 dark:bg-amber-400 dark:text-slate-950 dark:border-amber-400 shadow-sm'
                  : 'bg-white dark:bg-[#0E172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.common.all}
            </button>
            {tags.map((tag) => (
              <button
                type="button"
                key={tag.id}
                onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap border shadow-2xs min-h-[40px] flex items-center ${
                  activeTag === tag.id
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-sm'
                    : 'bg-white dark:bg-[#0E172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Category Bar */}
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Products Grid (1 Col Mobile, 2 Col Tablet, 3 Col Desktop) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-9">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-slate-200/70 dark:bg-slate-800/80 rounded-3xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 sm:py-20 bg-white dark:bg-[#0E172A] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md mx-auto shadow-sm"
          >
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg sm:text-xl font-bold mb-1 font-serif-luxury">{t.common.noResults}</h3>
            <p className="text-xs text-slate-500 mb-5 font-medium leading-relaxed">
              {searchQuery 
                ? `${t.menu.noMatch} "${searchQuery}"`
                : t.menu.tryAnotherCategory}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory(null);
                setActiveTag(null);
              }}
              className="px-6 py-3 rounded-2xl bg-slate-950 text-white text-xs font-bold dark:bg-amber-400 dark:text-slate-950 cursor-pointer shadow-md"
            >
              {t.menu.allItems}
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={activeCategory || 'all'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7"
          >
            {filteredItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <ProductCard
                  item={item}
                  onClick={(prod) => setSelectedProduct(prod)}
                  onAddToCart={handleQuickAdd}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Floating Bottom Sticky Cart Bar on Mobile */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 240 }}
            className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-8 sm:max-w-md z-40 pb-[env(safe-area-inset-bottom)]"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 px-4 sm:px-6 rounded-2xl bg-slate-950 dark:bg-amber-400 text-white dark:text-slate-950 font-black shadow-2xl transition-all cursor-pointer border border-slate-800 dark:border-amber-300 group min-h-[58px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400 dark:bg-slate-950 text-slate-950 dark:text-amber-400 flex items-center justify-center font-black text-xs shadow-md">
                  {itemCount}
                </div>
                <div className="text-left">
                  <div className="text-[10px] sm:text-xs opacity-80 uppercase tracking-wider font-extrabold">{t.cart.title}</div>
                  <div className="text-sm sm:text-base font-black Outfit">{formatCurrency(total)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-black bg-white/20 dark:bg-black/15 px-4 py-2.5 rounded-xl group-hover:translate-x-1 transition-transform">
                <span>{t.cart.placeOrder}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#060D1E]/80 backdrop-blur-md py-10 text-center text-xs text-slate-500 mt-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Coffee className="w-4 h-4" />
            </div>
            <p className="font-extrabold text-slate-900 dark:text-white text-base font-serif-luxury">
              Cafe Vitus • {t.productCard.harborLocation}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">{t.common.slogan}</p>
          <p className="text-[11px] text-slate-400 mt-4">© {new Date().getFullYear()} Cafe Vitus. {t.productCard?.allRightsReserved || 'All rights reserved.'}</p>

          {/* Fødevarestyrelsen Elite-Smiley Certified Badge */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold shadow-2xs">
              <Award className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.egenkontrol?.smileyBadge || 'Elite-Smiley'} (100% Godkendt Egenkontrol • Enos Standard)</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsReservationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-black transition-all shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.reservations.bookTable}</span>
            </button>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.admin.title}</span>
            </Link>
          </div>
        </div>
      </footer>


      {/* Modals */}
      <WaiterCallModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableId={tableParam}
        tableNumber={tableParam}
      />

      <TableReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableId={tableParam}
        tableNumber={tableParam}
      />

      <ProductDetailModal
        isOpen={!!selectedProduct}
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
export default MenuPage;

