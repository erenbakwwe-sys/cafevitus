import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, ShieldCheck, CreditCard, Store, 
  Sparkles, Printer, ArrowRight, UserCheck
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency, formatTime, cn } from '../../lib/utils';
import { storage } from '../../lib/storage';
import { playPaymentSuccessSound } from '../../lib/audio';
import { Order, PaymentMethod } from '../../types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { checkOrderRateLimit, recordOrderPlaced, isTableSessionVerified, escapeHtml } from '../../lib/security';
import { Coupon } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  tableNumber: string;
}

export function CheckoutModal({ isOpen, onClose, tableId, tableNumber }: CheckoutModalProps) {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const { state, clearCart, subtotal, total } = useCart();
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mobilepay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Card Form Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('SOFIE MØLLER');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // MobilePay Field
  const [mobilePhone, setMobilePhone] = useState('+45 28 49 10 20');

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  const handleQuickFillCard = () => {
    setCardNumber('4571 8920 1849 3920');
    setCardHolder('ANNA LINDQVIST');
    setCardExpiry('11/28');
    setCardCvv('784');
    toast.success(t.checkout.quickFillTest || 'Testkort udfyldt');
  };

  const handleProcessPayment = async () => {
    if (state.items.length === 0) return;

    // 0. Strict QR Verification Enforcement
    if (!isTableSessionVerified(tableNumber || tableId)) {
      toast.error(t.security.securityLockedNotice);
      return;
    }

    // 1. Rate Limit Check
    const rateCheck = checkOrderRateLimit(tableId || '5');
    if (!rateCheck.allowed) {
      toast.error(t.cart.rateLimitWait.replace('{seconds}', String(rateCheck.waitSeconds)));
      return;
    }

    setIsProcessing(true);

    // Realistic secure payment simulation delay
    await new Promise((resolve) => setTimeout(resolve, 1400));

    try {
      const isOnlinePaid = ['mobilepay', 'card', 'apple_pay'].includes(selectedMethod);
      const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const orderItems = state.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        quantity: Math.max(1, item.quantity),
        unitPrice: item.menuItem.price,
        selectedCustomizations: item.selectedCustomizations,
        customerNote: escapeHtml(item.customerNote || ''),
        totalPrice: item.totalPrice,
      }));

      const newOrderData: Omit<Order, 'id'> = {
        tableId: tableId || '5',
        items: orderItems,
        subtotal,
        discount: state.couponDiscount,
        tip: state.tipPercentage ? subtotal * (state.tipPercentage / 100) : state.tip,
        tipPercentage: state.tipPercentage ?? undefined,
        total,
        status: 'pending',
        paymentMethod: selectedMethod,
        paymentStatus: isOnlinePaid ? 'paid' : 'pending',
        isPaid: isOnlinePaid,
        transactionId: isOnlinePaid ? transactionId : undefined,
        paidAt: isOnlinePaid ? Date.now() : undefined,
        customerNote: escapeHtml(state.customerNote || ''),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const createdOrderId = await storage.add<Order>('orders', newOrderData as any);
      
      // Update coupon usage count
      if (state.couponCode) {
        const coupons = await storage.getAll<Coupon>('coupons');
        const applied = coupons.find(c => c.code.toLowerCase() === state.couponCode?.toLowerCase());
        if (applied) {
          await storage.update('coupons', applied.id, {
            usedCount: (applied.usedCount || 0) + 1,
          });
        }
      }

      await storage.update('tables', tableId || '5', { status: 'occupied' });
      recordOrderPlaced(tableId || '5');

      playPaymentSuccessSound();
      setCompletedOrder({ ...newOrderData, id: createdOrderId });
      clearCart();
      toast.success(t.checkout.successTitle);
    } catch {
      toast.error(t.cart.orderFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintReceipt = (order: Order) => {
    const vatAmount = (order.total * 0.2).toFixed(2); // 25% Danish VAT included (20% of gross)
    const windowContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kvittering #${escapeHtml(order.id.slice(0, 6).toUpperCase())} - Cafe Vitus</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.4; padding: 25px; max-width: 320px; margin: auto; }
          .center { text-align: center; }
          .right { text-align: right; }
          .line { border-top: 1px dashed #000; margin: 12px 0; }
          .double-line { border-top: 2px dashed #000; margin: 12px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .bold { font-weight: bold; }
          .small { font-size: 11px; color: #555; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin:0; font-size:20px; letter-spacing:1px;">CAFE VITUS</h2>
          <p class="small" style="margin:4px 0 0 0;">Snekkersten Havn • Strandvejen 88<br/>DK-3070 Snekkersten<br/>CVR: 38492019 • Tlf: +45 49 22 10 30</p>
          <div class="line"></div>
          <p class="bold" style="margin:0; font-size:14px;">BORD ${escapeHtml(order.tableId)} • KUNDEKVITTERING</p>
          <p class="small" style="margin:2px 0 0 0;">Dato: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}</p>
          <p class="small" style="margin:0;">Ordrenr: #${escapeHtml(order.id.slice(0, 6).toUpperCase())}</p>
          ${order.transactionId ? `<p class="small" style="margin:0;">Transaktion: ${escapeHtml(order.transactionId)}</p>` : ''}
        </div>
        
        <div class="line"></div>
        <div class="bold" style="font-size:11px; margin-bottom:6px; display:flex; justify-content:space-between;">
          <span>VARE</span>
          <span>BELØB</span>
        </div>

        ${order.items.map((item) => `
          <div class="row">
            <span>${item.quantity}x ${escapeHtml(item.name[language] || item.name.da || item.name.en)}</span>
            <span>${(item.unitPrice * item.quantity).toFixed(2)} kr</span>
          </div>
          ${item.selectedCustomizations ? item.selectedCustomizations.flatMap(c => c.selectedOptions.map(o => `
            <div class="row small" style="padding-left:10px;">
              <span>+ ${escapeHtml(o.name[language] || o.name.da || o.name.en)}</span>
              <span>${o.price > 0 ? o.price.toFixed(2) + ' kr' : ''}</span>
            </div>
          `)).join('') : ''}
        `).join('')}

        <div class="line"></div>
        <div class="row">
          <span>Subtotal:</span>
          <span>${order.subtotal.toFixed(2)} kr</span>
        </div>
        ${order.discount > 0 ? `
          <div class="row">
            <span>Rabat:</span>
            <span>-${order.discount.toFixed(2)} kr</span>
          </div>
        ` : ''}
        ${order.tip > 0 ? `
          <div class="row">
            <span>Drikkepenge:</span>
            <span>+${order.tip.toFixed(2)} kr</span>
          </div>
        ` : ''}

        <div class="double-line"></div>
        <div class="row bold" style="font-size: 16px;">
          <span>TOTAL DKK:</span>
          <span>${order.total.toFixed(2)} kr</span>
        </div>
        <div class="row small">
          <span>Heraf moms (25%):</span>
          <span>${vatAmount} kr</span>
        </div>

        <div class="line"></div>
        <div class="row small">
          <span>Betalingsmetode:</span>
          <span class="bold">${order.paymentMethod?.toUpperCase()}</span>
        </div>
        <div class="row small">
          <span>Status:</span>
          <span class="bold">${order.isPaid ? 'BETALT / GODKENDT' : 'AFVENTER BETALING'}</span>
        </div>

        <div class="line"></div>
        <div class="center small" style="margin-top:15px;">
          <p>Tak for dit besøg på Cafe Vitus!</p>
          <p>Del gerne din oplevelse på TripAdvisor ⭐⭐⭐⭐⭐</p>
          <p style="margin-top:8px;">www.cafevitus.dk</p>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '', 'width=420,height=650');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(windowContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 500);
    }
  };

  const handleFinishAndTrack = () => {
    const table = tableNumber || tableId || '5';
    onClose();
    setCompletedOrder(null);
    navigate(`/order-tracking?table=${table}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={completedOrder ? handleFinishAndTrack : onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "relative w-full max-w-xl my-6 rounded-3xl shadow-2xl border overflow-hidden z-10 transition-colors",
            isDark ? "bg-[#090F1E] text-slate-100 border-slate-800" : "bg-[#FDFCF8] text-slate-900 border-slate-200"
          )}
        >
          {/* SUCCESS RECEIPT VIEW */}
          {completedOrder ? (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header Success State */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                  className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-slate-900 dark:text-white">
                  {t.checkout.successTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                  {t.checkout.successDesc}
                </p>
              </div>

              {/* Luxury Digital Receipt Box */}
              <div className={cn(
                "rounded-2xl p-5 border shadow-inner space-y-4 font-mono text-xs",
                isDark ? "bg-slate-900/90 border-slate-800 text-slate-300" : "bg-amber-50/50 border-amber-200/60 text-slate-700"
              )}>
                {/* Receipt Header */}
                <div className="flex justify-between items-start pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                  <div>
                    <div className="font-bold text-sm text-slate-950 dark:text-white font-sans tracking-wide">CAFE VITUS</div>
                    <div className="text-[11px] opacity-75">{t.checkout.cvr}</div>
                    <div className="text-[11px] opacity-75 mt-0.5">
                      {t.table.tableNumber} {completedOrder.tableId} • {formatTime(completedOrder.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-sans",
                      completedOrder.isPaid ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    )}>
                      {completedOrder.isPaid ? t.checkout.statusPaid : t.checkout.statusPending}
                    </span>
                    <div className="text-[10px] opacity-60 mt-1">#{completedOrder.id.slice(0, 6).toUpperCase()}</div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="truncate pr-2 font-medium">
                        {item.quantity}x {item.name[language] || item.name.da || item.name.en}
                      </span>
                      <span className="font-bold font-sans shrink-0">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Summary Lines */}
                <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-70">{t.common.subtotal}</span>
                    <span className="font-sans font-bold">{formatCurrency(completedOrder.subtotal)}</span>
                  </div>
                  {completedOrder.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                      <span>{t.common.discount}</span>
                      <span className="font-sans font-bold">-{formatCurrency(completedOrder.discount)}</span>
                    </div>
                  )}
                  {completedOrder.tip > 0 && (
                    <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400">
                      <span>{t.common.tip}</span>
                      <span className="font-sans font-bold">+{formatCurrency(completedOrder.tip)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-slate-950 dark:text-white pt-2 border-t border-slate-300 dark:border-slate-700 font-sans">
                    <span>{t.common.total}</span>
                    <span className="Outfit text-amber-600 dark:text-amber-400 text-lg">
                      {formatCurrency(completedOrder.total)}
                    </span>
                  </div>
                  <div className="text-[10px] text-right opacity-60">
                    {t.checkout.danishVat} ({(completedOrder.total * 0.2).toFixed(2)} kr)
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleFinishAndTrack}
                  className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.checkout.trackOrder}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <button
                  type="button"
                  onClick={() => handlePrintReceipt(completedOrder)}
                  className="w-full py-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.checkout.printReceipt}</span>
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT STEP VIEW */
            <div>
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-500 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl font-serif-luxury text-slate-950 dark:text-white">
                      {t.checkout.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-beacon" />
                      {t.checkout.subtitle.replace('{table}', tableNumber || tableId || '5')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Total Pill Badge */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.common.total} ({state.items.length} {t.cart.items})
                    </span>
                    <div className="text-2xl font-black text-slate-950 dark:text-white Outfit">
                      {formatCurrency(total)}
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    <div>{t.table.tableNumber} {tableNumber || tableId || '5'}</div>
                    <div className="text-[10px] text-slate-400">{t.checkout.danishVat}</div>
                  </div>
                </div>

                {/* Payment Methods Grid */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                    {t.checkout.chooseMethod}
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {/* 1. MobilePay */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('mobilepay')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] relative overflow-hidden",
                        selectedMethod === 'mobilepay'
                          ? "border-[#5A78FF] bg-[#5A78FF]/10 ring-2 ring-[#5A78FF]/40 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-7 h-7 rounded-lg bg-[#5A78FF] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          MP
                        </div>
                        {selectedMethod === 'mobilepay' && (
                          <span className="w-2 h-2 rounded-full bg-[#5A78FF] animate-beacon" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">MobilePay</div>
                        <div className="text-[10px] text-slate-400 truncate">Dansk favorit</div>
                      </div>
                    </button>

                    {/* 2. Credit Card */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] relative",
                        selectedMethod === 'card'
                          ? "border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/40 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        {selectedMethod === 'card' && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-beacon" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Kort / Dankort</div>
                        <div className="text-[10px] text-slate-400 truncate">Visa • Mastercard</div>
                      </div>
                    </button>

                    {/* 3. Apple Pay */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('apple_pay')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] relative",
                        selectedMethod === 'apple_pay'
                          ? "border-slate-900 dark:border-white bg-slate-900/10 dark:bg-white/10 ring-2 ring-slate-900/40 dark:ring-white/40 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-7 h-7 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
                          
                        </div>
                        {selectedMethod === 'apple_pay' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-beacon" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Apple Pay</div>
                        <div className="text-[10px] text-slate-400 truncate">1-klik Biometrisk</div>
                      </div>
                    </button>

                    {/* 4. Pay at Table */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('cash')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] relative",
                        selectedMethod === 'cash'
                          ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        {selectedMethod === 'cash' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-beacon" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Ved bordet</div>
                        <div className="text-[10px] text-slate-400 truncate">Tjener terminal</div>
                      </div>
                    </button>

                    {/* 5. Pay at Counter */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('counter')}
                      className={cn(
                        "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] relative",
                        selectedMethod === 'counter'
                          ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                          <Store className="w-4 h-4" />
                        </div>
                        {selectedMethod === 'counter' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-beacon" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Ved kassen</div>
                        <div className="text-[10px] text-slate-400 truncate">Betal i baren</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* METHOD SPECIFIC DETAIL BOX */}
                <div className="space-y-4">
                  {/* MOBILEPAY VIEW */}
                  {selectedMethod === 'mobilepay' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-[#5A78FF]/10 border border-[#5A78FF]/30 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#5A78FF] text-white flex items-center justify-center font-black shadow-md">
                          MP
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-[#3b59dd] dark:text-[#7d95ff]">
                            {t.checkout.mobilePayTitle}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {t.checkout.mobilePayDesc}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {t.checkout.mobilePayNumber}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            value={mobilePhone}
                            onChange={(e) => setMobilePhone(e.target.value)}
                            placeholder="+45 20 12 34 56"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-[#5A78FF]"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {t.checkout.mobilePayHint}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* CREDIT CARD VIEW */}
                  {selectedMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3.5"
                    >
                      {/* Interactive Visual Card */}
                      <div className="relative h-44 rounded-2xl p-5 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 text-white shadow-xl border border-amber-500/30 flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex justify-between items-center relative z-10">
                          <span className="text-xs font-extrabold font-serif-luxury tracking-wider text-amber-400">CAFE VITUS BLACK</span>
                          <span className="text-[11px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">DANKORT / VISA</span>
                        </div>
                        <div className="font-mono text-base tracking-widest text-slate-200 font-bold relative z-10">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end text-[11px] font-mono relative z-10">
                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-400">Cardholder</div>
                            <div className="font-bold font-sans uppercase">{cardHolder || 'NAVN'}</div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-400">Expires</div>
                            <div className="font-bold">{cardExpiry || 'MM/YY'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-black uppercase text-slate-400">
                            {t.checkout.cardNumber}
                          </label>
                          <button
                            type="button"
                            onClick={handleQuickFillCard}
                            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{t.checkout.quickFillTest}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4571 0000 0000 0000"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-400"
                        />

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1">
                              {t.checkout.expiry}
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              placeholder="12/27"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1">
                              {t.checkout.cvv}
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              placeholder="•••"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* APPLE PAY VIEW */}
                  {selectedMethod === 'apple_pay' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-300 dark:border-slate-700 text-center space-y-2"
                    >
                      <div className="text-3xl"></div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {t.checkout.applePayTitle}
                      </div>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        Godkend betalingen øjeblikkeligt med Touch ID eller Face ID.
                      </p>
                    </motion.div>
                  )}

                  {/* PAY AT TABLE / CASH VIEW */}
                  {selectedMethod === 'cash' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2"
                    >
                      <div className="font-extrabold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        <span>{t.checkout.tableWaiterTitle}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {t.checkout.tableWaiterDesc}
                      </p>
                    </motion.div>
                  )}

                  {/* PAY AT COUNTER VIEW */}
                  {selectedMethod === 'counter' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        <span>{t.checkout.counterTitle}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {t.checkout.counterDesc}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Security Guarantee Strip */}
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t.checkout.securityGuarantee}</span>
                </div>
              </div>

              {/* Sticky Submit Button */}
              <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070D1C]/95 backdrop-blur-md">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[52px]",
                    selectedMethod === 'mobilepay'
                      ? "bg-[#5A78FF] hover:bg-[#4866f0] text-white shadow-[#5A78FF]/25"
                      : "bg-slate-950 hover:bg-slate-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 shadow-amber-400/20"
                  )}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      <span>{t.checkout.processingPayment}</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {selectedMethod === 'mobilepay'
                          ? `${t.checkout.mobilePaySwipe} • ${formatCurrency(total)}`
                          : selectedMethod === 'card'
                          ? `${t.checkout.payWithCard} • ${formatCurrency(total)}`
                          : selectedMethod === 'apple_pay'
                          ? `${t.checkout.payWithApple} • ${formatCurrency(total)}`
                          : selectedMethod === 'cash'
                          ? t.checkout.confirmPayAtTable
                          : t.checkout.confirmPayAtCounter}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
