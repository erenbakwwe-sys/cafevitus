import React, { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
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
        {/* Header Image */}
        {item.image && (
          <div className="relative w-full h-44 sm:h-60 shrink-0 bg-slate-100 dark:bg-slate-800">
            <img 
              src={item.image} 
              alt={item.name[language] || item.name.en} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                {item.name[language] || item.name.en}
              </h2>
            </div>
          </div>
        )}
        
        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!item.image && (
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {item.name[language] || item.name.en}
            </h2>
          )}
          
          <div className="flex justify-between items-start gap-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.description[language] || item.description.en}
            </p>
            <span className="text-lg sm:text-xl font-black text-slate-950 dark:text-white whitespace-nowrap">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.customizations?.map(group => (
            <div key={group.id} className="space-y-3 pt-2">
              <div className="flex items-baseline justify-between">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {group.name[language] || group.name.en}
                </h4>
                {group.required && (
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t.common.required}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                {group.options.map(option => {
                  const isSelected = (selections[group.id] || []).includes(option.id);
                  const isRadio = group.type === 'single';
                  
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(group.id, option.id, group.type)}
                      className={cn(
                        "flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all text-left cursor-pointer min-h-[48px]",
                        isSelected 
                          ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center shrink-0 border transition-all",
                          isRadio ? "w-5 h-5 rounded-full" : "w-5 h-5 rounded-lg",
                          isSelected ? "border-amber-500 bg-amber-500 text-slate-950" : "border-slate-300 dark:border-slate-600"
                        )}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className={cn("text-xs sm:text-sm font-bold", isSelected ? "text-slate-950 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                          {option.name[language] || option.name.en}
                        </span>
                      </div>
                      {option.price > 0 ? (
                        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                          +{formatCurrency(option.price)}
                        </span>
                      ) : null}
                    </button>
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
              className="resize-none text-xs"
            />
          </div>
        </div>

        {/* Sticky Footer actions with safe area padding */}
        <div className="sticky bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/95 dark:bg-[#0E172A]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 shrink-0 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-black text-sm text-slate-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <Button
            fullWidth
            size="lg"
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            icon={<ShoppingBag className="w-4 h-4" />}
            className="flex-1 text-xs sm:text-sm font-black py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:text-slate-950"
          >
            <span>{t.menu.addToCart} • {formatCurrency(calculateTotal())}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
