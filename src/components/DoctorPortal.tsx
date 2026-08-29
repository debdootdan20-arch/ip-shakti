import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, ShieldCheck, Stethoscope, CheckCircle2, 
  Clock, Edit3, Check, Plus, Trash2, Search, UserCheck, 
  Building, IndianRupee, FileText, Activity, Utensils, 
  Sparkles, Calendar, AlertCircle, RefreshCw, Send,
  Download, Printer, Globe, Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  DoctorPrescription, 
  PrescriptionMedicine, 
  SupportedLanguage, 
  DiseaseAssessmentResult 
} from '../types';
import { translations } from '../i18n/translations';
import { getPendingCases, APP_IMAGES } from '../data/ayurvedaData';
import { PrescriptionPdfModal } from './PrescriptionPdfModal';
import { LANGUAGE_LABELS } from '../utils/prescriptionPdf';

const DEFAULT_DOCTORS = [
  {
    id: 'usr_dr_ananya',
    username: 'dr_ananya',
    name: 'Dr. Ananya Mukherjee, MD (Ayu)',
    qualification: 'BAMS, MD (Ayurveda) - Gold Medalist',
    registrationNumber: 'WB-AYU-2018-9481 / CCIM-84920',
    clinicName: 'Sanjeevani Ayurvedic Chikitsalaya & Panchakarma Kendra',
    clinicAddress: 'Block CF-32, Sector 1, Salt Lake City, Kolkata - 700064',
    consultationFee: '₹800',
    specialization: 'Kayachikitsa & Chronic Metabolic Disorders',
  },
  {
    id: 'usr_dr_aravind',
    username: 'dr_aravind',
    name: 'Dr. Aravind Shastri, MD (Panchakarma)',
    qualification: 'BAMS, MD (Panchakarma), PhD (Ayu)',
    registrationNumber: 'KA-AYU-2015-11029',
    clinicName: 'Kairali Ayurvaidya Research & Panchakarma Hospital',
    clinicAddress: '100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038',
    consultationFee: '₹1200',
    specialization: 'Panchakarma, Sandhivata & Neuro-muscular Disorders',
  },
];

interface DoctorPortalProps {
  currentUser: UserProfile | null;
  language: SupportedLanguage;
  latestAssessment?: DiseaseAssessmentResult | null;
  onPrescriptionCreated?: (prescription: DoctorPrescription) => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  currentUser,
  language,
  latestAssessment,
  onPrescriptionCreated,
}) => {
  const t = translations[language] || translations.en;
  const [activeTab, setActiveTab] = useState<'create_rx' | 'review_queue' | 'history'>('create_rx');

  // Doctor Identity State (strictly separated from Patient)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    currentUser?.role === 'doctor' ? (currentUser.id || 'usr_dr_ananya') : 'usr_dr_ananya'
  );

  const activeDoctor = useMemo(() => {
    if (currentUser && currentUser.role === 'doctor') {
      return {
        id: currentUser.id,
        username: currentUser.username || 'doctor',
        name: currentUser.name || 'Dr. Ananya Mukherjee, MD (Ayu)',
        qualification: currentUser.qualification || 'BAMS, MD (Ayurveda)',
        registrationNumber: currentUser.registrationNumber || 'WB-AYU-2018-9481',
        clinicName: currentUser.clinicName || 'Sanjeevani Ayurvedic Chikitsalaya',
        clinicAddress: currentUser.clinicAddress || 'Salt Lake City, Kolkata',
        consultationFee: currentUser.consultationFee || '₹800',
        specialization: currentUser.specialization || 'Ayurvedic Kayachikitsa',
      };
    }
    return DEFAULT_DOCTORS.find((d) => d.id === selectedDoctorId) || DEFAULT_DOCTORS[0];
  }, [currentUser, selectedDoctorId]);

  // Patient Lookup State
  const [patientUsernameQuery, setPatientUsernameQuery] = useState('debdoot');
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [foundPatient, setFoundPatient] = useState<any>(null);
  const [lookupError, setLookupError] = useState('');

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('Amavata (Sandhigata Vata & Ama Accumulation)');
  const [sanskritRogaNidan, setSanskritRogaNidan] = useState('आमवात निदान (साम वात-कफ प्रकोप जन्य सन्धि शोथ)');
  const [vataVal, setVataVal] = useState(55);
  const [pittaVal, setPittaVal] = useState(25);
  const [kaphaVal, setKaphaVal] = useState(20);
  const [nadiNotes, setNadiNotes] = useState('Manda-Sarpa Nadi with Guru & Picchila lakshana in morning examination.');
  const [clinicalNotes, setClinicalNotes] = useState('Patient presents with early morning stiffness and reduced Agni. Strictly follow Pathya Ahara.');
  const [followUpDays, setFollowUpDays] = useState('14');

  // Medicines List
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      id: 'med-1',
      name: 'Simhanada Guggulu',
      sanskritName: 'सिंहनाद गुग्गुलु',
      form: 'Vati / Tablet',
      dosage: '2 Tablets (500mg each)',
      timing: 'Twice daily after meals (Vyana Kala)',
      anupana: 'Warm water or Dashamula Kwatha',
      duration: '21 Days',
      instructions: 'Digests Ama and relieves joint stiffness.',
    },
    {
      id: 'med-2',
      name: 'Maharasnadi Kwatha',
      sanskritName: 'महारास्नादि क्वाथ',
      form: 'Kwatha / Decoction',
      dosage: '20 ml diluted with 20 ml warm water',
      timing: 'Morning & Evening on empty stomach',
      anupana: 'Warm water with pinch of Pippali Churna',
      duration: '30 Days',
      instructions: 'Pacifies Vata dosha and strengthens osteoarticular tissue.',
    },
  ]);

  // Food Chart Routine State
  const [breakfast, setBreakfast] = useState('Warm Spiced Oatmeal or Moong Dal Cheela with fresh ginger-cumin tea.');
  const [lunch, setLunch] = useState('Steamed Shashtika Shali rice or Barley (Yava) roti with boiled Lauki/Parwal soup, Takra (buttermilk) with roasted cumin.');
  const [eveningSnack, setEveningSnack] = useState('Roasted Makhana with a pinch of dry ginger (Shunti) and herbal cinnamon infusion.');
  const [dinner, setDinner] = useState('Moong Dal Khichdi seasoned with pure Ghee, Hing, and black pepper. Must be completed before 7:30 PM.');
  const [pathyaText, setPathyaText] = useState('Horsegram (Kulatta) soup, Dry Ginger, Garlic in moderate cooking, Bitter gourd (Karela), Boiled warm water.');
  const [apathyaText, setApathyaText] = useState('Curd at night, cold iced beverages, deep-fried snacks, Maida, daytime sleep, direct cold AC drafts.');
  const [hydrationGuideline, setHydrationGuideline] = useState('2.5 Liters of lukewarm water infused with dry ginger powder (Shunti Jal) throughout the day.');

  // Yoga Routine State
  const [yogaTime, setYogaTime] = useState('Early Morning (Brahma Muhurta - 6:00 AM) on empty stomach');
  const [asanas, setAsanas] = useState([
    {
      name: 'Pavanamuktasana (Wind Relieving Pose)',
      sanskritName: 'पवनमुक्तासन',
      duration: '5 minutes',
      benefit: 'Eliminates trapped Koshta Vata and eases lumbar pressure.',
      instructions: 'Lie on back, hug knees gently without straining, breathe deeply.',
    },
    {
      name: 'Vajrasana (Thunderbolt Pose)',
      sanskritName: 'वज्रासन',
      duration: '10 minutes after lunch & dinner',
      benefit: 'Stimulates digestive Jatharagni and digests metabolic Ama.',
      instructions: 'Kneel with toes touching and sit back comfortably on heels.',
    },
  ]);
  const [pranayamas, setPranayamas] = useState([
    {
      technique: 'Nadi Shodhana (Alternate Nostril Breathing)',
      duration: '10 minutes daily',
      instructions: 'Inhale left nostril 4 counts, exhale right 4 counts in peaceful rhythm.',
    },
    {
      technique: 'Bhastrika (Gentle Pace)',
      duration: '3 rounds of 15 breaths',
      instructions: 'Agni Deepana action to awaken metabolic digestive fire.',
    },
  ]);
  const [yogaPrecautions, setYogaPrecautions] = useState('Avoid violent high-impact jumping during acute joint swelling. Stop if sharp knee pain arises.');

  // Review Queue State
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const [isQueueCaseVerified, setIsQueueCaseVerified] = useState(false);
  const pendingCases = useMemo(
    () => getPendingCases(language, latestAssessment),
    [language, latestAssessment]
  );
  const currentCase = useMemo(
    () => pendingCases.find((c) => c.id === selectedCaseId) || pendingCases[0],
    [pendingCases, selectedCaseId]
  );
  const [queueDoctorNotes, setQueueDoctorNotes] = useState(currentCase?.defaultDoctorNotes || '');

  // Submissions and History State
  const [issuedPrescriptions, setIssuedPrescriptions] = useState<DoctorPrescription[]>([]);
  const [latestIssuedRx, setLatestIssuedRx] = useState<DoctorPrescription | null>(null);
  const [submittingRx, setSubmittingRx] = useState(false);
  const [rxSuccessMsg, setRxSuccessMsg] = useState('');

  // PDF Preview & Download Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfRxToView, setPdfRxToView] = useState<DoctorPrescription | null>(null);

  // Initial Patient Lookup on mount
  useEffect(() => {
    handleSearchPatient('debdoot');
    fetchDoctorPrescriptionsHistory();
  }, []);

  const handleSearchPatient = async (targetUsername?: string) => {
    const q = (targetUsername || patientUsernameQuery).trim().toLowerCase();
    if (!q) return;

    setSearchingPatient(true);
    setLookupError('');
    try {
      const res = await fetch(`/api/users/patient/${q}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Patient '${q}' not found`);
      }
      setFoundPatient(data);
    } catch (err: any) {
      setFoundPatient(null);
      setLookupError(err.message || 'Patient not found in registry');
    } finally {
      setSearchingPatient(false);
    }
  };

  const fetchDoctorPrescriptionsHistory = async () => {
    const docId = currentUser?.id || 'usr_dr_ananya';
    try {
      const res = await fetch(`/api/prescriptions/doctor/${docId}`);
      const data = await res.json();
      if (data.prescriptions) {
        setIssuedPrescriptions(data.prescriptions);
      }
    } catch (e) {}
  };

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: 'med-' + Date.now(),
        name: 'Avipattikar Churna',
        sanskritName: 'अविपत्तिकर चूर्ण',
        form: 'Churna (Herbal Powder)',
        dosage: '1 Teaspoon (3g)',
        timing: 'Before meals (Pragbhakta)',
        anupana: 'Lukewarm Water',
        duration: '15 Days',
        instructions: 'Take 20 mins prior to lunch and dinner.',
      },
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof PrescriptionMedicine, val: string) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleAddAsana = () => {
    setAsanas([
      ...asanas,
      {
        name: 'Bhujangasana (Cobra Pose)',
        sanskritName: 'भुजङ्गासन',
        duration: '3-5 rounds',
        benefit: 'Opens thoracic cage and tones abdominal organs.',
        instructions: 'Inhale gently lifting chest, keep shoulders relaxed away from ears.',
      },
    ]);
  };

  const handleRemoveAsana = (idx: number) => {
    setAsanas(asanas.filter((_, i) => i !== idx));
  };

  const handleIssuePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundPatient) {
      setLookupError('Please find and select a registered patient before issuing prescription.');
      return;
    }

    setSubmittingRx(true);
    setRxSuccessMsg('');

    const doctorName = activeDoctor.name;
    const clinic = activeDoctor.clinicName;
    const clinicAddr = activeDoctor.clinicAddress;
    const fee = activeDoctor.consultationFee;
    const regNo = activeDoctor.registrationNumber;
    const qual = activeDoctor.qualification;
    const doctorId = activeDoctor.id;
    const doctorUsername = activeDoctor.username;

    const followUpDateStr = new Date(
      Date.now() + (parseInt(followUpDays) || 14) * 86400000
    ).toISOString().split('T')[0];

    const payload = {
      patientUsername: foundPatient.username,
      patientName: foundPatient.name,
      patientPhone: foundPatient.phone,
      patientAddress: foundPatient.address,
      patientAge: foundPatient.age || 28,
      patientGender: foundPatient.gender || 'male',
      doctorId,
      doctorUsername,
      doctorName,
      doctorQualification: qual,
      doctorRegistrationNo: regNo,
      clinicName: clinic,
      clinicAddress: clinicAddr,
      consultationFee: fee,
      diagnosis,
      sanskritRogaNidan,
      doshaImbalance: {
        vata: vataVal,
        pitta: pittaVal,
        kapha: kaphaVal,
        dominant: vataVal >= pittaVal && vataVal >= kaphaVal ? 'Vata Pradhana' : pittaVal >= kaphaVal ? 'Pitta Pradhana' : 'Kapha Pradhana',
      },
      nadiParikshaNotes: nadiNotes,
      clinicalNotes,
      medicines,
      foodChart: {
        breakfast,
        lunch,
        eveningSnack,
        dinner,
        pathya: pathyaText.split(',').map((s) => s.trim()).filter(Boolean),
        apathya: apathyaText.split(',').map((s) => s.trim()).filter(Boolean),
        hydrationGuideline,
      },
      yogaRoutine: {
        asanas,
        pranayama: pranayamas,
        preferredTime: yogaTime,
        precautions: [yogaPrecautions],
      },
      lifestyleNotes: [
        'Follow regular sleep and wake up timings (Dinacharya).',
        'Avoid conflicting food combinations (Viruddha Ahara).',
        'Follow up with doctor on scheduled date.',
      ],
      followUpDate: followUpDateStr,
    };

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue prescription');
      }

      setLatestIssuedRx(data.prescription);
      setRxSuccessMsg(`Prescription ${data.prescription.prescriptionNumber} successfully generated, digitally stamped, and broadcast to patient @${foundPatient.username}!`);
      
      if (onPrescriptionCreated) {
        onPrescriptionCreated(data.prescription);
      }

      fetchDoctorPrescriptionsHistory();

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#84cc16', '#d97706'],
        });
      } catch (err) {}
    } catch (err: any) {
      setLookupError(err.message || 'Error issuing prescription');
    } finally {
      setSubmittingRx(false);
    }
  };

  const handleQueueSignAndVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsQueueCaseVerified(true);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#d97706'],
      });
    } catch (err) {}
  };

  const handleOpenPdf = (rx: DoctorPrescription) => {
    setPdfRxToView(rx);
    setIsPdfModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner with Doctor Details & Clinic Fees */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-500/20 dark:border-emerald-500/30 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src={APP_IMAGES.doctorConsultation}
            alt="Doctor Consultation Banner"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative p-6 sm:p-8 max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-lime-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 backdrop-blur-sm">
              <Award className="w-3.5 h-3.5 text-lime-400" />
              {t.practitionerVerification || 'Ayurvedic Doctor Clinical Portal'}
            </div>

            {/* Clinic Consultation Fee Badge & Doctor Selector */}
            <div className="flex items-center gap-2">
              {currentUser?.role !== 'doctor' && (
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-emerald-500/40 text-xs">
                  <span className="text-[10px] text-slate-400 pl-2">Doctor:</span>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="bg-emerald-950 text-lime-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/50 focus:outline-none cursor-pointer"
                  >
                    <option value="usr_dr_ananya">Dr. Ananya Mukherjee (Kolkata - ₹800)</option>
                    <option value="usr_dr_aravind">Dr. Aravind Shastri (Bengaluru - ₹1200)</option>
                  </select>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-400/40 text-xs font-bold text-lime-300 shadow-sm backdrop-blur-sm">
                <IndianRupee className="w-3.5 h-3.5 text-lime-400" />
                <span>{t.consultationLabel || 'Fee:'} <strong>{activeDoctor.consultationFee}</strong></span>
              </div>
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-50 mb-2 tracking-tight">
            {t.doctorVerificationTitle || 'Vaidya Clinical Governance & Prescription Sync Portal'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed mb-6">
            {t.doctorPortalSubtitle || 'Prescribe tailored Ayurvedic Aushadhi (medicines), custom Ahara (food charts), and Yoga/Exercise routines to patients by their registered username. Patients instantly receive and synchronize their treatment plans in their selected native language.'}
          </p>

          {/* Active Doctor License Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-emerald-500/30 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-white shrink-0">
                <Stethoscope className="w-5 h-5 text-lime-300" />
              </div>
              <div>
                <span className="text-[10px] text-lime-400 font-bold uppercase tracking-wider block">
                  {t.treatingVaidyaPractitioner || 'Treating Vaidya Practitioner'}
                </span>
                <div className="font-bold text-emerald-300 text-sm">{activeDoctor.name}</div>
                <div className="text-slate-300 text-[11px]">{activeDoctor.qualification}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Building className="w-4 h-4 text-lime-400 shrink-0" />
              <div>
                <span className="block font-bold text-white text-[11px]">
                  {activeDoctor.clinicName}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {activeDoctor.clinicAddress}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block font-bold text-white text-[11px]">State / CCIM License:</span>
                <span className="text-[10px] text-emerald-300 font-mono">
                  {activeDoctor.registrationNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-xl p-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('create_rx')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'create_rx'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          {t.tabCreateRx || 'Create Patient Prescription & Routine'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('review_queue')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'review_queue'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          {t.tabReviewQueue || 'Clinical Assessment Queue'} ({pendingCases.length})
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('history'); fetchDoctorPrescriptionsHistory(); }}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-emerald-800 text-white shadow-md'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          {t.tabRxHistory || 'Issued Prescriptions Record'} ({issuedPrescriptions.length})
        </button>
      </div>

      {/* TAB 1: CREATE PRESCRIPTION & DIET / YOGA ROUTINE */}
      {activeTab === 'create_rx' && (
        <form onSubmit={handleIssuePrescription} className="space-y-6">
          {/* Step 1: Doctor & Patient Identification (Strict Separation) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Step 1: Treating Doctor &amp; Patient Identification
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Verify the Prescribing Doctor credentials and search the registered Patient to link digital prescriptions.
              </p>
            </div>

            {/* Doctor & Patient Two Cards Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prescribing Doctor Card */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {t.treatingVaidyaPractitioner || 'Prescribing Doctor (Vaidya)'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-lime-300 font-bold">
                    Reg: {activeDoctor.registrationNumber}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-sm text-emerald-200">{activeDoctor.name}</div>
                  <div className="text-[11px] text-slate-300">{activeDoctor.qualification}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Building className="w-3 h-3 text-lime-400 shrink-0" />
                    <span className="truncate">{activeDoctor.clinicName}</span>
                  </div>
                  <div className="text-[10px] text-lime-300 mt-0.5 font-semibold">
                    {t.consultationLabel || 'Consultation Fee:'} {activeDoctor.consultationFee}
                  </div>
                </div>
              </div>

              {/* Patient Lookup & Identity Card */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    {t.patientRecord || 'Recipient Patient Details'}
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-stone-400">Sample:</span>
                    <button
                      type="button"
                      onClick={() => { setPatientUsernameQuery('debdoot'); handleSearchPatient('debdoot'); }}
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      @debdoot
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      type="button"
                      onClick={() => { setPatientUsernameQuery('rajesh_sharma'); handleSearchPatient('rajesh_sharma'); }}
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      @rajesh
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={patientUsernameQuery}
                      onChange={(e) => setPatientUsernameQuery(e.target.value)}
                      placeholder="Patient username (e.g. debdoot)"
                      className="w-full pl-8 pr-2 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchPatient()}
                    disabled={searchingPatient}
                    className="py-1.5 px-3 rounded-lg bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {searchingPatient ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    Search
                  </button>
                </div>

                {lookupError && (
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {lookupError}
                  </div>
                )}

                {foundPatient && (
                  <div className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-950 dark:text-emerald-200 text-xs">{foundPatient.name}</span>
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">@{foundPatient.username}</span>
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-300 flex flex-wrap gap-x-3">
                      <span><strong>Age:</strong> {foundPatient.age || 28} Yrs ({foundPatient.gender || 'Male'})</span>
                      <span><strong>Prakriti:</strong> {foundPatient.prakriti || 'Pitta-Kapha'}</span>
                      <span><strong>Phone:</strong> {foundPatient.phone || '+91 98301 23456'}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                      <strong>Address:</strong> {foundPatient.address || 'Kolkata, WB'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Roga Nidan & Dosha Assessment */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Step 2: {t.rogaNidanDiagnosis || 'Ayurvedic Diagnosis (Roga Nidan) & Nadi Pariksha'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Primary Clinical Diagnosis (Standard) *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Amavata (Rheumatoid Sandhigata Vata)"
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Classical Sanskrit Roga Nidan (Samhita Reference)
                </label>
                <input
                  type="text"
                  value={sanskritRogaNidan}
                  onChange={(e) => setSanskritRogaNidan(e.target.value)}
                  placeholder="e.g. आमवात निदान (साम वात-कफ प्रकोप)"
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white font-serif"
                />
              </div>
            </div>

            {/* Dosha Imbalance Sliders */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-3">
              <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {t.tridoshaImbalanceQuant || 'Tridosha Aggravation Ratio (%):'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-sky-700 dark:text-sky-400">Vata Dosha:</span>
                    <span>{vataVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={vataVal}
                    onChange={(e) => setVataVal(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-amber-700 dark:text-amber-400">Pitta Dosha:</span>
                    <span>{pittaVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={pittaVal}
                    onChange={(e) => setPittaVal(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-emerald-700 dark:text-emerald-400">Kapha Dosha:</span>
                    <span>{kaphaVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={kaphaVal}
                    onChange={(e) => setKaphaVal(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t.nadiParikshaPulseTitle || 'Nadi Pariksha (Pulse Diagnosis) Observations'}
                </label>
                <textarea
                  rows={2}
                  value={nadiNotes}
                  onChange={(e) => setNadiNotes(e.target.value)}
                  placeholder="Enter pulse rhythm, tongue coating (Jihwa), and digestive fire status..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t.doctorClinicalNotesTitle || 'Doctor Clinical Guidance Notes'}
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Special instructions for patient regarding seasonal regimens and precautions..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Aushadhi (Medicines) Formulation Builder */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Step 3: {t.prescribedMedicinesTitle || 'Aushadhi (Ayurvedic Formulations)'}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Prescribe classical formulations with specific Anupana (vehicle), dosage, and timing.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddMedicine}
                className="py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Medicine #{idx + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-800 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Medicine Name</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Sanskrit / Classical Name</label>
                      <input
                        type="text"
                        value={med.sanskritName || ''}
                        onChange={(e) => handleUpdateMedicine(med.id, 'sanskritName', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Form</label>
                      <input
                        type="text"
                        value={med.form}
                        onChange={(e) => handleUpdateMedicine(med.id, 'form', e.target.value)}
                        placeholder="e.g. Vati, Churna, Kwatha, Asava"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Dosage</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(med.id, 'dosage', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Timing (Kala)</label>
                      <input
                        type="text"
                        value={med.timing}
                        onChange={(e) => handleUpdateMedicine(med.id, 'timing', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Anupana (Vehicle)</label>
                      <input
                        type="text"
                        value={med.anupana}
                        onChange={(e) => handleUpdateMedicine(med.id, 'anupana', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedicine(med.id, 'duration', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ahara (Personalized Food Chart Routine) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" />
              Step 4: {t.foodChartTitle || 'Ahara (Personalized Food Chart Routine)'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">{t.breakfastLabel || 'Breakfast (Pratah Ahara)'}</label>
                <textarea
                  rows={2}
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">{t.lunchLabel || 'Lunch (Madhyahna Ahara)'}</label>
                <textarea
                  rows={2}
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">{t.eveningSnackLabel || 'Evening Beverage / Rejuvenation'}</label>
                <textarea
                  rows={2}
                  value={eveningSnack}
                  onChange={(e) => setEveningSnack(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">{t.dinnerLabel || 'Dinner (Ratri Ahara)'}</label>
                <textarea
                  rows={2}
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                  ✓ {t.pathyaLabel || 'Pathya (Recommended Foods - comma separated)'}
                </label>
                <textarea
                  rows={2}
                  value={pathyaText}
                  onChange={(e) => setPathyaText(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-rose-800 dark:text-rose-300 mb-1">
                  ✕ {t.apathyaLabel || 'Apathya (Foods to Avoid - comma separated)'}
                </label>
                <textarea
                  rows={2}
                  value={apathyaText}
                  onChange={(e) => setApathyaText(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Yoga & Vyayama Routine Builder */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Step 5: {t.yogaPranayamaTitle || 'Yoga, Pranayama & Lifestyle'}
              </h2>
              <button
                type="button"
                onClick={handleAddAsana}
                className="py-1 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Asana
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Preferred Practice Timing
                </label>
                <input
                  type="text"
                  value={yogaTime}
                  onChange={(e) => setYogaTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Precautions &amp; Contraindications
                </label>
                <input
                  type="text"
                  value={yogaPrecautions}
                  onChange={(e) => setYogaPrecautions(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Submission, PDF Generation and Follow-up Schedule Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Next Follow-up In (Days)
                </label>
                <select
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl dark:text-white text-xs font-semibold cursor-pointer"
                >
                  <option value="7">7 Days (1 Week)</option>
                  <option value="14">14 Days (2 Weeks)</option>
                  <option value="21">21 Days (3 Weeks)</option>
                  <option value="30">30 Days (1 Month)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Session Fee Billed
                </label>
                <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl font-bold text-emerald-800 dark:text-lime-300 text-xs">
                  {activeDoctor.consultationFee} (Clinic Standard)
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Digital Practitioner Seal
                </label>
                <div className="px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl font-mono text-[11px] text-stone-600 dark:text-stone-400 truncate">
                  {activeDoctor.registrationNumber} • AYUSH Certified
                </div>
              </div>
            </div>

            {rxSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-950 text-white text-center space-y-3 animate-fadeIn border border-emerald-500/40">
                <div className="inline-flex items-center gap-2 text-lime-300 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  Prescription Issued &amp; Live-Synced Successfully!
                </div>
                <p className="text-xs text-slate-300 max-w-xl mx-auto">
                  {rxSuccessMsg}
                </p>
                {latestIssuedRx && (
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPdf(latestIssuedRx)}
                      className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download / Print Selectable PDF for Patient
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="submit-issue-prescription-btn"
                type="submit"
                disabled={submittingRx || !foundPatient}
                className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-lime-300" />
                {submittingRx ? 'Stamping & Broadcasting...' : (t.endorseButton || 'Digitally Stamp & Issue Prescription to Patient')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: CLINICAL ASSESSMENT QUEUE */}
      {activeTab === 'review_queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                {t.pendingCasesTitle || 'Pending Patient Queue'}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/40">
                {pendingCases.length} Cases
              </span>
            </div>

            <div className="space-y-3">
              {pendingCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseId(c.id);
                    setIsQueueCaseVerified(false);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedCaseId === c.id
                      ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-2xs'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 bg-stone-50 dark:bg-stone-800/50'
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

          <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                {t.doctorVerificationSubtitle || 'Clinical Case Review & AYUSH Compliance'}
              </h2>
              <span className="text-xs text-stone-400 font-mono">Case #{selectedCaseId}</span>
            </div>

            <form onSubmit={handleQueueSignAndVerify} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t.doctorNotesLabel || 'Practitioner Diagnostic Notes & Nadi Findings:'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={queueDoctorNotes}
                  onChange={(e) => setQueueDoctorNotes(e.target.value)}
                  placeholder="Enter clinical examination notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  Official AYUSH Declarations:
                </div>
                <div className="space-y-1.5 text-stone-700 dark:text-stone-300 text-[11px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Adheres to AYUSH Schedule E-1 standards &amp; classical Samhita pharmacology.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dosage calculations adjusted for patient age and Agni bala.</span>
                  </div>
                </div>
              </div>

              {!isQueueCaseVerified ? (
                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-lime-300" />
                  {t.doctorVerifyButton || 'Sign Off Case with Official Seal'}
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-950 text-white text-center space-y-2 animate-fadeIn border border-emerald-500/40">
                  <div className="inline-flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Check className="w-5 h-5 text-lime-400" />
                    {t.verifiedSuccessText || 'Official Practitioner Seal Applied'}
                  </div>
                  <p className="text-xs text-slate-300">
                    Clinical record verified by {activeDoctor.name}.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: ISSUED PRESCRIPTIONS RECORD */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Issued Prescriptions Ledger
            </h2>
            <button
              type="button"
              onClick={fetchDoctorPrescriptionsHistory}
              className="py-1 px-3 rounded-lg border border-stone-300 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {issuedPrescriptions.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              No prescriptions issued yet. Use Tab 1 to create your first prescription.
            </div>
          ) : (
            <div className="space-y-4">
              {issuedPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        {rx.prescriptionNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Date: {rx.date} • Follow-up: {rx.followUpDate || '14 Days'}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenPdf(rx)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        Download / Print PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Patient</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{rx.patientName}</span>
                      <span className="font-mono text-[10px] text-emerald-600 block">@{rx.patientUsername}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Diagnosis</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{rx.diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Session Fee</span>
                      <span className="font-bold text-emerald-700 dark:text-lime-400">{rx.consultationFee}</span>
                    </div>
                  </div>

                  {/* Medicines summary pills */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {rx.medicines?.map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                      >
                        💊 {m.name} ({m.dosage})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selectable Vector PDF Generator Modal for Doctor */}
      <PrescriptionPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        prescription={pdfRxToView}
        initialLanguage={language}
        doctorViewMode={true}
      />
    </div>
  );
};
