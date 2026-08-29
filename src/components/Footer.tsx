import React from 'react';
import { ShieldAlert, Leaf, Scale, BookOpen, ExternalLink, Heart } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';

interface FooterProps {
  language: SupportedLanguage;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language] || translations.en;

  return (
    <footer className="mt-16 bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      {/* Statutory Disclaimer Highlight Banner */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/40 p-5">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-xs">
              {t.statutoryDisclaimerTitle || 'Statutory AYUSH & Legal Disclaimer'}
            </h4>
            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
              {t.legalDisclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-lime-300 border border-emerald-600/30">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-lg text-white">
                {t.appName || 'IP-SAKTI Sahayak'}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t.footerBrandDesc || 'Multilingual, RAG-based AI assistant bridging classical Ayurvedic Roga Nidan with global intellectual property (IP) and herbal regulatory governance.'}
            </p>
            <div className="text-[11px] text-emerald-400 font-medium">
              {t.groundingFootnote || 'Grounding: Charaka, Sushruta, TKDL & Patent Act 1970'}
            </div>
          </div>

          {/* Col 2: Regulatory & IP Frameworks */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-lime-400" />
              {t.statutoryRegimesTitle || 'Statutory Regimes'}
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>{t.statutoryRegime1 || '• Indian Patents Act (Section 3p, 3d, 3e)'}</li>
              <li>{t.statutoryRegime2 || '• Biological Diversity Act (NBA / SBB ABS)'}</li>
              <li>{t.statutoryRegime3 || '• CSIR Traditional Knowledge Digital Library (TKDL)'}</li>
              <li>{t.statutoryRegime4 || '• US FDA 21 CFR 111 & Botanical Drug Guidance'}</li>
              <li>{t.statutoryRegime5 || '• EMA Traditional Herbal Directive (THMPD)'}</li>
              <li>{t.statutoryRegime6 || '• FSSAI Ayurvedic Aahar Regulations 2022'}</li>
            </ul>
          </div>

          {/* Col 3: Classical Ayurvedic Authorities */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              {t.classicalAuthoritiesTitle || 'Classical Authorities'}
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>{t.classicalAuthority1 || '• Charaka Samhita (Sutrasthana & Chikitsasthana)'}</li>
              <li>{t.classicalAuthority2 || '• Sushruta Samhita (Sharirasthana)'}</li>
              <li>{t.classicalAuthority3 || '• Ashtanga Hridaya (Nidanasthana)'}</li>
              <li>{t.classicalAuthority4 || '• Bhavaprakasha Nighantu'}</li>
              <li>{t.classicalAuthority5 || '• Ayurvedic Pharmacopoeia of India (API)'}</li>
              <li>{t.classicalAuthority6 || '• Rasatarangini & Sharangadhara Samhita'}</li>
            </ul>
          </div>

          {/* Col 4: Helplines & Emergency */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              {t.nationalHealthContacts || 'National Health Contacts'}
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div>
                <span className="text-slate-300 font-semibold block">{t.emergencyLabel || 'National Emergency:'}</span>
                <span className="text-lime-400 font-mono font-bold">112</span>
              </div>
              <div>
                <span className="text-slate-300 font-semibold block">{t.ayushHelplineLabel || 'Ministry of AYUSH Toll-Free:'}</span>
                <span className="text-emerald-400 font-mono font-bold">1800-11-22-02</span>
              </div>
              <div>
                <span className="text-slate-300 font-semibold block">{t.poisonInfoLabel || 'National Poison Information:'}</span>
                <span className="text-amber-400 font-mono font-bold">1800-11-61-17</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            {t.copyrightNotice || `© ${new Date().getFullYear()} IP-SAKTI Sahayak. Powered by Gemini AI & Traditional Knowledge Digital Library (TKDL) Grounding.`}
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>{t.isoBadge || 'ISO 9001 / AYUSH GMP Benchmarked'}</span>
            <span>•</span>
            <span>{t.multilingualEngine || 'Multilingual 7-Language Engine'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
