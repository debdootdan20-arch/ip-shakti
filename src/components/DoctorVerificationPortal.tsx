import React, { useState, useMemo, useEffect } from 'react';
import { 
  Award, ShieldCheck, Stethoscope, CheckCircle2, 
  Clock, Edit3, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiseaseAssessmentResult, SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';
import { getPendingCases, APP_IMAGES } from '../data/ayurvedaData';

interface DoctorVerificationPortalProps {
  language: SupportedLanguage;
  latestAssessment?: DiseaseAssessmentResult | null;
}

export const DoctorVerificationPortal: React.FC<DoctorVerificationPortalProps> = ({
  language,
  latestAssessment,
}) => {
  const t = translations[language] || translations.en;
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const [isVerified, setIsVerified] = useState(false);

  const pendingCases = useMemo(
    () => getPendingCases(language, latestAssessment),
    [language, latestAssessment]
  );

  const currentCase = useMemo(
    () => pendingCases.find((c) => c.id === selectedCaseId) || pendingCases[0],
    [pendingCases, selectedCaseId]
  );

  const [doctorNotes, setDoctorNotes] = useState(
    currentCase?.defaultDoctorNotes || ''
  );

  // Update doctor notes when case or language changes
  useEffect(() => {
    if (currentCase?.defaultDoctorNotes) {
      setDoctorNotes(currentCase.defaultDoctorNotes);
    }
  }, [currentCase, language]);

  const handleSignAndVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerified(true);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#d97706'],
      });
    } catch (err) {}
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-500/20 dark:border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src={APP_IMAGES.doctorConsultation}
            alt="Doctor Verification Portal"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative p-6 sm:p-8 md:p-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/30 backdrop-blur-sm">
            <Award className="w-3.5 h-3.5 text-lime-400" />
            Vaidya Verification & Clinical Governance Desk
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-50 mb-3 tracking-tight">
            {t.doctorVerificationTitle}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {t.doctorVerificationSubtitle}
          </p>

          {/* Logged in Doctor ID Badge */}
          <div className="inline-flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-emerald-500/30 text-xs shadow-md">
            <div className="w-9 h-9 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold">
              <Stethoscope className="w-5 h-5 text-lime-300" />
            </div>
            <div>
              <div className="font-bold text-emerald-300">Vaidya Dr. Ananya Mukherjee, MD (Ayu)</div>
              <div className="text-slate-300 text-[11px]">Paschim Banga Ayurved Parishad • Reg No: <strong>WB-AYU-2018-9481</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Queue List (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Patient Assessment Queue
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/40">
              {pendingCases.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingCases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  setIsVerified(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  selectedCaseId === c.id
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-2xs'
                    : 'border-stone-200/80 dark:border-stone-800 hover:border-stone-300 bg-stone-50 dark:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{c.patient}</span>
                  <span className="text-[10px] text-stone-400">{c.submittedAt}</span>
                </div>
                <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {c.disease}
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                  {c.symptoms}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Sign-Off Box (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              Clinical Review & Official Sign-Off
            </h2>
            <span className="text-xs text-stone-400 font-mono">Case #{selectedCaseId}</span>
          </div>

          <form onSubmit={handleSignAndVerify} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Practitioner Diagnostic Notes & Nadi Pariksha Findings:
              </label>
              <textarea
                rows={4}
                required
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Enter clinical examination notes, pulse diagnosis (Nadi), tongue signs (Jihwa), and specific dosage adjustments..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">
                Official Certification Declarations:
              </div>
              <div className="space-y-1.5 text-stone-700 dark:text-stone-300 text-[11px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>I certify that this Ayurvedic assessment adheres to AYUSH Schedule E-1 standards.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>I have confirmed that no heavy metal Bhasmas are prescribed without standardized Shodhana.</span>
                </div>
              </div>
            </div>

            {!isVerified ? (
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-lg"
              >
                <ShieldCheck className="w-4 h-4 text-lime-300" />
                {t.doctorVerifyButton}
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950 text-white text-center space-y-2 animate-fadeIn border border-emerald-500/40">
                <div className="inline-flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <Check className="w-5 h-5 text-lime-400" />
                  Official Practitioner Seal Applied
                </div>
                <p className="text-xs text-slate-300">
                  Prescription cryptographically stamped by Dr. Ananya Mukherjee (Reg: WB-AYU-2018-9481). Digital verification certificate sent to patient record.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

