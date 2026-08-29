import React, { useState } from 'react';
import { 
  MapPin, Phone, Clock, Star, ShieldCheck, Calendar, Filter, 
  Search, CheckCircle2, Award, UserCheck, X, Stethoscope
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Clinic, SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';
import { getAyurvedicClinics, APP_IMAGES } from '../data/ayurvedaData';

interface ClinicsDirectoryProps {
  language: SupportedLanguage;
}

export const ClinicsDirectory: React.FC<ClinicsDirectoryProps> = ({ language }) => {
  const t = translations[language] || translations.en;
  const clinicsList = getAyurvedicClinics(language);

  const [selectedState, setSelectedState] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClinicForBooking, setSelectedClinicForBooking] = useState<Clinic | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-08-28');
  const [consultationType, setConsultationType] = useState<'in_person' | 'tele_consult'>('in_person');

  const states = ['All', 'West Bengal', 'Maharashtra', 'Karnataka', 'Delhi NCR', 'Tamil Nadu', 'Kerala', 'Telangana'];

  const filteredClinics = clinicsList.filter((clinic) => {
    const matchesState = selectedState === 'All' || clinic.state === selectedState;
    const matchesSearch = 
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.leadVaidya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesState && matchesSearch;
  });

  const handleOpenBooking = (clinic: Clinic) => {
    setSelectedClinicForBooking(clinic);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#d97706'],
      });
    } catch (err) {}
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-500/20 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src={APP_IMAGES.doctorConsultation}
            alt="Licensed Ayurvedic Consultation"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative p-6 sm:p-8 md:p-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/30 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {t.networkBadge || 'AYUSH & NABH Certified Clinical Network'}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-50 mb-3 tracking-tight">
            {t.nearbyClinicsTitle}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {t.clinicsSubtitle || 'Locate accredited Government Ayurvedic Hospitals, classical Panchakarma research centers, and verified MD (Ayurveda) Vaidyas across India for personalized Nadi Pariksha and clinical care.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200">
            <span className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              {t.verifiedRegBadge || '✓ Verified Registration Numbers (NCISM / State Councils)'}
            </span>
            <span className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              {t.inPersonTeleBadge || '✓ In-Person & Tele-Ayurveda Slots'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchClinicsPlaceholder || "Search by hospital name, doctor, city (e.g. Kolkata, Mumbai, Delhi, Bengaluru) or therapy..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        {/* State Filter Buttons / Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-stone-500 shrink-0 hidden sm:block" />
          <span className="text-xs font-bold text-stone-600 dark:text-stone-300 shrink-0 hidden sm:block">
            {t.stateFilterLabel || 'State:'}
          </span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            aria-label="Filter clinics by State"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
          >
            {states.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? (t.allStates || 'All States (Pan-India)') : st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clinic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClinics.map((clinic) => (
          <div
            key={clinic.id}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all flex flex-col group"
          >
            {/* Clinic Card Image */}
            <div className="relative h-44 w-full bg-stone-800 overflow-hidden">
              <img
                src={clinic.image}
                alt={clinic.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-amber-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-bold border border-amber-400/20">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{clinic.rating}</span>
                <span className="text-[10px] text-slate-300 font-normal">({clinic.reviewCount})</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-emerald-950/90 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-md backdrop-blur-xs border border-emerald-500/30">
                {clinic.type}
              </div>
            </div>

            {/* Clinic Body Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base leading-snug group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                  {clinic.name}
                </h3>

                <div className="flex items-start gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{clinic.address}, <strong>{clinic.city}, {clinic.state}</strong></span>
                </div>

                {/* Lead Vaidya */}
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 text-xs space-y-0.5">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {clinic.leadVaidya}
                  </div>
                  <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                    {clinic.qualification}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    Reg: {clinic.regNumber}
                  </div>
                </div>

                {/* Services Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {clinic.services.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Fee & Booking Button */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">{t.consultationLabel || 'Consultation'}</div>
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200">{clinic.consultationFee}</div>
                </div>

                <button
                  onClick={() => handleOpenBooking(clinic)}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md"
                >
                  <Calendar className="w-3.5 h-3.5 text-lime-300" />
                  {t.bookAppointmentBtn || 'Book Appointment'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Booking Modal */}
      {selectedClinicForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setSelectedClinicForBooking(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingSuccess ? (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {t.bookAyurvedicConsultation || 'Book Ayurvedic Consultation'}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {selectedClinicForBooking.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {t.patientFullName || 'Patient Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Debdoot Sen"
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      {t.contactPhoneWhatsApp || 'Contact Phone / WhatsApp'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="+91 98300 00000"
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {t.preferredDate || 'Preferred Date'}
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {t.modeLabel || 'Mode'}
                      </label>
                      <select
                        value={consultationType}
                        onChange={(e) => setConsultationType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="in_person">{t.inPersonOpd || 'In-Person OPD / Nadi Pariksha'}</option>
                        <option value="tele_consult">{t.videoTeleConsult || 'Video Tele-Consultation'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
                    <div><strong>{t.doctorLabel || 'Doctor'}:</strong> {selectedClinicForBooking.leadVaidya}</div>
                    <div><strong>{t.timingsLabel || 'OPD Timings'}:</strong> {selectedClinicForBooking.timing}</div>
                    <div><strong>{t.feeLabel || 'Fee'}:</strong> {selectedClinicForBooking.consultationFee}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {t.confirmAppointmentSlip || 'Confirm Appointment Slip'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                  {t.appointmentConfirmed || 'Appointment Confirmed!'}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
                  Your consultation request for <strong>{patientName}</strong> on <strong>{bookingDate}</strong> has been registered with <strong>{selectedClinicForBooking.leadVaidya}</strong>. An SMS confirmation will be sent to <strong>{patientPhone}</strong>.
                </p>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 text-[11px] text-stone-500 font-mono border border-stone-200 dark:border-stone-700">
                  Booking Reference: AYU-SLOT-{Math.floor(100000 + Math.random() * 900000)}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClinicForBooking(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-stone-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  {t.closeBtn || 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
