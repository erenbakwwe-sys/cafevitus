import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Thermometer,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  Calendar,
  Clock,
  User,
  Truck,
  Building2,
  FileText,
  X,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { TemperatureLog, HygieneChecklist } from '../../types';
import { formatTime, formatDate, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function FoodSafetyPage() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  const [temperatures, setTemperatures] = useState<TemperatureLog[]>([]);
  const [checklists, setChecklists] = useState<HygieneChecklist[]>([]);
  const [activeTab, setActiveTab] = useState<'temperatures' | 'checklists'>('temperatures');

  // New Temperature Modal
  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  const [tempUnitName, setTempUnitName] = useState('Køleskab 1 (Fisk & Skaldyr)');
  const [tempType, setTempType] = useState<'fridge' | 'freezer' | 'hot-holding'>('fridge');
  const [tempValue, setTempValue] = useState<number>(3.2);
  const [tempCheckedBy, setTempCheckedBy] = useState('Freja Jensen (Kok)');

  useEffect(() => {
    loadData();
    const unsubTemps = storage.subscribe<TemperatureLog>('temperatures', (data) => setTemperatures(data));
    const unsubChecks = storage.subscribe<HygieneChecklist>('hygiene_checklists', (data) => setChecklists(data));
    return () => {
      unsubTemps();
      unsubChecks();
    };
  }, []);

  const loadData = async () => {
    const [tempData, checkData] = await Promise.all([
      storage.getAll<TemperatureLog>('temperatures'),
      storage.getAll<HygieneChecklist>('hygiene_checklists'),
    ]);
    setTemperatures(tempData.sort((a, b) => b.timestamp - a.timestamp));
    setChecklists(checkData);
  };

  const handleAddTemperature = async (e: React.FormEvent) => {
    e.preventDefault();
    let maxAllowed = 5.0;
    let isCompliant = true;

    if (tempType === 'fridge') {
      maxAllowed = 5.0;
      isCompliant = tempValue <= 5.0;
    } else if (tempType === 'freezer') {
      maxAllowed = -18.0;
      isCompliant = tempValue <= -18.0;
    } else if (tempType === 'hot-holding') {
      maxAllowed = 65.0;
      isCompliant = tempValue >= 65.0;
    }

    const newTemp: TemperatureLog = {
      id: 'temp-' + Date.now().toString(36),
      unitName: tempUnitName,
      unitType: tempType,
      temperature: tempValue,
      maxAllowed,
      isCompliant,
      checkedBy: tempCheckedBy.trim() || 'Personale',
      timestamp: Date.now(),
    };

    await storage.add<TemperatureLog>('temperatures', newTemp);
    await loadData();
    setIsTempModalOpen(false);

    if (isCompliant) {
      toast.success(`${tempUnitName}: ${tempValue}°C - ${t.egenkontrol.compliant}`);
    } else {
      toast.error(`${tempUnitName}: ${tempValue}°C - ${t.egenkontrol.alert}`, {
        description: language === 'da' ? 'Temperaturen afviger fra Fødevarestyrelsens lovkrav!' : 'Temperature exceeds legal compliance threshold!',
      });
    }
  };

  const handleToggleCheckItem = async (checklistId: string, itemId: string) => {
    const targetChecklist = checklists.find((c) => c.id === checklistId);
    if (!targetChecklist) return;

    const updatedItems = targetChecklist.items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const allChecked = updatedItems.every((item) => item.checked);

    await storage.update('hygiene_checklists', checklistId, {
      items: updatedItems,
      completed: allChecked,
      completedAt: allChecked ? Date.now() : undefined,
    });
    await loadData();
  };

  const handleSignChecklist = async (checklist: HygieneChecklist) => {
    const signer = prompt(
      language === 'da' ? 'Indtast dit navn for at signere egenkontrollen:' : 'Enter your name to sign the checklist:'
    );
    if (!signer) return;

    const allCheckedItems = checklist.items.map((it) => ({ ...it, checked: true }));

    await storage.update('hygiene_checklists', checklist.id, {
      items: allCheckedItems,
      completed: true,
      completedBy: signer,
      completedAt: Date.now(),
    });
    await loadData();
    toast.success(t.egenkontrol.checklistComplete, {
      description: `${checklist.title[language] || checklist.title.da} • ${signer}`,
    });
  };

  // Units standard list
  const standardUnits = [
    { name: 'Køleskab 1 (Fisk & Skaldyr)', type: 'fridge' as const, max: '≤ 4.0°C' },
    { name: 'Køleskab 2 (Mejeri & Dressinger)', type: 'fridge' as const, max: '≤ 5.0°C' },
    { name: 'Hovedfryser (Kød & Brød)', type: 'freezer' as const, max: '≤ -18.0°C' },
    { name: 'Varmholdelse (Supper & Sovs)', type: 'hot-holding' as const, max: '≥ 65.0°C' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-slate-900 dark:text-white">
              {t.egenkontrol.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Enos Egenkontrol
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.egenkontrol.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTempModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Thermometer className="w-4 h-4" />
          <span>{t.egenkontrol.addTempCheck}</span>
        </button>
      </div>

      {/* Danish Food Administration Elite-Smiley Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
            😊
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>{t.egenkontrol.smileyBadge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif-luxury mt-1">
              Fødevarestyrelsen Kontrolrapport: Elite Status
            </h2>
            <p className="text-xs text-white/90 font-medium">
              {t.egenkontrol.smileyDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold text-emerald-100 block">{t.egenkontrol.inspectionReady}</span>
            <span className="text-xs font-black text-white">4 x Glade Smileyer</span>
          </div>
          <a
            href="https://www.findsmiley.dk"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-black text-xs hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            {t.egenkontrol.viewCertificate}
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('temperatures')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
            activeTab === 'temperatures'
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
          )}
        >
          <Thermometer className="w-4 h-4" />
          <span>{t.egenkontrol.tempCheckTitle}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('checklists')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
            activeTab === 'checklists'
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
          )}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>{t.egenkontrol.dailyChecklists} ({checklists.length})</span>
        </button>
      </div>

      {/* Temperature Control Tab */}
      {activeTab === 'temperatures' && (
        <div className="space-y-6">
          {/* Quick Overview Cards for Standard Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {standardUnits.map((u, i) => {
              const latestLog = temperatures.find((t) => t.unitName === u.name) || temperatures[i];
              const isCompliant = latestLog ? latestLog.isCompliant : true;
              return (
                <div
                  key={u.name}
                  className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                      Lovkrav: {u.max}
                    </span>
                    <Thermometer className={cn("w-4 h-4", isCompliant ? "text-emerald-500" : "text-rose-500")} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {u.name}
                  </h3>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className={cn("text-2xl font-black font-mono", isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600")}>
                      {latestLog ? `${latestLog.temperature}°C` : '—'}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase", isCompliant ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600")}>
                      {isCompliant ? t.egenkontrol.compliant : t.egenkontrol.alert}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {latestLog ? `${formatTime(latestLog.timestamp)} • ${latestLog.checkedBy}` : 'Ikke målt i dag'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Temperature Log History Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white font-serif-luxury">
              Fødevarestyrelsen Temperaturjournal
            </h2>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="pb-2.5">Kølerum / Enhed</th>
                    <th className="pb-2.5">Målt Temperatur</th>
                    <th className="pb-2.5">Grænseværdi</th>
                    <th className="pb-2.5">Tidspunkt</th>
                    <th className="pb-2.5">Kontrolleret af</th>
                    <th className="pb-2.5 text-right">Resultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {temperatures.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                        {log.unitName}
                      </td>
                      <td className="py-2.5 font-mono font-extrabold text-slate-900 dark:text-white">
                        {log.temperature}°C
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono">
                        {log.unitType === 'fridge' ? '≤ 5.0°C' : log.unitType === 'freezer' ? '≤ -18.0°C' : '≥ 65.0°C'}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {formatDate(log.timestamp)} kl. {formatTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">
                        {log.checkedBy}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1",
                            log.isCompliant
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          )}
                        >
                          {log.isCompliant ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>{t.egenkontrol.compliant}</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                              <span>{t.egenkontrol.alert}</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Checklists Tab */}
      {activeTab === 'checklists' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {checklists.map((chk) => (
              <div
                key={chk.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                      {chk.type === 'opening' ? 'Åbnetjek' : chk.type === 'closing' ? 'Lukketjek' : 'Varemodtagelse'}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                        chk.completed
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600"
                      )}
                    >
                      {chk.completed ? 'Gennemført' : 'Mangler kontrol'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2 font-serif-luxury">
                    {chk.title[language] || chk.title.da}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dato: {chk.date} {chk.completedBy ? `• Signeret af: ${chk.completedBy}` : ''}
                  </p>

                  {/* Checklist items */}
                  <div className="space-y-2 mt-4">
                    {chk.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleCheckItem(chk.id, item.id)}
                        className={cn(
                          "w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer",
                          item.checked
                            ? "bg-emerald-500/5 border-emerald-500/30 text-slate-900 dark:text-slate-100"
                            : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                            item.checked
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          )}
                        >
                          {item.checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={cn("leading-tight font-medium", item.checked && "line-through opacity-70")}>
                          {item.label[language] || item.label.da}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {!chk.completed && (
                  <button
                    type="button"
                    onClick={() => handleSignChecklist(chk)}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.egenkontrol.saveChecklist}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Temperature Check */}
      <AnimatePresence>
        {isTempModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTempModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0B132B] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-serif-luxury">
                  {t.egenkontrol.logTemp}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsTempModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTemperature} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.egenkontrol.unitName}</label>
                  <input
                    type="text"
                    required
                    value={tempUnitName}
                    onChange={(e) => setTempUnitName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                    <select
                      value={tempType}
                      onChange={(e) => setTempType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer"
                    >
                      <option value="fridge">Køleskab (Max 5°C)</option>
                      <option value="freezer">Fryser (Min -18°C)</option>
                      <option value="hot-holding">Varmholdelse (Min 65°C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.egenkontrol.temperature} *</label>
                    <input
                      type="number"
                      step={0.1}
                      required
                      value={tempValue}
                      onChange={(e) => setTempValue(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.egenkontrol.inspectedBy} *</label>
                  <input
                    type="text"
                    required
                    placeholder="Freja Jensen (Kok)"
                    value={tempCheckedBy}
                    onChange={(e) => setTempCheckedBy(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTempModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                  >
                    {t.egenkontrol.logTemp}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
