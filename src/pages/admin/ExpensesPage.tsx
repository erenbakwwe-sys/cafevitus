import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, X, Wallet } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { Expense, Order } from '../../types';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Period = 'today' | 'week' | 'month';

export default function ExpensesPage() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<Period>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Expense | null>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('ingredients');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);

  const categories = [
    { id: 'ingredients', label: t.admin.expenses.categories.ingredients },
    { id: 'utilities', label: t.admin.expenses.categories.utilities },
    { id: 'rent', label: t.admin.expenses.categories.rent },
    { id: 'salary', label: t.admin.expenses.categories.salary },
    { id: 'maintenance', label: t.admin.expenses.categories.maintenance },
    { id: 'other', label: t.admin.expenses.categories.other },
  ];

  const loadData = async () => {
    const [rawExpenses, allOrders] = await Promise.all([
      storage.getAll<Expense>('expenses'),
      storage.getAll<Order>('orders'),
    ]);
    setExpenses(rawExpenses);
    setOrders(allOrders.filter((o) => o.status === 'completed' || o.status === 'delivered' || o.status === 'paid'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredData = () => {
    const now = new Date();
    let startTimestamp = 0;
    
    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startTimestamp = today.getTime();
    } else if (period === 'week') {
      const week = new Date();
      week.setDate(now.getDate() - 7);
      startTimestamp = week.getTime();
    } else if (period === 'month') {
      const month = new Date();
      month.setMonth(now.getMonth() - 1);
      startTimestamp = month.getTime();
    }

    const filteredExpenses = expenses.filter((e) => e.date >= startTimestamp);
    const filteredOrders = orders.filter((o) => o.createdAt >= startTimestamp);

    const totalIncome = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    return { filteredExpenses, totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses };
  };

  const { filteredExpenses, totalIncome, totalExpenses, netProfit } = getFilteredData();

  const chartData = [
    { name: t.admin.expenses.income, amount: totalIncome, fill: '#10b981' },
    { name: t.admin.expenses.expense, amount: totalExpenses, fill: '#ef4444' },
  ];

  const handleDelete = async (id: string) => {
    if (window.confirm(t.admin.menuMgmt.confirmDelete)) {
      await storage.remove('expenses', id);
      await loadData();
      toast.success(t.common.success);
    }
  };

  const openEdit = (expense: Expense) => {
    setEditingItem(expense);
    setDescription(expense.description);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDateStr(new Date(expense.date).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    setDescription('');
    setAmount(0);
    setCategory('ingredients');
    setDateStr(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      description,
      amount: Number(amount),
      category,
      date: new Date(dateStr).getTime(),
      createdAt: Date.now(),
    };

    if (editingItem) {
      await storage.update('expenses', editingItem.id, data);
      toast.success(t.common.success);
    } else {
      await storage.add<Expense>('expenses', data as any);
      toast.success(t.common.success);
    }
    
    setIsModalOpen(false);
    await loadData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold Outfit text-slate-900 dark:text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-sky-500" />
            {t.admin.expenses.title}
          </h1>
          <p className="text-sm text-slate-500">{t.admin.expenses.subtitle}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition-all"
        >
          <Plus size={20} />
          {t.admin.expenses.addExpense}
        </button>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-max border border-slate-200 dark:border-slate-700">
        {(['today', 'week', 'month'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all",
              period === p 
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {p === 'today' ? t.admin.expenses.today : p === 'week' ? t.admin.expenses.thisWeek : t.admin.expenses.thisMonth}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn("p-6 rounded-3xl border shadow-sm", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl text-emerald-500">
              <TrendingUp size={28} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.admin.expenses.income}</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(totalIncome)}</div>
            </div>
          </div>
        </div>

        <div className={cn("p-6 rounded-3xl border shadow-sm", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-red-500/10 dark:bg-red-500/20 rounded-2xl text-red-500">
              <TrendingDown size={28} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.admin.expenses.expense}</div>
              <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">{formatCurrency(totalExpenses)}</div>
            </div>
          </div>
        </div>

        <div className={cn("p-6 rounded-3xl border shadow-sm", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
          <div className="flex items-center gap-4">
            <div className={cn("p-3.5 rounded-2xl", netProfit >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
              <DollarSign size={28} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {netProfit >= 0 ? t.admin.expenses.netProfit : t.admin.expenses.netLoss}
              </div>
              <div className={cn("text-2xl font-black mt-0.5", netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                {formatCurrency(netProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className={cn("p-6 rounded-3xl border shadow-sm", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
        <h3 className="text-lg font-bold mb-4 Outfit">{t.admin.expenses.chartHeading}</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val} kr`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                  borderRadius: '12px',
                  border: '1px solid rgba(150,150,150,0.2)',
                  fontWeight: 'bold'
                }} 
              />
              <Bar dataKey="amount" radius={[12, 12, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses Table */}
      <div className={cn("rounded-3xl border overflow-hidden shadow-sm", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold Outfit">{t.admin.expenses.expense}</h3>
          <span className="text-xs font-bold text-slate-500">{filteredExpenses.length} {t.admin.expenses.entriesCount}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={cn("border-b text-xs uppercase font-bold tracking-wider", isDark ? "border-slate-800 bg-slate-800/50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500")}>
              <tr>
                <th className="p-4">{t.admin.expenses.description}</th>
                <th className="p-4">{t.admin.expenses.category}</th>
                <th className="p-4">{t.admin.expenses.date}</th>
                <th className="p-4">{t.admin.expenses.amount}</th>
                <th className="p-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{expense.description}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{formatDate(expense.date, language)}</td>
                  <td className="p-4 font-black text-red-500">-{formatCurrency(expense.amount)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(expense)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-500 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(expense.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    {t.common.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border", isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900")}
          >
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold Outfit">
                {editingItem ? t.admin.expenses.editExpense : t.admin.expenses.addExpense}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{t.admin.expenses.description}</label>
                <input required type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.admin.expenses.descPlaceholder} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-medium", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.expenses.amount}</label>
                  <input required type="number" min="1" step="0.5" value={amount || ''} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-bold", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.expenses.category}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-semibold", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{t.admin.expenses.date}</label>
                <input required type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-medium", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  {t.common.cancel}
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/25 transition-colors">
                  {t.common.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
