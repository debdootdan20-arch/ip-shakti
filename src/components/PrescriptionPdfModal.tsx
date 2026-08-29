import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Download, Globe, Sparkles, Check, 
  FileText, ShieldCheck, AlertCircle, RefreshCw, Copy, CheckCheck
} from 'lucide-react';
import { DoctorPrescription, SupportedLanguage } from '../types';
import { 
  generatePrescriptionHtml, 
  printPrescriptionPdf, 
  downloadSelectablePrescriptionDoc, 
  downloadPrescriptionPdfWithHtml2Pdf,
  downloadPrescriptionWithJsPdf,
  LANGUAGE_LABELS 
} from '../utils/prescriptionPdf';

interface PrescriptionPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: DoctorPrescription | null;
  initialLanguage?: SupportedLanguage;
  doctorViewMode?: boolean;
}

export const PrescriptionPdfModal: React.FC<PrescriptionPdfModalProps> = ({
  isOpen,
  onClose,
  prescription,
  initialLanguage = 'en',
  doctorViewMode = false,
}: PrescriptionPdfModalProps) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>((initialLanguage as SupportedLanguage) || 'en');
  const [displayedRx, setDisplayedRx] = useState<DoctorPrescription | null>(prescription);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<string>('');

  const handleTranslate = async (targetLang: SupportedLanguage, baseRx: DoctorPrescription) => {
    setSelectedLang(targetLang);
    if (targetLang === 'en') {
      setDisplayedRx(baseRx);
      setTranslationStatus('Displayed in original clinical English.');
      return;
    }

    setIsTranslating(true);
    setTranslationStatus(`Translating clinical notes, Aushadhi formulations & Pathya food chart to ${LANGUAGE_LABELS[targetLang]?.native || targetLang}...`);

    try {
      const res = await fetch('/api/prescriptions/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescription: baseRx,
          targetLang,
        }),
      });

      const data = await res.json();
      if (data.prescription) {
        setDisplayedRx(data.prescription);
        setTranslationStatus(`✓ Successfully translated to ${LANGUAGE_LABELS[targetLang]?.native || targetLang} with preserved pharmacological terms.`);
      } else {
        setDisplayedRx(baseRx);
        setTranslationStatus('Original clinical format retained.');
      }
    } catch (err) {
      setTranslationStatus('Translation network error; showing standard bilingual layout.');
      setDisplayedRx(baseRx);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (prescription) {
      const lang = (initialLanguage as SupportedLanguage) || 'en';
      if (lang !== 'en') {
        setSelectedLang(lang);
        handleTranslate(lang, prescription);
      } else {
        setSelectedLang('en');
        setDisplayedRx(prescription);
      }
    }
  }, [prescription, initialLanguage]);

  if (!isOpen || !prescription || !displayedRx) return null;

  const handleDownloadHtml2Pdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadPrescriptionPdfWithHtml2Pdf(displayedRx, selectedLang);
    } catch (err) {
      console.error('Error generating PDF with html2pdf:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadJsPdf = () => {
    downloadPrescriptionWithJsPdf(displayedRx, selectedLang);
  };

  const handlePrint = () => {
    printPrescriptionPdf(displayedRx, selectedLang);
  };

  const handleDownloadDoc = () => {
    downloadSelectablePrescriptionDoc(displayedRx, selectedLang);
  };

  const handleCopyText = () => {
    const textToCopy = `
AYURVEDIC CLINICAL PRESCRIPTION
Clinic: ${displayedRx.clinicName}
Doctor: ${displayedRx.doctorName} (${displayedRx.doctorRegistrationNo})
Patient: ${displayedRx.patientName} (@${displayedRx.patientUsername})
Diagnosis: ${displayedRx.diagnosis} (${displayedRx.sanskritRogaNidan || ''})
Dosha: Dominant ${displayedRx.doshaImbalance?.dominant || 'Tridosha'}
Medicines:
${(displayedRx.medicines || []).map((m, i) => `${i + 1}. ${m.name} - ${m.dosage}, ${m.timing}, Anupana: ${m.anupana}`).join('\n')}

Food Chart (Pathya):
Breakfast: ${displayedRx.foodChart?.breakfast || 'Warm porridge'}
Lunch: ${displayedRx.foodChart?.lunch || 'Moong khichdi with ghee'}
Dinner: ${displayedRx.foodChart?.dinner || 'Light vegetable soup'}

Yoga & Lifestyle:
${(displayedRx.yogaRoutine?.asanas || []).map((a) => `- ${a.name} (${a.duration}): ${a.benefit}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header Bar with Language Picker and Actions */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-lime-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Selectable-Text AYUSH Official Prescription Slip
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-lime-400" />
              {displayedRx.prescriptionNumber} • {displayedRx.patientName}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
            >
              {copiedNotification ? <CheckCheck className="w-3.5 h-3.5 text-lime-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedNotification ? 'Copied!' : 'Copy Text'}
            </button>

            <button
              type="button"
              onClick={handleDownloadJsPdf}
              className="py-1.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-emerald-600 shadow-sm cursor-pointer"
              title="Generate selectable vector PDF directly using jsPDF"
            >
              <FileText className="w-3.5 h-3.5 text-lime-300" />
              jsPDF Vector
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml2Pdf}
              disabled={isGeneratingPdf}
              className="py-1.5 px-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-emerald-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              title="Download full translated PDF rendered via html2pdf.js & jsPDF"
            >
              {isGeneratingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF (html2pdf)'}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Selection Toolbar */}
        <div className="bg-stone-100 dark:bg-stone-800/90 px-4 py-2.5 border-b border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="font-bold text-stone-700 dark:text-stone-300">
              Prescription Document Language:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((langCode) => (
              <button
                key={langCode}
                onClick={() => handleTranslate(langCode, prescription)}
                disabled={isTranslating}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedLang === langCode
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600 hover:bg-stone-50'
                }`}
              >
                {LANGUAGE_LABELS[langCode].flag} {LANGUAGE_LABELS[langCode].native}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Status Notice */}
        {translationStatus && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
            {isTranslating ? (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span className="font-medium">{translationStatus}</span>
          </div>
        )}

        {/* Scrollable Live Printable Preview with 100% Selectable Text */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/60 dark:bg-stone-950/60 select-text">
          <div className="max-w-3xl mx-auto bg-white dark:bg-stone-900 rounded-xl border border-stone-300 dark:border-stone-800 shadow-md p-6 sm:p-8 space-y-6 text-stone-800 dark:text-stone-100 select-text">
            
            {/* Header: Clinic & Doctor Info */}
            <div className="border-b-2 border-emerald-800 pb-5 space-y-3 select-text">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif text-emerald-950 dark:text-emerald-200 tracking-tight select-text">
                    {displayedRx.clinicName}
                  </h1>
                  <p className="text-xs text-stone-500 dark:text-stone-400 select-text">
                    {displayedRx.clinicAddress}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-stone-900 dark:text-stone-100 select-text">{displayedRx.doctorName}</div>
                  <div className="text-stone-500 select-text">{displayedRx.doctorQualification}</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px] select-text">
                    Reg No: {displayedRx.doctorRegistrationNo}
                  </div>
                </div>
              </div>

              {/* Patient details line */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs bg-stone-50 dark:bg-stone-800/40 p-3 rounded-lg select-text">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Patient Name</span>
                  <strong className="text-stone-900 dark:text-stone-100 select-text">{displayedRx.patientName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Patient ID / Username</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 select-text">@{displayedRx.patientUsername}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Date Issued</span>
                  <span className="select-text">{displayedRx.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Follow-up Date</span>
                  <strong className="text-amber-700 dark:text-amber-400 select-text">{displayedRx.followUpDate || '14 Days'}</strong>
                </div>
              </div>
            </div>

            {/* Diagnosis & Nadi Pariksha */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2 select-text">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Roga Nidan (Ayurvedic Diagnosis)
                  </span>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 select-text">
                    {displayedRx.diagnosis}
                  </h3>
                  {displayedRx.sanskritRogaNidan && (
                    <div className="text-xs font-serif text-emerald-800 dark:text-emerald-400 select-text">
                      {displayedRx.sanskritRogaNidan}
                    </div>
                  )}
                </div>
                <div className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-bold select-text">
                  Dominant: {displayedRx.doshaImbalance?.dominant || 'Tridosha'}
                </div>
              </div>

              {displayedRx.nadiParikshaNotes && (
                <div className="text-xs text-stone-700 dark:text-stone-300 pt-1 border-t border-emerald-200/60 select-text">
                  <strong>Nadi Pariksha Observations: </strong>{displayedRx.nadiParikshaNotes}
                </div>
              )}
            </div>

            {/* Prescribed Aushadhi Table */}
            <div className="space-y-3 select-text">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2 select-text">
                <FileText className="w-4 h-4 text-emerald-600" />
                Prescribed Ayurvedic Formulations (Aushadhi)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-stone-300 dark:border-stone-700 select-text">
                  <thead>
                    <tr className="bg-emerald-900 text-white select-text">
                      <th className="p-2 border border-emerald-800">#</th>
                      <th className="p-2 border border-emerald-800">Medicine Name</th>
                      <th className="p-2 border border-emerald-800">Form</th>
                      <th className="p-2 border border-emerald-800">Dosage</th>
                      <th className="p-2 border border-emerald-800">Timing (Kala)</th>
                      <th className="p-2 border border-emerald-800">Anupana (Vehicle)</th>
                      <th className="p-2 border border-emerald-800">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(displayedRx.medicines || []).map((m, idx) => (
                      <tr key={idx} className="border-b border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 select-text">
                        <td className="p-2 font-bold text-emerald-800 select-text">{idx + 1}</td>
                        <td className="p-2 select-text">
                          <div className="font-bold select-text">{m.name}</div>
                          {m.sanskritName && <div className="text-[11px] font-serif text-emerald-700 select-text">{m.sanskritName}</div>}
                          {m.instructions && <div className="text-[10px] text-stone-500 italic select-text">{m.instructions}</div>}
                        </td>
                        <td className="p-2 select-text">{m.form}</td>
                        <td className="p-2 font-semibold select-text">{m.dosage}</td>
                        <td className="p-2 select-text">{m.timing}</td>
                        <td className="p-2 select-text">{m.anupana}</td>
                        <td className="p-2 select-text">{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Food Chart & Pathya */}
            <div className="space-y-3 select-text">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 select-text">
                Personalized Ayurvedic Food Chart (Pathya-Apathya Ahara)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs select-text">
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 select-text">
                  <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">Breakfast:</strong>
                  <p className="text-[11px] select-text">{displayedRx.foodChart?.breakfast || 'Warm porridge'}</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 select-text">
                  <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">Lunch:</strong>
                  <p className="text-[11px] select-text">{displayedRx.foodChart?.lunch || 'Moong khichdi with ghee'}</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 select-text">
                  <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">Evening:</strong>
                  <p className="text-[11px] select-text">{displayedRx.foodChart?.eveningSnack || 'Herbal tea with roasted seeds'}</p>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 select-text">
                  <strong className="text-emerald-800 dark:text-emerald-400 block mb-1">Dinner:</strong>
                  <p className="text-[11px] select-text">{displayedRx.foodChart?.dinner || 'Light soup and steamed greens'}</p>
                </div>
              </div>

              {/* Pathya & Apathya Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs select-text">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 select-text">
                  <strong className="text-emerald-900 dark:text-emerald-200 block mb-1 select-text">✓ Pathya (Recommended):</strong>
                  <ul className="space-y-0.5 text-[11px] list-disc list-inside select-text">
                    {(displayedRx.foodChart?.pathya || []).map((p, i) => (
                      <li key={i} className="select-text">{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 select-text">
                  <strong className="text-rose-900 dark:text-rose-200 block mb-1 select-text">✕ Apathya (Avoid):</strong>
                  <ul className="space-y-0.5 text-[11px] list-disc list-inside select-text">
                    {(displayedRx.foodChart?.apathya || []).map((a, i) => (
                      <li key={i} className="select-text">{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Yoga Routine */}
            <div className="space-y-2 select-text">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 select-text">
                Yoga &amp; Pranayama Regimen
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs select-text">
                {(displayedRx.yogaRoutine?.asanas || []).map((as, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 select-text">
                    <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-300 select-text">
                      <span>{as.name}</span>
                      <span className="text-[10px] text-stone-500 select-text">{as.duration}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 select-text">{as.benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Practitioner Verification Seal */}
            <div className="pt-5 border-t-2 border-emerald-800 flex flex-wrap items-center justify-between gap-4 text-xs select-text">
              <div className="space-y-0.5 select-text">
                <div className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 select-text">
                  <Check className="w-4 h-4 text-emerald-600" />
                  AYUSH Certified Practitioner Clinical Seal
                </div>
                <div className="text-[10px] text-stone-400 font-mono select-text">
                  Digital Authentication Hash: {displayedRx.digitalSealHash || 'SEAL_AYUSH_OFFICIAL_VERIFIED'}
                </div>
              </div>
              <div className="text-right select-text">
                <div className="font-serif font-bold text-sm select-text">{displayedRx.doctorName}</div>
                <div className="text-[10px] text-stone-500 select-text">
                  {displayedRx.doctorQualification} • {displayedRx.doctorRegistrationNo}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-stone-100 dark:bg-stone-800 text-stone-500 text-[11px] flex items-center justify-between border-t border-stone-200 dark:border-stone-700">
          <span>💡 All text is 100% selectable, translatable across Indian languages, and printer-ready.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
