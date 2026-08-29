import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SymptomChecker } from './components/SymptomChecker';
import { DinacharyaRoutinePlanner } from './components/DinacharyaRoutinePlanner';
import { IPSaktiDesk } from './components/IPSaktiDesk';
import { ClinicsDirectory } from './components/ClinicsDirectory';
import { HerbRepository } from './components/HerbRepository';
import { DoctorPortal } from './components/DoctorPortal';
import { PatientPrescriptionsView } from './components/PatientPrescriptionsView';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { 
  SupportedLanguage, 
  DiseaseAssessmentResult, 
  UserProfile, 
  DailyRoutineSchedule, 
  DoctorPrescription,
  RoutineScheduleItem
} from './types';
import { Bell, Check, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ipsakti_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState<'nidan' | 'prescriptions' | 'dinacharya' | 'ipsakti' | 'clinics' | 'knowledge' | 'doctor'>('nidan');
  const [latestAssessment, setLatestAssessment] = useState<DiseaseAssessmentResult | null>(null);
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ipsakti_user_session');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    // Default logged in patient: Debdoot Dan
    return {
      id: 'usr_patient_debdoot',
      username: 'debdoot',
      name: 'Debdoot Dan',
      email: 'debdoot@ayush.in',
      phone: '+91 98301 23456',
      address: '12 Raja Rammohan Roy Road, Amherst Street, Kolkata, WB 700009',
      role: 'patient',
      prakriti: 'Pitta-Kapha',
      age: 28,
      gender: 'Male',
      createdAt: new Date().toISOString(),
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'patient' | 'doctor'>('patient');

  // Live Toast for new synced prescription
  const [liveToast, setLiveToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    prescription?: DoctorPrescription;
  }>({ show: false, title: '', message: '' });

  // WebSocket Live State
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ipsakti_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ipsakti_theme', 'light');
    }
  }, [isDarkMode]);

  // WebSocket setup with resilient heartbeat & clean reconnection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let heartbeatInterval: any = null;
    let isDisposed = false;

    const connectWebSocket = () => {
      if (isDisposed) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isDisposed) return;
          setWsConnected(true);
          try {
            socket?.send(JSON.stringify({ 
              type: 'REGISTER', 
              userId: currentUser?.id || 'guest',
              username: currentUser?.username || 'guest',
              role: currentUser?.role || 'patient'
            }));
          } catch (e) {}

          // Start heartbeat every 20s
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          heartbeatInterval = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              try {
                socket.send(JSON.stringify({ type: 'ping' }));
              } catch (e) {}
            }
          }, 20000);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'WELCOME' || data.type === 'REGISTERED' || data.type === 'connected') {
              setWsConnected(true);
            } else if (data.type === 'NEW_PRESCRIPTION') {
              const rx: DoctorPrescription = data.prescription;
              // Check if relevant to this patient
              const isForMe = !currentUser?.username || rx.patientUsername.toLowerCase() === currentUser.username.toLowerCase();
              if (isForMe) {
                setLiveToast({
                  show: true,
                  title: `New Prescription & Routine Issued by ${rx.doctorName}`,
                  message: `Diagnosis: ${rx.diagnosis} • Fee: ${rx.consultationFee} • Click to view updated food & yoga chart.`,
                  prescription: rx,
                });
                try {
                  confetti({
                    particleCount: 50,
                    spread: 80,
                    origin: { y: 0.2 },
                    colors: ['#059669', '#a3e635', '#f59e0b'],
                  });
                } catch (e) {}
              }
            }
          } catch (e) {}
        };

        socket.onerror = () => {};

        socket.onclose = () => {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          if (isDisposed) return;
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 4000);
        };
      } catch (err) {
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      isDisposed = true;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) {
        try {
          socket.close();
        } catch (e) {}
      }
    };
  }, [currentUser?.username, currentUser?.id]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('ipsakti_user_session', JSON.stringify(user));
    if (user.role === 'doctor') {
      setCurrentTab('doctor');
    } else {
      setCurrentTab('prescriptions');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ipsakti_user_session');
  };

  const handleUpdateUserRoutine = (routine: DailyRoutineSchedule) => {
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        savedRoutines: [routine, ...(currentUser.savedRoutines || []).filter(r => r.id !== routine.id)],
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('ipsakti_user_session', JSON.stringify(updatedUser));
    }
  };

  const handleNavigateToClinics = () => {
    setCurrentTab('clinics');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyPrescriptionRoutineToDinacharya = (items: RoutineScheduleItem[]) => {
    const routine: DailyRoutineSchedule = {
      id: 'routine-' + Date.now(),
      userId: currentUser?.id || 'usr-patient-01',
      wakeUpTime: '06:00',
      breakfastTime: '08:30',
      lunchTime: '13:00',
      eveningTime: '17:30',
      dinnerTime: '19:30',
      bedTime: '22:00',
      healthFocus: 'Doctor Prescribed Clinical Recovery & Agni Balance',
      prakritiTarget: currentUser?.prakriti || 'Pitta-Kapha',
      generatedDate: new Date().toISOString().split('T')[0],
      waterIntakeTargetLiters: 2.5,
      items: items,
      specialGuidance: [
        'Routine aligned with Doctor Clinical Prescription & Classical Chronobiology.',
        'Take prescribed Aushadhi with appropriate Anupana vehicle.',
        'Avoid incompatible food combinations (Viruddha Ahara).',
      ],
    };
    handleUpdateUserRoutine(routine);
    setCurrentTab('dinacharya');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      {/* Real-time Toast Notification */}
      {liveToast.show && (
        <div className="fixed top-20 right-4 z-50 max-w-md w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white shadow-2xl border border-lime-400/40 animate-slideDown">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2 rounded-xl bg-lime-400/20 text-lime-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-lime-300">{liveToast.title}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{liveToast.message}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('prescriptions');
                    setLiveToast({ ...liveToast, show: false });
                  }}
                  className="px-3 py-1 rounded-lg bg-lime-400 text-emerald-950 font-bold text-xs hover:bg-lime-300 transition-colors cursor-pointer"
                >
                  View Prescription Slip & Routine
                </button>
                <button
                  type="button"
                  onClick={() => setLiveToast({ ...liveToast, show: false })}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => setLiveToast({ ...liveToast, show: false })}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthModalInitialRole(currentUser?.role === 'doctor' ? 'doctor' : 'patient');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        wsConnected={wsConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'doctor' && (
          <DoctorPortal
            currentUser={currentUser}
            language={language}
            latestAssessment={latestAssessment}
            onPrescriptionCreated={() => {
              // auto refresh prescriptions
            }}
          />
        )}

        {currentTab === 'prescriptions' && (
          <PatientPrescriptionsView
            currentUser={currentUser}
            language={language}
            onApplyToDinacharya={handleApplyPrescriptionRoutineToDinacharya}
            onNavigateToDinacharya={() => setCurrentTab('dinacharya')}
          />
        )}

        {currentTab === 'nidan' && (
          <SymptomChecker
            language={language}
            onNavigateToClinics={handleNavigateToClinics}
            onSaveAssessment={(assessment) => setLatestAssessment(assessment)}
          />
        )}

        {currentTab === 'dinacharya' && (
          <DinacharyaRoutinePlanner
            language={language}
            currentUser={currentUser}
            onUpdateUserRoutine={handleUpdateUserRoutine}
          />
        )}

        {currentTab === 'ipsakti' && (
          <IPSaktiDesk language={language} />
        )}

        {currentTab === 'clinics' && (
          <ClinicsDirectory language={language} />
        )}

        {currentTab === 'knowledge' && (
          <HerbRepository language={language} />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        language={language}
        initialRole={authModalInitialRole}
      />

      {/* Footer with AYUSH & Legal Disclaimer */}
      <Footer language={language} />
    </div>
  );
}
