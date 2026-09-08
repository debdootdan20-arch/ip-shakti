import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Stethoscope, Upload, Image as ImageIcon, Sparkles, AlertTriangle, 
  CheckCircle2, ShieldCheck, Download, RefreshCw, ChevronRight, BookOpen, 
  Flame, Wind, Droplets, HeartPulse, FileText, X, ArrowRight, UserCheck, Calendar,
  Languages, Zap, CheckCircle, Activity, ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SupportedLanguage, DiseaseAssessmentResult } from '../types';
import { translations } from '../i18n/translations';
import { 
  getSampleCases, 
  getQuickSymptomCategories, 
  getPhilosophyQuote, 
  getClinicalImagePresets,
  APP_IMAGES 
} from '../data/ayurvedaData';

interface SymptomCheckerProps {
  language: SupportedLanguage;
  onNavigateToClinics: () => void;
  onSaveAssessment?: (assessment: DiseaseAssessmentResult) => void;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  language,
  onNavigateToClinics,
  onSaveAssessment,
}) => {
  const t = translations[language] || translations.en;
  const quickCategories = getQuickSymptomCategories(language);
  const sampleCases = getSampleCases(language);
  const clinicalImagePresets = getClinicalImagePresets(language);
  const philosophy = getPhilosophyQuote(language);
  
  const [symptomText, setSymptomText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<DiseaseAssessmentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeRemedyTab, setActiveRemedyTab] = useState<'shaman' | 'shodhan' | 'diet' | 'yoga'>('shaman');

  // Automatic Disease Detection States
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [detectStatus, setDetectStatus] = useState<'idle' | 'typing' | 'detecting' | 'detected' | 'error'>('idle');
  const [detectedTime, setDetectedTime] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const lastDetectedQueryRef = useRef<string>('');

  const handleTranslateInput = async () => {
    if (!symptomText.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: symptomText,
          targetLanguage: language,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setSymptomText(data.translatedText);
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Centralized diagnosis runner
  const runDiagnosis = useCallback(async (
    symptomsToAnalyze: string,
    imageToAnalyze?: string | null,
    isAutoTrigger: boolean = false
  ) => {
    const trimmedSymptoms = symptomsToAnalyze.trim();
    if (!trimmedSymptoms && !imageToAnalyze) {
      setResult(null);
      setDetectStatus('idle');
      return;
    }

    const queryKey = `${trimmedSymptoms}|${imageToAnalyze ? 'has_image' : 'no_img'}|${language}`;
    if (isAutoTrigger && queryKey === lastDetectedQueryRef.current && result) {
      return; // already analyzed
    }

    // Abort previous in-flight request
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    setIsLoading(true);
    setDetectStatus('detecting');
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          symptoms: trimmedSymptoms,
          imageBase64: imageToAnalyze || null,
          imageMimeType,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

// Handle invalid image input
if (data.invalidInput) {
  setResult(null);
  setDetectStatus('error');
  setErrorMsg(
    data.error ||
    'This is an invalid input. Please upload a clear image of the affected body area for disease detection.'
  );
  return;
}

lastDetectedQueryRef.current = queryKey;
setResult(data);
setDetectStatus('detected');
      setDetectedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (onSaveAssessment) {
        onSaveAssessment(data);
      }

      // Trigger gentle celebration
      try {
        confetti({
          particleCount: 28,
          spread: 55,
          origin: { y: 0.8 },
          colors: ['#059669', '#d97706', '#84cc16'],
        });
      } catch (e) {
        // silent
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // aborted by newer keystroke, ignore
      }
      console.error('Diagnosis failed:', err);
      setDetectStatus('error');
      setErrorMsg('Diagnosis could not be completed. Please check connection or try again.');
    } finally {
      setIsLoading(false);
    }
  }, [imageMimeType, language, onSaveAssessment, result]);

  // Real-time automatic disease detection upon typing
  useEffect(() => {
    if (!autoDetectEnabled) return;

    if (!symptomText.trim() && !selectedImage) {
      setDetectStatus('idle');
      return;
    }

    // Mark as typing
    setDetectStatus('typing');

    // Debounce typing by 500ms
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If symptoms length >= 3 chars or image is present, auto-detect
    if (symptomText.trim().length >= 3 || selectedImage) {
      debounceTimeoutRef.current = setTimeout(() => {
        runDiagnosis(symptomText, selectedImage, true);
      }, 500);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [symptomText, selectedImage, autoDetectEnabled, language, runDiagnosis]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('Image size should be under 15MB.');
        return;
      }
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        const imgData = reader.result as string;
        setSelectedImage(imgData);
        setErrorMsg(null);
        if (autoDetectEnabled) {
          if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
          runDiagnosis(symptomText, imgData, true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (autoDetectEnabled && symptomText.trim()) {
      runDiagnosis(symptomText, null, true);
    }
  };

  const handleSampleClick = (sample: { title: string; symptoms: string; category?: string; imageUrl?: string }) => {
    setSymptomText(sample.symptoms);
    const img = sample.imageUrl || null;
    setSelectedImage(img);
    setErrorMsg(null);
    if (autoDetectEnabled) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      runDiagnosis(sample.symptoms, img, true);
    }
  };

  const handleQuickAddSymptom = (item: string) => {
    let newText = symptomText;
    if (symptomText.trim() === '') {
      newText = item;
    } else if (!symptomText.includes(item)) {
      newText = `${symptomText}, ${item}`;
    }
    setSymptomText(newText);
    if (autoDetectEnabled) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      runDiagnosis(newText, selectedImage, true);
    }
  };

  const handleManualAnalyze = () => {
    if (!symptomText.trim() && !selectedImage) {
      setErrorMsg('Please enter your symptoms or upload an image of the affected area.');
      return;
    }
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    runDiagnosis(symptomText, selectedImage, false);
  };

  const handleReset = () => {
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    lastDetectedQueryRef.current = '';
    setSymptomText('');
    setSelectedImage(null);
    setResult(null);
    setErrorMsg(null);
    setDetectStatus('idle');
    setDetectedTime(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header Card with Classical Green Theme */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-[#1E3A2F] text-white">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <img
            src={APP_IMAGES.heroMortar}
            alt="Ayurveda Traditional Herbs"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative p-6 sm:p-8 md:p-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#A3E635] text-xs font-bold uppercase tracking-wider mb-4 border border-white/15 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
            Vaidya Nidan • Classical Ayurvedic Disease Detection
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            {t.symptomHeader}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {t.symptomSubheader}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-lg border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-[#A3E635]" />
              Charaka & Sushruta Samhita Grounded
            </span>
            <span className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Licensed Vaidya Verification Protocol
            </span>
            <span className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-lg border border-white/10">
              <HeartPulse className="w-3.5 h-3.5 text-[#A3E635]" />
              {t.tridoshaQuantifierBadge || 'Tridosha Imbalance Quantifier'}
            </span>
          </div>
        </div>
      </div>

      {/* Input Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Symptom Input, Live Detection & Image Upload (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            {/* Header with Live Auto-Detection Status Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.diagnosticInputTitle || '1. Diagnostic Assessment Input'}
                  </h2>
                  {/* Live Auto-Detection Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border transition-all bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                    <Zap className="w-3 h-3 text-emerald-600 dark:text-[#A3E635] fill-emerald-600 dark:fill-[#A3E635]" />
                    <span>Auto-Detect Active</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Type, click symptoms, or select a case — diseases and doshas are detected automatically in real time.
                </p>
              </div>

              {/* Status pill indicating typing / detecting / detected */}
              <div className="flex items-center gap-2">
                {detectStatus === 'detecting' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                    <span>Auto-Detecting Disease...</span>
                  </span>
                )}
                {detectStatus === 'typing' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-xs font-medium border border-sky-200 dark:border-sky-800">
                    <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-bounce" />
                    <span>Analyzing keystrokes...</span>
                  </span>
                )}
                {detectStatus === 'detected' && result && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Disease Detected ({detectedTime || 'Live'})</span>
                  </span>
                )}
              </div>
            </div>

            {/* Symptom Input Textarea */}
            <div className="relative">
              <textarea
                id="symptom-input"
                rows={4}
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none text-sm leading-relaxed transition-all resize-none font-sans"
              />
              {symptomText.trim() && (
                <button
                  type="button"
                  id="auto-translate-input-btn"
                  onClick={handleTranslateInput}
                  disabled={isTranslating}
                  className="absolute right-3 bottom-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 text-xs font-bold shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isTranslating ? t.translatingInput : t.autoTranslate}</span>
                </button>
              )}
            </div>

            {/* Real-time Detected Insights Preview Banner (Shows immediately below textarea) */}
            {result && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-[#A3E635]" />
                      Auto-Detected Condition
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {result.severityLevel} Severity
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      ({result.confidenceScore}% Confidence)
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                    <span>{result.diseaseName}</span>
                    <span className="text-xs font-medium text-emerald-700 dark:text-[#A3E635]">
                      • {result.sanskritName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      Primary Dosha: {result.doshaAssessment.primaryImbalance}
                    </span>
                    <span>(V: {result.doshaAssessment.vata}%, P: {result.doshaAssessment.pitta}%, K: {result.doshaAssessment.kapha}%)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={scrollToResults}
                  className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <span>View Full Report</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Symptom Chips Picker */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {t.orSelectQuickSymptoms}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  (Click any chip to auto-detect)
                </span>
              </div>
              <div className="space-y-2">
                {quickCategories.map((cat, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {cat.category}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          type="button"
                          onClick={() => handleQuickAddSymptom(item)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload Area for Visual Inspection */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                  <span>{t.visualInspectionTitle || '2. Visual Inspection (Skin, Tongue, Eye, Nails or Swelling)'}</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded uppercase tracking-wider">
                  AI Image Nidan Active
                </span>
              </div>

              {!selectedImage ? (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl p-5 text-center cursor-pointer bg-slate-50/60 dark:bg-slate-900/40 transition-colors group relative overflow-hidden"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="w-11 h-11 mx-auto mb-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-100 dark:border-emerald-800">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t.uploadPrompt || 'Upload a clear photo of the skin lesion, rash, tongue, or joint swelling'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold">
                      {t.uploadHelpText || 'Supports JPG, PNG, WEBP • Auto-diagnosed in real-time'}
                    </p>
                  </div>

                  {/* 1-Click Clinical Preset Images Gallery */}
                  {clinicalImagePresets && clinicalImagePresets.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Or 1-click test with clinical photo presets:
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          (Click any image to auto-detect)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {clinicalImagePresets.map((preset) => (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setSelectedImage(preset.imageUrl);
                              if (!symptomText.trim()) {
                                setSymptomText(preset.symptoms);
                              }
                              setErrorMsg(null);
                              if (autoDetectEnabled) {
                                if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
                                runDiagnosis(symptomText.trim() || preset.symptoms, preset.imageUrl, true);
                              }
                            }}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 cursor-pointer transition-all group flex items-center gap-2"
                          >
                            <img
                              src={preset.imageUrl}
                              alt={preset.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block truncate">
                                {preset.tag || preset.category}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                                {preset.name.split('(')[0]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 max-h-64 flex items-center justify-center group">
                  <img
                    src={selectedImage}
                    alt="Uploaded clinical area"
                    className="max-h-64 w-auto object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#A3E635]" />
                    Visual Area Under Inspection
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> {t.changePhoto || 'Change Photo'}
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> {t.removePhoto || 'Remove'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                id="btn-analyze-diagnosis"
                onClick={handleManualAnalyze}
                disabled={isLoading}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200/50 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{t.analyzingText}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#A3E635]" />
                    <span>{result ? 'Re-run Ayurvedic Diagnosis' : t.analyzeButton}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {t.clearBtn}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pre-configured Clinical Cases for Immediate Demo (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t.classicalCasesHeading || '1-Click Classical Cases'}
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Instant Auto-Detect
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t.classicalCasesSubheading || 'Select a benchmark clinical case to immediately test the multilingual Ayurvedic diagnostic and RAG citation engine:'}
            </p>

            <div className="space-y-3">
              {sampleCases.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSampleClick(sample)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-all flex items-start gap-3 group"
                >
                  {sample.imageUrl && (
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                        {sample.category}
                      </span>
                      <span className="text-[9px] text-slate-400 group-hover:text-emerald-600 font-semibold">
                        Click to detect →
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                      {sample.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {sample.symptoms}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-2 transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
            </div>

            {/* Quick Ayurvedic Philosophy Callout */}
            <div className="mt-5 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs space-y-2">
              <div className="italic font-bold text-emerald-900 dark:text-emerald-200">
                {philosophy.verse}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                <em>{philosophy.source}</em>: {philosophy.meaning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div 
          ref={resultsRef}
          id="diagnostic-results-card" 
          className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8 animate-fadeIn scroll-mt-20"
        >
          {/* Result Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {result.severityLevel} Severity
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  AI Diagnostic Confidence: <strong className="text-slate-800 dark:text-slate-200">{result.confidenceScore}%</strong>
                </span>
                <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  System: <strong className="text-slate-800 dark:text-slate-200">{result.affectedBodySystem}</strong>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {result.diseaseName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-[#A3E635] mt-1">
                Classical Sanskrit Diagnosis (Roga Nidan): <strong>{result.sanskritName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintReport}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {t.downloadPdf}
              </button>
              <button
                onClick={onNavigateToClinics}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-200/50 dark:shadow-none transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                {t.bookConsultation}
              </button>
            </div>
          </div>

          {/* Diagnostic Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Clinical Assessment Summary & Etiology
            </h3>
            <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Darshana Pariksha: Visual Inspection & Lesion Analysis (When visual inspection or image is present) */}
          {(result.visualInspection || selectedImage || (result as any).imageUrl) && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-slate-900/40 to-slate-900/60 border border-emerald-500/30 dark:border-emerald-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-[#A3E635] flex items-center justify-center border border-emerald-500/30">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Darshana Pariksha (दर्शन परीक्षा - Visual Morphology Assessment)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 uppercase tracking-wider">
                        Image Nidan Verified
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Classical Ayurvedic visual inspection grounded in Charaka & Sushruta Samhita Nidanasthana
                    </p>
                  </div>
                </div>
                {result.visualInspection?.asthavidhaCategory && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-[#A3E635] bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    {result.visualInspection.asthavidhaCategory}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Visual Image Preview */}
                {(selectedImage || (result as any).imageUrl) && (
                  <div className="md:col-span-4 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-950 flex flex-col items-center relative group">
                    <img
                      src={selectedImage || (result as any).imageUrl}
                      alt="Analyzed anatomical area"
                      className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="w-full bg-black/80 px-3 py-1.5 text-[10px] text-emerald-300 font-mono flex items-center justify-between border-t border-emerald-500/20">
                      <span>Darshana Scan Target</span>
                      <span className="text-emerald-400 font-bold">100% Analyzed</span>
                    </div>
                  </div>
                )}

                {/* Structured Visual Findings Grid */}
                <div className={(selectedImage || (result as any).imageUrl) ? 'md:col-span-8 space-y-3' : 'md:col-span-12 space-y-3'}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Detected Anatomical Area / Srotas
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                       {result.visualInspection?.detectedOrganOrArea || result.affectedBodySystem || 'Not available'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Lesion Morphology & Pattern
                      </span>
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        {result.visualInspection?.morphology || 'Not available'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Coloration (Varna / Vaivarnya)
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {result.visualInspection?.coloration || 'Not available'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Recommended Clinical Speciality
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                       {result.recommendedSpeciality || 'Not available'}
                      </span>
                    </div>
                  </div>

                  {result.visualInspection?.darshanaParikshaNotes && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                      <strong className="text-emerald-900 dark:text-emerald-200 font-bold block mb-0.5">
                        Darshana Pariksha Clinical Observations:
                      </strong>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                        {result.visualInspection.darshanaParikshaNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tridosha Visualizer & Classical Citations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Tridosha Imbalance (5 Cols) */}
            <div className="md:col-span-5 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                  {t.doshaImbalance}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Primary: {result.doshaAssessment?.primaryImbalance || 'Pitta-Kapha'}
                </span>
              </div>

              {/* Dosha Progress Meters */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-sky-800 dark:text-sky-400">
                      <Wind className="w-3.5 h-3.5" /> Vata (Movement / Air & Ether)
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{result.doshaAssessment?.vata ?? 30}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-700"
                      style={{ width: `${result.doshaAssessment?.vata ?? 30}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-rose-800 dark:text-rose-400">
                      <Flame className="w-3.5 h-3.5" /> Pitta (Metabolism / Fire & Water)
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{result.doshaAssessment?.pitta ?? 40}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-700"
                      style={{ width: `${result.doshaAssessment?.pitta ?? 40}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
                      <Droplets className="w-3.5 h-3.5" /> Kapha (Structure / Earth & Water)
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{result.doshaAssessment?.kapha ?? 30}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${result.doshaAssessment?.kapha ?? 30}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 leading-relaxed">
                <strong>Prakriti Dynamics:</strong> {result.doshaAssessment?.explanation || 'Balanced doshic response to therapeutic regimen.'}
              </div>
            </div>

            {/* Classical Samhita Citations & Verification Protocol (7 Cols) */}
            <div className="md:col-span-7 bg-slate-50/70 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                  Classical Samhita Citations & References
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">
                  AYUSH Canonical Verification
                </span>
              </div>

              <div className="space-y-2.5">
                {((result as any).citations || (result as any).classicalReferences || []).map((ref: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {ref.sourceText || ref.text || 'Classical Samhita Reference'}
                      </span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {ref.chapterVerse || ref.ayushPharmacopoeiaRef || 'Canonical Ayush Ref'}
                      </span>
                    </div>
                    {(ref.originalSanskritOrRef || ref.sanskritVerse) && (
                      <div className="font-serif italic text-[11px] text-amber-900 dark:text-amber-200/90 mb-1">
                        "{ref.originalSanskritOrRef || ref.sanskritVerse}"
                      </div>
                    )}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ref.interpretation || ref.relevance || 'Classical therapeutic and diagnostic concordance.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Treatment Tabs: Shaman, Shodhan, Diet, Yoga */}
          {(() => {
            const remedies = (result as any).herbalRemedies || (result as any).recommendedRemedies || [];
            const panchakarmaList = (result as any).panchakarmaTherapies || [];
            const pathyaList = (result as any).dietLifestyle?.pathya || (result as any).dietaryGuidelines?.pathya || [];
            const apathyaList = (result as any).dietLifestyle?.apathya || (result as any).dietaryGuidelines?.apathya || [];
            const asanaList = (result as any).dietLifestyle?.yogaAsanas || (result as any).yogaAndLifestyle?.asanas || [];
            const lifestyleList = (result as any).dietLifestyle?.dinacharya || (result as any).yogaAndLifestyle?.lifestyleAdvice || [];

            return (
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveRemedyTab('shaman')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeRemedyTab === 'shaman'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    🌿 Shaman Aushadhi ({remedies.length} Formulations)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRemedyTab('shodhan')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeRemedyTab === 'shodhan'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    ✨ Shodhan & Panchakarma ({panchakarmaList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRemedyTab('diet')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeRemedyTab === 'diet'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    🍲 Pathya & Apathya Diet
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRemedyTab('yoga')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeRemedyTab === 'yoga'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    🧘 Yoga & Dinacharya
                  </button>
                </div>

                {/* Tab 1: Shaman Aushadhi */}
                {activeRemedyTab === 'shaman' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    {remedies.map((remedy: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {remedy.name}
                            </h4>
                            <span className="text-[11px] text-emerald-700 dark:text-[#A3E635] font-semibold">
                              {remedy.sanskritName || remedy.form || 'Ayurvedic Form'} • {remedy.dosage}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {remedy.timing}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>Anupana (Vehicle):</strong> {remedy.anupana}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          <strong>Classical Action:</strong> {remedy.therapeuticAction || remedy.rationale || 'Deepana, Pachana, and Dosha-shaman'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: Panchakarma */}
                {activeRemedyTab === 'shodhan' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    {panchakarmaList.map((therapy: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {therapy.procedure || therapy.name}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            {therapy.frequency || therapy.duration || 'As directed'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {therapy.description}
                        </p>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          <strong>Setting / Precaution:</strong> {therapy.precaution || therapy.administeredBy || 'Under clinical supervision of Vaidya'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Diet (Pathya / Apathya) */}
                {activeRemedyTab === 'diet' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ✓ Pathya (Wholesome & Recommended Foods)
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {pathyaList.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-3">
                      <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        ✕ Apathya (Strictly Prohibited & Aggravating Foods)
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {apathyaList.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tab 4: Yoga & Lifestyle */}
                {activeRemedyTab === 'yoga' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Recommended Yoga Asanas & Pranayama
                      </h4>
                      <div className="space-y-2">
                        {asanaList.map((asana: any, idx: number) => (
                          <div key={idx} className="text-xs">
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                              {asana.asana || asana.name}
                            </span>: <span className="text-slate-600 dark:text-slate-400">{asana.benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Dinacharya (Daily Lifestyle Protocols)
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {lifestyleList.map((advice: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{advice}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Red Flag Warning Box */}
          {result.redFlags && result.redFlags.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Clinical Red Flags & Safety Advisory</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                If you experience {result.redFlags.join(', ')}, please seek immediate physical emergency medical attention.
              </p>
            </div>
          )}

          {/* Licensed Vaidya Verification Protocol Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Assessment verified against <strong>NCISM Registered Clinical Protocol</strong> • Case ID: <strong className="font-mono">{(result as any).id || (result as any).assessmentId || 'NIDAN-AYU-84920'}</strong>
              </span>
            </div>
            <button
              onClick={onNavigateToClinics}
              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Consult a Nearby Licensed Vaidya <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
