import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Sun, Moon, Globe, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

export default function LoginPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const { language, t, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every(digit => digit !== '')) {
      const pinCode = newPin.join('');
      const success = login(pinCode);
      if (!success) {
        setError(true);
        setTimeout(() => {
          setPin(['', '', '', '']);
          setError(false);
          inputRefs.current[0]?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleNumpadClick = (num: string) => {
    const emptyIndex = pin.findIndex(digit => digit === '');
    if (emptyIndex !== -1) {
      handleChange(emptyIndex, num);
    }
  };

  const handleNumpadBackspace = () => {
    const lastFilledIndex = pin.map((d, i) => d !== '' ? i : -1).filter(i => i !== -1).pop();
    if (lastFilledIndex !== undefined && lastFilledIndex !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIndex] = '';
      setPin(newPin);
      setError(false);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] dark:bg-[#050A14] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.admin.backToMenu}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-2xs"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-500" />}
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 font-bold text-xs shadow-2xs uppercase cursor-pointer flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>{language}</span>
          </button>
        </div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto bg-white/95 dark:bg-[#0E172A]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 my-auto"
      >
        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
            <Lock className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-serif-luxury">{t.admin.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center text-xs font-bold mt-1.5">
            {t.admin.enterPin} <span className="font-extrabold text-amber-600 dark:text-amber-400">{t.admin.defaultPinHint}</span>
          </p>
        </div>

        <motion.div
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center gap-3 mb-6"
        >
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                "w-13 h-15 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none bg-slate-50 dark:bg-slate-900 shadow-inner",
                error 
                  ? "border-red-500 text-red-500 ring-2 ring-red-500/20" 
                  : digit 
                    ? "border-amber-400 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400/20" 
                    : "border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-amber-400"
              )}
            />
          ))}
        </motion.div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs font-extrabold text-red-500 mb-5"
          >
            {t.admin.wrongPin}
          </motion.p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-[260px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumpadClick(num.toString())}
              className="h-13 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-900 dark:text-white text-xl font-black transition-all active:scale-95 border border-slate-200/60 dark:border-slate-700/60 shadow-xs cursor-pointer"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleNumpadClick('0')}
            className="h-13 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-400 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-900 dark:text-white text-xl font-black transition-all active:scale-95 border border-slate-200/60 dark:border-slate-700/60 shadow-xs cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleNumpadBackspace}
            className="h-13 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-red-100 dark:hover:bg-red-950/50 hover:text-red-600 text-slate-900 dark:text-white text-xl font-black transition-all active:scale-95 border border-slate-200/60 dark:border-slate-700/60 shadow-xs flex items-center justify-center cursor-pointer"
            aria-label="Backspace"
          >
            ⌫
          </button>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] font-bold text-slate-400 pt-4">
        Cafe Vitus • Snekkersten Havn
      </div>
    </div>
  );
}
