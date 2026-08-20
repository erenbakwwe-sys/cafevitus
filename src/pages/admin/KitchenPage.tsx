import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../../lib/storage';
import { Order } from '../../types';
import { getMinutesAgo, cn } from '../../lib/utils';
import { playNewOrderSound, isAudioEnabled, unlockAudio } from '../../lib/audio';
import { ChefHat, Clock, AlertTriangle, CheckCircle, Volume2, VolumeX } from 'lucide-react';
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "bg-white dark:bg-slate-800/90 rounded-2xl p-5 shadow-sm border-2 transition-all flex flex-col gap-4",
          isOverdue ? "border-red-500 shadow-lg shadow-red-500/10 animate-pulse" : 
          isWarning ? "border-amber-500" : "border-slate-200 dark:border-slate-700"
        )}
      >
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white Outfit">
              {t.table.tableNumber} {order.tableId}
            </div>
            <div className="text-xs text-slate-400 font-mono">#{order.id.slice(0, 6).toUpperCase()}</div>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
            isOverdue ? "bg-red-500 text-white animate-bounce" :
            isWarning ? "bg-amber-500 text-white" :
            "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
          )}>
            <Clock className="w-3.5 h-3.5" />
            {minutesElapsed} {t.orderTracking.minutes}
            {isOverdue && ` (${t.admin.kitchen.delayed})`}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-3 text-base">
              <span className="font-extrabold text-sky-600 dark:text-sky-400 min-w-[24px]">
                {item.quantity}x
              </span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.name[language] || item.name.en}
                </span>
                {item.customerNote && (
                  <p className="text-xs text-red-500 font-bold mt-1 flex items-start gap-1 bg-red-50 dark:bg-red-950/40 p-1.5 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {item.customerNote}
                  </p>
                )}
                {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                    {item.selectedCustomizations.flatMap((c) =>
                      c.selectedOptions.map((opt) => (
                        <span key={opt.id} className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">
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
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-amber-700 dark:text-amber-300 font-semibold">
              Note: {order.customerNote}
            </div>
          )}
        </div>

        <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-700 flex gap-2">
          {order.status === 'pending' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'preparing')}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-amber-500/20"
            >
              {t.admin.kitchen.markPreparing}
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'ready')}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <CheckCircle className="w-4 h-4" /> {t.admin.kitchen.markReady}
            </button>
          )}
          {order.status === 'ready' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-sm transition-colors"
            >
              {t.admin.kitchen.markDelivered}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const Column = ({ title, columnOrders, color }: { title: string; columnOrders: Order[]; color: string }) => (
    <div className="flex flex-col h-full bg-slate-100/60 dark:bg-slate-900/60 rounded-3xl p-4 overflow-hidden border border-slate-200/50 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-bold flex items-center gap-2 Outfit">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          {title}
        </h2>
        <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-black">
          {columnOrders.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-16 custom-scrollbar">
        <AnimatePresence>
          {columnOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {columnOrders.length === 0 && (
            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700/60 rounded-2xl text-slate-400 font-medium text-sm">
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
          <div className="p-3 bg-sky-100 dark:bg-sky-500/20 rounded-2xl text-sky-600 dark:text-sky-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black Outfit">{t.admin.kitchen.title}</h1>
            <p className="text-xs text-slate-500">{activeOrders.length} {t.admin.kitchen.waitingTime}</p>
          </div>
        </div>
        
        <button
          onClick={handleAudioUnlock}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm",
            audioUnlocked 
              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              : "bg-amber-500 text-white hover:bg-amber-600 animate-pulse shadow-md shadow-amber-500/25"
          )}
        >
          {audioUnlocked ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
          {audioUnlocked ? t.admin.kitchen.soundOn : t.admin.kitchen.enableSound}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <Column title={t.admin.kitchen.newOrders} columnOrders={pendingOrders} color="bg-red-500" />
        <Column title={t.admin.kitchen.inProgress} columnOrders={preparingOrders} color="bg-amber-500" />
        <Column title={t.admin.kitchen.readyToServe} columnOrders={readyOrders} color="bg-emerald-500" />
      </div>
    </div>
  );
}
