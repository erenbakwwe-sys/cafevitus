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
  const { t } = useLanguage();
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
        tableId,
        tableNumber: tableNumber || tableId,
        type: selectedReason,
        message: message.trim() ? message : undefined,
        status: 'active',
        createdAt: Date.now(),
      } as any);

      await storage.update('tables', tableId, { status: 'waiter-called' });
      toast.success(t.waiter.callSent, { description: t.waiter.callSentDescription });
      setCooldown(30);
      setTimeout(() => {
        onClose();
        setSelectedReason(null);
        setMessage('');
      }, 1000);
    } catch {
      toast.error(t.common.error);
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
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className={`w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl shadow-2xl ${
                isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Bell className="h-6 w-6 text-amber-500" />
                    <span className="absolute right-0 top-0 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{t.waiter.callWaiter}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-500 mb-4">{t.waiter.selectReason}</p>
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {reasons.map((reason) => (
                    <button
                      key={reason.id}
                      type="button"
                      onClick={() => setSelectedReason(reason.id)}
                      className={`flex flex-col items-center justify-center space-y-2 rounded-2xl p-4 transition-all ${
                        selectedReason === reason.id
                          ? 'bg-amber-500 text-white ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md shadow-amber-500/20'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {reason.icon}
                      <span className="text-xs font-semibold text-center">{reason.label}</span>
                    </button>
                  ))}
                </div>

                {selectedReason === 'special-request' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.waiter.messagePlaceholder}
                      className={`w-full rounded-xl p-3 outline-none ring-1 transition-shadow focus:ring-2 focus:ring-amber-500 ${
                        isDark
                          ? 'bg-slate-800 ring-slate-700 text-white placeholder-slate-500'
                          : 'bg-slate-50 ring-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                      rows={3}
                    />
                  </motion.div>
                )}

                <button
                  onClick={handleSend}
                  disabled={!selectedReason || cooldown > 0}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-amber-500 p-4 font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
                >
                  {cooldown > 0 ? (
                    <span>{t.waiter.cooldownMessage} ({cooldown}s)</span>
                  ) : (
                    <>
                      <span>{t.waiter.callWaiter}</span>
                      <Send className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
