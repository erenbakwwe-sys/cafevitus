import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Star, Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { MenuItem } from '../../types';
import { TiltCard } from './TiltCard';

export interface ProductCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onClick: (item: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onAddToCart, onClick }) => {
  const { language, t } = useLanguage();
  const { state, updateQuantity, removeItem } = useCart();
  
  const isAvailable = item.available !== false;
  const isChefPick = item.tags?.includes('chef-pick');

  // Check cart quantity
  const cartItem = state.items.find((ci) => ci.menuItem.id === item.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (item.customizations && item.customizations.length > 0 && cartQuantity === 0) {
      onClick(item);
    } else if (cartItem) {
      updateQuantity(cartItem.id, cartQuantity + 1);
    } else {
      onAddToCart(item);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cartItem) return;
    if (cartQuantity === 1) {
      removeItem(cartItem.id);
    } else {
      updateQuantity(cartItem.id, cartQuantity - 1);
    }
  };

  return (
    <TiltCard
      onClick={() => isAvailable && onClick(item)}
      className="h-full"
    >
      <div
        className={cn(
          "luxury-card flex flex-col overflow-hidden cursor-pointer h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-xl transition-all",
          !isAvailable && "opacity-60 grayscale-[0.6] cursor-not-allowed"
        )}
      >
        {/* Food Photo Container */}
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name[language] || item.name.en} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 h-full">
              <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
              <span className="text-xs font-bold uppercase tracking-wider">Cafe Vitus</span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-20">
            {isChefPick && (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider shadow-lg backdrop-blur-md border border-amber-500/30"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>Chef's Choice</span>
              </motion.div>
            )}
            {!isAvailable && (
              <div className="px-3 py-1 rounded-full bg-red-600/90 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md backdrop-blur-md">
                {t.menu.outOfStock}
              </div>
            )}
          </div>
        </div>

        {/* Card Content Section */}
        <div className="flex flex-col flex-1 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug line-clamp-1">
              {item.name[language] || item.name.en}
            </h3>
          </div>
          
          <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal flex-1">
            {item.description[language] || item.description.en}
          </p>

          {/* Price & Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
            <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
              {formatCurrency(item.price)}
            </div>

            {cartQuantity > 0 ? (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold hover:bg-slate-200 transition-colors cursor-pointer shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-extrabold text-xs px-1 min-w-[18px] text-center text-slate-900 dark:text-white">
                  {cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-7 h-7 rounded-xl flex items-center justify-center bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleIncrement}
                disabled={!isAvailable}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{item.customizations && item.customizations.length > 0 ? 'Tilpas' : 'Tilføj'}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
};
