import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MapPin, Search, ChevronRight } from 'lucide-react';

interface TableSelectModalProps {
  isOpen: boolean;
  onSelect: (tableId: string) => void;
  tables?: Table[];
}

export function TableSelectModal({ isOpen, onSelect }: TableSelectModalProps) {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
  const [manualTable, setManualTable] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTable.trim()) {
      onSelect(manualTable.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${
                isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
              }`}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-center space-x-3 text-sky-500">
                  <MapPin className="h-8 w-8 animate-bounce" />
                  <h2 className="text-2xl font-bold">{t.table.selectTitle}</h2>
                </div>
                <p className="text-center text-sm text-slate-500 mb-6">
                  {t.table.selectDescription}
                </p>

                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.table.tableNumber}
                  </h3>
                  <div className="grid grid-cols-5 gap-2.5">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => onSelect(num.toString())}
                        className={`flex h-12 items-center justify-center rounded-xl font-bold transition-all active:scale-95 ${
                          isDark
                            ? 'bg-slate-800 hover:bg-sky-500 hover:text-white border border-slate-700'
                            : 'bg-slate-100 hover:bg-sky-500 hover:text-white border border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="mx-4 flex-shrink-0 text-xs uppercase font-bold text-slate-400">
                    {t.common.or}
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                <div className="mt-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t.table.enterManually}
                  </h3>
                  <form onSubmit={handleManualSubmit} className="flex space-x-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={manualTable}
                        onChange={(e) => setManualTable(e.target.value)}
                        placeholder={t.table.enterManuallyPlaceholder}
                        className={`w-full rounded-xl py-3 pl-10 pr-4 outline-none ring-1 transition-shadow focus:ring-2 focus:ring-sky-500 ${
                          isDark
                            ? 'bg-slate-800 ring-slate-700 text-white placeholder-slate-500'
                            : 'bg-slate-50 ring-slate-200 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!manualTable.trim()}
                      className="flex items-center justify-center rounded-xl bg-sky-500 px-5 text-white font-bold transition-colors hover:bg-sky-600 disabled:opacity-50"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
