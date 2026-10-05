import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  X,
  CreditCard,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { TableReservation, TablePreference, ReservationStatus, Table } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function ReservationsPage() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'tomorrow' | 'confirmed' | 'no-show'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Reservation Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState('19:00');
  const [newGuests, setNewGuests] = useState(4);
  const [newPref, setNewPref] = useState<TablePreference>('outdoor-harbor');
  const [newSpecial, setNewSpecial] = useState('');

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe<TableReservation>('reservations', (data) => {
      setReservations(data);
    });
    return () => unsub();
  }, []);

  const loadData = async () => {
    const [resList, tblList] = await Promise.all([
      storage.getAll<TableReservation>('reservations'),
      storage.getAll<Table>('tables'),
    ]);
    setReservations(resList);
    setTables(tblList);
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      toast.error(t.common.fillRequiredFields);
      return;
    }

    const code = 'CV-' + Math.floor(1000 + Math.random() * 9000);
    const depositPerPerson = 50;
    const totalDeposit = newGuests * depositPerPerson;

    const newRes: TableReservation = {
      id: 'res-' + Date.now().toString(36),
      reservationCode: code,
      guestName: newName.trim(),
      guestPhone: newPhone.trim(),
      guestEmail: newEmail.trim() || `${newPhone.replace(/\s+/g, '')}@cafevitus.dk`,
      date: newDate,
      time: newTime,
      guestsCount: newGuests,
      tablePreference: newPref,
      specialRequests: newSpecial.trim() || undefined,
      depositPerPerson,
      totalDeposit,
      depositPaid: true,
      status: 'confirmed',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.add<TableReservation>('reservations', newRes);
    await loadData();
    setIsNewModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewSpecial('');
    toast.success(t.reservations.reservationSuccess, {
      description: `${t.reservations.reservationCode}: ${code}`,
    });
  };

  const updateStatus = async (id: string, newStatus: ReservationStatus) => {
    await storage.update('reservations', id, {
      status: newStatus,
      updatedAt: Date.now(),
    });
    await loadData();
    if (newStatus === 'no-show') {
      toast.warning(t.reservations.statusNoShow, {
        description: language === 'da' ? 'Depositum tilbageholdt grundet udeblivelse.' : 'Deposit retained due to guest no-show.',
      });
    } else if (newStatus === 'seated') {
      toast.success(t.reservations.statusSeated, {
        description: language === 'da' ? 'Gæsterne er ankommet og sat til bords.' : 'Guests seated at the table.',
      });
    } else {
      toast.success(t.common.success);
    }
  };

  const assignTable = async (res: TableReservation, tableNum: string) => {
    await storage.update('reservations', res.id, {
      assignedTableNumber: tableNum,
      status: 'seated',
      updatedAt: Date.now(),
    });
    // Update physical table to occupied
    const matchedTable = tables.find((t) => t.number === tableNum);
    if (matchedTable) {
      await storage.update('tables', matchedTable.id, { status: 'occupied' });
    }
    await loadData();
    toast.success(`${t.reservations.assignTable}: ${t.table.tableNumber} ${tableNum}`);
  };

  // Filter reservations
  const filtered = reservations.filter((res) => {
    // Tab filter
    if (filterTab === 'today' && res.date !== todayStr) return false;
    if (filterTab === 'tomorrow' && res.date !== tomorrowStr) return false;
    if (filterTab === 'confirmed' && res.status !== 'confirmed') return false;
    if (filterTab === 'no-show' && res.status !== 'no-show') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = res.guestName.toLowerCase().includes(q);
      const matchPhone = res.guestPhone.toLowerCase().includes(q);
      const matchCode = res.reservationCode.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCode) return false;
    }

    return true;
  });

  // Calculate Metrics
  const todayReservations = reservations.filter((r) => r.date === todayStr);
  const totalGuestsToday = todayReservations.reduce((sum, r) => sum + r.guestsCount, 0);
  const totalDepositHeld = reservations
    .filter((r) => r.depositPaid)
    .reduce((sum, r) => sum + r.totalDeposit, 0);
  const noShowCount = reservations.filter((r) => r.status === 'no-show').length;

  return (
    <div className="space-y-6">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-slate-900 dark:text-white">
            {t.reservations.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'da'
              ? 'Administrer bordbestillinger, borde og 50 DKK no-show depositummer'
              : 'Manage table bookings, seating & 50 DKK no-show guarantee deposits'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'da' ? 'Opret Ny Reservation' : 'New Reservation'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              {t.reservations.filterToday}
            </span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {todayReservations.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
            {totalGuestsToday} {t.reservations.guests}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              {t.reservations.totalDepositsHeld}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalDepositHeld)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
            {t.reservations.noShowProtection} (50 DKK/p)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              {t.reservations.statusConfirmed}
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {reservations.filter((r) => r.status === 'confirmed').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
            {language === 'da' ? 'Venter på ankomst' : 'Awaiting arrival'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              {t.reservations.statusNoShow}
            </span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {noShowCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
            {language === 'da' ? 'Depositum beholdt' : 'Deposit retained'}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E172A] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'today' as const, label: t.reservations.filterToday },
            { id: 'tomorrow' as const, label: t.reservations.filterTomorrow },
            { id: 'all' as const, label: t.reservations.filterAll },
            { id: 'confirmed' as const, label: t.reservations.statusConfirmed },
            { id: 'no-show' as const, label: t.reservations.statusNoShow },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap",
                filterTab === tab.id
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'da' ? 'Søg gæst, tlf eller kode...' : 'Search guest, phone or code...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0E172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400">
              {t.common.noResults}
            </h3>
          </div>
        ) : (
          filtered.map((res) => (
            <div
              key={res.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-400/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: Code, Guest info, Date/time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/40">
                    #{res.reservationCode}
                  </span>

                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider",
                      res.status === 'confirmed' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
                      res.status === 'seated' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                      res.status === 'no-show' && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                      res.status === 'cancelled' && "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
                      res.status === 'completed' && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    )}
                  >
                    {res.status === 'confirmed' ? t.reservations.statusConfirmed :
                     res.status === 'seated' ? t.reservations.statusSeated :
                     res.status === 'no-show' ? t.reservations.statusNoShow :
                     res.status === 'cancelled' ? t.reservations.statusCancelled : t.reservations.statusCompleted}
                  </span>

                  {res.assignedTableNumber && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-black">
                      {t.table.tableNumber} {res.assignedTableNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {res.guestName}
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    • {res.guestsCount} {t.reservations.guests}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>{res.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>kl. {res.time}</span>
                  </div>
                  <a
                    href={`tel:${res.guestPhone}`}
                    className="flex items-center gap-1.5 hover:text-amber-500 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{res.guestPhone}</span>
                  </a>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {res.tablePreference === 'outdoor-harbor' ? t.reservations.outdoorHarbor :
                       res.tablePreference === 'indoor' ? t.reservations.indoor :
                       res.tablePreference === 'bar' ? t.reservations.bar : t.reservations.anyPreference}
                    </span>
                  </div>
                </div>

                {res.specialRequests && (
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 italic bg-amber-500/5 p-2 rounded-xl border border-amber-500/15">
                    "{res.specialRequests}"
                  </p>
                )}
              </div>

              {/* Right Column: Deposit & Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-left md:text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{formatCurrency(res.totalDeposit)} ({res.depositPerPerson} kr/p)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {language === 'da' ? 'Depositum modregnes ved ankomst' : 'Deposit credited to final bill'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Table Assignment Dropdown */}
                  <select
                    value={res.assignedTableNumber || ''}
                    onChange={(e) => assignTable(res, e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black cursor-pointer text-slate-800 dark:text-slate-200"
                  >
                    <option value="" disabled>
                      {t.reservations.assignTable}
                    </option>
                    {tables.map((tItem) => (
                      <option key={tItem.id} value={tItem.number}>
                        {t.table.tableNumber} {tItem.number} ({tItem.capacity}p)
                      </option>
                    ))}
                  </select>

                  {res.status === 'confirmed' && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateStatus(res.id, 'seated')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition-colors cursor-pointer shadow-2xs"
                        title={t.reservations.markSeated}
                      >
                        {t.reservations.markSeated}
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStatus(res.id, 'no-show')}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-black text-xs transition-colors cursor-pointer"
                        title={t.reservations.markNoShow}
                      >
                        {t.reservations.markNoShow}
                      </button>
                    </>
                  )}

                  {res.status !== 'cancelled' && res.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(res.id, 'cancelled')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t.common.cancel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Reservation Modal */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0B132B] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-serif-luxury">
                  {language === 'da' ? 'Opret Ny Bordreservation' : 'Create Table Reservation'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.reservations.name} *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.reservations.phone} *</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.reservations.selectDate}</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.reservations.selectTime}</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.reservations.guestsCount}</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newGuests}
                      onChange={(e) => setNewGuests(parseInt(e.target.value) || 2)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.reservations.tablePreference}</label>
                  <select
                    value={newPref}
                    onChange={(e) => setNewPref(e.target.value as TablePreference)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <option value="outdoor-harbor">{t.reservations.outdoorHarbor}</option>
                    <option value="indoor">{t.reservations.indoor}</option>
                    <option value="bar">{t.reservations.bar}</option>
                    <option value="any">{t.reservations.anyPreference}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.reservations.specialRequests}</label>
                  <input
                    type="text"
                    value={newSpecial}
                    onChange={(e) => setNewSpecial(e.target.value)}
                    placeholder="Allergier, barnestol..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
                  <span>{t.reservations.depositNotice} ({newGuests} × 50 DKK):</span>
                  <span className="text-amber-500 font-extrabold">{formatCurrency(newGuests * 50)}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                  >
                    {t.common.confirm}
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
