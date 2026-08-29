import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, ChevronRight, X
} from 'lucide-react';
import { HerbKnowledgeEntry, SupportedLanguage } from '../types';
import { translations } from '../i18n/translations';
import { getHerbKnowledgeBase, APP_IMAGES } from '../data/ayurvedaData';

interface HerbRepositoryProps {
  language: SupportedLanguage;
}

export const HerbRepository: React.FC<HerbRepositoryProps> = ({ language }) => {
  const t = translations[language] || translations.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoshaFilter, setSelectedDoshaFilter] = useState('All');
  const [selectedHerb, setSelectedHerb] = useState<HerbKnowledgeEntry | null>(null);

  const herbs = useMemo(() => getHerbKnowledgeBase(language), [language]);

  const doshaFilters = ['All', 'Tridosha Shamaka', 'Vata-Kapha', 'Vata-Pitta', 'Pitta-Kapha'];

  const filteredHerbs = useMemo(() => {
    return herbs.filter((herb) => {
      const matchesSearch =
        herb.sanskritName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        herb.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        herb.botanicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        herb.therapeuticUses.some(u => u.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDosha =
        selectedDoshaFilter === 'All' ||
        herb.doshaKarma.toLowerCase().includes(selectedDoshaFilter.toLowerCase().replace(' ', ''));

      return matchesSearch && matchesDosha;
    });
  }, [herbs, searchQuery, selectedDoshaFilter]);


  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-500/20 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src={APP_IMAGES.driedHerbsRoots}
            alt="Dravyaguna Herb Repository"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative p-6 sm:p-8 md:p-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/30 backdrop-blur-sm">
            <BookOpen className="w-3.5 h-3.5 text-lime-400" />
            Dravyaguna Kosha • Classical Ayurvedic Pharmacopoeia
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-50 mb-3 tracking-tight">
            {t.herbRepositoryTitle}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {t.herbRepositorySubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-amber-200">
            <span className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-amber-500/20">
              📚 Bhavaprakasha Nighantu & API Grounding
            </span>
            <span className="bg-slate-950/60 px-3 py-1.5 rounded-lg border border-amber-500/20">
              🔍 Verified TKDL Prior-Art Classifications
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchHerbsPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-stone-600 dark:text-stone-300 shrink-0">
            {t.doshaFilterLabel}
          </span>
          <select
            value={selectedDoshaFilter}
            onChange={(e) => setSelectedDoshaFilter(e.target.value)}
            aria-label="Filter herbs by Dosha action"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
          >
            {doshaFilters.map((df) => (
              <option key={df} value={df}>
                {df}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Herb Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHerbs.map((herb) => (
          <div
            key={herb.id}
            onClick={() => setSelectedHerb(herb)}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col group"
          >
            <div className="relative h-44 w-full bg-stone-800 overflow-hidden">
              <img
                src={herb.image}
                alt={herb.sanskritName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-amber-200 text-[11px] font-mono px-2 py-0.5 rounded border border-amber-400/20">
                {herb.tkdlIdentifer.split(' ')[0]}
              </div>
              <div className="absolute bottom-3 left-3 bg-emerald-950/90 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-xs border border-emerald-500/30">
                {herb.virya}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                  {herb.sanskritName}
                </h3>
                <div className="text-xs text-stone-500 italic">
                  {herb.botanicalName} ({herb.family})
                </div>

                <div className="mt-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 text-[11px] space-y-1">
                  <div><strong>{t.doshaFilterLabel || 'Dosha:'}</strong> <span className="text-emerald-800 dark:text-emerald-300 font-medium">{herb.doshaKarma}</span></div>
                  <div><strong>Prabhava:</strong> {herb.prabhava || 'Specific Rasayana'}</div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {herb.therapeuticUses.slice(0, 2).map((use, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-800/40 font-medium"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>{t.viewFullDravyaguna}</span>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Herb Detail Modal */}
      {selectedHerb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedHerb(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
              <img
                src={selectedHerb.image}
                alt={selectedHerb.sanskritName}
                className="w-20 h-20 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0 shadow-2xs"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-300/40 dark:border-emerald-800/40">
                  {selectedHerb.family}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                  {selectedHerb.sanskritName}
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                  {selectedHerb.botanicalName} • {selectedHerb.englishName}
                </p>
              </div>
            </div>

            {/* Rasapanchaka Properties Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {t.rasapanchaka}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Rasa (Taste)</div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">{selectedHerb.rasa.join(', ')}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Guna (Quality)</div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">{selectedHerb.guna.join(', ')}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Virya (Potency)</div>
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300">{selectedHerb.virya}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold">Vipaka (Post-Digestive)</div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">{selectedHerb.vipaka}</div>
                </div>
              </div>
            </div>

            {/* Phytochemicals and Dosha Karma */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 space-y-1.5">
                <div className="font-bold text-amber-900 dark:text-amber-200">
                  {t.activeChemicals}
                </div>
                <ul className="space-y-1 text-stone-700 dark:text-stone-300">
                  {selectedHerb.keyPhytochemicals.map((chem, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{chem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  {t.therapeuticUses}
                </div>
                <ul className="space-y-1 text-stone-700 dark:text-stone-300">
                  {selectedHerb.therapeuticUses.map((use, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Classical Citations & TKDL Reference */}
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
              <div>
                <strong>{t.classicalReferences}:</strong> {selectedHerb.classicalSource}
              </div>
              <div className="text-emerald-800 dark:text-emerald-400 font-mono text-[11px]">
                <strong>{t.tkdlIdentifier}:</strong> {selectedHerb.tkdlIdentifer}
              </div>
              {selectedHerb.cautions.length > 0 && (
                <div className="text-rose-600 dark:text-rose-400 text-[11px] pt-1 border-t border-stone-200 dark:border-stone-700">
                  <strong>Precautions:</strong> {selectedHerb.cautions.join(' ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
