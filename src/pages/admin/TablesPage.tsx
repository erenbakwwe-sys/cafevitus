import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Bell, Check, Clock, Plus, Trash2, Printer, 
  CreditCard, Banknote, AlertCircle, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { storage } from '../../lib/storage';
import { Table, Order, WaiterCall, TableStatus, MenuItem } from '../../types';
import { formatCurrency, formatTime, getTableStatusColor, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function TablesPage() {
  const { t, language } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [tData, oData, wData, mData] = await Promise.all([
        storage.getAll<Table>('tables'),
        storage.getAll<Order>('orders'),
        storage.getAll<WaiterCall>('waiter_calls'),
        storage.getAll<MenuItem>('menu'),
      ]);
      setTables(tData.sort((a, b) => parseInt(a.number) - parseInt(b.number)));
      setOrders(oData);
      setWaiterCalls(wData);
      setMenuItems(mData);
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
    toast.success(language === 'da' ? 'Bestilling godkendt og sendt til køkkenet! 👨‍🍳' : 'Order approved and sent to kitchen!');
  };

  const handleRejectOrder = async (orderId: string) => {
    await storage.update('orders', orderId, { status: 'cancelled' });
    toast.error(language === 'da' ? 'Bestilling afvist og annulleret.' : 'Order rejected and cancelled.');
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

  const calculateSubtotal = (tableOrders: Order[]) => {
    return tableOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const handlePrintReceipt = (table: Table, tableOrders: Order[]) => {
    const total = calculateSubtotal(tableOrders);
    const windowContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Table ${table.number}</title>
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
          <p class="bold">BORD ${table.number} • KVITTERING</p>
          <p>${new Date().toLocaleString('da-DK')}</p>
        </div>
        <div class="line"></div>
        ${tableOrders
          .flatMap((o) => o.items)
          .map(
            (item) => `
          <div class="row">
            <span>${item.quantity}x ${item.name.da || item.name.en}</span>
            <span>${(item.unitPrice * item.quantity).toFixed(2)} kr</span>
          </div>
        `
          )
          .join('')}
        <div class="line"></div>
        <div class="row bold" style="font-size: 16px;">
          <span>TOTAL</span>
          <span>${total.toFixed(2)} DKK</span>
        </div>
        <div class="line"></div>
        <div class="center">
          <p>Mange tak for besøget!<br/>Hav en god dag på havnen.</p>
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
          <h1 className="text-2xl sm:text-3xl font-black Outfit text-slate-900 dark:text-white">
            {t.admin.tables.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            {language === 'da' ? 'Live oversigt over borde, tjenerkald og sikkerhedsgodkendelser' : 'Live overview of tables, waiter calls & order approval'}
          </p>
        </div>
        
        {/* Status Legend */}
        <div className="flex items-center gap-3 text-xs font-bold bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{t.admin.tables.empty}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>{t.admin.tables.occupied}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{language === 'da' ? 'Kræver Godkendelse' : 'Pending Approval'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-bounce" />
            <span>{t.admin.tables.waiterCalled}</span>
          </div>
        </div>
      </div>

      {/* Waiter Calls Alert Strip */}
      {waiterCalls.filter((c) => c.status === 'active').length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-500/50 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black text-sm mb-3">
            <Bell className="w-5 h-5 animate-bounce" />
            <span>{language === 'da' ? 'Aktive Tjenerkald' : 'Active Waiter Calls'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {waiterCalls
              .filter((c) => c.status === 'active')
              .map((call) => (
                <div
                  key={call.id}
                  className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 p-3 rounded-xl flex items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Bord {call.tableNumber || call.tableId}
                    </div>
                    <div className="text-xs text-red-600 font-bold uppercase tracking-wider">
                      {call.type === 'bill' ? (language === 'da' ? 'Ønsker Regning' : 'Bill Requested') : call.type === 'napkin-water' ? (language === 'da' ? 'Vand / Servietter' : 'Water / Napkins') : (language === 'da' ? 'Kalder Tjener' : 'Call Waiter')}
                    </div>
                  </div>
                  <button
                    onClick={() => resolveCall(call.id)}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-sm"
                  >
                    OK
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-1 overflow-y-auto min-h-0">
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedTable(table)}
              className={cn(
                "relative p-5 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all shadow-sm cursor-pointer",
                colors.bg,
                colors.border,
                colors.text,
                status === 'waiter-called' && "animate-pulse",
                hasPendingOrders && "border-amber-500 ring-2 ring-amber-400/40"
              )}
            >
              {tCalls.length > 0 && (
                <div className="absolute top-3 right-3">
                  <Bell className="w-5 h-5 text-red-500 animate-bounce" />
                </div>
              )}

              {hasPendingOrders && (
                <div className="absolute top-3 right-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-1 text-xs opacity-70 font-bold">
                <Users className="w-3.5 h-3.5" />
                {table.capacity}
              </div>
              <div className="text-3xl sm:text-4xl font-black mt-1">{table.number}</div>
              
              {hasOrders ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-800 dark:text-sky-200">
                    {formatCurrency(calculateSubtotal(tOrders))}
                  </div>
                  {hasPendingOrders && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-extrabold shadow-2xs">
                      Kræver Godkendelse
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-[11px] font-semibold opacity-60">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0E172A] shadow-2xl h-full flex flex-col z-10 border-l border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80">
                <div>
                  <h2 className="text-2xl font-black Outfit text-slate-900 dark:text-white">
                    {t.table.tableNumber} {selectedTable.number}
                  </h2>
                  <p className="text-xs font-bold text-slate-500">
                    Kapacitet: {selectedTable.capacity} personer
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {getTableOrders(selectedTable.id, selectedTable.number).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                    <p className="font-bold">{t.admin.tables.noActiveOrders}</p>
                  </div>
                ) : (
                  getTableOrders(selectedTable.id, selectedTable.number).map((order) => {
                    const isPending = order.status === 'pending';
                    return (
                      <div
                        key={order.id}
                        className={cn(
                          "rounded-2xl p-4 border transition-all",
                          isPending
                            ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700"
                        )}
                      >
                        <div className="text-xs font-bold text-slate-500 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="font-mono">#{order.id.slice(0, 6).toUpperCase()} • {order.paymentMethod || (language === 'da' ? 'Ved bordet' : 'At table')}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                              isPending ? "bg-amber-500 text-slate-950 animate-pulse" : "bg-sky-500/20 text-sky-700 dark:text-sky-300"
                            )}>
                              {isPending ? (language === 'da' ? 'Afventer Godkendelse' : 'Pending Approval') : order.status}
                            </span>
                            <span>{formatTime(order.createdAt)}</span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <div className="font-medium">
                                <span className="font-bold text-sky-500">{item.quantity}x</span>{' '}
                                {item.name[language] || item.name.en}
                              </div>
                              <div className="font-bold">
                                {formatCurrency(item.unitPrice * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Waiter Approval & Fraud Protection Action Buttons */}
                        {isPending && (
                          <div className="pt-3 border-t border-amber-500/30 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleApproveOrder(order.id)}
                              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{language === 'da' ? 'Godkend til Køkken' : 'Approve to Kitchen'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectOrder(order.id)}
                              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                              title={language === 'da' ? 'Afvis falsk bestilling' : 'Reject fake order'}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{language === 'da' ? 'Afvis' : 'Reject'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {t.admin.tables.totalBill}
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(
                      calculateSubtotal(getTableOrders(selectedTable.id, selectedTable.number))
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() =>
                      handlePrintReceipt(
                        selectedTable,
                        getTableOrders(selectedTable.id, selectedTable.number)
                      )
                    }
                    disabled={
                      getTableOrders(selectedTable.id, selectedTable.number).length === 0
                    }
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-bold text-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> {t.admin.tables.printReceipt}
                  </button>
                  <button
                    onClick={() => {
                      toast.info(language === 'da' ? 'Vælg varer fra menukortet til bordet' : 'Select items from menu for table');
                    }}
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-bold text-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> {t.admin.tables.addItem}
                  </button>
                </div>

                <button
                  onClick={() => handleClosePay(selectedTable)}
                  disabled={
                    getTableOrders(selectedTable.id, selectedTable.number).length === 0
                  }
                  className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{t.admin.tables.closeAndPay}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
