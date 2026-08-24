import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, MessageSquareHeart, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const TRIPADVISOR_URL = 'https://www.tripadvisor.com.tr/UserReviewEdit-g1572426-d10699337-Cafe_Vitus-Snekkersten_Helsingoer_Municipality_Copenhagen_Region_Zealand.html';

export const TripAdvisorReviewCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, t } = useLanguage();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleOpenReview = (rating?: number) => {
    window.open(TRIPADVISOR_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#00AA6C]/15 via-emerald-500/5 to-amber-500/15 dark:from-[#00AA6C]/25 dark:via-slate-900/90 dark:to-amber-500/15 border-2 border-[#00AA6C]/35 p-6 sm:p-8 shadow-xl backdrop-blur-xl"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00AA6C]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {/* TripAdvisor Owl Mascot / Badge */}
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 rounded-2xl bg-[#00AA6C] text-white flex items-center justify-center font-black shadow-lg shadow-[#00AA6C]/30 shrink-0 border border-white/20"
          >
            <span className="text-3xl">🦉</span>
          </motion.div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00AA6C]/20 text-[#00AA6C] dark:text-[#34E0A1] text-[10px] font-black uppercase tracking-wider mb-1.5 border border-[#00AA6C]/30">
              <Sparkles className="w-3 h-3" />
              <span>{t.tripadvisor.tag}</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight font-serif-luxury">
              {t.tripadvisor.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md font-medium leading-relaxed">
              {t.tripadvisor.desc}
            </p>
          </div>
        </div>

        {/* 5-Star Interactive Rating & CTA */}
        <div className="flex flex-col items-start sm:items-end gap-3.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => handleOpenReview(star)}
                className="p-1 cursor-pointer"
                title={`${star} ${t.tripadvisor.stars}`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    (hoveredStar !== null ? star <= hoveredStar : true)
                      ? 'fill-[#00AA6C] text-[#00AA6C] drop-shadow-sm'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => handleOpenReview()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#00AA6C] hover:bg-[#008f5a] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#00AA6C]/25 transition-all cursor-pointer"
          >
            <span>{t.tripadvisor.btn}</span>
            <ExternalLink className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

