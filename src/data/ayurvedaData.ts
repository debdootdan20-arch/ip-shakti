import { Clinic, HerbKnowledgeEntry, SupportedLanguage } from '../types';

export const APP_IMAGES = {
  heroMortar: 'https://i.postimg.cc/1fswGgXk/charanjeet-dhiman-XYVJkf07JNc-unsplash.jpg',
  botanicalLeaves: 'https://i.postimg.cc/MvqV7cXZ/chelsea-shapouri-k-EF2XCBE4TY-unsplash.jpg',
  panchakarmaOils: 'https://i.postimg.cc/F7pcD9JX/chinh-le-duc-vu-DXJ60m-JOA-unsplash.jpg',
  doctorConsultation: 'https://i.postimg.cc/D8nLrW0p/istockphoto-1221022583-1024x1024.jpg',
  driedHerbsRoots: 'https://i.postimg.cc/ppRzf9rG/istockphoto-855014754-1024x1024.jpg',
  greenMedicinalPlants: 'https://i.postimg.cc/VdmnqS51/jared-rice-NTy-Bbu66-SI-unsplash.jpg',
  elixirBottles: 'https://i.postimg.cc/56bLBHjW/katherine-hanlon-bd-f-CZhy-W8-unsplash.jpg',
  herbalWellness: 'https://i.postimg.cc/BXpDMq1s/lisa-hobbs-m-Ra-Nok-Ld6s-unsplash.jpg',
  brassBowlSpices: 'https://i.postimg.cc/w3hDR5qP/pexels-abhi31-12122270.jpg',
  yogaBalance: 'https://i.postimg.cc/Dmq14QvY/pexels-akash-2906350-5060587.jpg',
  regulatoryLab: 'https://i.postimg.cc/ykscmJxj/pexels-koolshooters-6626972.jpg',
  traditionalCraft: 'https://i.postimg.cc/8shLfdpY/pexels-ornob-sadi-1508452198-36595224.jpg',
  // Clinical Visual Assessment Assets
  skinRashLesion: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  eczemaPatch: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80',
  acneSkin: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
  tongueExam: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
  jointSwelling: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
  psoriasisScaly: 'https://images.unsplash.com/photo-1583912267670-6575ad4736e8?auto=format&fit=crop&w=600&q=80',
};

export interface ClinicalImagePreset {
  id: string;
  name: string;
  sanskritName: string;
  category: string;
  description: string;
  symptoms: string;
  imageUrl: string;
  tag: string;
}

export function getClinicalImagePresets(lang: SupportedLanguage = 'en'): ClinicalImagePreset[] {
  switch (lang) {
    case 'bn':
      return [
        {
          id: 'preset-dadru',
          name: 'দাদ ও ছত্রাক সংক্রমণ (দদ্রু কুষ্ঠ)',
          sanskritName: 'দদ্রু কুষ্ঠ (Dadru Kushta)',
          category: 'চর্মরোগ (দাহ ও চুলকানি)',
          description: 'উত্থিত প্রান্তবিশিষ্ট গোলাকার লালচে আঁশযুক্ত চাকা ও তীব্র চুলকানি।',
          symptoms: 'ত্বকে বৃত্তাকার চুলকানিযুক্ত লাল চাকা, সক্রিয় কিনারা, ঘাম ও আর্দ্রতায় বৃদ্ধি।',
          imageUrl: APP_IMAGES.skinRashLesion,
          tag: 'দদ্রু (Fungal Ringworm)',
        },
        {
          id: 'preset-vicharchika',
          name: 'একজিমা ও শুষ্ক ক্ষত (বিচর্চিকা)',
          sanskritName: 'বিচর্চিকা (Vicharchika)',
          category: 'ত্বক ও রক্তবহ স্রোতঃ',
          description: 'হাত ও কনুইয়ের ভাঁজে খসখসে লালচে ভাব, চুলকানি ও ত্বক ফেটে যাওয়া।',
          symptoms: 'তীব্র কণ্ডূ (চুলকানি), শুষ্ক পপড়ি ও মাঝে মাঝে তরল নিঃসরণ।',
          imageUrl: APP_IMAGES.eczemaPatch,
          tag: 'বিচর্চিকা (Eczema)',
        },
        {
          id: 'preset-mukhadushika',
          name: 'মুখমণ্ডলের ব্রণ ও ফুসকুড়ি (মুখদূষিকা)',
          sanskritName: 'মুখদূষিকা (Yuvanapidika)',
          category: 'ক্ষুদ্ররোগ ও রূপচর্চা',
          description: 'গালে ও কপালে প্রদাহযুক্ত লাল ফুসকুড়ি, পুঁজ ও তৈলাক্ত রোমকূপ।',
          symptoms: 'বেদনাদায়ক লালচে ব্রণ, বন্ধ ছিদ্র এবং তৈলাক্ত ত্বকে প্রদাহ।',
          imageUrl: APP_IMAGES.acneSkin,
          tag: 'মুখদূষিকা (Acne)',
        },
        {
          id: 'preset-tongue',
          name: 'জিহ্বায় বিষাক্ত আস্তরণ ও মন্দাগ্নি (সাম জিহ্বা)',
          sanskritName: 'সাম জিহ্বা পরীক্ষা (Jihwa Pariksha)',
          category: 'অষ্টবিধ পরীক্ষা (পরিপাক)',
          description: 'জিহ্বার উপর পুরু সাদা/হলুদ আস্তরণ, মুখে তেতো স্বাদ ও হজমে গোলমাল।',
          symptoms: 'জিহ্বায় আঠালো সাদা প্রলেপ, পেটে গ্যাস, ক্ষুধামন্দা ও মুখে দুর্গন্ধ।',
          imageUrl: APP_IMAGES.tongueExam,
          tag: 'সাম জিহ্বা (Ama Coated)',
        },
        {
          id: 'preset-joint',
          name: 'হাঁটুর প্রদাহজনিত ফোলা ও ব্যথা (আমবাত / সন্ধিবাত)',
          sanskritName: 'আমবাত সন্ধিশোথ (Amavata)',
          category: 'অস্থি ও সন্ধি রোগ',
          description: 'গাঁটে লালচে ভাব, উষ্ণতা, ফোলা ও সকালে দীর্ঘস্থায়ী আড়ষ্টতা।',
          symptoms: 'হাঁটুর জয়েন্টে ফোলা, স্পর্শে গরম, হাঁটার সময় তীব্র ব্যথা ও জড়তা।',
          imageUrl: APP_IMAGES.jointSwelling,
          tag: 'আমবাত (Inflamed Joint)',
        },
        {
          id: 'preset-psoriasis',
          name: 'রুপোলি আঁশযুক্ত সোরিয়াসিস (কিটিব কুষ্ঠ)',
          sanskritName: 'কিটিব কুষ্ঠ (Kitibha Kushta)',
          category: 'দীর্ঘস্থায়ী চর্মরোগ',
          description: 'ত্বকের উপর পুরু সিলভার স্কেল, শুষ্কতা ও তীব্র আঁশ নির্গমন।',
          symptoms: 'ত্বকে রুপোলি আঁশযুক্ত প্লাক, খসখসে চামড়া ও ঠান্ডায় বৃদ্ধি।',
          imageUrl: APP_IMAGES.psoriasisScaly,
          tag: 'কিটিব (Psoriasis)',
        },
      ];
    case 'hi':
      return [
        {
          id: 'preset-dadru',
          name: 'दाद एवं फंगल संक्रमण (दद्रु कुष्ठ)',
          sanskritName: 'दद्रु कुष्ठ (Dadru Kushta)',
          category: 'त्वचा रोग (कण्डू एवं दाह)',
          description: 'उभरी हुई किनारों वाले गोलाकार लाल पपड़ीदार चकत्ते और तीव्र खुजली।',
          symptoms: 'त्वचा पर गोल खुजलीदार लाल चकत्ते, किनारों पर दाने, पसीने व नमी में वृद्धि।',
          imageUrl: APP_IMAGES.skinRashLesion,
          tag: 'दद्रु (Fungal Ringworm)',
        },
        {
          id: 'preset-vicharchika',
          name: 'एक्जिमा एवं शुष्क चकत्ते (विचर्चिका)',
          sanskritName: 'विचर्चिका (Vicharchika)',
          category: 'त्वचा एवं रक्तवह स्रोत',
          description: 'हाथों व जोड़ों पर खुजली, त्वचा का खुरदरापन व पपड़ीदार लालिमा।',
          symptoms: 'अत्यधिक खुजली, सूखी त्वचा, फटी हुई परतें व हल्का स्राव।',
          imageUrl: APP_IMAGES.eczemaPatch,
          tag: 'विचर्चिका (Eczema)',
        },
        {
          id: 'preset-mukhadushika',
          name: 'चेहरे के मुंहासे व फुंसियां (मुखदूषिका)',
          sanskritName: 'मुखदूषिका / युवानपीडिका',
          category: 'क्षुद्ररोग एवं सौंदर्य',
          description: 'गालों व माथे पर दर्दनाक लाल फुंसियां, मवाद व तैलीय रोमछिद्र।',
          symptoms: 'चेहरे पर सूजनयुक्त लाल मुंहासे, बंद रोमछिद्र व तैलीय त्वचा।',
          imageUrl: APP_IMAGES.acneSkin,
          tag: 'मुखदूषिका (Acne)',
        },
        {
          id: 'preset-tongue',
          name: 'जीभ पर सफेद मैल व मंदाग्नि (साम जिह्वा)',
          sanskritName: 'साम जिह्वा परीक्षा (Jihwa Pariksha)',
          category: 'अष्टविध परीक्षा (पाचन)',
          description: 'जीभ पर मोटी सफेद/पीली परत, मुंह का बेस्वाद होना व अपच।',
          symptoms: 'जीभ पर चिपचिपा मैल, पेट फूलना, भूख न लगना व भारीपन।',
          imageUrl: APP_IMAGES.tongueExam,
          tag: 'साम जिह्वा (Ama Coated)',
        },
        {
          id: 'preset-joint',
          name: 'जोड़ों की सूजन व गठिया दर्द (आमवात / संधिवात)',
          sanskritName: 'आमवात शोथ (Amavata)',
          category: 'अस्थि एवं संधि रोग',
          description: 'घुटने में लालिमा, गरमाहट, सूजन व प्रातःकालीन अकड़न।',
          symptoms: 'जोड़ों में सूजन, छूने पर गर्म लगना, चलने में तेज दर्द व अकड़न।',
          imageUrl: APP_IMAGES.jointSwelling,
          tag: 'आमवात (Joint Swelling)',
        },
        {
          id: 'preset-psoriasis',
          name: 'सोरायसिस के चांदी जैसे खवले (किटिभ कुष्ठ)',
          sanskritName: 'किटिभ कुष्ठ (Kitibha Kushta)',
          category: 'दीर्घकालिक त्वचा रोग',
          description: 'त्वचा पर चांदी जैसे चमकदार सूखे पपड़ीदार चकत्ते।',
          symptoms: 'सूखी पपड़ीदार त्वचा, मोटी परतें व खुजली के साथ सफेद छिलके उतरना।',
          imageUrl: APP_IMAGES.psoriasisScaly,
          tag: 'किटिभ (Psoriasis)',
        },
      ];
    case 'en':
    default:
      return [
        {
          id: 'preset-dadru',
          name: 'Ringworm & Fungal Dermatophytosis (Dadru Kushta)',
          sanskritName: 'Dadru Kushta (दद्रुकुष्ठ)',
          category: 'Tvak Roga (Dermatology)',
          description: 'Elevated circular annular erythematous plaque with active raised scaly borders and intense pruritus.',
          symptoms: 'Itchy circular red rings with central clearing on skin, aggravated in humid weather and sweating.',
          imageUrl: APP_IMAGES.skinRashLesion,
          tag: 'Dadru (Fungal Ringworm)',
        },
        {
          id: 'preset-vicharchika',
          name: 'Atopic Eczema & Exudative Lesions (Vicharchika)',
          sanskritName: 'Vicharchika (विचर्चिका)',
          category: 'Tvak & Raktavaha Srotas',
          description: 'Dry, lichenified erythematous patches with micro-vesicles, excoriation marks, and severe itching.',
          symptoms: 'Intense pruritus (Kandu), dryness, cracked skin folds, and occasional serous oozing.',
          imageUrl: APP_IMAGES.eczemaPatch,
          tag: 'Vicharchika (Eczema)',
        },
        {
          id: 'preset-mukhadushika',
          name: 'Inflammatory Facial Acne & Papules (Mukhadushika)',
          sanskritName: 'Mukhadushika / Yuvanapidika',
          category: 'Kshudraroga & Cosmetology',
          description: 'Erythematous papules, pustules, comedones, and sebum-clogged pores over cheeks and forehead.',
          symptoms: 'Painful facial nodules, oily skin, inflammation aggravated after fried meals and stress.',
          imageUrl: APP_IMAGES.acneSkin,
          tag: 'Mukhadushika (Acne)',
        },
        {
          id: 'preset-tongue',
          name: 'Ama Toxic Coating & Sluggish Agni (Sama Jihwa)',
          sanskritName: 'Sama Jihwa Pariksha (जिह्वा परीक्षा)',
          category: 'Asthavidha Pariksha (Diagnostics)',
          description: 'Thick yellowish-white mucosal coating over tongue surface indicating metabolic endotoxin (Ama).',
          symptoms: 'Thick white coated tongue, foul breath, sluggish digestion, morning heaviness, and low appetite.',
          imageUrl: APP_IMAGES.tongueExam,
          tag: 'Sama Jihwa (Ama Tongue)',
        },
        {
          id: 'preset-joint',
          name: 'Inflammatory Joint Swelling & Pain (Amavata / Sandhivata)',
          sanskritName: 'Amavata Sandhishotha (आमवात)',
          category: 'Asthi-Sandhi Roga (Orthopedics)',
          description: 'Erythematous, warm, edematous joint swelling with restricted flexion and morning stiffness.',
          symptoms: 'Warm swollen knee joint, tender on palpation, sharp pain on movement, stiffness over 30 mins.',
          imageUrl: APP_IMAGES.jointSwelling,
          tag: 'Amavata (Swollen Joint)',
        },
        {
          id: 'preset-psoriasis',
          name: 'Silvery Plaque Psoriasis (Kitibha Kushta)',
          sanskritName: 'Kitibha Kushta (किटिभकुष्ठ)',
          category: 'Chronic Dermatosis',
          description: 'Well-demarcated erythematous plaques covered with coarse micaceous silvery scales.',
          symptoms: 'Silvery scaly plaques on extensor surfaces, dry peeling skin, itchy flares during winter.',
          imageUrl: APP_IMAGES.psoriasisScaly,
          tag: 'Kitibha (Psoriasis)',
        },
      ];
  }
}

export interface QuickSymptomCategory {
  category: string;
  items: string[];
}

export interface SampleCase {
  title: string;
  symptoms: string;
  category: string;
  imageUrl?: string;
}

export function getQuickSymptomCategories(lang: SupportedLanguage = 'en'): QuickSymptomCategory[] {
  switch (lang) {
    case 'bn':
      return [
        {
          category: 'পরিপাক ও বিপাক (অগ্নি ও অন্নবহ স্রোতঃ)',
          items: ['অম্বল ও বুকজ্বালা (অম্লপিত্ত)', 'কোষ্ঠকাঠিন্য (বিবন্ধ)', 'পেট ফাঁপা ও গ্যাস (আধান)', 'ক্ষুধামন্দা (অগ্নিমান্দ্য)', 'পাতলা পায়খানা (অতিসার)'],
        },
        {
          category: 'ত্বক ও অ্যালার্জি (ত্বক রোগ)',
          items: ['চুলকানি ও শুষ্ক র‍্যাশ (বিচর্চিকা / একজিমা)', 'সোরিয়াসিস সদৃশ আঁশ (কিটিব কুষ্ঠ)', 'ব্রণ ও ফুসকুড়ি (মুখদূষিকা)', 'আমবাত / চুলকানি চাকা (শীতার্তপিত্ত)', 'দাদ ও ছত্রাক সংক্রমণ (দদ্রু কুষ্ঠ)'],
        },
        {
          category: 'সন্ধি ও পেশিতন্ত্র (সন্ধি ও অস্থি)',
          items: ['হাঁটু বা গাঁটের ব্যথা (সন্ধিবাত)', 'ইউরিক অ্যাসিড / গেঁটেবাত (বাতরক্ত)', 'কোমরের নিম্নাংশে ব্যথা (কটিমূল)', 'কাঁধ শক্ত হয়ে যাওয়া (অপবাহুক)', 'পেশীর আড়ষ্টতা (স্তম্ভ)'],
        },
        {
          category: 'শ্বাসতন্ত্র ও ইএনটি (প্রাণবহ স্রোতঃ)',
          items: ['শুষ্ক বা কফযুক্ত কাশি (কাস)', 'অ্যালার্জিজনিত সাইনাস ও সর্দি (প্রতিশ্যায়)', 'শ্বাসকষ্ট ও হাঁপানি (তমক শ্বাস)', 'গলার অস্বস্তি ও খুসখুস (কণ্ঠশূল)'],
        },
        {
          category: 'মন ও নিদ্রা (মনোবহ ও নিদ্রা)',
          items: ['অনিদ্রা / ঘুমের সমস্যা (অনিদ্রা)', 'উদ্বেগ ও বুক ধড়ফড় (চিত্তোদ্বেগ)', 'মানসিক ক্লান্তি ও অস্থিরতা', 'মাথাব্যথা ও চাপ (শিরোরোগ)'],
        },
      ];
    case 'hi':
      return [
        {
          category: 'पाचन एवं चयापचय (अग्नि एवं अन्नवह स्रोत)',
          items: ['अम्लपित्त एवं सीने में जलन (अम्लपित्त)', 'कब्ज (विबन्ध)', 'पेट फूलना एवं गैस (आध्मान)', 'भूख न लगना (अग्निमांद्य)', 'दस्त / पतले दस्त (अतिसार)'],
        },
        {
          category: 'त्वचा एवं एलर्जी (त्वक् विकार)',
          items: ['खुजली व सूखे चकत्ते (विचर्चिका / एक्जिमा)', 'सोरायसिस जैसे पपड़ीदार दाग (किटिभ)', 'मुंहासे व फुंसियां (मुखदूषिका)', 'पित्ती / शीतपित्त', 'दाद / फंगल संक्रमण (दद्रु)'],
        },
        {
          category: 'जोड़ एवं अस्थि विकार (संधि एवं अस्थि)',
          items: ['घुटने व जोड़ों का दर्द (संधिवात)', 'गठिया / यूरिक एसिड (वातरक्त)', 'कमर दर्द (कटिशूल)', 'कंधे की जकड़न (अपबाहुक)', 'मांसपेशियों की अकड़न (स्तम्भ)'],
        },
        {
          category: 'श्वसन तंत्र एवं ईएनटी (प्राणवह स्रोत)',
          items: ['सूखी या कफ वाली खांसी (कास)', 'एलर्जी जुकाम व साइनस (प्रतिश्याय)', 'घरघराहट व सांस फूलना (तमक श्वास)', 'गले में खराश व जलन (कंठशूल)'],
        },
        {
          category: 'मन एवं अनिद्रा (मनोवह एवं निद्रा)',
          items: ['अनिद्रा / नींद न आना (अनिद्रा)', 'चिंता व घबराहट (चित्तोद्वेग)', 'मानसिक थकान व भ्रम', 'तनावपूर्ण सिरदर्द (शिरोरोग)'],
        },
      ];
    case 'ta':
      return [
        {
          category: 'செரிமானம் மற்றும் வளர்சிதை மாற்றம் (அக்னி)',
          items: ['அமிலத்தன்மை மற்றும் நெஞ்செரிச்சல் (அம்லபித்தம்)', 'மலச்சிக்கல்', 'வயிற்று உப்புசம் மற்றும் வாயு', 'பசியின்மை (அக்னிமாந்தியம்)', 'வயிற்றுப்போக்கு'],
        },
        {
          category: 'தோல் மற்றும் ஒவ்வாமை (தோல் நோய்கள்)',
          items: ['அரிப்பு மற்றும் வறண்ட தடிப்புகள் (விசர்ச்சிகா)', 'சொரியாசிஸ் செதில் தழும்புகள்', 'முகப்பரு மற்றும் கொப்புளங்கள்', 'தடிப்பு / அரிப்பு நமைச்சல்', 'படர்தாமரை மற்றும் பூஞ்சை தொற்று (தத்ரு)'],
        },
        {
          category: 'மூட்டு மற்றும் தசைக்கூடு (சந்தி வாதம்)',
          items: ['மூட்டு வலி மற்றும் முழங்கால் வலி', 'வாத ரத்தம் / யூரிக் அமில மூட்டுவலி', 'இடுப்பு வலி (கடிசூலை)', 'தோள்பட்டை விறைப்பு', 'தசைப்பிடிப்பு'],
        },
        {
          category: 'சுவாச அமைப்பு மற்றும் காது-மூக்கு-தொண்டை',
          items: ['வறட்டு இருமல் / சளி இருமல் (காசம்)', 'சைனஸ் மற்றும் ஒவ்வாமை சளி', 'இளைப்பு மற்றும் மூச்சுத்திணறல் (சுவாசம்)', 'தொண்டை கரகரப்பு'],
        },
        {
          category: 'மனம் மற்றும் தூக்கம் (நித்திரை)',
          items: ['தூக்கமின்மை (அநித்திரை)', 'பதட்டம் மற்றும் படபடப்பு', 'மன சோர்வு', 'தலைவலி'],
        },
      ];
    case 'te':
      return [
        {
          category: 'జీర్ణక్రియ & జీవక్రియ (అగ్ని & అన్నవహ)',
          items: ['ఎసిడిటీ & గుండెల్లో మంట (ఆమ్లపిత్తం)', 'మలబద్ధకం (విబంధం)', 'కడుపు ఉబ్బరం & గ్యాస్', 'ఆకలి మందగించడం (అగ్నిమాంద్యం)', 'విరేచనాలు (అతిసారం)'],
        },
        {
          category: 'చర్మం & అలెర్జీలు (త్వక్ రోగాలు)',
          items: ['దురద & పొడి దద్దుర్లు (విచర్ఛిక)', 'సోరియాసిస్ పొలుసులు (కిటిభ)', 'మొటిమలు & పొక్కులు (ముఖదూషిక)', 'దద్దుర్లు (శీతపిత్తం)', 'తామర & ఫంగల్ ఇన్ఫెక్షన్ (దద్రు)'],
        },
        {
          category: 'కీళ్ళు & కండరాల వ్యవస్థ (సంధి & అస్థి)',
          items: ['మోకాలి / కీళ్ళ నొప్పులు (సంధివాతం)', 'గౌట్ / యూరిక్ యాసిడ్ నొప్పులు (వాతరక్తం)', 'నడుము నొప్పి (కటిశూల)', 'భుజం బిగుతు (అపబాహుకం)', 'కండరాల దృఢత్వం'],
        },
        {
          category: 'శ్వాసకోశ & ఈఎన్‌టీ (ప్రాణవహ)',
          items: ['పొడి / కఫంతో కూడిన దగ్గు (కాస)', 'సైనస్ & అలెర్జీ జలుబు (ప్రతిశ్యాయం)', 'ఆయాసం & ఉబ్బసం (తమక శ్వాస)', 'గొంతు మంట & గరగర'],
        },
        {
          category: 'మనస్సు & నిద్ర (మనోవహ & నిద్ర)',
          items: ['నిద్రలేమి (అనిద్ర)', 'ఆందోళన & గుండెదడ (చిత్తోద్వేగం)', 'మానసిక అలసట', 'తలనొప్పి (శిరోరోగం)'],
        },
      ];
    case 'kn':
      return [
        {
          category: 'ಜೀರ್ಣಕ್ರಿಯೆ ಮತ್ತು ಚಯಾಪಚಯ (ಅಗ್ನಿ & ಅನ್ನವಹ)',
          items: ['ಆಮ್ಲಪಿತ್ತ ಮತ್ತು ಎದೆಯುರಿ', 'ಮಲಬದ್ಧತೆ (ವಿಬಂಧ)', 'ಹೊಟ್ಟೆ ಉಬ್ಬರ ಮತ್ತು ಗ್ಯಾಸ್', 'ಹಸಿವಿನ ಕೊರತೆ (ಅಗ್ನಿಮಾಂದ್ಯ)', 'ಭೇದಿ / ಸಡಿಲ ಮಲ (ಅತಿಸಾರ)'],
        },
        {
          category: 'ಚರ್ಮ ಮತ್ತು ಅಲರ್ಜಿಗಳು (ತ್ವಕ್ ರೋಗ)',
          items: ['ತುರಿಕೆ ಮತ್ತು ಒಣ ದದ್ದುಗಳು (ವಿಚರ್ಚಿಕಾ)', 'ಸೋರಿಯಾಸಿಸ್ ಕಲೆಗಳು (ಕಿಟಿಭ)', 'ಮೊಡವೆಗಳು (ಮುಖದೂಷಿಕಾ)', 'ದಡಿಕೆಗಳು (ಶೀತಪಿತ್ತ)', 'ಗಜಕರ್ಣ ಮತ್ತು ಶಿಲೀಂಧ್ರ ಸೋಂಕು (ದದ್ರು)'],
        },
        {
          category: 'ಕೀಲುಗಳು ಮತ್ತು ಸ್ನಾಯುಗಳು (ಸಂಧಿ & ಅಸ್ಥಿ)',
          items: ['ಮಂಡಿ / ಕೀಲು ನೋವು (ಸಂಧಿವಾತ)', 'ಗೌಟ್ / ಯೂರಿಕ್ ಆಮ್ಲ ಸಂಧಿವಾತ (ವಾತರಕ್ತ)', 'ಸೊಂಟ ನೋವು (ಕಟಿಶೂಲ)', 'ಭುಜದ ಬಿಗಿತ', 'ಸ್ನಾಯು ಸೆಳೆತ'],
        },
        {
          category: 'ಉಸಿರಾಟ ಮತ್ತು ಇಎನ್‌ಟಿ (ಪ್ರಾಣವಹ)',
          items: ['ಒಣ ಅಥವಾ ಕಫ ಕೆಮ್ಮು (ಕಾಸ)', 'ಸೈನಸ್ ಮತ್ತು ಅಲರ್ಜಿ ನೆಗಡಿ (ಪ್ರತಿಶ್ಯಾಯ)', 'ಉಬ್ಬಸ ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಗಂಟಲು ಕೆರೆತ'],
        },
        {
          category: 'ಮನಸ್ಸು ಮತ್ತು ನಿದ್ರೆ (ಮನೋವಹ & ನಿದ್ರಾ)',
          items: ['ನಿದ್ರಾಹೀನತೆ (ಅನಿದ್ರಾ)', 'ಆತಂಕ ಮತ್ತು ಎದೆಬಡಿತ (ಚಿತ್ತೋದ್ವೇಗ)', 'ಮಾನಸಿಕ ಆಯಾಸ', 'ತಲೆನೋವು (ಶಿರೋರೋಗ)'],
        },
      ];
    case 'mr':
      return [
        {
          category: 'पचन आणि चयापचय (अग्नी आणि अन्नवह स्रोत)',
          items: ['अम्लपित्त आणि छातीत जळजळ', 'बद्धकोष्ठता (विबंध)', 'पोट फुगणे आणि गॅस (आध्मान)', 'भूक मंदावणे (अग्निमांद्य)', 'अतिसार / पातळ शौच'],
        },
        {
          category: 'त्वचा आणि ऍलर्जी (त्वचारोग)',
          items: ['खाज आणि कोरडे पुरळ (विचर्चिका / एक्झिमा)', 'सोरायसिस खवले (किटिभ)', 'चेहऱ्यावरील मुरुम (मुखदूषिका)', 'पित्ताच्या गांधी (शीतपित्त)', 'गजकर्ण / दाद (दद्रू)'],
        },
        {
          category: 'सांधे आणि अस्थिरोग (संधी आणि अस्थी)',
          items: ['गुडघे व सांधेदुखी (संधिवात)', 'युरिक ऍसिड सांधेदुखी (वातरक्त)', 'कंबरदुखी (कटिशूल)', 'खांदा आखडणे (अपबाहुक)', 'स्नायूंची ताठरता'],
        },
        {
          category: 'श्वसनसंस्था आणि कान-नाक-घसा (प्राणवह)',
          items: ['कोरडा किंवा कफयुक्त खोकला (कास)', 'ऍलर्जी सर्दी व सायनस (प्रतिश्याय)', 'दम लागणे व धाप (तमक श्वास)', 'घशातील खवखव'],
        },
        {
          category: 'मन आणि झोप (मनोवह आणि निद्रा)',
          items: ['निद्रानाश (अनिद्रा)', 'चिंता व धडधड (चित्तोद्वेग)', 'मानसिक थकवा', 'डोकेदुखी (शिरोरोग)'],
        },
      ];
    case 'en':
    default:
      return [
        {
          category: 'Digestive & Metabolism (Agni & Annavaha)',
          items: ['Hyperacidity & Burning (Amlapitta)', 'Constipation (Vibandha)', 'Bloating & Gas (Adhmana)', 'Poor Appetite (Agnimandya)', 'Loose Stools (Atisara)'],
        },
        {
          category: 'Skin & Allergies (Tvak Roga)',
          items: ['Itching & Dry Rashes (Vicharchika)', 'Psoriasis-like scaling (Kitibha)', 'Facial Acne & Boils (Mukhadushika)', 'Urticaria / Hives (Sheetapitta)', 'Fungal Ringworm (Dadru)'],
        },
        {
          category: 'Joints & Musculoskeletal (Sandhi & Asthi)',
          items: ['Knee / Joint Pain (Sandhivata)', 'Inflammatory Joint Pain / Gout (Vatarakta)', 'Lower Back Pain (Katisula)', 'Frozen Shoulder (Apabahuka)', 'Muscle Stiffness (Stambha)'],
        },
        {
          category: 'Respiratory & ENT (Pranavaha)',
          items: ['Dry / Productive Cough (Kasa)', 'Allergic Rhinitis / Sinus (Pratishyaya)', 'Wheezing & Breathlessness (Tamaka Shwasa)', 'Throat Irritation (Kanthashula)'],
        },
        {
          category: 'Mind & Sleep (Manovaha & Nidra)',
          items: ['Insomnia / Sleeplessness (Anidra)', 'Anxiety & Palpitations (Chittodvega)', 'Mental Fatigue & Brain Fog', 'Tension Headaches (Shiroroga)'],
        },
      ];
  }
}

export function getSampleCases(lang: SupportedLanguage = 'en'): SampleCase[] {
  switch (lang) {
    case 'bn':
      return [
        {
          title: 'ত্বকের চুলকানি, লালচে ভাব ও শুষ্ক ক্ষতের বিস্তার (বিচর্চিকা / একজিমা)',
          symptoms: 'হাত ও কনুইয়ে তীব্র চুলকানি, খসখসে লালচে দাগ, চুলকালে তরল রস নির্গমন, আর্দ্র আবহাওয়া এবং টক বা গাঁজানো খাবার খেলে উপসর্গ তীব্র বৃদ্ধি পায়।',
          category: 'ত্বক রোগ (চর্মরোগ বিভাগ)',
          imageUrl: APP_IMAGES.driedHerbsRoots,
        },
        {
          title: 'দীর্ঘস্থায়ী অম্লপিত্ত, বুকজ্বালা ও টক ঢেকুর (অম্লপিত্ত / GERD)',
          symptoms: 'খাবারের পর বুক ও গলায় তীব্র জ্বালাপোড়া, টক ঢেকুর (বিদাহী উদ্গার), সকালে বমি বমি ভাব, পেট ভার এবং অনিয়মিত খাবার বা চায়ের কারণে বৃদ্ধি।',
          category: 'অন্নবহ স্রোতঃ (পরিপাকতন্ত্র)',
          imageUrl: APP_IMAGES.brassBowlSpices,
        },
        {
          title: 'হাঁটুর গাঁটে ব্যথা, খটখট শব্দ ও সকালে আড়ষ্টতা (সন্ধিবাত / অস্টিওআর্থ্রাইটিস)',
          symptoms: 'হাঁটাহাটি করলে এবং ঠান্ডা আবহাওয়ায় উভয় হাঁটুর ব্যথা বৃদ্ধি, পা ভাঁজ করলে গাঁটে শব্দ (সন্ধিস্ফুটন), সকালে ২৫ মিনিট গাঁট শক্ত থাকা।',
          category: 'অস্থি-সন্ধি রোগ (অর্থোপেডিক্স)',
          imageUrl: APP_IMAGES.panchakarmaOils,
        },
        {
          title: 'দীর্ঘস্থায়ী শুষ্ক কাশি ও হাঁটার সময় শ্বাসকষ্ট (কাস / বাতজ শ্বাস)',
          symptoms: 'হঠাৎ তীব্র শুষ্ক কাশির বেগ, রাতে বুকে চাপ, আঠালো কফ বের করতে কষ্ট, ঈষদুষ্ণ জল বা ভাপ নিলে উপশম হয়।',
          category: 'প্রাণবহ স্রোতঃ (শ্বাসতন্ত্র)',
          imageUrl: APP_IMAGES.botanicalLeaves,
        },
        {
          title: 'মুখমণ্ডলে ব্রণ, প্রদাহযুক্ত ফুসকুড়ি ও তৈলাক্ত ত্বক (মুখদূষিকা / অ্যাকনে)',
          symptoms: 'গালে ও কপালে বেদনাদায়ক লালচে ফুসকুড়ি ও পুঁজযুক্ত ব্রণ, তৈলাক্ত ত্বক ও রোমকূপ বন্ধ হওয়া, ভাজাপোড়া বা তৈলাক্ত খাবার খেলে বৃদ্ধি।',
          category: 'ক্ষুদ্ররোগ (ত্বক ও সৌন্দর্য বিজ্ঞান)',
          imageUrl: APP_IMAGES.elixirBottles,
        },
      ];
    case 'hi':
      return [
        {
          title: 'त्वचा में तीव्र खुजली, लालिमा एवं शुष्क चकत्ते (विचर्चिका / एक्जिमा)',
          symptoms: 'हाथों और कोहनी पर अत्यधिक खुजली, शुष्क लाल पपड़ीदार चकत्ते, खुजलाने पर हल्का स्राव, नम मौसम और खट्टे/किण्वित भोजन के बाद लक्षण बढ़ना।',
          category: 'त्वक् विकार (त्वचा रोग विभाग)',
          imageUrl: APP_IMAGES.driedHerbsRoots,
        },
        {
          title: 'दीर्घकालिक अम्लपित्त, सीने में जलन व खट्टी डकारें (अम्लपित्त / जीईआरडी)',
          symptoms: 'भोजनोपरांत छाती व गले में जलन, खट्टी डकारें (विदाही उद्गार), प्रातःकाल मिचली, पेट में भारीपन व सिरदर्द, अनियमित खानपान व चाय से वृद्धि।',
          category: 'अन्नवह स्रोत (पाचन तंत्र)',
          imageUrl: APP_IMAGES.brassBowlSpices,
        },
        {
          title: 'घुटनों का दर्द, चरचराहट एवं प्रातःकालीन जकड़न (संधिवात / ऑस्टियोआर्थराइटिस)',
          symptoms: 'चलने व ठंड में दोनों घुटनों में तेज दर्द, मोड़ते समय जोड़ों में आवाज (संधिस्फुटन), सुबह 25 मिनट तक अकड़न एवं गतिशीलता में कमी।',
          category: 'अस्थि-संधि रोग (अस्थि रोग विभाग)',
          imageUrl: APP_IMAGES.panchakarmaOils,
        },
        {
          title: 'सूखी खांसी व परिश्रम करने पर सांस फूलना (कास / वातज श्वास)',
          symptoms: 'अचानक सूखी खांसी के दौरे, रात में सीने में भारीपन, गाढ़ा चिपचिपा कफ निकलने में कठिनाई, गुनगुने पानी व भाप से राहत।',
          category: 'प्राणवह स्रोत (श्वसन रोग)',
          imageUrl: APP_IMAGES.botanicalLeaves,
        },
        {
          title: 'चेहरे पर कील-मुंहासे, फुंसियां व तैलीय त्वचा (मुखदूषिका / एक्ने)',
          symptoms: 'गालों व माथे पर दर्दनाक लाल मुहांसे व फुंसियां, तैलीय त्वचा व बंद रोमछिद्र, तले-भुने फास्ट फूड के सेवन के बाद बढ़ोतरी।',
          category: 'क्षुद्ररोग (त्वचा एवं सौंदर्य शास्त्र)',
          imageUrl: APP_IMAGES.elixirBottles,
        },
      ];
    case 'en':
    default:
      return [
        {
          title: 'Skin Itching, Erythema & Dry Lesions (Vicharchika / Eczema)',
          symptoms: 'Intense itching, dry scaly reddish patches on forearm and elbows, mild oozing when scratched, aggravates in humid weather and after consuming sour/fermented food.',
          category: 'Tvak Roga (Dermatology)',
          imageUrl: APP_IMAGES.driedHerbsRoots,
        },
        {
          title: 'Chronic Hyperacidity, Retro-Sternal Burn & Sour Belching (Amlapitta / GERD)',
          symptoms: 'Severe burning sensation in chest and throat after meals, sour belching (Vidahi Udgara), nausea in morning, heavy abdomen with mild headache, exacerbated by irregular meals and tea.',
          category: 'Annavaha Srotas (Digestive)',
          imageUrl: APP_IMAGES.brassBowlSpices,
        },
        {
          title: 'Knee Joint Pain, Crepitus & Morning Stiffness (Sandhivata / Osteoarthritis)',
          symptoms: 'Bilateral knee joint pain aggravated by walking and cold weather, cracking sensation (crepitus / Sandhisphutana) on flexion, morning stiffness lasting 25 minutes, reduced joint mobility.',
          category: 'Asthi-Sandhi Roga (Orthopedics)',
          imageUrl: APP_IMAGES.panchakarmaOils,
        },
        {
          title: 'Chronic Dry Cough & Breathlessness on Exertion (Kasa / Vataja Shwasa)',
          symptoms: 'Spasmodic dry cough with paroxysmal bouts, chest tightness at night, difficulty expectorating sticky sputum, relieved by warm sips and steam inhalation.',
          category: 'Pranavaha Srotas (Respiratory)',
          imageUrl: APP_IMAGES.botanicalLeaves,
        },
        {
          title: 'Facial Acne, Papules & Oily Skin (Mukhadushika / Acne Vulgaris)',
          symptoms: 'Painful inflamed nodules and pustules on cheeks and forehead, oily skin with clogged pores, aggravated during menstrual cycle and after fried fast foods.',
          category: 'Kshudraroga (Skin & Cosmetology)',
          imageUrl: APP_IMAGES.elixirBottles,
        },
      ];
  }
}

export function getPhilosophyQuote(lang: SupportedLanguage = 'en'): { verse: string; source: string; meaning: string } {
  switch (lang) {
    case 'bn':
      return {
        verse: '“রোগাঃ সর্বেঽপি মন্দেঽগ্নৌ সুতরামুদরাণি চ”',
        source: '— অষ্টাঙ্গ হৃদয় (নিদানস্থান ১২/১)',
        meaning: 'সমস্ত শারীরিক ও বিপাকীয় রোগের মূল কারণ হল পরিপাক অগ্নির দুর্বলতা (মন্দাগ্নি), যার ফলে অন্ত্র ও কোষে বিষাক্ত বিষ (আম) জমা হয়।',
      };
    case 'hi':
      return {
        verse: '“रोगाः सर्वेऽपि मन्देऽग्नौ सुतरामुदराणि च”',
        source: '— अष्टाङ्ग हृदय (निदानस्थान १२/१)',
        meaning: 'सभी शारीरिक एवं उपापचयी रोगों का मूल कारण मंद जठराग्नि है, जिसके परिणामस्वरूप कोशिकाओं में विषाक्त आम (Ama) का संचय होता है।',
      };
    case 'ta':
      return {
        verse: '“ரோகா: ஸர்வேऽபி மந்தேऽக்னௌ சுதராமுதராணி ச”',
        source: '— அஷ்டாங்க ஹ்ருதயம் (நிதானஸ்தானம் 12/1)',
        meaning: 'அனைத்து வளர்சிதை மாற்ற நோய்களுக்கும் மூல காரணம் செரிமான தீயின் (மந்தாக்னி) பலவீனமே ஆகும்.',
      };
    case 'te':
      return {
        verse: '“రోగాః సర్వేऽపి మందేऽగ్నౌ సుతరాముదరాణి చ”',
        source: '— అష్టాంగ హృదయం (నిదానస్థానము 12/1)',
        meaning: 'సమస్త జీవక్రియ మరియు శరీర రుగ్మతలకు జీర్ణశక్తి మందగించడమే (మందాగ్రి) ప్రధాన కారణం.',
      };
    case 'kn':
      return {
        verse: '“ರೋಗಾಃ ಸರ್ವೇಽಪಿ ಮಂದೇಽಗ್ನೌ ಸುತರಾಮುದರಾಣಿ ಚ”',
        source: '— ಅಷ್ಟಾಂಗ ಹೃದಯ (ನಿದಾನಸ್ಥಾನ 12/1)',
        meaning: 'ಎಲ್ಲಾ ಚಯಾಪಚಯ ಮತ್ತು ಉರಿಯೂತದ ಕಾಯಿಲೆಗಳಿಗೆ ಜೀರ್ಣಾಗ್ನಿಯ ಕೊರತೆಯೇ (ಮಂದಾಗ್ನಿ) ಮೂಲ ಕಾರಣ.',
      };
    case 'mr':
      return {
        verse: '“रोगाः सर्वेऽपि मन्देऽग्नौ सुतरामुदराणि च”',
        source: '— अष्टांग हृदय (निदानस्थान १२/१)',
        meaning: 'सर्व चयापचय आणि शारीरिक विकारांचे मूळ कारण मंद जठराग्नी आहे, ज्यामुळे शरीरात विषारी आम साचते.',
      };
    case 'en':
    default:
      return {
        verse: '“रोगाः सर्वेऽपि मन्देऽग्नौ सुतरामुदराणि च”',
        source: '— Ashtanga Hridaya (Nidanasthana 12/1)',
        meaning: 'All metabolic & inflammatory disorders originate from impaired digestive fire (*Mandagni*) resulting in toxic cellular accumulation (*Ama*).',
      };
  }
}

export const SAMPLE_CASES = getSampleCases('en');
export const QUICK_SYMPTOM_CATEGORIES = getQuickSymptomCategories('en');

export const AYURVEDIC_CLINICS: Clinic[] = [
  {
    id: 'clinic-wb-01',
    name: 'National Institute of Ayurveda & State Ayurvedic Hospital',
    type: 'Government Ayurvedic Hospital',
    rating: 4.9,
    reviewCount: 428,
    address: '1, Raja Subodh Chandra Mallick Road, Jadavpur / College Street campus',
    city: 'Kolkata',
    state: 'West Bengal',
    distanceKm: 2.4,
    leadVaidya: 'Dr. Debabrata Bhattacharya, MD (Ayurveda)',
    qualification: 'MD (Ayu - Kayachikitsa), Ph.D, Gold Medalist',
    regNumber: 'WB-AYU-10492',
    phone: '+91 33 2241 4589',
    timing: 'Mon - Sat: 9:00 AM - 4:00 PM',
    consultationFee: '₹100 (Govt Subsidized) / Free O.P.D.',
    services: ['Panchakarma Unit', 'Nadi Pariksha', 'Tvak Roga Speciality', 'Ayurvedic Pharmacy', 'Ksharasutra Surgery'],
    nabhAccredited: true,
    image: APP_IMAGES.doctorConsultation,
  },
  {
    id: 'clinic-wb-02',
    name: 'Ananya Ayur-Kshema Holistic Panchakarma & Wellness',
    type: 'Panchakarma Center',
    rating: 4.8,
    reviewCount: 215,
    address: 'Block CF, Sector 1, Salt Lake City, Near City Centre 1',
    city: 'Kolkata',
    state: 'West Bengal',
    distanceKm: 4.1,
    leadVaidya: 'Dr. Sarmistha Mukherjee, BAMS, MD (Ayu)',
    qualification: 'MD (Panchakarma - Kerala Training)',
    regNumber: 'WB-AYU-18230',
    phone: '+91 98302 45781',
    timing: 'Mon - Sun: 8:00 AM - 7:30 PM',
    consultationFee: '₹600',
    services: ['Abhyanga & Swedana', 'Shirodhara', 'Virechana Karma', 'Diet Consultation', 'Skin & Hair Clinic'],
    nabhAccredited: true,
    image: APP_IMAGES.panchakarmaOils,
  },
  {
    id: 'clinic-mh-01',
    name: 'Podar Ayurvedic Medical College & Hospital',
    type: 'Government Ayurvedic Hospital',
    rating: 4.8,
    reviewCount: 650,
    address: 'Dr. Annie Besant Road, Worli',
    city: 'Mumbai',
    state: 'Maharashtra',
    distanceKm: 3.2,
    leadVaidya: 'Dr. Rajeshwar K. Deshmukh, MD (Ayu)',
    qualification: 'MD (Dravyaguna & Kayachikitsa)',
    regNumber: 'MCIM-I-28941',
    phone: '+91 22 2493 4214',
    timing: 'Mon - Sat: 8:30 AM - 5:00 PM',
    consultationFee: '₹150',
    services: ['Full Panchakarma Suite', 'Roga Nidan Lab', 'Sandhivata Care', 'Inpatient Facility'],
    nabhAccredited: true,
    image: APP_IMAGES.doctorConsultation,
  },
  {
    id: 'clinic-mh-02',
    name: 'Dhootapapeshwar Ayurvedic Chikitsalaya & Research',
    type: 'AYUSH Wellness Clinic',
    rating: 4.9,
    reviewCount: 380,
    address: 'Shivaji Nagar, Near Modern College',
    city: 'Pune',
    state: 'Maharashtra',
    distanceKm: 1.8,
    leadVaidya: 'Dr. Vaidya Anand Joshi, BAMS, CRAV',
    qualification: 'Rasashastra & Bhaishajya Kalpana Expert',
    regNumber: 'MCIM-I-33019',
    phone: '+91 20 2553 8899',
    timing: 'Mon - Sat: 9:30 AM - 8:00 PM',
    consultationFee: '₹500',
    services: ['Traditional Nadi Pariksha', 'Classical Aushadhi Dispensary', 'Chronic Disease Management', 'Suvarnaprashan'],
    nabhAccredited: true,
    image: APP_IMAGES.traditionalCraft,
  },
  {
    id: 'clinic-ka-01',
    name: 'Government Ayurveda Medical College & Hospital',
    type: 'Government Ayurvedic Hospital',
    rating: 4.7,
    reviewCount: 512,
    address: 'Dhanvantari Road, Near City Railway Station',
    city: 'Bengaluru',
    state: 'Karnataka',
    distanceKm: 3.5,
    leadVaidya: 'Dr. H. M. Chandrashekar, MD (Ayu)',
    qualification: 'MD (Shalya Tantra & Panchakarma)',
    regNumber: 'KA-AYU-09412',
    phone: '+91 80 2287 2848',
    timing: 'Mon - Sat: 9:00 AM - 4:30 PM',
    consultationFee: '₹100',
    services: ['24x7 IPD', 'Spine & Joint Care', 'Panchakarma Complex', 'Classical Herb Garden'],
    nabhAccredited: true,
    image: APP_IMAGES.doctorConsultation,
  },
  {
    id: 'clinic-dl-01',
    name: 'All India Institute of Ayurveda (AIIA), Ministry of AYUSH',
    type: 'Government Ayurvedic Hospital',
    rating: 5.0,
    reviewCount: 1240,
    address: 'Mathura Road, Gautampuri, Sarita Vihar',
    city: 'New Delhi',
    state: 'Delhi NCR',
    distanceKm: 5.8,
    leadVaidya: 'Dr. Prof. Tanuja Nesari, MD, Ph.D',
    qualification: 'National Director, Dravyaguna & Clinical Ayurveda',
    regNumber: 'DBCP-AYU-00108',
    phone: '+91 11 2994 8401',
    timing: 'Mon - Sat: 8:00 AM - 4:00 PM',
    consultationFee: '₹20 (OPD Token)',
    services: ['Apex Research Hospital', 'Advanced Panchakarma', 'Integrative Oncology & Diabetes', 'Clinical Trial Wing'],
    nabhAccredited: true,
    image: APP_IMAGES.regulatoryLab,
  },
  {
    id: 'clinic-tn-01',
    name: 'AVN Arogya Ayurvedic Hospital & Healthcare',
    type: 'Panchakarma Center',
    rating: 4.8,
    reviewCount: 310,
    address: '14, 1st Avenue, Shastri Nagar, Adyar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    distanceKm: 4.2,
    leadVaidya: 'Dr. Ramesh R. Varier, BAMS',
    qualification: 'Chief Physician, Ashtavaidya Tradition',
    regNumber: 'TN-MC-AYU-4102',
    phone: '+91 44 2491 5822',
    timing: 'Mon - Sun: 8:00 AM - 8:00 PM',
    consultationFee: '₹700',
    services: ['Authentic Kerala Panchakarma', 'Stroke Rehabilitation', 'Rheumatology Clinic', 'Custom Herbal Preparations'],
    nabhAccredited: true,
    image: APP_IMAGES.panchakarmaOils,
  },
  {
    id: 'clinic-kl-01',
    name: 'Kottakkal Arya Vaidya Sala Clinical Branch',
    type: 'AYUSH Wellness Clinic',
    rating: 4.9,
    reviewCount: 920,
    address: 'M.G. Road, Ravipuram, Ernakulam',
    city: 'Kochi',
    state: 'Kerala',
    distanceKm: 2.1,
    leadVaidya: 'Dr. K. Muraleedharan, MD (Ayu)',
    qualification: 'Senior Medical Officer, Kerala AYUSH',
    regNumber: 'KL-TC-AYU-5512',
    phone: '+91 484 235 4872',
    timing: 'Mon - Sat: 9:00 AM - 6:30 PM',
    consultationFee: '₹400',
    services: ['Classical Kottakkal Medicines', 'Authentic Pizhichil & Njavarakizhi', 'Spine & Disc Care', 'Preventive Rasayana'],
    nabhAccredited: true,
    image: APP_IMAGES.brassBowlSpices,
  },
  {
    id: 'clinic-ts-01',
    name: 'Government Ayurvedic Hospital & Nizamia Campus',
    type: 'Government Ayurvedic Hospital',
    rating: 4.6,
    reviewCount: 340,
    address: 'Near Charminar, High Court Road',
    city: 'Hyderabad',
    state: 'Telangana',
    distanceKm: 3.9,
    leadVaidya: 'Dr. G. Seshagiri Rao, MD (Ayu)',
    qualification: 'MD (Kayachikitsa)',
    regNumber: 'TS-AYU-08192',
    phone: '+91 40 2452 4890',
    timing: 'Mon - Sat: 9:00 AM - 4:00 PM',
    consultationFee: '₹50',
    services: ['General Ayurvedic OPD', 'Skin & Allergy Unit', 'Metabolic Disorders', 'Panchakarma Center'],
    nabhAccredited: true,
    image: APP_IMAGES.doctorConsultation,
  },
];

export function getAyurvedicClinics(lang: SupportedLanguage = 'en'): Clinic[] {
  if (lang === 'en') return AYURVEDIC_CLINICS;

  const typeMap: Record<string, Record<string, string>> = {
    'Government Ayurvedic Hospital': {
      bn: 'সরকারি আয়ুর্বেদিক হাসপাতাল',
      hi: 'सरकारी आयुर्वेदिक चिकित्सालय',
      ta: 'அரசு ஆயுர்வேத மருத்துவமனை',
      te: 'ప్రభుత్వ ఆయుర్వేద ఆసుపత్రి',
      kn: 'ಸರ್ಕಾರಿ ಆಯುರ್ವೇದ ಆಸ್ಪತ್ರೆ',
      mr: 'शासकीय आयुर्वेदिक रुग्णालय',
    },
    'Panchakarma Center': {
      bn: 'পঞ্চকর্ম ও নিরাময় কেন্দ্র',
      hi: 'पंचकर्म एवं कल्याण केंद्र',
      ta: 'பஞ்சகர்மா சிகிச்சை மையம்',
      te: 'పంచకర్మ చికిత్సా కేంద్రం',
      kn: 'ಪಂಚಕರ್ಮ ಚಿಕಿತ್ಸಾ ಕೇಂದ್ರ',
      mr: 'पंचकर्म आणि आरोग्य केंद्र',
    },
    'AYUSH Wellness Clinic': {
      bn: 'আয়ুষ ওয়েলনেস ক্লিনিক',
      hi: 'आयुष वेलनेस क्लिनिक',
      ta: 'ஆயுஷ் நல்வாழ்வு மருத்துவமனை',
      te: 'ఆయుష్ వెల్‌నెస్ క్లినిక్',
      kn: 'ಆಯುಷ್ ವೆಲ್ನೆಸ್ ಕ್ಲಿನಿಕ್',
      mr: 'आयुष वेलनेस क्लिनिक',
    },
  };

  const clinicNameMap: Record<string, Record<string, string>> = {
    'National Institute of Ayurveda & State Ayurvedic Hospital': {
      bn: 'জাতীয় আয়ুর্বেদ সংস্থান ও রাজ্য আয়ুর্বেদিক হাসপাতাল',
      hi: 'राष्ट्रीय आयुर्वेद संस्थान एवं राज्य आयुर्वेदिक चिकित्सालय',
      ta: 'தேசிய ஆயுர்வேத நிறுவனம் மற்றும் மாநில ஆயுர்வேத மருத்துவமனை',
      te: 'నేషనల్ ఇన్స్టిట్యూట్ ఆఫ్ ఆయుర్వేద & రాష్ట్ర ఆయుర్వేద ఆసుపత్రి',
      kn: 'ರಾಷ್ಟ್ರೀಯ ಆಯುರ್ವೇದ ಸಂಸ್ಥೆ ಮತ್ತು ರಾಜ್ಯ ಆಯುರ್ವೇದ ಆಸ್ಪತ್ರೆ',
      mr: 'राष्ट्रीय आयुर्वेद संस्था आणि राज्य आयुर्वेदिक रुग्णालय',
    },
    'Ananya Ayur-Kshema Holistic Panchakarma & Wellness': {
      bn: 'অনন্যা আয়ুর-ক্ষেম হোলিস্টিক পঞ্চকর্ম ও সুস্থতাকেন্দ্র',
      hi: 'अनन्या आयुर्-क्षेम होलिस्टिक पंचकर्म एवं वेलनेस',
      ta: 'அனன்யா ஆயுர்-க்ஷேமா முழுமையான பஞ்சகர்மா மையம்',
      te: 'అనన్య ఆయుర్-క్షేమ హోలిస్టిక్ పంచకర్మ & వెల్నెస్',
      kn: 'ಅನನ್ಯಾ ಆಯುರ್-ಕ್ಷೇಮ ಸಮಗ್ರ ಪಂಚಕರ್ಮ ಮತ್ತು ಸ್ವಾಸ್ಥ್ಯ',
      mr: 'अनन्या आयुर्-क्षेम होलिस्टिक पंचकर्म व वेलनेस',
    },
    'Podar Ayurvedic Medical College & Hospital': {
      bn: 'পোদ্দার আয়ুর্বেদিক মেডিকেল কলেজ ও হাসপাতাল',
      hi: 'पोदार आयुर्वेदिक मेडिकल कॉलेज एवं हॉस्पिटल',
      ta: 'போடார் ஆயுர்வேத மருத்துவக் கல்லூரி & மருத்துவமனை',
      te: 'పోదార్ ఆయుర్వేద వైద్య కళాశాల & ఆసుపత్రి',
      kn: 'ಪೋದಾರ್ ಆಯುರ್ವೇದ ವೈದ್ಯಕೀಯ ಕಾಲೇಜು ಮತ್ತು ಆಸ್ಪತ್ರೆ',
      mr: 'पोदार आयुर्वेदिक मेडिकल कॉलेज आणि रुग्णालय',
    },
    'Dhootapapeshwar Ayurvedic Chikitsalaya & Research': {
      bn: 'ধূতপাপেশ্বর আয়ুর্বেদিক চিকিৎসালয় ও গবেষণা কেন্দ্র',
      hi: 'धूतपापेश्वर आयुर्वेदिक चिकित्सालय एवं अनुसंधान केंद्र',
      ta: 'தூதபாபேஷ்வர் ஆயுர்வேத மருத்துவமனை & ஆராய்ச்சி',
      te: 'ధూత్‌పాపేశ్వర్ ఆయుర్వేద చికిత్సాలయం & రీసెర్చ్',
      kn: 'ಧೂತಪಾಪೇಶ್ವರ ಆಯುರ್ವೇದ ಚಿಕಿತ್ಸಾಲಯ ಮತ್ತು ಸಂಶೋಧನೆ',
      mr: 'धूतपापेश्वर आयुर्वेदिक चिकित्सालय आणि संशोधन केंद्र',
    },
    'Government Ayurveda Medical College & Hospital': {
      bn: 'সরকারি আয়ুর্বেদ মেডিকেল কলেজ ও হাসপাতাল',
      hi: 'सरकारी आयुर्वेद मेडिकल कॉलेज एवं अस्पताल',
      ta: 'அரசு ஆயுர்வேத மருத்துவக் கல்லூரி & மருத்துவமனை',
      te: 'ప్రభుత్వ ఆయుర్వేద వైద్య కళాశాల & ఆసుపత్రి',
      kn: 'ಸರ್ಕಾರಿ ಆಯುರ್ವೇದ ವೈದ್ಯಕೀಯ ಕಾಲೇಜು ಮತ್ತು ಆಸ್ಪತ್ರೆ',
      mr: 'शासकीय आयुर्वेद महाविद्यालय व रुग्णालय',
    },
    'All India Institute of Ayurveda (AIIA), Ministry of AYUSH': {
      bn: 'সর্বভারতীয় আয়ুর্বেদ সংস্থান (AIIA), আয়ুষ মন্ত্রক',
      hi: 'अखिल भारतीय आयुर्वेद संस्थान (AIIA), आयुष मंत्रालय',
      ta: 'அகில இந்திய ஆயுர்வேத நிறுவனம் (AIIA), ஆயுஷ் அமைச்சகம்',
      te: 'ఆల్ ఇండియా ఇన్స్టిట్యూట్ ఆఫ్ ఆయుర్వేద (AIIA), ఆయుష్ మంత్రిత్వ శాఖ',
      kn: 'ಅಖಿಲ ಭಾರತ ಆಯುರ್ವೇದ ಸಂಸ್ಥೆ (AIIA), ಆಯುಷ್ ಸಚಿವಾಲಯ',
      mr: 'अखिल भारतीय आयुर्वेद संस्था (AIIA), आयुष मंत्रालय',
    },
    'AVN Arogya Ayurvedic Hospital & Healthcare': {
      bn: 'এভিএন আরোগ্য আয়ুর্বেদিক হাসপাতাল ও স্বাস্থ্যসেবা',
      hi: 'एवीएन आरोग्य आयुर्वेदिक हॉस्पिटल एवं हेल्थकेयर',
      ta: 'ஏவிஎன் ஆரோக்யா ஆயுர்வேத மருத்துவமனை',
      te: 'AVN ఆరోగ్య ఆయుర్వేద ఆసుపత్రి & హెల్త్‌కేర్',
      kn: 'ಎವಿಎನ್ ಆರೋಗ್ಯ ಆಯುರ್ವೇದ ಆಸ್ಪತ್ರೆ ಮತ್ತು ಹೆಲ್ತ್‌ಕೇರ್',
      mr: 'एव्हीएन आरोग्य आयुर्वेदिक हॉस्पिटल आणि हेल्थकेअर',
    },
    'Kottakkal Arya Vaidya Sala Clinical Branch': {
      bn: 'কোট্টাক্কল আর্য বৈদ্য শালা ক্লিনিক্যাল শাখা',
      hi: 'कोट्टक्कल आर्य वैद्य शाला क्लिनिकल शाखा',
      ta: 'கோட்டக்கல் ஆர்ய வைத்ய சாலா மருத்துவக் கிளை',
      te: 'కొట్టక్కల్ ఆర్య వైద్య శాల క్లినికల్ బ్రాంచ్',
      kn: 'ಕೊಟ್ಟಕ್ಕಲ್ ಆರ್ಯ ವೈದ್ಯ ಶಾಲಾ ಕ್ಲಿನಿಕಲ್ ಶಾಖೆ',
      mr: 'कोट्टक्कल आर्य वैद्य शाळा क्लिनिकल शाखा',
    },
    'Government Ayurvedic Hospital & Nizamia Campus': {
      bn: 'সরকারি আয়ুর্বেদিক হাসপাতাল ও নিজামিয়া চত্বর',
      hi: 'सरकारी आयुर्वेदिक हॉस्पिटल एवं निज़ामिया परिसर',
      ta: 'அரசு ஆயுர்வேத மருத்துவமனை மற்றும் நிஜாமியா வளாகம்',
      te: 'ప్రభుత్వ ఆయుర్వేద ఆసుపత్రి & నిజామియా క్యాంపస్',
      kn: 'ಸರ್ಕಾರಿ ಆಯುರ್ವೇದ ಆಸ್ಪತ್ರೆ ಮತ್ತು ನಿಜಾಮಿಯಾ ಕ್ಯಾಂಪಸ್',
      mr: 'शासकीय आयुर्वेदिक रुग्णालय आणि निझामिया संकुल',
    },
  };

  const doctorMap: Record<string, Record<string, string>> = {
    'Dr. Debabrata Bhattacharya, MD (Ayurveda)': {
      bn: 'ডাঃ দেবব্রত ভট্টাচার্য, এমডি (আয়ুর্বেদ)',
      hi: 'डॉ. देबब्रत भट्टाचार्य, एमडी (आयुर्वेद)',
      ta: 'டாக்டர் தேபப்ரதா பட்டாச்சார்யா, MD (ஆயுர்வேதம்)',
      te: 'డాక్టర్ దేవబ్రత భట్టాచార్య, MD (ఆయుర్వేదం)',
      kn: 'ಡಾ. ದೇವಬ್ರತ ಭಟ್ಟಾಚಾರ್ಯ, MD (ಆಯುರ್ವೇದ)',
      mr: 'डॉ. देबब्रत भट्टाचार्य, एमडी (आयुर्वेद)',
    },
    'Dr. Sarmistha Mukherjee, BAMS, MD (Ayu)': {
      bn: 'ডাঃ শর্মিষ্ঠা মুখার্জী, বিএএমএস, এমডি (আয়ু)',
      hi: 'डॉ. शर्मिष्ठा मुखर्जी, बीएएमएस, एमडी (आयु)',
      ta: 'டாக்டர் சர்மிஷ்டா முகர்ஜி, BAMS, MD (ஆயு)',
      te: 'డాక్టర్ శర్మిష్ఠ ముఖర్జీ, BAMS, MD (ఆయు)',
      kn: 'ಡಾ. ಶರ್ಮಿಷ್ಠಾ ಮುಖರ್ಜಿ, BAMS, MD (ಆಯು)',
      mr: 'डॉ. शर्मिष्ठा मुखर्जी, बीएएमएस, एमडी (आयु)',
    },
    'Dr. Rajeshwar K. Deshmukh, MD (Ayu)': {
      bn: 'ডাঃ রাজেশ্বর কে. দেশমুখ, এমডি (আয়ু)',
      hi: 'डॉ. रामेश्वर के. देशमुख, एमडी (आयु)',
      ta: 'டாக்டர் ராஜேஷ்வர் கே. தேஷ்முக், MD (ஆயு)',
      te: 'డాక్టర్ రాజేశ్వర్ కె. దేశ్‌ముఖ్, MD (ఆయు)',
      kn: 'ಡಾ. ರಾಜೇಶ್ವರ್ ಕೆ. ದೇಶಮುಖ್, MD (ಆಯು)',
      mr: 'डॉ. रामेश्वर के. देशमुख, एमडी (आयु)',
    },
    'Dr. Vaidya Anand Joshi, BAMS, CRAV': {
      bn: 'ডাঃ বৈদ্য আনন্দ জোশী, বিএএমএস, সিআরএভি',
      hi: 'डॉ. वैद्य आनंद जोशी, बीएएमएस, सी.आर.ए.वी',
      ta: 'டாக்டர் வைத்யா ஆனந்த் ஜோஷி, BAMS, CRAV',
      te: 'డాక్టర్ వైద్య ఆనంద్ జోషి, BAMS, CRAV',
      kn: 'ಡಾ. ವೈದ್ಯ ಆನಂದ್ ಜೋಶಿ, BAMS, CRAV',
      mr: 'डॉ. वैद्य आनंद जोशी, बीएएमएस, सी.आर.ए.व्ही',
    },
    'Dr. H. M. Chandrashekar, MD (Ayu)': {
      bn: 'ডাঃ এইচ. এম. চন্দ্রশেখর, এমডি (আয়ু)',
      hi: 'डॉ. एच. एम. चंद्रशेखर, एमडी (आयु)',
      ta: 'டாக்டர் எச். எம். சந்திரசேகர், MD (ஆயு)',
      te: 'డాక్టర్ హెచ్. ఎం. చంద్రశేఖర్, MD (ఆయు)',
      kn: 'ಡಾ. ಹೆಚ್. ಎಂ. ಚಂದ್ರಶೇಖರ್, MD (ಆಯು)',
      mr: 'डॉ. एच. एम. चंद्रशेखर, एमडी (आयु)',
    },
    'Dr. Prof. Tanuja Nesari, MD, Ph.D': {
      bn: 'ডাঃ অধ্যাপক তনুজা নেসারি, এমডি, পিএইচডি',
      hi: 'डॉ. प्रो. तनुजा नेसरी, एमडी, पीएच.डी',
      ta: 'டாக்டர் பேராசிரியர் தனுஜா நேசரி, MD, Ph.D',
      te: 'డాక్టర్ ప్రొఫెసర్ తనుజా నేసరి, MD, Ph.D',
      kn: 'ಡಾ. ಪ್ರೊ. ತನುಜಾ ನೇಸರಿ, MD, Ph.D',
      mr: 'डॉ. प्रा. तनुजा नेसरी, एमडी, पीएच.डी',
    },
    'Dr. Ramesh R. Varier, BAMS': {
      bn: 'ডাঃ রমেশ আর. ভারিয়ার, বিএএমএস',
      hi: 'डॉ. रमेश आर. वारियर, बीएएमएस',
      ta: 'டாக்டர் ரமேஷ் ஆர். வாரியர், BAMS',
      te: 'డాక్టర్ రమేష్ ఆర్. వారియర్, BAMS',
      kn: 'ಡಾ. ರಮೇಶ್ ಆರ್. ವಾರಿಯರ್, BAMS',
      mr: 'डॉ. रमेश आर. वारियर, बीएएमएस',
    },
    'Dr. K. Muraleedharan, MD (Ayu)': {
      bn: 'ডাঃ কে. মুরলীধরণ, এমডি (আয়ু)',
      hi: 'डॉ. के. मुरलीधरन, एमडी (आयु)',
      ta: 'டாக்டர் கே. முரளிதரன், MD (ஆயு)',
      te: 'డాక్టర్ కె. మురళీధరన్, MD (ఆయు)',
      kn: 'ಡಾ. ಕೆ. ಮುರಳೀಧರನ್, MD (ಆಯು)',
      mr: 'डॉ. के. मुरलीधरन, एमडी (आयु)',
    },
    'Dr. G. Seshagiri Rao, MD (Ayu)': {
      bn: 'ডাঃ জি. শেষগিরি রাও, এমডি (আয়ু)',
      hi: 'डॉ. जी. शेषगिरि राव, एमडी (आयु)',
      ta: 'டாக்டர் ஜி. சேஷகிரி ராவ், MD (ஆயு)',
      te: 'డాక్టర్ జి. శేషగిరి రావు, MD (ఆయు)',
      kn: 'ಡಾ. ಜಿ. ಶೇಷಗಿರಿ ರಾವ್, MD (ಆಯು)',
      mr: 'डॉ. जी. शेषगिरी राव, एमडी (आयु)',
    },
  };

  const qualificationMap: Record<string, Record<string, string>> = {
    'MD (Ayu - Kayachikitsa), Ph.D, Gold Medalist': {
      bn: 'এমডি (আয়ু - কায়চিকিৎসা), পিএইচডি, গোল্ড মেডালিস্ট',
      hi: 'एमडी (कायचिकित्सा), पीएच.डी, स्वर्ण पदक विजेता',
      ta: 'MD (காயசிகிச்சை), Ph.D, தங்கப் பதக்கம்',
      te: 'MD (కాయచికిత్స), Ph.D, గోల్డ్ మెడలిస్ట్',
      kn: 'MD (ಕಾಯಚಿಕಿತ್ಸಾ), Ph.D, ಚಿನ್ನದ ಪದಕ ವಿಜೇತ',
      mr: 'एमडी (कायचिकित्सा), पीएच.डी, सुवर्णपदक विजेते',
    },
    'MD (Panchakarma - Kerala Training)': {
      bn: 'এমডি (পঞ্চকর্ম - কেরল প্রশিক্ষণপ্রাপ্ত)',
      hi: 'एमडी (पंचकर्म - केरल प्रशिक्षित)',
      ta: 'MD (பஞ்சகர்மா - கேரளா பயிற்சி)',
      te: 'MD (పంచకర్మ - కేరళ శిక్షణ)',
      kn: 'MD (ಪಂಚಕರ್ಮ - ಕೇರಳ ತರಬೇತಿ)',
      mr: 'एमडी (पंचकर्म - केरळ प्रशिक्षित)',
    },
    'MD (Dravyaguna & Kayachikitsa)': {
      bn: 'এমডি (দ্রব্যগুণ ও কায়চিকিৎসা)',
      hi: 'एमडी (द्रव्यगुण एवं कायचिकित्सा)',
      ta: 'MD (திரவியகுணம் & காயசிகிச்சை)',
      te: 'MD (ద్రవ్యగుణ & కాయచికిత్స)',
      kn: 'MD (ದ್ರವ್ಯಗುಣ ಮತ್ತು ಕಾಯಚಿಕಿತ್ಸಾ)',
      mr: 'एमडी (द्रव्यगुण आणि कायचिकित्सा)',
    },
    'Rasashastra & Bhaishajya Kalpana Expert': {
      bn: 'রসশাস্ত্র ও ভেষজ কল্পনা বিশেষজ্ঞ',
      hi: 'रसशास्त्र एवं भैषज्य कल्पना विशेषज्ञ',
      ta: 'ரசசாஸ்திரம் & பைஷஜ்ய கல்பனா நிபுணர்',
      te: 'రసశాస్త్ర & భైషజ్య కల్పన నిపుణులు',
      kn: 'ರಸಶಾಸ್ತ್ರ ಮತ್ತು ಭೈಷಜ್ಯ ಕಲ್ಪನಾ ತಜ್ಞರು',
      mr: 'रसशास्त्र व भैषज्य कल्पना तज्ज्ञ',
    },
    'MD (Shalya Tantra & Panchakarma)': {
      bn: 'এমডি (শল্যতন্ত্র ও পঞ্চকর্ম)',
      hi: 'एमडी (शल्य तंत्र एवं पंचकर्म)',
      ta: 'MD (சல்ய தந்திரம் & பஞ்சகர்மா)',
      te: 'MD (శల్య తంత్ర & పంచకర్మ)',
      kn: 'MD (ಶಲ್ಯ ತಂತ್ರ ಮತ್ತು ಪಂಚಕರ್ಮ)',
      mr: 'एमडी (शल्य तंत्र आणि पंचकर्म)',
    },
    'National Director, Dravyaguna & Clinical Ayurveda': {
      bn: 'জাতীয় পরিচালক, দ্রব্যগুণ ও ক্লিনিক্যাল আয়ুর্বেদ',
      hi: 'राष्ट्रीय निदेशक, द्रव्यगुण एवं नैदानिक आयुर्वेद',
      ta: 'தேசிய இயக்குனர், திரவியகுணம் & ஆயுர்வேதம்',
      te: 'నేషనల్ డైరెక్టర్, ద్రవ్యగుణ & క్లినికల్ ఆయుర్వేదం',
      kn: 'ರಾಷ್ಟ್ರೀಯ ನಿರ್ದೇಶಕರು, ದ್ರವ್ಯಗುಣ ಮತ್ತು ಕ್ಲಿನಿಕಲ್ ಆಯುರ್ವೇದ',
      mr: 'राष्ट्रीय संचालक, द्रव्यगुण आणि क्लिनिकल आयुर्वेद',
    },
    'Chief Physician, Ashtavaidya Tradition': {
      bn: 'প্রধান চিকিৎসক, অষ্টবৈদ্য পরম্পরা',
      hi: 'मुख्य चिकित्सक, अष्टवैद्य परंपरा',
      ta: 'தலைமை மருத்துவர், அஷ்டவைத்திய பாரம்பரியம்',
      te: 'ప్రధాన వైద్యులు, అష్టవైద్య సంప్రదాయం',
      kn: 'ಮುಖ್ಯ ವೈದ್ಯರು, ಅಷ್ಟವೈದ್ಯ ಸಂಪ್ರದಾಯ',
      mr: 'मुख्य वैद्य, अष्टवैद्य परंपरा',
    },
    'Senior Medical Officer, Kerala AYUSH': {
      bn: 'সিনিয়র মেডিকেল অফিসার, কেরল আয়ুষ',
      hi: 'वरिष्ठ चिकित्सा अधिकारी, केरल आयुष',
      ta: 'மூத்த மருத்துவ அலுவலர், கேரளா ஆயுஷ்',
      te: 'సీనియర్ మెడికల్ ఆఫీసర్, కేరళ ఆయుష్',
      kn: 'ಹಿರಿಯ ವೈದ್ಯಾಧಿಕಾರಿ, ಕೇರಳ ಆಯುಷ್',
      mr: 'वरिष्ठ वैद्यकीय अधिकारी, केरळ आयुष',
    },
    'MD (Kayachikitsa)': {
      bn: 'এমডি (কায়চিকিৎসা)',
      hi: 'एमडी (कायचिकित्सा)',
      ta: 'MD (காயசிகிச்சை)',
      te: 'MD (కాయచికిత్స)',
      kn: 'MD (ಕಾಯಚಿಕಿತ್ಸಾ)',
      mr: 'एमडी (कायचिकित्सा)',
    },
  };

  const feeMap: Record<string, Record<string, string>> = {
    '₹100 (Govt Subsidized) / Free O.P.D.': {
      bn: '₹১০০ (সরকারি অনুদান) / বিনামূল্যে ও.পি.ডি.',
      hi: '₹100 (सरकारी अनुदान) / नि:शुल्क ओपीडी',
      ta: '₹100 (அரசு மானியம்) / இலவச OPD',
      te: '₹100 (ప్రభుత్వ సబ్సిడీ) / ఉచిత OPD',
      kn: '₹100 (ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ) / ಉಚಿತ OPD',
      mr: '₹१०० (शासकीय अनुदान) / मोफत ओपीडी',
    },
    '₹20 (OPD Token)': {
      bn: '₹২০ (বহির্বিভাগ টোকেন)',
      hi: '₹20 (ओपीडी टोकन)',
      ta: '₹20 (OPD டோக்கன்)',
      te: '₹20 (OPD టోకెన్)',
      kn: '₹20 (OPD ಟೋಕನ್)',
      mr: '₹२० (ओपीडी टोकन)',
    },
  };

  const serviceMap: Record<string, Record<string, string>> = {
    'Panchakarma Unit': { bn: 'পঞ্চকর্ম বিভাগ', hi: 'पंचकर्म इकाई', ta: 'பஞ்சகர்மா பிரிவு', te: 'పంచకర్మ విభాగం', kn: 'ಪಂಚಕರ್ಮ ವಿಭಾಗ', mr: 'पंचकर्म विभाग' },
    'Nadi Pariksha': { bn: 'নাড়ী পরীক্ষা', hi: 'नाड़ी परीक्षा', ta: 'நாடி பரிசோதனை', te: 'నాడీ పరీక్ష', kn: 'ನಾಡಿ ಪರೀಕ್ಷೆ', mr: 'नाडी परीक्षा' },
    'Tvak Roga Speciality': { bn: 'চর্মরোগ বিশেষজ্ঞ', hi: 'त्वचा रोग विशेषज्ञता', ta: 'தோல் நோய் சிறப்பு', te: 'చర్మ వ్యాధుల విభాగం', kn: 'ಚರ್ಮ ರೋಗ ಚಿಕಿತ್ಸೆ', mr: 'त्वचारोग विशेष कक्ष' },
    'Ayurvedic Pharmacy': { bn: 'আয়ুর্বেদিক ঔষধালয়', hi: 'आयुर्वेदिक औषधालय', ta: 'ஆயுர்வேத மருந்தகம்', te: 'ఆయుర్వేద ఔషధాలయం', kn: 'ಆಯುರ್ವೇದ ಔಷಧಾಲಯ', mr: 'आयुर्वेदिक औषधालय' },
    'Ksharasutra Surgery': { bn: 'ক্ষারসূত্র শল্যচিকিৎসা', hi: 'क्षारसूत्र शल्य चिकित्सा', ta: 'க்ஷாரசூத்ர அறுவை சிகிச்சை', te: 'క్షారసూత్ర చికిత్స', kn: 'ಕ್ಷಾರಸೂತ್ರ ಚಿಕಿತ್ಸೆ', mr: 'क्षारसूत्र शस्त्रक्रिया' },
    'Abhyanga & Swedana': { bn: 'অভ্যঙ্গ ও স্বেদন', hi: 'अभ्यंग एवं स्वेदन', ta: 'அப்யங்கம் & ஸ்வேதனம்', te: 'అభ్యంగం & స్వేదనం', kn: 'ಅಭ್ಯಂಗ ಮತ್ತು ಸ್ವೇದನ', mr: 'अभ्यंग आणि स्वेदन' },
    'Shirodhara': { bn: 'শিরোধারা', hi: 'शिरोधारा', ta: 'சிரோதாரா', te: 'శిరోధార', kn: 'ಶಿರೋಧಾರಾ', mr: 'शिरोधारा' },
    'Virechana Karma': { bn: 'বিরেচন কর্ম', hi: 'विरेचन कर्म', ta: 'விரேச்சன கர்மா', te: 'విరేచన కర్మ', kn: 'ವಿರೇಚನ ಕರ್ಮ', mr: 'विरेचन कर्म' },
    'Diet Consultation': { bn: 'পথ্য ও আহার পরামর্শ', hi: 'आहार एवं पथ्य परामर्श', ta: 'உணவு முறை ஆலோசனை', te: 'ఆహార సలహా సంప్రదింపులు', kn: 'ಆಹಾರ ಸಲಹಾ ಕೇಂದ್ರ', mr: 'आहार व पथ्य सल्ला' },
    'Skin & Hair Clinic': { bn: 'ত্বক ও চুল যত্ন কেন্দ্র', hi: 'त्वचा एवं केश क्लिनिक', ta: 'தோல் & கூந்தல் மையம்', te: 'చర్మం & జుట్టు సంరక్షణ', kn: 'ಚರ್ಮ ಮತ್ತು ಕೂದಲ ರಕ್ಷಣೆ', mr: 'त्वचा आणि केस क्लिनिक' },
    'Full Panchakarma Suite': { bn: 'সম্পূর্ণ পঞ্চকর্ম ব্যবস্থা', hi: 'पूर्ण पंचकर्म सुइट', ta: 'முழுமையான பஞ்சகர்மா மையம்', te: 'సంపూర్ణ పంచకర్మ యూనిట్', kn: 'ಸಂಪೂರ್ಣ ಪಂಚಕರ್ಮ ವ್ಯವಸ್ಥೆ', mr: 'संपूर्ण पंचकर्म व्यवस्था' },
    'Roga Nidan Lab': { bn: 'রোগ নিদান পরীক্ষাগার', hi: 'रोग निदान प्रयोगशाला', ta: 'நோய் கண்டறிதல் ஆய்வகம்', te: 'రోగ నిదాన ప్రయోగశాల', kn: 'ರೋಗ ನಿದಾನ ಪ್ರಯೋಗಾಲಯ', mr: 'रोग निदान प्रयोगशाळा' },
    'Sandhivata Care': { bn: 'সন্ধিবাত ও গাঁটের যত্ন', hi: 'संधिवात एवं जोड़ देखभाल', ta: 'மூட்டு வலி & வாத சிகிச்சை', te: 'సంధివాత & కీళ్ల సంరక్షణ', kn: 'ಸಂಧಿವಾತ ಚಿಕಿತ್ಸೆ', mr: 'संधिवात व सांधे निगा' },
    'Inpatient Facility': { bn: 'ভর্তি ও অন্তর্বিভাগ সুবিধা', hi: 'अंतरंग रोगी (IPD) सुविधा', ta: 'உள்நோயாளி பிரிவு', te: 'ఇన్‌పేషెంట్ సౌకర్యం', kn: 'ಒಳರೋಗಿ ಸೌಲಭ್ಯ', mr: 'दाखल रुग्ण सुविधा (IPD)' },
    'Traditional Nadi Pariksha': { bn: 'সনাতন নাড়ী পরীক্ষা', hi: 'पारंपरिक नाड़ी परीक्षा', ta: 'பாரம்பரிய நாடி பரிசோதனை', te: 'సాంప్రదాయ నాడీ పరీక్ష', kn: 'ಸಾಂಪ್ರದಾಯಿಕ ನಾಡಿ ಪರೀಕ್ಷೆ', mr: 'पारंपारिक नाडी परीक्षा' },
    'Classical Aushadhi Dispensary': { bn: 'শাস্ত্রীয় ভেষজ ঔষধাগার', hi: 'शास्त्रीय औषधि वितरण केंद्र', ta: 'பாரம்பரிய மூலிகை மருந்தகம்', te: 'శాస్త్రీయ ఔషధ విక్రయశాల', kn: 'ಶಾಸ್ತ್ರೀಯ ಔಷಧ ವಿತರಣಾ ಕೇಂದ್ರ', mr: 'शास्त्रीय औषधालय' },
    'Chronic Disease Management': { bn: 'দীর্ঘস্থায়ী রোগ নিরাময়', hi: 'दीर्घकालिक रोग प्रबंधन', ta: 'நீண்டகால நோய் மேலாண்மை', te: 'దీర్ఘకాలిక వ్యాధుల నిర్వహణ', kn: 'ದೀರ್ಘಕಾಲೀನ ರೋಗ ನಿರ್ವಹಣೆ', mr: 'जुनाट आजार व्यवस्थापन' },
    'Suvarnaprashan': { bn: 'সুবর্ণপ্রাশন সংস্কার', hi: 'सुवर्णप्राशन संस्कार', ta: 'சுவர்ணபிராசனம்', te: 'సువర్ణప్రాశన సంస్కారము', kn: 'ಸುವರ್ಣಪ್ರಾಶನ ಸಂಸ್ಕಾರ', mr: 'सुवर्णप्राशन संस्कार' },
    '24x7 IPD': { bn: '২৪x৭ অন্তর্বিভাগ (IPD)', hi: '24x7 अंतरंग विभाग', ta: '24x7 உள்நோயாளி பிரிவு', te: '24x7 ఇన్‌పేషెంట్ విభాగం', kn: '24x7 ಒಳರೋಗಿ ಸೇವೆ', mr: '24x7 आंतररुग्ण विभाग' },
    'Spine & Joint Care': { bn: 'মেরুদণ্ড ও অস্থিসন্ধি চিকিৎসা', hi: 'रीढ़ एवं जोड़ चिकित्सा', ta: 'முதுகெலும்பு & மூட்டு பராமரிப்பு', te: 'వెన్నెముక & కీళ్ల సంరక్షణ', kn: 'ಬೆನ್ನುಮೂಳೆ ಮತ್ತು ಕೀಲು ರಕ್ಷಣೆ', mr: 'पाठीचा कणा व सांधे उपचार' },
    'Panchakarma Complex': { bn: 'পঞ্চকর্ম চত্বর', hi: 'पंचकर्म परिसर', ta: 'பஞ்சகர்மா வளாகம்', te: 'పంచకర్మ కాంప్లెక్స్', kn: 'ಪಂಚಕರ್ಮ ಸಂಕೀರ್ಣ', mr: 'पंचकर्म संकुल' },
    'Classical Herb Garden': { bn: 'শাস্ত্রীয় ভেষজ উদ্যান', hi: 'शास्त्रीय औषधीय वाटिका', ta: 'மூலிகைத் தோட்டம்', te: 'శాస్త్రీయ మూలికా వనము', kn: 'ಶಾಸ್ತ್ರೀಯ ಗಿಡಮೂಲಿಕೆ ತೋಟ', mr: 'शास्त्रीय औषधी वनस्पती उद्यान' },
    'Apex Research Hospital': { bn: 'শীর্ষ গবেষণা হাসপাতাল', hi: 'शीर्ष अनुसंधान चिकित्सालय', ta: 'தலைமை ஆராய்ச்சி மருத்துவமனை', te: 'అగ్రగామి పరిశోధనా ఆసుపత్రి', kn: 'ಅಗ್ರ ಸಂಶೋಧನಾ ಆಸ್ಪತ್ರೆ', mr: 'सर्वोच्च संशोधन रुग्णालय' },
    'Advanced Panchakarma': { bn: 'উন্নত পঞ্চকর্ম চিকিৎসা', hi: 'उन्नत पंचकर्म चिकित्सा', ta: 'மேம்பட்ட பஞ்சகர்மா', te: 'అధునాతన పంచకర్మ', kn: 'ಸುಧಾರಿತ ಪಂಚಕರ್ಮ', mr: 'प्रगत पंचकर्म उपचार' },
    'Integrative Oncology & Diabetes': { bn: 'সমন্বিত কর্কটরোগ ও বহুমূত্র চিকিৎসা', hi: 'एकीकृत कैंसर एवं मधुमेह चिकित्सा', ta: 'ஒருங்கிணைந்த புற்றுநோய் & நீரிழிவு பராமரிப்பு', te: 'క్యాన్సర్ & మధుమేహ సమగ్ర చికిత్స', kn: 'ಸಮಗ್ರ ಕ್ಯಾನ್ಸರ್ ಮತ್ತು ಮಧುಮೇಹ ಆರೈಕೆ', mr: 'कर्करोग व मधुमेह एकात्मिक उपचार' },
    'Clinical Trial Wing': { bn: 'ক্লিনিক্যাল ট্রায়াল বিভাগ', hi: 'नैदानिक परीक्षण प्रभाग', ta: 'மருத்துவ பரிசோதனைப் பிரிவு', te: 'క్లినికల్ ట్రయల్స్ విభాగం', kn: 'ಕ್ಲಿನಿಕಲ್ ಟ್ರಯಲ್ ವಿಭಾಗ', mr: 'वैद्यकीय चाचणी विभाग' },
    'Authentic Kerala Panchakarma': { bn: 'খাঁটি কেরলীয় পঞ্চকর্ম', hi: 'प्रामाणिक केरल पंचकर्म', ta: 'பாரம்பரிய கேரள பஞ்சகர்மா', te: 'ప్రామాణిక కేరళ పంచకర్మ', kn: 'ಅಪ್ಪಟ ಕೇರಳ ಪಂಚಕರ್ಮ', mr: 'अस्सल केरळीय पंचकर्म' },
    'Stroke Rehabilitation': { bn: 'পক্ষাঘাত ও স্ট্রোক পুনর্বাসন', hi: 'पक्षाघात (स्ट्रोक) पुनर्वास', ta: 'பக்கவாதம் மறுவாழ்வு', te: 'పక్షవాతం పునరావాస చికిత్స', kn: 'ಪಾರ್ಶ್ವವಾಯು ಪುನರ್ವಸತಿ', mr: 'पक्षाघात (स्ट्रोक) पुनर्वसन' },
    'Rheumatology Clinic': { bn: 'রিউমাটোলজি ও বাতরোগ ক্লিনিক', hi: 'वात रोग (संधिशोथ) क्लिनिक', ta: 'வாத நோய் சிகிச்சை மையம்', te: 'వాత వ్యాధుల క్లినిక్', kn: 'ಸಂಧಿವಾತ ಚಿಕಿತ್ಸಾಲಯ', mr: 'संधिवात विशेष क्लिनिक' },
    'Custom Herbal Preparations': { bn: 'অনুকূলিত ভেষজ ঔষধ প্রস্তুতি', hi: 'अनुकूलित हर्बल योग निर्माण', ta: 'தனிப்பயன் மூலிகை மருந்துகள்', te: 'ప్రత్యేక మూలికా ఔషధ తయారీ', kn: 'ವಿಶೇಷ ಗಿಡಮೂಲಿಕೆ ಔಷಧಿ ತಯಾರಿಕೆ', mr: 'विशेष हर्बल औषध निर्मिती' },
    'Classical Kottakkal Medicines': { bn: 'শাস্ত্রীয় কোট্টাক্কল ঔষধাবলী', hi: 'शास्त्रीय कोट्टक्कल औषधियां', ta: 'பாரம்பரிய கோட்டக்கல் மருந்துகள்', te: 'శాస్త్రీయ కొట్టక్కల్ మందులు', kn: 'ಶಾಸ್ತ್ರೀಯ ಕೊಟ್ಟಕ್ಕಲ್ ಔಷಧಗಳು', mr: 'शास्त्रीय कोट्टक्कल औषधे' },
    'Authentic Pizhichil & Njavarakizhi': { bn: 'খাঁটি পিঝিচিল ও নবরাকিঝি', hi: 'प्रामाणिक पिळिच्चिल् एवं षष्टिकशाली पिण्डस्वेद', ta: 'பிழிச்சல் & ஞவரக்கிழி', te: 'పిళిచిల్ & న్యావరకిళి', kn: 'ಪಿಳಿಚಿಲ್ ಮತ್ತು ಞವರಕ್ಕಿಳಿ', mr: 'पिळिच्चिल् व षाष्टिकशाली पिंडस्वेद' },
    'Spine & Disc Care': { bn: 'মেরুদণ্ড ও ডিস্ক নিরাময়', hi: 'रीढ़ एवं डिस्क केयर', ta: 'முதுகெலும்பு & டிஸ்க் சிகிச்சை', te: 'వెన్నెముక & డిస్క్ సంరక్షణ', kn: 'ಬೆನ್ನುಮೂಳೆ ಮತ್ತು ಡಿಸ್ಕ್ ಆರೈಕೆ', mr: 'पाठीचा कणा व मणके निगा' },
    'Preventive Rasayana': { bn: 'প্রতিরোধক রসায়ন থেরাপি', hi: 'रोग प्रतिरोधक रसायन चिकित्सा', ta: 'நோய் தடுப்பு ரசாயன சிகிச்சை', te: 'వ్యాధి నిరోధక రసాయన చికిత్స', kn: 'ರೋಗನಿರೋಧಕ ರಸಾಯನ ಚಿಕಿತ್ಸೆ', mr: 'रोगप्रतिबंधक रसायन चिकित्सा' },
    'General Ayurvedic OPD': { bn: 'সাধারণ আয়ুর্বেদিক বহির্বিভাগ (OPD)', hi: 'सामान्य आयुर्वेदिक बहिरंग विभाग', ta: 'பொது ஆயுர்வேத புறநோயாளி பிரிவு', te: 'సాధారణ ఆయుర్వేద OPD', kn: 'ಸಾಮಾನ್ಯ ಆಯುರ್ವೇದ OPD', mr: 'सामान्य आयुर्वेदिक बाह्यरुग्ण विभाग' },
    'Skin & Allergy Unit': { bn: 'ত্বক ও এলার্জি বিভাগ', hi: 'त्वचा एवं एलर्जी इकाई', ta: 'தோல் & ஒவ்வாமை பிரிவு', te: 'చర్మం & అలర్జీ విభాగం', kn: 'ಚರ್ಮ ಮತ್ತು ಅಲರ್ಜಿ ವಿಭಾಗ', mr: 'त्वचा व ॲलर्जी विभाग' },
    'Metabolic Disorders': { bn: 'বিপাকীয় ব্যাধি নিরাময়', hi: 'उपापचयी (मेटाबॉलिक) विकार चिकित्सा', ta: 'வளர்சிதை மாற்றக் கோளாறுகள்', te: 'జీవక్రియ లోపాల చికిత్స', kn: 'ಚಯಾಪಚಯ ಅಸ್ವಸ್ಥತೆಗಳ ಆರೈಕೆ', mr: 'चयापचय (मेटाबॉलिक) विकार उपचार' },
    'Panchakarma Center': { bn: 'পঞ্চকর্ম কেন্দ্র', hi: 'पंचकर्म केंद्र', ta: 'பஞ்சகர்மா மையம்', te: 'పంచకర్మ కేంద్రం', kn: 'ಪಂಚಕರ್ಮ ಕೇಂದ್ರ', mr: 'पंचकर्म केंद्र' },
  };

  return AYURVEDIC_CLINICS.map((clinic) => {
    const locType = typeMap[clinic.type]?.[lang] || clinic.type;
    const locName = clinicNameMap[clinic.name]?.[lang] || clinic.name;
    const locLead = doctorMap[clinic.leadVaidya]?.[lang] || clinic.leadVaidya;
    const locQual = qualificationMap[clinic.qualification]?.[lang] || clinic.qualification;
    const locFee = feeMap[clinic.consultationFee]?.[lang] || clinic.consultationFee;
    const locServices = clinic.services.map((s) => serviceMap[s]?.[lang] || s);

    return {
      ...clinic,
      name: locName,
      type: locType,
      leadVaidya: locLead,
      qualification: locQual,
      consultationFee: locFee,
      services: locServices,
    };
  });
}

export const HERB_KNOWLEDGE_BASE: HerbKnowledgeEntry[] = [
  {
    id: 'herb-ashwagandha',
    sanskritName: 'Ashwagandha (अश्वगंधा)',
    englishName: 'Indian Ginseng / Winter Cherry',
    botanicalName: 'Withania somnifera (L.) Dunal',
    family: 'Solanaceae',
    rasa: ['Tikta (Bitter)', 'Kashaya (Astringent)', 'Madhura (Sweet)'],
    guna: ['Laghu (Light)', 'Snigdha (Unctuous)'],
    virya: 'Ushna (Heating)',
    vipaka: 'Madhura',
    prabhava: 'Medhya & Balya (Cognitive Enhancer & Vital Strength Booster)',
    doshaKarma: 'Vata-Kapha Shamaka (Pacifies Vata and Kapha)',
    keyPhytochemicals: ['Withanolides (Withaferin A, Withanolide D)', 'Sitoindosides VII-X', 'Withanine Alkaloids'],
    classicalSource: 'Charaka Samhita Sutrasthana 4/16 (Balya Mahakashaya), Bhavaprakasha Nighantu Guduchyadi Varga',
    tkdlIdentifer: 'TKDL-AYU-DP04/1820',
    therapeuticUses: ['Chronic Fatigue & Stress (Chinta-Shrama)', 'Insomnia (Anidra)', 'Joint Inflammation (Sandhivata)', 'Immune Debility (Rasayana)'],
    cautions: ['Avoid in acute high Pitta fevers or hyperthyroidism without physician guidance.'],
    image: APP_IMAGES.driedHerbsRoots,
  },
  {
    id: 'herb-haridra',
    sanskritName: 'Haridra (हरिद्रा / हल्दी)',
    englishName: 'Turmeric',
    botanicalName: 'Curcuma longa L.',
    family: 'Zingiberaceae',
    rasa: ['Tikta (Bitter)', 'Katu (Pungent)'],
    guna: ['Ruksha (Dry)', 'Laghu (Light)'],
    virya: 'Ushna (Heating)',
    vipaka: 'Katu',
    prabhava: 'Varnya & Vishaghna (Complexion Enhancer & Toxin Neutralizer)',
    doshaKarma: 'Tridosha Shamaka (Balances Kapha-Pitta especially, pacifies Vata)',
    keyPhytochemicals: ['Curcumin (Diferuloylmethane)', 'Demethoxycurcumin', 'Turmerones (Essential oil)'],
    classicalSource: 'Sushruta Samhita Sutrasthana 38/27 (Haridradi Gana), Ayurvedic Pharmacopoeia of India (API Vol 1)',
    tkdlIdentifer: 'TKDL-AYU-TC01/0042 (Famous CSIR landmark revocation case against US Patent 5,401,504)',
    therapeuticUses: ['Skin Diseases (Kushtha/Vicharchika)', 'Allergic Rhinitis (Pratishyaya)', 'Metabolic Prameha / Diabetes', 'Wound Healing (Vranaropana)'],
    cautions: ['Caution in obstructive biliary stones in massive pharmaceutical doses.'],
    image: APP_IMAGES.heroMortar,
  },
  {
    id: 'herb-guduchi',
    sanskritName: 'Guduchi / Amrita (गुडूची / गिलोय)',
    englishName: 'Heart-leaved Moonseed / Giloy',
    botanicalName: 'Tinospora cordifolia (Willd.) Miers',
    family: 'Menispermaceae',
    rasa: ['Tikta (Bitter)', 'Kashaya (Astringent)'],
    guna: ['Laghu (Light)', 'Snigdha (Unctuous)'],
    virya: 'Ushna (Mildly Heating / Metabolic)',
    vipaka: 'Madhura',
    prabhava: 'Vayasthapana & Jwarahara (Anti-Aging & Febrifuge)',
    doshaKarma: 'Tridosha Shamaka (Universally balances Vata, Pitta, and Kapha)',
    keyPhytochemicals: ['Tinosporaside', 'Cordifolioside A', 'Berberine', 'Giloin', 'Polysaccharides'],
    classicalSource: 'Charaka Samhita Chikitsasthana 1/3 (Rasayana Adhyaya), Ashtanga Hridaya',
    tkdlIdentifer: 'TKDL-AYU-GD02/9914',
    therapeuticUses: ['Chronic & Viral Fevers (Jwara)', 'Liver & Spleen Disorders (Yakrit-Pliha)', 'Gout & High Uric Acid (Vatarakta)', 'Immunity Deficiency'],
    cautions: ['Monitored in diabetic patients as it potentiates glycemic lowering.'],
    image: APP_IMAGES.botanicalLeaves,
  },
  {
    id: 'herb-triphala',
    sanskritName: 'Triphala (त्रिफला - Haritaki, Bibhitaki, Amalaki)',
    englishName: 'Three Myrobalans Classical Compound',
    botanicalName: 'Terminalia chebula, Terminalia bellirica, Emblica officinalis',
    family: 'Combretaceae & Phyllanthaceae',
    rasa: ['Contains 5 of 6 Rasas (Except Lavana / Salty)'],
    guna: ['Laghu (Light)', 'Ruksha (Dry)'],
    virya: 'Anushnasheeta (Temperate balanced)',
    vipaka: 'Madhura',
    prabhava: 'Chakshushya & Deepana-Pachana (Ocular tonic & Gentle colon cleansing)',
    doshaKarma: 'Tridosha Shamaka',
    keyPhytochemicals: ['Gallic acid', 'Ellagic acid', 'Chebulic acid', 'Vitamin C (Ascorbic acid polymers)'],
    classicalSource: 'Charaka Samhita Sutrasthana 25/40, Sushruta Samhita Chikitsa 27',
    tkdlIdentifer: 'TKDL-AYU-TR01/0108',
    therapeuticUses: ['Chronic Constipation & Dysbiosis', 'Ocular Health (Netra Roga)', 'Dyslipidemia & Weight Balancing', 'Oral & Dental Health (Mukharoga)'],
    cautions: ['Do not administer in acute severe diarrhea or dehydration without rehydration.'],
    image: APP_IMAGES.brassBowlSpices,
  },
  {
    id: 'herb-brahmi',
    sanskritName: 'Brahmi / Saraswati (ब्राह्मी)',
    englishName: 'Water Hyssop / Bacopa',
    botanicalName: 'Bacopa monnieri (L.) Wettst.',
    family: 'Plantaginaceae / Scrophulariaceae',
    rasa: ['Tikta (Bitter)', 'Kashaya (Astringent)', 'Madhura (Sweet)'],
    guna: ['Laghu (Light)', 'Sara (Mobile)'],
    virya: 'Sheeta (Cooling)',
    vipaka: 'Madhura',
    prabhava: 'Medhya (Nootropic & Cognitive Rejuvenator)',
    doshaKarma: 'Vata-Pitta Shamaka',
    keyPhytochemicals: ['Bacoside A3', 'Bacopaside I & II', 'Bacopasaponin C', 'Betulinic acid'],
    classicalSource: 'Bhavaprakasha Guduchyadi Varga, Charaka Samhita Chikitsa 1/3 (Medhya Rasayana)',
    tkdlIdentifer: 'TKDL-AYU-BM07/4412',
    therapeuticUses: ['Memory & Attention Deficit (Smriti Hrasa)', 'Anxiety Neurosis (Chittodvega)', 'Epilepsy & Convulsive states (Apasmara)', 'Speech Clarity'],
    cautions: ['May cause mild nausea if taken on an entirely empty stomach without ghee or milk.'],
    image: APP_IMAGES.greenMedicinalPlants,
  },
  {
    id: 'herb-neem',
    sanskritName: 'Nimba / Neem (निम्ब / नीम)',
    englishName: 'Margosa Tree / Neem',
    botanicalName: 'Azadirachta indica A. Juss.',
    family: 'Meliaceae',
    rasa: ['Tikta (Deep Bitter)', 'Kashaya (Astringent)'],
    guna: ['Laghu (Light)', 'Ruksha (Dry)'],
    virya: 'Sheeta (Cooling)',
    vipaka: 'Katu',
    prabhava: 'Krimighna & Kandughna (Antiparasitic, Anthelmintic & Anti-Pruritic)',
    doshaKarma: 'Pitta-Kapha Hara (Extremely potent against Pitta & Kapha toxins)',
    keyPhytochemicals: ['Azadirachtin', 'Nimbin', 'Nimbidin', 'Salannin', 'Gedunin'],
    classicalSource: 'Charaka Samhita Sutrasthana 27/156, Bhavaprakasha Nighantu Vatadi Varga',
    tkdlIdentifer: 'TKDL-AYU-NE01/0009 (Landmark EPO Patent EP 0436257 Revocation on Neem Fungicide)',
    therapeuticUses: ['Infectious Skin Conditions (Kushtha & Vicharchika)', 'Acne & Boils', 'Gingivitis & Periodontal disease', 'Blood Purification (Raktashodhaka)'],
    cautions: ['Contraindicated in couples actively trying to conceive (documented mild reversible spermatogenic suppression in high doses).'],
    image: APP_IMAGES.herbalWellness,
  },
];

export const SAMPLE_PATENT_CASES = [
  {
    title: 'Lipid-Nanocarrier Standardized Extract of Withania Somnifera & Boswellia Serrata',
    ingredients: 'Standardized Withanolide glycosides (10% w/w) from Withania somnifera and 3-O-acetyl-11-keto-beta-boswellic acid (AKBA 30% w/w) in a self-emulsifying phospholipid nanocarrier (1:2 ratio) using supercritical CO2 extraction.',
    indication: 'Targeted oral bioavailable therapy for Inflammatory Arthritis with 4.8x higher cartilage preservation index compared to simple pulverized powder.',
  },
  {
    title: 'Synergistic Multi-Target Formulation of Curcuma Longa, Piperine & Berberine for Metabolic Syndrome',
    ingredients: 'Curcumin-Phosphatidylcholine complex (40%), Piperine bio-enhancer (2.5%), and Berberine Hydrochloride nano-emulsion (57.5%) achieving 8.2-fold reduction in intestinal glucuronidation.',
    indication: 'Non-alcoholic fatty liver disease (NAFLD) and insulin resistance management under Section 3(e) synergistic efficacy demonstration.',
  },
  {
    title: 'Topical Polyherbal Hydrogel of Rubia Cordifolia (Manjistha) & Azadirachta Indica for Refractory Psoriasis',
    ingredients: 'Aqueous-ethanolic fraction of Manjistha anthraquinones (4%) combined with Neem seed limonoids (2%) encapsulated in a thermosensitive Pluronic F-127 hydrogel matrix.',
    indication: 'Topical alleviation of hyperkeratosis and plaque erythema in Psoriasis with zero rebound flaring.',
  },
];

export function getSamplePatentCases(lang: SupportedLanguage = 'en') {
  switch (lang) {
    case 'bn':
      return [
        {
          title: 'অশ্বগন্ধা ও শল্লকী (Boswellia)-র লিপিড-ন্যানো ক্যারিয়ার প্রমিত নির্গমন',
          ingredients: 'উইথানিয়া সোমনিফেরা থেকে প্রমিত উইথানোলাইড গ্লাইকোসাইড (১০% w/w) এবং ফসফোলিপিড ন্যানোক্যারিয়ারে সুপারক্রিটিক্যাল CO2 নিষ্কাশিত বোসওয়েলিক অ্যাসিড (AKBA ৩০% w/w)।',
          indication: 'প্রদাহজনিত বাতরোগের জন্য সাধারণ পাউডারের তুলনায় ৪.৮ গুণ অধিক শোষণযোগ্য কার্টিলেজ সংরক্ষণ থেরাপি।',
        },
        {
          title: 'মেটাবলিক সিন্ড্রোমের জন্য হলুদ (কারকিউমিন), গোলমরিচ ও দারুহরিদ্রার সমন্বিত সিনারজিস্টিক ফর্মুলেশন',
          ingredients: 'কারকিউমিন-ফসফাটিডিলকোলিন কমপ্লেক্স (৪০%), পাইপেরিন বায়ো-এনহ্যান্সার (২.৫%), এবং বারবারিন হাইড্রোক্লোরাইড ন্যানো-ইমালসন (৫৭.৫%)।',
          indication: 'ফ্যাটি লিভার (NAFLD) এবং ইনসুলিন রেজিস্ট্যান্স নিয়ন্ত্রণে ধারা ৩(e) এর অধীনে সিনারজিস্টিক কার্যকারিতা প্রদর্শন।',
        },
        {
          title: 'সোরিয়াসিসের জন্য মঞ্জিষ্ঠা ও নিমের থার্মোসেনসিটিভ পলিহার্বাল হাইড্রোজেল',
          ingredients: 'মঞ্জিষ্ঠার অ্যানথ্রাকুইননস (৪%) এবং নিম বীজের লিমোনয়েডস (২%) থার্মোসেনসিটিভ প্লুরোনিক এফ-১২৭ হাইড্রোজেল ম্যাট্রিক্সে আবদ্ধ।',
          indication: 'সোরিয়াসিসের প্রদাহ ও ত্বকের পুরু আঁশ দূরীকরণ থেরাপি।',
        },
      ];
    case 'hi':
      return [
        {
          title: 'अश्वगंधा एवं शल्लकी का लिपिड-नैनोकैरियर मानकीकृत अर्क',
          ingredients: 'अश्वगंधा से मानकीकृत विथानोलाइड्स (10% w/w) एवं शल्लकी बोसवेलिक एसिड (AKBA 30% w/w) फॉस्फोलिपिड नैनोकैरियर में निष्कासित।',
          indication: 'जोड़ों के दर्द व संधिवात में सामान्य चूर्ण की तुलना में 4.8 गुना अधिक प्रभावी कार्टिलेज सुरक्षा।',
        },
        {
          title: 'हल्दी (करक्यूमिन), पिप्पली एवं दारुहरिद्रा का सहक्रियाशील (Synergistic) योग',
          ingredients: 'करक्यूमिन-फॉस्फोलिपिड कॉम्प्लेक्स (40%), पिपेरिन बायो-एन्हांसर (2.5%), एवं बर्बेरिन नैनो-इमल्शन (57.5%)।',
          indication: 'फैटी लिवर एवं इंसुलिन संवेदनशीलता में धारा 3(e) के अंतर्गत पेटेंट योग्य सहक्रियाशीलता।',
        },
        {
          title: 'सोरायसिस के लिए मंजिष्ठा एवं नीम का पॉलीहर्बल हाइड्रोजेल',
          ingredients: 'मंजिष्ठा एंथ्राक्विनोन (4%) एवं नीम बीज लिमोनोइड्स (2%) थर्मोसेंसिटिव हाइड्रोजेल मैट्रिक्स में।',
          indication: 'सोरायसिस के लाल चकत्ते एवं पपड़ीदार त्वचा का सुरक्षित स्थानीय उपचार।',
        },
      ];
    case 'ta':
      return [
        {
          title: 'அமுக்கிராங்கிழங்கு (அஸ்வகந்தா) & குங்கிலியம் லிப்பிட்-நானோ கலவை',
          ingredients: 'அஸ்வகந்தாவிலிருந்து வித்தானோலைடுகள் (10% w/w) மற்றும் குங்கிலியம் போஸ்வெல்லிக் அமிலம் (AKBA 30%) பாஸ்போலிப்பிட் நானோ கேரியரில்.',
          indication: 'கீல்வாத மூட்டு வலிக்கு சாதாரண பொடியை விட 4.8 மடங்கு அதிக உறிஞ்சுதல் திறன் கொண்ட குருத்தெலும்பு பாதுகாப்பு.',
        },
        {
          title: 'மஞ்சள் (குர்குமின்), மிளகு மற்றும் மரமஞ்சள் கூட்டு சினெர்ஜிஸ்டிக் உருவாக்கம்',
          ingredients: 'குர்குமின்-பாஸ்பாடிடைல்கோலின் (40%), பைபரின் (2.5%), மற்றும் பெர்பரின் நானோ குழம்பு (57.5%).',
          indication: 'கொழுப்பு கல்லீரல் மற்றும் இன்சுலின் உணர்திறன் சிகிச்சையில் பிரிவு 3(e) கீழ் காப்புரிமை தகுதி.',
        },
        {
          title: 'சொரியாசிஸ் நோய்க்கான மஞ்சிஷ்டி மற்றும் வேம்பு பாலிஹெர்பல் ஹைட்ரோஜெல்',
          ingredients: 'மஞ்சிஷ்டா ஆந்த்ராகுவினோன்கள் (4%) மற்றும் வேப்ப விதை லிமோனாய்டுகள் (2%) புளூரோனிக் F-127 ஹைட்ரோஜெல் மேட்ரிக்ஸில்.',
          indication: 'சொரியாசிஸ் தடிப்பு மற்றும் செதில் சருமத்திற்கான பாதுகாப்பான மேற்பூச்சு சிகிச்சை.',
        },
      ];
    case 'te':
      return [
        {
          title: 'అశ్వగంధ మరియు గుగ్గిలం (Boswellia) లిపిడ్-నానో క్యారియర్ సారం',
          ingredients: 'అశ్వగంధ నుండి ప్రామాణిక విథానోలైడ్లు (10% w/w) మరియు ఫాస్ఫోలిపిడ్ నానో క్యారియర్ ద్వారా సంగ్రహించిన బోస్వెల్లిక్ ఆమ్లం (AKBA 30%).',
          indication: 'కీళ్ల వాతం మరియు మోకాళ్ల నొప్పులలో సాధారణ చూర్ణం కంటే 4.8 రెట్లు అధిక రక్షణ మరియు శోషణ.',
        },
        {
          title: 'పసుపు (కర్కుమిన్), పిప్పళ్ళు మరియు మానిపసుపు సినర్జిస్టిక్ ఫార్ములేషన్',
          ingredients: 'కర్కుమిన్-ఫాస్ఫాటిడైల్కోలిన్ (40%), పైపరీన్ (2.5%), మరియు బెర్బెరీన్ నానో-ఎమల్షన్ (57.5%).',
          indication: 'ఫ్యాటీ లివర్ మరియు ఇన్సులిన్ నిరోధకత నిర్వహణలో సెక్షన్ 3(e) క్రింద పేటెంట్ సామర్థ్యం.',
        },
        {
          title: 'సోరియాసిస్ కొరకు మంజిష్ట మరియు వేప పాలిహెర్బల్ హైడ్రోజెల్',
          ingredients: 'మంజిష్ట ఆంత్రాక్వినోన్లు (4%) మరియు వేప గింజల లిమోనాయిడ్లు (2%) థర్మోసెన్సిటివ్ హైడ్రోజెల్ మాతృకలో.',
          indication: 'సోరియాసిస్ మచ్చలు మరియు చర్మ పొలుసుల నివారణకు సమర్థవంతమైన లేపనం.',
        },
      ];
    case 'kn':
      return [
        {
          title: 'ಅಶ್ವಗಂಧ ಮತ್ತು ಸಾಲಕ್ಕಿ (Boswellia) ಲಿಪಿಡ್-ನ್ಯಾನೋ ಕ್ಯಾರಿಯರ್ ಪ್ರಮಾಣೀಕೃತ ಸಾರ',
          ingredients: 'ಅಶ್ವಗಂಧದಿಂದ ವಿಥಾನೋಲೈಡ್ಗಳು (10% w/w) ಮತ್ತು ರಂಜಕಯುಕ್ತ ನ್ಯಾನೋ ಕ್ಯಾರಿಯರ್ನಲ್ಲಿ ಸಂಸ್ಕರಿಸಿದ ಬೋಸ್ವೆಲ್ಲಿಕ್ ಆಮ್ಲ (AKBA 30%).',
          indication: 'ಕೀಲು ನೋವು ಮತ್ತು ಸಂಧಿವಾತದಲ್ಲಿ ಸಾಮಾನ್ಯ ಚೂರ್ಣಕ್ಕಿಂತ 4.8 ಪಟ್ಟು ಹೆಚ್ಚು ಪರಿಣಾಮಕಾರಿ ಕಾರ್ಟಿಲೆಜ್ ರಕ್ಷಣೆ.',
        },
        {
          title: 'ಅರಿಶಿನ (ಕರ್ಕ್ಯುಮಿನ್), ಹಿಪ್ಪಲಿ ಮತ್ತು ಮರದರಿಶಿನ ಸಂಯೋಜಿತ ಸೂತ್ರೀಕರಣ',
          ingredients: 'ಕರ್ಕ್ಯುಮಿನ್-ಫಾಸ್ಫೋಲಿಪಿಡ್ ಸಂಕೀರ್ಣ (40%), ಪೈಪರೀನ್ (2.5%), ಮತ್ತು ಬರ್ಬರೀನ್ ನ್ಯಾನೋ-ಎಮಲ್ಷನ್ (57.5%).',
          indication: 'ಫ್ಯಾಟಿ ಲಿವರ್ ಮತ್ತು ಇನ್ಸುಲಿನ್ ಸಮತೋಲನದಲ್ಲಿ ಸೆಕ್ಷನ್ 3(e) ಅಡಿಯಲ್ಲಿ ಪೇಟೆಂಟ್ ಮಾನ್ಯತೆ.',
        },
        {
          title: 'ಸೋರಿಯಾಸಿಸ್‌ಗಾಗಿ ಮಂಜಿಷ್ಠ ಮತ್ತು ಬೇವಿನ ಪಾಲಿಹರ್ಬಲ್ ಹೈಡ್ರೋಜೇಲ್',
          ingredients: 'ಮಂಜಿಷ್ಠ ಆಂಥ್ರಾಕ್ವಿನೋನ್ (4%) ಮತ್ತು ಬೇವಿನ ಬೀಜದ ಲಿಮೊನಾಯ್ಡ್‌ಗಳು (2%) ಹೈಡ್ರೋಜೇಲ್ ಮ್ಯಾಟ್ರಿಕ್ಸ್‌ನಲ್ಲಿ.',
          indication: 'ಸೋರಿಯಾಸಿಸ್ ಕಲೆಗಳು ಮತ್ತು ಚರ್ಮದ ಉರಿಯೂತ ನಿವಾರಣೆಗೆ ಸುರಕ್ಷಿತ ಲೇಪನ.',
        },
      ];
    case 'mr':
      return [
        {
          title: 'अश्वगंधा व सल्लकी (Boswellia) लिपिड-नॅनोकॅरियर प्रमाणित अर्क',
          ingredients: 'अश्वगंधा विथॅनोलाइड्स (10% w/w) आणि फॉस्फोलिपिड नॅनोकॅरियरमधील बोसवेलिक ऍसिड (AKBA 30% w/w).',
          indication: 'सांधेदुखी व संधिवातामध्ये सामान्य चूर्णापेक्षा 4.8 पट अधिक प्रभावी कार्टिलेज संरक्षण.',
        },
        {
          title: 'हळद (कर्क्युमिन), पिंपळी व दारुहळद यांचे सहक्रियाशील (Synergistic) मिश्रण',
          ingredients: 'कर्क्युमिन-फॉस्फोलिपिड कॉम्प्लेक्स (40%), पायपेरिन (2.5%), व बर्बेरिन नॅनो-इमल्शन (57.5%).',
          indication: 'फॅटी लिव्हर व इन्सुलिन रेझिस्टन्स व्यवस्थापनात कलम 3(e) अंतर्गत पेटंट मिळविण्यास पात्र.',
        },
        {
          title: 'सोरायसिससाठी मंजिष्ठा व कडुलिंब पॉलीहर्बल हायड्रोजेल',
          ingredients: 'मंजिष्ठा अँथ्राक्विनोन (4%) आणि कडुलिंब बियांचे लिमोनॉइड्स (2%) थर्मोसेन्सिटिव्ह हायड्रोजेल मॅट्रिक्समध्ये.',
          indication: 'सोरायसिसच्या लालसर चट्टे व खवलेयुक्त त्वचेसाठी सुरक्षित स्थानिक उपचार.',
        },
      ];
    case 'en':
    default:
      return SAMPLE_PATENT_CASES;
  }
}

/**
 * Returns localized Dravyaguna herb repository data for the specified language
 */
export function getHerbKnowledgeBase(lang: SupportedLanguage = 'en'): HerbKnowledgeEntry[] {
  if (lang === 'en') {
    return HERB_KNOWLEDGE_BASE;
  }

  // Localized dictionaries for key fields
  const localizedData: Partial<Record<SupportedLanguage, Partial<HerbKnowledgeEntry>[]>> = {
    hi: [
      {
        id: 'herb-1',
        sanskritName: 'अश्वगंधा (Ashwagandha)',
        englishName: 'Indian Ginseng / Winter Cherry',
        rasa: ['तिक्त (कड़वा)', 'कषाय (कसैला)', 'मधुर (मीठा)'],
        guna: ['लघु (हल्का)', 'स्निग्ध (चिकना)'],
        virya: 'उष्ण (उष्ण वीर्य)',
        vipaka: 'मधुर',
        prabhava: 'मेध्य एवं बल्य (बुद्धि एवं शारीरिक शक्ति वर्धक)',
        doshaKarma: 'वात-कफ शामक (वात और कफ दोष को शांत करता है)',
        therapeuticUses: ['दीर्घकालिक थकान एवं मानसिक तनाव', 'अनिद्रा एवं चिंता', 'संधिवात एवं जोड़ों की सूजन', 'रोग प्रतिरोधक क्षमता वर्धन (रसायन)'],
        cautions: ['पित्त वृद्धि या हाइपरथायरायडिज्म में अत्यधिक मात्रा में सेवन से बचें।'],
      },
      {
        id: 'herb-2',
        sanskritName: 'हरिद्रा (Haridra)',
        englishName: 'Turmeric Root',
        rasa: ['तिक्त (कड़वा)', 'कटु (तीखा)'],
        guna: ['रूक्ष (सूखा)', 'लघु (हल्का)'],
        virya: 'उष्ण (उष्ण वीर्य)',
        vipaka: 'कटु',
        prabhava: 'वर्ण्य एवं विषघ्न (त्वचा निखारक एवं विषनाशक)',
        doshaKarma: 'त्रिदोष शामक (कफ-पित्त नाशक)',
        therapeuticUses: ['त्वचा रोग (कुष्ठ, विचर्चिका, दाद)', 'एलर्जिक सर्दी-जुकाम', 'मधुमेह एवं प्रमेह', 'घाव भरना (व्रणरोपण)'],
        cautions: ['पित्ताशय की पथरी (पित्ताश्मरी) की सक्रिय स्थिति में अत्यधिक मात्रा से बचें।'],
      },
      {
        id: 'herb-3',
        sanskritName: 'गुडूची (Guduchi)',
        englishName: 'Heart-leaved Moonseed / Giloy',
        rasa: ['तिक्त', 'कषाय'],
        guna: ['लघु', 'स्निग्ध'],
        virya: 'उष्ण (उष्ण वीर्य)',
        vipaka: 'मधुर',
        prabhava: 'वयःस्थापन एवं ज्वरहर (एंटी-एजिंग एवं ज्वरनाशक)',
        doshaKarma: 'त्रिदोष शामक (तीनों दोषों को संतुलित करता है)',
        therapeuticUses: ['जीर्ण एवं संक्रामक बुखार', 'यकृत एवं तिल्ली विकार', 'गाउट एवं यूरिक एसिड नियंत्रण', 'प्रतिरक्षा शक्ति (इम्यूनिटी) वर्धन'],
        cautions: ['ऑटोइम्यून स्थितियों में चिकित्सक के परामर्श से ही लें।'],
      },
      {
        id: 'herb-4',
        sanskritName: 'त्रिफला (Triphala)',
        englishName: 'Three Fruits Classical Formulation',
        rasa: ['लवण छोड़कर 5 रस उपस्थित'],
        guna: ['लघु', 'रूक्ष'],
        virya: 'अनुष्णशीत (समशीतोष्ण)',
        vipaka: 'मधुर',
        prabhava: 'चक्षुष्य एवं दीपन-पाचन (नेत्र दृष्टि वर्धक एवं कोष्ठ शोधक)',
        doshaKarma: 'त्रिदोष शामक',
        therapeuticUses: ['जीर्ण कब्ज एवं पाचन विकार', 'आंखों की सुरक्षा एवं दृष्टि सुधार', 'मोटापा नियंत्रण', 'मुख एवं दंत स्वास्थ्य'],
        cautions: ['अतिसार या दस्त की स्थिति में सेवन न करें।'],
      },
      {
        id: 'herb-5',
        sanskritName: 'ब्राह्मी (Brahmi)',
        englishName: 'Water Hyssop / Brain Tonic',
        rasa: ['तिक्त', 'कषाय', 'मधुर'],
        guna: ['लघु', 'सर'],
        virya: 'शीत (शीतल वीर्य)',
        vipaka: 'मधुर',
        prabhava: 'मेध्य (मस्तिष्क टॉनिक एवं स्मृति वर्धक)',
        doshaKarma: 'वात-पित्त शामक',
        therapeuticUses: ['स्मृति लोप एवं एकाग्रता की कमी', 'चिंता, अवसाद एवं मानसिक तनाव', 'मिर्गी एवं अनिद्रा', 'वाणी स्पष्टता'],
        cautions: ['अत्यधिक मात्रा में लेने पर कुछ व्यक्तियों में सिरदर्द हो सकता है।'],
      },
      {
        id: 'herb-6',
        sanskritName: 'निम्ब (Neem)',
        englishName: 'Indian Lilac / Margosa',
        rasa: ['तिक्त', 'कषाय'],
        guna: ['लघु', 'रूक्ष'],
        virya: 'शीत (शीतल वीर्य)',
        vipaka: 'कटु',
        prabhava: 'कृमिघ्न एवं कण्डूघ्न (कृमिनाशक एवं खुजली निवारक)',
        doshaKarma: 'पित्त-कफ हर (रक्त एवं त्वचा शोधक)',
        therapeuticUses: ['संक्रामक त्वचा रोग (कुष्ठ, विचर्चिका, मुँहासे)', 'मसूड़ों के रोग व पायरिया', 'रक्त शोधन', 'मधुमेह में सहायक'],
        cautions: ['संतानोत्पत्ति के इच्छुक जोड़ों को उच्च मात्रा में निरंतर सेवन से बचना चाहिए।'],
      },
    ],
    bn: [
      {
        id: 'herb-1',
        sanskritName: 'অশ্বগন্ধা (Ashwagandha)',
        englishName: 'Indian Ginseng / Winter Cherry',
        rasa: ['তিক্ত (তিতা)', 'কষায় (কষা)', 'মধুর (মিষ্টি)'],
        guna: ['লঘু (হালকা)', 'স্নিগ্ধ (মসৃণ)'],
        virya: 'উষ্ণ (উষ্ণ বীর্য)',
        vipaka: 'মধুর',
        prabhava: 'মেধ্য ও বল্য (স্মৃতিশক্তি ও শারীরিক শক্তি বর্ধক)',
        doshaKarma: 'বাত-কফ শমক (বাত ও কফ শান্ত করে)',
        therapeuticUses: ['দীর্ঘস্থায়ী ক্লান্তি ও মানসিক চাপ', 'অনিদ্রা ও উদ্বেগ', 'সন্ধিবাত ও গাঁটের ব্যথা', 'অনাক্রম্যতা বৃদ্ধি (রসায়ন)'],
        cautions: ['উচ্চ পিত্তজনিত অবস্থা বা হাইপারথাইরয়েডিজমে চিকিৎসকের পরামর্শ ছাড়া খাবেন না।'],
      },
      {
        id: 'herb-2',
        sanskritName: 'হরিদ্রা / কাঁচা হলুদ (Haridra)',
        englishName: 'Turmeric Root',
        rasa: ['তিক্ত', 'কটূ (ঝাল)'],
        guna: ['রুক্ষ (শুষ্ক)', 'লঘু (হালকা)'],
        virya: 'উষ্ণ (উষ্ণ বীর্য)',
        vipaka: 'কটূ',
        prabhava: 'বর্ণ্য ও বিষঘ্ন (ত্বকের উজ্জ্বলতা বৃদ্ধিকারী ও বিষনাশক)',
        doshaKarma: 'ত্রিভোজ শমক (বিশেষত কফ-পিত্ত নাশক)',
        therapeuticUses: ['চর্মরোগ (কুষ্ঠ/বিচর্চিকা/দাদ/একজিমা)', 'এলার্জিক সর্দি-কাশি', 'ডায়াবেটিস / প্রমেহ', 'ক্ষত নিরাময় (ব্রণরোপণ)'],
        cautions: ['পিত্তথলির পাথরের সক্রিয় ক্ষেত্রে অতিরিক্ত মাত্রা বর্জনীয়।'],
      },
      {
        id: 'herb-3',
        sanskritName: 'গুড়ূচী / গুলঞ্চ / গিলয় (Guduchi)',
        englishName: 'Heart-leaved Moonseed / Giloy',
        rasa: ['তিক্ত', 'কষায়'],
        guna: ['লঘু', 'স্নিগ্ধ'],
        virya: 'উষ্ণ (উষ্ণ বীর্য)',
        vipaka: 'মধুর',
        prabhava: 'বয়ঃস্থাপন ও জ্বরহর (বার্ধক্যরোধক ও জ্বরনাশক)',
        doshaKarma: 'ত্রিভোজ শমক (বাত, পিত্ত ও কফ সর্বত্র ভারসাম্য আনে)',
        therapeuticUses: ['দীর্ঘমেয়াদী ও সংক্রামক জ্বর', 'যকৃৎ ও প্লীহা ব্যাধি', 'গেঁটেবাত ও উচ্চ ইউরিক অ্যাসিড', 'রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি'],
        cautions: ['অটোইমিউন রোগে চিকিৎসকের পরামর্শ অনুযায়ী সেবন করুন।'],
      },
      {
        id: 'herb-4',
        sanskritName: 'ত্রিফলা (Triphala)',
        englishName: 'Three Fruits Classical Formulation',
        rasa: ['লবণ ব্যতীত ৫টি রস বিদ্যমান'],
        guna: ['লঘু', 'রুক্ষ'],
        virya: 'অনুষ্ণশীত (সমশীতোষ্ণ)',
        vipaka: 'মধুর',
        prabhava: 'চক্ষুষ্য ও দীপন-পাচন (দৃষ্টিশক্তি বর্ধক ও মৃদু কোষ্ঠশোধক)',
        doshaKarma: 'ত্রিভোজ শমক',
        therapeuticUses: ['কোষ্ঠকাঠিন্য ও হজম সমস্যা', 'চোখের স্বাস্থ্য রক্ষা ও দৃষ্টিশক্তি বৃদ্ধি', 'ওজন নিয়ন্ত্রণ', 'মুখ ও দাঁতের সুরক্ষা'],
        cautions: ['ডায়রিয়া বা পাতলা পায়খানার সময় খাওয়া যাবে না।'],
      },
      {
        id: 'herb-5',
        sanskritName: 'ব্রাহ্মী (Brahmi)',
        englishName: 'Water Hyssop / Brain Tonic',
        rasa: ['তিক্ত', 'কষায়', 'মধুর'],
        guna: ['লঘু', 'সর'],
        virya: 'শীত (শীতল বীর্য)',
        vipaka: 'মধুর',
        prabhava: 'মেধ্য (স্মৃতিশক্তি ও মেধা বর্ধক রসায়ন)',
        doshaKarma: 'বাত-পিত্ত শমক',
        therapeuticUses: ['স্মৃতিশক্তি হ্রাস ও অমনোযোগিতা', 'উদ্বেগ ও মানসিক চাপ', 'মৃগীরোগ ও স্নায়ুবিক অস্থিরতা', 'বাচন স্বচ্ছতা'],
        cautions: ['খালি পেটে অতিরিক্ত খেলে কারও কারও বমি ভাব হতে পারে।'],
      },
      {
        id: 'herb-6',
        sanskritName: 'নিম্ব / নিম (Neem)',
        englishName: 'Indian Lilac / Margosa',
        rasa: ['তিক্ত', 'কষায়'],
        guna: ['লঘু', 'রুক্ষ'],
        virya: 'শীত (শীতল বীর্য)',
        vipaka: 'কটূ',
        prabhava: 'কৃমিঘ্ন ও কণ্ডূঘ্ন (জীবাণুনাশক ও চুলকানি নিবারক)',
        doshaKarma: 'পিত্ত-কফ হর (রক্ত ও ত্বক শোধক)',
        therapeuticUses: ['সংক্রামক চর্মরোগ (কুষ্ঠ, চুলকানি, ব্রণ)', 'দাঁত ও মাড়ির রোগ', 'রক্ত শোধন (রক্তশোধক)', 'সুগার নিয়ন্ত্রণে সহায়ক'],
        cautions: ['সন্তান প্রত্যাশী দম্পতিদের উচ্চ মাত্রায় গ্রহণ করা অনুচিত।'],
      },
    ],
    ta: [
      {
        id: 'herb-1',
        sanskritName: 'அஸ்வகந்தா / அமுக்கிராங்கிழங்கு (Ashwagandha)',
        englishName: 'Indian Ginseng / Winter Cherry',
        rasa: ['கைப்பு (তিক্ত)', 'துவர்ப்பு (কষায়)', 'இனிப்பு (মধুর)'],
        guna: ['இலகு (லঘু)', 'நெய்ப்பு (স্নিগ্ধ)'],
        virya: 'உஷ்ணம் (சூடான வீரியம்)',
        vipaka: 'இனிப்பு (মধুর)',
        prabhava: 'மேத்தியம் & பலியம் (மூளை மற்றும் உடல் பலம்)',
        doshaKarma: 'வாத-கப சமனம்',
        therapeuticUses: ['நாள்பட்ட சோர்வு மற்றும் மன அழுத்தம்', 'தூக்கமின்மை', 'மூட்டு வாத வீக்கம்', 'நோய் எதிர்ப்பு சக்தி (ரசாயனம்)'],
        cautions: ['அதிக பித்த நிலை உள்ளவர்கள் மருத்துவர் ஆலோசனையுடன் எடுக்கவும்.'],
      },
      {
        id: 'herb-2',
        sanskritName: 'ஹரித்ரா / மஞ்சள் (Haridra)',
        englishName: 'Turmeric Root',
        rasa: ['கைப்பு', 'கார்ப்பு'],
        guna: ['வறட்சி', 'இலகு'],
        virya: 'உஷ்ணம் (சூடான வீரியம்)',
        vipaka: 'கார்ப்பு',
        prabhava: 'வர்ணியம் & விஷக்கடி நிவாரணி (தோல் பொலிவு)',
        doshaKarma: 'திரிதோஷ சமனம் (கப-பித்த சமனம்)',
        therapeuticUses: ['தோல் நோய்கள் (குஷ்டம், அரிப்பு)', 'ஒவ்வாமை சளி', 'சர்க்கரை நோய்', 'காயம் ஆற்றுதல்'],
        cautions: ['பித்தப்பை கல் உள்ளவர்கள் அதிக அளவு எடுப்பதை தவிர்க்கவும்.'],
      },
      {
        id: 'herb-3',
        sanskritName: 'குடூச்சி / சீந்தில் கொடி (Guduchi)',
        englishName: 'Heart-leaved Moonseed / Giloy',
        rasa: ['கைப்பு', 'துவர்ப்பு'],
        guna: ['இலகு', 'நெய்ப்பு'],
        virya: 'உஷ்ணம்',
        vipaka: 'இனிப்பு',
        prabhava: 'வயஸ்தாபனம் & சுவரகரம் (இளமை காத்தல் & காய்ச்சல் நீக்கி)',
        doshaKarma: 'திரிதோஷ சமனம்',
        therapeuticUses: ['நீண்ட கால காய்ச்சல்', 'கல்லீரல் மற்றும் மண்ணீரல் கோளாறுகள்', 'வாதரத்தம் (யூரிக் அமிலம்)', 'நோய் எதிர்ப்பு ஆற்றல்'],
        cautions: ['சுய நோயெதிர்ப்பு கோளாறுகளில் கவனமாக பயன்படுத்தவும்.'],
      },
      {
        id: 'herb-4',
        sanskritName: 'திரிபலா (Triphala)',
        englishName: 'Three Fruits Classical Formulation',
        rasa: ['உப்பு தவிர்த்த 5 சுவைகள்'],
        guna: ['இலகு', 'வறட்சி'],
        virya: 'சமசீதோஷ்ணம்',
        vipaka: 'இனிப்பு',
        prabhava: 'சக்ஷுஷ்யம் & தீபன-பாசனம் (கண் பார்வை & மலமிளக்கி)',
        doshaKarma: 'திரிதோஷ சமனம்',
        therapeuticUses: ['மலச்சிக்கல் & செரிமானக் கோளாறு', 'கண் பார்வை மேம்பாடு', 'உடல் பருமன் குறைப்பு', 'வாய் மற்றும் பல் நலம்'],
        cautions: ['வயிற்றுப்போக்கின் போது உட்கொள்ள வேண்டாம்.'],
      },
      {
        id: 'herb-5',
        sanskritName: 'பிராமி / வல்லாரை (Brahmi)',
        englishName: 'Water Hyssop / Brain Tonic',
        rasa: ['கைப்பு', 'துவர்ப்பு', 'இனிப்பு'],
        guna: ['இலகு', 'சரம்'],
        virya: 'சீதம் (குளிர்ச்சி)',
        vipaka: 'இனிப்பு',
        prabhava: 'மேத்தியம் (நினைவாற்றல் & புத்தி கூர்மை)',
        doshaKarma: 'வாத-பித்த சமனம்',
        therapeuticUses: ['நினைவாற்றல் குறைவு', 'பதட்டம் & மன உளைச்சல்', 'வலிப்பு & தூக்கமின்மை', 'பேச்சு தெளிவு'],
        cautions: ['வெறும் வயிற்றில் அதிக அளவு சாப்பிட்டால் குமட்டல் வரலாம்.'],
      },
      {
        id: 'herb-6',
        sanskritName: 'வேம்பு / நிம்பா (Neem)',
        englishName: 'Indian Lilac / Margosa',
        rasa: ['கைப்பு', 'துவர்ப்பு'],
        guna: ['இலகு', 'வறட்சி'],
        virya: 'சீதம் (குளிர்ச்சி)',
        vipaka: 'கார்ப்பு',
        prabhava: 'கிருமிநாசினி & அரிப்பு நீக்கி',
        doshaKarma: 'பித்த-கப சமனம்',
        therapeuticUses: ['தொற்று தோல் நோய்கள்', 'ஈறு மற்றும் பல் நோய்கள்', 'இரத்த சுத்திகரிப்பு', 'சர்க்கரை கட்டுப்பாடு'],
        cautions: ['குழந்தை பிறக்க முயற்சிக்கும் தம்பதிகள் அதிக அளவு எடுப்பதை தவிர்க்கவும்.'],
      },
    ],
    te: [
      {
        id: 'herb-1',
        sanskritName: 'అశ్వగంధ (Ashwagandha)',
        englishName: 'Indian Ginseng / Winter Cherry',
        rasa: ['తిక్త (చేదు)', 'కషాయ (వగరు)', 'మధుర (తీపి)'],
        guna: ['లఘు (తేలిక)', 'స్నిగ్ధ (జిడ్డు)'],
        virya: 'ఉష్ణ (వేడి వీర్యం)',
        vipaka: 'మధుర',
        prabhava: 'మేధ్య మరియు బల్యం (మేధస్సు మరియు శక్తి వర్ధకం)',
        doshaKarma: 'వాత-కఫ శామకం',
        therapeuticUses: ['దీర్ఘకాలిక అలసట మరియు ఒత్తిడి', 'నిద్రలేమి', 'కీళ్ల వాతం మరియు నొప్పులు', 'రోగనిరోధక శక్తి (రసాయనం)'],
        cautions: ['తీవ్రమైన పిత్త సమస్యలు ఉన్నవారు జాగ్రత్తగా వాడాలి.'],
      },
      {
        id: 'herb-2',
        sanskritName: 'హరిద్ర / పసుపు (Haridra)',
        englishName: 'Turmeric Root',
        rasa: ['తిక్త', 'కటు (కారం)'],
        guna: ['రూక్ష (పొడి)', 'లఘు'],
        virya: 'ఉష్ణ',
        vipaka: 'కటు',
        prabhava: 'వర్ణ్య మరియు విషఘ్న (చర్మ కాంతి మరియు విషహరం)',
        doshaKarma: 'త్రిదోష శామకం (కఫ-పిత్త నాశకం)',
        therapeuticUses: ['చర్మ వ్యాధులు (కుష్ఠు, తామర)', 'అలెర్జీ జలుబు', 'మధుమేహం', 'గాయాలు మానడం'],
        cautions: ['పిత్తాశయ రాళ్లు ఉన్నవారు అధికంగా వాడకూడదు.'],
      },
      {
        id: 'herb-3',
        sanskritName: 'గుడూచి / తిప్పతీగ (Guduchi)',
        englishName: 'Heart-leaved Moonseed / Giloy',
        rasa: ['తిక్త', 'కషాయ'],
        guna: ['లఘు', 'స్నిగ్ధ'],
        virya: 'ఉష్ణ',
        vipaka: 'మధుర',
        prabhava: 'వయఃస్థాపనం & జ్వరహరం (యవ్వనం కాపాడుట & జ్వర నివారిణి)',
        doshaKarma: 'త్రిదోష శామకం',
        therapeuticUses: ['దీర్ఘకాలిక జ్వరాలు', 'కాలేయ మరియు ప్లీహ వ్యాధులు', 'గౌట్ (యూరిక్ యాసిడ్)', 'రోగనిరోధక శక్తి'],
        cautions: ['ఆటో ఇమ్యూన్ వ్యాధులలో వైద్యుల సలహాతోనే వాడాలి.'],
      },
      {
        id: 'herb-4',
        sanskritName: 'త్రిఫల (Triphala)',
        englishName: 'Three Fruits Classical Formulation',
        rasa: ['ఉప్పు తప్ప 5 రసాలు'],
        guna: ['లఘు', 'రూక్ష'],
        virya: 'సమశీతోష్ణ',
        vipaka: 'మధుర',
        prabhava: 'చక్షుష్య & దీపన-పాచన (కంటి చూపు & జీర్ణక్రియ)',
        doshaKarma: 'త్రిదోష శామకం',
        therapeuticUses: ['మలబద్ధకం & జీర్ణ సమస్యలు', 'కంటి చూపు మెరుగుదల', 'ఊబకాయం నియంత్రణ', 'నోటి ఆరోగ్యం'],
        cautions: ['విరేచనాలు ఉన్నప్పుడు వాడకూడదు.'],
      },
      {
        id: 'herb-5',
        sanskritName: 'బ్రాహ్మీ / సరస్వతి ఆకు (Brahmi)',
        englishName: 'Water Hyssop / Brain Tonic',
        rasa: ['తిక్త', 'కషాయ', 'మధుర'],
        guna: ['లఘు', 'సర'],
        virya: 'శీత (చల్లని వీర్యం)',
        vipaka: 'మధుర',
        prabhava: 'మేధ్య (మెదడు టానిక్ & జ్ఞాపకశక్తి)',
        doshaKarma: 'వాత-పిత్త శామకం',
        therapeuticUses: ['జ్ఞాపకశక్తి లోపం', 'ఆందోళన & మానసిక ఒత్తిడి', 'మూర్ఛ & నిద్రలేమి', 'స్పష్టమైన మాటలు'],
        cautions: ['పరగడుపున ఎక్కువ మోతాదులో తీసుకుంటే వికారం రావచ్చు.'],
      },
      {
        id: 'herb-6',
        sanskritName: 'వేప / నింబ (Neem)',
        englishName: 'Indian Lilac / Margosa',
        rasa: ['తిక్త', 'కషాయ'],
        guna: ['లఘు', 'రూక్ష'],
        virya: 'శీత',
        vipaka: 'కటు',
        prabhava: 'క్రిమిఘ్న & దురద నివారిణి',
        doshaKarma: 'పిత్త-కఫ శామకం',
        therapeuticUses: ['అంటు చర్మ వ్యాధులు', 'చిగుళ్ల వ్యాధులు', 'రక్త శుద్ధి', 'షుగర్ నియంత్రణ'],
        cautions: ['పిల్లల కోసం ప్రయత్నించే దంపతులు అధిక మోతాదును నివారించాలి.'],
      },
    ],
    kn: [
      {
        id: 'herb-1',
        sanskritName: 'ಅಶ್ವಗಂಧ (Ashwagandha)',
        englishName: 'Indian Ginseng / Winter Cherry',
        rasa: ['ತಿಕ್ತ (ಕಹಿ)', 'ಕಷಾಯ (ಒಗರು)', 'ಮಧುರ (ಸಿಹಿ)'],
        guna: ['ಲಘು (ಹಗುರ)', 'ಸ್ನಿಗ್ಧ (ನಯ)'],
        virya: 'ಉಷ್ಣ (ಶಾಖದ ವೀರ್ಯ)',
        vipaka: 'ಮಧುರ',
        prabhava: 'ಮೇಧ್ಯ ಮತ್ತು ಬಲ್ಯ (ಜ್ಞಾಪಕಶಕ್ತಿ ಮತ್ತು ದೈಹಿಕ ಬಲ)',
        doshaKarma: 'ವಾತ-ಕಫ ಶಾಮಕ',
        therapeuticUses: ['ದೀರ್ಘಕಾಲದ ಆಯಾಸ ಮತ್ತು ಮಾನಸಿಕ ಒತ್ತಡ', 'ನಿದ್ರಾಹೀನತೆ', 'ಸಂಧಿವಾತ ಮತ್ತು ಕೀಲು ನೋವು', 'ರೋಗನಿರೋಧಕ ಶಕ್ತಿ (ರಸಾಯನ)'],
        cautions: ['ಹೆಚ್ಚಿನ ಪಿತ್ತದ ಸ್ಥಿತಿಯಲ್ಲಿ ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯಿರಿ.'],
      },
      {
        id: 'herb-2',
        sanskritName: 'ಹರಿದ್ರಾ / ಅರಿಶಿನ (Haridra)',
        englishName: 'Turmeric Root',
        rasa: ['ತಿಕ್ತ', 'ಕಟು (ಖಾರ)'],
        guna: ['ರೂಕ್ಷ', 'ಲಘು'],
        virya: 'ಉಷ್ಣ',
        vipaka: 'ಕಟು',
        prabhava: 'ವರ್ಣ್ಯ ಮತ್ತು ವಿಷಘ್ನ (ಚರ್ಮದ ಕಾಂತಿ ಮತ್ತು ವಿಷಹರ)',
        doshaKarma: 'ತ್ರಿದೋಷ ಶಾಮಕ (ಕಫ-ಪಿತ್ತ ನಾಶಕ)',
        therapeuticUses: ['ಚರ್ಮ ರೋಗಗಳು', 'ಅಲರ್ಜಿ ನೆಗಡಿ', 'ಮಧುಮೇಹ', 'ಗಾಯ ವಾಸಿ ಮಾಡುವುದು'],
        cautions: ['ಪಿತ್ತಕೋಶದ ಕಲ್ಲುಗಳಿರುವಾಗ ಹೆಚ್ಚಿನ ಪ್ರಮಾಣ ಬೇಡ.'],
      },
      {
        id: 'herb-3',
        sanskritName: 'ಗುಡೂಚಿ / ಅಮೃತಬಳ್ಳಿ (Guduchi)',
        englishName: 'Heart-leaved Moonseed / Giloy',
        rasa: ['ತಿಕ್ತ', 'ಕಷಾಯ'],
        guna: ['ಲಘು', 'ಸ್ನಿಗ್ಧ'],
        virya: 'ಉಷ್ಣ',
        vipaka: 'ಮಧುರ',
        prabhava: 'ವಯಃಸ್ಥಾಪನ & ಜ್ವರಹರ (ಯೌವನ ರಕ್ಷಣೆ & ಜ್ವರ ನಿವಾರಕ)',
        doshaKarma: 'ತ್ರಿದೋಷ ಶಾಮಕ',
        therapeuticUses: ['ದೀರ್ಘಕಾಲದ ಜ್ವರ', 'ಯಕೃತ್ ಮತ್ತು ಪ್ಲೀಹ ತೊಂದರೆಗಳು', 'ಗೌಟ್ (ಯೂರಿಕ್ ಆಮ್ಲ)', 'ರೋಗನಿರೋಧಕ ಶಕ್ತಿ'],
        cautions: ['ಸ್ವಯಂ ನಿರೋಧಕ ಕಾಯಿಲೆಗಳಲ್ಲಿ ವೈದ್ಯರ ಸಲಹೆ ಅಗತ್ಯ.'],
      },
      {
        id: 'herb-4',
        sanskritName: 'ತ್ರಿಫಲಾ (Triphala)',
        englishName: 'Three Fruits Classical Formulation',
        rasa: ['ಉಪ್ಪು ಹೊರತುಪಡಿಸಿ 5 ರಸಗಳು'],
        guna: ['ಲಘು', 'ರೂಕ್ಷ'],
        virya: 'ಸಮಶೀತೋಷ್ಣ',
        vipaka: 'ಮಧುರ',
        prabhava: 'ಚಕ್ಷುಷ್ಯ & ದೀಪನ-ಪಾಚನ (ಕಣ್ಣಿನ ದೃಷ್ಟಿ & ಜೀರ್ಣಕಾರಿ)',
        doshaKarma: 'ತ್ರಿದೋಷ ಶಾಮಕ',
        therapeuticUses: ['ಮಲಬದ್ಧತೆ & ಜೀರ್ಣ ಸಮಸ್ಯೆ', 'ದೃಷ್ಟಿ ಸುಧಾರಣೆ', 'ಬೊಜ್ಜು ನಿಯಂತ್ರಣ', 'ಬಾಯಿ ಮತ್ತು ಹಲ್ಲುಗಳ ಆರೋಗ್ಯ'],
        cautions: ['ಭೇದಿ ಇರುವಾಗ ಬಳಸಬಾರದು.'],
      },
      {
        id: 'herb-5',
        sanskritName: 'ಬ್ರಾಹ್ಮಿ (Brahmi)',
        englishName: 'Water Hyssop / Brain Tonic',
        rasa: ['ತಿಕ್ತ', 'ಕಷಾಯ', 'ಮಧುರ'],
        guna: ['ಲಘು', 'ಸರ'],
        virya: 'ಶೀತ (ತಂಪಾದ ವೀರ್ಯ)',
        vipaka: 'ಮಧುರ',
        prabhava: 'ಮೇಧ್ಯ (ಮೆದುಳಿನ ಟಾನಿಕ್ & ನೆನಪಿನ ಶಕ್ತಿ)',
        doshaKarma: 'ವಾತ-ಪಿತ್ತ ಶಾಮಕ',
        therapeuticUses: ['ನೆನಪಿನ ಶಕ್ತಿ ಕೊರತೆ', 'ಆತಂಕ & ಮಾನಸಿಕ ಒತ್ತಡ', 'ಮೂರ್ಛೆ ರೋಗ & ನಿದ್ರಾಹೀನತೆ', 'ಸ್ಪಷ್ಟ ಮಾತು'],
        cautions: ['ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ಹೆಚ್ಚು ಸೇವಿಸಿದರೆ ವಾಕರಿಕೆ ಉಂಟಾಗಬಹುದು.'],
      },
      {
        id: 'herb-6',
        sanskritName: 'ಬೇವಿನ ಮರ / ನಿಂಬ (Neem)',
        englishName: 'Indian Lilac / Margosa',
        rasa: ['ತಿಕ್ತ', 'ಕಷಾಯ'],
        guna: ['ಲಘು', 'ರೂಕ್ಷ'],
        virya: 'ಶೀತ',
        vipaka: 'ಕಟು',
        prabhava: 'ಕ್ರಿಮಿಘ್ನ & ತುರಿಕೆ ನಿವಾರಕ',
        doshaKarma: 'ಪಿತ್ತ-ಕಫ ಶಾಮಕ',
        therapeuticUses: ['ಸಾಂಕ್ರಾಮಿಕ ಚರ್ಮ ರೋಗಗಳು', 'ವಸಡು ರೋಗಗಳು', 'ರಕ್ತ ಶುದ್ಧೀಕರಣ', 'ಸಕ್ಕರೆ ನಿಯಂತ್ರಣ'],
        cautions: ['ಸಂತಾನಪೇಕ್ಷಿ ದಂಪತಿಗಳು ಹೆಚ್ಚಿನ ಪ್ರಮಾಣವನ್ನು ತಪ್ಪಿಸಬೇಕು.'],
      },
    ],
    mr: [
      {
        id: 'herb-1',
        sanskritName: 'अश्वगंधा (Ashwagandha)',
        englishName: 'Indian Ginseng / Winter Cherry',
        rasa: ['तिक्त (कडू)', 'कषाय (तुरट)', 'मधुर (गोड)'],
        guna: ['लघु (हलका)', 'स्निग्ध (मऊ)'],
        virya: 'उष्ण (उष्ण वीर्य)',
        vipaka: 'मधुर',
        prabhava: 'मेध्य आणि बल्य (बुद्धी व शारीरिक शक्ती वाढवणारे)',
        doshaKarma: 'वात-कफ शामक',
        therapeuticUses: ['तीव्र थकवा व मानसिक तणाव', 'निद्रानाश', 'सांधेदुखी व सूज', 'रोगप्रतिकारशक्ती (रसायन)'],
        cautions: ['पित्त विकार किंवा हायपरथायरॉईडीझममध्ये अतिसेवन टाळावे.'],
      },
      {
        id: 'herb-2',
        sanskritName: 'हरिद्रा / हळद (Haridra)',
        englishName: 'Turmeric Root',
        rasa: ['तिक्त', 'कटू (तिखट)'],
        guna: ['रूक्ष (कोरडा)', 'लघु'],
        virya: 'उष्ण',
        vipaka: 'कटू',
        prabhava: 'वर्ण्य व विषघ्न (त्वचा उजळवणारे व विषनाशक)',
        doshaKarma: 'त्रिदोष शामक (कफ-पित्त नाशक)',
        therapeuticUses: ['त्वचारोग (खरुज, नायटा)', 'ऍलर्जीक सर्दी', 'मधुमेह', 'जखमा भरणे'],
        cautions: ['पित्ताशयात खडे असल्यास अतिप्रमाणात घेऊ नये.'],
      },
      {
        id: 'herb-3',
        sanskritName: 'गुडूची / गुळवेल (Guduchi)',
        englishName: 'Heart-leaved Moonseed / Giloy',
        rasa: ['तिक्त', 'कषाय'],
        guna: ['लघु', 'स्निग्ध'],
        virya: 'उष्ण',
        vipaka: 'मधुर',
        prabhava: 'वयःस्थापन व ज्वरहर (तारुण्य टिकवणारे व ताप नाशक)',
        doshaKarma: 'त्रिदोष शामक',
        therapeuticUses: ['जुनाट व संसर्गजन्य ताप', 'यकृत व प्लीहा विकार', 'गाउट (युरिक ऍसिड)', 'रोगप्रतिकारशक्ती वाढवणे'],
        cautions: ['ऑटोइम्यून आजारांमध्ये वैद्यांच्या सल्ल्यानेच घ्यावे.'],
      },
      {
        id: 'herb-4',
        sanskritName: 'त्रिफळा (Triphala)',
        englishName: 'Three Fruits Classical Formulation',
        rasa: ['मीठ वगळता 5 रस उपस्थित'],
        guna: ['लघु', 'रूक्ष'],
        virya: 'समशीतोष्ण',
        vipaka: 'मधুর',
        prabhava: 'चक्षुष्य व दीपन-पाचन (डोळ्यांची दृष्टी व कोष्ठ शुद्धी)',
        doshaKarma: 'त्रिदोष शामक',
        therapeuticUses: ['बद्धकोष्ठता व पचन विकार', 'डोळ्यांचे आरोग्य', 'वजन नियंत्रण', 'मुख व दातांचे आरोग्य'],
        cautions: ['अतिसार किंवा जुलाब असल्यास घेऊ नये.'],
      },
      {
        id: 'herb-5',
        sanskritName: 'ब्राह्मी (Brahmi)',
        englishName: 'Water Hyssop / Brain Tonic',
        rasa: ['तिक्त', 'कषाय', 'मधुर'],
        guna: ['लघु', 'सर'],
        virya: 'शीत (थंड वीर्य)',
        vipaka: 'मधुर',
        prabhava: 'मेध्य (मेंदूचे टॉनिक व स्मरणशक्ती वाढवणारे)',
        doshaKarma: 'वात-पित्त शामक',
        therapeuticUses: ['स्मरणशक्ती कमी होणे', 'चिंता व मानसिक ताण', 'अपस्मार व निद्रानाश', 'स्पष्ट वाणी'],
        cautions: ['उपाशीपोटी अतिप्रमाणात घेतल्यास मळमळ होऊ शकते.'],
      },
      {
        id: 'herb-6',
        sanskritName: 'निंब / कडुलिंब (Neem)',
        englishName: 'Indian Lilac / Margosa',
        rasa: ['तिक्त', 'कषाय'],
        guna: ['लघु', 'रूक्ष'],
        virya: 'शीत',
        vipaka: 'कटू',
        prabhava: 'कृमिघ्न व खाज निवारक',
        doshaKarma: 'पित्त-कफ शामक',
        therapeuticUses: ['संसर्गजन्य त्वचारोग', 'हिरड्यांचे आजार', 'रक्त शुद्धीकरण', 'साखर नियंत्रण'],
        cautions: ['अपत्य प्राप्तीसाठी प्रयत्न करणाऱ्या दांपत्यांनी अतिसेवन टाळावे.'],
      },
    ],
  };

  const targetOverrides = localizedData[lang];
  if (!targetOverrides) return HERB_KNOWLEDGE_BASE;

  return HERB_KNOWLEDGE_BASE.map((herb, idx) => {
    const override = targetOverrides[idx] || {};
    return {
      ...herb,
      ...override,
    };
  });
}

/**
 * Returns localized pending doctor verification queue cases
 */
export function getPendingCases(lang: SupportedLanguage = 'en', latestAssessment?: any) {
  const caseId1 = 'case-1';
  const defaultDisease1 = latestAssessment?.diseaseName || 'Amavata (Rheumatoid Arthritis / Vata-Kapha Sandhigata Vata)';
  const defaultSymptoms1 = latestAssessment?.summary || 'Morning joint stiffness, swelling in wrists and knees, coated white tongue with impaired digestion (Mandagni).';

  switch (lang) {
    case 'bn':
      return [
        {
          id: caseId1,
          patient: 'রোগী #AYU-9842 (দেবদূত এস.)',
          disease: latestAssessment?.diseaseName || 'আমবাত (রিউমাটয়েড আর্থ্রাইটিস / বাত-কফ সন্ধিগত বাত)',
          severity: latestAssessment?.severityLevel || 'মাঝারি (Moderate)',
          submittedAt: 'আজ, সকাল ১০:২৪',
          symptoms: latestAssessment?.summary || 'সকালে সন্ধিতে আড়ষ্টতা, কব্জি ও হাঁটুতে ফোলাভাব, জিহ্বায় সাদা আস্তরণ এবং মন্দাগ্নি (হজম দুর্বলতা)।',
          defaultDoctorNotes: 'জানু ও গুলফ সন্ধিতে বাত-কফ বৃদ্ধিজনিত শাস্ত্রীয় আমবাত প্যাথোলজি নিশ্চিত করা হয়েছে। দশমূলারিষ্ট ও যোগরাজ গুগ্গুলু পথ্যসহ অনুমোদিত।',
        },
        {
          id: 'case-2',
          patient: 'রোগী #AYU-7119 (সুমা আর.)',
          disease: 'কিটিব / বিচর্চিকা (ক্রনিক প্ল্যাক সোরিয়াসিস)',
          severity: 'মাঝারি',
          submittedAt: 'গতকাল, বিকাল ০৪:১৫',
          symptoms: 'মাথায় ও কনুইতে রূপালী রঙের শুষ্ক আঁশযুক্ত লাল চাকা, গাঁজানো খাবার গ্রহণের পর জ্বালাপোড়া বৃদ্ধি।',
          defaultDoctorNotes: 'রক্তপিত্ত ও কফ প্রাবল্য লক্ষণীয়। খদিরাবিষ্ট ও মঞ্জিষ্ঠাদি ক্বাথসহ পিত্তশমক পথ্য নির্ধারণ করা হয়েছে।',
        },
        {
          id: 'case-3',
          patient: 'রোগী #AYU-4022 (অরবিন্দ কে.)',
          disease: 'অম্লপিত্ত (হাইপারঅ্যাসিডিটি ও অ্যাসিড রিফ্লাক্স)',
          severity: 'মৃদু',
          submittedAt: 'গতকাল, দুপুর ০২:০০',
          symptoms: 'টক ঢেঁকুর, মশলাদার খাবারের পর বুকে ও গলায় জ্বালা, রাতে অস্থির ঘুম ও মুখের তিক্ত স্বাদ।',
          defaultDoctorNotes: 'বিদগ্ধ অজীর্ণ ও পিত্ত প্রকোপ। অবিপত্তিকর চূর্ণ ও কামদুধ রস শীতল জল সহযোগে নির্দেশিত।',
        },
      ];
    case 'hi':
      return [
        {
          id: caseId1,
          patient: 'रोगी #AYU-9842 (देवदूत एस.)',
          disease: latestAssessment?.diseaseName || 'आमवात (संधिवात / वात-कफ संधिशूल)',
          severity: latestAssessment?.severityLevel || 'मध्यम (Moderate)',
          submittedAt: 'आज, प्रातः 10:24',
          symptoms: latestAssessment?.summary || 'सुबह जोड़ों में जकड़न, कलाई और घुटनों में सूजन, जीभ पर सफेद मैल और मंदाग्नि।',
          defaultDoctorNotes: 'जानु एवं गुल्फ संधि में वात-कफ वृद्धि जनित शास्त्रीय आमवात की पुष्टि। दशमूलारिष्ट एवं योगराज गुग्गुलु का पथ्य आहार सहित अनुमोदन।',
        },
        {
          id: 'case-2',
          patient: 'रोगी #AYU-7119 (सुमा आर.)',
          disease: 'किकिटभ / विचर्चिका (क्रॉनिक सोरायसिस)',
          severity: 'मध्यम',
          submittedAt: 'कल, सायं 04:15',
          symptoms: 'सिर और कोहनी पर चांदी जैसी पपड़ीदार लाल चकत्ते, खमीरयुक्त भोजन के बाद दाह में वृद्धि।',
          defaultDoctorNotes: 'रक्त एवं कफ दोष की प्रधानता। खदिरारिष्ट एवं मंजिष्ठादि क्वाथ पित्तशामक आहार सहित निर्धारित।',
        },
        {
          id: 'case-3',
          patient: 'रोगी #AYU-4022 (अरविंद के.)',
          disease: 'अम्लपित्त (हाइपरएसिडिटी एवं गैस्ट्रिक रिफ्लक्स)',
          severity: 'सौम्य',
          submittedAt: 'कल, दोपहर 02:00',
          symptoms: 'खट्टी डकारें, सीने में जलन, नींद में खलल, मुख में तिक्त व खट्टा स्वाद।',
          defaultDoctorNotes: 'पाचक पित्त प्रकोप। अविपत्तिकर चूर्ण एवं कामदुधा रस शीतल जल के साथ निर्देशित।',
        },
      ];
    case 'ta':
      return [
        {
          id: caseId1,
          patient: 'நோயாளி #AYU-9842 (தேவதூத் எஸ்.)',
          disease: defaultDisease1,
          severity: 'நடுத்தர (Moderate)',
          submittedAt: 'இன்று, காலை 10:24',
          symptoms: defaultSymptoms1,
          defaultDoctorNotes: 'வாத-கப மூட்டு வீக்கத்திற்கான தசமூலாரிஷ்டம் மற்றும் யோகராஜ குக்குலு பரிந்துரைக்கப்பட்டது.',
        },
        {
          id: 'case-2',
          patient: 'நோயாளி #AYU-7119 (சுமா ஆர்.)',
          disease: 'கிடிப / சொரியாசிஸ் (Psoriasis)',
          severity: 'நடுத்தர',
          submittedAt: 'நேற்று, மாலை 04:15',
          symptoms: 'தலை மற்றும் கைகளில் செதில் போன்ற சிவப்பு தடிப்புகள், புளித்த உணவுக்குப் பின் எரிச்சல்.',
          defaultDoctorNotes: 'மஞ்சிஷ்டாதி கஷாயம் மற்றும் கதிராரிஷ்டம் பரிந்துரைக்கப்பட்டது.',
        },
        {
          id: 'case-3',
          patient: 'நோயாளி #AYU-4022 (அரவிந்த் கே.)',
          disease: 'அமிலபித்தம் (Hyperacidity & Reflux)',
          severity: 'மிதமான',
          submittedAt: 'நேற்று, பிற்பகல் 02:00',
          symptoms: 'புளித்த ஏப்பம், மார்பு எரிச்சல், வாயில் கசப்பு சுவை.',
          defaultDoctorNotes: 'அவிபத்திகர சூரணம் மற்றும் காமதூதா ரசம் பரிந்துரைக்கப்பட்டது.',
        },
      ];
    case 'te':
      return [
        {
          id: caseId1,
          patient: 'రోగి #AYU-9842 (దేవదూత్ ఎస్.)',
          disease: defaultDisease1,
          severity: 'మధ్యస్థం (Moderate)',
          submittedAt: 'ఈరోజు, ఉదయం 10:24',
          symptoms: defaultSymptoms1,
          defaultDoctorNotes: 'వాత-కఫ కీళ్ల వాతానికి దశమూలారిష్టం మరియు యోగరాజ గుగ్గులు ఆమోదించబడింది.',
        },
        {
          id: 'case-2',
          patient: 'రోగి #AYU-7119 (సుమ ఆర్.)',
          disease: 'విచర్చిక / సోరియాసిస్ (Psoriasis)',
          severity: 'మధ్యస్థం',
          submittedAt: 'నిన్న, సాయంత్రం 04:15',
          symptoms: 'తల మరియు చేతులపై ఎరుపు రంగు పొలుసులు, పులియబెట్టిన ఆహారం తర్వాత మంట.',
          defaultDoctorNotes: 'మంజిష్టాది క్వాథం మరియు ఖదిరారిష్టం సూచించబడింది.',
        },
        {
          id: 'case-3',
          patient: 'రోగి #AYU-4022 (అరవింద్ కే.)',
          disease: 'ఆమ్లపిత్తం (ఎసిడిటీ & గ్యాస్ట్రిక్ రిఫ్లక్స్)',
          severity: 'తేలికపాటి',
          submittedAt: 'నిన్న, మధ్యాహ్నం 02:00',
          symptoms: 'పుల్లటి తేన్పులు, ఛాతీలో మంట, నోటిలో చేదు రుచి.',
          defaultDoctorNotes: 'అవిపత్తికర చూర్ణం మరియు కామదుధ రసం సూచించబడింది.',
        },
      ];
    case 'kn':
      return [
        {
          id: caseId1,
          patient: 'ರೋಗಿ #AYU-9842 (ದೇವದೂತ್ ಎಸ್.)',
          disease: defaultDisease1,
          severity: 'ಮಧ್ಯಮ (Moderate)',
          submittedAt: 'ಇಂದು, ಬೆಳಗ್ಗೆ 10:24',
          symptoms: defaultSymptoms1,
          defaultDoctorNotes: 'ವಾತ-ಕಫ ಕೀಲು ನೋವಿಗೆ ದಶಮೂಲಾರಿಷ್ಟ ಮತ್ತು ಯೋಗರಾಜ ಗುಗ್ಗುಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.',
        },
        {
          id: 'case-2',
          patient: 'ರೋಗಿ #AYU-7119 (ಸುಮಾ ಆರ್.)',
          disease: 'ವಿಚರ್ಚಿಕಾ / ಸೋರಿಯಾಸಿಸ್ (Psoriasis)',
          severity: 'ಮಧ್ಯಮ',
          submittedAt: 'ನಿನ್ನೆ, ಸಂಜೆ 04:15',
          symptoms: 'ತಲೆ ಮತ್ತು ಚರ್ಮದ ಮೇಲೆ ಕೆಂಪು ಕಲೆಗಳು ಮತ್ತು ಉರಿ.',
          defaultDoctorNotes: 'ಮಂಜಿಷ್ಠಾದಿ ಕಷಾಯ ಮತ್ತು ಖದಿರಾರಿಷ್ಟ ನಿಯಮಿತ ಪಥ್ಯದೊಂದಿಗೆ ಅನುಮೋದಿಸಲಾಗಿದೆ.',
        },
        {
          id: 'case-3',
          patient: 'ರೋಗಿ #AYU-4022 (ಅರವಿಂದ ಕೆ.)',
          disease: 'ಆಮ್ಲಪಿತ್ತ (ಅಸಿಡಿಟಿ & ಎದೆಯುರಿ)',
          severity: 'ಸೌಮ್ಯ',
          submittedAt: 'ನಿನ್ನೆ, ಮಧ್ಯಾಹ್ನ 02:00',
          symptoms: 'ಹುಳಿತೇಗು, ಎದೆಯುರಿ ಮತ್ತು ನಿದ್ರಾಭಂಗ.',
          defaultDoctorNotes: 'ಅವಿಪತ್ತಿಕರ ಚೂರ್ಣ ಮತ್ತು ಕಾಮದುಧಾ ರಸ ತಣ್ಣೀರಿನೊಂದಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ.',
        },
      ];
    case 'mr':
      return [
        {
          id: caseId1,
          patient: 'रुग्ण #AYU-9842 (देवदूत एस.)',
          disease: defaultDisease1,
          severity: 'मध्यम (Moderate)',
          submittedAt: 'आज, सकाळी 10:24',
          symptoms: defaultSymptoms1,
          defaultDoctorNotes: 'वात-कफ सांधेदुखीसाठी दशमूलारिष्ट व योगराज गुग्गुळ पथ्य आहारासह मंजूर.',
        },
        {
          id: 'case-2',
          patient: 'रुग्ण #AYU-7119 (सुमा आर.)',
          disease: 'विचर्चिका / सोरायसिस (Psoriasis)',
          severity: 'मध्यम',
          submittedAt: 'काल, संध्याकाळी 04:15',
          symptoms: 'डोक्यावर व कोपरावर लाल चट्टे व खाज.',
          defaultDoctorNotes: 'खदिरारिष्ट व मंजिष्ठादि काढा पित्तशामक आहारासह निर्देशित.',
        },
        {
          id: 'case-3',
          patient: 'रुग्ण #AYU-4022 (अरविंद के.)',
          disease: 'अम्लपित्त (अ‍ॅसिडिटी व छातीत जळजळ)',
          severity: 'सौम्य',
          submittedAt: 'काल, दुपारी 02:00',
          symptoms: 'आंबट ढेकर, छातीत जळजळ व तोंडात कडू चव.',
          defaultDoctorNotes: 'अविपत्तिकर चूर्ण व कामदुधा रस थंड पाण्यासोबत निर्देशित.',
        },
      ];
    case 'en':
    default:
      return [
        {
          id: caseId1,
          patient: 'Patient #AYU-9842 (Debdoot S.)',
          disease: defaultDisease1,
          severity: latestAssessment?.severityLevel || 'Moderate',
          submittedAt: 'Today, 10:24 AM',
          symptoms: defaultSymptoms1,
          defaultDoctorNotes: 'Correlated classical Amavata pathology with elevated Vata-Kapha accumulation in Janu and Gulpha Sandhi. Approved Dashmoolarishta & Yogaraj Guggulu protocol with strict Pathya diet.',
        },
        {
          id: 'case-2',
          patient: 'Patient #AYU-7119 (Suma R.)',
          disease: 'Kitibha / Vicharchika (Chronic Plaque Psoriasis)',
          severity: 'Moderate',
          submittedAt: 'Yesterday, 04:15 PM',
          symptoms: 'Scaling red patches with silver crusts on scalp and extensor surfaces, burning sensation aggravating after fermented food.',
          defaultDoctorNotes: 'Elevated Rakta-Pitta and Kapha involvement. Prescribed Khadirarishta and Manjisthadi Kwath with Pitta-pacifying diet.',
        },
        {
          id: 'case-3',
          patient: 'Patient #AYU-4022 (Aravind K.)',
          disease: 'Amlapitta (Hyperacidity & Gastroesophageal Reflux)',
          severity: 'Mild',
          submittedAt: 'Yesterday, 02:00 PM',
          symptoms: 'Sour belching, retrosternal burning after spicy meals, disturbed sleep, Tikta/Amla asyatha.',
          defaultDoctorNotes: 'Pachaka Pitta aggravation. Prescribed Avipattikar Churna and Kamadudha Rasa with cool water.',
        },
      ];
  }
}

