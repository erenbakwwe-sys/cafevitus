import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, 
  CreditCard, Banknote, Store, Sparkles, Tag, Check
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency, cn } from '../../lib/utils';
import { storage } from '../../lib/storage';
import { toast } from 'sonner';
import { Order, Coupon } from '../../types';
import { useNavigate } from 'react-router-dom';

import { checkOrderRateLimit, recordOrderPlaced } from '../../lib/security';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  tableNumber: string;
}

export function CartDrawer({ isOpen, onClose, tableId, tableNumber }: CartDrawerProps) {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const {
    state,
    updateQuantity,
    removeItem,
    setTip,
    setCoupon,
    removeCoupon,
    setPaymentMethod,
    clearCart,
    subtotal,
    total,
    itemCount,
  } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCodeInput] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const paymentMethods = [
    { id: 'card' as const, icon: <CreditCard className="h-5 w-5" />, label: t.cart.payCard },
    { id: 'cash' as const, icon: <Banknote className="h-5 w-5" />, label: t.cart.payCash },
    { id: 'counter' as const, icon: <Store className="h-5 w-5" />, label: t.cart.payCounter },
  ];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const coupons = await storage.getAll<Coupon>('coupons');
      const coupon = coupons.find(
        (c) => c.code.toLowerCase() === couponCode.toLowerCase() && c.active && c.expiresAt > Date.now()
      );
      if (coupon) {
        const discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
        setCoupon(coupon.code, discount);
        toast.success(t.cart.couponApplied);
      } else {
        toast.error(t.cart.couponInvalid);
      }
    } catch {
      toast.error(t.cart.couponInvalid);
    }
  };

  const handlePlaceOrder = async () => {
    if (state.items.length === 0) return;

    // 1. Anti-Spam Rate Limit Check
    const rateCheck = checkOrderRateLimit(tableId || '5');
    if (!rateCheck.allowed) {
      toast.error(
        language === 'da'
          ? `Vent venligst ${rateCheck.waitSeconds} sekunder før næste bestilling (Anti-Spam).`
          : `Please wait ${rateCheck.waitSeconds} seconds before placing another order.`
      );
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderItems = state.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: item.menuItem.price,
        selectedCustomizations: item.selectedCustomizations,
        customerNote: item.customerNote,
        totalPrice: item.totalPrice,
      }));

      await storage.add<Order>('orders', {
        tableId: tableId || '5',
        items: orderItems,
        subtotal,
        discount: state.couponDiscount,
        tip: state.tipPercentage ? subtotal * (state.tipPercentage / 100) : state.tip,
        total,
        status: 'pending',
        paymentMethod: state.paymentMethod,
        customerNote: state.customerNote,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);

      await storage.update('tables', tableId || '5', { status: 'occupied' });
      recordOrderPlaced(tableId || '5');
      clearCart();
      toast.success(t.cart.orderPlaced);
      toast.info(
        language === 'da'
          ? 'Mange tak! Del gerne din oplevelse på TripAdvisor ⭐⭐⭐⭐⭐'
          : 'Thank you! We would love your review on TripAdvisor ⭐⭐⭐⭐⭐',
        { duration: 6000 }
      );
      onClose();
      navigate(`/order-tracking?table=${tableId || '5'}`);
    } catch {
      toast.error(t.cart.orderFailed);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer / Bottom Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col shadow-2xl ${
              isDark ? 'bg-[#0A142A] text-slate-100' : 'bg-[#FDFCF7] text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 p-4 sm:p-5 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg sm:text-xl Outfit">{t.cart.title}</h2>
                  <p className="text-xs text-slate-400 font-bold">
                    Bord {tableNumber || tableId || '5'} • {itemCount} {itemCount === 1 ? 'vare' : 'varer'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 opacity-40 text-amber-500" />
                  </div>
                  <p className="font-bold text-base text-slate-800 dark:text-slate-200">{t.cart.empty}</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">{t.cart.emptyDescription}</p>
                </div>
              ) : (
                state.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs"
                  >
                    <div className="flex-1 pr-3">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                        {item.menuItem.name[language] || item.menuItem.name.en}
                      </h4>
                      
                      {item.selectedCustomizations?.map((c) => (
                        <p key={c.customizationId} className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          {c.selectedOptions.map((o) => o.name[language] || o.name.en).join(', ')}
                        </p>
                      ))}

                      {item.customerNote && (
                        <p className="text-[11px] italic text-amber-500/90 mt-0.5">
                          "{item.customerNote}"
                        </p>
                      )}

                      <div className="mt-2 font-black text-xs sm:text-sm text-slate-950 dark:text-amber-400">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {state.items.length > 0 && (
                <>
                  {/* Tip Selection */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.cart.tipLabel}</h3>
                      {state.tip > 0 && (
                        <span className="text-xs font-bold text-amber-500">+{formatCurrency(state.tip)}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 5, 10, 15].map((pct) => {
                        const isSelected = state.tipPercentage === pct || (!state.tipPercentage && pct === 0 && state.tip === 0);
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setTip(pct === 0 ? 0 : (subtotal * pct) / 100, pct)}
                            className={cn(
                              "py-2 rounded-xl text-xs font-black transition-all cursor-pointer border min-h-[38px]",
                              isSelected
                                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                            )}
                          >
                            {pct === 0 ? t.cart.tipNone : `${pct}%`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{t.cart.couponLabel}</h3>
                    {state.couponCode ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          <span>{state.couponCode} (-{formatCurrency(state.couponDiscount)})</span>
                        </div>
                        <button type="button" onClick={removeCoupon} className="text-slate-400 hover:text-red-500 font-bold p-1">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          placeholder="F.eks. SOMMER10"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-700 font-extrabold text-xs cursor-pointer hover:opacity-90"
                        >
                          {t.cart.couponApply}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{t.cart.paymentMethod}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all cursor-pointer gap-1.5 min-h-[64px]",
                            state.paymentMethod === method.id
                              ? "bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm font-black"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          )}
                        >
                          {method.icon}
                          <span className="text-[10px] font-extrabold leading-tight">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sticky Footer Total & Place Order Button */}
            {state.items.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-white/95 dark:bg-[#070C18]/95 backdrop-blur-md pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="space-y-1 text-xs font-semibold mb-3">
                  <div className="flex justify-between text-slate-500">
                    <span>{t.common.subtotal}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {state.couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>{t.common.discount}</span>
                      <span>-{formatCurrency(state.couponDiscount)}</span>
                    </div>
                  )}
                  {state.tip > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                      <span>{t.common.tip}</span>
                      <span>+{formatCurrency(state.tip)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5 text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    <span>{t.common.total}</span>
                    <span className="text-lg font-black">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={state.items.length === 0 || isPlacingOrder}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>{isPlacingOrder ? t.common.loading : t.cart.placeOrder}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
