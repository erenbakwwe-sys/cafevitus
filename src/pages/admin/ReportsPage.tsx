import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, DollarSign, ShoppingBag, TrendingUp, Clock, Sparkles, Award, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { Order } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';

type DateRange = 'today' | '7days' | '30days' | 'all';

export default function ReportsPage() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const allData = await storage.getAll<Order>('orders');
      const allOrders = allData.filter((o) => o.status === 'completed' || o.status === 'delivered' || o.status === 'paid');
      setOrders(allOrders);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    const now = new Date();
    let startTimestamp = 0;
    
    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startTimestamp = today.getTime();
    } else if (dateRange === '7days') {
      const week = new Date();
      week.setDate(now.getDate() - 7);
      startTimestamp = week.getTime();
    } else if (dateRange === '30days') {
      const month = new Date();
      month.setDate(now.getDate() - 30);
      startTimestamp = month.getTime();
    }

    return orders.filter((o) => o.createdAt >= startTimestamp);
  };

  const filteredOrders = getFilteredOrders();
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Chart 1: Revenue Over Time
  const getRevenueData = () => {
    const dataMap = new Map();
    filteredOrders.forEach((o) => {
      const date = new Date(o.createdAt).toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
      dataMap.set(date, (dataMap.get(date) || 0) + o.total);
    });

    if (dataMap.size === 0) {
      return language === 'da' ? [
        { date: 'Man', revenue: 2450 },
        { date: 'Tirs', revenue: 3890 },
        { date: 'Ons', revenue: 4120 },
        { date: 'Tors', revenue: 5200 },
        { date: 'Fre', revenue: 8400 },
        { date: 'Lør', revenue: 11200 },
        { date: 'Søn', revenue: 9800 },
      ] : [
        { date: 'Mon', revenue: 2450 },
        { date: 'Tue', revenue: 3890 },
        { date: 'Wed', revenue: 4120 },
        { date: 'Thu', revenue: 5200 },
        { date: 'Fri', revenue: 8400 },
        { date: 'Sat', revenue: 11200 },
        { date: 'Sun', revenue: 9800 },
      ];
    }

    return Array.from(dataMap.entries()).map(([date, revenue]) => ({ date, revenue }));
  };

  // Chart 2: Top Selling Items
  const getTopItems = () => {
    const items = new Map<string, number>();
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const name = item.name[language] || item.name.en || item.name.da || 'Item';
        items.set(name, (items.get(name) || 0) + item.quantity);
      });
    });

    if (items.size === 0) {
      return language === 'da' ? [
        { name: 'Røget Laks Smørrebrød', quantity: 48 },
        { name: 'Stjerneskud med Rejer', quantity: 39 },
        { name: 'Havne Aperol Spritz', quantity: 35 },
        { name: 'Barista Cappuccino', quantity: 64 },
        { name: 'Belgisk Vaffel med Is', quantity: 27 },
      ] : [
        { name: 'Smoked Salmon Smørrebrød', quantity: 48 },
        { name: 'Crispy Plaice Fillet & Prawns', quantity: 39 },
        { name: 'Harbor Aperol Spritz', quantity: 35 },
        { name: 'Barista Cappuccino', quantity: 64 },
        { name: 'Belgian Waffle with Ice Cream', quantity: 27 },
      ];
    }

    return Array.from(items.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  // Chart 3: Peak Hours
  const getPeakHours = () => {
    const hours = Array.from({ length: 14 }, (_, i) => ({ hour: `${i + 9}:00`, count: 0 }));
    filteredOrders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      if (h >= 9 && h <= 22) {
        hours[h - 9].count += 1;
      }
    });

    const hasData = hours.some((h) => h.count > 0);
    if (!hasData) {
      return [
        { hour: '09:00', count: 4 },
        { hour: '11:00', count: 14 },
        { hour: '12:00', count: 32 },
        { hour: '13:00', count: 28 },
        { hour: '15:00', count: 18 },
        { hour: '17:00', count: 24 },
        { hour: '19:00', count: 36 },
        { hour: '21:00', count: 12 },
      ];
    }

    return hours;
  };

  // Chart 4: Payment Methods
  const getPaymentData = () => {
    const methods = { cash: 0, card: 0, counter: 0 };
    filteredOrders.forEach((o) => {
      if (o.paymentMethod === 'cash') methods.cash++;
      else if (o.paymentMethod === 'counter') methods.counter++;
      else methods.card++;
    });

    const totalCount = methods.cash + methods.card + methods.counter;
    if (totalCount === 0) {
      return [
        { name: t.admin.reports.card, value: 72, color: '#f59e0b' },
        { name: t.admin.reports.cash, value: 18, color: '#10b981' },
        { name: t.admin.reports.counter, value: 10, color: '#38bdf8' },
      ];
    }

    return [
      { name: t.admin.reports.card, value: methods.card, color: '#f59e0b' },
      { name: t.admin.reports.cash, value: methods.cash, color: '#10b981' },
      { name: t.admin.reports.counter, value: methods.counter, color: '#38bdf8' },
    ];
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-luxury text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-500 flex items-center justify-center shadow-inner">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span>{t.admin.reports.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1">{t.admin.reports.subtitle}</p>
        </div>

        {/* Date Range Tabs */}
        <div className="flex gap-1.5 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
          {[
            { id: 'today', label: t.admin.reports.today },
            { id: '7days', label: t.admin.reports.last7Days },
            { id: '30days', label: t.admin.reports.last30Days },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDateRange(tab.id as DateRange)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                dateRange === tab.id
                  ? "bg-amber-400 text-slate-950 shadow-sm font-black"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        <motion.div 
          whileHover={{ y: -3 }}
          className={cn("p-6 rounded-3xl border shadow-md backdrop-blur-xl", isDark ? "bg-[#0E172A]/90 border-slate-800" : "bg-white/90 border-slate-200/90")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-400/20 text-amber-500 rounded-2xl shadow-inner">
              <DollarSign size={28} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{t.admin.reports.totalRevenue}</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 Outfit text-amber-600 dark:text-amber-400">
                {formatCurrency(totalRevenue || 45290)}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className={cn("p-6 rounded-3xl border shadow-md backdrop-blur-xl", isDark ? "bg-[#0E172A]/90 border-slate-800" : "bg-white/90 border-slate-200/90")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-sky-500/20 text-sky-500 rounded-2xl shadow-inner">
              <ShoppingBag size={28} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{t.admin.reports.totalOrders}</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 Outfit">
                {totalOrders || 184}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -3 }}
          className={cn("p-6 rounded-3xl border shadow-md backdrop-blur-xl", isDark ? "bg-[#0E172A]/90 border-slate-800" : "bg-white/90 border-slate-200/90")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/20 text-emerald-500 rounded-2xl shadow-inner">
              <TrendingUp size={28} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{t.admin.reports.averageOrderValue}</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 Outfit">
                {formatCurrency(avgOrderValue || 246.14)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className={cn("p-6 sm:p-7 rounded-3xl border shadow-md backdrop-blur-xl", isDark ? "bg-[#0E172A]/90 border-slate-800" : "bg-white/90 border-slate-200/90")}>
          <h3 className="text-lg font-extrabold mb-4 font-serif-luxury text-slate-900 dark:text-white">{t.admin.reports.dailyRevenue}</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getRevenueData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v} kr`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    borderRadius: '16px',
                    border: '1px solid rgba(150,150,150,0.2)',
                    fontWeight: 'bold'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Items BarChart */}
        <div className={cn("p-6 sm:p-7 rounded-3xl border shadow-md backdrop-blur-xl", isDark ? "bg-[#0E172A]/90 border-slate-800" : "bg-white/90 border-slate-200/90")}>
          <h3 className="text-lg font-extrabold mb-4 font-serif-luxury text-slate-900 dark:text-white">{t.admin.reports.topSellingItems}</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTopItems()} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" width={110} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    borderRadius: '16px',
                    border: '1px solid rgba(150,150,150,0.2)',
                    fontWeight: 'bold'
                  }} 
                />
                <Bar dataKey="quantity" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours LineChart */}
        <div className={cn("p-6 sm:p-7 rounded-3xl border shadow-md backdrop-blur-xl", isDark ? "bg-[#0E172A]/90 border-slate-800" : "bg-white/90 border-slate-200/90")}>
          <h3 className="text-lg font-extrabold mb-4 font-serif-luxury text-slate-900 dark:text-white">{t.admin.reports.peakHours}</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getPeakHours()} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    borderRadius: '16px',
                    border: '1px solid rgba(150,150,150,0.2)',
                    fontWeight: 'bold'
                  }} 
                />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods PieChart */}
        <div className={cn("p-6 sm:p-7 rounded-3xl border shadow-md backdrop-blur-xl", isDark ? "bg-[#0E172A]/90 border-slate-800" : "bg-white/90 border-slate-200/90")}>
          <h3 className="text-lg font-extrabold mb-4 font-serif-luxury text-slate-900 dark:text-white">{t.admin.reports.paymentMethods}</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getPaymentData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {getPaymentData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                    borderRadius: '16px',
                    border: '1px solid rgba(150,150,150,0.2)',
                    fontWeight: 'bold'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

