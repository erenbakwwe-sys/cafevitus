import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, AlertTriangle, X, PlusCircle, MinusCircle, Package } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { StockItem } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function StockPage() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  
  const [stock, setStock] = useState<StockItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  // Form state
  const [nameEn, setNameEn] = useState('');
  const [nameDa, setNameDa] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [criticalLevel, setCriticalLevel] = useState<number>(0);
  const [costPerUnit, setCostPerUnit] = useState<number>(0);
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    const data = await storage.getAll<StockItem>('stock');
    setStock(data);
  };

  const filteredStock = stock.filter(item => 
    item.name.en?.toLowerCase().includes(search.toLowerCase()) || 
    item.name.da?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (item: StockItem) => {
    if (item.quantity === 0) return 'out';
    if (item.quantity <= item.criticalLevel) return 'critical';
    if (item.quantity <= item.criticalLevel * 2) return 'low';
    return 'in';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'out': 
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">{t.admin.stock.outOfStock}</span>;
      case 'critical':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {t.admin.stock.criticalAlert}</span>;
      case 'low': 
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">{t.admin.stock.lowStock}</span>;
      case 'in': 
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">{t.admin.stock.inStock}</span>;
      default: return null;
    }
  };

  const handleUpdateQuantity = async (id: string, delta: number) => {
    const item = stock.find(i => i.id === id);
    if (!item) return;
    const newQuantity = Math.max(0, parseFloat((item.quantity + delta).toFixed(2)));
    await storage.update('stock', id, { quantity: newQuantity });
    await loadStock();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.admin.menuMgmt.confirmDelete)) {
      await storage.remove('stock', id);
      await loadStock();
      toast.success(t.common.success);
    }
  };

  const openEdit = (item: StockItem) => {
    setEditingItem(item);
    setNameEn(item.name.en || '');
    setNameDa(item.name.da || '');
    setQuantity(item.quantity);
    setUnit(item.unit);
    setCriticalLevel(item.criticalLevel);
    setCostPerUnit(item.costPerUnit);
    setCategory(item.category);
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingItem(null);
    setNameEn('');
    setNameDa('');
    setQuantity(0);
    setUnit('');
    setCriticalLevel(0);
    setCostPerUnit(0);
    setCategory('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      name: { en: nameEn, da: nameDa },
      quantity: Number(quantity),
      unit,
      criticalLevel: Number(criticalLevel),
      costPerUnit: Number(costPerUnit),
      category,
      updatedAt: Date.now(),
    };

    if (editingItem) {
      await storage.update('stock', editingItem.id, itemData);
      toast.success(t.common.success);
    } else {
      await storage.add<StockItem>('stock', itemData as any);
      toast.success(t.common.success);
    }
    
    setIsModalOpen(false);
    await loadStock();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold Outfit text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-sky-500" />
            {t.admin.stock.title}
          </h1>
          <p className="text-sm text-slate-500">{stock.length} råvarer registreret</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition-all"
        >
          <Plus size={20} />
          {t.admin.stock.addItem}
        </button>
      </div>

      <div className={cn("p-3 rounded-2xl border flex items-center gap-3", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
        <Search className="text-slate-400 ml-2" size={20} />
        <input
          type="text"
          placeholder={t.common.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
        />
      </div>

      <div className={cn("rounded-2xl border overflow-hidden shadow-sm", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={cn("border-b text-xs uppercase font-bold tracking-wider", isDark ? "border-slate-800 bg-slate-800/50 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500")}>
              <tr>
                <th className="p-4">{t.admin.stock.itemName}</th>
                <th className="p-4">{t.admin.stock.category}</th>
                <th className="p-4">{t.admin.stock.quantity}</th>
                <th className="p-4">{t.common.status}</th>
                <th className="p-4">{t.admin.stock.costPerUnit}</th>
                <th className="p-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredStock.map(item => {
                const status = getStatus(item);
                const isCritical = status === 'critical' || status === 'out';
                return (
                  <tr key={item.id} className={cn(isCritical && (isDark ? "bg-red-950/20" : "bg-red-50/70"))}>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.name[language] || item.name.en}</div>
                      <div className="text-xs text-slate-500">Kritisk grænse: {item.criticalLevel} {item.unit}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{item.category}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleUpdateQuantity(item.id, -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                          <MinusCircle size={18} />
                        </button>
                        <span className={cn("font-bold min-w-[50px] text-center", isCritical ? "text-red-500 font-extrabold" : "text-slate-900 dark:text-white")}>
                          {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                        </span>
                        <button onClick={() => handleUpdateQuantity(item.id, 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                          <PlusCircle size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(status)}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.costPerUnit)} / {item.unit}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-sky-500 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStock.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    {t.common.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl border", isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900")}
          >
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold Outfit">
                {editingItem ? t.admin.stock.editItem : t.admin.stock.addItem}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Dansk Navn (DA)</label>
                  <input required type="text" value={nameDa} onChange={e => setNameDa(e.target.value)} placeholder="f.eks. Kaffebønner" className={cn("w-full p-3 rounded-xl border outline-none text-sm font-medium", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">English Name (EN)</label>
                  <input required type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. Coffee Beans" className={cn("w-full p-3 rounded-xl border outline-none text-sm font-medium", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.stock.category}</label>
                  <input required type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Coffee / Dairy / Fish..." className={cn("w-full p-3 rounded-xl border outline-none text-sm font-medium", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.stock.unit}</label>
                  <input required type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="kg / liter / pcs..." className={cn("w-full p-3 rounded-xl border outline-none text-sm font-medium", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.stock.quantity}</label>
                  <input required type="number" min="0" step="0.1" value={quantity || ''} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-bold", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.stock.criticalLevel}</label>
                  <input required type="number" min="0" step="0.1" value={criticalLevel || ''} onChange={e => setCriticalLevel(parseFloat(e.target.value) || 0)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-bold", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.admin.stock.costPerUnit}</label>
                  <input required type="number" min="0" step="0.5" value={costPerUnit || ''} onChange={e => setCostPerUnit(parseFloat(e.target.value) || 0)} className={cn("w-full p-3 rounded-xl border outline-none text-sm font-bold", isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200")} />
                </div>
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
