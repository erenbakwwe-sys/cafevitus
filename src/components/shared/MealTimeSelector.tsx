import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sun, Utensils, Wine, Sparkles, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { MealPeriod } from '../../types';

export type SelectedMealMode = 'auto' | MealPeriod;

export function getCurrentMealPeriod(): MealPeriod {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hours + minutes / 60;

  // 07:00 – 11:30 = Breakfast
  if (timeVal >= 7 && timeVal < 11.5) {
    return 'breakfast';
  }
  // 11:30 – 16:30 = Lunch
  if (timeVal >= 11.5 && timeVal < 16.5) {
    return 'lunch';
  }
  // 16:30 – 22:30 = Dinner
  if (timeVal >= 16.5 && timeVal < 22.5) {
    return 'dinner';
  }
  // 22:30 – 07:00 = Full menu so late-night guests can explore everything
  return 'all-day';
}

interface MealTimeSelectorProps {
  selectedMode: SelectedMealMode;
  onSelectMode: (mode: SelectedMealMode) => void;
  itemCountForCurrentMode?: number;
}

export function MealTimeSelector({
  selectedMode,
  onSelectMode,
  itemCountForCurrentMode,
}: MealTimeSelectorProps) {
  const { t, language } = useLanguage();
  const [currentAutoPeriod, setCurrentAutoPeriod] = useState<MealPeriod>(getCurrentMealPeriod());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAutoPeriod(getCurrentMealPeriod());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const effectivePeriod = selectedMode === 'auto' ? currentAutoPeriod : selectedMode;
  const isBrowsingOther = selectedMode !== 'auto' && selectedMode !== 'all-day';

  const periodOptions: {
    id: SelectedMealMode;
    label: string;
    hours: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'auto',
      label: `${t.mealPeriods.auto} (${currentAutoPeriod === 'breakfast' ? t.mealPeriods.breakfast : currentAutoPeriod === 'lunch' ? t.mealPeriods.lunch : t.mealPeriods.dinner})`,
      hours: currentAutoPeriod === 'breakfast' ? t.mealPeriods.breakfastHours : currentAutoPeriod === 'lunch' ? t.mealPeriods.lunchHours : t.mealPeriods.dinnerHours,
      icon: <Clock className="w-4 h-4 text-emerald-500" />,
      color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'breakfast',
      label: t.mealPeriods.breakfast,
      hours: t.mealPeriods.breakfastHours,
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      id: 'lunch',
      label: t.mealPeriods.lunch,
      hours: t.mealPeriods.lunchHours,
      icon: <Utensils className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    },
    {
      id: 'dinner',
      label: t.mealPeriods.dinner,
      hours: t.mealPeriods.dinnerHours,
      icon: <Wine className="w-4 h-4 text-rose-500" />,
      color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    },
    {
      id: 'all-day',
      label: t.mealPeriods.allDay,
      hours: '07:00 – 23:00',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
  ];

  const currentOption = periodOptions.find((p) => p.id === selectedMode) || periodOptions[0];

  return (
    <div className="w-full space-y-2.5">
      {/* Meal Period Segmented Filter Bar */}
      <div className="bg-white/80 dark:bg-[#0E172A]/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
          {periodOptions.map((opt) => {
            const isSelected = selectedMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectMode(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                {opt.icon}
                <span>{opt.id === 'auto' ? t.mealPeriods.auto : opt.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 dark:bg-slate-950 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notice Banner if viewing another menu or custom selection */}
      <AnimatePresence>
        {isBrowsingOther && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-2 text-xs font-bold text-amber-900 dark:text-amber-200"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                {t.mealPeriods.viewingOtherMenu
                  .replace('{period}', currentOption.label)
                  .replace('{hours}', currentOption.hours)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectMode('auto')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] hover:bg-amber-300 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.mealPeriods.switchToCurrent}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
