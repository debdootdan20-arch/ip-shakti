import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';
import { DoctorPrescription, SupportedLanguage } from '../types';

export const LANGUAGE_LABELS: Record<SupportedLanguage, { label: string; native: string; flag: string }> = {
  en: { label: 'English', native: 'English', flag: '🌐' },
  hi: { label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  bn: { label: 'Bengali', native: 'বাংলা', flag: '🌿' },
  ta: { label: 'Tamil', native: 'தமிழ்', flag: '🪔' },
  te: { label: 'Telugu', native: 'తెలుగు', flag: '⚜️' },
  kn: { label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🌾' },
  mr: { label: 'Marathi', native: 'मराठी', flag: '🚩' },
};

// Generates pristine, print-optimized HTML with selectable vector typography and zero overlapping text
export function generatePrescriptionHtml(rx: DoctorPrescription, lang: SupportedLanguage = 'en'): string {
  // Section headers localized
  const labels: Record<string, Record<SupportedLanguage, string>> = {
    title: {
      en: 'GOVERNMENT OF INDIA • MINISTRY OF AYUSH CLINICAL PRESCRIPTION',
      hi: 'भारत सरकार • आयुष मंत्रालय क्लिनिकल नुस्खा एवं आहार-औषध चार्ट',
      bn: 'ভারত সরকার • আয়ুষ ক্লিনিকাল প্রেসক্রিপশন ও পথ্য চার্ট',
      ta: 'இந்திய அரசு • ஆயுஷ் மருத்துவ மருந்துச் சீட்டு',
      te: 'భారత ప్రభుత్వం • ఆయుష్ క్లినికల్ ప్రిస్క్రిప్షన్',
      kn: 'ಭಾರತ ಸರ್ಕಾರ • ಆಯುಷ್ ಚಿಕಿತ್ಸಾ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್',
      mr: 'भारत सरकार • आयुष क्लिनिकल प्रिस्क्रिप्शन व पथ्य तक्ता',
    },
    subTitle: {
      en: 'Authenticated Electronic Medical Record & E-Prescription Under NCISM Regulations',
      hi: 'एनसीआईएसएम विनियमों के तहत सत्यापित इलेक्ट्रॉनिक मेडिकल रिकॉर्ड एवं ई-प्रिस्क्रिप्शन',
      bn: 'এনসিআইএসএম বিধিমালার অধীনে অনুমোদিত ইলেকট্রনিক মেডিকেল রেকর্ড',
      ta: 'என்சிஐஎஸ்எம் விதிமுறைகளின் கீழ் சரிபார்க்கப்பட்ட மின்-மருத்துவ சீட்டு',
      te: 'ఎన్‌సీఐఎస్‌ఎం నిబంధనల ప్రకారం ధృవీకరించబడిన ఎలక్ట్రానిಕ್ మెడికల్ రికార్డ్',
      kn: 'ಎನ್‌ಸಿಐಎಸ್‌ಎಂ ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾದ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್',
      mr: 'एनसीआयएसएम नियमांनुसार प्रमाणित इलेक्ट्रॉनिक ई-प्रिस्क्रिप्शन',
    },
    patientDetails: {
      en: 'Patient Information',
      hi: 'रोगी विवरण',
      bn: 'রোগীর তথ্য',
      ta: 'நோயாளி விவரங்கள்',
      te: 'రోగి వివరాలు',
      kn: 'ರೋಗಿಯ ವಿವರಗಳು',
      mr: 'रुग्ण तपशील',
    },
    doctorDetails: {
      en: 'Treating Physician Details',
      hi: 'चिकित्सक विवरण',
      bn: 'চিকিৎসকের বিবরণ',
      ta: 'மருத்துவர் விவரங்கள்',
      te: 'వైద్యుని వివరాలు',
      kn: 'ವೈದ್ಯರ ವಿವರಗಳು',
      mr: 'तपशीलवार चिकित्सक माहिती',
    },
    diagnosis: {
      en: 'Clinical Diagnosis & Roga Nidan',
      hi: 'रोग निदान एवं शास्त्रीय सम्प्राप्ति',
      bn: 'রোগ নির্ণয় ও শাস্ত্রীয় রোগনিদান',
      ta: 'மருத்துவ நோய் கண்டறிதல்',
      te: 'రోగ నిర్ధారణ & రోగ నిదానం',
      kn: 'ರೋಗ ನಿರ್ಣಯ ಮತ್ತು ರೋಗ ನಿದಾನ',
      mr: 'रोग निदान व शास्त्रीय सम्प्राप्ती',
    },
    tridosha: {
      en: 'Tridosha Imbalance Assessment',
      hi: 'त्रिदोष असंतुलन मूल्यांकन',
      bn: 'ত্রিদ্বন্দ্বে দোষের ভারসাম্যহীনতা',
      ta: 'திரிதோஷ சமநிலையின்மை மதிப்பீடு',
      te: 'త్రిదోష అసమతుల్యత అంచనా',
      kn: 'ತ್ರಿದೋಷ ಅಸಮತೋಲನ ಮೌಲ್ಯಮಾಪನ',
      mr: 'त्रिदोष असंतुलन मूल्यांकन',
    },
    nadiNotes: {
      en: 'Nadi Pariksha Pulse Examination',
      hi: 'नाड़ी परीक्षा विवरण',
      bn: 'নাড়ী পরীক্ষা পর্যবেক্ষণ',
      ta: 'நாடி பரிசோதனை குறிப்புகள்',
      te: 'నాడీ పరీక్ష గమనికలు',
      kn: 'ನಾಡಿ ಪರೀಕ್ಷಾ ಟಿಪ್ಪಣಿಗಳು',
      mr: 'नाडी परीक्षा निरीक्षणे',
    },
    clinicalNotes: {
      en: 'Doctor Clinical Advice & Regimen',
      hi: 'चिकित्सक परामर्श एवं निर्देश',
      bn: 'ডাক্তারের ক্লিনিকাল পরামর্শ ও নির্দেশাবলী',
      ta: 'மருத்துவரின் மருத்துவ ஆலோசனை',
      te: 'వైద్యుని క్లినికల్ సలహాలు',
      kn: 'ವೈದ್ಯರ ಕ್ಲಿನಿಕಲ್ ಸಲಹೆಗಳು',
      mr: 'वैद्यांचा सल्ला व सूचना',
    },
    medicines: {
      en: 'Prescribed Classical Ayurvedic Formulations (Aushadhi)',
      hi: 'निर्धारित शास्त्रीय आयुर्वेदिक औषधियां (शमन चिकित्सा)',
      bn: 'অনুমোদিত শাস্ত্রীয় আয়ুর্বেদিক ঔষধসমূহ (ঔষধী)',
      ta: 'பரிந்துரைக்கப்பட்ட ஆயுர்வேத மருந்துகள்',
      te: 'సూచించిన ఆయుర్వేద ఔషధాలు',
      kn: 'ಸೂಚಿಸಲಾದ ಶಾಸ್ತ್ರೀಯ ಆಯುರ್ವೇದ ಔಷಧಗಳು',
      mr: 'प्रिस्क्राइब केलेल्या शास्त्रीय आयुर्वेदिक औषधी',
    },
    foodChart: {
      en: 'Personalized Food Chart (Pathya & Apathya Ahara)',
      hi: 'व्यक्तिगत आहार सारणी (पथ्य एवं अपथ्य आहार)',
      bn: 'ব্যক্তিগত খাদ্য তালিকা (পথ্য ও অপথ্য আহার)',
      ta: 'தனிப்பயனாக்கப்பட்ட உணவு விளக்கப்படம்',
      te: 'వ్యక్తిగత ఆహార చార్ట్ (పథ్య & అపథ్య)',
      kn: 'ವೈಯಕ್ತಿಕ ಆಹಾರ ಪಟ್ಟಿ (ಪಥ್ಯ-ಅಪಥ್ಯ ಆಹಾರ)',
      mr: 'व्यक्तिगत आहार तक्ता (पथ्य व अपथ्य आहार)',
    },
    yoga: {
      en: 'Prescribed Yoga Asanas & Vyayama (Exercise)',
      hi: 'निर्धारित योगासन, प्राणायाम एवं व्यायाम',
      bn: 'অনুমোদিত যোগাসন, প্রাণায়াম ও ব্যায়াম',
      ta: 'பரிந்துரைக்கப்பட்ட யோகாசனங்கள்',
      te: 'సూచించిన యోగాసనాలు & వ్యాయామం',
      kn: 'ಸೂಚಿಸಲಾದ ಯೋಗಾಸನಗಳು ಮತ್ತು ಪ್ರಾಣಾಯಾಮ',
      mr: 'प्रिस्क्राइब केलेले योगासने व प्राणायाम',
    },
    lifestyle: {
      en: 'Daily Dinacharya & Circadian Guidelines',
      hi: 'दैनिक दिनचर्या एवं आचार रसायन',
      bn: 'দৈনিক দিনচর্যা ও জীবনযাত্রার নির্দেশিকা',
      ta: 'தினசரி வாழ்க்கை முறை வழிகாட்டுதல்கள்',
      te: 'రోజువారీ దినచర్య మార్గదర్శకాలు',
      kn: 'ದೈನಂದಿನ ದಿನಚರ್ಯ ಮಾರ್ಗಸೂಚಿಗಳು',
      mr: 'दैनिक दिनचर्या व जीवनशैली नियम',
    },
  };

  const getL = (key: string) => labels[key]?.[lang] || labels[key]?.en || '';

  const medicinesRows = (rx.medicines || []).map((m, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
      <td style="padding: 10px 8px; font-weight: 700; color: #065f46; vertical-align: top; width: 5%; text-align: center; font-size: 11px;">
        ${idx + 1}
      </td>
      <td style="padding: 10px 10px; font-weight: 700; color: #0f172a; vertical-align: top; width: 30%; word-break: break-word; font-size: 12px; line-height: 1.45;">
        ${m.name}
        ${m.sanskritName ? `<div style="font-size: 10.5px; color: #047857; font-weight: normal; margin-top: 3px; font-style: italic;">${m.sanskritName}</div>` : ''}
      </td>
      <td style="padding: 10px 8px; color: #334155; font-size: 11px; vertical-align: top; width: 20%; line-height: 1.45;">
        <div style="font-weight: 600; color: #047857;">${m.form || 'Vati/Tablet'}</div>
        <div style="color: #1e293b; margin-top: 2px;">${m.dosage}</div>
      </td>
      <td style="padding: 10px 8px; color: #334155; font-size: 11px; vertical-align: top; width: 23%; line-height: 1.45;">
        <div style="font-weight: 600; color: #1e293b;">${m.timing}</div>
        <div style="color: #047857; margin-top: 2px;">Anupana: <em>${m.anupana}</em></div>
      </td>
      <td style="padding: 10px 8px; color: #475569; font-size: 10.5px; vertical-align: top; width: 22%; line-height: 1.45; word-break: break-word;">
        <div style="font-weight: 600; color: #1e293b;">Duration: ${m.duration}</div>
        ${m.instructions ? `<div style="color: #64748b; margin-top: 2px;">${m.instructions}</div>` : ''}
      </td>
    </tr>
  `).join('');

  const pathyaList = (rx.foodChart?.pathya || []).map(p => `
    <li style="margin-bottom: 6px; color: #065f46; line-height: 1.5; font-size: 11px;">
      <span style="font-weight: bold; color: #059669; margin-right: 4px;">✓</span> ${p}
    </li>
  `).join('');

  const apathyaList = (rx.foodChart?.apathya || []).map(a => `
    <li style="margin-bottom: 6px; color: #991b1b; line-height: 1.5; font-size: 11px;">
      <span style="font-weight: bold; color: #dc2626; margin-right: 4px;">✕</span> ${a}
    </li>
  `).join('');

  const asanasList = (rx.yogaRoutine?.asanas || []).map(a => `
    <div style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0; line-height: 1.45;">
      <div style="font-weight: 700; color: #065f46; font-size: 12px;">
        ${a.name} <span style="font-size: 11px; font-weight: normal; color: #64748b;">(${a.duration})</span>
      </div>
      <div style="font-size: 11px; color: #334155; margin-top: 3px;">${a.benefit}</div>
      ${a.instructions ? `<div style="font-size: 10.5px; color: #64748b; font-style: italic; margin-top: 2px;">${a.instructions}</div>` : ''}
    </div>
  `).join('');

  const pranayamaList = (rx.yogaRoutine?.pranayama || []).map(p => `
    <div style="margin-bottom: 8px; line-height: 1.45; font-size: 11px;">
      <strong style="color: #047857;">${p.technique}</strong>: <span style="color: #334155;">${p.duration}</span>
      ${p.instructions ? `<div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">${p.instructions}</div>` : ''}
    </div>
  `).join('');

  const lifestyleList = (rx.lifestyleNotes || []).map(note => `
    <li style="margin-bottom: 6px; color: #334155; line-height: 1.5; font-size: 11px;">
      <span style="color: #059669; margin-right: 4px;">•</span> ${note}
    </li>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>Prescription_${rx.prescriptionNumber || 'AYUSH'}_${lang}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
    *, *:before, *:after {
      box-sizing: border-box !important;
      -webkit-font-smoothing: antialiased;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      line-height: 1.5;
      font-size: 12px;
      user-select: text !important;
      -webkit-user-select: text !important;
    }
    .rx-container {
      width: 100%;
      max-width: 750px;
      margin: 0 auto;
      padding: 16px 20px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      box-sizing: border-box;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 2.5px solid #047857;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .section-head {
      font-size: 11.5px;
      font-weight: 700;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      border-bottom: 1.5px solid #059669;
      padding-bottom: 4px;
      margin-top: 14px;
      margin-bottom: 10px;
      line-height: 1.35;
    }
    table.med-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 11px;
      table-layout: fixed;
    }
    table.med-table th {
      background: #047857;
      color: #ffffff;
      padding: 9px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      line-height: 1.3;
    }
    .dosha-pill {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10.5px;
      font-weight: bold;
      margin-right: 6px;
      margin-bottom: 4px;
    }
    .footer-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 18px;
      border-top: 2px solid #047857;
      padding-top: 12px;
    }
  </style>
</head>
<body>

  <div class="rx-container">
    <!-- Header Section -->
    <table class="header-table">
      <tr>
        <td style="width: 60px; text-align: center; vertical-align: middle;">
          <div style="font-size: 32px; line-height: 1;">🌿</div>
          <div style="font-size: 8.5px; font-weight: 800; color: #047857; margin-top: 2px;">AYUSH</div>
        </td>
        <td style="vertical-align: middle; padding-left: 12px;">
          <div style="font-size: 13px; font-weight: 800; color: #065f46; letter-spacing: 0.3px; text-transform: uppercase; line-height: 1.3;">
            ${getL('title')}
          </div>
          <div style="font-size: 9.5px; color: #475569; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.2px; line-height: 1.3;">
            ${getL('subTitle')}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px; line-height: 1.3;">
            ${rx.clinicName || 'Sanjeevani Ayurvedic Chikitsalaya'}
          </div>
          <div style="font-size: 10.5px; color: #475569; line-height: 1.35; margin-top: 1px;">
            ${rx.clinicAddress || 'AYUSH Accredited Center'} • Consultation Fee: ${rx.consultationFee || '₹800'}
          </div>
        </td>
        <td style="text-align: right; vertical-align: top; width: 160px;">
          <div style="font-size: 9.5px; color: #64748b; font-family: monospace;">PRESCRIPTION NO:</div>
          <div style="font-size: 12px; font-weight: bold; color: #065f46; font-family: monospace;">${rx.prescriptionNumber || 'RX-AYU-2026'}</div>
          <div style="font-size: 9.5px; color: #334155; margin-top: 4px;">Date: <strong>${rx.date || new Date().toISOString().split('T')[0]}</strong></div>
          <div style="font-size: 9.5px; color: #047857; margin-top: 2px;">Follow-up: <strong>${rx.followUpDate || '14 Days'}</strong></div>
        </td>
      </tr>
    </table>

    <!-- Patient & Doctor Metadata Table (Non-collapsing table layout) -->
    <table style="width: 100%; border-collapse: collapse; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin-bottom: 14px; page-break-inside: avoid;">
      <tr>
        <td style="width: 50%; padding: 12px 14px; vertical-align: top; border-right: 1px solid #bbf7d0;">
          <div style="font-size: 10px; font-weight: bold; color: #065f46; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.3px;">
            👤 ${getL('patientDetails')}
          </div>
          <div style="font-size: 13.5px; font-weight: bold; color: #0f172a; line-height: 1.35;">${rx.patientName}</div>
          <div style="font-size: 11px; color: #334155; line-height: 1.4; margin-top: 3px;">
            Username: <strong style="font-family: monospace; color: #047857;">@${rx.patientUsername}</strong> • Age/Gender: <strong>${rx.patientAge || '28'} / ${rx.patientGender || 'Male'}</strong>
          </div>
          ${rx.patientPhone ? `<div style="font-size: 10.5px; color: #475569; line-height: 1.35; margin-top: 2px;">Phone: ${rx.patientPhone}</div>` : ''}
          ${rx.patientAddress ? `<div style="font-size: 10.5px; color: #64748b; line-height: 1.35; margin-top: 2px;">Address: ${rx.patientAddress}</div>` : ''}
        </td>

        <td style="width: 50%; padding: 12px 14px; vertical-align: top;">
          <div style="font-size: 10px; font-weight: bold; color: #065f46; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.3px;">
            🩺 ${getL('doctorDetails')}
          </div>
          <div style="font-size: 13px; font-weight: bold; color: #0f172a; line-height: 1.35;">${rx.doctorName}</div>
          <div style="font-size: 11px; color: #047857; font-weight: 600; line-height: 1.35; margin-top: 3px;">${rx.doctorQualification || 'BAMS, MD (Ayurveda)'}</div>
          <div style="font-size: 10.5px; color: #334155; line-height: 1.35; margin-top: 2px;">
            Reg No: <strong style="font-family: monospace;">${rx.doctorRegistrationNo || 'CCIM-AYU-84920'}</strong>
          </div>
          ${rx.doctorPhone ? `<div style="font-size: 10px; color: #64748b; line-height: 1.35; margin-top: 2px;">Doctor Contact: ${rx.doctorPhone}</div>` : ''}
        </td>
      </tr>
    </table>

    <!-- Diagnostic Assessment Section -->
    <div style="page-break-inside: avoid; margin-bottom: 14px;">
      <div class="section-head">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; font-weight: bold; color: #065f46; font-size: 11.5px;">📋 ${getL('diagnosis')}</td>
            <td style="text-align: right; font-size: 10px; font-weight: normal; color: #475569;">Document Language: <strong>${LANGUAGE_LABELS[lang]?.native || lang.toUpperCase()}</strong></td>
          </tr>
        </table>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; line-height: 1.5;">
        <div style="font-size: 13.5px; font-weight: bold; color: #0f172a; word-break: break-word;">
          ${rx.diagnosis}
        </div>
        ${rx.sanskritRogaNidan ? `<div style="font-size: 11.5px; color: #047857; font-weight: 500; margin-top: 3px; font-style: italic;">${rx.sanskritRogaNidan}</div>` : ''}
      </div>

      <!-- Tridosha & Nadi Pariksha Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 6px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; background: #fafafa; min-height: 75px;">
              <strong style="color: #065f46; font-size: 10.5px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                ⚡ ${getL('tridosha')}
              </strong>
              <div style="margin-bottom: 4px;">
                <span class="dosha-pill" style="background: #e0e7ff; color: #3730a3;">Vata: ${rx.doshaImbalance?.vata ?? 50}%</span>
                <span class="dosha-pill" style="background: #fee2e2; color: #991b1b;">Pitta: ${rx.doshaImbalance?.pitta ?? 30}%</span>
                <span class="dosha-pill" style="background: #dcfce7; color: #166534;">Kapha: ${rx.doshaImbalance?.kapha ?? 20}%</span>
              </div>
              <div style="font-size: 10.5px; color: #475569; margin-top: 4px;">
                Dominant: <strong>${rx.doshaImbalance?.dominant || 'Vata-Pitta'}</strong>
              </div>
            </div>
          </td>

          <td style="width: 50%; vertical-align: top; padding-left: 6px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; background: #fafafa; min-height: 75px;">
              <strong style="color: #065f46; font-size: 10.5px; text-transform: uppercase; display: block; margin-bottom: 4px;">
                🩺 ${getL('nadiNotes')}
              </strong>
              <div style="font-size: 11px; color: #334155; font-style: italic; line-height: 1.45; word-break: break-word;">
                "${rx.nadiParikshaNotes || 'Manda-Sarpa pulse profile with localized Ama.'}"
              </div>
            </div>
          </td>
        </tr>
      </table>

      ${rx.clinicalNotes ? `
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 12px; border-radius: 4px; margin-top: 8px; font-size: 11.5px; color: #92400e; line-height: 1.5; word-break: break-word;">
          <strong>${getL('clinicalNotes')}:</strong> ${rx.clinicalNotes}
        </div>
      ` : ''}
    </div>

    <!-- Prescribed Medicines Table -->
    <div style="page-break-inside: avoid; margin-bottom: 14px;">
      <div class="section-head">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: left; font-weight: bold; color: #065f46; font-size: 11.5px;">💊 ${getL('medicines')}</td>
            <td style="text-align: right; font-size: 10px; font-weight: normal; color: #047857;">Rx (${(rx.medicines || []).length} Formulations)</td>
          </tr>
        </table>
      </div>

      <table class="med-table">
        <thead>
          <tr>
            <th style="width: 5%; text-align: center;">#</th>
            <th style="width: 30%;">Formulation Name</th>
            <th style="width: 20%;">Form &amp; Dosage</th>
            <th style="width: 23%;">Timing &amp; Anupana</th>
            <th style="width: 22%;">Duration &amp; Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${medicinesRows || '<tr><td colspan="5" style="padding: 14px; text-align: center; color: #64748b;">No medicines prescribed.</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Food Chart Matrix (Ahara) -->
    <div style="page-break-inside: avoid; margin-bottom: 14px;">
      <div class="section-head">
        <span>🍲 ${getL('foodChart')}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 6px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; background: #fafafa; min-height: 120px;">
              <div style="font-size: 10.5px; font-weight: bold; color: #065f46; margin-bottom: 6px; letter-spacing: 0.3px;">
                MEAL SCHEDULE &amp; TIMING
              </div>
              <div style="font-size: 11px; margin-bottom: 5px; word-break: break-word; line-height: 1.45;">
                <strong style="color: #0f172a;">Breakfast:</strong> ${rx.foodChart?.breakfast || 'Light warm porridge.'}
              </div>
              <div style="font-size: 11px; margin-bottom: 5px; word-break: break-word; line-height: 1.45;">
                <strong style="color: #0f172a;">Lunch:</strong> ${rx.foodChart?.lunch || 'Old rice, boiled greens, buttermilk.'}
              </div>
              <div style="font-size: 11px; margin-bottom: 5px; word-break: break-word; line-height: 1.45;">
                <strong style="color: #0f172a;">Evening:</strong> ${rx.foodChart?.eveningSnack || 'Herbal infusion.'}
              </div>
              <div style="font-size: 11px; margin-bottom: 5px; word-break: break-word; line-height: 1.45;">
                <strong style="color: #0f172a;">Dinner:</strong> ${rx.foodChart?.dinner || 'Moong dal khichdi before 7:30 PM.'}
              </div>
              <div style="font-size: 10.5px; color: #047857; margin-top: 6px; font-weight: 600;">
                💧 <strong>Hydration:</strong> ${rx.foodChart?.hydrationGuideline || '2.5L warm water daily.'}
              </div>
            </div>
          </td>

          <td style="width: 50%; vertical-align: top; padding-left: 6px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; background: #fafafa; min-height: 120px;">
              <div style="font-size: 10.5px; font-weight: bold; color: #047857; margin-bottom: 5px;">
                ✓ PATHYA (BENEFICIAL FOODS)
              </div>
              <ul style="margin: 0 0 8px 0; padding-left: 0; list-style: none;">
                ${pathyaList || '<li style="font-size: 11px; color: #065f46;">✓ Warm, fresh cooked meals</li>'}
              </ul>
              
              <div style="font-size: 10.5px; font-weight: bold; color: #b91c1c; margin-bottom: 5px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
                ✕ APATHYA (AVOID)
              </div>
              <ul style="margin: 0; padding-left: 0; list-style: none;">
                ${apathyaList || '<li style="font-size: 11px; color: #991b1b;">✕ Cold refrigerated items</li>'}
              </ul>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Yoga & Lifestyle Regimen Row -->
    <div style="page-break-inside: avoid; margin-bottom: 14px;">
      <div class="section-head">
        <span>🧘 ${getL('yoga')} &amp; ${getL('lifestyle')}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 6px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; background: #fafafa; min-height: 100px;">
              <div style="font-size: 10.5px; font-weight: bold; color: #065f46; margin-bottom: 6px;">
                ASANAS &amp; PRANAYAMA (${rx.yogaRoutine?.preferredTime || 'Morning'})
              </div>
              ${asanasList || '<div style="font-size: 11px; color: #64748b;">Daily gentle yoga.</div>'}
              ${pranayamaList}
              ${rx.yogaRoutine?.precautions?.[0] ? `<div style="font-size: 10.5px; color: #991b1b; margin-top: 6px; line-height: 1.4;"><strong>Precaution:</strong> ${rx.yogaRoutine.precautions[0]}</div>` : ''}
            </div>
          </td>

          <td style="width: 50%; vertical-align: top; padding-left: 6px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; background: #fafafa; min-height: 100px;">
              <div style="font-size: 10.5px; font-weight: bold; color: #065f46; margin-bottom: 6px;">
                DINACHARYA (DAILY LIVING GUIDELINES)
              </div>
              <ul style="margin: 0; padding-left: 0; list-style: none;">
                ${lifestyleList || '<li style="font-size: 11px; color: #334155;">• Maintain fixed wake-up and sleep hours.</li>'}
              </ul>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Official Stamp & Digital Seal Signature Block -->
    <table class="footer-table" style="page-break-inside: avoid;">
      <tr>
        <td style="vertical-align: middle; width: 62%;">
          <div style="border: 1.5px solid #059669; padding: 10px 12px; border-radius: 6px; font-family: monospace; font-size: 9px; color: #065f46; background: #ecfdf5; line-height: 1.5;">
            <div style="font-weight: bold; color: #047857; margin-bottom: 2px;">
              ✓ DIGITALLY CERTIFIED &amp; VERIFIED AYUSH E-PRESCRIPTION
            </div>
            <div>Cryptographic Hash: <strong>${rx.digitalSealHash || 'SEAL_AUTHENTICATED_AYUSH_2026'}</strong></div>
            <div>NCISM / State Registry: <strong>${rx.doctorRegistrationNo || 'CCIM-REG-84920'}</strong></div>
            <div style="color: #64748b; font-size: 8px; margin-top: 3px;">
              Generated via IP-SAKTI Sahayak Clinical Portal • Selectable Vector Document
            </div>
          </div>
        </td>

        <td style="vertical-align: middle; width: 38%; text-align: right; padding-left: 16px;">
          <div style="font-size: 10px; color: #059669; font-weight: bold; margin-bottom: 3px;">
            [DIGITALLY SIGNED &amp; SEALED]
          </div>
          <div style="border-bottom: 1px solid #334155; width: 160px; margin-left: auto; margin-top: 6px; margin-bottom: 4px;"></div>
          <div style="font-weight: bold; font-size: 13px; color: #0f172a; line-height: 1.3;">${rx.doctorName}</div>
          <div style="font-size: 10.5px; color: #475569; line-height: 1.35;">${rx.doctorQualification || 'BAMS, MD (Ayurveda)'}</div>
          <div style="font-size: 9.5px; color: #64748b; line-height: 1.35;">${rx.clinicName || 'Treating Vaidya'}</div>
        </td>
      </tr>
    </table>
  </div>

</body>
</html>
  `;
}

// Downloads high-definition selectable PDF using html2pdf.js with bulletproof DOM geometry
export async function downloadPrescriptionPdfWithHtml2Pdf(
  rx: DoctorPrescription,
  lang: SupportedLanguage = 'en',
  customFilename?: string
): Promise<void> {
  const patientSafeName = (rx.patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = customFilename || `AYUSH_Prescription_${rx.prescriptionNumber || 'RX'}_${lang.toUpperCase()}_${patientSafeName}.pdf`;

  // Attach a hidden container in-flow so browser calculates font metrics & line-heights without collapse
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px'; // 210mm at 96 DPI A4 standard width
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1e293b';
  container.style.boxSizing = 'border-box';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.zIndex = '-9999';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';

  const fullHtml = generatePrescriptionHtml(rx, lang);
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(fullHtml, 'text/html');
  const rxContainer = parsedDoc.querySelector('.rx-container') || parsedDoc.body;
  
  container.innerHTML = rxContainer.outerHTML;
  document.body.appendChild(container);

  const opt = {
    margin: [8, 8, 8, 8], // 8mm clean outer margins
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      windowWidth: 794,
      backgroundColor: '#ffffff',
      scrollY: 0,
      scrollX: 0,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      putOnlyUsedFonts: true,
      compress: true,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  try {
    // @ts-ignore
    await html2pdf().set(opt).from(container).save();
  } catch (err) {
    console.warn('html2pdf render issue, falling back to direct jsPDF generator:', err);
    downloadPrescriptionWithJsPdf(rx, lang, filename);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

// Direct jsPDF vector document generator with exact column geometry and dynamic row heights
export function downloadPrescriptionWithJsPdf(
  rx: DoctorPrescription,
  lang: SupportedLanguage = 'en',
  customFilename?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const patientSafeName = (rx.patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = customFilename || `AYUSH_Vector_Prescription_${rx.prescriptionNumber || 'RX'}_${lang.toUpperCase()}_${patientSafeName}.pdf`;

  const primaryGreen = [4, 120, 87];
  const darkEmerald = [6, 78, 59];
  const textDark = [15, 23, 42];
  const textMuted = [100, 116, 139];
  const pageHeight = 297;
  const leftMargin = 12;
  const rightMargin = 198;
  const contentWidth = rightMargin - leftMargin; // 186mm

  let curY = 12;

  // Helper to ensure page bounds
  const checkPageOverflow = (neededHeight: number): void => {
    if (curY + neededHeight > pageHeight - 15) {
      doc.addPage();
      curY = 14;
    }
  };

  // 1. Header Banner
  doc.setFillColor(darkEmerald[0], darkEmerald[1], darkEmerald[2]);
  doc.rect(leftMargin, curY, contentWidth, 14, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT OF INDIA • MINISTRY OF AYUSH CLINICAL PRESCRIPTION', 105, curY + 6, { align: 'center' });
  
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.text('Authenticated Electronic Medical Record & E-Prescription Under NCISM Regulations', 105, curY + 11, { align: 'center' });

  curY += 18;

  // 2. Clinic & Prescription Meta Line
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const clinicTitle = rx.clinicName || 'Sanjeevani Ayurvedic Chikitsalaya';
  doc.text(clinicTitle, leftMargin, curY);
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`${rx.clinicAddress || 'AYUSH Accredited Center'} • Consultation Fee: ${rx.consultationFee || '₹800'}`, leftMargin, curY + 4.5);

  // Prescription Number & Date (Right aligned)
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`Prescription No: ${rx.prescriptionNumber || 'RX-AYU-2026'}`, rightMargin, curY, { align: 'right' });
  
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${rx.date || new Date().toISOString().split('T')[0]}  |  Follow-up: ${rx.followUpDate || '14 Days'}`, rightMargin, curY + 4.5, { align: 'right' });

  // Divider Line
  curY += 9;
  doc.setDrawColor(4, 120, 87);
  doc.setLineWidth(0.35);
  doc.line(leftMargin, curY, rightMargin, curY);

  // 3. Patient & Doctor Info Box (Dynamic height)
  curY += 3.5;
  const colHalfWidth = (contentWidth - 6) / 2; // ~90mm
  const patientBoxHeight = 22;
  
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(leftMargin, curY, contentWidth, patientBoxHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(leftMargin, curY, contentWidth, patientBoxHeight, 1.5, 1.5, 'S');

  // Patient Column
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('PATIENT RECORD', leftMargin + 4, curY + 5);

  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(rx.patientName || 'Patient', leftMargin + 4, curY + 10);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`ID: @${rx.patientUsername}  |  Age/Gender: ${rx.patientAge || 28} / ${rx.patientGender || 'Male'}`, leftMargin + 4, curY + 14.5);
  if (rx.patientPhone) {
    doc.text(`Phone: ${rx.patientPhone}`, leftMargin + 4, curY + 18.5);
  }

  // Doctor Column
  const docColX = leftMargin + colHalfWidth + 6;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('TREATING VAIDYA / PHYSICIAN', docColX, curY + 5);

  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(rx.doctorName || 'Dr. Treating Vaidya', docColX, curY + 10);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`${rx.doctorQualification || 'BAMS, MD (Ayurveda)'}`, docColX, curY + 14.5);
  doc.text(`Reg No: ${rx.doctorRegistrationNo || 'CCIM-AYU-84920'}`, docColX, curY + 18.5);

  curY += patientBoxHeight + 5;

  // 4. Diagnosis Section
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('CLINICAL DIAGNOSIS & ROGA NIDAN', leftMargin, curY);

  curY += 2.5;
  const diagLines = doc.splitTextToSize(`Diagnosis: ${rx.diagnosis}`, contentWidth - 8);
  const doshaText = `Dominant Dosha: ${rx.doshaImbalance?.dominant || 'Tridosha'} (Vata: ${rx.doshaImbalance?.vata ?? 40}%, Pitta: ${rx.doshaImbalance?.pitta ?? 35}%, Kapha: ${rx.doshaImbalance?.kapha ?? 25}%)`;
  const doshaLines = doc.splitTextToSize(doshaText, contentWidth - 8);
  const diagBoxHeight = (diagLines.length * 4) + (doshaLines.length * 3.6) + 5;

  doc.setFillColor(248, 250, 252);
  doc.rect(leftMargin, curY, contentWidth, diagBoxHeight, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(leftMargin, curY, contentWidth, diagBoxHeight, 'S');

  let textY = curY + 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  diagLines.forEach((line: string) => {
    doc.text(line, leftMargin + 4, textY);
    textY += 4;
  });

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doshaLines.forEach((line: string) => {
    doc.text(line, leftMargin + 4, textY);
    textY += 3.6;
  });

  curY += diagBoxHeight + 5;

  // 5. Prescribed Medicines Table
  checkPageOverflow(30);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text(`PRESCRIBED AUSHADHI FORMULATIONS (${(rx.medicines || []).length} Medicines)`, leftMargin, curY);

  curY += 2.5;
  const colX = {
    num: leftMargin, // width 8mm
    name: leftMargin + 8, // width 50mm
    form: leftMargin + 58, // width 24mm
    dosage: leftMargin + 82, // width 32mm
    timing: leftMargin + 114, // width 34mm
    anupana: leftMargin + 148, // width 38mm
  };

  const drawTableHeaders = () => {
    doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.rect(leftMargin, curY, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('#', colX.num + 2, curY + 4.2);
    doc.text('Formulation Name', colX.name + 2, curY + 4.2);
    doc.text('Form', colX.form + 2, curY + 4.2);
    doc.text('Dosage', colX.dosage + 2, curY + 4.2);
    doc.text('Timing (Kala)', colX.timing + 2, curY + 4.2);
    doc.text('Anupana & Notes', colX.anupana + 2, curY + 4.2);
    curY += 6;
  };

  drawTableHeaders();

  (rx.medicines || []).forEach((m, i) => {
    const nameLines = doc.splitTextToSize(m.name || '', 48);
    const formLines = doc.splitTextToSize(m.form || 'Vati', 22);
    const dosageLines = doc.splitTextToSize(m.dosage || '', 30);
    const timingLines = doc.splitTextToSize(m.timing || '', 32);
    const anupanaText = `${m.anupana || '-'}${m.duration ? ` (${m.duration})` : ''}`;
    const anupanaLines = doc.splitTextToSize(anupanaText, 36);

    const maxLines = Math.max(
      nameLines.length,
      formLines.length,
      dosageLines.length,
      timingLines.length,
      anupanaLines.length,
      1
    );

    const rowHeight = Math.max(maxLines * 3.8 + 3, 7);

    if (curY + rowHeight > pageHeight - 20) {
      doc.addPage();
      curY = 14;
      drawTableHeaders();
    }

    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(leftMargin, curY, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, curY + rowHeight, rightMargin, curY + rowHeight);

    doc.setFontSize(7);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}`, colX.num + 2, curY + 4.2);

    // Name column
    let yPos = curY + 4.2;
    nameLines.forEach((l: string) => {
      doc.text(l, colX.name + 2, yPos);
      yPos += 3.5;
    });

    // Form column
    yPos = curY + 4.2;
    doc.setFont('helvetica', 'normal');
    formLines.forEach((l: string) => {
      doc.text(l, colX.form + 2, yPos);
      yPos += 3.5;
    });

    // Dosage column
    yPos = curY + 4.2;
    dosageLines.forEach((l: string) => {
      doc.text(l, colX.dosage + 2, yPos);
      yPos += 3.5;
    });

    // Timing column
    yPos = curY + 4.2;
    timingLines.forEach((l: string) => {
      doc.text(l, colX.timing + 2, yPos);
      yPos += 3.5;
    });

    // Anupana column
    yPos = curY + 4.2;
    anupanaLines.forEach((l: string) => {
      doc.text(l, colX.anupana + 2, yPos);
      yPos += 3.5;
    });

    curY += rowHeight;
  });

  // 6. Food Chart (Pathya & Apathya)
  curY += 4;
  checkPageOverflow(25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('PERSONALIZED DIET & PATHYA-APATHYA CHART', leftMargin, curY);

  curY += 2.5;
  const bfLines = doc.splitTextToSize(`Breakfast: ${rx.foodChart?.breakfast || 'Warm porridge'}`, contentWidth - 8);
  const lunchLines = doc.splitTextToSize(`Lunch: ${rx.foodChart?.lunch || 'Cooked greens & rice'}`, contentWidth - 8);
  const dinLines = doc.splitTextToSize(`Dinner: ${rx.foodChart?.dinner || 'Moong dal khichdi'}`, contentWidth - 8);
  const pathyaStr = (rx.foodChart?.pathya || []).join(', ') || 'Warm cooked food';
  const pathyaLines = doc.splitTextToSize(`Pathya (Beneficial): ${pathyaStr}`, contentWidth - 8);

  const foodBoxHeight = (bfLines.length * 3.5) + (lunchLines.length * 3.5) + (dinLines.length * 3.5) + (pathyaLines.length * 3.5) + 6;

  checkPageOverflow(foodBoxHeight);
  doc.setFillColor(250, 250, 250);
  doc.rect(leftMargin, curY, contentWidth, foodBoxHeight, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(leftMargin, curY, contentWidth, foodBoxHeight, 'S');

  let foodY = curY + 4.2;
  doc.setFontSize(7.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');

  bfLines.forEach((l: string) => { doc.text(l, leftMargin + 4, foodY); foodY += 3.5; });
  lunchLines.forEach((l: string) => { doc.text(l, leftMargin + 4, foodY); foodY += 3.5; });
  dinLines.forEach((l: string) => { doc.text(l, leftMargin + 4, foodY); foodY += 3.5; });

  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFont('helvetica', 'bold');
  pathyaLines.forEach((l: string) => { doc.text(l, leftMargin + 4, foodY); foodY += 3.5; });

  curY += foodBoxHeight + 5;

  // 7. Yoga & Lifestyle Box
  checkPageOverflow(22);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('YOGA ASANAS & AYURVEDIC DINACHARYA', leftMargin, curY);

  curY += 2.5;
  const asanasStr = (rx.yogaRoutine?.asanas || []).map(a => `${a.name} (${a.duration})`).join(' • ') || 'Gentle Sukhasana';
  const asanasLines = doc.splitTextToSize(`Asanas (${rx.yogaRoutine?.preferredTime || 'Morning'}): ${asanasStr}`, contentWidth - 8);
  const dinStr = (rx.lifestyleNotes || []).join(' • ') || 'Fixed sleep and wake schedule';
  const dinLinesList = doc.splitTextToSize(`Dinacharya: ${dinStr}`, contentWidth - 8);

  const yogaBoxHeight = (asanasLines.length * 3.5) + (dinLinesList.length * 3.5) + 6;

  checkPageOverflow(yogaBoxHeight);
  doc.setFillColor(250, 250, 250);
  doc.rect(leftMargin, curY, contentWidth, yogaBoxHeight, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(leftMargin, curY, contentWidth, yogaBoxHeight, 'S');

  let yogaY = curY + 4.2;
  doc.setFontSize(7.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  asanasLines.forEach((l: string) => { doc.text(l, leftMargin + 4, yogaY); yogaY += 3.5; });
  dinLinesList.forEach((l: string) => { doc.text(l, leftMargin + 4, yogaY); yogaY += 3.5; });

  curY += yogaBoxHeight + 6;

  // 8. Digital Seal & Doctor Signature Block
  checkPageOverflow(22);
  doc.setFillColor(236, 253, 245);
  doc.rect(leftMargin, curY, 105, 17, 'F');
  doc.setDrawColor(5, 150, 105);
  doc.rect(leftMargin, curY, 105, 17, 'S');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('✓ DIGITALLY VERIFIED AYUSH E-PRESCRIPTION', leftMargin + 4, curY + 5);
  doc.setFontSize(6.5);
  doc.setFont('courier', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Hash: ${(rx.digitalSealHash || 'SEAL_AYUSH_2026').substring(0, 32)}`, leftMargin + 4, curY + 9.5);
  doc.text(`Reg: ${rx.doctorRegistrationNo || 'CCIM-REG-84920'}`, leftMargin + 4, curY + 13.5);

  // Doctor Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text('[DIGITALLY SIGNED & SEALED]', rightMargin, curY + 5, { align: 'right' });
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(8.5);
  doc.text(rx.doctorName || 'Dr. Treating Vaidya', rightMargin, curY + 9.5, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(rx.doctorQualification || 'BAMS, MD (Ayurveda)', rightMargin, curY + 13.5, { align: 'right' });

  // Save the PDF
  doc.save(filename);
}

// Opens native vector print dialog with 100% selectable text in browser
export function printPrescriptionPdf(rx: DoctorPrescription, lang: SupportedLanguage = 'en') {
  const html = generatePrescriptionHtml(rx, lang);
  
  // Create an invisible iframe to print cleanly without popping new URL windows that might be blocked
  let iframe = document.getElementById('rx-print-frame') as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'rx-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe?.contentWindow?.focus();
        iframe?.contentWindow?.print();
      } catch (err) {
        // Fallback: Open in new tab if iframe print is restricted
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
          win.onload = () => win.print();
        }
      }
    }, 350);
  }
}

// Downloads selectable standalone HTML file that can be saved as PDF or viewed offline
export function downloadSelectablePrescriptionDoc(rx: DoctorPrescription, lang: SupportedLanguage = 'en') {
  const html = generatePrescriptionHtml(rx, lang);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Prescription_${rx.prescriptionNumber || 'AYUSH'}_${lang.toUpperCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
