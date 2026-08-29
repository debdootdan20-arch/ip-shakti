import React, { useState } from 'react';
import { 
  User, Lock, Mail, ShieldCheck, Phone, MapPin, 
  Building, IndianRupee, Award, CheckCircle2, 
  X, Sparkles, LogIn, UserPlus, KeyRound, ArrowRight, Check, Stethoscope
} from 'lucide-react';
import { UserProfile, SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  language: SupportedLanguage;
  initialRole?: 'patient' | 'doctor';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  language,
  initialRole = 'patient',
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<'patient' | 'doctor'>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Verification Step state
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState('');
  const [otpDestination, setOtpDestination] = useState('');
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  // Common Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [password, setPassword] = useState('');
  const [prakriti, setPrakriti] = useState<string>('Pitta-Kapha');

  // Doctor Specific Fields
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [consultationFee, setConsultationFee] = useState('₹800');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specialization, setSpecialization] = useState('Kayachikitsa & General Ayurveda');
  const [qualification, setQualification] = useState('BAMS, MD (Ayurveda)');

  // Login Field
  const [loginIdentifier, setLoginIdentifier] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  const handleSendOtpAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const targetDestination = phone.trim() || email.trim();
    if (!targetDestination) {
      setErrorMsg('Please provide a valid registered mobile number or email address for verification.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: targetDestination }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification OTP');
      }

      setGeneratedDemoOtp(data.demoOtp || '123456');
      setOtpDestination(targetDestination);

      // Save pending registration payload
      setPendingUserData({
        name,
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        email,
        phone,
        address,
        age: Number(age) || 28,
        gender,
        password,
        role: activeRoleTab,
        prakriti,
        clinicName,
        clinicAddress,
        consultationFee,
        registrationNumber,
        specialization,
        qualification,
      });

      setIsVerifyingOtp(true);
      setSuccessMsg(`Verification code sent to ${targetDestination}. Enter it below to activate your account.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error triggering verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Verify OTP
      const otpRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: otpDestination,
          code: otpCode,
        }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) {
        throw new Error(otpData.error || 'Invalid OTP code');
      }

      // 2. Finalize Registration
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingUserData),
      });
      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.error || 'Registration failed');
      }

      onLoginSuccess(regData.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSwitch = async (demoUsernameOrEmail: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: demoUsernameOrEmail, password: 'demo' }),
      });
      const data = await res.json();
      if (data.user) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg('Failed to switch demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div 
        id="auth-modal-card"
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-lime-300 border border-emerald-500/30">
              {activeRoleTab === 'doctor' ? (
                <Stethoscope className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {isVerifyingOtp ? 'Verify Mobile / Email' : authMode === 'login' ? 'Sign In to IP-SAKTI' : 'Create Account'}
                </h2>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-lime-400 text-emerald-950">
                  {activeRoleTab === 'doctor' ? 'Doctor Mode' : 'Patient Mode'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                {activeRoleTab === 'doctor' 
                  ? 'Ayurvedic Vaidya & Clinic Registration Portal' 
                  : 'Ayurvedic Patient Profile & Prescription Sync'}
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role & Mode Switchers (When not on OTP screen) */}
        {!isVerifyingOtp && (
          <div className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80 p-2 space-y-2 shrink-0">
            {/* Role Mode Selector */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-xl">
              <button
                type="button"
                id="select-patient-mode-btn"
                onClick={() => { setActiveRoleTab('patient'); setErrorMsg(''); }}
                className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeRoleTab === 'patient'
                    ? 'bg-white dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shadow-sm border border-emerald-500/20'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Patient Mode
              </button>
              <button
                type="button"
                id="select-doctor-mode-btn"
                onClick={() => { setActiveRoleTab('doctor'); setErrorMsg(''); }}
                className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeRoleTab === 'doctor'
                    ? 'bg-white dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shadow-sm border border-emerald-500/20'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
                Doctor Mode
              </button>
            </div>

            {/* Login / Sign Up Tabs */}
            <div className="flex border-t border-stone-200/80 dark:border-stone-800/80 pt-1.5">
              <button
                id="auth-tab-login"
                onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'text-emerald-800 dark:text-emerald-400 border-b-2 border-emerald-600 font-extrabold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Sign In
              </button>
              <button
                id="auth-tab-signup"
                onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'signup'
                    ? 'text-emerald-800 dark:text-emerald-400 border-b-2 border-emerald-600 font-extrabold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Create New Account (with OTP)
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800 animate-shake">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {successMsg}
            </div>
          )}

          {/* 1. OTP Verification Screen */}
          {isVerifyingOtp ? (
            <form onSubmit={handleVerifyOtpAndCompleteSignup} className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 mx-auto flex items-center justify-center text-emerald-800 dark:text-emerald-300">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Enter 6-Digit Verification Code
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
                  A verification OTP was dispatched to registered mobile/email: <strong className="text-emerald-700 dark:text-emerald-300">{otpDestination}</strong>
                </p>

                {generatedDemoOtp && (
                  <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-dashed border-emerald-300 dark:border-emerald-700 inline-flex items-center gap-2 text-xs">
                    <span className="text-stone-500">Demo Code:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-lime-400 tracking-wider text-sm">{generatedDemoOtp}</span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedDemoOtp)}
                      className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold hover:bg-emerald-200 cursor-pointer"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Verification Code (OTP)
                </label>
                <input
                  id="otp-code-input"
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 654321"
                  className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsVerifyingOtp(false)}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Back
                </button>
                <button
                  id="submit-verify-otp-btn"
                  type="submit"
                  disabled={loading || otpCode.length < 4}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-lime-300" />
                  {loading ? 'Verifying...' : 'Verify & Activate Account'}
                </button>
              </div>
            </form>
          ) : authMode === 'login' ? (
            /* 2. Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Username, Registered Mobile, or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="login-identifier-input"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={activeRoleTab === 'doctor' ? "e.g. dr_ananya or dr.ananya@ayush.gov.in" : "e.g. debdoot or +91 98301 23456"}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <button
                id="submit-login-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-lime-300" />
                {loading ? 'Authenticating...' : `Sign In as ${activeRoleTab === 'doctor' ? 'Doctor' : 'Patient'}`}
              </button>
            </form>
          ) : (
            /* 3. Signup Form (Patient vs Doctor) */
            <form onSubmit={handleSendOtpAndProceed} className="space-y-3">
              {/* User / Doctor Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {activeRoleTab === 'doctor' ? "Doctor Full Name & Credentials *" : "Patient Full Name *"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={activeRoleTab === 'doctor' ? "e.g. Dr. Ananya Mukherjee, MD (Ayu)" : "e.g. Debdoot Dan"}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Unique Username * (used by doctors to issue prescriptions)
                </label>
                <div className="relative">
                  <span className="text-stone-400 absolute left-3 top-2 text-xs font-mono">@</span>
                  <input
                    id="register-username-input"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={activeRoleTab === 'doctor' ? "dr_ananya" : "debdoot"}
                    className="w-full pl-8 pr-3 py-2 text-xs font-mono bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Registered Mobile No. *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      id="register-phone-input"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98301 23456"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="debdoot@ayush.in"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {activeRoleTab === 'doctor' ? "Doctor Residential / Official Address *" : "Patient Address *"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="register-address-input"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 12 Raja Rammohan Roy Road, Kolkata, WB 700009"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Age and Gender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    {activeRoleTab === 'doctor' ? "Age (Years) *" : "Patient's Age (Years) *"}
                  </label>
                  <input
                    id="register-age-input"
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Gender *
                  </label>
                  <select
                    id="register-gender-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Non-Binary</option>
                  </select>
                </div>
              </div>

              {/* Patient Prakriti Constitutional Selection */}
              {activeRoleTab === 'patient' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Ayurvedic Prakriti (Constitutional Type)
                  </label>
                  <select
                    id="register-prakriti-select"
                    value={prakriti}
                    onChange={(e) => setPrakriti(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  >
                    <option value="Pitta-Kapha">Pitta-Kapha (Moderate frame, strong digestion, balanced endurance)</option>
                    <option value="Vata-Pitta">Vata-Pitta (Slender, agile, sharp intellect, active metabolism)</option>
                    <option value="Vata-Kapha">Vata-Kapha (Variable appetite, calm disposition, sensitive to cold)</option>
                    <option value="Tridosha">Tridoshaja (Sama Prakriti - Equal equilibrium of Vata, Pitta, Kapha)</option>
                    <option value="Vata">Vata Dominant (Light build, dry skin, fast-moving thoughts)</option>
                    <option value="Pitta">Pitta Dominant (Medium build, sharp gaze, warm body temperature)</option>
                    <option value="Kapha">Kapha Dominant (Solid build, oily skin, steady endurance)</option>
                  </select>
                </div>
              )}

              {/* Doctor Specific Fields */}
              {activeRoleTab === 'doctor' && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    Ayurvedic Clinic & Practice Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-0.5">
                        Clinic / Hospital Name *
                      </label>
                      <input
                        id="register-clinic-name-input"
                        type="text"
                        required
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="e.g. Sanjeevani Ayurvedic Chikitsalaya"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-0.5">
                        Fees for a Session (₹) *
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                        <input
                          id="register-fee-input"
                          type="text"
                          required
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(e.target.value)}
                          placeholder="e.g. ₹800"
                          className="w-full pl-7 pr-2.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-lime-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-0.5">
                      Clinic Address *
                    </label>
                    <input
                      id="register-clinic-address-input"
                      type="text"
                      required
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      placeholder="e.g. Block CF-32, Sector 1, Salt Lake City, Kolkata - 700064"
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-0.5">
                        State / AYUSH Reg No. *
                      </label>
                      <input
                        id="register-reg-no-input"
                        type="text"
                        required
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. WB-AYU-2018-9481"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-0.5">
                        Specialization
                      </label>
                      <input
                        id="register-specialization-input"
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Kayachikitsa & Panchakarma"
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>

              <button
                id="submit-register-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-lime-300" />
                {loading ? 'Sending Verification Code...' : 'Proceed to OTP Verification'}
              </button>
            </form>
          )}

          {/* Quick 1-Click Demo Profiles */}
          {!isVerifyingOtp && (
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                Quick 1-Click Demo Profiles:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  id="quick-demo-debdoot"
                  onClick={() => handleQuickDemoSwitch('debdoot')}
                  className="p-2 text-left rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                >
                  <span className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 truncate">
                    Debdoot Dan
                  </span>
                  <span className="block text-[9px] text-emerald-700 dark:text-emerald-400">Patient (@debdoot)</span>
                </button>

                <button
                  type="button"
                  id="quick-demo-rajesh"
                  onClick={() => handleQuickDemoSwitch('rajesh_sharma')}
                  className="p-2 text-left rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                >
                  <span className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 truncate">
                    Rajesh Sharma
                  </span>
                  <span className="block text-[9px] text-emerald-700 dark:text-emerald-400">Patient (@rajesh)</span>
                </button>

                <button
                  type="button"
                  id="quick-demo-doctor-ananya"
                  onClick={() => handleQuickDemoSwitch('dr_ananya')}
                  className="p-2 text-left rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer"
                >
                  <span className="block text-[11px] font-bold text-teal-900 dark:text-teal-300 truncate">
                    Dr. Ananya MD
                  </span>
                  <span className="block text-[9px] text-teal-700 dark:text-teal-400">Doctor (₹800/session)</span>
                </button>

                <button
                  type="button"
                  id="quick-demo-doctor-aravind"
                  onClick={() => handleQuickDemoSwitch('dr_aravind')}
                  className="p-2 text-left rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors cursor-pointer"
                >
                  <span className="block text-[11px] font-bold text-cyan-900 dark:text-cyan-300 truncate">
                    Dr. Aravind MD
                  </span>
                  <span className="block text-[9px] text-cyan-700 dark:text-cyan-400">Doctor (₹1200/session)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
