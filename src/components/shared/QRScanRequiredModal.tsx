import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, Camera, ShieldCheck, KeyRound, AlertCircle, 
  X, Check, Sparkles, MapPin, Coffee, Lock, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  verifyTableQRToken, 
  setVerifiedTableSession, 
  generateTableQRToken 
} from '../../lib/security';
import { toast } from 'sonner';

interface QRScanRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (tableNumber: string) => void;
  currentTable?: string | null;
}

export function QRScanRequiredModal({
  isOpen,
  onClose,
  onVerified,
  currentTable,
}: QRScanRequiredModalProps) {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'scan' | 'manual' | 'staff'>('scan');
  
  // Manual Input State
  const [tableInput, setTableInput] = useState(currentTable || '1');
  const [tokenInput, setTokenInput] = useState('');
  
  // Staff PIN State
  const [staffPin, setStaffPin] = useState('');

  const [scanningActive, setScanningActive] = useState(false);

  const handleSimulatedScan = (tableNum: string) => {
    const token = generateTableQRToken(tableNum);
    setVerifiedTableSession(tableNum, token);
    toast.success(`${t.table.tableNumber} ${tableNum}: ${t.security.successVerified}`);
    if (onVerified) onVerified(tableNum);
    onClose();
  };

  const handleManualVerify = () => {
    const cleanTable = tableInput.trim();
    const cleanToken = tokenInput.trim();

    if (!cleanTable || !cleanToken) {
      toast.error(t.common.fillRequiredFields);
      return;
    }

    const isValid = verifyTableQRToken(cleanTable, cleanToken);
    if (isValid) {
      setVerifiedTableSession(cleanTable, cleanToken);
      toast.success(`${t.table.tableNumber} ${cleanTable}: ${t.security.successVerified}`);
      if (onVerified) onVerified(cleanTable);
      onClose();
    } else {
      toast.error(t.security.invalidCode);
    }
  };

  const handleStaffBypass = () => {
    if (staffPin === '1234') {
      const targetTable = tableInput.trim() || '1';
      const token = generateTableQRToken(targetTable);
      setVerifiedTableSession(targetTable, token);
      toast.success(`Personale verificeret: ${t.table.tableNumber} ${targetTable} låst op!`);
      if (onVerified) onVerified(targetTable);
      onClose();
    } else {
      toast.error(t.security.wrongStaffPin);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className={`relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl z-10 border my-auto ${
              isDark ? 'bg-[#0E172A] text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            {/* Header */}
            <div className="relative p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-black shadow-inner shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold font-serif-luxury text-slate-900 dark:text-white leading-tight">
                      {t.security.qrScanRequiredTitle}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {t.security.qrScanRequiredDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1.5 p-1 mt-4 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('scan')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'scan'
                      ? 'bg-white dark:bg-amber-400 text-slate-900 dark:text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.security.scanWithCamera}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'manual'
                      ? 'bg-white dark:bg-amber-400 text-slate-900 dark:text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{t.security.orEnterCode}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('staff')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'staff'
                      ? 'bg-white dark:bg-amber-400 text-slate-900 dark:text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.security.staffDemoBypass}</span>
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Tab 1: Scanner Simulation & Table Quick Selection */}
              {activeTab === 'scan' && (
                <div className="space-y-4 text-center">
                  <div className="relative mx-auto w-48 h-48 rounded-2xl border-2 border-dashed border-amber-400 bg-slate-950/5 dark:bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                    <QrCode className="w-20 h-20 text-slate-400 dark:text-slate-600 mb-2 opacity-50" />
                    
                    {/* Animated Scanning Beam */}
                    <motion.div
                      animate={{ y: [-70, 70, -70] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                      className="absolute inset-x-2 h-0.5 bg-amber-400 shadow-[0_0_12px_#F59E0B]"
                    />

                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 z-10 px-4">
                      {language === 'da'
                        ? 'Ret mobilkameraet mod QR-koden på dit bord'
                        : 'Point phone camera at table QR stand'}
                    </p>
                  </div>

                  {/* 1-Click Test Table Shortcuts */}
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      {language === 'da' ? 'Hurtig test: Vælg et bord at verificere' : 'Quick test: Choose a table to verify'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {['1', '2', '3', '4', '5', '6'].map((tableNum) => (
                        <button
                          key={tableNum}
                          type="button"
                          onClick={() => handleSimulatedScan(tableNum)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 text-xs font-black transition-all cursor-pointer shadow-2xs border border-slate-200 dark:border-slate-700"
                        >
                          {t.table.tableNumber} {tableNum}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Manual Table + Verification Token Entry */}
              {activeTab === 'manual' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-semibold">
                    {t.security.enterTableAndToken}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        {t.table.tableNumber}
                      </label>
                      <input
                        type="text"
                        value={tableInput}
                        onChange={(e) => setTableInput(e.target.value)}
                        placeholder={t.security.tableNumberPlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                        {language === 'da' ? 'Sikkerhedskode' : 'Security Token'}
                      </label>
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                        placeholder={t.security.tokenPlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span>{language === 'da' ? 'Eksempel for Bord 1:' : 'Example for Table 1:'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTableInput('1');
                        setTokenInput(generateTableQRToken('1'));
                      }}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      {language === 'da' ? 'Udfyld Bord 1 kode' : 'Autofill Table 1 token'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualVerify}
                    className="w-full py-3.5 rounded-2xl bg-slate-950 dark:bg-amber-400 text-white dark:text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.security.verifyButton}</span>
                  </button>
                </div>
              )}

              {/* Tab 3: Staff Demo Bypass */}
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    {t.security.staffBypassDesc}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {language === 'da' ? 'Vælg Bord' : 'Select Table'}
                    </label>
                    <input
                      type="text"
                      value={tableInput}
                      onChange={(e) => setTableInput(e.target.value)}
                      placeholder="F.eks. 1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 dark:text-white mb-3"
                    />

                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {language === 'da' ? 'Personale-PIN' : 'Staff PIN'}
                    </label>
                    <input
                      type="password"
                      value={staffPin}
                      onChange={(e) => setStaffPin(e.target.value)}
                      placeholder={t.security.staffPinPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleStaffBypass}
                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.security.unlockDemo}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[11px] font-bold text-slate-400">
                Cafe Vitus • Snekkersten Havn • Sikker Bestilling
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
