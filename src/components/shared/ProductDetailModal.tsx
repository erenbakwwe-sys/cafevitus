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
      <div className="flex flex-col max-h-[85vh]">
        {/* Header Image */}
        {item.image && (
          <div className="relative w-full h-48 sm:h-64 shrink-0 bg-slate-100 dark:bg-slate-800">
            <img 
              src={item.image} 
              alt={item.name[language] || item.name.en} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                {item.name[language] || item.name.en}
              </h2>
            </div>
          </div>
        )}
        
        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 pb-24">
          {!item.image && (
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {item.name[language] || item.name.en}
            </h2>
          )}
          
          <div className="flex justify-between items-start mb-6 gap-4">
            <p className="text-slate-600 dark:text-slate-300">
              {item.description[language] || item.description.en}
            </p>
            <span className="text-xl font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
              {formatCurrency(item.price)}
            </span>
          </div>

          {item.customizations?.map(group => (
            <div key={group.id} className="mb-8">
              <div className="flex items-baseline justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {group.name[language] || group.name.en}
                </h4>
                {group.required && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                    {t.common.required}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.options.map(option => {
                  const isSelected = (selections[group.id] || []).includes(option.id);
                  const isRadio = group.type === 'single';
                  
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(group.id, option.id, group.type)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                        isSelected 
                          ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700 bg-white dark:bg-slate-800"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex items-center justify-center shrink-0 border",
                          isRadio ? "w-5 h-5 rounded-full" : "w-5 h-5 rounded-md",
                          isSelected ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300 dark:border-slate-600"
                        )}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={cn("font-medium", isSelected ? "text-sky-900 dark:text-sky-100" : "text-slate-700 dark:text-slate-300")}>
                          {option.name[language] || option.name.en}
                        </span>
                      </div>
                      {option.price > 0 ? (
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          +{formatCurrency(option.price)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          <div className="mb-6">
            <Textarea
              label={t.menu.specialNote}
              placeholder={t.menu.specialNotePlaceholder}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-10 text-center font-bold text-slate-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <Button
            fullWidth
            size="lg"
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
            icon={<ShoppingBag className="w-5 h-5" />}
            className="flex-1 text-base sm:text-lg"
          >
            {t.menu.addToCart} • {formatCurrency(calculateTotal())}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
