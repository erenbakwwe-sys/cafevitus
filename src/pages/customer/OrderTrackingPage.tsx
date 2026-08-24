import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, ChefHat, Package, ArrowLeft, Utensils, Star, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatTime, cn } from '../../lib/utils';
import { Header } from '../../components/layout/Header';
import { CartDrawer } from '../../components/shared/CartDrawer';
import { WaiterCallModal } from '../../components/shared/WaiterCallModal';
import { TripAdvisorReviewCard } from '../../components/shared/TripAdvisorReviewCard';

const statusSteps: { id: OrderStatus; icon: React.ReactNode; getKey: (t: any) => string }[] = [
  { id: 'pending', icon: <Clock className="w-5 h-5" />, getKey: (t) => t.orderTracking.pending },
  { id: 'preparing', icon: <ChefHat className="w-5 h-5" />, getKey: (t) => t.orderTracking.preparing },
  { id: 'ready', icon: <Package className="w-5 h-5" />, getKey: (t) => t.orderTracking.ready },
  { id: 'delivered', icon: <CheckCircle2 className="w-5 h-5" />, getKey: (t) => t.orderTracking.delivered },
];

export function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table') || '5';
  const navigate = useNavigate();
  
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);

  useEffect(() => {
    if (!tableId) return;

    const fetchOrders = async () => {
      const allOrders = await storage.getAll<Order>('orders');
      const tableOrders = allOrders.filter(
        (o) => (o.tableId === tableId || !tableId) && o.status !== 'cancelled' && o.status !== 'completed'
      );
      setOrders(tableOrders.sort((a, b) => b.createdAt - a.createdAt));
    };
    
    fetchOrders();

    const unsubscribe = storage.subscribe<Order>('orders', (updatedOrders) => {
      const currentTableOrders = updatedOrders.filter(
        (o) => (o.tableId === tableId || !tableId) && o.status !== 'cancelled' && o.status !== 'completed'
      );
      setOrders(currentTableOrders.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => unsubscribe();
  }, [tableId]);

  return (
    <div className="min-h-screen bg-[#F8F7F2] dark:bg-[#050A14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-400 pb-20">
      {/* Universal Header */}
      <Header
        tableNumber={tableId}
        onCartClick={() => setIsCartOpen(true)}
        onWaiterClick={() => setIsWaiterModalOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-6">
        {/* Page Top Title */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-luxury tracking-tight text-slate-900 dark:text-white">
              {t.orderTracking.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-beacon" />
              {`${t.orderTracking.liveStatusFor} ${t.table.tableNumber} ${tableId} • Cafe Vitus`}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate(`/?table=${tableId}`)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>{t.menu.title}</span>
          </motion.button>
        </div>

        {/* TripAdvisor Review Card Banner */}
        <TripAdvisorReviewCard />

        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#0E172A] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm"
          >
            <div className="w-20 h-20 rounded-3xl bg-amber-400/15 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-serif-luxury mb-1">{t.orderTracking.noOrders}</h2>
            <p className="text-slate-500 mb-6 max-w-sm text-xs font-medium leading-relaxed">{t.orderTracking.noOrdersDescription}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate(`/?table=${tableId}`)}
              className="bg-slate-950 text-white dark:bg-amber-400 dark:text-slate-950 px-7 py-3.5 rounded-2xl font-extrabold text-xs hover:opacity-95 transition-all shadow-md cursor-pointer"
            >
              {t.menu.title}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStatusIdx = statusSteps.findIndex((s) => s.id === order.status);

              return (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0E172A]/95 backdrop-blur-xl"
                >
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-500/30">
                        {t.orderTracking.orderNumber} #{order.id.slice(0, 6).toUpperCase()}
                      </span>
                      <p className="text-xs text-slate-500 font-bold mt-2.5">
                        {t.orderTracking.placedAt} {formatTime(order.createdAt)} • {order.paymentMethod ? (order.paymentMethod === 'card' ? t.cart.payCard : order.paymentMethod === 'cash' ? t.cart.payCash : t.cart.payCounter) : t.orderTracking.cardCash}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-extrabold">{t.common.total}</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white Outfit">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-7 relative py-3">
                    <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.max(0, Math.min(100, (currentStatusIdx / (statusSteps.length - 1)) * 100))}%` 
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
                      />
                    </div>
                    
                    <div className="relative z-10 flex justify-between">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx < currentStatusIdx || order.status === 'paid' || order.status === 'completed';
                        const isActive = idx === currentStatusIdx;
                        
                        return (
                          <div key={step.id} className="flex flex-col items-center">
                            <motion.div 
                              animate={isActive ? { scale: [1, 1.12, 1] } : {}}
                              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                              className={cn(
                                "w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                isActive 
                                  ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 shadow-lg font-black' 
                                  : isCompleted 
                                  ? 'bg-emerald-500 text-white' 
                                  : isDark 
                                  ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              )}
                            >
                              {isCompleted ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : step.icon}
                            </motion.div>
                            <span className={cn(
                              "text-[10px] sm:text-xs mt-2.5 font-extrabold text-center max-w-[80px]",
                              isActive 
                                ? 'text-amber-600 dark:text-amber-400 font-black' 
                                : isCompleted 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-slate-400'
                            )}>
                              {step.getKey(t)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-2.5 bg-slate-50/80 dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-2.5">
                      {t.cart.title}
                    </h4>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-amber-500">{item.quantity}x</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.name[language] || item.name.en}
                          </span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 Outfit">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableId={tableId}
        tableNumber={tableId}
      />

      <WaiterCallModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableId={tableId}
        tableNumber={tableId}
      />
    </div>
  );
}

export default OrderTrackingPage;

