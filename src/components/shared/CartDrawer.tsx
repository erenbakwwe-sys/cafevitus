import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Banknote, CreditCard, Store, Ticket, Trash2, ArrowRight } from 'lucide-react';
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col shadow-2xl ${
              isDark ? 'bg-[#0A142A] text-slate-100' : 'bg-[#FDFCF7] text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 p-5 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-lg font-serif-luxury">{t.cart.title}</h2>
                  <p className="text-xs text-slate-400">
                    Bord {tableNumber || '5'} • {itemCount} {itemCount === 1 ? 'ret' : 'retter'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {state.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-slate-400 space-y-3 py-16">
                  <ShoppingBag className="h-16 w-16 opacity-30 stroke-[1.5]" />
                  <p className="font-bold font-serif-luxury text-lg text-slate-700 dark:text-slate-300">{t.cart.empty}</p>
                  <p className="text-xs text-center max-w-xs">{t.cart.emptyDescription}</p>
                </div>
              ) : (
                <>
                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#060D1E] border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm font-serif-luxury">{item.menuItem.name[language] || item.menuItem.name.en}</h4>
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>

                      {item.selectedCustomizations.length > 0 && (
                        <p className="text-[11px] text-slate-400 mb-3">
                          {item.selectedCustomizations
                            .flatMap((c) => c.selectedOptions)
                            .map((opt) => opt.name[language] || opt.name.en)
                            .join(', ')}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-semibold p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Tip Section */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">{t.cart.tipLabel}</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 5, 10, 15].map((percentage) => {
                        const tipAmount = (subtotal * percentage) / 100;
                        const isSelected = state.tipPercentage === percentage;

                        return (
                          <button
                            key={percentage}
                            onClick={() => setTip(tipAmount, percentage === 0 ? null : percentage)}
                            className={cn(
                              "py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                              isSelected
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            )}
                          >
                            {percentage === 0 ? t.cart.tipNone : `${percentage}%`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">{t.cart.couponLabel}</h3>
                    {state.couponCode ? (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-700 dark:text-emerald-400">
                        <div className="flex items-center space-x-2 text-xs font-bold">
                          <Ticket className="h-4 w-4" />
                          <span>{state.couponCode}</span>
                          <span>(-{formatCurrency(state.couponDiscount)})</span>
                        </div>
                        <button onClick={removeCoupon} className="hover:opacity-75">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          placeholder="f.eks. WELCOME10"
                          className="flex-1 rounded-xl px-3.5 py-2 text-xs outline-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase font-mono font-semibold"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode}
                          className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-4 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer"
                        >
                          {t.cart.couponApply}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">{t.cart.paymentMethod}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all cursor-pointer gap-1.5",
                            state.paymentMethod === method.id
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700"
                          )}
                        >
                          {method.icon}
                          <span className="text-[11px] font-bold leading-tight">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Total & Place Order Button */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-[#060D1E]/60 backdrop-blur-md">
              <div className="space-y-1.5 text-xs font-semibold mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>{t.common.subtotal}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {state.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>{t.common.discount}</span>
                    <span>-{formatCurrency(state.couponDiscount)}</span>
                  </div>
                )}
                {state.tip > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>{t.common.tip}</span>
                    <span>{formatCurrency(state.tip)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-base font-black text-slate-900 dark:text-white">
                  <span>{t.common.total}</span>
                  <span className="text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={state.items.length === 0 || isPlacingOrder}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-sm shadow-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isPlacingOrder ? t.common.loading : t.cart.placeOrder}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
