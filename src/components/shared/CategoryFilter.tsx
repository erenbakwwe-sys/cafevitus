import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Utensils, Salad, Coffee, Wine, IceCream, Croissant, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { Category } from '../../types';

export interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, activeCategory, onSelect }) => {
  const { language, t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'smorrebrod': return <Utensils className="w-4 h-4" />;
      case 'salads': return <Salad className="w-4 h-4" />;
      case 'coffee': return <Coffee className="w-4 h-4" />;
      case 'drinks': return <Wine className="w-4 h-4" />;
      case 'desserts': return <IceCream className="w-4 h-4" />;
      case 'breakfast': return <Croissant className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-16 sm:top-[112px] z-30 w-full bg-white/95 dark:bg-[#070C18]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 py-2 sm:py-3 shadow-xs">
      <div 
        ref={scrollRef}
        className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar"
      >
        {/* All Items Pill */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          data-active={activeCategory === null}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer shrink-0 min-h-[42px] z-10",
            activeCategory === null 
              ? "text-slate-950 dark:text-slate-950 font-black" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
          )}
        >
          {activeCategory === null && (
            <motion.div
              layoutId="activeCategoryPill"
              className="absolute inset-0 bg-amber-400 dark:bg-amber-400 rounded-2xl shadow-md -z-10"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <LayoutGrid className="w-4 h-4 shrink-0" />
          <span>{t.menu.allItems}</span>
        </button>

        {/* Category List */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              data-active={isActive}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer shrink-0 min-h-[42px] whitespace-nowrap z-10",
                isActive 
                  ? "text-slate-950 dark:text-slate-950 font-black" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-amber-400 dark:bg-amber-400 rounded-2xl shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {getCategoryIcon(cat.id)}
              <span>{cat.name[language] || cat.name.en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

