import React from 'react';
import { 
  Moon, 
  Sun, 
  Globe, 
  Stethoscope, 
  FileText, 
  MapPin, 
  BookOpen, 
  Award, 
  Clock, 
  User, 
  LogIn, 
  LogOut,
  Radio,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../types';
import { SUPPORTED_LANGUAGES, translations } from '../i18n/translations';

interface NavbarProps {
  currentTab: 'nidan' | 'prescriptions' | 'dinacharya' | 'ipsakti' | 'clinics' | 'knowledge' | 'doctor';
  setCurrentTab: (tab: 'nidan' | 'prescriptions' | 'dinacharya' | 'ipsakti' | 'clinics' | 'knowledge' | 'doctor') => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  wsConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  isDarkMode,
  setIsDarkMode,
  currentUser,
  onOpenAuth,
  onLogout,
  wsConnected,
}) => {
  const t = translations[language] || translations.en;
  const isDoctor = currentUser?.role === 'doctor';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-[#111827]/95 border-b border-stone-200 dark:border-stone-800 transition-colors duration-200 shadow-sm">
      {/* Top Advisory Strip - Deep Emerald & Lime */}
      <div className="bg-[#1E3A2F] text-white text-xs px-4 sm:px-8 py-2 flex items-center justify-between font-medium border-b border-[#284f40]">
        <div className="flex items-center gap-2 max-w-4xl truncate">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-[#A3E635] animate-pulse' : 'bg-amber-400'}`}></div>
          <span className="font-bold text-[#A3E635] tracking-tight">{t.appName || 'IP-SAKTI Sahayak'}</span>
          <span className="text-emerald-300/40">|</span>
          <span className="text-emerald-100 text-xs truncate">
            {isDoctor ? `Dr. Mode Active • ${currentUser?.clinicName || 'Ayurvedic Practice'}` : (t.emergencyNotice || 'Ayurvedic Clinical Diagnostics, Prescriptions & IP Support')}
          </span>
        </div>
        <div className="flex items-center gap-4 text-emerald-200/90 text-xs shrink-0 font-sans">
          <div className="hidden md:flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-md border border-white/10 text-[11px]">
            <span className="text-slate-400">Emergency:</span>
            <strong className="text-white font-bold">112</strong>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">AYUSH Helpline:</span>
            <strong className="text-[#A3E635] font-bold">1800-11-22-02</strong>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setCurrentTab(isDoctor ? 'doctor' : 'nidan')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#1E3A2F] flex items-center justify-center text-[#A3E635] shadow-sm ring-1 ring-[#A3E635]/30 group-hover:scale-105 transition-transform">
              <span className="font-bold text-base">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white">
                  IP-SAKTI
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {isDoctor ? (t.doctorMode || 'Doctor Mode') : (t.patientMode || 'Patient Mode')}
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-slate-500 dark:text-slate-400 hidden sm:block">
                {isDoctor ? (t.doctorModeSubtitle || 'Clinical Prescriptions, Food Routines & Patient Management') : (t.patientModeSubtitle || 'Ayurvedic Diagnostics, Dinacharya & Prescription Sync')}
              </p>
            </div>
          </div>

          {/* Controls: RAG / WS Status, User Profile Pill, Language & Theme Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Real-time WS Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 uppercase tracking-tight">
              <Radio className={`w-3 h-3 ${wsConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              <span>{wsConnected ? (t.liveSyncActive || 'Live Sync Active') : (t.offlineMode || 'Offline Mode')}</span>
            </div>

            {/* User Account / Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 pl-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:text-emerald-700 text-left"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <div className="truncate max-w-[110px] hidden sm:block">
                    <span className="block truncate">{currentUser.name}</span>
                    <span className="text-[9px] text-stone-500 font-mono block">@{currentUser.username || 'user'}</span>
                  </div>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                    isDoctor 
                      ? 'bg-lime-400 text-emerald-950' 
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {currentUser.role === 'doctor' ? (t.vaidyaRole || 'Doctor') : (t.patientRole || 'Patient')}
                  </span>
                </button>
                <button
                  id="user-logout-btn"
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="open-auth-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#A3E635]" />
                <span>{t.signInRegister || 'Sign In / Register'}</span>
              </button>
            )}

            {/* Language Quick Selector */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-lg border border-stone-200 dark:border-stone-700/60 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 ml-1.5 mr-1 hidden sm:inline" />
              <select
                id="language-select"
                aria-label="Select Interface Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-stone-800 dark:text-stone-200 py-0.5 px-1.5 rounded text-xs font-bold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-stone-900 text-stone-900 dark:text-white">
                    {lang.nativeName} ({lang.code.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#A3E635]" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none border-t border-stone-100 dark:border-stone-800 pt-2 font-medium">
          {/* 1. Doctor Portal Tab */}
          <button
            id="nav-doctor-tab"
            onClick={() => setCurrentTab('doctor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'doctor'
                ? 'bg-[#1E3A2F] text-white shadow-sm ring-1 ring-[#A3E635]/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${currentTab === 'doctor' ? 'bg-[#A3E635]' : 'bg-stone-400'}`}></div>
            <Award className={`w-4 h-4 ${currentTab === 'doctor' ? 'text-[#A3E635]' : 'text-lime-600'}`} />
            <span>{t.tabDoctorPortal || 'Doctor & Clinic Portal'}</span>
            <span className="text-[9px] bg-lime-400 text-emerald-950 font-extrabold px-1.5 py-0.2 rounded uppercase">
              {t.doctorMode || 'Doctor Mode'}
            </span>
          </button>

          {/* 2. Patient Prescriptions & Doctor Sync Tab */}
          <button
            id="nav-prescriptions-tab"
            onClick={() => setCurrentTab('prescriptions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'prescriptions'
                ? 'bg-[#1E3A2F] text-white shadow-sm ring-1 ring-[#A3E635]/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${currentTab === 'prescriptions' ? 'bg-[#A3E635]' : 'bg-stone-400'}`}></div>
            <FileCheck2 className={`w-4 h-4 ${currentTab === 'prescriptions' ? 'text-[#A3E635]' : 'text-emerald-600'}`} />
            <span>{t.tabPrescriptions || 'My Prescriptions & Diet Sync'}</span>
            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-extrabold px-1.5 py-0.2 rounded uppercase">
              {t.syncDataBtn || 'Sync'}
            </span>
          </button>

          {/* 3. Symptom Checker */}
          <button
            id="nav-nidan-tab"
            onClick={() => setCurrentTab('nidan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'nidan'
                ? 'bg-[#1E3A2F] text-white shadow-sm ring-1 ring-[#A3E635]/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${currentTab === 'nidan' ? 'bg-[#A3E635]' : 'bg-stone-400'}`}></div>
            <Stethoscope className={`w-4 h-4 ${currentTab === 'nidan' ? 'text-[#A3E635]' : ''}`} />
            <span>{t.tabVaidyaNidan || 'Vaidya Nidan (Checker)'}</span>
          </button>

          {/* 4. Dinacharya Routine */}
          <button
            id="nav-dinacharya-tab"
            onClick={() => setCurrentTab('dinacharya')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'dinacharya'
                ? 'bg-[#1E3A2F] text-white shadow-sm ring-1 ring-[#A3E635]/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${currentTab === 'dinacharya' ? 'bg-[#A3E635]' : 'bg-stone-400'}`}></div>
            <Clock className={`w-4 h-4 ${currentTab === 'dinacharya' ? 'text-[#A3E635]' : ''}`} />
            <span>{t.tabDinacharya || 'Daily Dinacharya Planner'}</span>
          </button>

          {/* 5. IP-SAKTI RAG Desk */}
          <button
            id="nav-ipsakti-tab"
            onClick={() => setCurrentTab('ipsakti')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'ipsakti'
                ? 'bg-[#1E3A2F] text-white shadow-sm ring-1 ring-[#A3E635]/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${currentTab === 'ipsakti' ? 'bg-[#A3E635]' : 'bg-stone-400'}`}></div>
            <FileText className={`w-4 h-4 ${currentTab === 'ipsakti' ? 'text-[#A3E635]' : ''}`} />
            <span>{t.tabIpSakti || 'IP-SAKTI RAG'}</span>
          </button>

          {/* 6. Clinics Directory */}
          <button
            id="nav-clinics-tab"
            onClick={() => setCurrentTab('clinics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'clinics'
                ? 'bg-[#1E3A2F] text-white shadow-sm ring-1 ring-[#A3E635]/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${currentTab === 'clinics' ? 'bg-[#A3E635]' : 'bg-stone-400'}`}></div>
            <MapPin className={`w-4 h-4 ${currentTab === 'clinics' ? 'text-[#A3E635]' : ''}`} />
            <span>{t.tabClinics || 'AYUSH Clinics'}</span>
          </button>

          {/* 7. Herb Knowledge */}
          <button
            id="nav-knowledge-tab"
            onClick={() => setCurrentTab('knowledge')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              currentTab === 'knowledge'
                ? 'bg-[#1E3A2F] text-white shadow-sm ring-1 ring-[#A3E635]/30'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${currentTab === 'knowledge' ? 'bg-[#A3E635]' : 'bg-stone-400'}`}></div>
            <BookOpen className={`w-4 h-4 ${currentTab === 'knowledge' ? 'text-[#A3E635]' : ''}`} />
            <span>{t.tabKnowledge || 'Herb Knowledge'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
