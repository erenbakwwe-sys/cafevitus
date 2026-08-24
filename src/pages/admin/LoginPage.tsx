import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LoginPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const { language, t } = useLanguage();

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-sky-100 dark:bg-sky-500/20 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white Outfit">{t.admin.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm mt-2">
            {t.admin.enterPin} <span className="font-bold text-sky-500">{t.admin.defaultPinHint}</span>
          </p>
        </div>

        <motion.div
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center gap-3 mb-8"
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
                "w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none bg-slate-50 dark:bg-slate-800",
                error 
                  ? "border-red-500 text-red-500" 
                  : digit 
                    ? "border-sky-500 text-sky-600 dark:text-sky-400" 
                    : "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-sky-400"
              )}
            />
          ))}
        </motion.div>

        {error && (
          <p className="text-center text-xs font-bold text-red-500 mb-6">
            {t.admin.wrongPin}
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumpadClick(num.toString())}
              className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xl font-bold transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleNumpadClick('0')}
            className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xl font-bold transition-all active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleNumpadBackspace}
            className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xl font-bold transition-all active:scale-95 flex items-center justify-center"
          >
            ⌫
          </button>
        </div>
      </motion.div>
    </div>
  );
}
