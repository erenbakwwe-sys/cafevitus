import React, { useState, useEffect } from 'react';
import { storage } from '../../lib/storage';
import { MenuItem, Category, DietTag } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { language, t } = useLanguage();

  // Form states
  const [nameEn, setNameEn] = useState('');
  const [nameDa, setNameDa] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descDa, setDescDa] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<DietTag[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [mItems, cats] = await Promise.all([
      storage.getAll<MenuItem>('menu'),
      storage.getAll<Category>('categories'),
    ]);
    setItems(mItems);
    setCategories(cats.sort((a, b) => a.sortOrder - b.sortOrder));
    if (cats.length > 0 && !categoryId) {
      setCategoryId(cats[0].id);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNameEn('');
    setNameDa('');
    setDescEn('');
    setDescDa('');
    setPrice(0);
    setImageUrl('');
    setTags([]);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setNameEn(item.name.en || '');
    setNameDa(item.name.da || '');
    setDescEn(item.description.en || '');
    setDescDa(item.description.da || '');
    setPrice(item.price);
    setCategoryId(item.categoryId);
    setImageUrl(item.image || '');
    setTags(item.tags || []);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameDa || price <= 0 || !categoryId) {
      toast.error('Udfyld venligst alle obligatoriske felter');
      return;
    }

    const itemPayload = {
      name: { en: nameEn, da: nameDa },
      description: { en: descEn, da: descDa },
      price: Number(price),
      categoryId,
      image: imageUrl.trim() || undefined,
      tags,
      available: editingItem ? editingItem.available : true,
      customizations: editingItem ? editingItem.customizations : [],
      updatedAt: Date.now(),
    };

    if (editingItem) {
      await storage.update('menu', editingItem.id, itemPayload);
      toast.success(t.admin.menuMgmt.saved);
    } else {
      await storage.add<MenuItem>('menu', {
        ...itemPayload,
        createdAt: Date.now(),
      } as any);
      toast.success(t.admin.menuMgmt.saved);
    }

    setIsModalOpen(false);
    await loadData();
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm(t.admin.menuMgmt.confirmDelete)) {
      await storage.remove('menu', id);
      await loadData();
      toast.success(t.admin.menuMgmt.deleted);
    }
  };

  const toggleAvailability = async (id: string, currentAvailable: boolean) => {
    await storage.update('menu', id, { available: !currentAvailable });
    await loadData();
    toast.success(t.admin.menuMgmt.saved);
  };

  const toggleTag = (tag: DietTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.da?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'all' || item.categoryId === activeCategory;
    return matchesSearch && matchesCat;
  });

  const allDietTags: DietTag[] = ['chef-pick', 'vegan', 'vegetarian', 'gluten-free', 'sugar-free'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold Outfit text-slate-900 dark:text-white">
            {t.admin.menuMgmt.title}
          </h1>
          <p className="text-sm text-slate-500">
            {items.length} {t.admin.menuMgmt.title}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-sky-600/25"
        >
          <Plus className="w-5 h-5" /> {t.admin.menuMgmt.addItem}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t.common.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap font-bold text-xs transition-colors ${
              activeCategory === 'all' 
                ? 'bg-sky-500 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
            }`}
          >
            {t.menu.allItems}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap font-bold text-xs transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-sky-500 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
              }`}
            >
              {cat.name[language] || cat.name.en}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 font-bold">{t.admin.menuMgmt.itemName}</th>
                <th className="p-4 font-bold">{t.admin.menuMgmt.itemCategory}</th>
                <th className="p-4 font-bold">{t.admin.menuMgmt.itemPrice}</th>
                <th className="p-4 font-bold">{t.common.status}</th>
                <th className="p-4 font-bold text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img src={item.image} alt={item.name.en} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {item.name[language] || item.name.en}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                          {item.description[language] || item.description.en}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {item.tags?.map((tag) => (
                            <span key={tag} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold">
                      {categories.find((c) => c.id === item.categoryId)?.name[language] || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-sm text-sky-600 dark:text-sky-400">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleAvailability(item.id, item.available)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        item.available 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' 
                          : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:border-red-800'
                      }`}
                    >
                      {item.available ? t.admin.menuMgmt.itemAvailable : t.admin.menuMgmt.itemSoldOut}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold Outfit">
                {editingItem ? t.admin.menuMgmt.editItem : t.admin.menuMgmt.addItem}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Danish Name (DA) *</label>
                  <input
                    type="text"
                    required
                    value={nameDa}
                    onChange={(e) => setNameDa(e.target.value)}
                    placeholder="f.eks. Røget Laks Smørrebrød"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">English Name (EN) *</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="e.g. Smoked Salmon Smørrebrød"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Danish Description (DA)</label>
                  <textarea
                    rows={2}
                    value={descDa}
                    onChange={(e) => setDescDa(e.target.value)}
                    placeholder="Beskrivelse på dansk..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">English Description (EN)</label>
                  <textarea
                    rows={2}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    placeholder="Description in English..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Price (DKK) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={price || ''}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    placeholder="125"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.da || c.name.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.admin.menuMgmt.itemImage}</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/smorrebrod-laks.jpg"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">{t.admin.menuMgmt.itemTags}</label>
                <div className="flex flex-wrap gap-2">
                  {allDietTags.map((tag) => {
                    const isSelected = tags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 font-bold text-sm rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/25"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
