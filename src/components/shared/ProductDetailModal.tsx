import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Check, Sparkles, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { cn, formatCurrency } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { MenuItem, SelectedCustomization, CustomizationOption } from '../../types';

export interface ProductDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ item, isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      setNotes('');
      
      const initialSelections: Record<string, string[]> = {};
      item.customizations?.forEach(group => {
        if (group.required && group.options.length > 0) {
          initialSelections[group.id] = [group.options[0].id];
        } else {
          initialSelections[group.id] = [];
        }
      });
      setSelections(initialSelections);
    }
  }, [isOpen, item]);

  if (!item) return null;

  const toggleOption = (groupId: string, optionId: string, type: 'single' | 'multiple') => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      const isSelected = current.includes(optionId);
      
      if (type === 'single') {
        return { ...prev, [groupId]: [optionId] };
      }
      
      if (isSelected) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      }
      
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const calculateTotal = () => {
    let total = item.price;
    item.customizations?.forEach(group => {
      const selectedIds = selections[group.id] || [];
      selectedIds.forEach(optionId => {
        const option = group.options.find(o => o.id === optionId);
        if (option?.price) {
          total += option.price;
        }
      });
    });
    return total * quantity;
  };

  const handleAddToCart = () => {
    const selectedCustomizations: SelectedCustomization[] = (item.customizations || [])
      .map(group => {
        const selectedIds = selections[group.id] || [];
        const selectedOptions = group.options.filter(opt => selectedIds.includes(opt.id));
        return {
          customizationId: group.id,
          customizationName: group.name,
          selectedOptions,
        };
      })
      .filter(c => c.selectedOptions.length > 0);

    addItem(item, quantity, selectedCustomizations, notes || undefined);
    onClose();
  };

  const isAddToCartDisabled = item.customizations?.some(
    group => group.required && (!selections[group.id] || selections[group.id].length === 0)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col max-h-[88vh] sm:max-h-[85vh]">
        {/* Header Image with Rich Vignette and Close Button */}
        {item.image && (
          <div className="relative w-full h-48 sm:h-64 shrink-0 bg-slate-900 overflow-hidden">
            <img 
              src={item.image} 
              alt={item.name[language] || item.name.en} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <div className="absolute bottom-4 left-5 right-5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full backdrop-blur-md inline-block mb-1 border border-amber-300/30">
                Cafe Vitus Snekkersten
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md font-serif-luxury leading-tight">
                {item.name[language] || item.name.en}
              </h2>
            </div>
          </div>
        )}
        
        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar">
          {!item.image && (
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-serif-luxury">
              {item.name[language] || item.name.en}
            </h2>
          )}
          
          <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {item.description[language] || item.description.en}
            </p>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">{t.productCard.basePrice}</span>
              <span className="text-lg sm:text-xl font-black text-slate-950 dark:text-white whitespace-nowrap Outfit">
                {formatCurrency(item.price)}
              </span>
            </div>
          </div>

          {/* Customization Options */}
          {item.customizations?.map(group => (
            <div key={group.id} className="space-y-3 pt-1">
              <div className="flex items-baseline justify-between">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{group.name[language] || group.name.en}</span>
                </h4>
                {group.required ? (
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/30">
                    {t.common.required}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.common.optional}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                {group.options.map(option => {
                  const isSelected = (selections[group.id] || []).includes(option.id);
                  const isRadio = group.type === 'single';
                  
                  return (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(group.id, option.id, group.type)}
                      className={cn(
                        "flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all text-left cursor-pointer min-h-[50px]",
                        isSelected 
                          ? "border-amber-400 bg-amber-400/15 dark:bg-amber-400/20 shadow-xs ring-1 ring-amber-400/40"
                          : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center shrink-0 border transition-all",
                          isRadio ? "w-5 h-5 rounded-full" : "w-5 h-5 rounded-lg",
                          isSelected ? "border-amber-400 bg-amber-400 text-slate-950 shadow-xs" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        )}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className={cn("text-xs sm:text-sm font-extrabold", isSelected ? "text-slate-950 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                          {option.name[language] || option.name.en}
                        </span>
                      </div>
                      {option.price > 0 ? (
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 Outfit">
                          +{formatCurrency(option.price)}
                        </span>
                      ) : null}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <Textarea
              label={t.menu.specialNote}
              placeholder={t.menu.specialNotePlaceholder}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="resize-none text-xs rounded-2xl"
            />
          </div>
        </div>

        {/* Sticky Footer actions with safe area padding */}
        <div className="sticky bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/90 dark:bg-[#0E172A]/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 shrink-0 border border-slate-200 dark:border-slate-700">
            <motion.button
              whileTap={{ scale: 0.85 }}
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </motion.button>
            <span className="w-9 text-center font-black text-sm text-slate-950 dark:text-white Outfit">
              {quantity}
            </span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
          </div>
          
          <Button
            fullWidth
            size="lg"
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            icon={<ShoppingBag className="w-4 h-4" />}
            className="flex-1 text-xs sm:text-sm font-black py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-slate-950 shadow-lg cursor-pointer"
          >
            <span>{t.menu.addToCart} • {formatCurrency(calculateTotal())}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

