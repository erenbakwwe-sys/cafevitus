import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Tag, X, Ticket } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { Coupon } from '../../types';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function CouponsPage() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Coupon | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [expiresAtStr, setExpiresAtStr] = useState('');
  const [usageLimitStr, setUsageLimitStr] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    const data = await storage.getAll<Coupon>('coupons');
    setCoupons(data);
  };

  const getStatus = (coupon: Coupon) => {
    if (!coupon.active) return 'inactive';
    if (coupon.expiresAt && coupon.expiresAt < Date.now()) return 'expired';
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return 'expired';
    return 'active';
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.admin.menuMgmt.confirmDelete)) {
      await storage.remove('coupons', id);
      await loadCoupons();
      toast.success(t.common.success);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    await storage.update('coupons', coupon.id, { active: !coupon.active });
    await loadCoupons();
  };

  const openEdit = (coupon: Coupon) => {
    setEditingItem(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value);
    setExpiresAtStr(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '');
    setUsageLimitStr(coupon.usageLimit ? coupon.usageLimit.toString() : '');
    setActive(coupon.active);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    setCode('');
    setType('percentage');
    setValue(10);
    setExpiresAtStr('');
    setUsageLimitStr('50');
    setActive(true);
    setIsModalOpen(true);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'VITUS-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      expiresAt: expiresAtStr ? new Date(expiresAtStr).getTime() : Date.now() + 30 * 86400000,
      usageLimit: usageLimitStr ? Number(usageLimitStr) : 100,
      active,
    };

    if (editingItem) {
      await storage.update('coupons', editingItem.id, data);
      toast.success(t.common.success);
    } else {
      await storage.add<Coupon>('coupons', {
        ...data,
        usedCount: 0,
        createdAt: Date.now(),
      } as any);
      toast.success(t.common.success);
    }
    
    setIsModalOpen(false);
    await loadCoupons();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold Outfit text-slate-900 dark:text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-sky-500" />
            {t.admin.coupons.title}
          </h1>
          <p className="text-sm text-slate-500">Rabatkoder & kundeloyalitet</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition-all"
        >
          <Plus size={20} />
          {t.admin.coupons.addCoupon}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => {
          const status = getStatus(coupon);
          return (
            <div key={coupon.id} className={cn("p-6 rounded-3xl border relative overflow-hidden shadow-sm flex flex-col justify-between", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => toggleActive(coupon)} 
                  className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full border transition-colors", 
                    status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800" : 
                    status === 'inactive' ? "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700" : 
                    "bg-red-50 text-red-500 border-red-200 dark:bg-red-950/40 dark:border-red-800"
                  )}
                >
                  {status === 'active' ? t.admin.coupons.active : status === 'inactive' ? t.admin.coupons.inactive : t.admin.coupons.expired}
                </button>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-2xl">
                    <Tag size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-extrabold">{coupon.code}</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {coupon.type === 'percentage' ? `${coupon.value}% RABAT` : formatCurrency(coupon.value)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-slate-500 mb-6 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                  <div className="flex justify-between font-semibold">
                    <span>{t.admin.coupons.usedCount}:</span>
                    <span className="text-slate-900 dark:text-white">{coupon.usedCount} / {coupon.usageLimit || t.admin.coupons.noLimit}</span>
                  </div>
                  {coupon.expiresAt && (
                    <div className="flex justify-between font-semibold">
                      <span>{t.admin.coupons.expiresAt}:</span>
                      <span className="text-slate-900 dark:text-white">{formatDate(coupon.expiresAt, language)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => openEdit(coupon)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors font-bold text-xs flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Edit2 size={14} /> {t.common.edit}
                </button>
                <button onClick={() => handleDelete(coupon.id)} className="flex-1 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 rounded-xl transition-colors font-bold text-xs flex items-center justify-center gap-1.5">
                  <Trash2 size={14} /> {t.common.delete}
                </button>
              </div>
            </div>
          );
        })}
        {coupons.length === 0 && (
          <div className="col-span-full p-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            {t.common.noResults}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border", isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900")}
          >
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold Outfit">
                {editingItem ? t.admin.coupons.editCoupon : t.admin.coupons.addCoupon}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{t.admin.coupons.couponCode}</label>
                <div className="flex gap-2">
                  <input required type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="f.eks. SOMMER20" className={cn("w-full p-3 rounded-xl border outline-none font-mono uppercase text-sm font-bold", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                  <button type="button" onClick={generateCode} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-xs">Generer</button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.coupons.discountType}</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-semibold", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")}>
                    <option value="percentage">{t.admin.coupons.percentage} (%)</option>
                    <option value="fixed">{t.admin.coupons.fixedAmount} (DKK)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.coupons.value}</label>
                  <input required type="number" min="1" step="1" value={value || ''} onChange={(e) => setValue(parseFloat(e.target.value) || 0)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-bold", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.coupons.usageLimit}</label>
                  <input type="number" min="1" value={usageLimitStr} onChange={(e) => setUsageLimitStr(e.target.value)} placeholder="100" className={cn("w-full p-3 rounded-xl border outline-none text-sm font-medium", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.coupons.expiresAt}</label>
                  <input type="date" value={expiresAtStr} onChange={(e) => setExpiresAtStr(e.target.value)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-medium", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-5 h-5 accent-sky-500" />
                <label htmlFor="active" className="text-sm font-bold">{t.admin.coupons.active}</label>
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
