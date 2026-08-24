import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../../lib/storage';
import { Order } from '../../types';
import { getMinutesAgo, cn } from '../../lib/utils';
import { playNewOrderSound, isAudioEnabled, unlockAudio } from '../../lib/audio';
import { ChefHat, Clock, AlertTriangle, CheckCircle, Volume2, VolumeX, Sparkles, Check, Coffee } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [audioUnlocked, setAudioUnlocked] = useState(isAudioEnabled());
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchOrders = async () => {
      const allOrders = await storage.getAll<Order>('orders');
      setOrders(allOrders);
    };
    fetchOrders();

    const unsubOrders = storage.subscribe<Order>('orders', (newOrders) => {
      setOrders((prevOrders) => {
        const oldPending = prevOrders.filter((o) => o.status === 'pending').length;
        const newPending = newOrders.filter((o) => o.status === 'pending').length;
        if (newPending > oldPending) {
          playNewOrderSound();
        }
        return newOrders;
      });
    });

    const timer = setInterval(() => {
      setOrders((prev) => [...prev]); // Trigger re-render to update elapsed time
    }, 30000);

    return () => {
      unsubOrders();
      clearInterval(timer);
    };
  }, []);

  const handleAudioUnlock = () => {
    unlockAudio();
    setAudioUnlocked(true);
    playNewOrderSound();
    toast.success(t.admin.kitchen.enableSound);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await storage.update('orders', orderId, { status });
  };

  const activeOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
  const pendingOrders = activeOrders.filter((o) => o.status === 'pending');
  const preparingOrders = activeOrders.filter((o) => o.status === 'preparing');
  const readyOrders = activeOrders.filter((o) => o.status === 'ready');

  const OrderCard = ({ order }: { order: Order }) => {
    const minutesElapsed = getMinutesAgo(order.createdAt);
    const isOverdue = minutesElapsed >= 15;
    const isWarning = minutesElapsed >= 10 && !isOverdue;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className={cn(
          "bg-white/95 dark:bg-[#0E172A]/95 backdrop-blur-xl rounded-[1.75rem] p-5 sm:p-6 shadow-md border-2 transition-all flex flex-col gap-4",
          isOverdue ? "border-red-500 shadow-xl shadow-red-500/15 animate-pulse" : 
          isWarning ? "border-amber-400 shadow-lg shadow-amber-400/10" : "border-slate-200/80 dark:border-slate-800"
        )}
      >
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white Outfit">
              {t.table.tableNumber} {order.tableId}
            </div>
            <div className="text-xs text-slate-400 font-mono font-bold mt-0.5">#{order.id.slice(0, 6).toUpperCase()}</div>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-2xs",
            isOverdue ? "bg-red-500 text-white animate-bounce" :
            isWarning ? "bg-amber-400 text-slate-950" :
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          )}>
            <Clock className="w-3.5 h-3.5" />
            <span>{minutesElapsed} {t.orderTracking.minutes}</span>
            {isOverdue && ` (${t.admin.kitchen.delayed})`}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-3 text-sm sm:text-base">
              <span className="font-black text-amber-600 dark:text-amber-400 min-w-[26px]">
                {item.quantity}x
              </span>
              <div className="flex-1">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {item.name[language] || item.name.en}
                </span>
                {item.customerNote && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-1 flex items-start gap-1 bg-red-50 dark:bg-red-950/50 p-2 rounded-xl border border-red-200 dark:border-red-900/50">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{item.customerNote}</span>
                  </p>
                )}
                {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-1">
                    {item.selectedCustomizations.flatMap((c) =>
                      c.selectedOptions.map((opt) => (
                        <span key={opt.id} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                          +{opt.name[language] || opt.name.en}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {order.customerNote && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-2xl text-xs text-amber-800 dark:text-amber-300 font-bold">
              {t.admin.kitchen.note} {order.customerNote}
            </div>
          )}
        </div>

        <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-800 flex gap-2">
          {order.status === 'pending' && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => updateOrderStatus(order.id, 'preparing')}
              className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              {t.admin.kitchen.markPreparing}
            </motion.button>
          )}
          {order.status === 'preparing' && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => updateOrderStatus(order.id, 'ready')}
              className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 stroke-[2.5]" /> <span>{t.admin.kitchen.markReady}</span>
            </motion.button>
          )}
          {order.status === 'ready' && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              {t.admin.kitchen.markDelivered}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  const Column = ({ title, columnOrders, color }: { title: string; columnOrders: Order[]; color: string }) => (
    <div className="flex flex-col h-full bg-slate-100/70 dark:bg-[#070C18]/70 backdrop-blur-xl rounded-[2rem] p-4.5 overflow-hidden border border-slate-200/70 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-extrabold flex items-center gap-2.5 font-serif-luxury text-slate-900 dark:text-white">
          <div className={cn("w-3 h-3 rounded-full animate-beacon", color)} />
          <span>{title}</span>
        </h2>
        <span className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1 rounded-full text-xs font-black shadow-2xs border border-slate-200 dark:border-slate-700">
          {columnOrders.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-16 custom-scrollbar">
        <AnimatePresence>
          {columnOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {columnOrders.length === 0 && (
            <div className="h-36 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl text-slate-400 font-bold text-xs">
              {t.admin.kitchen.noOrders}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col p-4 sm:p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-400/20 rounded-2xl text-amber-600 dark:text-amber-400 shadow-inner">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-slate-900 dark:text-white">{t.admin.kitchen.title}</h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{activeOrders.length} {t.admin.kitchen.waitingTime} • {t.productCard.harborLocation}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleAudioUnlock}
          className={cn(
            "flex items-center gap-2 px-4.5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer",
            audioUnlocked 
              ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              : "bg-amber-400 text-slate-950 hover:bg-amber-500 shadow-lg shadow-amber-400/25 animate-pulse"
          )}
        >
          {audioUnlocked ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
          <span>{audioUnlocked ? t.admin.kitchen.soundOn : t.admin.kitchen.enableSound}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <Column title={t.admin.kitchen.newOrders} columnOrders={pendingOrders} color="bg-red-500" />
        <Column title={t.admin.kitchen.inProgress} columnOrders={preparingOrders} color="bg-amber-400" />
        <Column title={t.admin.kitchen.readyToServe} columnOrders={readyOrders} color="bg-emerald-500" />
      </div>
    </div>
  );
}

