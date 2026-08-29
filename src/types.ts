export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'kn' | 'mr';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export interface DoshaScore {
  vata: number; // percentage 0-100
  pitta: number;
  kapha: number;
  primaryImbalance: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridosha';
  explanation: string;
}

export interface ClassicalCitation {
  sourceText: string; // e.g., "Charaka Samhita, Chikitsa Sthana Ch. 7, Shloka 14"
  originalSanskritOrRef: string;
  interpretation: string;
  ayushPharmacopoeiaRef?: string;
  tkdlRef?: string;
}

export interface HerbalRemedy {
  name: string;
  sanskritName?: string;
  botanicalName?: string;
  form: string; // Vati, Churna, Kwath, Taila, Asava-Arishta, Lepa
  dosage: string;
  anupana: string; // Vehicle (e.g. Warm water, Honey, Ghee, Milk)
  timing: string; // Before food, After food, Bedtime
  therapeuticAction: string;
  contraindications?: string[];
}

export interface PanchakarmaTherapy {
  procedure: string; // Abhyanga, Swedana, Virechana, Nasya, Basti, Shirodhara
  description: string;
  frequency: string;
  precaution: string;
}

export interface DietLifestylePlan {
  pathya: string[]; // Recommended foods
  apathya: string[]; // Restricted / Forbidden foods
  dinacharya: string[]; // Daily regimen tips
  yogaAsanas: {
    asana: string;
    benefit: string;
    caution?: string;
  }[];
  pranayama: string[];
}

export interface PractitionerVerification {
  isVerified: boolean;
  practitionerName: string;
  qualification: string;
  registrationNumber: string;
  councilName: string;
  clinicalNotes: string;
  verificationTimestamp: string;
  signatureBadgeUrl?: string;
  status: 'pending_review' | 'verified_licensed' | 'self_assessment_ai';
}

export interface VisualInspectionDetails {
  detectedOrganOrArea?: string;
  morphology?: string;
  coloration?: string;
  darshanaParikshaNotes?: string;
  asthavidhaCategory?: string; // Jihwa (Tongue), Tvak (Skin), Netra (Eyes), Nakha (Nails), Sandhi (Joints)
}

export interface DiseaseAssessmentResult {
  id: string;
  timestamp: string;
  diseaseName: string;
  sanskritName: string; // Roga Nidan e.g., Vicharchika, Amlapitta, Sandhivata
  severityLevel: 'Mild' | 'Moderate' | 'Severe' | 'Urgent Attention';
  confidenceScore: number; // 0 - 100
  affectedBodySystem: string;
  summary: string;
  doshaAssessment: DoshaScore;
  citations: ClassicalCitation[];
  herbalRemedies: HerbalRemedy[];
  panchakarmaTherapies: PanchakarmaTherapy[];
  dietLifestyle: DietLifestylePlan;
  redFlags: string[]; // Emergency warning signs
  practitionerVerification: PractitionerVerification;
  recommendedSpeciality: string;
  imageUrl?: string;
  visualInspection?: VisualInspectionDetails;
}

export interface Clinic {
  id: string;
  name: string;
  type: 'Government Ayurvedic Hospital' | 'Panchakarma Center' | 'AYUSH Wellness Clinic' | 'Private Vaidya Chamber' | string;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  state: string;
  distanceKm?: number;
  leadVaidya: string;
  qualification: string;
  regNumber: string;
  phone: string;
  timing: string;
  consultationFee: string;
  services: string[];
  nabhAccredited: boolean;
  image: string;
}

export interface IPPatentAnalysis {
  id: string;
  inventionTitle: string;
  formulationOrProcess: string;
  targetIndication: string;
  timestamp: string;
  overallPatentabilityRating: 'High Patentability' | 'Moderate (Section 3p Risk)' | 'Low (Direct TKDL Match)' | 'Needs Synergistic Data';
  noveltyScore: number; // 0 - 100
  inventiveStepScore: number; // 0 - 100
  tkdlPriorArtRisk: {
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    knownTraditionalUsesFound: string[];
    relevantTKDLClassifications: string[];
    classicalTextsCitingComponents: string[];
  };
  section3pHurdleAnalysis: {
    isTraditionalKnowledge: boolean;
    statutoryProvision: string; // Section 3(p) / Section 3(d) / Section 3(e)
    overcomingStrategy: string;
    synergisticProofRequired: string;
  };
  nbaAbsCompliance: {
    requiresNBAApproval: boolean;
    actReference: string; // Biological Diversity Act, 2002 (Sec 3 & 4)
    exemptionsApplicable: string;
    stepByStepProcess: string[];
  };
  globalRegulatoryPathways: {
    regime: string; // "India (AYUSH/FSSAI)", "USA (FDA 21 CFR 111 / 312)", "EU (EMA HMPC)", "UK (MHRA)"
    classification: string;
    clinicalTrialRequirement: string;
    manufacturingStandard: string;
    documentationChecklist: string[];
  }[];
  draftPatentClaims: {
    claimNumber: number;
    claimType: 'Independent' | 'Dependent';
    claimText: string;
  }[];
  patentDraftSummary: {
    abstract: string;
    backgroundAndTKDLDifferentiation: string;
    synergisticRatioClaims: string;
    extractionNovelty: string;
    industrialApplicability: string;
  };
}

export interface RAGMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: {
    title: string;
    statuteOrDoc: string;
    section: string;
    summary: string;
    url?: string;
  }[];
  regulatoryMatrix?: {
    country: string;
    body: string;
    standard: string;
    keyRule: string;
  }[];
}

export interface HerbKnowledgeEntry {
  id: string;
  sanskritName: string;
  englishName: string;
  botanicalName: string;
  family: string;
  rasa: string[]; // Taste (Madhura, Amla, Lavana, Tikta, Katu, Kashaya)
  guna: string[]; // Quality (Laghu, Guru, Ruksha, Snigdha, etc.)
  virya: 'Sheeta (Cooling)' | 'Ushna (Heating)' | 'Anushnasheeta (Temperate)' | string;
  vipaka: 'Madhura' | 'Amla' | 'Katu' | string;
  prabhava?: string; // Specific unique action
  doshaKarma: string; // Tridosha shamaka, Vata-Kapha hara, etc.
  keyPhytochemicals: string[];
  classicalSource: string;
  tkdlIdentifer: string;
  therapeuticUses: string[];
  cautions: string[];
  image: string;
}

export interface RoutineScheduleItem {
  id: string;
  time: string;
  period: 'brahma_muhurta' | 'morning' | 'breakfast' | 'midday' | 'evening' | 'dinner' | 'night' | 'pratah' | 'sandhya' | 'ratri';
  category: 'ahara' | 'aushadhi' | 'vihara' | 'rasayana' | 'food' | 'medicine' | 'lifestyle' | 'rejuvenation';
  title: string;
  sanskritTitle?: string;
  description: string;
  dosage?: string;
  dosageOrPortion?: string;
  anupana?: string; // Vehicle e.g. Warm water, Cow's milk, Honey
  instructions?: string;
  completed: boolean;
  doshaImpact: string; // e.g., 'Balances Pitta & Vata'
}

export interface DailyRoutineSchedule {
  id?: string;
  userId?: string;
  wakeUpTime: string;
  breakfastTime: string;
  lunchTime: string;
  eveningTime: string;
  dinnerTime: string;
  bedTime: string;
  healthFocus: string;
  prakritiTarget?: string;
  generatedDate?: string;
  items: RoutineScheduleItem[];
  waterIntakeTargetLiters?: number;
  recommendedWaterIntake?: string;
  specialGuidance?: string[];
  specialAyurvedicGuidance?: string[];
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  sanskritName?: string;
  form: string; // Vati, Churna, Kwath, Taila, Asava-Arishta, Lepa, Ghritham
  dosage: string; // e.g. "2 tablets (500mg)", "1 teaspoon (5g)"
  timing: string; // e.g. "Before meals (Pragbhakta)", "After meals (Pashchatbhakta)", "Bedtime (Nisha)"
  anupana: string; // Vehicle e.g. "Ushnodaka (Warm water)", "Cow's milk", "Madhu (Honey)", "Ghritha (Ghee)"
  duration: string; // e.g. "15 Days", "30 Days", "6 Weeks"
  instructions?: string;
}

export interface FoodChartRoutine {
  breakfast: string;
  lunch: string;
  eveningSnack: string;
  dinner: string;
  pathya: string[]; // Recommended wholesome foods
  apathya: string[]; // Strictly prohibited foods
  hydrationGuideline: string; // e.g. "2.5 Liters of lukewarm water infused with CCF (Cumin, Coriander, Fennel)"
  specialDietaryAdvice?: string;
}

export interface YogaExerciseRoutine {
  asanas: {
    name: string;
    sanskritName?: string;
    duration: string; // e.g. "5 mins", "10 repetitions"
    benefit: string;
    instructions: string;
  }[];
  pranayama: {
    technique: string;
    duration: string; // e.g. "10 mins"
    instructions: string;
  }[];
  preferredTime: string; // e.g. "Early Morning (Brahma Muhurta - 6:00 AM)"
  precautions: string[];
}

export interface DoctorPrescription {
  id: string;
  prescriptionNumber: string; // e.g. "RX-AYU-2026-9812"
  patientUsername: string;
  patientName: string;
  patientPhone?: string;
  patientAddress?: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorUsername: string;
  doctorName: string;
  doctorQualification: string;
  doctorRegistrationNo: string;
  doctorPhone?: string;
  doctorEmail?: string;
  clinicName: string;
  clinicAddress: string;
  consultationFee: string; // e.g. "₹800"
  date: string;
  followUpDate?: string;
  diagnosis: string;
  sanskritRogaNidan: string;
  doshaImbalance: {
    vata: number;
    pitta: number;
    kapha: number;
    dominant: string;
  };
  nadiParikshaNotes?: string;
  clinicalNotes?: string;
  medicines: PrescriptionMedicine[];
  foodChart: FoodChartRoutine;
  yogaRoutine: YogaExerciseRoutine;
  lifestyleNotes: string[];
  isSignedAndStamped: boolean;
  digitalSealHash?: string;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'patient' | 'doctor' | 'vaidya' | 'researcher';
  prakriti: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridosha' | 'Tridoshaja' | string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  medicalHistory?: string[];
  savedReports?: DiseaseAssessmentResult[];
  savedPatentAnalyses?: IPPatentAnalysis[];
  savedClinics?: string[];
  savedRoutines?: DailyRoutineSchedule[];
  dailyRoutine?: DailyRoutineSchedule;
  // Doctor / Clinic specific fields
  clinicName?: string;
  clinicAddress?: string;
  consultationFee?: string; // e.g. "₹800 per session"
  registrationNumber?: string; // CCIM / State AYUSH Council No
  specialization?: string;
  qualification?: string;
  isVerified?: boolean;
  createdAt?: string;
}

declare module 'html2pdf.js';
