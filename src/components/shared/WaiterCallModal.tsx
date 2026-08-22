import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Droplets, HelpCircle, MessageSquare, X, Send, Bell } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { WaiterCall, WaiterCallType } from '../../types';
import { toast } from 'sonner';

interface WaiterCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  tableNumber: string;
}

export function WaiterCallModal({ isOpen, onClose, tableId, tableNumber }: WaiterCallModalProps) {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const [selectedReason, setSelectedReason] = useState<WaiterCallType | null>(null);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const reasons: { id: WaiterCallType; icon: React.ReactNode; label: string }[] = [
    { id: 'bill', icon: <Receipt className="h-6 w-6" />, label: t.waiter.requestBill },
    { id: 'napkin-water', icon: <Droplets className="h-6 w-6" />, label: t.waiter.requestNapkinWater },
    { id: 'order-question', icon: <HelpCircle className="h-6 w-6" />, label: t.waiter.orderQuestion },
    { id: 'special-request', icon: <MessageSquare className="h-6 w-6" />, label: t.waiter.specialRequest },
  ];

  const handleSend = async () => {
    if (!selectedReason) return;
    
    try {
      await storage.add<WaiterCall>('waiter_calls', {
        tableId: tableId || '5',
        tableNumber: tableNumber || tableId || '5',
        type: selectedReason,
        message: message.trim() ? message : undefined,
        status: 'active',
        createdAt: Date.now(),
      } as any);

      await storage.update('tables', tableId || '5', { status: 'waiter-called' });
      toast.success(t.waiter.callSent, { description: t.waiter.callSentDescription });
      setCooldown(30);
      setTimeout(() => {
        onClose();
        setSelectedReason(null);
        setMessage('');
      }, 800);
    } catch {
      toast.error(t.common.error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet Card */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className={`relative w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-3xl shadow-2xl z-10 ${
              isDark ? 'bg-[#0E172A] text-white border-t border-slate-800' : 'bg-white text-slate-900 border-t border-slate-200'
            }`}
          >
            {/* Mobile Drag Pill */}
            <div className="sm:hidden w-full flex items-center justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 p-4 sm:p-5 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Bell className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black">{t.waiter.callWaiter}</h2>
                  <p className="text-[11px] text-slate-400 font-bold">Bord {tableNumber || tableId || '5'}</p>
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

            <div className="p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <p className="text-xs font-bold text-slate-500 mb-3">{t.waiter.selectReason}</p>
              <div className="mb-5 grid grid-cols-2 gap-2.5">
                {reasons.map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all cursor-pointer min-h-[85px] ${
                      selectedReason === reason.id
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-500 shadow-md font-bold'
                        : isDark
                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <div className="mb-2">{reason.icon}</div>
                    <span className="text-xs font-bold text-center leading-tight">{reason.label}</span>
                  </button>
                ))}
              </div>

              {selectedReason === 'special-request' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.waiter.messagePlaceholder}
                    className={`w-full rounded-2xl p-3 text-xs outline-none ring-1 transition-shadow focus:ring-2 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-slate-800/80 ring-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 ring-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    rows={2}
                  />
                </motion.div>
              )}

              <button
                type="button"
                onClick={handleSend}
                disabled={!selectedReason || cooldown > 0}
                className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-amber-500 hover:bg-amber-600 p-3.5 sm:p-4 font-black text-slate-950 text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer min-h-[48px]"
              >
                {cooldown > 0 ? (
                  <span>{t.waiter.cooldownMessage} ({cooldown}s)</span>
                ) : (
                  <>
                    <span>{t.waiter.callWaiter}</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
