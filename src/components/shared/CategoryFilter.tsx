import React, { useRef, useEffect } from 'react';
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
    if (activeCategory && scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-16 sm:top-20 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 shadow-xs">
      <div 
        ref={scrollRef}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          onClick={() => onSelect(null)}
          data-active={activeCategory === null}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 border",
            activeCategory === null 
              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-sm" 
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>{t.menu.allItems}</span>
        </button>

        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              data-active={isActive}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 border whitespace-nowrap",
                isActive 
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name[language] || cat.name.en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
