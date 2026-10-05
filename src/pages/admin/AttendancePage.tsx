import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  KeyRound,
  CheckCircle2,
  LogOut,
  LogIn,
  Coffee,
  Users,
  DollarSign,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { AttendanceLog, StaffMember, StaffRole } from '../../types';
import { formatCurrency, formatTime, formatDate, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function AttendancePage() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [enteredPin, setEnteredPin] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  useEffect(() => {
    loadData();
    const unsubStaff = storage.subscribe<StaffMember>('staff', (data) => setStaffList(data));
    const unsubLogs = storage.subscribe<AttendanceLog>('attendance', (data) => setLogs(data));
    return () => {
      unsubStaff();
      unsubLogs();
    };
  }, []);

  const loadData = async () => {
    const [staffData, logData] = await Promise.all([
      storage.getAll<StaffMember>('staff'),
      storage.getAll<AttendanceLog>('attendance'),
    ]);
    setStaffList(staffData);
    setLogs(logData.sort((a, b) => b.checkInTime - a.checkInTime));
  };

  const handleKeypadPress = (digit: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin((prev) => prev + digit);
    }
  };

  const handleClearPin = () => {
    setEnteredPin('');
  };

  const handleClockIn = async () => {
    let staff: StaffMember | undefined;
    if (enteredPin) {
      staff = staffList.find((s) => s.pin === enteredPin);
    } else if (selectedStaffId) {
      staff = staffList.find((s) => s.id === selectedStaffId);
    }

    if (!staff) {
      toast.error(t.attendance.invalidPin);
      return;
    }

    // Check if already active
    const activeLog = logs.find((l) => l.staffId === staff!.id && l.status === 'active');
    if (activeLog) {
      toast.warning(t.attendance.alreadyClockedIn);
      setEnteredPin('');
      return;
    }

    const newLog: AttendanceLog = {
      id: 'att-' + Date.now().toString(36),
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      checkInTime: Date.now(),
      breakMinutes: 0,
      status: 'active',
    };

    await storage.add<AttendanceLog>('attendance', newLog);
    await loadData();
    toast.success(t.attendance.clockedInSuccess.replace('{name}', staff.name));
    setEnteredPin('');
  };

  const handleClockOut = async () => {
    let staff: StaffMember | undefined;
    if (enteredPin) {
      staff = staffList.find((s) => s.pin === enteredPin);
    } else if (selectedStaffId) {
      staff = staffList.find((s) => s.id === selectedStaffId);
    }

    if (!staff) {
      toast.error(t.attendance.invalidPin);
      return;
    }

    const activeLog = logs.find((l) => l.staffId === staff!.id && l.status === 'active');
    if (!activeLog) {
      toast.warning(t.attendance.notClockedIn);
      setEnteredPin('');
      return;
    }

    const now = Date.now();
    const durationMs = now - activeLog.checkInTime;
    let workedMinutes = Math.floor(durationMs / 60000) - activeLog.breakMinutes;
    if (workedMinutes < 0) workedMinutes = 0;
    const totalHours = Math.round((workedMinutes / 60) * 100) / 100;
    const earnedWage = Math.round(totalHours * staff.hourlyWage);

    await storage.update('attendance', activeLog.id, {
      checkOutTime: now,
      totalHours,
      earnedWage,
      status: 'completed',
    });

    await loadData();
    toast.success(
      t.attendance.clockedOutSuccess
        .replace('{name}', staff.name)
        .replace('{hours}', String(totalHours))
        .replace('{wage}', String(earnedWage))
    );
    setEnteredPin('');
  };

  const activeStaffLogs = logs.filter((l) => l.status === 'active');

  const getDurationText = (checkInTime: number) => {
    const diffMin = Math.floor((Date.now() - checkInTime) / 60000);
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return `${h}t ${m}m`;
  };

  const getRunningWage = (checkInTime: number, staffId: string) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return 0;
    const diffHours = (Date.now() - checkInTime) / 3600000;
    return Math.round(diffHours * staff.hourlyWage);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-slate-900 dark:text-white">
            {t.attendance.title}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Enos Stempelur
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.attendance.subtitle}
        </p>
      </div>

      {/* Main Grid: Interactive Terminal on Left, Who's Working Now on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clock-in / Clock-out Terminal (Left 5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white font-serif-luxury">
                Personale Terminal
              </h2>
            </div>
            <span className="text-[11px] font-extrabold text-slate-400">
              PIN Godkendelse
            </span>
          </div>

          {/* Quick Staff Selector (Optional fallback) */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Hurtigvalg Medarbejder
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                const s = staffList.find((x) => x.id === e.target.value);
                if (s) setEnteredPin(s.pin);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer"
            >
              <option value="">{language === 'da' ? '-- Vælg dit navn fra listen --' : '-- Choose your name --'}</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({t.staff.roles[s.role] || s.role})
                </option>
              ))}
            </select>
          </div>

          {/* PIN Input Display */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[11px] font-bold text-slate-400 mb-2">
              {t.attendance.enterPin}
            </p>
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-10 h-10 rounded-xl border flex items-center justify-center text-lg font-mono font-black transition-all",
                    enteredPin.length > idx
                      ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {enteredPin.length > idx ? '●' : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Numeric Touch Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') handleClearPin();
                  else if (key === '⌫') setEnteredPin((prev) => prev.slice(0, -1));
                  else handleKeypadPress(key);
                }}
                className={cn(
                  "h-12 rounded-xl text-base font-extrabold font-mono transition-all cursor-pointer border flex items-center justify-center",
                  key === 'C' || key === '⌫'
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                    : "bg-white dark:bg-[#0B132B] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-50 active:scale-95 shadow-2xs"
                )}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Clock In / Clock Out Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleClockIn}
              className="py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.attendance.clockIn}</span>
            </button>

            <button
              type="button"
              onClick={handleClockOut}
              className="py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.attendance.clockOut}</span>
            </button>
          </div>
        </div>

        {/* Live "Who is Working Right Now" (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-beacon" />
                <h2 className="text-base font-black text-slate-900 dark:text-white font-serif-luxury">
                  {t.attendance.whoIsWorkingNow}
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {activeStaffLogs.length} {t.attendance.totalWorkingNow}
              </span>
            </div>

            {activeStaffLogs.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">
                  {t.attendance.noOneWorking}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeStaffLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {log.staffName}
                        </h3>
                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          {t.staff.roles[log.role as StaffRole] || log.role}
                        </p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{t.attendance.activeSince}:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatTime(log.checkInTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{t.attendance.duration}:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {getDurationText(log.checkInTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{t.attendance.earnedWage}:</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          ~{formatCurrency(getRunningWage(log.checkInTime, log.staffId))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance History Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white font-serif-luxury">
              {t.attendance.historyTitle}
            </h2>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="pb-2.5">Medarbejder</th>
                    <th className="pb-2.5">Ind</th>
                    <th className="pb-2.5">Ud</th>
                    <th className="pb-2.5">Timer</th>
                    <th className="pb-2.5 text-right">Løn</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.slice(0, 10).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5">
                        <span className="font-extrabold text-slate-900 dark:text-white block">
                          {item.staffName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(item.checkInTime)}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300">
                        {formatTime(item.checkInTime)}
                      </td>
                      <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300">
                        {item.checkOutTime ? formatTime(item.checkOutTime) : '—'}
                      </td>
                      <td className="py-2.5 font-bold">
                        {item.totalHours ? `${item.totalHours}t` : getDurationText(item.checkInTime)}
                      </td>
                      <td className="py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {item.earnedWage ? formatCurrency(item.earnedWage) : `~${formatCurrency(getRunningWage(item.checkInTime, item.staffId))}`}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                            item.status === 'active'
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          )}
                        >
                          {item.status === 'active' ? 'Aktiv' : 'Afsluttet'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
