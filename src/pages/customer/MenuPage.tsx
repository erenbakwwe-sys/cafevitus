import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, ArrowRight, Sparkles, MapPin, Coffee, Utensils, Check } from 'lucide-react';
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
import { TableSelectModal } from '../../components/shared/TableSelectModal';
import { WaiterCallModal } from '../../components/shared/WaiterCallModal';
import { CartDrawer } from '../../components/shared/CartDrawer';
import { ProductDetailModal } from '../../components/shared/ProductDetailModal';

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
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  // When a table param is detected in URL from a QR scan
  useEffect(() => {
    if (urlTable) {
      setTableParam(urlTable);
      sessionStorage.setItem('cafe_vitus_table', urlTable);
      localStorage.setItem('cafe_vitus_table', urlTable);
      toast.success(language === 'da' ? `Bord ${urlTable} registreret via QR` : `Table ${urlTable} recognized via QR`);
    }
  }, [urlTable, language]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await seedDatabase(storage, true);
      const [cats, items] = await Promise.all([
        storage.getAll<Category>('categories'),
        storage.getAll<MenuItem>('menu'),
      ]);
      setCategories(cats.sort((a, b) => a.sortOrder - b.sortOrder));
      setMenuItems(items);
      setLoading(false);
    };

    init();

    const unsubMenu = storage.subscribe<MenuItem>('menu', (updated) => {
      setMenuItems(updated);
    });

    return () => unsubMenu();
  }, []);

  const handleTableSelect = (id: string) => {
    setSearchParams({ table: id });
    setTableParam(id);
    sessionStorage.setItem('cafe_vitus_table', id);
    localStorage.setItem('cafe_vitus_table', id);
    setIsTableModalOpen(false);
    toast.success(language === 'da' ? `Bord ${id} valgt` : `Table ${id} selected`);
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (item.customizations && item.customizations.length > 0) {
      setSelectedProduct(item);
    } else {
      addItem(item, 1, []);
      toast.success(language === 'da' ? `${item.name.da} tilføjet til kurv` : `${item.name.en} added to cart`);
    }
  };

  const tags = [
    { id: 'chef-pick', label: '★ ' + (language === 'da' ? 'Kokkens Valg' : "Chef's Pick") },
    { id: 'vegan', label: '🌱 ' + t.menu.vegan },
    { id: 'vegetarian', label: '🥗 ' + t.menu.vegetarian },
    { id: 'gluten-free', label: '🌾 ' + t.menu.glutenFree },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = !activeCategory || item.categoryId === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.name[language]?.toLowerCase().includes(query) ||
      item.name.en?.toLowerCase().includes(query) ||
      item.description[language]?.toLowerCase().includes(query) ||
      item.description.en?.toLowerCase().includes(query);
    const matchesTag = !activeTag || item.tags?.includes(activeTag as any);

    return matchesCategory && matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070C18] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Universal Header with Scanned Table Indicator */}
      <Header
        tableNumber={tableParam || null}
        onCartClick={() => setIsCartOpen(true)}
        onWaiterClick={() => setIsWaiterModalOpen(true)}
        onTableClick={() => setIsTableModalOpen(true)}
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 w-full">
        {/* Scanned Table Confirmation Bar for Mobile */}
        {tableParam && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-amber-900 dark:text-amber-300 text-xs font-bold shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {language === 'da' ? `Du bestiller til Bord ${tableParam}` : `Ordering for Table ${tableParam}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTableModalOpen(true)}
              className="text-[11px] underline font-semibold text-amber-700 dark:text-amber-400 cursor-pointer"
            >
              {language === 'da' ? 'Skift bord' : 'Change table'}
            </button>
          </div>
        )}

        {/* 3D Hero Scene */}
        <Hero3D />

        {/* Search & Dietary Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mt-5 sm:mt-6">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full pl-10 pr-8 py-3 rounded-2xl bg-white dark:bg-[#0E172A] text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
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
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border shadow-2xs whitespace-nowrap ${
                activeTag === null
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white'
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
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border shadow-2xs ${
                  activeTag === tag.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-84 bg-slate-200 dark:bg-slate-800/80 rounded-3xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 sm:py-20 bg-white dark:bg-[#0E172A] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-md mx-auto shadow-sm"
          >
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">{t.common.noResults}</h3>
            <p className="text-xs text-slate-500 mb-6">
              {searchQuery ? `Ingen retter matcher "${searchQuery}"` : (language === 'da' ? 'Prøv at vælge en anden kategori.' : 'Try selecting another category.')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory(null);
                setActiveTag(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold dark:bg-white dark:text-slate-950 cursor-pointer shadow-md"
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8"
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

      {/* Floating Bottom Sticky Cart Bar */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-8 sm:max-w-md z-40"
          >
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 px-5 sm:px-6 rounded-2xl bg-slate-950 dark:bg-amber-500 text-white dark:text-slate-950 font-extrabold shadow-2xl transition-all cursor-pointer border border-slate-800 dark:border-amber-400 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 dark:bg-slate-950 text-white dark:text-amber-400 flex items-center justify-center font-black text-xs shadow-md">
                  {itemCount}
                </div>
                <div className="text-left">
                  <div className="text-[11px] sm:text-xs opacity-80 uppercase tracking-wider font-bold">{t.cart.title}</div>
                  <div className="text-sm sm:text-base font-black">{formatCurrency(total)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold bg-white/20 dark:bg-black/15 px-3.5 py-2 rounded-xl group-hover:translate-x-1 transition-transform">
                <span>{t.cart.placeOrder}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070C18] py-8 text-center text-xs text-slate-500 mt-12">
        <p className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Cafe Vitus • Snekkersten Havn</p>
        <p className="text-[11px] text-slate-400 mt-1">Hvor havnen møder exceptionel kaffe, is & mad.</p>
        <p className="text-[10px] text-slate-400 mt-3">© {new Date().getFullYear()} Cafe Vitus. {language === 'da' ? 'Alle rettigheder forbeholdes.' : 'All rights reserved.'}</p>
      </footer>

      {/* Modals */}
      <TableSelectModal
        isOpen={isTableModalOpen}
        onSelect={handleTableSelect}
      />

      <WaiterCallModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableId={tableParam}
        tableNumber={tableParam}
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
