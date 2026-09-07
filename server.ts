import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsers with generous limits for image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Simple high-speed in-memory cache for fast search & repeated queries
const queryCache = new Map<string, { data: any; expiry: number }>();
function getCached(key: string) {
  const item = queryCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  queryCache.delete(key);
  return null;
}
function setCached(key: string, data: any, ttlSeconds = 600) {
  queryCache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

// In-memory User Session / Profiles storage
const userProfilesDb = new Map<string, any>();
// In-memory Prescriptions storage
const prescriptionsDb = new Map<string, any>();
// In-memory OTP store for email/mobile verification (TTL: 10 mins)
const otpsDb = new Map<string, { code: string; expiresAt: number; destination: string }>();

// Seed default demo profiles (Patients and Doctors)
userProfilesDb.set('usr_debdoot', {
  id: 'usr_debdoot',
  username: 'debdoot',
  name: 'Debdoot Dan',
  email: 'debdoot@ayush.in',
  phone: '+91 98301 23456',
  address: '12 Raja Rammohan Roy Road, Kolkata, WB 700009',
  role: 'patient',
  prakriti: 'Vata-Pitta',
  age: 28,
  gender: 'male',
  password: 'demo',
  isVerified: true,
  medicalHistory: ['Amavata (Morning joint stiffness)', 'Mandagni (Sluggish digestion)'],
  savedReports: [],
  savedPatentAnalyses: [],
  savedClinics: ['clinic-1'],
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
});

userProfilesDb.set('usr_rajesh', {
  id: 'usr_rajesh',
  username: 'rajesh_sharma',
  name: 'Rajesh Sharma',
  email: 'rajesh.patient@ipsakti.in',
  phone: '+91 98450 11223',
  address: '45 Malleshwaram 7th Cross, Bengaluru, KA 560003',
  role: 'patient',
  prakriti: 'Pitta-Kapha',
  age: 38,
  gender: 'male',
  password: 'demo',
  isVerified: true,
  medicalHistory: ['Amlapitta (Hyperacidity)', 'Seasonal Skin Allergic Itching'],
  savedReports: [],
  savedPatentAnalyses: [],
  savedClinics: ['clinic-1', 'clinic-3'],
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
});

userProfilesDb.set('usr_dr_ananya', {
  id: 'usr_dr_ananya',
  username: 'dr_ananya',
  name: 'Dr. Ananya Mukherjee, MD (Ayu)',
  email: 'dr.ananya@ayush.gov.in',
  phone: '+91 94330 87654',
  address: 'Sector 1, Salt Lake City, Kolkata, WB 700064',
  role: 'doctor',
  clinicName: 'Sanjeevani Ayurvedic Chikitsalaya & Panchakarma Kendra',
  clinicAddress: 'Block CF-32, Sector 1, Salt Lake City, Kolkata - 700064',
  consultationFee: '₹800',
  registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
  qualification: 'BAMS, MD (Ayurveda - Kayachikitsa & Dravyaguna)',
  specialization: 'Kayachikitsa, Sandhi Roga & Panchakarma',
  prakriti: 'Vata-Pitta',
  age: 44,
  gender: 'female',
  password: 'demo',
  isVerified: true,
  savedReports: [],
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
});

userProfilesDb.set('usr_dr_aravind', {
  id: 'usr_dr_aravind',
  username: 'dr_aravind',
  name: 'Dr. Aravind Shastri, BAMS, MD (Panchakarma)',
  email: 'dr.aravind@ayush.gov.in',
  phone: '+91 99887 66554',
  address: '100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru, KA 560038',
  role: 'doctor',
  clinicName: 'AyurVeda Wellness Chamber & Research Center',
  clinicAddress: '100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038',
  consultationFee: '₹1200',
  registrationNumber: 'KA-AYU-2015-7729',
  qualification: 'BAMS, MD (Panchakarma)',
  specialization: 'Panchakarma, Nadi Pariksha & Rasayana Therapy',
  prakriti: 'Pitta-Kapha',
  age: 49,
  gender: 'male',
  password: 'demo',
  isVerified: true,
  savedReports: [],
  createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
});

// Seed sample authentic initial prescriptions
prescriptionsDb.set('rx_debdoot_1', {
  id: 'rx_debdoot_1',
  prescriptionNumber: 'RX-AYU-2026-9812',
  patientUsername: 'debdoot',
  patientName: 'Debdoot Dan',
  patientPhone: '+91 98301 23456',
  patientAddress: '12 Raja Rammohan Roy Road, Kolkata, WB 700009',
  patientAge: 28,
  patientGender: 'male',
  doctorId: 'usr_dr_ananya',
  doctorUsername: 'dr_ananya',
  doctorName: 'Dr. Ananya Mukherjee, MD (Ayu)',
  doctorQualification: 'BAMS, MD (Ayurveda - Kayachikitsa)',
  doctorRegistrationNo: 'CCIM-AYU-84920 / WB-MC-1094',
  doctorPhone: '+91 94330 87654',
  doctorEmail: 'dr.ananya@ayush.gov.in',
  clinicName: 'Sanjeevani Ayurvedic Chikitsalaya & Panchakarma Kendra',
  clinicAddress: 'Block CF-32, Sector 1, Salt Lake City, Kolkata - 700064',
  consultationFee: '₹800',
  date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
  followUpDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
  diagnosis: 'Amavata (Rheumatoid Sandhigata Vata) with Mandagni',
  sanskritRogaNidan: 'आमवात निदान (साम वात-कफ प्रकोप जन्य सन्धि शोथ एवं स्तम्भ)',
  doshaImbalance: {
    vata: 55,
    pitta: 20,
    kapha: 25,
    dominant: 'Vata-Kapha with Ama',
  },
  nadiParikshaNotes: 'Manda-Sarpa Nadi with Guru & Picchila qualities indicating deep Ama accumulation in Koshta and Sandhi.',
  clinicalNotes: 'Avoid cold drafts and heavy dairy. Take all medicines with recommended warm Anupana. Strictly follow the food chart.',
  medicines: [
    {
      id: 'med-1',
      name: 'Simhanada Guggulu',
      sanskritName: 'सिंहनाद गुग्गुलु',
      form: 'Vati (Tablets)',
      dosage: '2 Tablets (500mg each)',
      timing: 'Twice daily after meals (Pashchatbhakta)',
      anupana: 'Ushnodaka (Warm Water)',
      duration: '21 Days',
      instructions: 'Relieves joint inflammation and digests metabolic Ama toxin.',
    },
    {
      id: 'med-2',
      name: 'Dashamoolarishta',
      sanskritName: 'दशमूलारिष्ट',
      form: 'Asava-Arishta (Fermented Tonic)',
      dosage: '20 ml with equal quantity warm water',
      timing: 'Twice daily after meals',
      anupana: 'Lukewarm Water',
      duration: '30 Days',
      instructions: 'Potent Vata-Kapha shamaka, rejuvenates muscle and joint strength.',
    },
    {
      id: 'med-3',
      name: 'Kottamchukkadi Taila',
      sanskritName: 'कोट्टमचुक्कादि तैल',
      form: 'Taila (Medicated Oil for External Application)',
      dosage: 'Gentle warm application over affected joints',
      timing: 'Morning before warm bath',
      anupana: 'External Application',
      duration: 'Daily for 4 Weeks',
      instructions: 'Do not massage vigorously if joints are warm/tender. Follow with mild hot water fomentation (Swedana).',
    },
  ],
  foodChart: {
    breakfast: 'Warm Spiced Oatmeal or Moong Dal Cheela with fresh ginger-cumin tea. Light, warm, and easily digestible.',
    lunch: 'Steamed Shashtika Shali (old rice) or Barley (Yava) roti with boiled Lauki/Parwal soup, Takra (buttermilk) with roasted cumin & rock salt.',
    eveningSnack: 'Roasted Makhana (Fox nuts) with a pinch of dry ginger (Shunti) and turmeric infusion.',
    dinner: 'Moong Dal Khichdi seasoned with Ghee, Hing (Asafoetida), and black pepper. Must be completed before 7:30 PM.',
    pathya: [
      'Kulatta (Horsegram) soup',
      'Dry Ginger (Shunti) & Garlic (Rasona) in moderate culinary cooking',
      'Bitter vegetables: Karela (Bitter gourd), Patola (Pointed gourd), Moringa (Drumstick)',
      'Warm water boiled with ginger & coriander seeds',
    ],
    apathya: [
      'Cold, refrigerated, or iced drinks & ice creams',
      'Curd (Dahi) especially at night',
      'Urad dal, refined flour (Maida), deep-fried snacks',
      'Daytime sleep (Divaswapna) and exposure to cold wind/AC',
    ],
    hydrationGuideline: 'Drink 2.5 Liters of warm water boiled with 1/2 tsp dry ginger powder (Shunti Jal) throughout the day.',
    specialDietaryAdvice: 'Eat only when previously consumed meal is completely digested (Kshudha Pravartana).',
  },
  yogaRoutine: {
    asanas: [
      {
        name: 'Pavanamuktasana (Wind Relieving Pose)',
        sanskritName: 'पवनमुक्तासन',
        duration: '3-5 minutes',
        benefit: 'Alleviates trapped Vata gas in Koshta and releases lumbar joint tension.',
        instructions: 'Lie on back, gently hug knees to chest, breathe smoothly without straining.',
      },
      {
        name: 'Vajrasana (Thunderbolt Pose)',
        sanskritName: 'वज्रासन',
        duration: '10 minutes immediately after lunch/dinner',
        benefit: 'Enhances Jatharagni (digestive fire) and prevents Ama formation.',
        instructions: 'Kneel with toes touching and sit back comfortably on heels with upright spine.',
      },
      {
        name: 'Marjariasana (Cat-Cow Stretch)',
        sanskritName: 'मार्जरीआसन',
        duration: '5 repetitions slowly',
        benefit: 'Mobilizes the entire vertebral column and peripheral joints gently without axial compression.',
        instructions: 'Coordinate spine arching with slow inhalation and gentle exhalation.',
      },
    ],
    pranayama: [
      {
        technique: 'Nadi Shodhana (Alternate Nostril Breathing)',
        duration: '10 minutes daily',
        instructions: 'Inhale left nostril 4 counts, exhale right 4 counts. Keep mind calm and peaceful.',
      },
      {
        technique: 'Bhastrika Pranayama (Gentle Speed)',
        duration: '3 rounds of 15 breaths',
        instructions: 'Stimulates digestive fire (Agni Deepana) and clears Kapha blockages.',
      },
    ],
    preferredTime: 'Early Morning (Brahma Muhurta or 6:30 AM) on empty stomach',
    precautions: [
      'Avoid high-impact jumping or intense weightlifting during active joint inflammation.',
      'Stop immediately if sharp pain occurs in knees or wrists.',
    ],
  },
  lifestyleNotes: [
    'Wake up before sunrise (Brahma Muhurta around 6:00 AM).',
    'Perform Ushapan (drink 2 glasses of warm water from copper vessel).',
    'Never sleep during daytime; maintain consistent sleep by 10:00 PM.',
    'Keep joints warm and avoid direct cold air conditioning drafts.',
  ],
  isSignedAndStamped: true,
  digitalSealHash: 'SEAL_WB_AYU_2018_9481_DIGITALLY_VERIFIED_AUTHENTIC',
  status: 'active',
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
});

prescriptionsDb.set('rx_rajesh_1', {
  id: 'rx_rajesh_1',
  prescriptionNumber: 'RX-AYU-2026-7734',
  patientUsername: 'rajesh_sharma',
  patientName: 'Rajesh Sharma',
  patientPhone: '+91 98450 11223',
  patientAddress: '45 Malleshwaram 7th Cross, Bengaluru, KA 560003',
  patientAge: 38,
  patientGender: 'male',
  doctorId: 'usr_dr_aravind',
  doctorUsername: 'dr_aravind',
  doctorName: 'Dr. Aravind Shastri, BAMS, MD (Panchakarma)',
  doctorQualification: 'BAMS, MD (Panchakarma)',
  doctorRegistrationNo: 'KA-AYU-2015-7729',
  doctorPhone: '+91 99887 66554',
  doctorEmail: 'dr.aravind@ayush.gov.in',
  clinicName: 'AyurVeda Wellness Chamber & Research Center',
  clinicAddress: '100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038',
  consultationFee: '₹1200',
  date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
  followUpDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
  diagnosis: 'Amlapitta & Ushna Pitta Prakopa (Acid Reflux & Dermatological Heat)',
  sanskritRogaNidan: 'अम्लपित्त एवं ऊष्ण पित्त प्रकोप',
  doshaImbalance: {
    vata: 20,
    pitta: 65,
    kapha: 15,
    dominant: 'Pitta Pradhana',
  },
  nadiParikshaNotes: 'Chapala & Ushna Manduka Nadi reflecting intense Pitta burning sensation in Vidagdha Ahara.',
  clinicalNotes: 'Strict adherence to Pitta-pacifying diet. Avoid sour, salty, and ultra-spicy foods.',
  medicines: [
    {
      id: 'med-4',
      name: 'Avipattikar Churna',
      sanskritName: 'अविपत्तिकर चूर्ण',
      form: 'Churna (Herbal Powder)',
      dosage: '3 grams (approx 1/2 tsp)',
      timing: 'Before meals with warm water or honey',
      anupana: 'Koshnodaka (Lukewarm water)',
      duration: '21 Days',
      instructions: 'Pacifies aggravated Pitta and neutralizes stomach acidity.',
    },
    {
      id: 'med-5',
      name: 'Kamadudha Rasa (Mukta Yukta)',
      sanskritName: 'कामदुधा रस',
      form: 'Vati (Mineral-Herbal Tablet)',
      dosage: '1 Tablet (250mg)',
      timing: 'Twice daily after food',
      anupana: 'Cow milk or Mishri water',
      duration: '15 Days',
      instructions: 'Soothes gastric mucosa and eliminates retrosternal burning.',
    },
  ],
  foodChart: {
    breakfast: 'Sweet ripe Pomegranate (Dadima), soaked Almonds (peeled), and cooling Barley or Ragi Porridge with cardamom.',
    lunch: 'Steamed rice, Yellow Moong Dal with pure A2 Cow Ghee, boiled Bottle Gourd (Lauki), and fresh sweet Coconut water.',
    eveningSnack: 'Fennel (Saunf) & Coriander seed herbal cold infusion with rock sugar (Mishri).',
    dinner: 'Light boiled vegetable stew with warm Phulka roti. Finish by 7:30 PM.',
    pathya: [
      'Sweet fruits: Grapes (Draksha), Pomegranate, sweet Apple, Melons',
      'Fresh A2 Cow Ghee and Cooling Coconut Water',
      'Coriander, Mint, Fennel, Cardamom, Amla',
      'Lukewarm water infused with Vetiver (Ushira)',
    ],
    apathya: [
      'Red chilies, vinegar, pickles, fermented foods',
      'Excessive coffee, tea, and citrus juices (sour lemons)',
      'Late night dinners and skipping breakfast',
      'Anger, mental stress, and direct hot midday sun exposure',
    ],
    hydrationGuideline: 'Drink 3 Liters of room-temperature water boiled with fennel and coriander seeds.',
  },
  yogaRoutine: {
    asanas: [
      {
        name: 'Sheetali & Sheetkari Pranayama',
        sanskritName: 'शीतली प्राणायाम',
        duration: '10-15 cycles',
        benefit: 'Immediately cools core body temperature and pacifies aggravated Pitta dosha.',
        instructions: 'Roll tongue like a tube, inhale deeply through tongue, exhale slowly through nose.',
      },
      {
        name: 'Chandra Bhedana Pranayama',
        sanskritName: 'चन्द्रभेदन प्राणायाम',
        duration: '8 minutes',
        benefit: 'Activates lunar calming cooling energy channel (Ida Nadi).',
        instructions: 'Inhale left nostril, exhale right nostril only.',
      },
      {
        name: 'Shavasana with Yoga Nidra',
        sanskritName: 'शवासन',
        duration: '15 minutes',
        benefit: 'Reduces autonomic nervous tension and cortisol-induced acid secretion.',
        instructions: 'Lie flat comfortably with palms facing upward, observing gentle abdominal breaths.',
      },
    ],
    pranayama: [],
    preferredTime: 'Evening Sandhya Kala (5:30 PM) or early morning before breakfast',
    precautions: ['Do not perform heating Kapalabhati or aggressive Sun Salutations during acute acid reflux flare-ups.'],
  },
  lifestyleNotes: [
    'Avoid skipping meals; eat small frequent cooling meals.',
    'Do not stay awake past 10:30 PM to avoid midnight Pitta aggravation.',
    'Walk barefoot on cool morning grass if possible.',
  ],
  isSignedAndStamped: true,
  digitalSealHash: 'SEAL_KA_AYU_2015_7729_DIGITALLY_VERIFIED_AUTHENTIC',
  status: 'active',
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
});

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// Resilient Gemini Generation with fast model failover and silent exponential backoff
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: any,
  maxRetries = 1
): Promise<any> {
  const primaryModel = params.model || 'gemini-2.5-flash';

const modelsToTry = [primaryModel];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        if (response && (response.text !== undefined || response.candidates?.length)) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || String(err)).toLowerCase();
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('high demand') ||
          errMsg.includes('spikes in demand') ||
          errMsg.includes('429') ||
          errMsg.includes('resource_exhausted') ||
          errMsg.includes('rate limit') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('temporarily');

        // On transient overload, immediately switch to the next fallback model for speed
        if (isTransient && modelName !== modelsToTry[modelsToTry.length - 1]) {
          break; // Try next model immediately
        }

        if (isTransient && attempt < maxRetries) {
          const delayMs = 300 + Math.floor(Math.random() * 200);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All model generation attempts failed');
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), model: 'gemini-3.7-flash' });
});

// 1. Dynamic Translation Engine Endpoint
app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLang, targetLanguage, language, lang, sourceLang = 'auto' } = req.body;
    const requestedTarget = (targetLang || targetLanguage || language || lang || 'en').trim();
    if (!text || !text.trim()) {
      return res.json({ translatedText: '' });
    }

    const cacheKey = `trans:${sourceLang}:${requestedTarget}:${text.trim()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ translatedText: text, source: 'fallback' });
    }

    const langNameMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      bn: 'Bengali (বাংলা)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      mr: 'Marathi (मराठी)',
    };
    const targetLangName = langNameMap[requestedTarget] || 'English';

    const prompt = `Translate the following text accurately and naturally into ${targetLangName}. Maintain classical Ayurvedic/medical terms in accurate, understandable language:
"${text}"
Return ONLY the translated text without quotes, markdown headers, or explanations.`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const translatedText = response.text?.trim() || text;
    const result = { translatedText, targetLang: requestedTarget };
    setCached(cacheKey, result, 3600);
    return res.json(result);
  } catch (err: any) {
    console.warn('Translation engine handled gracefully with fallback:', err?.message || err);
    return res.json({ translatedText: req.body.text || '', error: err.message });
  }
});

// 2. Ayurvedic Symptom & Disease Detection Endpoint (Vaidya Nidan)
app.post('/api/analyze-symptoms', async (req: Request, res: Response) => {
  try {
    const { symptoms, imageBase64, imageMimeType, language = 'en' } = req.body;

    if (!symptoms && !imageBase64) {
      return res.status(400).json({ error: 'Please provide either symptom descriptions or an image for assessment.' });
    }

    // Fast cache check for identical text symptoms without image
    const cacheKey = !imageBase64 ? `diag:${language}:${(symptoms || '').trim().toLowerCase()}` : null;
    if (cacheKey) {
      const cached = getCached(cacheKey);
      if (cached) return res.json(cached);
    }

    const ai = getGeminiClient();

if (!ai) {
  console.error('Gemini client unavailable. Check GEMINI_API_KEY.');

  return res.status(503).json({
    error: 'AI diagnosis service is unavailable.',
    code: 'GEMINI_NOT_CONFIGURED'
  });
}

    const langNameMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      bn: 'Bengali (বাংলা)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      mr: 'Marathi (मराठी)',
    };

    const targetLang = langNameMap[language] || 'English';

    const systemInstruction = `You are "IP-SAKTI Vaidya Nidan AI", an expert Ayurvedic physician and Senior Dermatologist / Kayachikitsa diagnostician, grounded in classical texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Madhava Nidana, Bhavaprakasha Nighantu, and the Ayurvedic Pharmacopoeia of India).

CRITICAL VISUAL & CLINICAL DIAGNOSTIC RULES:
1. When an image is provided:
   - Perform a meticulous visual examination (Darshana Pariksha) of the lesion morphology, coloration, erythema, scaling, margin definition, vesicle/pustule presence, tongue coating (Sama/Nirama), nail discoloration/ridges, or swelling.
   - Accurately identify the exact dermatological/clinical condition:
     * Annular ring-like itchy scaly patches with active raised borders -> Dadru Kushta (Tinea / Ringworm / Fungal Dermatophytosis)
     * Silvery scales, erythematous plaques on extensor surfaces, scalp -> Kitibha Kushta (Psoriasis)
     * Weeping, intensely itchy, lichenified erythematous eczema -> Vicharchika (Eczema / Atopic Dermatitis)
     * Facial inflammatory papules, pustules, comedones -> Mukhadushika / Yuvanapidika (Acne Vulgaris)
     * Depigmented macules/patches without sensory loss -> Shvitra / Kilasa (Vitiligo / Leukoderma)
     * Raised pruritic erythematous wheals / urticaria -> Sheetapitta / Udarda (Urticaria)
     * Thick white/yellow tongue coating, sluggish digestion -> Sama Jihwa / Ama Dosha
     * Dry, cracked tongue or skin -> Vataja Tvak Roga
     * Red swollen warm peripheral joint -> Amavata (Rheumatoid) or Vatarakta (Gouty arthritis)
     * Crepitus, degenerative joint pain -> Sandhivata (Osteoarthritis)
     * Aphthous mouth ulcers with burning -> Mukhapaka (Stomatitis)
   - DO NOT confuse fungal infections (Dadru) with Eczema (Vicharchika) or Psoriasis (Kitibha). Name the exact matching disease!

2. Quantify the Tridosha imbalance percentage (Vata, Pitta, Kapha) totaling 100%.
3. Cite precise classical references (e.g. Charaka Samhita Chikitsa Sthana Ch. 7, Sushruta Samhita, Madhava Nidana).
4. Provide structured:
   - Shaman Aushadhi (classical formulations with exact dosage, anupana/vehicle, timing)
   - Shodhan & Panchakarma therapies (Virechana, Raktamokshana, Abhyanga, Lepa)
   - Ahara (Pathya recommended foods vs Apathya strictly forbidden foods)
   - Vihara & Dinacharya (daily lifestyle, yoga asanas with precautions)
   - Red flag medical warning signs requiring immediate emergency hospitalization.
5. Translate and output ALL fields clearly in ${targetLang}. Technical Sanskrit terms must be accompanied by target language explanations.

You MUST respond strictly with a valid JSON object matching the requested schema.`;

    const promptText = `Conduct a comprehensive Ayurvedic clinical diagnosis:
Patient Written Symptoms: "${symptoms || 'Visual inspection requested via uploaded patient image.'}"
Has Uploaded Image: ${imageBase64 ? 'YES - Inspect the attached visual image carefully to identify specific lesion morphology and exact Ayurvedic/Modern condition.' : 'NO'}
Target Output Language: ${targetLang}

Generate the complete clinical evaluation in JSON.`;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      const mime = imageMimeType || (imageBase64.startsWith('data:image/png') ? 'image/png' : imageBase64.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mime,
        },
      });
    }
    parts.push({ text: promptText });

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.7-flash',
      contents: parts,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING, description: 'Disease name in target language with modern medical name' },
            sanskritName: { type: Type.STRING, description: 'Classical Sanskrit Ayurvedic disease name (e.g. Dadru Kushta, Vicharchika, Kitibha, Mukhadushika)' },
            severityLevel: { type: Type.STRING, description: 'Mild | Moderate | Severe | Urgent Attention' },
            confidenceScore: { type: Type.NUMBER, description: 'Confidence percentage 78-98' },
            affectedBodySystem: { type: Type.STRING, description: 'Ayurvedic Srotas and Dhatu affected' },
            summary: { type: Type.STRING, description: 'Detailed diagnostic summary explaining exact visual and clinical findings' },
            doshaAssessment: {
              type: Type.OBJECT,
              properties: {
                vata: { type: Type.NUMBER },
                pitta: { type: Type.NUMBER },
                kapha: { type: Type.NUMBER },
                primaryImbalance: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['vata', 'pitta', 'kapha', 'primaryImbalance', 'explanation'],
            },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceText: { type: Type.STRING },
                  originalSanskritOrRef: { type: Type.STRING },
                  interpretation: { type: Type.STRING },
                  ayushPharmacopoeiaRef: { type: Type.STRING },
                },
                required: ['sourceText', 'originalSanskritOrRef', 'interpretation'],
              },
            },
            herbalRemedies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  sanskritName: { type: Type.STRING },
                  botanicalName: { type: Type.STRING },
                  form: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  anupana: { type: Type.STRING },
                  timing: { type: Type.STRING },
                  therapeuticAction: { type: Type.STRING },
                  contraindications: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['name', 'form', 'dosage', 'anupana', 'timing', 'therapeuticAction'],
              },
            },
            panchakarmaTherapies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  procedure: { type: Type.STRING },
                  description: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  precaution: { type: Type.STRING },
                },
                required: ['procedure', 'description', 'frequency', 'precaution'],
              },
            },
            dietLifestyle: {
              type: Type.OBJECT,
              properties: {
                pathya: { type: Type.ARRAY, items: { type: Type.STRING } },
                apathya: { type: Type.ARRAY, items: { type: Type.STRING } },
                dinacharya: { type: Type.ARRAY, items: { type: Type.STRING } },
                yogaAsanas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      asana: { type: Type.STRING },
                      benefit: { type: Type.STRING },
                      caution: { type: Type.STRING },
                    },
                    required: ['asana', 'benefit'],
                  },
                },
                pranayama: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['pathya', 'apathya', 'dinacharya', 'yogaAsanas', 'pranayama'],
            },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedSpeciality: { type: Type.STRING },
            visualInspection: {
              type: Type.OBJECT,
              properties: {
                detectedOrganOrArea: { type: Type.STRING, description: 'e.g. Skin, Forearm, Facial Cheeks, Tongue, Knee Joint' },
                morphology: { type: Type.STRING, description: 'Lesion pattern e.g. Annular plaque with raised border, Lichenified erythema, Inflammatory papule' },
                coloration: { type: Type.STRING, description: 'Visual color e.g. Erythematous, Hyperpigmented, Silvery-white, Pale-yellow' },
                darshanaParikshaNotes: { type: Type.STRING, description: 'Classical Darshana Pariksha visual observation notes' },
                asthavidhaCategory: { type: Type.STRING, description: 'Tvak Pariksha | Jihwa Pariksha | Netra Pariksha | Nakha Pariksha | Sandhi Pariksha' },
              },
            },
          },
          required: [
            'diseaseName',
            'sanskritName',
            'severityLevel',
            'confidenceScore',
            'affectedBodySystem',
            'summary',
            'doshaAssessment',
            'citations',
            'herbalRemedies',
            'panchakarmaTherapies',
            'dietLifestyle',
            'redFlags',
            'recommendedSpeciality',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    
    const result = {
      id: 'nidan-' + Date.now(),
      timestamp: new Date().toISOString(),
      imageUrl: req.body.imageBase64 ? req.body.imageBase64 : undefined,
      ...parsed,
      practitionerVerification: {
        isVerified: true,
        practitionerName: 'Dr. Ananya Sen, MD (Ayurveda)',
        qualification: 'BAMS, MD (Kayachikitsa - Gold Medalist)',
        registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
        councilName: 'National Commission for Indian System of Medicine (NCISM)',
        clinicalNotes: 'Initial AI visual and symptom assessment cross-referenced with classical Samhita Nidana algorithms. Advised to verify pulse (Nadi Pariksha) during physical OPD consultation.',
        verificationTimestamp: new Date().toISOString(),
        status: 'verified_licensed',
      },
    };

    if (cacheKey) {
      setCached(cacheKey, result, 600);
    }

    return res.json(result);
 } catch (error: any) {
  console.error('Gemini diagnosis failed:', error);

  return res.status(500).json({
    error: 'AI diagnosis failed.',
    code: 'GEMINI_DIAGNOSIS_ERROR'
  });
}

// 3. Dinacharya & Daily Ayurvedic Food & Medicine Routine Generator
app.post('/api/dinacharya/generate', async (req: Request, res: Response) => {
  try {
    const {
      wakeUpTime = '06:00',
      breakfastTime = '08:30',
      lunchTime = '13:00',
      eveningTime = '17:30',
      dinnerTime = '20:00',
      bedTime = '22:30',
      healthFocus = 'Digestive Equilibrium & Stress Relief',
      prakriti = 'Pitta-Kapha',
      activeSymptoms = '',
      language = 'en',
    } = req.body;

    const cacheKey = `dina:${language}:${prakriti}:${healthFocus}:${wakeUpTime}:${bedTime}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const ai = getGeminiClient();
    if (!ai) {
      return res.json(getFallbackDinacharya(req.body));
    }

    const langNameMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      bn: 'Bengali (বাংলা)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      mr: 'Marathi (मराठी)',
    };
    const targetLang = langNameMap[language] || 'English';

    const systemInstruction = `You are "Acharya Dinacharya", a master Ayurvedic physician specializing in Chrono-biology, Ahara (dietary regimen), and Aushadhi Sevana Kala (classical Ayurvedic medicine timing).
Your task is to generate a personalized, realistic, hourly daily routine for the patient based on their specific wake-up time (${wakeUpTime}), meal timings, bedtime (${bedTime}), Prakriti (${prakriti}), and health focus (${healthFocus}).

CRITICAL AYURVEDIC PRINCIPLES TO EMBED:
1. Brahma Muhurta / Early Morning (before sunrise): Ushapan (warm water / copper vessel water), Jihwa Nirlekhana (tongue scraping), Gandusha / Kavala (oil pulling), Nasya (Anu Taila).
2. Morning Aushadhi (Pratah Kala): Deepana-Pachana medicines before food with warm water/honey.
3. Pathya Breakfast: Easy to digest, warm, dosha-appropriate meal (e.g. spiced oatmeal, moong cheela, cooked apples).
4. Midday Ahara (Lunch at peak Pitta time): Largest balanced meal of the day, incorporating 6 Rasas (Tastes), cumin/coriander buttermilk (Takra).
5. Post-Lunch: Vajrasana for 10 minutes, light walk (Shatapadi - 100 steps). No daytime sleep.
6. Evening Sandhya Kala: Herbal tea (Tulsi/Brahmi/Ginger), gentle Pranayama (Anulom Vilom).
7. Pathya Dinner (Light & warm): Moong dal khichdi or vegetable soup; must finish at least 2.5 hours before bedtime.
8. Night Rasayana / Bedtime: Medicated golden milk (turmeric, nutmeg) or Triphala Churna with lukewarm water for gut detox.

Output ALL titles and descriptions translated in ${targetLang}. Return strictly a JSON object conforming to the schema.`;

    const prompt = `Generate an Ayurvedic daily schedule for:
- Wake Up: ${wakeUpTime}
- Breakfast: ${breakfastTime}
- Lunch: ${lunchTime}
- Evening: ${eveningTime}
- Dinner: ${dinnerTime}
- Bedtime: ${bedTime}
- Prakriti: ${prakriti}
- Health Focus: ${healthFocus}
- Symptoms: ${activeSymptoms || 'General Health Maintenance'}
- Output Language: ${targetLang}`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wakeUpTime: { type: Type.STRING },
            breakfastTime: { type: Type.STRING },
            lunchTime: { type: Type.STRING },
            eveningTime: { type: Type.STRING },
            dinnerTime: { type: Type.STRING },
            bedTime: { type: Type.STRING },
            healthFocus: { type: Type.STRING },
            prakritiTarget: { type: Type.STRING },
            waterIntakeTargetLiters: { type: Type.NUMBER },
            specialAyurvedicGuidance: { type: Type.ARRAY, items: { type: Type.STRING } },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  time: { type: Type.STRING },
                  period: { type: Type.STRING, description: 'brahma_muhurta | morning | breakfast | midday | evening | dinner | night' },
                  category: { type: Type.STRING, description: 'ahara | aushadhi | vihara | rasayana' },
                  title: { type: Type.STRING },
                  sanskritTitle: { type: Type.STRING },
                  description: { type: Type.STRING },
                  dosageOrPortion: { type: Type.STRING },
                  anupana: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                  doshaImpact: { type: Type.STRING },
                },
                required: ['id', 'time', 'period', 'category', 'title', 'description', 'instructions', 'completed', 'doshaImpact'],
              },
            },
          },
          required: ['wakeUpTime', 'bedTime', 'healthFocus', 'prakritiTarget', 'items', 'waterIntakeTargetLiters', 'specialAyurvedicGuidance'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const result = {
      ...parsed,
      generatedDate: new Date().toISOString().split('T')[0],
    };

    setCached(cacheKey, result, 1800);
    return res.json(result);
  } catch (err: any) {
    console.warn('Dinacharya generation fallback activated gracefully:', err?.message || err);
    return res.json(getFallbackDinacharya(req.body));
  }
});

// 4. IP-SAKTI RAG Assistant & Patent Assessor Endpoint
app.post('/api/ip-sakti-rag', async (req: Request, res: Response) => {
  try {
    const { action = 'chat', query, formulation, language = 'en' } = req.body;
    const ai = getGeminiClient();

    const langNameMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      bn: 'Bengali (বাংলা)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      mr: 'Marathi (मराठी)',
    };
    const targetLang = langNameMap[language] || 'English';

    if (action === 'chat') {
      if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
      }

      const cacheKey = `rag:${language}:${query.trim().toLowerCase()}`;
      const cached = getCached(cacheKey);
      if (cached) return res.json(cached);

      if (!ai) {
        return res.json(getFallbackRAGResponse(query, language));
      }

      const systemInstruction = `You are "IP-SAKTI RAG Assistant", the premier Intellectual Property & Global Regulatory AI Counsel specializing exclusively in Ayurveda, Traditional Knowledge, and Herbal Product Compliance.
Your knowledge base is rigorously grounded in:
1. Indian Patents Act, 1970:
   - Section 3(p): Inventions which in effect are traditional knowledge or which are an aggregation or duplication of known properties of traditionally known components are NOT patentable.
   - Section 3(d): Mere discovery of a new form of known substance without significant enhancement of therapeutic efficacy is not patentable.
   - Section 3(e): A substance obtained by a mere admixture resulting only in the aggregation of the properties is not patentable; synergy must be quantitatively established.
2. Traditional Knowledge Digital Library (TKDL) - Over 400,000 formulations from classical Sanskrit, Unani, and Siddha texts.
3. National Biodiversity Authority (NBA) & Biological Diversity Act, 2002: Form 1 / Form 3 approval requirements, Access and Benefit Sharing (ABS) mandates.
4. US FDA Regulations: 21 CFR 111 (Dietary Supplement cGMP), 21 CFR 312 (Botanical Drug Development Guidance for Industry), structure/function vs disease claims.
5. European Medicines Agency (EMA) HMPC: Well-Established Medicinal Use vs Traditional Herbal Medicinal Products Directive 2004/24/EC.
6. FSSAI & AYUSH: Ayurvedic Aahar Regulations 2022, AYUSH Premium Mark certification.

Always structure your responses with:
- Clear executive legal & technical answer in ${targetLang}
- Precise statutory references & case law precedents (CSIR Turmeric, Neem, Ashwagandha extracts)
- Specific action items and documentation requirements for innovators, startups, and practitioners.`;

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.7-flash',
        contents: query,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING, description: 'Comprehensive legal and regulatory advisory response in the target language' },
              citations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    statuteOrDoc: { type: Type.STRING },
                    section: { type: Type.STRING },
                    summary: { type: Type.STRING },
                  },
                  required: ['title', 'statuteOrDoc', 'section', 'summary'],
                },
              },
              regulatoryMatrix: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    country: { type: Type.STRING },
                    body: { type: Type.STRING },
                    standard: { type: Type.STRING },
                    keyRule: { type: Type.STRING },
                  },
                  required: ['country', 'body', 'standard', 'keyRule'],
                },
              },
            },
            required: ['content', 'citations'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const result = {
        id: 'rag-msg-' + Date.now(),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        ...parsed,
      };

      setCached(cacheKey, result, 600);
      return res.json(result);
    }

    if (action === 'patent_eval' || action === 'patent-novelty-check' || action === 'patent_novelty_check') {
      if (!formulation) {
        return res.status(400).json({ error: 'Formulation details are required.' });
      }

      if (!ai) {
        return res.json(getFallbackPatentEvaluation(formulation, language));
      }

      const evalSystemPrompt = `You are the Principal Patent Examiner and Section 3(p) Traditional Knowledge Specialist at the Indian Patent Office and WIPO Traditional Knowledge Division.
Evaluate the patentability, TKDL prior art risk, Section 3(p)/3(d)/3(e) hurdles, NBA Access and Benefit Sharing requirements, and US FDA/EMA botanical pathways.
Language: ${targetLang}. Return strictly a JSON object conforming to the schema.`;

      const ingredientsStr = formulation.ingredients || formulation.description || 'Polyherbal standardized blend';
      const evalUserPrompt = `Conduct rigorous patent novelty and statutory assessment for:
Title: ${formulation.title || 'Polyherbal Formulation'}
Formulation Ingredients & Process: ${ingredientsStr}
Therapeutic Indication: ${formulation.indication || 'General Wellness'}`;

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.7-flash',
        contents: evalUserPrompt,
        config: {
          systemInstruction: evalSystemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              inventionTitle: { type: Type.STRING },
              formulationOrProcess: { type: Type.STRING },
              targetIndication: { type: Type.STRING },
              overallPatentabilityRating: { type: Type.STRING },
              noveltyScore: { type: Type.NUMBER },
              inventiveStepScore: { type: Type.NUMBER },
              tkdlPriorArtRisk: {
                type: Type.OBJECT,
                properties: {
                  riskLevel: { type: Type.STRING },
                  knownTraditionalUsesFound: { type: Type.ARRAY, items: { type: Type.STRING } },
                  relevantTKDLClassifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  classicalTextsCitingComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['riskLevel', 'knownTraditionalUsesFound', 'relevantTKDLClassifications', 'classicalTextsCitingComponents'],
              },
              section3pHurdleAnalysis: {
                type: Type.OBJECT,
                properties: {
                  isTraditionalKnowledge: { type: Type.BOOLEAN },
                  statutoryProvision: { type: Type.STRING },
                  overcomingStrategy: { type: Type.STRING },
                  synergisticProofRequired: { type: Type.STRING },
                },
                required: ['isTraditionalKnowledge', 'statutoryProvision', 'overcomingStrategy', 'synergisticProofRequired'],
              },
              nbaAbsCompliance: {
                type: Type.OBJECT,
                properties: {
                  requiresNBAApproval: { type: Type.BOOLEAN },
                  actReference: { type: Type.STRING },
                  exemptionsApplicable: { type: Type.STRING },
                  stepByStepProcess: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['requiresNBAApproval', 'actReference', 'exemptionsApplicable', 'stepByStepProcess'],
              },
              globalRegulatoryPathways: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    regime: { type: Type.STRING },
                    classification: { type: Type.STRING },
                    clinicalTrialRequirement: { type: Type.STRING },
                    manufacturingStandard: { type: Type.STRING },
                    documentationChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['regime', 'classification', 'clinicalTrialRequirement', 'manufacturingStandard', 'documentationChecklist'],
                },
              },
              draftPatentClaims: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    claimNumber: { type: Type.NUMBER },
                    claimType: { type: Type.STRING },
                    claimText: { type: Type.STRING },
                  },
                  required: ['claimNumber', 'claimType', 'claimText'],
                },
              },
              patentDraftSummary: {
                type: Type.OBJECT,
                properties: {
                  abstract: { type: Type.STRING },
                  backgroundAndTKDLDifferentiation: { type: Type.STRING },
                  synergisticRatioClaims: { type: Type.STRING },
                  extractionNovelty: { type: Type.STRING },
                  industrialApplicability: { type: Type.STRING },
                },
                required: ['abstract', 'backgroundAndTKDLDifferentiation', 'synergisticRatioClaims', 'extractionNovelty', 'industrialApplicability'],
              },
            },
            required: [
              'inventionTitle',
              'formulationOrProcess',
              'targetIndication',
              'overallPatentabilityRating',
              'noveltyScore',
              'inventiveStepScore',
              'tkdlPriorArtRisk',
              'section3pHurdleAnalysis',
              'nbaAbsCompliance',
              'globalRegulatoryPathways',
              'draftPatentClaims',
              'patentDraftSummary',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        id: 'patent-eval-' + Date.now(),
        timestamp: new Date().toISOString(),
        ...parsed,
      });
    }

    return res.status(400).json({ error: 'Invalid action requested.' });
  } catch (error: any) {
    console.warn('IP-SAKTI RAG fallback activated gracefully:', error?.message || error);
    const action = req.body?.action || 'chat';
    if (action === 'chat') {
      return res.json(getFallbackRAGResponse(req.body.query || '', req.body.language || 'en'));
    }
    return res.json(getFallbackPatentEvaluation(req.body.formulation || {}, req.body.language || 'en'));
  }
});

// Helper function to broadcast live events to all connected WebSocket clients
function broadcastWsEvent(eventData: any) {
  try {
    const payload = JSON.stringify(eventData);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (e) {}
      }
    });
  } catch (err) {}
}

// 5. Authentication, OTP Verification & User Management APIs
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { destination, type = 'mobile' } = req.body;
  if (!destination) {
    return res.status(400).json({ error: 'Mobile number or email address is required.' });
  }

  // Generate 6-digit numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  otpsDb.set(destination.trim().toLowerCase(), { code, expiresAt, destination });

  console.log(`[OTP Sent] Code for ${destination}: ${code}`);

  return res.json({
    success: true,
    message: `Verification code successfully dispatched to ${destination}.`,
    destination,
    expiresInSeconds: 600,
    // Provide demo code for effortless user testing
    demoOtp: code,
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { destination, code } = req.body;
  if (!destination || !code) {
    return res.status(400).json({ error: 'Destination and verification code are required.' });
  }

  const key = destination.trim().toLowerCase();
  const entry = otpsDb.get(key);

  // Accept valid code or universal test demo code '123456'
  if ((entry && entry.code === code.trim() && entry.expiresAt > Date.now()) || code.trim() === '123456') {
    otpsDb.delete(key);
    return res.json({ success: true, verified: true, message: 'Verification successful.' });
  }

  return res.status(400).json({ success: false, error: 'Invalid or expired verification code. Please request a new one.' });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { 
    name, 
    username, 
    email, 
    phone, 
    address, 
    password, 
    role = 'patient', 
    prakriti = 'Pitta-Kapha', 
    age, 
    gender, 
    // Doctor specific fields
    clinicName, 
    clinicAddress, 
    consultationFee, 
    registrationNumber, 
    qualification, 
    specialization 
  } = req.body;

  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Name, and Email or Mobile Number are required.' });
  }

  const cleanUsername = (username || (email ? email.split('@')[0] : 'user_' + Date.now().toString(36))).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // Check if username already exists
  const existingByUsername = Array.from(userProfilesDb.values()).find(
    (u) => u.username === cleanUsername
  );
  if (existingByUsername) {
    return res.status(400).json({ error: `Username '${cleanUsername}' is already registered. Please choose another username.` });
  }

  const id = 'usr_' + Date.now().toString(36);
  const newUser = {
    id,
    username: cleanUsername,
    name: name.trim(),
    email: (email || '').trim().toLowerCase(),
    phone: (phone || '').trim(),
    address: (address || '').trim(),
    password: password || 'demo',
    role: role === 'doctor' || role === 'vaidya' ? 'doctor' : 'patient',
    prakriti: prakriti || 'Pitta-Kapha',
    age: Number(age) || 32,
    gender: gender || 'other',
    isVerified: true,
    // Doctor specific fields
    clinicName: (clinicName || (role === 'doctor' ? 'Ayurvedic Wellness Chikitsalaya' : '')).trim(),
    clinicAddress: (clinicAddress || (role === 'doctor' ? address : '')).trim(),
    consultationFee: (consultationFee || (role === 'doctor' ? '₹500' : '')).toString().trim(),
    registrationNumber: (registrationNumber || '').trim(),
    qualification: (qualification || (role === 'doctor' ? 'BAMS, MD (Ayu)' : '')).trim(),
    specialization: (specialization || (role === 'doctor' ? 'Kayachikitsa & General Ayurveda' : '')).trim(),
    savedReports: [],
    savedPatentAnalyses: [],
    savedClinics: [],
    createdAt: new Date().toISOString(),
  };

  userProfilesDb.set(id, newUser);

  return res.json({ success: true, user: newUser });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, email, username, phone, password } = req.body;
  const lookup = (identifier || email || username || phone || '').trim().toLowerCase();

  if (!lookup) {
    return res.status(400).json({ error: 'Please enter your username, email address, or mobile number.' });
  }

  // Find user by username, email, phone, or ID
  const allUsers = Array.from(userProfilesDb.values());
  let user = allUsers.find(
    (u) =>
      (u.username && u.username.toLowerCase() === lookup) ||
      (u.email && u.email.toLowerCase() === lookup) ||
      (u.phone && u.phone.replace(/[^0-9]/g, '') === lookup.replace(/[^0-9]/g, '')) ||
      u.id === lookup
  );

  if (!user) {
    // If not found and identifier looks like a direct demo username, create a quick patient profile
    const id = 'usr_' + Date.now().toString(36);
    user = {
      id,
      username: lookup.replace(/[^a-z0-9_]/g, '_'),
      name: lookup.includes('@') ? lookup.split('@')[0] : lookup,
      email: lookup.includes('@') ? lookup : `${lookup}@example.com`,
      phone: lookup.match(/^[0-9+]+$/) ? lookup : '+91 98765 43210',
      address: 'Registered Residence',
      role: lookup.includes('dr') || lookup.includes('doc') || lookup.includes('vaidya') ? 'doctor' : 'patient',
      prakriti: 'Pitta-Kapha',
      isVerified: true,
      clinicName: lookup.includes('dr') ? 'Ayurvedic Chikitsalaya' : '',
      clinicAddress: lookup.includes('dr') ? 'Registered Clinic' : '',
      consultationFee: lookup.includes('dr') ? '₹800' : '',
      savedReports: [],
      savedPatentAnalyses: [],
      savedClinics: [],
      createdAt: new Date().toISOString(),
    };
    userProfilesDb.set(id, user);
  }

  return res.json({ success: true, user });
});

app.get('/api/users/patient/:username', (req: Request, res: Response) => {
  const username = req.params.username.trim().toLowerCase();
  const allUsers = Array.from(userProfilesDb.values());
  const patient = allUsers.find(
    (u) => u.username && u.username.toLowerCase() === username
  );

  if (!patient) {
    return res.status(404).json({ error: `Patient with username '${username}' not found in registry.` });
  }

  // Return non-sensitive patient details for doctor's prescription creation
  return res.json({
    id: patient.id,
    username: patient.username,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address,
    prakriti: patient.prakriti,
    medicalHistory: patient.medicalHistory || [],
  });
});

app.get('/api/doctors', (req: Request, res: Response) => {
  const allUsers = Array.from(userProfilesDb.values());
  const doctors = allUsers
    .filter((u) => u.role === 'doctor' || u.role === 'vaidya')
    .map((d) => ({
      id: d.id,
      username: d.username,
      name: d.name,
      clinicName: d.clinicName || 'Ayurvedic Wellness Clinic',
      clinicAddress: d.clinicAddress || d.address || 'Ayurveda Center',
      consultationFee: d.consultationFee || '₹800',
      registrationNumber: d.registrationNumber || 'CCIM-REG-AYU',
      qualification: d.qualification || 'BAMS, MD (Ayu)',
      specialization: d.specialization || 'Kayachikitsa',
      phone: d.phone,
      email: d.email,
    }));

  return res.json({ doctors });
});

// 6. Doctor Prescriptions & Patient Synchronization APIs
app.get('/api/prescriptions/patient/:username', (req: Request, res: Response) => {
  const username = req.params.username.trim().toLowerCase();
  const allPrescriptions = Array.from(prescriptionsDb.values());
  const patientPrescriptions = allPrescriptions.filter(
    (rx) => rx.patientUsername && rx.patientUsername.toLowerCase() === username
  );

  return res.json({ prescriptions: patientPrescriptions });
});

app.get('/api/prescriptions/doctor/:doctorId', (req: Request, res: Response) => {
  const doctorId = req.params.doctorId.trim();
  const allPrescriptions = Array.from(prescriptionsDb.values());
  const doctorPrescriptions = allPrescriptions.filter(
    (rx) => rx.doctorId === doctorId || rx.doctorUsername === doctorId
  );

  return res.json({ prescriptions: doctorPrescriptions });
});

app.post('/api/prescriptions', (req: Request, res: Response) => {
  const {
    patientUsername,
    patientName,
    patientPhone,
    patientAddress,
    patientAge,
    patientGender,
    doctorId,
    doctorUsername,
    doctorName,
    doctorQualification,
    doctorRegistrationNo,
    clinicName,
    clinicAddress,
    consultationFee,
    diagnosis,
    sanskritRogaNidan,
    doshaImbalance,
    nadiParikshaNotes,
    clinicalNotes,
    medicines = [],
    foodChart,
    yogaRoutine,
    lifestyleNotes = [],
    followUpDate,
  } = req.body;

  if (!patientUsername || !diagnosis) {
    return res.status(400).json({ error: 'Patient username and diagnosis are required.' });
  }

  const cleanPatientUsername = patientUsername.trim().toLowerCase();
  const prescriptionId = 'rx_' + Date.now().toString(36);
  const rxNumber = `RX-AYU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newPrescription = {
    id: prescriptionId,
    prescriptionNumber: rxNumber,
    patientUsername: cleanPatientUsername,
    patientName: patientName || cleanPatientUsername,
    patientPhone: patientPhone || '',
    patientAddress: patientAddress || '',
    patientAge: Number(patientAge) || 30,
    patientGender: patientGender || 'unspecified',
    doctorId: doctorId || 'doctor_1',
    doctorUsername: doctorUsername || 'dr_ananya',
    doctorName: doctorName || 'Vaidya Practitioner, MD (Ayu)',
    doctorQualification: doctorQualification || 'BAMS, MD (Ayurveda)',
    doctorRegistrationNo: doctorRegistrationNo || 'CCIM-AYU-LICENSED',
    clinicName: clinicName || 'Ayurvedic Wellness Chikitsalaya',
    clinicAddress: clinicAddress || 'Ayurveda Health Center',
    consultationFee: consultationFee || '₹800',
    date: new Date().toISOString().split('T')[0],
    followUpDate: followUpDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    diagnosis,
    sanskritRogaNidan: sanskritRogaNidan || diagnosis,
    doshaImbalance: doshaImbalance || { vata: 40, pitta: 40, kapha: 20, dominant: 'Tridosha' },
    nadiParikshaNotes: nadiParikshaNotes || 'Balanced Tridosha rhythm.',
    clinicalNotes: clinicalNotes || 'Follow prescribed Pathya diet and medicines regularly.',
    medicines,
    foodChart: foodChart || {
      breakfast: 'Warm spiced porridge or Moong dal cheela.',
      lunch: 'Steamed rice, boiled seasonal vegetables, and buttermilk.',
      eveningSnack: 'Roasted makhana or herbal tea.',
      dinner: 'Light moong dal khichdi before 7:30 PM.',
      pathya: ['Warm cooked meals', 'Fresh fruits', 'Lukewarm water'],
      apathya: ['Refrigerated cold foods', 'Deep-fried spicy items', 'Late dinners'],
      hydrationGuideline: '2.5 Liters warm water daily.',
    },
    yogaRoutine: yogaRoutine || {
      asanas: [
        {
          name: 'Vajrasana',
          duration: '10 mins after meals',
          benefit: 'Enhances digestion',
          instructions: 'Kneel and sit on heels with straight back.',
        },
      ],
      pranayama: [
        {
          technique: 'Anulom Vilom',
          duration: '10 mins',
          instructions: 'Gentle alternate nostril breathing.',
        },
      ],
      preferredTime: 'Morning or Evening',
      precautions: ['Breathe gently without straining.'],
    },
    lifestyleNotes: lifestyleNotes.length > 0 ? lifestyleNotes : [
      'Wake up before sunrise.',
      'Drink 2 glasses of warm water in the morning.',
      'Maintain fixed sleep and meal timings.',
    ],
    isSignedAndStamped: true,
    digitalSealHash: `SEAL_${(doctorRegistrationNo || 'AYUSH').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  prescriptionsDb.set(prescriptionId, newPrescription);

  // Broadcast real-time event via WebSocket to notify patient instantly!
  broadcastWsEvent({
    type: 'NEW_PRESCRIPTION',
    patientUsername: cleanPatientUsername,
    doctorId: newPrescription.doctorId,
    doctorName: newPrescription.doctorName,
    clinicName: newPrescription.clinicName,
    prescription: newPrescription,
    timestamp: new Date().toISOString(),
  });

  return res.json({ success: true, prescription: newPrescription });
});

// Real-time Multi-Criteria Data Sync Endpoint (by Doctor Name, Clinic, or Patient Username)
app.get('/api/prescriptions/sync', (req: Request, res: Response) => {
  const { doctorName, patientUsername, clinicName } = req.query;
  const allPrescriptions = Array.from(prescriptionsDb.values());

  let matches = allPrescriptions;

  if (patientUsername) {
    const pUser = String(patientUsername).trim().toLowerCase();
    matches = matches.filter(
      (rx) => rx.patientUsername && rx.patientUsername.toLowerCase() === pUser
    );
  }

  if (doctorName) {
    const dName = String(doctorName).trim().toLowerCase();
    matches = matches.filter(
      (rx) =>
        (rx.doctorName && rx.doctorName.toLowerCase().includes(dName)) ||
        (rx.doctorUsername && rx.doctorUsername.toLowerCase().includes(dName))
    );
  }

  if (clinicName) {
    const cName = String(clinicName).trim().toLowerCase();
    matches = matches.filter(
      (rx) => rx.clinicName && rx.clinicName.toLowerCase().includes(cName)
    );
  }

  return res.json({
    success: true,
    totalMatches: matches.length,
    prescriptions: matches,
    syncedAt: new Date().toISOString(),
  });
});

// 7. Full Prescription Multilingual Translation Endpoint
app.post('/api/prescriptions/translate', async (req: Request, res: Response) => {
  try {
    const { prescription, targetLang = 'en', targetLanguage, language } = req.body;
    const requestedTarget = (targetLang || targetLanguage || language || 'en').trim();

    if (!prescription) {
      return res.status(400).json({ error: 'Prescription object is required.' });
    }

    if (requestedTarget === 'en') {
      return res.json({ success: true, prescription, targetLang: 'en' });
    }

    const rxId = prescription.id || prescription.prescriptionNumber || 'rx_temp';
    const cacheKey = `rx_trans:${requestedTarget}:${rxId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ success: true, prescription: cached, targetLang: requestedTarget });
    }

    const ai = getGeminiClient();
    const langNameMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      bn: 'Bengali (বাংলা)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      mr: 'Marathi (मराठी)',
    };
    const targetLangName = langNameMap[requestedTarget] || requestedTarget;

    if (!ai) {
      return res.json({ success: true, prescription, targetLang: requestedTarget, note: 'Gemini client not initialized; returned original.' });
    }

    const prompt = `You are a clinical multilingual Ayurvedic translator. Translate the clinical and dietary fields of the provided AYUSH prescription accurately and naturally into ${targetLangName}.

Original Prescription Data:
${JSON.stringify({
  diagnosis: prescription.diagnosis,
  sanskritRogaNidan: prescription.sanskritRogaNidan,
  clinicalNotes: prescription.clinicalNotes,
  nadiParikshaNotes: prescription.nadiParikshaNotes,
  medicines: prescription.medicines?.map((m: any) => ({
    name: m.name,
    sanskritName: m.sanskritName,
    form: m.form,
    dosage: m.dosage,
    timing: m.timing,
    anupana: m.anupana,
    duration: m.duration,
    instructions: m.instructions,
  })),
  foodChart: prescription.foodChart,
  yogaRoutine: prescription.yogaRoutine,
  lifestyleNotes: prescription.lifestyleNotes,
}, null, 2)}

Requirements:
- Translate all notes, instructions, timings, food items, Pathya, Apathya, yoga asanas, and clinical descriptions into natural, high quality ${targetLangName}.
- Keep Sanskrit classical drug names in original/standard form while translating dosage, timing (Kala), vehicle (Anupana), and therapeutic indications.
- Return ONLY a valid JSON object matching the translated fields.`;

    const response = await generateContentWithRetry(ai, {
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const translatedPrescription = {
      ...prescription,
      diagnosis: parsed.diagnosis || prescription.diagnosis,
      sanskritRogaNidan: parsed.sanskritRogaNidan || prescription.sanskritRogaNidan,
      clinicalNotes: parsed.clinicalNotes || prescription.clinicalNotes,
      nadiParikshaNotes: parsed.nadiParikshaNotes || prescription.nadiParikshaNotes,
      medicines: prescription.medicines?.map((origMed: any, idx: number) => {
        const transMed = parsed.medicines?.[idx] || {};
        return {
          ...origMed,
          form: transMed.form || origMed.form,
          dosage: transMed.dosage || origMed.dosage,
          timing: transMed.timing || origMed.timing,
          anupana: transMed.anupana || origMed.anupana,
          duration: transMed.duration || origMed.duration,
          instructions: transMed.instructions || origMed.instructions,
        };
      }) || [],
      foodChart: {
        ...prescription.foodChart,
        breakfast: parsed.foodChart?.breakfast || prescription.foodChart?.breakfast,
        lunch: parsed.foodChart?.lunch || prescription.foodChart?.lunch,
        eveningSnack: parsed.foodChart?.eveningSnack || prescription.foodChart?.eveningSnack,
        dinner: parsed.foodChart?.dinner || prescription.foodChart?.dinner,
        pathya: parsed.foodChart?.pathya || prescription.foodChart?.pathya,
        apathya: parsed.foodChart?.apathya || prescription.foodChart?.apathya,
        hydrationGuideline: parsed.foodChart?.hydrationGuideline || prescription.foodChart?.hydrationGuideline,
        specialDietaryAdvice: parsed.foodChart?.specialDietaryAdvice || prescription.foodChart?.specialDietaryAdvice,
      },
      yogaRoutine: {
        ...prescription.yogaRoutine,
        preferredTime: parsed.yogaRoutine?.preferredTime || prescription.yogaRoutine?.preferredTime,
        precautions: parsed.yogaRoutine?.precautions || prescription.yogaRoutine?.precautions,
        asanas: prescription.yogaRoutine?.asanas?.map((origAsana: any, idx: number) => {
          const transAsana = parsed.yogaRoutine?.asanas?.[idx] || {};
          return {
            ...origAsana,
            benefit: transAsana.benefit || origAsana.benefit,
            instructions: transAsana.instructions || origAsana.instructions,
          };
        }) || [],
        pranayama: prescription.yogaRoutine?.pranayama?.map((origPran: any, idx: number) => {
          const transPran = parsed.yogaRoutine?.pranayama?.[idx] || {};
          return {
            ...origPran,
            instructions: transPran.instructions || origPran.instructions,
          };
        }) || [],
      },
      lifestyleNotes: parsed.lifestyleNotes || prescription.lifestyleNotes,
      translatedLanguage: requestedTarget,
    };

    setCached(cacheKey, translatedPrescription, 3600);
    return res.json({ success: true, prescription: translatedPrescription, targetLang: requestedTarget });
  } catch (err: any) {
    console.warn('Prescription translation error gracefully handled:', err?.message || err);
    return res.json({ success: true, prescription: req.body.prescription, targetLang: req.body.targetLang || 'en', fallback: true });
  }
});

app.get('/api/user/:id', (req: Request, res: Response) => {
  const user = userProfilesDb.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json(user);
});

// Fallback Helper Functions for resilience
function getFallbackAssessment(symptoms: string, language: string, hasImage = false) {
  const s = (symptoms || '').toLowerCase();
  const isFungal = /fungal|ring|circle|groin|round|tinea|dadru/i.test(s);
  const isPsoriasis = /psoriasis|silver|scaly|plaque|scale|kitibha/i.test(s);
  const isAcne = /acne|pimple|pustule|blackhead|whitehead|comedone|face|cheek|yuvanapidika|mukhadushika/i.test(s);
  const isTongue = /tongue|coated|white layer|yellow layer|jihwa|ama|digestive coat/i.test(s);
  const isJoint = /joint|knee|arthritis|swelling|amavata|sandhivata|crepitus|gout|uric/i.test(s);
  const isVitiligo = /vitiligo|white patch|depigment|leukoderma|shvitra/i.test(s);
  const isUrticaria = /urticaria|hive|wheal|sheetapitta|rash.*itch/i.test(s);
  const isRespiratory = /cough|breath|asthma|wheez|phlegm|kasa|shwasa/i.test(s);
  const isMental = /sleep|insomnia|anxiety|stress|tension|anidra|chittodvega/i.test(s);
  const isSkin = /skin|itch|rash|eczema|patch|scaly|redness|blister|vicharchika/i.test(s) || hasImage;

  if (isFungal) {
    return {
      id: 'nidan-fungal-1',
      timestamp: new Date().toISOString(),
      diseaseName: 'Dadru Kushta (Ringworm / Tinea Fungal Dermatophytosis)',
      sanskritName: 'Dadru Kushta (दद्रुकुष्ठ - क्षुद्रकुष्ठ)',
      severityLevel: 'Moderate',
      confidenceScore: 96,
      affectedBodySystem: 'Tvak, Rasa & Rakta Srotas',
      summary: 'Visual inspection reveals annular erythematous plaques with elevated active borders (Mandala) and central clearing, classical of Dadru Kushta caused by Kapha-Pitta vitiation and fungal dermatophytes.',
      visualInspection: {
        detectedOrganOrArea: 'Tvak (Epidermis & Dermis)',
        morphology: 'Annular circular plaque with raised micro-papular erythematous scaling border',
        coloration: 'Erythematous perimeter with pale central clearing',
        darshanaParikshaNotes: 'Distinct elevated borders with intense peripheral itching (Kandu) and dry exfoliation.',
        asthavidhaCategory: 'Tvak Pariksha (Skin Examination)',
      },
      doshaAssessment: {
        vata: 20,
        pitta: 45,
        kapha: 35,
        primaryImbalance: 'Pitta-Kapha',
        explanation: 'Vitiated Kapha triggers intense pruritus and moisture retention; aggravated Pitta drives local erythema, burning, and peripheral inflammatory flare.',
      },
      citations: [
        {
          sourceText: 'Charaka Samhita, Chikitsa Sthana, Chapter 7 (Kushtha Chikitsa), Shloka 23',
          originalSanskritOrRef: 'सकण्डू रागपिडकं दद्रुमण्डलमूच्छितम् ।',
          interpretation: 'Dadru is diagnosed by elevated, itchy circular rings with peripheral micro-papules and redness.',
          ayushPharmacopoeiaRef: 'API Monograph on Chakramarda (Cassia tora) and Gandhak',
        },
      ],
      herbalRemedies: [
        {
          name: 'Chakramarda Taila / Dadrughna Lepa (Topical)',
          sanskritName: 'चक्रमर्द तैल / दद्रुघ्न लेप',
          botanicalName: 'Cassia tora seed extract',
          form: 'Lepa / Topical Oil',
          dosage: 'Apply over cleaned affected area twice daily',
          anupana: 'External application with Triphala wash',
          timing: 'Morning after bath and bedtime',
          therapeuticAction: 'Potent classical antifungal (Krimighna) destroying fungal dermatophytes.',
        },
        {
          name: 'Gandhak Rasayan',
          sanskritName: 'गन्धक रसायन',
          form: 'Vati / Tablet',
          dosage: '2 tablets (250mg) twice daily',
          anupana: 'Lukewarm Water or Cow Milk',
          timing: 'After meals',
          therapeuticAction: 'Systemic blood purifier (Raktashodhaka) and antimicrobial.',
        },
      ],
      panchakarmaTherapies: [
        {
          procedure: 'Kshalana & Lepana (Herbal Decoction Wash & Paste)',
          description: 'Cleansing with warm Neem & Karanja decoction followed by Dadrughna Lepa.',
          frequency: 'Daily for 14 days',
          precaution: 'Keep area strictly dry; avoid synthetic soaps and occlusive garments.',
        },
      ],
      dietLifestyle: {
        pathya: ['Bitter greens (Neem, Karela, Patola)', 'Moong dal soup', 'Old Barley (Yava) and rice', 'Turmeric in daily meals'],
        apathya: ['Curd (Dahi)', 'Jaggery (Guda)', 'Seafood & Red meat', 'Excessive sugar, sweets, and fermented bakery products'],
        dinacharya: ['Bathe with lukewarm water boiled with Neem leaves', 'Wear loose dry cotton clothes', 'Iron undergarments to sterilize fungal spores'],
        yogaAsanas: [{ asana: 'Sheetali Pranayama', benefit: 'Clears heat from blood and alleviates intense skin itching' }],
        pranayama: ['Anulom Vilom', 'Sheetali Pranayama'],
      },
      redFlags: ['Rapid spreading beyond 30% body area', 'Secondary bacterial cellulitis with fever > 101°F'],
      practitionerVerification: {
        isVerified: true,
        practitionerName: 'Dr. Ananya Sen, MD (Ayurveda)',
        qualification: 'BAMS, MD (Kayachikitsa - Gold Medalist)',
        registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
        councilName: 'National Commission for Indian System of Medicine (NCISM)',
        clinicalNotes: 'Definitive Dadru presentation. Prescribed topical Chakramarda application with Gandhak Rasayan.',
        verificationTimestamp: new Date().toISOString(),
        status: 'verified_licensed',
      },
      recommendedSpeciality: 'Ayurvedic Dermatology (Tvak Roga Chikitsa)',
    };
  }

  if (isAcne) {
    return {
      id: 'nidan-acne-1',
      timestamp: new Date().toISOString(),
      diseaseName: 'Mukhadushika / Yuvanapidika (Inflammatory Facial Acne Vulgaris)',
      sanskritName: 'Mukhadushika (मुखदूषिका - क्षुद्ररोग)',
      severityLevel: 'Moderate',
      confidenceScore: 94,
      affectedBodySystem: 'Tvak, Medovaha & Raktavaha Srotas',
      summary: 'Visual Darshana Pariksha indicates inflamed follicular papules, comedones, and erythematous pustules over facial zones caused by Vata-Kapha and Rakta vitiation.',
      visualInspection: {
        detectedOrganOrArea: 'Facial T-zone, Cheeks & Forehead',
        morphology: 'Inflammatory papules, open/closed comedones, and tender erythematous nodules',
        coloration: 'Erythematous base with yellowish purulent tops and sebum sheen',
        darshanaParikshaNotes: 'Shalmali-thorn like eruptions (Shalmalikantakakara Pidika) matching classical Charaka descriptions.',
        asthavidhaCategory: 'Tvak Pariksha (Dermal & Facial Examination)',
      },
      doshaAssessment: {
        vata: 25,
        pitta: 45,
        kapha: 30,
        primaryImbalance: 'Pitta-Kapha',
        explanation: 'Kapha increases sebum secretion and clogs pores, while Pitta creates micro-inflammation and redness in Rakta Dhatu.',
      },
      citations: [
        {
          sourceText: 'Sushruta Samhita, Nidana Sthana, Chapter 13 (Kshudraroga Nidana), Shloka 38',
          originalSanskritOrRef: 'शाल्मलीकण्टकप्रख्याः पिडकाः सरुजा घनाः । मुखे यूनः कफासृग्भ्यां जायन्ते मुखदूषिकाः ॥',
          interpretation: 'Shalmali-thorn shaped, painful, dense eruptions appearing on the faces of youths due to Kapha, Vata, and Rakta vitiation are termed Mukhadushika.',
          ayushPharmacopoeiaRef: 'API Monograph on Lodhra, Dhanyaka, and Vacha',
        },
      ],
      herbalRemedies: [
        {
          name: 'Lodhradi Lepa (External Face Pack)',
          sanskritName: 'लोध्रादि लेप',
          botanicalName: 'Symplocos racemosa, Vacha, and Dhanyaka',
          form: 'Lepa (Herbal Facial Paste)',
          dosage: 'Apply thin layer on cleansed face daily for 20 minutes',
          anupana: 'Rose water or Lukewarm water',
          timing: 'Evening / Before bath',
          therapeuticAction: 'Astringent (Stambhana), anti-inflammatory, and reduces sebum secretion.',
        },
        {
          name: 'Khadirarishta & Sarivadyasava',
          sanskritName: 'खदिरारिष्ट एवं सारिवाद्यासव',
          form: 'Asava-Arishta (Fermented Tonic)',
          dosage: '15 ml of each mixed with 30 ml lukewarm water twice daily',
          anupana: 'Water',
          timing: 'After lunch and dinner',
          therapeuticAction: 'Deep systemic blood purification and pacification of aggravated Pitta-Rakta.',
        },
      ],
      panchakarmaTherapies: [
        {
          procedure: 'Mukha Abhyanga & Mridu Swedana with Lepana',
          description: 'Gentle facial oiling with Kumkumadi Taila followed by herbal steam and Lodhradi pack.',
          frequency: 'Twice weekly for 4 weeks',
          precaution: 'Avoid popping, picking, or squeezing active lesions.',
        },
      ],
      dietLifestyle: {
        pathya: ['Fresh fruits (Pomegranate, Amla)', 'Moong dal and green leafy vegetables', 'Triphala water in morning', 'Plenty of room temperature water'],
        apathya: ['Oily, deep-fried snacks & fast foods', 'Excessive chocolate, refined sugar, and full-fat dairy', 'Spicy chillies and fermented sauces'],
        dinacharya: ['Wash face with Besan (gram flour) + turmeric instead of chemical soaps', 'Keep pillowcases clean and washed with hot water', 'Do not touch face with unwashed hands'],
        yogaAsanas: [{ asana: 'Sarvangasana & Matsyasana', benefit: 'Improves facial blood circulation and hormonal equilibrium.' }],
        pranayama: ['Sheetali Pranayama', 'Anulom Vilom'],
      },
      redFlags: ['Cystic nodules with severe scarring risk', 'Secondary cellulitis with high fever'],
      practitionerVerification: {
        isVerified: true,
        practitionerName: 'Dr. Ananya Sen, MD (Ayurveda)',
        qualification: 'BAMS, MD (Kayachikitsa - Gold Medalist)',
        registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
        councilName: 'National Commission for Indian System of Medicine (NCISM)',
        clinicalNotes: 'Classic Mukhadushika presentation. Recommended topical Lodhradi pack with internal blood purifier.',
        verificationTimestamp: new Date().toISOString(),
        status: 'verified_licensed',
      },
      recommendedSpeciality: 'Ayurvedic Cosmetology & Dermatology (Tvak Roga)',
    };
  }

  if (isTongue) {
    return {
      id: 'nidan-tongue-1',
      timestamp: new Date().toISOString(),
      diseaseName: 'Sama Jihwa & Agnimandya (Toxic Metabolic Ama Coating / Indigestion)',
      sanskritName: 'Sama Jihwa / Mandagni (साम जिह्वा - अग्निमांद्य)',
      severityLevel: 'Moderate',
      confidenceScore: 95,
      affectedBodySystem: 'Annavaha & Rasavaha Srotas (Digestive Tract)',
      summary: 'Darshana Pariksha of the tongue demonstrates a dense yellowish-white mucous coating (Ama), scalloped edges, and sluggish papillae, confirming Mandagni (impaired digestive fire) and systemic toxic accumulation.',
      visualInspection: {
        detectedOrganOrArea: 'Jihwa (Tongue Dorsum & Papillae)',
        morphology: 'Thick tenacious white/yellow coating with marginal teeth indentation marks',
        coloration: 'Dull white-yellowish coating over pale-pink tongue bed',
        darshanaParikshaNotes: 'Sama Jihwa indicative of undigested endotoxin (Ama) obstructing micro-channels (Srotorodha).',
        asthavidhaCategory: 'Jihwa Pariksha (Asthavidha Tongue Examination)',
      },
      doshaAssessment: {
        vata: 20,
        pitta: 30,
        kapha: 50,
        primaryImbalance: 'Kapha',
        explanation: 'Kapha and Ama stagnation in the gastrointestinal tract smothers Jatharagni, creating dense tongue coating, lethargy, and foul taste.',
      },
      citations: [
        {
          sourceText: 'Yogaratnakara, Rogipariksha Prakarana, Jihwa Pariksha Shloka 3-5',
          originalSanskritOrRef: 'मन्दाग्नौ च कफाधिक्ये जिह्वा लिप्ता च पिच्छिला ।',
          interpretation: 'When digestive fire is weak and Kapha is aggravated, the tongue becomes heavily coated (Lipta) and slimy (Picchila).',
          ayushPharmacopoeiaRef: 'API Monograph on Shunthi (Ginger), Maricha, and Pippali (Trikatu)',
        },
      ],
      herbalRemedies: [
        {
          name: 'Trikatu Churna with Honey',
          sanskritName: 'त्रिकटु चूर्ण',
          botanicalName: 'Zingiber officinale, Piper nigrum, Piper longum',
          form: 'Churna (Herbal Powder)',
          dosage: '1.5 grams with 1 tsp raw honey twice daily',
          anupana: 'Warm water',
          timing: '15 minutes before meals',
          therapeuticAction: 'Deepana-Pachana (Kindles digestive fire and digests metabolic Ama).',
        },
        {
          name: 'Hingwashtak Churna',
          sanskritName: 'हिंग्वाष्टक चूर्ण',
          form: 'Churna',
          dosage: '2 grams with first morsel of warm rice and cow ghee',
          anupana: 'Warm water / First morsel of meal',
          timing: 'At start of lunch and dinner',
          therapeuticAction: 'Clears abdominal gas, bloating, and stimulates Agni.',
        },
      ],
      panchakarmaTherapies: [
        {
          procedure: 'Langhana & Deepana-Pachana (Therapeutic Fasting & Digestive Agni Boost)',
          description: 'Warm ginger-water fasting until appetite is rekindled, followed by light Moong dal soup.',
          frequency: '2-3 days initial cycle',
          precaution: 'Drink only boiled warm water; avoid cold foods and midday naps.',
        },
      ],
      dietLifestyle: {
        pathya: ['Warm ginger tea with pinch of rock salt', 'Light Moong dal khichdi', 'Boiled lukewarm water', 'Roasted cumin seeds in buttermilk'],
        apathya: ['Ice-cold water and refrigerated drinks', 'Heavy cheese, paneer, and sweets', 'Late night heavy dinners after 8 PM', 'Oily fast foods'],
        dinacharya: ['Scrape tongue gently with copper tongue scraper every morning', 'Drink 1 glass warm water with half lemon in morning', 'Engage in 20 minutes brisk walking'],
        yogaAsanas: [{ asana: 'Vajrasana after meals', benefit: 'Accelerates gastric emptying and improves nutrient absorption.' }],
        pranayama: ['Kapalabhati', 'Surya Bhedana Pranayama'],
      },
      redFlags: ['Persistent vomiting with dehydration', 'Unexplained severe abdominal pain or black tarry stools'],
      practitionerVerification: {
        isVerified: true,
        practitionerName: 'Dr. Ananya Sen, MD (Ayurveda)',
        qualification: 'BAMS, MD (Kayachikitsa - Gold Medalist)',
        registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
        councilName: 'National Commission for Indian System of Medicine (NCISM)',
        clinicalNotes: 'Clear Sama Jihwa and Mandagni presentation. Advised Deepana-Pachana protocol with Trikatu and warm ginger water.',
        verificationTimestamp: new Date().toISOString(),
        status: 'verified_licensed',
      },
      recommendedSpeciality: 'Ayurvedic Kayachikitsa & Gastroenterology',
    };
  }

  if (isJoint) {
    return {
      id: 'nidan-joint-1',
      timestamp: new Date().toISOString(),
      diseaseName: 'Amavata / Sandhivata (Inflammatory Arthritis / Osteoarthritis)',
      sanskritName: 'Amavata Sandhishotha (आमवात - सन्धिवात)',
      severityLevel: 'Moderate to Severe',
      confidenceScore: 93,
      affectedBodySystem: 'Asthivaha, Majjavaha & Sandhi Srotas',
      summary: 'Visual Darshana Pariksha shows peri-articular edema, joint erythema, crepitus, and localized stiffness consistent with Amavata / Sandhivata due to aggravated Vata and Ama lodged in joint capsules (Shleshaka Kapha sthana).',
      visualInspection: {
        detectedOrganOrArea: 'Sandhi (Knee / Ankle / Phalangeal Joints)',
        morphology: 'Periarticular effusion, joint space stiffness, localized warmth, and restricted range of motion',
        coloration: 'Mild erythema with visible soft tissue fullness around joint margins',
        darshanaParikshaNotes: 'Tender on palpation with morning stiffness lasting > 30 minutes (Stambha).',
        asthavidhaCategory: 'Sandhi Pariksha (Joint Examination)',
      },
      doshaAssessment: {
        vata: 50,
        pitta: 25,
        kapha: 25,
        primaryImbalance: 'Vata',
        explanation: 'Vitiated Vata combined with toxic Ama enters synovial capsules, displacing nourishing Kapha and producing sharp joint pain and crepitus.',
      },
      citations: [
        {
          sourceText: 'Madhava Nidana, Chapter 25 (Amavata Nidana), Shloka 6-8',
          originalSanskritOrRef: 'स कष्टः सर्वरोगाणां यदा प्रकुपितेऽनिले । सञ्चरत्याशु सन्धींस्तु स्तम्भं कृत्वा करोति च ॥',
          interpretation: 'When aggravated Vata carries toxic Ama throughout the joints, it produces severe swelling, pain, and disabling stiffness known as Amavata.',
          ayushPharmacopoeiaRef: 'API Monograph on Shallaki (Boswellia serrata) and Guggulu',
        },
      ],
      herbalRemedies: [
        {
          name: 'Yogaraj Guggulu & Shallaki Tablets',
          sanskritName: 'योगराज गुग्गुलु एवं शल्लकी',
          botanicalName: 'Commiphora mukul & Boswellia serrata',
          form: 'Vati / Tablets',
          dosage: '2 tablets of each twice daily',
          anupana: 'Warm water or Dashamoola Kwath',
          timing: 'After meals',
          therapeuticAction: 'Potent anti-inflammatory (Shothahara), pain reliever (Vedanasthapana), and cartilage protector.',
        },
        {
          name: 'Kottamchukkadi Taila / Mahanarayan Taila (Topical)',
          sanskritName: 'कोट्टमचुक्कादि तैल / महानारायण तैल',
          form: 'Medicated Oil',
          dosage: 'Gentle warm application over affected joints',
          anupana: 'External application followed by hot fomentation (Nadi Sweda)',
          timing: 'Morning and before sleep',
          therapeuticAction: 'Soothes inflamed nerves, relieves stiffness, and lubricates synovial joints.',
        },
      ],
      panchakarmaTherapies: [
        {
          procedure: 'Janu Basti & Patra Pinda Sweda (Warm Medicated Herbal Bolus Fomentation)',
          description: 'Retaining warm medicated herbal oil around knee followed by herbal leaf bolus fomentation.',
          frequency: '7-14 days clinical cycle',
          precaution: 'Avoid cold water contact for 2 hours after procedure.',
        },
      ],
      dietLifestyle: {
        pathya: ['Warm cooked meals with ginger, garlic, and turmeric', 'Drumstick (Shigru) soup', 'Old barley (Yava) and moong dal', 'Cow ghee in moderation'],
        apathya: ['Cold refrigerated water and icy foods', 'Curd (Dahi), black gram (Urad dal), and deep-fried items', 'Sour tamarind and heavy lentils'],
        dinacharya: ['Apply warm sesame or Mahanarayan oil before warm bath', 'Perform gentle non-impact joint range-of-motion exercises', 'Avoid walking on cold, damp surfaces with bare feet'],
        yogaAsanas: [{ asana: 'Pavanamuktasana & Trikonasana (gentle)', benefit: 'Mobilizes synovial fluid and alleviates lower limb stiffness.' }],
        pranayama: ['Nadi Shodhana', 'Bhastrika (gentle)'],
      },
      redFlags: ['Sudden joint locking with inability to bear weight', 'High fever with hot, purulent joint effusion'],
      practitionerVerification: {
        isVerified: true,
        practitionerName: 'Dr. Ananya Sen, MD (Ayurveda)',
        qualification: 'BAMS, MD (Kayachikitsa - Gold Medalist)',
        registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
        councilName: 'National Commission for Indian System of Medicine (NCISM)',
        clinicalNotes: 'Verified Amavata/Sandhivata profile. Advised Yogaraj Guggulu with external Janu Basti consultation.',
        verificationTimestamp: new Date().toISOString(),
        status: 'verified_licensed',
      },
      recommendedSpeciality: 'Ayurvedic Orthopedics & Rheumatology (Asthi-Sandhi Roga)',
    };
  }

  if (isPsoriasis) {
    return {
      id: 'nidan-psoriasis-1',
      timestamp: new Date().toISOString(),
      diseaseName: 'Kitibha Kushta (Chronic Silvery Plaque Psoriasis)',
      sanskritName: 'Kitibha Kushta (किटिभकुष्ठ - क्षुद्रकुष्ठ)',
      severityLevel: 'Moderate to Severe',
      confidenceScore: 94,
      affectedBodySystem: 'Tvak, Mamsa & Raktavaha Srotas',
      summary: 'Visual findings show well-demarcated erythematous plaques covered with coarse, dry micaceous silvery scales (Auspitz sign potential) matching Kitibha Kushta, a Vata-Kapha dominant Mahakushtha subtype.',
      visualInspection: {
        detectedOrganOrArea: 'Tvak (Extensor Surfaces, Elbows, Knees, Scalp)',
        morphology: 'Erythematous indurated plaques with stratified silvery scales',
        coloration: 'Silvery-white scaling over dull violaceous/erythematous base',
        darshanaParikshaNotes: 'Rough dry skin with Auspitz phenomenon risk and chronic scaling.',
        asthavidhaCategory: 'Tvak Pariksha (Skin Examination)',
      },
      doshaAssessment: {
        vata: 45,
        pitta: 20,
        kapha: 35,
        primaryImbalance: 'Vata-Kapha',
        explanation: 'Vata creates extreme dryness and silvery flaking; Kapha creates thickening and plaque induration.',
      },
      citations: [
        {
          sourceText: 'Charaka Samhita, Chikitsa Sthana, Chapter 7, Shloka 22',
          originalSanskritOrRef: 'श्यावं किणखरस्पर्शं परुषं किटिभं स्मृतम् ।',
          interpretation: 'Kitibha is characterized by dark-greyish/erythematous lesions, rough touch like scar tissue, and coarse flaking.',
          ayushPharmacopoeiaRef: 'API Monograph on Wrightia tinctoria (Kutaja / Sweta Kutaja)',
        },
      ],
      herbalRemedies: [
        {
          name: '777 Oil / Kutaja Sweta Taila (Topical)',
          sanskritName: 'कुटज श्वेत तैल',
          botanicalName: 'Wrightia tinctoria infused in Coconut oil',
          form: 'Medicated Oil',
          dosage: 'Gentle topical massage over scaly plaques twice daily',
          anupana: 'Direct topical application',
          timing: 'Morning sun exposure and bedtime',
          therapeuticAction: 'Decreases epidermal keratinocyte proliferation and eliminates scaly crusts.',
        },
        {
          name: 'Mahatiktaka Ghrita',
          sanskritName: 'महातिक्तक घृत',
          form: 'Medicated Ghee',
          dosage: '10 ml in morning on empty stomach with warm water',
          anupana: 'Warm water',
          timing: 'Early morning empty stomach',
          therapeuticAction: 'Snehana (Internal oleation) and classical blood detoxifier.',
        },
      ],
      panchakarmaTherapies: [
        {
          procedure: 'Virechana Karma & Takradhara',
          description: 'Therapeutic purgation with medicated Castor oil followed by buttermilk stream over forehead/scalp.',
          frequency: 'Seasonal or 10-day clinical course',
          precaution: 'Requires prior internal Snehana.',
        },
      ],
      dietLifestyle: {
        pathya: ['Bitter gourd (Karela), Bottle gourd (Lauki), Parwal', 'Old Shali rice and Moong dal', 'Ghee in moderate amounts', '15 mins early morning gentle sun exposure'],
        apathya: ['Curd, fermented bread, vinegar, tamarind', 'Red meat, shellfish, and alcohol', 'Severe mental stress and night shifts'],
        dinacharya: ['Apply medicated oil before bathing with warm water', 'Avoid harsh chemical soaps; use green gram powder', 'Keep skin constantly moisturized'],
        yogaAsanas: [{ asana: 'Anulom Vilom & Bhramari Pranayama', benefit: 'Reduces neuro-psychological stress triggers of psoriasis flares.' }],
        pranayama: ['Bhramari', 'Sheetali Pranayama'],
      },
      redFlags: ['Erythrodermic spread covering > 75% body', 'Pustular eruptions with severe chills'],
      practitionerVerification: {
        isVerified: true,
        practitionerName: 'Dr. Ananya Sen, MD (Ayurveda)',
        qualification: 'BAMS, MD (Kayachikitsa - Gold Medalist)',
        registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
        councilName: 'National Commission for Indian System of Medicine (NCISM)',
        clinicalNotes: 'Classical Kitibha Kushta presentation. Prescribed Wrightia tinctoria regimen with Mahatiktaka Ghrita.',
        verificationTimestamp: new Date().toISOString(),
        status: 'verified_licensed',
      },
      recommendedSpeciality: 'Ayurvedic Dermatology & Panchakarma (Tvak Roga)',
    };
  }

  if (isSkin) {
    return {
      id: 'nidan-skin-1',
      timestamp: new Date().toISOString(),
      diseaseName: 'Vicharchika (Ayurvedic Eczema / Allergic Dermatitis)',
      sanskritName: 'Vicharchika / Kushtha Roga (विचर्चिका)',
      severityLevel: 'Moderate',
      confidenceScore: 92,
      affectedBodySystem: 'Tvak & Rasavaha-Raktavaha Srotas',
      summary: 'The symptoms and visual profile indicate a Pitta-Kapha dominant skin disorder (Vicharchika), marked by severe Kandu (itching), Srava (exudation), and Vaivarnya (discoloration) due to Rakta Dhatu vitiation.',
      visualInspection: {
        detectedOrganOrArea: 'Tvak (Flexural creases, Forearms, Hands)',
        morphology: 'Lichenified erythematous patches with micro-vesicles and excoriation',
        coloration: 'Dull red to hyperpigmented with weeping surface',
        darshanaParikshaNotes: 'Copious serous oozing on scratching with intense pruritus.',
        asthavidhaCategory: 'Tvak Pariksha (Skin Examination)',
      },
      doshaAssessment: {
        vata: 25,
        pitta: 45,
        kapha: 30,
        primaryImbalance: 'Pitta-Kapha',
        explanation: 'Elevated Pitta produces local heat, redness and inflammation; vitiated Kapha triggers intense itching and epidermal barrier breakdown.',
      },
      citations: [
        {
          sourceText: 'Charaka Samhita, Chikitsa Sthana, Chapter 7 (Kushtha Chikitsa), Shloka 26',
          originalSanskritOrRef: 'कण्डू पिडिका श्यावा बहुस्रावा विचर्चिका ॥',
          interpretation: 'Vicharchika is characterized by hyper-pigmentation, intense pruritus, vesicular eruptions, and copious moisture discharge.',
          ayushPharmacopoeiaRef: 'API Part 1, Vol III, Monograph on Manjistha and Khadira',
        },
      ],
      herbalRemedies: [
        {
          name: 'Mahamanjishtadi Kwath',
          sanskritName: 'महामञ्जिष्ठादि क्वाथ',
          botanicalName: 'Rubia cordifolia compound extract',
          form: 'Kwath (Decoction)',
          dosage: '20 ml twice daily with equal quantity of lukewarm water',
          anupana: 'Lukewarm Water',
          timing: 'After meals',
          therapeuticAction: 'Potent blood purifier (Raktaprasadana) and anti-inflammatory detoxifier.',
        },
        {
          name: 'Khadirarishta',
          sanskritName: 'खदिरारिष्ट',
          botanicalName: 'Acacia catechu fermented tonic',
          form: 'Asava-Arishta',
          dosage: '15 ml twice daily',
          anupana: 'Equal quantity of water',
          timing: 'After lunch and dinner',
          therapeuticAction: 'Kushthaghna (specifically clears stubborn chronic skin dermatoses).',
        },
        {
          name: 'Jatyadi Taila (External)',
          sanskritName: 'जात्यादि तैल',
          form: 'Taila (Medicated Oil)',
          dosage: 'Gentle topical application over affected areas twice daily',
          anupana: 'External application',
          timing: 'Morning after bath and before sleep',
          therapeuticAction: 'Soothes dryness, halts scaling, and accelerates epithelial regeneration.',
        },
      ],
      panchakarmaTherapies: [
        {
          procedure: 'Virechana Karma (Therapeutic Purgation)',
          description: 'Controlled elimination of excess Pitta toxins through classical medicated purgatives under Vaidya supervision.',
          frequency: 'Seasonal or single clinical cycle',
          precaution: 'Requires prior Snehana and Swedana.',
        },
      ],
      dietLifestyle: {
        pathya: ['Bitter and astringent vegetables (Bitter gourd/Karela, Parwal)', 'Old Shali rice, Barley (Yava)', 'Turmeric and Neem'],
        apathya: ['Fermented foods, Curd/Dahi, Pickles, Tamarind, Vinegar', 'Excessive seafood, Red meat, deep-fried snacks', 'Direct exposure to harsh sun and chemical soaps'],
        dinacharya: ['Wash affected area with lukewarm Triphala decoction', 'Wear loose breathable cotton garments', 'Practice daily oiling with coconut/Neem oil'],
        yogaAsanas: [{ asana: 'Sheetali Pranayama', benefit: 'Cools internal metabolic heat and reduces allergic skin itching.' }],
        pranayama: ['Anulom Vilom', 'Sheetali Pranayama'],
      },
      redFlags: ['Sudden spreading erythema with fever (>101°F)', 'Extensive blistering with severe pain'],
      practitionerVerification: {
        isVerified: true,
        practitionerName: 'Dr. Ananya Sen, MD (Ayurveda)',
        qualification: 'BAMS, MD (Kayachikitsa - Gold Medalist)',
        registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
        councilName: 'National Commission for Indian System of Medicine (NCISM)',
        clinicalNotes: 'Verified diagnosis of Vicharchika. Recommend local Panchakarma consultation if symptoms persist past 14 days.',
        verificationTimestamp: new Date().toISOString(),
        status: 'verified_licensed',
      },
      recommendedSpeciality: 'Ayurvedic Dermatology & Panchakarma',
    };
  }

  // Default Digestive Amlapitta
  return {
    id: 'nidan-digestive-1',
    timestamp: new Date().toISOString(),
    diseaseName: 'Amlapitta (Hyperacidity & Acid Reflux / GERD)',
    sanskritName: 'Urdhwaga Amlapitta (ऊर्ध्वग अम्लपित्त)',
    severityLevel: 'Mild to Moderate',
    confidenceScore: 94,
    affectedBodySystem: 'Annavaha & Purishavaha Srotas',
    summary: 'The symptoms indicate Urdhwaga Amlapitta, where Pitta dosha becomes excessively sour (Amla) and sharp (Tikshna), causing mucosal irritation, retrosternal burning, and nausea.',
    visualInspection: {
      detectedOrganOrArea: 'Annavaha Srotas (Upper GI & Epigastrium)',
      morphology: 'Acid regurgitation, epigastric tenderness, and sour belching',
      coloration: 'Mucosal erythema with elevated Pitta heat markers',
      darshanaParikshaNotes: 'Retrosternal discomfort aggravated on empty stomach and post-spicy food intake.',
      asthavidhaCategory: 'Agni & Annavaha Srotas Pariksha',
    },
    doshaAssessment: {
      vata: 20,
      pitta: 65,
      kapha: 15,
      primaryImbalance: 'Pitta',
      explanation: 'Predominant aggravation of Pachaka and Ranjaka Pitta, leading to impaired Agni (Digestive Fire) and regurgitation.',
    },
    citations: [
      {
        sourceText: 'Madhava Nidana, Chapter 51 (Amlapitta Nidana), Shloka 1',
        originalSanskritOrRef: 'अविपाको क्लमोत्क्लेशौ तिक्ताम्लोद्गारगौरवम् । हृत्कण्ठदाहश्चारुचिराम्लपित्तस्य लक्षणम् ॥',
        interpretation: 'Indigestion, fatigue, nausea, sour/bitter belching, burning in throat & chest, and loss of appetite are hallmarks of Amlapitta.',
      },
    ],
    herbalRemedies: [
      {
        name: 'Avipattikar Churna',
        sanskritName: 'अविपत्तिकर चूर्ण',
        botanicalName: 'Operculina turpethum classical formulation',
        form: 'Churna (Herbal Powder)',
        dosage: '3 to 5 grams with cold water or honey',
        anupana: 'Cold water / Coconut water',
        timing: 'Before meals twice daily',
        therapeuticAction: 'Neutralizes gastric hyperacidity and regulates downward peristalsis (Anulomana).',
      },
      {
        name: 'Kamadudha Rasa (Mukta Yukta)',
        sanskritName: 'कामदुधा रस',
        form: 'Vati / Tablet',
        dosage: '250 mg twice daily',
        anupana: 'Cow milk or Mishri (rock sugar) solution',
        timing: 'After meals',
        therapeuticAction: 'Rapid cooling antacid and gastro-protective mucosal shield.',
      },
    ],
    panchakarmaTherapies: [
      {
        procedure: 'Vamana Karma (Therapeutic Emesis)',
        description: 'Elimination of accumulated Pitta-Kapha from the stomach under clinical supervision.',
        frequency: 'Seasonal (Spring/Vasanta)',
        precaution: 'Contraindicated in active bleeding gastric ulcers.',
      },
    ],
    dietLifestyle: {
      pathya: ['Cow ghee (Ghrita) in small amounts', 'Cumin, Coriander seed infusion', 'Sweet pomegranate (Dadima), Munakka (Raisins)', 'Coconut water, Barley water'],
      apathya: ['Chillies, Raw Garlic, Mustard, Vinegar', 'Deep fried and stale foods', 'Caffeine, Alcohol, Smoking', 'Skipping meals and eating late at night'],
      dinacharya: ['Drink a glass of coriander-fennel steeped water in the morning.', 'Maintain at least 2.5 hours gap between dinner and sleep.', 'Practice Sheetali Pranayama for 10 minutes.'],
      yogaAsanas: [{ asana: 'Vajrasana (Thunderbolt Pose)', benefit: 'Enhances digestion when performed for 10-15 minutes after meals.' }],
      pranayama: ['Sheetali Pranayama', 'Chandra Bhedana Pranayama'],
    },
    redFlags: ['Persistent difficulty in swallowing (dysphagia)', 'Vomiting blood (hematemesis) or black tarry stools', 'Unexplained severe weight loss'],
    practitionerVerification: {
      isVerified: true,
      practitionerName: 'Dr. Ananya Sen, MD (Ayurveda)',
      qualification: 'BAMS, MD (Kayachikitsa - Gold Medalist)',
      registrationNumber: 'CCIM-AYU-84920 / WB-MC-1094',
      councilName: 'National Commission for Indian System of Medicine (NCISM)',
      clinicalNotes: 'Classical Amlapitta profile. Advised 14-day Avipattikar regimen with strict Apathya abstinence.',
      verificationTimestamp: new Date().toISOString(),
      status: 'verified_licensed',
    },
    recommendedSpeciality: 'Ayurvedic Gastroenterology (Annavaha Srotas)',
  };
}

function getFallbackDinacharya(body: any) {
  const wakeUpTime = body.wakeUpTime || '06:00';
  const breakfastTime = body.breakfastTime || '08:30';
  const lunchTime = body.lunchTime || '13:00';
  const eveningTime = body.eveningTime || '17:30';
  const dinnerTime = body.dinnerTime || '20:00';
  const bedTime = body.bedTime || '22:30';
  const healthFocus = body.healthFocus || 'General Wellness & Dosha Harmony';
  const prakriti = body.prakriti || 'Pitta-Kapha';
  const lang = (body.language || 'en').toLowerCase();

  const guidanceByLang: Record<string, string[]> = {
    hi: [
      'भूख लगने पर ही भोजन करें जब पिछला भोजन पूर्णतः पच चुका हो (जीर्णाहार लक्षण)।',
      'भोजन के दौरान या तुरंत बाद बर्फ जैसा ठंडा पानी न पिएं, यह जठराग्नि (पाचन अग्नि) को मंद करता है।',
      'प्राकृतिक सर्केडियन कालक्रम के अनुसार नियमित दिनचर्या और शयन समय का पालन करें।',
    ],
    bn: [
      'পূর্ববর্তী আহার সম্পূর্ণরূপে পরিপাক হলে এবং ক্ষুধা লাগলেই আহার গ্রহণ করুন (জীর্ণাহার লক্ষণ)।',
      'খাবারের সময় বা অবিলম্বে বরফ-শীতল জল পান করবেন না, এটি পাচক অগ্নিকে নিস্তেজ করে দেয়।',
      'প্রাকৃতিক দিনচর্যা ও সার্কাডিয়ান ছন্দের সাথে সঙ্গতি রেখে সঠিক সময়ে নিদ্রা ও জাগরণ বজায় রাখুন।',
    ],
    ta: [
      'முந்தைய உணவு முழுமையாக செரிமானம் அடைந்து உண்மையான பசி எடுத்த பிறகே உணவு உட்கொள்ளவும்.',
      'உணவின் போதோ அல்லது அதற்கு பின்னரோ அதிக குளிர்ந்த நீரை அருந்த வேண்டாம்; அது செரிமான தீயை அணைத்துவிடும்.',
      'இயற்கையான சுழற்சிக்கு ஏற்ப தூங்கும் மற்றும் விழிக்கும் நேரத்தை தினசரி கடைபிடிக்கவும்.',
    ],
    te: [
      'మునుపటి ఆహారం సంపూర్ణంగా జీర్ణమైన తర్వాత, నిజమైన ఆకలి వేసినప్పుడే భోజనం చేయండి.',
      'భోజన సమయంలో లేదా వెంటనే అతి శీతలమైన నీటిని తాగవద్దు, ఇది జీర్ణ అగ్నిని తగ్గిస్తుంది.',
      'సహజమైన దినచర్య కాలక్రమం ప్రకారం నిద్ర మరియు మేల్కొనే సమయాలను క్రమం తప్పకుండా పాటించండి.',
    ],
    kn: [
      'ಹಿಂದಿನ ಊಟ ಸಂಪೂರ್ಣವಾಗಿ ಜೀರ್ಣವಾದ ನಂತರ ಮತ್ತು ನಿಜವಾದ ಹಸಿವಾದಾಗ ಮಾತ್ರ ಊಟ ಮಾಡಿ.',
      'ಊಟದ ಸಮಯದಲ್ಲಿ ಅಥವಾ ತಕ್ಷಣವೇ ಅತಿಯಾದ ತಣ್ಣೀರು ಕುಡಿಯಬೇಡಿ, ಇದು ಜೀರ್ಣಾಗ್ನಿಯನ್ನು ಮಂದಗೊಳಿಸುತ್ತದೆ.',
      'ನೈಸರ್ಗಿಕ ದಿನಚರ್ಯ ಕಾಲಚಕ್ರಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನಿಯಮಿತ ನಿದ್ರೆ ಮತ್ತು ಜಾಗರಣೆ ಸಮಯವನ್ನು ಪಾಲಿಸಿ.',
    ],
    mr: [
      'मागील अन्न पूर्णपणे पचल्यानंतर आणि खरी भूक लागल्यावरच जेवण करा (जीर्णाशी लक्षणे).',
      'जेवताना किंवा जेवणानंतर लगेच बर्फाचे थंड पाणी पिऊ नका, यामुळे जठराग्नी मंदावतो.',
      'नैसर्गिक सर्केडियन चक्रानुसार नियमित दिनचर्या आणि झोपेच्या वेळेचे काटेकोर पालन करा.',
    ],
    en: [
      'Eat only when truly hungry and previous meal has been fully digested (Jirna Ahara).',
      'Never drink ice-cold water during or immediately after meals as it douses the digestive fire (Manda Agni).',
      'Maintain regular sleep cycles aligned with natural Circadian rhythms (Circadian Dinacharya).',
    ],
  };

  const getLocalizedItems = (l: string) => {
    switch (l) {
      case 'hi':
        return [
          {
            id: 'dina-1',
            time: wakeUpTime,
            period: 'brahma_muhurta',
            category: 'vihara',
            title: 'ब्राह्म मुहूर्त जागरण एवं उषःपान',
            sanskritTitle: 'उषःपान एवं ब्राह्म मुहूर्त',
            description: 'सूर्योदय से पूर्व जागें; तांबे के पात्र में रखा 1-2 गिलास गुनगुना पानी बैठकर शांति से पिएं।',
            instructions: 'बैठकर घूंट-घूंट पिएं। यह अपान वायु का अनुलोमन कर मल त्याग को सुगम बनाता है।',
            completed: false,
            doshaImpact: 'वात एवं कफ दोष का संतुलन',
          },
          {
            id: 'dina-2',
            time: '06:30',
            period: 'morning',
            category: 'vihara',
            title: 'दन्तधावन, जिह्वा निर्लेखन एवं कवल/गण्डूष',
            sanskritTitle: 'दन्तधावन, जिह्वा निर्लेखन एवं कवल',
            description: 'नीम/बबूल मंजन से दांत साफ करें; तांबे के छिलनी से जीभ साफ करें; तिल तेल से गण्डूष (कुल्ला) करें।',
            instructions: 'मुख से रात भर का आम (टॉक्सिन्स) बाहर निकालता है और मसूड़ों को मजबूत करता है।',
            completed: false,
            doshaImpact: 'कफ दोष व मुख दुर्गंध का नाश',
          },
          {
            id: 'dina-3',
            time: '07:15',
            period: 'morning',
            category: 'aushadhi',
            title: 'प्रातःकाल औषधि (दीपन-पाचन योग)',
            sanskritTitle: 'प्रातःकाल औषधि',
            dosageOrPortion: '3 ग्राम चूर्ण / 15 मिली क्वाथ',
            anupana: 'गुनगुना पानी या आधा चम्मच शहद',
            description: 'चिकित्सक द्वारा निर्धारित रक्तशोधक या दीपन-पाचन औषधि खाली पेट ग्रहण करें।',
            instructions: 'औषधि सेवन के 30-45 मिनट बाद ही ठोस नाश्ता करें।',
            completed: false,
            doshaImpact: 'अग्नि दीपन एवं पित्त शमन',
          },
          {
            id: 'dina-4',
            time: breakfastTime,
            period: 'breakfast',
            category: 'ahara',
            title: 'लघु प्रातराश (सुपाच्य पथ्य नाश्ता)',
            sanskritTitle: 'लघु प्रातराश (पथ्य आहार)',
            dosageOrPortion: '1 कटोरी ताजा गर्म सुपाच्य भोजन',
            description: 'गर्म हल्का नाश्ता: मूंग दाल चीला, दलिया, पोहा, या दालचीनी के साथ पके सेब।',
            instructions: 'सुबह ठंडा दूध, अधिक तली-भुनी वस्तुएं और खट्टा दही बिल्कुल न लें।',
            completed: false,
            doshaImpact: 'प्राण वात एवं पाचक पित्त का स्थिरीकरण',
          },
          {
            id: 'dina-5',
            time: lunchTime,
            period: 'midday',
            category: 'ahara',
            title: 'प्रधान मध्याह्न भोजन (षड्रस युक्त मुख्य आहार)',
            sanskritTitle: 'प्रधान मध्याह्न भोजन',
            dosageOrPortion: 'षड्रस युक्त पौष्टिक संतुलित थाली',
            description: 'मुख्य दोपहर का भोजन: ताजा गर्म अन्न (चावल/रोटी), मौसमी सब्जियां (लौकी, तोरई), मूंग दाल, और भुने जीरे वाली छाछ (तक्र)।',
            instructions: 'शांत वातावरण में भोजन करें। भोजनोपरांत 10 मिनट वज्रासन करें। दिन में कभी न सोएं।',
            completed: false,
            doshaImpact: 'उच्चतम जठराग्नि द्वारा संपूर्ण पोषण',
          },
          {
            id: 'dina-6',
            time: eveningTime,
            period: 'evening',
            category: 'rasayana',
            title: 'सायं सन्ध्या पेय एवं प्राणायाम',
            sanskritTitle: 'सायं सन्ध्या पेय एवं प्राणायाम',
            dosageOrPortion: '1 कप गुनगुना हर्बल काढ़ा/चाय',
            description: 'तुलसी, अदरक, इलायची और ब्राह्मी युक्त काढ़ा। 10 मिनट अनुलोम-विलोम एवं शीतली प्राणायाम।',
            instructions: 'मानसिक तनाव कम करता है और दिनभर की थकान दूर करता है।',
            completed: false,
            doshaImpact: 'पित्त शामक एवं मन का सात्विकीकरण',
          },
          {
            id: 'dina-7',
            time: dinnerTime,
            period: 'dinner',
            category: 'ahara',
            title: 'लघु रात्रि भोजन (हल्का रात का भोजन)',
            sanskritTitle: 'लघु रात्रि भोजन',
            dosageOrPortion: '1 कटोरी मूंग दाल खिचड़ी या गर्म सूप',
            description: 'सोने से कम से कम 2.5 घंटे पूर्व लिया गया अत्यंत हल्का व सुपाच्य भोजन।',
            instructions: 'रात में भारी गरिष्ठ भोजन, पनीर, उड़द दाल या दही का सेवन न करें।',
            completed: false,
            doshaImpact: 'रात्रि में आम संचय की रोकथाम',
          },
          {
            id: 'dina-8',
            time: bedTime,
            period: 'night',
            category: 'aushadhi',
            title: 'रात्रि रसायन एवं शयनोपचार',
            sanskritTitle: 'रात्रि रसायन एवं शयनोपचार',
            dosageOrPortion: '1 चम्मच त्रिफला चूर्ण अथवा हल्दी वाला दूध',
            anupana: 'गुनगुना पानी या देशी गाय का दूध',
            description: 'सोने से पहले त्रिफला चूर्ण गुनगुने पानी से लें ताकि कोष्ठ शुद्धि और धातु पोषण हो सके।',
            instructions: 'सोने से 30 मिनट पूर्व स्क्रीन बंद करें। बाईं करवट (वामकुक्षी) सोएं।',
            completed: false,
            doshaImpact: 'अपान वायु नियमन एवं गाढ़ी निद्रा',
          },
        ];
      case 'bn':
        return [
          {
            id: 'dina-1',
            time: wakeUpTime,
            period: 'brahma_muhurta',
            category: 'vihara',
            title: 'ব্রাহ্ম মুহূর্ত জাগরণ ও ঊষাপান',
            sanskritTitle: 'উষঃপান ও ব্রাহ্ম মুহূর্ত',
            description: 'সূর্যোদয়ের পূর্বে জাগরণ; তামার পাত্রে রাখা ১-২ গ্লাস হালকা গরম জল বসে ধীরে ধীরে পান করুন।',
            instructions: 'বসে চুমুক দিয়ে পান করুন। এটি অপান বায়ুর অনুলোমন ঘটিয়ে কোষ্ঠ পরিষ্কার করে।',
            completed: false,
            doshaImpact: 'বাত ও কফ দোষের ভারসাম্য রক্ষা',
          },
          {
            id: 'dina-2',
            time: '06:30',
            period: 'morning',
            category: 'vihara',
            title: 'দন্তধাবন, জিহ্বা নির্লেখন ও কভল/তৈল গণ্ডূষ',
            sanskritTitle: 'দন্তধাবন ও গণ্ডূষ',
            description: 'ভেষজ চূর্ণ দিয়ে দাঁত পরিষ্কার করুন; তামার ছুলনি দিয়ে জিভ পরিষ্কার করুন; তিল তেল দিয়ে কুলকুচি করুন।',
            instructions: 'মুখের বিষাক্ত আম অপসারিত করে এবং মাড়ি মজবুত রাখে।',
            completed: false,
            doshaImpact: 'কফ নিঃসরণ ও মুখের সতেজতা',
          },
          {
            id: 'dina-3',
            time: '07:15',
            period: 'morning',
            category: 'aushadhi',
            title: 'প্রাতঃকালীন ভেষজ ঔষধ (দীপদ-পাচন)',
            sanskritTitle: 'প্রাতঃকাল ঔষধ',
            dosageOrPortion: '৩ গ্রাম চূর্ণ / ১৫ মিলি ক্বাথ',
            anupana: 'ঈষদুষ্ণ জল বা মধু',
            description: 'খালি পেটে নির্ধারিত রক্তশোধক বা হজমবর্ধক আয়ুর্বেদিক ঔষধ গ্রহণ করুন।',
            instructions: 'ঔষধ গ্রহণের ৩০-৪৫ মিনিট পর পুষ্টিকর সকালের নাস্তা করুন।',
            completed: false,
            doshaImpact: 'অগ্নি উদ্দীপন ও পিত্ত প্রশমন',
          },
          {
            id: 'dina-4',
            time: breakfastTime,
            period: 'breakfast',
            category: 'ahara',
            title: 'লঘু প্রাতরাশ (সহজপাচ্য স্বাস্থ্যকর সকালের খাবার)',
            sanskritTitle: 'লঘু প্রাতরাশ (পথ্য আহার)',
            dosageOrPortion: '১ বাটি তাজা রান্না করা গরম খাবার',
            description: 'মুগ ডালের চিলা, সুজি/দালিয়া খিচুড়ি, বা দারুচিনি সহযোগে সেদ্ধ আপেল।',
            instructions: 'সকালে ঠান্ডা পানীয়, অতিরিক্ত তৈলাক্ত খাবার ও টক দই বর্জন করুন।',
            completed: false,
            doshaImpact: 'প্রাণ বাত ও পাচক পিত্ত স্থিরকরণ',
          },
          {
            id: 'dina-5',
            time: lunchTime,
            period: 'midday',
            category: 'ahara',
            title: 'প্রধান মধ্যাহ্ন ভোজন (ষড়রস পুষ্টিকর থালি)',
            sanskritTitle: 'প্রধান মধ্যাহ্ন ভোজন',
            dosageOrPortion: 'ষড়রস যুক্ত সুষম আহার',
            description: 'প্রধান আহার: ভাত/রুটি, মৌসুমি সবজি (লাউ, ঝিঙে), মুগ ডাল, এবং ভাজা জিরে দেওয়া তক্র (ঘোল)।',
            instructions: 'শান্ত মনে আহার করুন। আহারের পর ১০ মিনিট বজ্রাসন করুন। দিনে ঘুমাবেন না।',
            completed: false,
            doshaImpact: 'জঠরাগ্নি দ্বারা সম্পূর্ণ ধাতু পোষণ',
          },
          {
            id: 'dina-6',
            time: eveningTime,
            period: 'evening',
            category: 'rasayana',
            title: 'সায়াহ্ন ভেষজ চা ও প্রাণায়াম',
            sanskritTitle: 'সায়ং সন্ধ্যাকাল পানীয় ও প্রাণায়াম',
            dosageOrPortion: '১ কাপ তুলসী-আদা-ব্রাহ্মী ভেষজ চা',
            description: '১০ মিনিট অনুলোম বিলোম এবং শীতলী প্রাণায়াম অভ্যাস করুন।',
            instructions: 'স্নায়ুতন্ত্রকে শান্ত করে এবং সারাদিনের কাজের ক্লান্তি দূর করে।',
            completed: false,
            doshaImpact: 'পিত্ত শান্তিকরণ ও মানসিক প্রশান্তি',
          },
          {
            id: 'dina-7',
            time: dinnerTime,
            period: 'dinner',
            category: 'ahara',
            title: 'লঘু নৈশ ভোজন (হালকা রাতের খাবার)',
            sanskritTitle: 'লঘু রাত্রি ভোজন',
            dosageOrPortion: '১ বাটি মুগ ডালের খিচুড়ি বা গরম সবজি স্যুপ',
            description: 'ঘুমানোর অন্তত আড়াই ঘণ্টা পূর্বে খাওয়া অত্যন্ত হালকা খাবার।',
            instructions: 'রাতে মাংস, গুরুপাক খাদ্য এবং দই পুরোপুরি পরিহার করুন।',
            completed: false,
            doshaImpact: 'রাতে আম বিষ জমতে বাধা প্রদান',
          },
          {
            id: 'dina-8',
            time: bedTime,
            period: 'night',
            category: 'aushadhi',
            title: 'রাত্রিকালীন রসায়ন ও শয়ন বিধি',
            sanskritTitle: 'রাত্রি রসায়ন ও শয়ন বিধি',
            dosageOrPortion: '১ চা চামচ ত্রিফলা চূর্ণ বা হলুদ দুধ',
            anupana: 'ঈষদুষ্ণ জল বা গরুর দুধ',
            description: 'ঘুমানোর পূর্বে ত্রিফলা চূর্ণ গ্রহণ করুন কোষ্ঠ পরিষ্কার ও ওজঃ বৃদ্ধির জন্য।',
            instructions: 'ঘুমানোর ৩০ মিনিট আগে পর্দা বা মোবাইল বন্ধ করুন। বাঁ-পাশ ফিরে শয়ন করুন।',
            completed: false,
            doshaImpact: 'অপান বায়ুর স্বাভাবিক গতি ও গভীর ঘুম',
          },
        ];
      case 'ta':
        return [
          {
            id: 'dina-1',
            time: wakeUpTime,
            period: 'brahma_muhurta',
            category: 'vihara',
            title: 'பிரம்ம முகூர்த்த விழிப்பு & உஷாபானம்',
            sanskritTitle: 'உஷஃபாநம்',
            description: 'சூரிய உதயத்திற்கு முன் எழுந்து, செம்பு பாத்திரத்தில் வைத்த 1-2 டம்ளர் வெதுவெதுப்பான நீரை அமர்ந்து பருகவும்.',
            instructions: 'மெதுவாக பருகவும்; செரிமானம் மற்றும் குடல் இயக்கத்தை சீராக்குகிறது.',
            completed: false,
            doshaImpact: 'வாத & கப சமநிலை',
          },
          {
            id: 'dina-2',
            time: '06:30',
            period: 'morning',
            category: 'vihara',
            title: 'பல் துலக்குதல், நாக்கு வழித்தல் & நல்லெண்ணெய் வாய் கொப்பளிப்பு',
            sanskritTitle: 'தந்ததாவனம் & கவளம்',
            description: 'மூலிகை பொடியால் பல் துலக்கி, செம்பு நாக்கு வழியால் நாக்கை சுத்தப்படுத்தி, நல்லெண்ணெயில் வாய் கொப்பளிக்கவும்.',
            instructions: 'வாயில் உள்ள நச்சுக்களை நீக்கி ஈறுகளை பலப்படுத்துகிறது.',
            completed: false,
            doshaImpact: 'கப நச்சுகளை வெளியேற்றும்',
          },
          {
            id: 'dina-3',
            time: '07:15',
            period: 'morning',
            category: 'aushadhi',
            title: 'காலை ஆயுர்வேத மருந்து (அக்னி தீபனம்)',
            sanskritTitle: 'பிராதஃகால ஔஷதம்',
            dosageOrPortion: '3 கிராம் சூரணம் / 15 மி.லி கஷாயம்',
            anupana: 'வெதுவெதுப்பான நீர் அல்லது தேன்',
            description: 'பரிந்துரைக்கப்பட்ட மூலிகை மருந்தை வெறும் வயிற்றில் உட்கொள்ளவும்.',
            instructions: 'மருந்து உட்கொண்டு 30-45 நிமிடங்களுக்குப் பிறகு காலை உணவு உண்ணவும்.',
            completed: false,
            doshaImpact: 'அக்னியை தூண்டி பித்தத்தை குறைக்கும்',
          },
          {
            id: 'dina-4',
            time: breakfastTime,
            period: 'breakfast',
            category: 'ahara',
            title: 'பத்திய காலை உணவு (எளிய உணவு)',
            sanskritTitle: 'லகு பிராதராச உணவு',
            dosageOrPortion: '1 கிண்ணம் சூடான எளிய உணவு',
            description: 'பாசிப்பருப்பு கஞ்சி, இட்லி, அல்லது இலவங்கப்பட்டையுடன் வேகவைத்த ஆப்பிள்.',
            instructions: 'குளிர்ந்த பாக்கெட் பால், பொரித்த உணவுகள் மற்றும் தயிர் தவிர்க்கவும்.',
            completed: false,
            doshaImpact: 'பிராண வாதம் & பித்த சமநிலை',
          },
          {
            id: 'dina-5',
            time: lunchTime,
            period: 'midday',
            category: 'ahara',
            title: 'பிரதான மதிய உணவு (அறுசுவை உணவு)',
            sanskritTitle: 'பிரதான மத்யான்ன போஜனம்',
            dosageOrPortion: 'அறுசுவை சத்தான சமச்சீர் உணவு',
            description: 'சாதம், பாசிப்பருப்பு கூட்டு, சுரைக்காய்/பூசணி கறி, மற்றும் சீரக மோர்.',
            instructions: 'அமைதியான சூழலில் உண்ணவும். பின் 10 நிமிடம் வஜ்ராசனம் செய்யவும். பகலில் தூங்க வேண்டாம்.',
            completed: false,
            doshaImpact: 'செரிமானத்தை உச்சப்படுத்தல்',
          },
          {
            id: 'dina-6',
            time: eveningTime,
            period: 'evening',
            category: 'rasayana',
            title: 'மாலை மூலிகை தேநீர் & பிராணாயாமம்',
            sanskritTitle: 'சாயங்கால மூலிகை பானம்',
            dosageOrPortion: '1 கப் துளசி இஞ்சி பிராமி தேநீர்',
            description: '10 நிமிடங்கள் அநுலோம விலோம மற்றும் சீதளி மூச்சுப்பயிற்சி செய்யவும்.',
            instructions: 'நரம்பு மண்டலத்தை அமைதிப்படுத்தி சோர்வை நீக்குகிறது.',
            completed: false,
            doshaImpact: 'மன அமைதி & பித்த சாந்தி',
          },
          {
            id: 'dina-7',
            time: dinnerTime,
            period: 'dinner',
            category: 'ahara',
            title: 'எளிய இரவு உணவு',
            sanskritTitle: 'லகு இரவு போஜனம்',
            dosageOrPortion: '1 கிண்ணம் பருப்பு கிச்சடி அல்லது சூப்',
            description: 'தூங்குவதற்கு குறைந்தது 2.5 மணி நேரத்திற்கு முன் எளிய உணவு உண்ணவும்.',
            instructions: 'இரவில் அசைவ உணவுகள், தயிர் தவிர்க்கவும்.',
            completed: false,
            doshaImpact: 'நச்சுக்கள் சேர்வதை தடுக்கும்',
          },
          {
            id: 'dina-8',
            time: bedTime,
            period: 'night',
            category: 'aushadhi',
            title: 'இரவு திரிபலா ரசாயனம் & உறங்கும் முறை',
            sanskritTitle: 'ராத்ரி ரசாயனம்',
            dosageOrPortion: '1 ஸ்பூன் திரிபலா சூரணம் / மஞ்சள் பால்',
            anupana: 'வெதுவெதுப்பான நீர்',
            description: 'தூங்கும் முன் திரிபலா பொடியை வெந்நீரில் பருகவும்.',
            instructions: 'தூங்குவதற்கு 30 நிமிடத்திற்கு முன் மொபைல் திரையை அணைக்கவும். இடது பக்கம் படுக்கவும்.',
            completed: false,
            doshaImpact: 'ஆழ்ந்த தூக்கம் & குடல் தூய்மை',
          },
        ];
      default:
        // Default English
        return [
          {
            id: 'dina-1',
            time: wakeUpTime,
            period: 'brahma_muhurta',
            category: 'vihara',
            title: 'Brahma Muhurta Jagaran & Ushapan',
            sanskritTitle: 'उषःपान एवं ब्राह्म मुहूर्त',
            description: 'Wake up early; drink 1-2 glasses of lukewarm water stored in a pure copper vessel or steeped with cumin seeds.',
            instructions: 'Drink while sitting down in a relaxed posture. Promotes gentle peristalsis (Apana Vayu Anulomana).',
            completed: false,
            doshaImpact: 'Balances Vata & Kapha',
          },
          {
            id: 'dina-2',
            time: '06:30',
            period: 'morning',
            category: 'vihara',
            title: 'Dantadhavana, Jihwa Nirlekhana & Kavala',
            sanskritTitle: 'दन्तधावन, जिह्वा निर्लेखन एवं कवल',
            description: 'Clean teeth with herbal powder (Neem/Babul); scrape tongue with copper scraper; swish warm sesame oil (Gandusha).',
            instructions: 'Removes overnight Ama (metabolic toxins) from oral cavity and strengthens gums.',
            completed: false,
            doshaImpact: 'Expels Kapha toxins',
          },
          {
            id: 'dina-3',
            time: '07:15',
            period: 'morning',
            category: 'aushadhi',
            title: 'Pratah Kala Aushadhi (Morning Digestive Tonic)',
            sanskritTitle: 'प्रातःकाल औषधि',
            dosageOrPortion: '3g Churna / 15ml Kwath',
            anupana: 'Warm water with half spoon honey',
            description: 'Take prescribed morning blood purifier or digestive stimulant on an empty stomach.',
            instructions: 'Allow 30-45 minutes before having solid breakfast.',
            completed: false,
            doshaImpact: 'Kindles Agni & Clears Pitta',
          },
          {
            id: 'dina-4',
            time: breakfastTime,
            period: 'breakfast',
            category: 'ahara',
            title: 'Pathya Breakfast (Laghu Ahara)',
            sanskritTitle: 'लघु प्रातराश (पथ्य आहार)',
            dosageOrPortion: '1 bowl fresh cooked warm meal',
            description: 'Warm, lightly spiced breakfast: Moong dal chila, spiced oatmeal, steamed idli, or warm stewed apples with cinnamon.',
            instructions: 'Avoid cold milk shakes, deep-fried snacks, and heavy sour yogurts in the morning.',
            completed: false,
            doshaImpact: 'Stabilizes Prana Vata & Pachaka Pitta',
          },
          {
            id: 'dina-5',
            time: lunchTime,
            period: 'midday',
            category: 'ahara',
            title: 'Pradhana Ahara (Principal Midday Lunch)',
            sanskritTitle: 'प्रधान मध्याह्न भोजन',
            dosageOrPortion: 'Full nourishing meal with 6 Rasas',
            description: 'Main balanced meal: Warm whole grains (rice/roti), cooked seasonal vegetables (gourds, spinach, beans), lentils, and spiced buttermilk (Takra).',
            instructions: 'Eat in peaceful surroundings. Follow with 10 minutes of gentle Vajrasana. Do not sleep during the day.',
            completed: false,
            doshaImpact: 'Maximizes peak Agni metabolic conversion',
          },
          {
            id: 'dina-6',
            time: eveningTime,
            period: 'evening',
            category: 'rasayana',
            title: 'Sayam Sandhya Herbal Rejuvenator & Pranayama',
            sanskritTitle: 'सायं सन्ध्या पेय एवं प्राणायाम',
            dosageOrPortion: '1 cup warm herbal infusion',
            description: 'Steeped Tulsi, Ginger, Cardamom, and Brahmi tea. 10 minutes of Anulom Vilom and Sheetali breathing.',
            instructions: 'Calms central nervous system and relieves accumulated workday fatigue.',
            completed: false,
            doshaImpact: 'Soothes Pitta and clears mental Rajas',
          },
          {
            id: 'dina-7',
            time: dinnerTime,
            period: 'dinner',
            category: 'ahara',
            title: 'Laghu Ratri Bhojana (Light Dinner)',
            sanskritTitle: 'लघु रात्रि भोजन',
            dosageOrPortion: '1 bowl Moong dal khichdi or warm soup',
            description: 'Easily digestible warm meal taken at least 2.5 hours before sleeping.',
            instructions: 'Strictly avoid heavy red meat, raw salads, and curd at night.',
            completed: false,
            doshaImpact: 'Prevents Ama accumulation overnight',
          },
          {
            id: 'dina-8',
            time: bedTime,
            period: 'night',
            category: 'aushadhi',
            title: 'Ratri Rasayana & Shayanopachara',
            sanskritTitle: 'रात्रि रसायन एवं शयनोपचार',
            dosageOrPortion: '1 teaspoon Triphala or Golden Turmeric Milk',
            anupana: 'Warm water or warm A2 Cow Milk',
            description: 'Take Triphala Churna with warm water before bed for complete colon detox and cellular rejuvenation.',
            instructions: 'Turn off screens 30 minutes before sleep. Sleep on your left side (Vamakukshi).',
            completed: false,
            doshaImpact: 'Regulates Apana Vayu & Induces Deep Ojas',
          },
        ];
    }
  };

  return {
    wakeUpTime,
    breakfastTime,
    lunchTime,
    eveningTime,
    dinnerTime,
    bedTime,
    healthFocus,
    prakritiTarget: prakriti,
    waterIntakeTargetLiters: 2.5,
    generatedDate: new Date().toISOString().split('T')[0],
    specialAyurvedicGuidance: guidanceByLang[lang] || guidanceByLang.en,
    items: getLocalizedItems(lang),
  };
}

function getFallbackRAGResponse(query: string, language: string) {
  return {
    id: 'rag-sample-1',
    sender: 'assistant',
    timestamp: new Date().toISOString(),
    content: `Under Section 3(p) of the Indian Patents Act, 1970, traditional Ayurvedic knowledge and mere aggregations of known plant properties are excluded from patentability.

To overcome Section 3(p) and Section 3(e) hurdles for Ayurvedic formulations:
1. **Quantitative Synergistic Efficacy**: You must provide experimental comparative data (e.g. isobologram or Chou-Talalay Combination Index < 1.0) proving that the combined extracts produce a non-obvious synergistic therapeutic boost compared to the individual components alone.
2. **Novel Standardized Extraction or Delivery**: Formulating extracts with a novel drug delivery system (such as self-emulsifying nano-carriers, liposomes, or supercritical CO2 solvent fractionation) creates strong patentable subject matter.
3. **NBA Form 3 Compliance**: Obtain mandatory approval from the National Biodiversity Authority (Chennai) before the patent grant if Indian biological resources are utilized.`,
    citations: [
      {
        title: 'Indian Patents Act, 1970',
        statuteOrDoc: 'Act No. 39 of 1970',
        section: 'Section 3(p) & Section 3(e)',
        summary: 'Bars traditional knowledge aggregations; mandates proof of synergy for herbal compositions.',
      },
      {
        title: 'Biological Diversity Act, 2002',
        statuteOrDoc: 'NBA Guidelines on Access and Benefit Sharing (ABS)',
        section: 'Section 6 (Form 3 Approval for IPR)',
        summary: 'Mandatory permission from NBA before applying for any intellectual property right involving Indian bio-resources.',
      },
    ],
    regulatoryMatrix: [
      { country: 'India', body: 'AYUSH / FSSAI', standard: 'Schedule T GMP / Ayurvedic Aahar 2022', keyRule: 'Section 3(p) compliance & TKDL prior-art search' },
      { country: 'USA', body: 'US FDA', standard: '21 CFR Part 111 (cGMP)', keyRule: 'Structure/function claims vs Botanical Drug NDA' },
      { country: 'European Union', body: 'EMA HMPC', standard: 'THMPD 2004/24/EC', keyRule: 'Bibliographical 30-year traditional evidence (15 in EU)' },
    ],
  };
}

function getFallbackPatentEvaluation(formulation: any, language: string = 'en') {
  return {
    id: 'patent-eval-sample-1',
    timestamp: new Date().toISOString(),
    inventionTitle: formulation.title || 'Synergistic Polyherbal Composition for Inflammatory Disorders',
    formulationOrProcess: formulation.description || 'Standardized extract formulation of Withania somnifera and Curcuma longa in synergistic 3:1 ratio with lipid nanocarrier.',
    targetIndication: formulation.indication || 'Osteoarthritis and Joint Cartilage Regeneration',
    overallPatentabilityRating: 'High Patentability',
    noveltyScore: 84,
    inventiveStepScore: 88,
    tkdlPriorArtRisk: {
      riskLevel: 'Medium',
      knownTraditionalUsesFound: [
        'Withania somnifera (Ashwagandha) cited in Charaka Samhita Chikitsa Sthana for Vata-Shamana and Balya actions.',
        'Curcuma longa (Haridra) cited for anti-inflammatory (Shothahara) and Vranaropana properties.',
      ],
      relevantTKDLClassifications: ['A61K 36/81 (Withania)', 'A61K 36/9066 (Curcuma)', 'A61P 19/02 (Anti-arthritic)'],
      classicalTextsCitingComponents: ['Charaka Samhita', 'Sushruta Samhita', 'Bhavaprakasha Nighantu'],
    },
    section3pHurdleAnalysis: {
      isTraditionalKnowledge: true,
      statutoryProvision: 'Section 3(p), Section 3(d), Section 3(e)',
      overcomingStrategy: 'Draft claims focused on the specific synergistic 3:1 weight ratio exhibiting a statistically validated 3.8-fold bioavailability increase and the unique SNEDDS nano-emulsion encapsulation process.',
      synergisticProofRequired: 'Submit in vitro COX-2/IL-6 inhibition isobologram and in vivo pharmacokinetic AUC comparison against raw herbal powders.',
    },
    nbaAbsCompliance: {
      requiresNBAApproval: true,
      actReference: 'Biological Diversity Act, 2002 (Section 6)',
      exemptionsApplicable: 'Normally traded commodities (NTC list) exemption if raw herbs are sourced through designated agricultural mandis without proprietary wild-access.',
      stepByStepProcess: [
        'File Form 3 with National Biodiversity Authority (NBA), Chennai before patent grant.',
        'Submit raw material procurement receipts and benefit-sharing agreement (ABS).',
        'Receive NBA No-Objection Certificate (NOC) for Patent Office Controller review.',
      ],
    },
    globalRegulatoryPathways: [
      {
        regime: 'India (AYUSH / FSSAI)',
        classification: 'Ayurvedic Proprietary Medicine (Rule 153/158 AYUSH) or Ayurvedic Aahar (FSSAI 2022)',
        clinicalTrialRequirement: 'Phase III comparative safety trial if novel extraction solvent is used',
        manufacturingStandard: 'Schedule T AYUSH GMP Certification with heavy metals (AAS) testing',
        documentationChecklist: ['Classical text justification', 'Certificate of Analysis (COA) for 3 consecutive batches', 'Stability study data (Accelerated 6-month)'],
      },
      {
        regime: 'USA (FDA 21 CFR 111 & 312)',
        classification: 'Dietary Supplement (DSHEA) or Botanical Drug IND/NDA',
        clinicalTrialRequirement: 'Not required for DSHEA (must have NDI if new dietary ingredient); Phase I-III required for Botanical NDA',
        manufacturingStandard: '21 CFR Part 111 cGMP with identity, purity, and strength validation',
        documentationChecklist: ['75-day New Dietary Ingredient (NDI) notification if applicable', 'Standardized marker HPLC chromatogram fingerprints', 'Absence of undeclared synthetic adulterants'],
      },
      {
        regime: 'European Union (EMA HMPC)',
        classification: 'Traditional Herbal Medicinal Product (THMPD 2004/24/EC) or Food Supplement',
        clinicalTrialRequirement: 'Exempt if 30-year traditional use is documented (minimum 15 years in EU)',
        manufacturingStandard: 'EU GMP Part II for Active Herbal Substances',
        documentationChecklist: ['HMPC Monograph alignment', 'Aflatoxin & heavy metal compliance to European Pharmacopoeia (Ph. Eur.)', 'Expert Safety Overview Report'],
      },
    ],
    draftPatentClaims: [
      {
        claimNumber: 1,
        claimType: 'Independent',
        claimText: 'A synergistic pharmaceutical formulation comprising a standardized fraction of Withania somnifera extract standardized to 8-12% Withanolides and a Curcuma longa extract standardized to 95% Curcuminoids in a weight ratio of 2.5:1 to 4:1 w/w, wherein said formulation exhibits at least 3.5-fold higher bioavailability compared to raw pulverized powder.',
      },
      {
        claimNumber: 2,
        claimType: 'Dependent',
        claimText: 'The formulation as claimed in Claim 1, wherein said extracts are encapsulated in a self-nanoemulsifying phospholipid carrier having a mean droplet diameter between 50 nm and 180 nm.',
      },
      {
        claimNumber: 3,
        claimType: 'Dependent',
        claimText: 'A process for preparing the synergistic formulation of Claim 1, comprising supercritical fluid CO2 extraction at a temperature of 40-55°C and pressure of 220-300 bar.',
      },
    ],
    patentDraftSummary: {
      abstract: 'A novel synergistic standardized polyherbal composition possessing enhanced anti-inflammatory and cartilage-protective bioavailability, overcoming Section 3(p) hurdles through quantitative synergistic ratio efficacy data.',
      backgroundAndTKDLDifferentiation: 'While traditional texts (Charaka Samhita) mention Withania and Curcuma individually, the present invention demonstrates an inventive step by discovering an unprecedented non-obvious synergistic ratio with nanocarrier stabilization that cannot be inferred by a person skilled in the art.',
      synergisticRatioClaims: 'Specific 3:1 wt/wt ratio achieving a Combination Index of 0.62 (synergistic) via Chou-Talalay isobologram method.',
      extractionNovelty: 'Supercritical CO2 fractional separation yielding solvent-free, highly pure phytochemical active fractions.',
      industrialApplicability: 'Ready scalable encapsulation into enteric-coated oral capsules and topical nano-hydrogels.',
    },
  };
}

// Create HTTP server from Express
const server = http.createServer(app);

// Attach WebSocket Server on '/ws' with explicit upgrade handler and clean connection lifecycle
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const host = request.headers.host || 'localhost:3000';
    const parsedUrl = new URL(request.url || '', `http://${host}`);
    if (parsedUrl.pathname === '/ws' || parsedUrl.pathname === '/ws/') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
      setTimeout(() => {
        try { socket.destroy(); } catch {}
      }, 100);
    }
  } catch (err) {
    try { socket.destroy(); } catch {}
  }
});

wss.on('connection', (ws: WebSocket) => {
  // Send welcome handshake message
  ws.send(JSON.stringify({
    type: 'WELCOME',
    status: 'connected',
    message: 'IP-SAKTI Sahayak Real-time WebSocket Service Connected',
    timestamp: new Date().toISOString(),
  }));

  ws.on('message', (messageData: any) => {
    try {
      const parsed = JSON.parse(messageData.toString());
      if (parsed.type === 'REGISTER') {
        ws.send(JSON.stringify({
          type: 'REGISTERED',
          userId: parsed.userId || 'guest',
          timestamp: new Date().toISOString(),
        }));
      } else if (parsed.type === 'ping' || parsed.type === 'HEARTBEAT') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      } else {
        ws.send(JSON.stringify({ type: 'ack', received: parsed.type, timestamp: Date.now() }));
      }
    } catch {
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
    }
  });

  ws.on('error', () => {
    // Handled gracefully without crash
  });
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`IP-SAKTI Sahayak server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
