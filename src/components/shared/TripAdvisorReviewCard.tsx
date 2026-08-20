import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ExternalLink, MessageSquareHeart, Heart } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const TRIPADVISOR_URL = 'https://www.tripadvisor.com.tr/UserReviewEdit-g1572426-d10699337-Cafe_Vitus-Snekkersten_Helsingoer_Municipality_Copenhagen_Region_Zealand.html';

export const TripAdvisorReviewCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language } = useLanguage();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleOpenReview = (rating?: number) => {
    window.open(TRIPADVISOR_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00AA6C]/10 via-emerald-500/5 to-amber-500/10 dark:from-[#00AA6C]/20 dark:via-slate-900 dark:to-amber-500/10 border-2 border-[#00AA6C]/30 p-6 sm:p-7 shadow-lg"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          {/* TripAdvisor Owl Mascot / Badge */}
          <div className="w-12 h-12 rounded-2xl bg-[#00AA6C] text-white flex items-center justify-center font-black shadow-md shrink-0">
            <span className="text-2xl">🦉</span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00AA6C]/20 text-[#00AA6C] dark:text-[#34E0A1] text-[10px] font-black uppercase tracking-wider mb-1">
              <span>TripAdvisor Anmeldelse</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {language === 'da' ? 'Kunne du lide oplevelsen hos Cafe Vitus?' : 'Did you enjoy your time at Cafe Vitus?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-md">
              {language === 'da'
                ? 'Vi vil sætte enorm stor pris på din anmeldelse. Hjælp andre gæster med at opdage kystens charme i Snekkersten!'
                : 'We would love to hear your feedback! Help other travelers discover our cozy harbor cafe.'}
            </p>
          </div>
        </div>

        {/* 5-Star Interactive Rating & CTA */}
        <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                onClick={() => handleOpenReview(star)}
                className="p-1 hover:scale-125 transition-transform cursor-pointer"
                title={`${star} stjerner`}
              >
                <Star
                  className={`w-6 h-6 ${(hoveredStar !== null ? star <= hoveredStar : true) ? 'fill-[#00AA6C] text-[#00AA6C]' : 'text-slate-300'}`}
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleOpenReview()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#00AA6C] hover:bg-[#008f5a] text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
          >
            <span>{language === 'da' ? 'Skriv anmeldelse på TripAdvisor' : 'Review us on TripAdvisor'}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
