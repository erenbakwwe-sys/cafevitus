import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  X,
  Phone,
  Mail,
  User,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { TableReservation, TablePreference } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

interface TableReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TableReservationModal({ isOpen, onClose }: TableReservationModalProps) {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('18:30');
  const [guestsCount, setGuestsCount] = useState(2);
  const [tablePreference, setTablePreference] = useState<TablePreference>('outdoor-harbor');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<TableReservation | null>(null);

  const depositPerPerson = 50; // 50 DKK
  const totalDeposit = guestsCount * depositPerPerson;

  const timeSlots = [
    '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
    '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ];

  const preferences: { id: TablePreference; label: string; desc: string }[] = [
    {
      id: 'outdoor-harbor',
      label: t.reservations.outdoorHarbor,
      desc: language === 'da' ? 'Panoramaview over Øresund & fiskerbåde' : 'Panoramic view of Øresund & fishing boats',
    },
    {
      id: 'indoor',
      label: t.reservations.indoor,
      desc: language === 'da' ? 'Nordisk hygge & dæmpet belysning' : 'Nordic coziness & warm atmosphere',
    },
    {
      id: 'bar',
      label: t.reservations.bar,
      desc: language === 'da' ? 'Uformel stemning tæt på barista' : 'Informal vibe near the espresso bar',
    },
    {
      id: 'any',
      label: t.reservations.anyPreference,
      desc: language === 'da' ? 'Først ledige bord' : 'First available table',
    },
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error(t.common.fillRequiredFields);
      return;
    }

    setIsSubmitting(true);
    const code = 'CV-' + Math.floor(1000 + Math.random() * 9000);

    const newReservation: TableReservation = {
      id: 'res-' + Date.now().toString(36),
      reservationCode: code,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || `${guestPhone.replace(/\s+/g, '')}@guest.cafevitus.dk`,
      date,
      time,
      guestsCount,
      tablePreference,
      specialRequests: specialRequests.trim() || undefined,
      depositPerPerson,
      totalDeposit,
      depositPaid: true,
      status: 'confirmed',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await storage.add<TableReservation>('reservations', newReservation);
      setConfirmedReservation(newReservation);
      toast.success(t.reservations.reservationSuccess, {
        description: `${t.reservations.reservationCode}: ${code}`,
      });
    } catch (err) {
      toast.error(t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedReservation(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl my-6 bg-white dark:bg-[#0B132B] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 p-5 sm:p-6 text-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-slate-950 font-black shadow-inner">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold font-serif-luxury tracking-tight leading-tight">
                  {t.reservations.title}
                </h2>
                <p className="text-xs font-semibold text-amber-950/80">
                  {t.reservations.subtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-black/10 transition-colors cursor-pointer text-slate-950"
              aria-label={t.common.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
            {confirmedReservation ? (
              /* Confirmation Screen */
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {t.reservations.statusConfirmed}
                  </span>
                  <h3 className="text-2xl font-black mt-2 font-serif-luxury text-slate-900 dark:text-white">
                    {t.reservations.reservationSuccess}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t.reservations.calendarPrompt}
                  </p>
                </div>

                {/* Booking Ticket Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 font-sans">
                    <span className="text-slate-500">{t.reservations.reservationCode}</span>
                    <span className="text-base font-extrabold text-amber-500 font-mono tracking-wider">
                      #{confirmedReservation.reservationCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-sans">
                    <div>
                      <span className="text-[11px] text-slate-400 block">{t.reservations.name}</span>
                      <span className="font-bold">{confirmedReservation.guestName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">{t.reservations.guestsCount}</span>
                      <span className="font-bold">{confirmedReservation.guestsCount} {t.reservations.guests}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">{t.reservations.selectDate} & {t.reservations.selectTime}</span>
                      <span className="font-bold">{confirmedReservation.date} • {confirmedReservation.time}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">{t.reservations.totalDeposit}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(confirmedReservation.totalDeposit)} ({t.reservations.statusConfirmed})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-sans flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t.reservations.depositExplanation}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm hover:bg-amber-300 transition-colors cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  {t.common.close}
                </button>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleBook} className="space-y-5">
                {/* Step 1: Party size & Date & Time */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    {t.reservations.guestsCount}
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestsCount(num)}
                        className={`w-11 h-11 shrink-0 rounded-2xl font-extrabold text-sm transition-all cursor-pointer border flex items-center justify-center ${
                          guestsCount === num
                            ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-black scale-105'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      {t.reservations.selectDate}
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        min={todayStr}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      {t.reservations.selectTime}
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 2: Seating Preference */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    {t.reservations.tablePreference}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {preferences.map((pref) => (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => setTablePreference(pref.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          tablePreference === pref.id
                            ? 'bg-amber-500/10 border-amber-400 dark:border-amber-400 text-slate-950 dark:text-white'
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-extrabold text-xs flex items-center justify-between">
                          <span>{pref.label}</span>
                          {tablePreference === pref.id && (
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {pref.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Contact Details */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      {t.reservations.name} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="F.eks. Anders Møller"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        {t.reservations.phone} *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          placeholder="+45 12 34 56 78"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        {t.reservations.email}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="navn@eksempel.dk"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      {t.reservations.specialRequests}
                    </label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder={language === 'da' ? 'Allergier, barnestol, fødselsdagsbord...' : 'Allergies, high chair, birthday decoration...'}
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                  </div>
                </div>

                {/* Step 4: No-Show Guarantee & Deposit Notice */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>{t.reservations.depositNotice}</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
                    {t.reservations.depositExplanation}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-xs font-black text-slate-950 dark:text-white">
                    <span>{t.reservations.totalDeposit} ({guestsCount} × {depositPerPerson} DKK):</span>
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                      {formatCurrency(totalDeposit)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? t.common.loading
                      : t.reservations.confirmAndPayDeposit.replace('{amount}', String(totalDeposit))}
                  </span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
