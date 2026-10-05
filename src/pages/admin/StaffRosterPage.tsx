import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Briefcase,
  Phone,
  Mail,
  Shield,
  KeyRound,
  X,
  Check,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../lib/storage';
import { StaffMember, Shift, StaffRole, DayOfWeek } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { toast } from 'sonner';

export default function StaffRosterPage() {
  const { t, language } = useLanguage();
  const { isDark } = useTheme();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeTab, setActiveTab] = useState<'roster' | 'employees'>('roster');

  // New Employee Modal
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState<StaffRole>('waiter');
  const [empPin, setEmpPin] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empWage, setEmpWage] = useState(165);
  const [empWorkingDays, setEmpWorkingDays] = useState<DayOfWeek[]>(['thu', 'fri', 'sat', 'sun']);

  // New Shift Modal
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftStaffId, setShiftStaffId] = useState('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftStartTime, setShiftStartTime] = useState('11:00');
  const [shiftEndTime, setShiftEndTime] = useState('19:00');
  const [shiftBreak, setShiftBreak] = useState(30);

  useEffect(() => {
    loadData();
    const unsubStaff = storage.subscribe<StaffMember>('staff', (data) => setStaffList(data));
    const unsubShifts = storage.subscribe<Shift>('shifts', (data) => setShifts(data));
    return () => {
      unsubStaff();
      unsubShifts();
    };
  }, []);

  const loadData = async () => {
    const [staffData, shiftData] = await Promise.all([
      storage.getAll<StaffMember>('staff'),
      storage.getAll<Shift>('shifts'),
    ]);
    setStaffList(staffData);
    setShifts(shiftData);
  };

  const daysList: { id: DayOfWeek; label: string }[] = [
    { id: 'mon', label: t.staff.days.mon },
    { id: 'tue', label: t.staff.days.tue },
    { id: 'wed', label: t.staff.days.wed },
    { id: 'thu', label: t.staff.days.thu },
    { id: 'fri', label: t.staff.days.fri },
    { id: 'sat', label: t.staff.days.sat },
    { id: 'sun', label: t.staff.days.sun },
  ];

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empPin.trim()) {
      toast.error(t.common.fillRequiredFields);
      return;
    }

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEmp: StaffMember = {
      id: 'stf-' + Date.now().toString(36),
      name: empName.trim(),
      role: empRole,
      pin: empPin.trim(),
      phone: empPhone.trim(),
      email: empEmail.trim() || `${empName.toLowerCase().replace(/\s+/g, '')}@cafevitus.dk`,
      hourlyWage: empWage,
      active: true,
      workingDays: empWorkingDays,
      color: randomColor,
      createdAt: Date.now(),
    };

    await storage.add<StaffMember>('staff', newEmp);
    await loadData();
    setIsEmployeeModalOpen(false);
    setEmpName('');
    setEmpPin('');
    setEmpPhone('');
    setEmpEmail('');
    toast.success(t.common.success);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm(language === 'da' ? 'Vil du fjerne denne medarbejder?' : 'Delete this employee?')) {
      await storage.remove('staff', id);
      await loadData();
      toast.success(t.common.success);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const staff = staffList.find((s) => s.id === shiftStaffId);
    if (!staff) {
      toast.error(language === 'da' ? 'Vælg venligst en medarbejder' : 'Please select an employee');
      return;
    }

    // Calculate planned hours
    const [startH, startM] = shiftStartTime.split(':').map(Number);
    const [endH, endM] = shiftEndTime.split(':').map(Number);
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // overnight
    totalMinutes -= shiftBreak;
    const plannedHours = Math.max(0, Math.round((totalMinutes / 60) * 100) / 100);
    const estimatedWage = Math.round(plannedHours * staff.hourlyWage);

    const newShift: Shift = {
      id: 'sh-' + Date.now().toString(36),
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      date: shiftDate,
      startTime: shiftStartTime,
      endTime: shiftEndTime,
      breakMinutes: shiftBreak,
      plannedHours,
      estimatedWage,
      status: 'scheduled',
    };

    await storage.add<Shift>('shifts', newShift);
    await loadData();
    setIsShiftModalOpen(false);
    toast.success(t.common.success);
  };

  const handleDeleteShift = async (id: string) => {
    await storage.remove('shifts', id);
    await loadData();
    toast.success(t.common.success);
  };

  const toggleWorkingDay = (day: DayOfWeek) => {
    if (empWorkingDays.includes(day)) {
      setEmpWorkingDays(empWorkingDays.filter((d) => d !== day));
    } else {
      setEmpWorkingDays([...empWorkingDays, day]);
    }
  };

  // Metrics
  const totalWeeklyHours = shifts.reduce((sum, s) => sum + s.plannedHours, 0);
  const totalWeeklyWage = shifts.reduce((sum, s) => sum + s.estimatedWage, 0);
  const averageHourlyWage = staffList.length
    ? Math.round(staffList.reduce((sum, s) => sum + s.hourlyWage, 0) / staffList.length)
    : 165;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-slate-900 dark:text-white">
              {t.staff.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Enos Vagtplan
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.staff.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.staff.addShift}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEmployeeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-black text-xs transition-all shadow-md cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>{t.staff.addEmployee}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-extrabold uppercase">
            <span>{t.staff.employees}</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {staffList.filter((s) => s.active).length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {staffList.length} {language === 'da' ? 'aktive i personalegruppen' : 'registered staff'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-extrabold uppercase">
            <span>{t.staff.totalHours}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalWeeklyHours}t
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {shifts.length} {language === 'da' ? 'planlagte vagter' : 'scheduled shifts'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-extrabold uppercase">
            <span>{t.staff.totalEstimatedCost}</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalWeeklyWage)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'da' ? 'Estimeret lønudgift' : 'Estimated payroll cost'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-extrabold uppercase">
            <span>Gns. Timeløn</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {averageHourlyWage} kr/t
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === 'da' ? 'Dansk restaurantoversigt' : 'Standard Danish rates'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
            activeTab === 'roster'
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.staff.schedule}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('employees')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
            activeTab === 'employees'
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          <span>{t.staff.employees} ({staffList.length})</span>
        </button>
      </div>

      {/* Roster View */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-400/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-900 dark:text-amber-300 flex items-center justify-center font-black text-xs">
                      {shift.staffName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {shift.staffName}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400">
                        {t.staff.roles[shift.role as StaffRole] || shift.role}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteShift(shift.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{shift.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{shift.startTime} – {shift.endTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>{shift.plannedHours}t ({shift.breakMinutes} min pause)</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      ~{formatCurrency(shift.estimatedWage)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employees Directory View */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((emp) => (
            <div
              key={emp.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0E172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-md"
                    style={{ backgroundColor: emp.color || '#3B82F6' }}
                  >
                    {emp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {emp.name}
                    </h3>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {t.staff.roles[emp.role] || emp.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEmployee(emp.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t.staff.hourlyWage}:</span>
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {emp.hourlyWage} DKK / time
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Stempelur PIN:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {emp.pin}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.staff.phone}:</span>
                  </span>
                  <span>{emp.phone}</span>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block mb-1">{t.staff.workingDays}:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {daysList.map((d) => (
                      <span
                        key={d.id}
                        className={cn(
                          "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase",
                          emp.workingDays.includes(d.id)
                            ? "bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/40"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-40"
                        )}
                      >
                        {d.label.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Employee */}
      <AnimatePresence>
        {isEmployeeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmployeeModalOpen(false)}
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
                  {t.staff.addEmployee}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.name} *</label>
                    <input
                      type="text"
                      required
                      placeholder="F.eks. Mikkel Hansen"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Rolle</label>
                    <select
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value as StaffRole)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer"
                    >
                      <option value="manager">{t.staff.roles.manager}</option>
                      <option value="chef">{t.staff.roles.chef}</option>
                      <option value="waiter">{t.staff.roles.waiter}</option>
                      <option value="bartender">{t.staff.roles.bartender}</option>
                      <option value="dishwasher">{t.staff.roles.dishwasher}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.hourlyWage} (DKK/t) *</label>
                    <input
                      type="number"
                      required
                      min={100}
                      max={500}
                      value={empWage}
                      onChange={(e) => setEmpWage(parseFloat(e.target.value) || 165)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.clockInPin} *</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      placeholder="1234"
                      value={empPin}
                      onChange={(e) => setEmpPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold tracking-widest text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.phone}</label>
                    <input
                      type="tel"
                      placeholder="+45 12 34 56 78"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.email}</label>
                    <input
                      type="email"
                      placeholder="navn@cafevitus.dk"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">{t.staff.workingDays}</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {daysList.map((d) => {
                      const isSelected = empWorkingDays.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleWorkingDay(d.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border",
                            isSelected
                              ? "bg-amber-400 text-slate-950 border-amber-400 shadow-xs"
                              : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                          )}
                        >
                          {d.label.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEmployeeModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                  >
                    {t.staff.saveEmployee}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Shift */}
      <AnimatePresence>
        {isShiftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShiftModalOpen(false)}
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
                  {t.staff.addShift}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateShift} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.employees} *</label>
                  <select
                    required
                    value={shiftStaffId}
                    onChange={(e) => setShiftStaffId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <option value="" disabled>
                      {language === 'da' ? 'Vælg medarbejder...' : 'Select employee...'}
                    </option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({t.staff.roles[s.role] || s.role} • {s.hourlyWage} kr/t)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Dato *</label>
                  <input
                    type="date"
                    required
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.startTime}</label>
                    <input
                      type="time"
                      value={shiftStartTime}
                      onChange={(e) => setShiftStartTime(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.endTime}</label>
                    <input
                      type="time"
                      value={shiftEndTime}
                      onChange={(e) => setShiftEndTime(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{t.staff.breakMinutes}</label>
                    <input
                      type="number"
                      min={0}
                      step={15}
                      value={shiftBreak}
                      onChange={(e) => setShiftBreak(parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsShiftModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                  >
                    {t.staff.addShift}
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
