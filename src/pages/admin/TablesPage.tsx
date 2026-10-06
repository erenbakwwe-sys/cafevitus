import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Bell, Check, Clock, Plus, Trash2, Printer, 
  CreditCard, Banknote, AlertCircle, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { storage } from '../../lib/storage';
import { Table, Order, WaiterCall, TableStatus } from '../../types';
import { formatCurrency, formatTime, getTableStatusColor, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function TablesPage() {
  const { t, language } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [tData, oData, wData] = await Promise.all([
        storage.getAll<Table>('tables'),
        storage.getAll<Order>('orders'),
        storage.getAll<WaiterCall>('waiter_calls'),
      ]);
      setTables(tData.sort((a, b) => parseInt(a.number) - parseInt(b.number)));
      setOrders(oData);
      setWaiterCalls(wData);
    };

    loadData();

    const unsubTables = storage.subscribe<Table>('tables', (data) =>
      setTables(data.sort((a, b) => parseInt(a.number) - parseInt(b.number)))
    );
    const unsubOrders = storage.subscribe<Order>('orders', (data) => setOrders(data));
    const unsubCalls = storage.subscribe<WaiterCall>('waiter_calls', (data) => setWaiterCalls(data));

    return () => {
      unsubTables();
      unsubOrders();
      unsubCalls();
    };
  }, []);

  const getTableOrders = (tableId: string, tableNumber: string) => {
    return orders.filter(
      (o) =>
        (o.tableId === tableId || o.tableId === tableNumber) &&
        o.status !== 'cancelled' &&
        o.status !== 'completed'
    );
  };

  const getTableCalls = (tableId: string, tableNumber: string) => {
    return waiterCalls.filter(
      (c) => (c.tableId === tableId || c.tableId === tableNumber) && c.status === 'active'
    );
  };

  const resolveCall = async (callId: string) => {
    await storage.update('waiter_calls', callId, { status: 'resolved' });
    toast.success(t.common.success);
  };

  const handleApproveOrder = async (orderId: string) => {
    await storage.update('orders', orderId, { status: 'preparing' });
    toast.success(t.admin.tables.orderApproved);
  };

  const handleRejectOrder = async (orderId: string) => {
    await storage.update('orders', orderId, { status: 'cancelled' });
    toast.error(t.admin.tables.orderRejected);
  };

  const handleClosePay = async (table: Table) => {
    const tableOrders = getTableOrders(table.id, table.number);
    for (const o of tableOrders) {
      await storage.update('orders', o.id, { status: 'completed' });
    }
    await storage.update('tables', table.id, { status: 'empty' });
    setSelectedTable(null);
    toast.success(`${t.table.tableNumber} ${table.number} ${t.admin.tables.closeAndPay}`);
  };

  const handleMarkAsPaid = async (orderId: string) => {
    await storage.update('orders', orderId, {
      isPaid: true,
      paymentStatus: 'paid',
      transactionId: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: Date.now(),
    });
    toast.success(t.common.success || 'Betaling registreret');
  };

  const calculateSubtotal = (tableOrders: Order[]) => {
    return tableOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const handlePrintReceipt = (table: Table, tableOrders: Order[]) => {
    const total = calculateSubtotal(tableOrders);
    const windowContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t.admin.tables.receiptTitle} ${table.number}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 13px; padding: 20px; max-width: 300px; margin: auto; }
          .center { text-align: center; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>CAFE VITUS</h2>
          <p>Snekkersten Havn<br/>DK-3070 Snekkersten<br/>CVR: 12345678</p>
          <div class="line"></div>
          <p class="bold">${t.table.tableNumber.toUpperCase()} ${table.number} • ${t.admin.tables.receiptHeader}</p>
          <p>${new Date().toLocaleString(language === 'da' ? 'da-DK' : 'en-US')}</p>
        </div>
        <div class="line"></div>
        ${tableOrders
          .flatMap((o) => o.items)
          .map(
            (item) => `
          <div class="row">
            <span>${item.quantity}x ${item.name[language] || item.name.da || item.name.en}</span>
            <span>${(item.unitPrice * item.quantity).toFixed(2)} kr</span>
          </div>
        `
          )
          .join('')}
        <div class="line"></div>
        <div class="row bold" style="font-size: 16px;">
          <span>${t.common.total.toUpperCase()}</span>
          <span>${total.toFixed(2)} DKK</span>
        </div>
        <div class="line"></div>
        <div class="center">
          <p>${t.admin.tables.receiptFooter}</p>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '', 'width=400,height=600');
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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto h-full flex flex-col space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-luxury text-slate-900 dark:text-white">
            {t.admin.tables.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-beacon" />
            {t.admin.tables.subtitle}
          </p>
        </div>
        
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{t.admin.tables.empty}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>{t.admin.tables.occupied}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{t.admin.tables.pendingApproval}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce" />
            <span>{t.admin.tables.waiterCalled}</span>
          </div>
        </div>
      </div>

      {/* Waiter Calls Alert Strip */}
      {waiterCalls.filter((c) => c.status === 'active').length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 dark:bg-red-950/40 border-2 border-red-500/50 rounded-3xl p-5 shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-black text-sm mb-3.5">
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="font-serif-luxury text-base">{t.admin.tables.activeWaiterCalls}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {waiterCalls
              .filter((c) => c.status === 'active')
              .map((call) => (
                <div
                  key={call.id}
                  className="bg-white/95 dark:bg-slate-900/95 border border-red-300 dark:border-red-800 p-4 rounded-2xl flex items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="font-black text-base text-slate-900 dark:text-white Outfit">
                      {t.table.tableNumber} {call.tableNumber || call.tableId}
                    </div>
                    <div className="text-xs text-red-600 font-bold uppercase tracking-wider mt-0.5">
                      {call.type === 'bill' ? t.waiter.billRequested : call.type === 'napkin-water' ? t.waiter.waterNapkins : t.waiter.callWaiter}
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={() => resolveCall(call.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-md"
                  >
                    OK
                  </motion.button>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4.5 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
        {tables.map((table) => {
          const tOrders = getTableOrders(table.id, table.number);
          const tCalls = getTableCalls(table.id, table.number);
          const hasOrders = tOrders.length > 0;
          const hasPendingOrders = tOrders.some(o => o.status === 'pending');
          
          let status: TableStatus = 'empty';
          if (tCalls.length > 0) {
            status = 'waiter-called';
          } else if (hasOrders) {
            status = 'occupied';
          }

          const colors = getTableStatusColor(status);

          return (
            <motion.button
              key={table.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedTable(table)}
              className={cn(
                "relative p-5 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all shadow-sm cursor-pointer",
                colors.bg,
                colors.border,
                colors.text,
                status === 'waiter-called' && "animate-pulse",
                hasPendingOrders && "border-amber-400 ring-2 ring-amber-400/40 shadow-amber-400/20"
              )}
            >
              {tCalls.length > 0 && (
                <div className="absolute top-3.5 right-3.5">
                  <Bell className="w-5 h-5 text-red-500 animate-bounce" />
                </div>
              )}

              {hasPendingOrders && (
                <div className="absolute top-3.5 right-3.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </div>
              )}

              <div className="absolute top-3.5 left-3.5 flex items-center gap-1 text-xs opacity-75 font-black">
                <Users className="w-3.5 h-3.5" />
                {table.capacity}
              </div>
              <div className="text-3xl sm:text-4xl font-black mt-1 Outfit">{table.number}</div>
              
              {hasOrders ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs font-black px-3 py-0.5 rounded-full bg-sky-500/20 text-sky-900 dark:text-sky-200 Outfit">
                    {formatCurrency(calculateSubtotal(tOrders))}
                  </div>
                  {hasPendingOrders ? (
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black shadow-2xs">
                      {t.admin.tables.approval}
                    </span>
                  ) : (
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-md font-black tracking-wide uppercase",
                      tOrders.every((o) => o.isPaid)
                        ? "bg-emerald-500/25 text-emerald-800 dark:text-emerald-300"
                        : "bg-amber-500/25 text-amber-800 dark:text-amber-300"
                    )}>
                      {tOrders.every((o) => o.isPaid) ? 'BETALT' : 'AFVENTER'}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-[11px] font-bold opacity-60">
                  {t.admin.tables.empty}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Table Side Detail Drawer */}
      <AnimatePresence>
        {selectedTable && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTable(null)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0E172A] shadow-2xl h-full flex flex-col z-10 border-l border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md">
                <div>
                  <h2 className="text-2xl font-extrabold font-serif-luxury text-slate-900 dark:text-white">
                    {t.table.tableNumber} {selectedTable.number}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {`${t.admin.tables.capacityPrefix} ${selectedTable.capacity} ${t.admin.tables.capacityUnit} • ${t.productCard.harborLocation}`}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setSelectedTable(null)}
                  className="p-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {getTableOrders(selectedTable.id, selectedTable.number).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-56 text-slate-400">
                    <AlertCircle className="w-12 h-12 mb-2.5 opacity-40" />
                    <p className="font-bold font-serif-luxury text-base">{t.admin.tables.noActiveOrders}</p>
                  </div>
                ) : (
                  getTableOrders(selectedTable.id, selectedTable.number).map((order) => {
                    const isPending = order.status === 'pending';
                    return (
                      <div
                        key={order.id}
                        className={cn(
                           "rounded-2xl p-4 sm:p-5 border transition-all shadow-sm",
                          isPending
                            ? "bg-amber-400/10 border-amber-400/40 shadow-md"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700"
                        )}
                      >
                        <div className="text-xs font-bold text-slate-500 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <div>
                            <span className="font-mono font-bold">#{order.id.slice(0, 6).toUpperCase()}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={cn(
                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
                                order.isPaid
                                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                              )}>
                                {order.isPaid ? `BETALT (${order.paymentMethod?.toUpperCase()})` : 'AFVENTER BETALING'}
                              </span>
                              {!order.isPaid && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsPaid(order.id)}
                                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                >
                                  [Modtag]
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                              isPending ? "bg-amber-400 text-slate-950 animate-pulse" : "bg-sky-500/20 text-sky-700 dark:text-sky-300"
                            )}>
                              {isPending ? t.admin.tables.pendingApproval : order.status}
                            </span>
                            <span>{formatTime(order.createdAt)}</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                <span className="font-black text-amber-500 mr-1">{item.quantity}x</span>{' '}
                                {item.name[language] || item.name.en}
                              </div>
                              <div className="font-black Outfit">
                                {formatCurrency(item.unitPrice * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Waiter Approval & Fraud Protection Action Buttons */}
                        {isPending && (
                          <div className="pt-3 border-t border-amber-400/30 flex gap-2">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => handleApproveOrder(order.id)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{t.admin.tables.approveToKitchen}</span>
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => handleRejectOrder(order.id)}
                              className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              title={t.admin.tables.rejectOrder}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{t.admin.tables.reject}</span>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider font-sans">
                    {t.admin.tables.totalBill}
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white Outfit text-amber-600 dark:text-amber-400">
                    {formatCurrency(
                      calculateSubtotal(getTableOrders(selectedTable.id, selectedTable.number))
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() =>
                      handlePrintReceipt(
                        selectedTable,
                        getTableOrders(selectedTable.id, selectedTable.number)
                      )
                    }
                    disabled={
                      getTableOrders(selectedTable.id, selectedTable.number).length === 0
                    }
                    className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-bold text-xs disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-4 h-4" /> {t.admin.tables.printReceipt}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      toast.info(t.admin.tables.selectItemsFromMenu);
                    }}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" /> {t.admin.tables.addItem}
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleClosePay(selectedTable)}
                  disabled={
                    getTableOrders(selectedTable.id, selectedTable.number).length === 0
                  }
                  className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{t.admin.tables.closeAndPay}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

