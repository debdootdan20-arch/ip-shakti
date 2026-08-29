import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, RefreshCw, Stethoscope, Building, 
  IndianRupee, ShieldCheck, CheckCircle2, Calendar, 
  Clock, Utensils, Sparkles, Printer, ArrowRight, 
  AlertCircle, Check, Heart, ChevronDown, ChevronUp, Droplet,
  Globe, Download, Copy, Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, DoctorPrescription, SupportedLanguage, RoutineScheduleItem } from '../types';
import { translations } from '../i18n/translations';
import { PrescriptionPdfModal } from './PrescriptionPdfModal';
import { LANGUAGE_LABELS } from '../utils/prescriptionPdf';

interface PatientPrescriptionsViewProps {
  currentUser: UserProfile | null;
  language: SupportedLanguage;
  onApplyToDinacharya?: (items: RoutineScheduleItem[]) => void;
  onNavigateToDinacharya?: () => void;
}

export const PatientPrescriptionsView: React.FC<PatientPrescriptionsViewProps> = ({
  currentUser,
  language,
  onApplyToDinacharya,
  onNavigateToDinacharya,
}) => {
  const t = translations[language] || translations.en;

  // Sync Input States
  const [doctorNameQuery, setDoctorNameQuery] = useState('');
  const [clinicNameQuery, setClinicNameQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [syncError, setSyncError] = useState('');

  // Prescriptions List
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>([]);
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null);
  const [appliedRoutineId, setAppliedRoutineId] = useState<string | null>(null);

  // Available registered doctors for quick 1-click sync
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);

  // Multilingual Display & Translation state for Patient
  const [displayLanguage, setDisplayLanguage] = useState<SupportedLanguage>(language);
  const [translatedPrescriptions, setTranslatedPrescriptions] = useState<Record<string, Partial<Record<SupportedLanguage, DoctorPrescription>>>>({});
  const [isTranslatingCurrentRx, setIsTranslatingCurrentRx] = useState(false);

  // PDF Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfRx, setPdfRx] = useState<DoctorPrescription | null>(null);

  // Sync displayLanguage whenever global app language changes
  useEffect(() => {
    setDisplayLanguage(language);
  }, [language]);

  useEffect(() => {
    fetchAvailableDoctors();
    if (currentUser?.username) {
      handleSyncByUsername(currentUser.username);
    } else {
      // Default initial load for demo
      handleSyncByUsername('debdoot');
    }
  }, [currentUser?.username]);

  const fetchAvailableDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (data.doctors) {
        setAvailableDoctors(data.doctors);
      }
    } catch (e) {}
  };

  const handleSyncByUsername = async (username: string) => {
    setIsSyncing(true);
    setSyncError('');
    try {
      const res = await fetch(`/api/prescriptions/patient/${username.toLowerCase()}`);
      const data = await res.json();
      if (data.prescriptions && data.prescriptions.length > 0) {
        setPrescriptions(data.prescriptions);
        setSelectedRxId(data.prescriptions[0].id);
        setSyncStatusMsg(`Successfully synchronized ${data.prescriptions.length} active clinical prescription(s) for patient @${username}.`);
      } else {
        setPrescriptions([]);
        setSyncStatusMsg(`No prescriptions found under username @${username}. You can search by your Doctor's Name below.`);
      }
    } catch (err: any) {
      setSyncError('Could not sync prescriptions for this username.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncByDoctorName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSyncing(true);
    setSyncError('');
    setSyncStatusMsg('');

    try {
      const params = new URLSearchParams();
      if (doctorNameQuery.trim()) params.append('doctorName', doctorNameQuery.trim());
      if (clinicNameQuery.trim()) params.append('clinicName', clinicNameQuery.trim());
      if (currentUser?.username) params.append('patientUsername', currentUser.username);

      const res = await fetch(`/api/prescriptions/sync?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync data from doctor');
      }

      if (data.prescriptions && data.prescriptions.length > 0) {
        setPrescriptions(data.prescriptions);
        setSelectedRxId(data.prescriptions[0].id);
        setSyncStatusMsg(`Found and synchronized ${data.prescriptions.length} prescription(s) under Doctor '${doctorNameQuery || clinicNameQuery || 'Selected'}'.`);
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#059669', '#10b981'],
          });
        } catch (e) {}
      } else {
        setPrescriptions([]);
        setSyncError(`No prescriptions found matching Doctor '${doctorNameQuery}'. Please verify the spelling or search by Clinic Name.`);
      }
    } catch (err: any) {
      setSyncError(err.message || 'Sync error occurred. Please check network connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-translate prescription when displayLanguage is non-English
  useEffect(() => {
    const rawRx = prescriptions.find((p) => p.id === selectedRxId) || prescriptions[0];
    if (!rawRx) return;

    if (displayLanguage === 'en') return;

    // Check if already in cache
    if (translatedPrescriptions[rawRx.id]?.[displayLanguage]) return;

    const translateActiveRx = async () => {
      setIsTranslatingCurrentRx(true);
      try {
        const res = await fetch('/api/prescriptions/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescription: rawRx,
            targetLang: displayLanguage,
          }),
        });
        const data = await res.json();
        if (data.prescription) {
          setTranslatedPrescriptions((prev) => ({
            ...prev,
            [rawRx.id]: {
              ...(prev[rawRx.id] || {}),
              [displayLanguage]: data.prescription,
            },
          }));
        }
      } catch (err) {
        console.warn('Translation error in patient view:', err);
      } finally {
        setIsTranslatingCurrentRx(false);
      }
    };

    translateActiveRx();
  }, [selectedRxId, displayLanguage, prescriptions]);

  const handleApplyToDailyDinacharya = (rx: DoctorPrescription) => {
    // Generate actionable Dinacharya schedule items from doctor's prescription
    const newItems: RoutineScheduleItem[] = [
      {
        id: 'rx-din-1',
        time: '06:00 AM',
        period: 'brahma_muhurta',
        category: 'vihara',
        title: 'Brahma Muhurta Ushapan & Awakening',
        sanskritTitle: 'उषःपान एवं जागरण',
        description: 'Wake up before sunrise and drink 2 glasses of warm water infused with dry ginger.',
        completed: false,
        doshaImpact: `Balances ${rx.doshaImbalance.dominant}`,
      },
      {
        id: 'rx-din-2',
        time: '06:30 AM',
        period: 'morning',
        category: 'lifestyle',
        title: 'Doctor Prescribed Yoga & Pranayama',
        sanskritTitle: 'प्राणायाम एवं योगासन',
        description: (rx.yogaRoutine?.asanas || []).map((a) => a.name).join(', ') + ' followed by Nadi Shodhana.',
        instructions: rx.yogaRoutine?.preferredTime || 'Morning empty stomach',
        completed: false,
        doshaImpact: 'Alleviates Srotas blockages and enhances Agni.',
      },
      {
        id: 'rx-din-3',
        time: '08:30 AM',
        period: 'breakfast',
        category: 'ahara',
        title: 'Pathya Breakfast (Pratah Ahara)',
        sanskritTitle: 'प्रातः अल्पाहार',
        description: rx.foodChart.breakfast,
        completed: false,
        doshaImpact: 'Agni Deepana & gentle nourishment',
      },
    ];

    // Add medicines into schedule
    rx.medicines.forEach((med, idx) => {
      newItems.push({
        id: `rx-din-med-${idx}`,
        time: med.timing.toLowerCase().includes('before') ? '12:30 PM' : '01:30 PM',
        period: 'midday',
        category: 'aushadhi',
        title: `Aushadhi: ${med.name}`,
        sanskritTitle: med.sanskritName || med.name,
        description: `Take ${med.dosage} with ${med.anupana}. (${med.instructions || 'As prescribed by doctor'})`,
        dosageOrPortion: med.dosage,
        anupana: med.anupana,
        completed: false,
        doshaImpact: 'Roga Shamana therapeutic target',
      });
    });

    newItems.push({
      id: 'rx-din-lunch',
      time: '01:00 PM',
      period: 'midday',
      category: 'ahara',
      title: 'Doctor Recommended Lunch (Madhyahna Ahara)',
      sanskritTitle: 'मध्याह्न भोजन',
      description: rx.foodChart.lunch,
      completed: false,
      doshaImpact: 'Optimum Pitta digestion cycle',
    });

    newItems.push({
      id: 'rx-din-dinner',
      time: '07:30 PM',
      period: 'dinner',
      category: 'ahara',
      title: 'Doctor Prescribed Dinner (Ratri Ahara)',
      sanskritTitle: 'रात्रि भोजन',
      description: rx.foodChart.dinner,
      completed: false,
      doshaImpact: 'Prevents nocturnal Ama accumulation',
    });

    if (onApplyToDinacharya) {
      onApplyToDinacharya(newItems);
    }
    setAppliedRoutineId(rx.id);
    if (onNavigateToDinacharya) {
      onNavigateToDinacharya();
    }
  };

  const rawActiveRx = prescriptions.find((p) => p.id === selectedRxId) || prescriptions[0];
  const activeRx: DoctorPrescription | undefined = 
    (displayLanguage !== 'en' && rawActiveRx && translatedPrescriptions[rawActiveRx.id]?.[displayLanguage]) 
      ? translatedPrescriptions[rawActiveRx.id][displayLanguage] 
      : rawActiveRx;

  const handleOpenPdfModal = (rx: DoctorPrescription) => {
    setPdfRx(rx);
    setIsPdfModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Synchronization Control Box */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 sm:p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-1">
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {t.doctorAndClinicDataSyncEngine || 'Doctor & Clinic Data Sync Engine'}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
              {t.prescriptionsSyncHeader || 'Sync Prescriptions, Food Charts & Yoga Regimens'}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t.prescriptionsSyncSubheader || 'Treated by a Vaidya? Enter your Doctor\'s Name or Clinic to retrieve your complete treatment plan in your selected language.'}
            </p>
          </div>

          {/* Logged in patient username badge */}
          <div className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
            <span className="text-stone-500">{t.patientIdLabel || 'Your Patient ID:'} </span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
              @{currentUser?.username || 'debdoot'}
            </strong>
          </div>
        </div>

        {/* Sync Form */}
        <form onSubmit={handleSyncByDoctorName} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-6 relative">
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t.enterDoctorName || 'Enter Doctor\'s Name (under whom you are treated) *'}
            </label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={doctorNameQuery}
                onChange={(e) => setDoctorNameQuery(e.target.value)}
                placeholder={t.doctorNamePlaceholder || 'e.g. Dr. Ananya Mukherjee or Dr. Aravind Shastri'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>

          <div className="sm:col-span-4 relative">
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {t.orAyurvedicClinicName || 'Or Ayurvedic Clinic Name'}
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={clinicNameQuery}
                onChange={(e) => setClinicNameQuery(e.target.value)}
                placeholder={t.clinicNamePlaceholder || 'e.g. Sanjeevani or AyurVeda Chamber'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              id="sync-doctor-prescriptions-btn"
              type="submit"
              disabled={isSyncing}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {t.syncDataBtn || 'Sync Data'}
            </button>
          </div>
        </form>

        {/* Quick Doctor Sync Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="text-stone-500 text-[11px] font-semibold">{t.quickSyncWithClinics || 'Quick Sync with Registered Clinics:'}</span>
          {availableDoctors.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => {
                setDoctorNameQuery(doc.name);
                setClinicNameQuery(doc.clinicName);
                fetch(`/api/prescriptions/sync?doctorName=${encodeURIComponent(doc.name)}&patientUsername=${encodeURIComponent(currentUser?.username || 'debdoot')}`)
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.prescriptions && d.prescriptions.length > 0) {
                      setPrescriptions(d.prescriptions);
                      setSelectedRxId(d.prescriptions[0].id);
                      setSyncStatusMsg(`Synchronized prescriptions from ${doc.name} (${doc.clinicName}).`);
                    }
                  });
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              👨‍⚕️ {doc.name} ({doc.consultationFee})
            </button>
          ))}
        </div>

        {syncStatusMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-lime-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {syncError && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}
      </div>

      {/* Main Prescription Display Area */}
      {prescriptions.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-10 text-center border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mx-auto flex items-center justify-center text-stone-400">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-stone-800 dark:text-stone-200">
            {t.noPrescriptionsLinkedYet || 'No Prescriptions Linked Yet'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            {t.noPrescriptionsLinkedDesc || 'Use the search bar above to enter your doctor\'s name or clinic to sync your personalized diet routine and herbal prescriptions.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Prescription Selector Tabs (if multiple) */}
          {prescriptions.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {prescriptions.map((rx) => (
                <button
                  key={rx.id}
                  onClick={() => setSelectedRxId(rx.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeRx?.id === rx.id
                      ? 'bg-emerald-800 text-white shadow-md'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                  }`}
                >
                  📄 {rx.prescriptionNumber} • {rx.diagnosis.split('(')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Active Prescription Document */}
          {activeRx && (
            <div 
              id="printable-ayurvedic-prescription"
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-lg overflow-hidden space-y-0 print:border-none print:shadow-none"
            >
              {/* Language Toolbar for Patient's Profile */}
              <div className="bg-emerald-950 px-5 py-3 border-b border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-200">Prescription Display Language:</span>
                  <span className="font-bold text-lime-300">
                    {LANGUAGE_LABELS[displayLanguage]?.native} ({LANGUAGE_LABELS[displayLanguage]?.label})
                  </span>
                  {isTranslatingCurrentRx && (
                    <span className="text-[11px] text-amber-300 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Translating...
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((langCode) => (
                    <button
                      key={langCode}
                      onClick={() => setDisplayLanguage(langCode)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        displayLanguage === langCode
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-800'
                      }`}
                    >
                      {LANGUAGE_LABELS[langCode].flag} {LANGUAGE_LABELS[langCode].native}
                    </button>
                  ))}
                </div>
              </div>

              {/* Official Clinic Header */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-lime-300 text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t.authenticPrescriptionBadge || 'Authentic AYUSH Registered Clinical Prescription'}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white">
                      {activeRx.clinicName}
                    </h2>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-lime-400" />
                      {activeRx.clinicAddress}
                    </p>
                  </div>

                  {/* Actions: Selectable PDF Modal & Sync to Dinacharya */}
                  <div className="flex flex-wrap items-center gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => handleOpenPdfModal(activeRx)}
                      className="py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Selectable PDF
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyToDailyDinacharya(activeRx)}
                      className="py-2 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {appliedRoutineId === activeRx.id ? (t.appliedToPlannerBtn || 'Applied to Planner ✓') : (t.applyToPlannerBtn || 'Apply to My Daily Dinacharya Planner')}
                    </button>
                  </div>
                </div>

                {/* Doctor & Patient Two-Column Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-800/80 text-xs">
                  {/* Doctor Info */}
                  <div className="space-y-1 bg-black/20 p-3 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-lime-300 font-bold uppercase tracking-wider block">
                      {t.treatingVaidyaPractitioner || 'Treating Vaidya Practitioner'}
                    </span>
                    <div className="font-bold text-white text-sm">{activeRx.doctorName}</div>
                    <div className="text-slate-300 text-[11px]">{activeRx.doctorQualification}</div>
                    <div className="text-emerald-300 text-[11px] font-mono">{t.licenseRegNo || 'Reg No:'} {activeRx.doctorRegistrationNo}</div>
                    <div className="text-lime-300 text-[11px] font-semibold mt-1">
                      {t.consultationFeeLabel || 'Session Consultation Fee:'} {activeRx.consultationFee}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="space-y-1 bg-black/20 p-3 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] text-lime-300 font-bold uppercase tracking-wider block">
                      {t.patientRecord || 'Patient Record'}
                    </span>
                    <div className="font-bold text-white text-sm">{activeRx.patientName}</div>
                    <div className="text-slate-300 text-[11px]">
                      Username: <span className="font-mono text-emerald-300">@{activeRx.patientUsername}</span> • Age: {activeRx.patientAge || 28}
                    </div>
                    <div className="text-slate-300 text-[11px]">{t.dateIssued || 'Date Issued:'} {activeRx.date}</div>
                    <div className="text-amber-300 text-[11px] font-semibold">
                      {t.followUpDateLabel || 'Follow-up Date:'} {activeRx.followUpDate || '14 Days'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescription Body Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* 1. Diagnosis & Nadi Pariksha */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                        {t.rogaNidanDiagnosis || 'Roga Nidan (Ayurvedic Diagnosis)'}
                      </span>
                      <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{activeRx.diagnosis}</h3>
                      {activeRx.sanskritRogaNidan && (
                        <p className="text-xs font-serif text-emerald-800 dark:text-emerald-300">{activeRx.sanskritRogaNidan}</p>
                      )}
                    </div>

                    <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      Dominant: {activeRx.doshaImbalance?.dominant || 'Tridosha'}
                    </div>
                  </div>

                  {activeRx.nadiParikshaNotes && (
                    <div className="text-xs text-stone-700 dark:text-stone-300">
                      <strong className="text-stone-900 dark:text-stone-100">{t.nadiParikshaPulseTitle || 'Nadi Pariksha Observations:'} </strong>
                      {activeRx.nadiParikshaNotes}
                    </div>
                  )}

                  {activeRx.clinicalNotes && (
                    <div className="text-xs text-stone-700 dark:text-stone-300">
                      <strong className="text-stone-900 dark:text-stone-100">{t.doctorClinicalNotesTitle || 'Doctor Clinical Notes:'} </strong>
                      {activeRx.clinicalNotes}
                    </div>
                  )}
                </div>

                {/* 2. Prescribed Aushadhi (Medicines) Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    {t.prescribedMedicinesTitle || 'Prescribed Ayurvedic Formulations (Aushadhi)'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(activeRx.medicines || []).map((med, idx) => (
                      <div
                        key={med.id || idx}
                        className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">
                            {med.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                            {med.form}
                          </span>
                        </div>

                        {med.sanskritName && (
                          <div className="text-[11px] font-serif text-emerald-700 dark:text-emerald-400">
                            {med.sanskritName}
                          </div>
                        )}

                        <div className="space-y-1 text-stone-700 dark:text-stone-300 text-[11px]">
                          <div><strong>{t.dosageLabel || 'Dosage:'}</strong> {med.dosage}</div>
                          <div><strong>{t.timingLabel || 'Timing:'}</strong> {med.timing}</div>
                          <div><strong>{t.anupanaVehicleLabel || 'Anupana:'}</strong> {med.anupana}</div>
                          <div><strong>{t.durationLabel || 'Duration:'}</strong> {med.duration}</div>
                        </div>

                        {med.instructions && (
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 italic pt-1 border-t border-emerald-200/50 dark:border-emerald-800/40">
                            {med.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Ahara (Custom Daily Diet Food Chart Routine) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-600" />
                    {t.foodChartTitle || 'Personalized Ayurvedic Food Chart (Pathya-Apathya Ahara)'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 block">{t.breakfastLabel || 'Breakfast:'}</span>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                        {activeRx.foodChart?.breakfast || 'Warm spiced porridge / herbal infusion'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 block">{t.lunchLabel || 'Lunch:'}</span>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                        {activeRx.foodChart?.lunch || 'Moong dal khichdi with pure A2 cow ghee'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 block">{t.eveningSnackLabel || 'Evening Rejuvenation:'}</span>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                        {activeRx.foodChart?.eveningSnack || 'Roasted jeera & saunf digestive tea'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 block">{t.dinnerLabel || 'Dinner:'}</span>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                        {activeRx.foodChart?.dinner || 'Light vegetable soup before 8:00 PM'}
                      </p>
                    </div>
                  </div>

                  {/* Pathya vs Apathya */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                      <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        {t.pathyaLabel || 'Pathya (Recommended Foods):'}
                      </span>
                      <ul className="space-y-1 text-[11px] text-stone-700 dark:text-stone-300">
                        {(activeRx.foodChart?.pathya || ['Old shali rice', 'Warm water', 'Moong dal', 'Pomegranate', 'Cumin']).map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
                      <span className="font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        {t.apathyaLabel || 'Apathya (Foods to Avoid):'}
                      </span>
                      <ul className="space-y-1 text-[11px] text-stone-700 dark:text-stone-300">
                        {(activeRx.foodChart?.apathya || ['Cold refrigerated items', 'Curd at night', 'Excessive sour foods', 'Deep fried items']).map((a, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {activeRx.foodChart?.hydrationGuideline && (
                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-sky-600 shrink-0" />
                      <span><strong>{t.hydrationLabel || 'Hydration Guideline:'} </strong>{activeRx.foodChart.hydrationGuideline}</span>
                    </div>
                  )}
                </div>

                {/* 4. Yoga & Vyayama Routine */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    {t.yogaPranayamaTitle || 'Prescribed Yoga Asanas & Pranayama Routine'}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(activeRx.yogaRoutine?.asanas || []).map((as, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-300">
                          <span>{as.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                            {as.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400">
                          <strong>{t.benefitLabel || 'Benefit:'} </strong>{as.benefit}
                        </p>
                        {as.instructions && (
                          <p className="text-[11px] text-stone-500 italic">
                            {as.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {activeRx.yogaRoutine?.preferredTime && (
                    <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
                      <strong>{t.timingLabel || 'Timing:'} </strong>{activeRx.yogaRoutine.preferredTime}
                    </div>
                  )}
                </div>

                {/* Official Verification Seal & Stamp Footer */}
                <div className="pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-lime-500" />
                      {t.authenticPrescriptionBadge || 'Digitally Verified by AYUSH Registered Medical Practitioner'}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      Cryptographic Seal: {activeRx.digitalSealHash || 'SEAL_AYUSH_OFFICIAL_VERIFIED'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200">
                      {activeRx.doctorName}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {activeRx.doctorQualification} • {activeRx.doctorRegistrationNo}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selectable Vector PDF Generator Modal */}
      <PrescriptionPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        prescription={pdfRx}
        initialLanguage={displayLanguage}
        doctorViewMode={false}
      />
    </div>
  );
};
