import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Utensils, 
  Pill, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Droplets, 
  Download, 
  Sun, 
  Moon, 
  Sunset, 
  Sunrise, 
  ShieldCheck, 
  Flame, 
  Heart, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DailyRoutineSchedule, RoutineScheduleItem, SupportedLanguage, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface DinacharyaRoutinePlannerProps {
  language: SupportedLanguage;
  currentUser: UserProfile | null;
  onUpdateUserRoutine?: (routine: DailyRoutineSchedule) => void;
}

export const DinacharyaRoutinePlanner: React.FC<DinacharyaRoutinePlannerProps> = ({
  language,
  currentUser,
  onUpdateUserRoutine,
}) => {
  const t = translations[language] || translations.en;

  // Form states
  const [wakeUpTime, setWakeUpTime] = useState('06:00');
  const [breakfastTime, setBreakfastTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('12:30');
  const [eveningTime, setEveningTime] = useState('17:00');
  const [dinnerTime, setDinnerTime] = useState('19:30');
  const [bedTime, setBedTime] = useState('22:00');
  const [prakriti, setPrakriti] = useState(currentUser?.prakriti || 'Pitta-Kapha');
  const [healthFocus, setHealthFocus] = useState('Digestive Fire & Acid Reflux Balance');
  
  // Custom item state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTime, setNewItemTime] = useState('10:00');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'food' | 'medicine' | 'lifestyle' | 'rejuvenation'>('medicine');
  const [newItemDosage, setNewItemDosage] = useState('');
  const [newItemAnupana, setNewItemAnupana] = useState('');

  // Hydration state
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [targetWaterGlasses] = useState(8);

  // Routine generation state
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<DailyRoutineSchedule | null>(null);

  // Initialize from user or local cache
  useEffect(() => {
    if (currentUser?.savedRoutines && currentUser.savedRoutines.length > 0) {
      setSchedule(currentUser.savedRoutines[0]);
    } else {
      const cached = localStorage.getItem('ipsakti_dinacharya_schedule');
      if (cached) {
        try {
          setSchedule(JSON.parse(cached));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [currentUser]);

  const handleGenerateRoutine = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/dinacharya/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wakeUpTime,
          breakfastTime,
          lunchTime,
          eveningTime,
          dinnerTime,
          bedTime,
          prakriti,
          healthFocus,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate routine');
      }

      const data = await res.json();
      setSchedule(data);
      localStorage.setItem('ipsakti_dinacharya_schedule', JSON.stringify(data));

      if (onUpdateUserRoutine) {
        onUpdateUserRoutine(data);
      }
    } catch (err) {
      console.error('Routine generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // When language changes or on first mount, auto-generate routine for the active language
  useEffect(() => {
    handleGenerateRoutine();
  }, [language]);

  const handleToggleCompleted = (itemId: string) => {
    if (!schedule) return;
    const updatedItems = schedule.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    const updated = { ...schedule, items: updatedItems };
    setSchedule(updated);
    localStorage.setItem('ipsakti_dinacharya_schedule', JSON.stringify(updated));
    if (onUpdateUserRoutine) {
      onUpdateUserRoutine(updated);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule || !newItemTitle.trim()) return;

    const newItem: RoutineScheduleItem = {
      id: `custom-${Date.now()}`,
      time: newItemTime,
      period: 'pratah',
      category: newItemCategory,
      title: newItemTitle,
      description: newItemCategory === 'medicine' ? `Custom Aushadhi Regimen` : `Custom Routine Meal`,
      dosage: newItemDosage || undefined,
      anupana: newItemAnupana || undefined,
      doshaImpact: 'Personalized Custom Care',
      completed: false,
    };

    const updatedItems = [...schedule.items, newItem].sort((a, b) => a.time.localeCompare(b.time));
    const updated = { ...schedule, items: updatedItems };
    setSchedule(updated);
    localStorage.setItem('ipsakti_dinacharya_schedule', JSON.stringify(updated));
    setIsAddingItem(false);
    setNewItemTitle('');
    setNewItemDosage('');
    setNewItemAnupana('');
  };

  const completedCount = schedule?.items.filter((i) => i.completed).length || 0;
  const totalCount = schedule?.items.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'food':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'medicine':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'lifestyle':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'rejuvenation':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'brahma_muhurta':
      case 'pratah':
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'madhyahna':
        return <Sun className="w-4 h-4 text-orange-500" />;
      case 'sandhya':
        return <Sunset className="w-4 h-4 text-rose-500" />;
      case 'ratri':
      default:
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A2F] via-[#162a22] to-[#0d1c16] text-white p-6 sm:p-8 shadow-xl border border-emerald-900/50">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/20 text-[#A3E635] text-xs font-bold uppercase tracking-wider mb-4 border border-[#A3E635]/30">
            <Clock className="w-3.5 h-3.5" />
            AYUSH Circadian Chronobiology
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {t.routineTitle}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {t.routineSubtitle}
          </p>
        </div>
      </div>

      {/* Configuration Form & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Time Calibration Form */}
        <div className="lg:col-span-1 bg-white dark:bg-[#151e28] rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Time Settings
            </h2>
          </div>

          <form onSubmit={handleGenerateRoutine} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.wakeUpTime}
                </label>
                <input
                  id="wake-up-time-input"
                  type="time"
                  value={wakeUpTime}
                  onChange={(e) => setWakeUpTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.breakfastTime}
                </label>
                <input
                  id="breakfast-time-input"
                  type="time"
                  value={breakfastTime}
                  onChange={(e) => setBreakfastTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.lunchTime} (Main Meal)
                </label>
                <input
                  id="lunch-time-input"
                  type="time"
                  value={lunchTime}
                  onChange={(e) => setLunchTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.eveningTime}
                </label>
                <input
                  id="evening-time-input"
                  type="time"
                  value={eveningTime}
                  onChange={(e) => setEveningTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.dinnerTime}
                </label>
                <input
                  id="dinner-time-input"
                  type="time"
                  value={dinnerTime}
                  onChange={(e) => setDinnerTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {t.bedTime}
                </label>
                <input
                  id="bed-time-input"
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t.prakritiLabel}
              </label>
              <select
                id="prakriti-select"
                value={prakriti}
                onChange={(e) => setPrakriti(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
              >
                <option value="Vata">Vata (Cold, Dry, Light, Erratic)</option>
                <option value="Pitta">Pitta (Hot, Sharp, Oily, Intense)</option>
                <option value="Kapha">Kapha (Heavy, Cool, Moist, Stable)</option>
                <option value="Vata-Pitta">Vata-Pitta (Variable Agni, Heat)</option>
                <option value="Pitta-Kapha">Pitta-Kapha (Robust, Inflammatory)</option>
                <option value="Tridoshaja">Tridoshaja (Balanced Equanimity)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                {t.healthFocusLabel}
              </label>
              <select
                id="health-focus-select"
                value={healthFocus}
                onChange={(e) => setHealthFocus(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
              >
                <option value="Digestive Fire & Acid Reflux Balance">Digestive Fire (Deepana/Pachana) & Acidity</option>
                <option value="Skin Cleansing, Detox & Blood Purification">Skin Cleansing (Raktashodhaka) & Detox</option>
                <option value="Joint Mobility & Vata Pain Management">Joint Mobility & Vata Pain Management</option>
                <option value="Stress Reduction, Deep Sleep & Ojas Building">Stress Relief, Sleep (Nidra) & Ojas</option>
                <option value="Respiratory Immunity & Kapha Clearance">Respiratory Immunity (Pranavaha Srotas)</option>
                <option value="Healthy Metabolism & Meda Dhatu Balance">Metabolism & Weight Management</option>
              </select>
            </div>

            <button
              id="generate-routine-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A2F] text-white font-bold text-xs hover:bg-[#284f40] transition-colors shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
              {loading ? t.generatingRoutine : t.generateRoutineBtn}
            </button>
          </form>
        </div>

        {/* Progress & Wellness Trackers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Daily Routine Completion Card */}
            <div className="bg-white dark:bg-[#151e28] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t.routineProgress}
                  </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
                  <div 
                    className="bg-[#1E3A2F] dark:bg-[#A3E635] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white">{completedCount}</strong> of {totalCount} items completed for your customized Dinacharya.
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Prakriti: {prakriti} • Agni: Samagni Focus</span>
              </div>
            </div>

            {/* Daily Medicated Water / Hydration Tracker */}
            <div className="bg-white dark:bg-[#151e28] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    {t.waterIntake}
                  </span>
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-400">
                    {waterGlasses} / {targetWaterGlasses} Cups
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  {schedule?.recommendedWaterIntake || 'Warm boiled water with a pinch of Jeera / Fennel to kindle digestive Agni.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Log Glass (+250ml):
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    id="decrease-water-btn"
                    onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 text-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold dark:text-white">
                    {waterGlasses}
                  </span>
                  <button
                    id="increase-water-btn"
                    onClick={() => setWaterGlasses((prev) => Math.min(16, prev + 1))}
                    className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold hover:bg-sky-200 text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Classical Guidance Box */}
          {schedule?.specialGuidance && schedule.specialGuidance.length > 0 && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
              <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                {t.specialGuidance}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {schedule.specialGuidance.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hourly Schedule Timeline */}
      <div className="bg-white dark:bg-[#151e28] rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t.allDaySchedule}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check off tasks as you complete them to maintain optimal Ayurvedic Dhatuposhana (cellular nourishment).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="add-custom-item-btn"
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.addCustomItem}
            </button>

            <button
              id="print-routine-btn"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#1E3A2F] text-white hover:bg-[#284f40] text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#A3E635]" />
              {t.exportRoutine}
            </button>
          </div>
        </div>

        {/* Custom Item Addition Modal/Card */}
        {isAddingItem && (
          <form 
            onSubmit={handleAddCustomItem} 
            className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Add Custom Food or Ayurvedic Aushadhi
              </span>
              <button 
                type="button" 
                onClick={() => setIsAddingItem(false)} 
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={newItemTime}
                  onChange={(e) => setNewItemTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                >
                  <option value="medicine">Aushadhi (Medicine)</option>
                  <option value="food">Ahara (Diet / Meal)</option>
                  <option value="lifestyle">Vihara (Lifestyle / Yoga)</option>
                  <option value="rejuvenation">Rasayana (Rejuvenation)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Title / Formulation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Triphala Churna, Warm Golden Milk, Herbal Tea"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Dosage (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 1 tsp (3g)"
                  value={newItemDosage}
                  onChange={(e) => setNewItemDosage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Anupana / Vehicle (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. With warm water, Honey, Cow Ghee"
                  value={newItemAnupana}
                  onChange={(e) => setNewItemAnupana(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 bg-[#1E3A2F] text-white rounded-lg text-xs font-bold hover:bg-[#284f40]"
                >
                  Save Item
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Schedule List */}
        <div className="space-y-3">
          {schedule?.items && schedule.items.length > 0 ? (
            schedule.items.map((item) => (
              <div
                key={item.id}
                id={`routine-item-${item.id}`}
                onClick={() => handleToggleCompleted(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.completed
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700'
                }`}
              >
                {/* Left: Time & Period Indicator */}
                <div className="flex items-center gap-3.5 shrink-0">
                  <button
                    type="button"
                    aria-label="Toggle task status"
                    className="p-1 rounded-full text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getPeriodIcon(item.period)}
                    </div>
                    <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                      {item.time}
                    </span>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                {/* Center: Title & Instructions */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold text-slate-900 dark:text-white ${item.completed ? 'line-through text-slate-500' : ''}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Right: Dosage, Anupana & Dosha */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 sm:text-right">
                  {item.dosage && (
                    <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {item.dosage}
                    </span>
                  )}
                  {item.anupana && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Vehicle: {item.anupana}
                    </span>
                  )}
                  {item.doshaImpact && (
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {item.doshaImpact}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400 animate-spin" />
              <p className="text-sm font-semibold">Generating your personalized Dinacharya...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
