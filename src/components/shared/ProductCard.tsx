import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Star, Image as ImageIcon, Sparkles, Check, Heart } from 'lucide-react';
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
  const [justAdded, setJustAdded] = useState(false);
  
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
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 900);
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

  const getDietaryTag = () => {
    if (item.tags?.includes('vegan')) return { label: t.menu.vegan, icon: '🌱', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (item.tags?.includes('vegetarian')) return { label: t.menu.vegetarian, icon: '🥗', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30' };
    if (item.tags?.includes('gluten-free')) return { label: t.menu.glutenFree, icon: '🌾', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' };
    return null;
  };

  const dietary = getDietaryTag();

  return (
    <TiltCard
      onClick={() => isAvailable && onClick(item)}
      className="h-full"
    >
      <div
        className={cn(
          "luxury-card group flex flex-col overflow-hidden cursor-pointer h-full relative",
          !isAvailable && "opacity-60 grayscale-[0.6] cursor-not-allowed"
        )}
      >
        {/* Food Photo Container */}
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name[language] || item.name.en} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 h-full">
              <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
              <span className="text-xs font-bold uppercase tracking-wider">Cafe Vitus</span>
            </div>
          )}

          {/* Vignette Overlay for Crisp Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none" />

          {/* Floating Badges */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-20">
            {isChefPick && (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider shadow-lg backdrop-blur-md border border-amber-400/40 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-shimmer-gold opacity-50 pointer-events-none" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse shrink-0" />
                <span className="relative z-10">{t.menu.chefPick}</span>
              </motion.div>
            )}
            
            {dietary && (
              <div className={cn("px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider shadow-sm backdrop-blur-md border flex items-center gap-1 bg-white/90 dark:bg-slate-900/90", dietary.bg)}>
                <span>{dietary.icon}</span>
                <span>{dietary.label}</span>
              </div>
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
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {item.name[language] || item.name.en}
            </h3>
          </div>
          
          <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-medium flex-1">
            {item.description[language] || item.description.en}
          </p>

          {/* Price & Action Row */}
          <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">{t.productCard.price}</span>
              <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white Outfit">
                {formatCurrency(item.price)}
              </div>
            </div>

            {cartQuantity > 0 ? (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold hover:bg-slate-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="font-black text-xs px-1.5 min-w-[20px] text-center text-slate-950 dark:text-white Outfit">
                  {cartQuantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  onClick={handleIncrement}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={handleIncrement}
                disabled={!isAvailable}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-md transition-all cursor-pointer min-h-[40px]",
                  justAdded 
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-950 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950"
                )}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t.productCard.added}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{item.customizations && item.customizations.length > 0 ? t.menu.customize : t.common.add}</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

      </div>
    </TiltCard>
  );
};

