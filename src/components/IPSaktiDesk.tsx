import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Scale, Sparkles, Send, BookOpen, AlertTriangle, 
  CheckCircle2, Copy, Download, RefreshCw, ChevronRight, Layers, Globe, 
  Search, Cpu, ArrowRight, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SupportedLanguage, RAGMessage, IPPatentAnalysis } from '../types';
import { translations } from '../i18n/translations';
import { getSamplePatentCases, APP_IMAGES } from '../data/ayurvedaData';

interface IPSaktiDeskProps {
  language: SupportedLanguage;
}

export const IPSaktiDesk: React.FC<IPSaktiDeskProps> = ({ language }) => {
  const t = translations[language] || translations.en;
  const samplePatentCases = getSamplePatentCases(language);

  const getInitialMessages = (lang: SupportedLanguage): RAGMessage[] => {
    const tr = translations[lang] || translations.en;
    return [
      {
        id: 'rag-welcome',
        sender: 'assistant',
        content: tr.ragDefaultWelcome || `Welcome to **IP-SAKTI Sahayak (Ayurvedic Intellectual Property & Regulatory RAG Assistant)**.
I am grounded in:
1. **Indian Patents Act, 1970**: Section 3(p) [Traditional Knowledge exclusion], Section 3(d) [Efficacy enhancement], Section 3(e) [Synergistic non-obvious combinations].
2. **TKDL (Traditional Knowledge Digital Library)**: Over 400,000 formulations from classical Sanskrit Samhitas and Nighantus.
3. **Biological Diversity Act, 2002**: National Biodiversity Authority (NBA) Form 1 & Form 3 Access & Benefit Sharing (ABS) mandates.
4. **US FDA**: 21 CFR 111 (Dietary Supplement cGMP) & 21 CFR 312 (Botanical Drug Guidance).
5. **EMA HMPC**: Traditional Herbal Medicinal Products Directive (2004/24/EC).

How can I assist your patent filing, formulation novelty assessment, or global export compliance today?`,
        timestamp: new Date().toISOString(),
        citations: [
          {
            title: tr.ragCitation1Title || 'Section 3(p) Patents Act 1970',
            statuteOrDoc: tr.ragCitation1Statute || 'Indian Patent Office Guidelines for Traditional Knowledge',
            section: 'Section 3(p)',
            summary: tr.ragCitation1Summary || 'Inventions which are traditional knowledge are excluded from patentability.',
          },
          {
            title: tr.ragCitation2Title || 'CSIR Landmark Revocations',
            statuteOrDoc: tr.ragCitation2Statute || 'TKDL Case Laws',
            section: 'US Patent 5,401,504 (Turmeric) & EP 0436257 (Neem)',
            summary: tr.ragCitation2Summary || 'Landmark cases where classical Sanskrit citations successfully revoked foreign patents.',
          },
        ],
      },
    ];
  };

  const [activeMode, setActiveMode] = useState<'rag-chat' | 'patent-assessor' | 'global-matrix'>('rag-chat');
  
  // RAG Chat State
  const [messages, setMessages] = useState<RAGMessage[]>(() => getInitialMessages(language));
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Update initial message on language change if no chat has taken place
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'rag-welcome') {
        return getInitialMessages(language);
      }
      return prev;
    });
  }, [language]);

  // Patent Assessor State
  const [inventionTitle, setInventionTitle] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [indicationText, setIndicationText] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [patentResult, setPatentResult] = useState<IPPatentAnalysis | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const quickPrompts = [
    t.quickPrompt1 || 'How to overcome Section 3(p) non-patentability for an Ashwagandha extract?',
    t.quickPrompt2 || 'What are the mandatory NBA approval rules for filing herbal patents in India?',
    t.quickPrompt3 || 'Exporting Ayurvedic products to USA: 21 CFR 111 cGMP vs Botanical Drug NDA',
    t.quickPrompt4 || 'How does TKDL prior-art citation invalidate international patent filings?',
    t.quickPrompt5 || 'FSSAI Ayurvedic Aahar Regulations 2022 vs AYUSH Manufacturing License',
  ];

  const handleSendChat = async (queryToSend?: string) => {
    const text = queryToSend || chatInput;
    if (!text.trim() || isChatLoading) return;

    const userMsg: RAGMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ip-sakti-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          query: text,
          language,
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (err) {
      console.error('RAG query failed:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          content: 'Unable to connect to the IP-SAKTI RAG knowledge base. Please check connection and retry.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSamplePatent = (sample: ReturnType<typeof getSamplePatentCases>[0]) => {
    setInventionTitle(sample.title);
    setIngredientsText(sample.ingredients);
    setIndicationText(sample.indication);
  };

  const handleEvaluatePatent = async () => {
    if (!inventionTitle.trim() || !ingredientsText.trim()) return;

    setIsAssessing(true);
    setPatentResult(null);

    try {
      const response = await fetch('/api/ip-sakti-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'patent-novelty-check',
          formulation: {
            title: inventionTitle,
            ingredients: ingredientsText,
            indication: indicationText,
          },
          language,
        }),
      });

      const data = await response.json();
      setPatentResult(data);
      try {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#d97706', '#059669', '#1e3a8a'],
        });
      } catch (e) {}
    } catch (err) {
      console.error('Patent evaluation failed:', err);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleCopyClaims = () => {
    if (!patentResult) return;
    const text = patentResult.draftPatentClaims.map(c => `Claim ${c.claimNumber} (${c.claimType}):\n${c.claimText}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Card for IP-SAKTI Desk */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-[#1E3A2F] text-white">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <img
            src={APP_IMAGES.regulatoryLab}
            alt="Ayurvedic Regulatory and Laboratory Research"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative p-6 sm:p-8 md:p-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 text-[#A3E635] text-xs font-bold uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-sm">
            <Scale className="w-3.5 h-3.5 text-[#A3E635]" />
            {t.ipDeskHeroBadge || 'IP-SAKTI • Source-Cited Legal & Regulatory Intelligence'}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            {t.ipDeskTitle}
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            {t.ipDeskSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200/90 font-medium">
            <span className="bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              {t.section3pClearance || '⚖️ Section 3(p) Clearance Engine'}
            </span>
            <span className="bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              {t.tkdlGroundedChip || '📚 400,000+ TKDL Formulations Grounded'}
            </span>
            <span className="bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              {t.usFdaStandardsChip || '🌐 US FDA 21 CFR 111 / EMA HMPC Standards'}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-3 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveMode('rag-chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeMode === 'rag-chat'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
          {t.ragChatTab || 'RAG Legal & Regulatory Chat Assistant'}
        </button>

        <button
          onClick={() => setActiveMode('patent-assessor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeMode === 'patent-assessor'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
          {t.patentAssessorTab || 'Patentability & TKDL Novelty Assessor Tool'}
        </button>

        <button
          onClick={() => setActiveMode('global-matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeMode === 'global-matrix'
              ? 'border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
          {t.globalMatrixTab || 'Global Herbal Export & Compliance Matrix'}
        </button>
      </div>

      {/* MODE 1: RAG Chat Assistant */}
      {activeMode === 'rag-chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Interface (8 Cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Chat Messages Viewport */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">
                      {msg.content}
                    </div>

                    {/* Citations Box */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-[#A3E635] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" /> {t.citedLegalSources || 'Cited Legal & Regulatory Sources:'}
                        </div>
                        <div className="space-y-1.5">
                          {msg.citations.map((cite, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2.5 rounded-lg bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800"
                            >
                              <div className="font-bold text-emerald-800 dark:text-emerald-300">
                                ⚖️ {cite.title} ({cite.section})
                              </div>
                              <div className="text-slate-600 dark:text-slate-300 mt-0.5 text-[11px]">
                                {cite.summary}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Regulatory Matrix preview */}
                    {msg.regulatoryMatrix && msg.regulatoryMatrix.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-[#A3E635] uppercase tracking-wider mb-1">
                          🌐 Regulatory Pathways Overview:
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {msg.regulatoryMatrix.map((item, rIdx) => (
                            <div key={rIdx} className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="font-bold text-slate-800 dark:text-slate-200">{item.country}:</span> {item.keyRule}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-center gap-2 p-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl max-w-sm border border-slate-200 dark:border-slate-700">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>{t.searchingTkdl || 'Searching TKDL prior-art & patent statutes...'}</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.askRAGPlaceholder}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Prompt Chips & Statutory Reference Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {t.quickStatutoryQuestions || 'Quick Statutory Questions'}
              </h3>
              <div className="space-y-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendChat(prompt)}
                    className="w-full text-left p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-start gap-2 group"
                  >
                    <span className="text-emerald-600 dark:text-[#A3E635] font-bold">•</span>
                    <span className="flex-1 leading-snug">{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Core Patent Statutes Card */}
            <div className="bg-[#1E3A2F] text-white rounded-2xl p-5 border border-white/10 shadow-sm text-xs space-y-3">
              <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                <Scale className="w-4 h-4 text-[#A3E635]" />
                {t.keyIndianPatentStatutes || 'Key Indian Patent Statutes'}
              </h3>
              <div className="space-y-2 text-emerald-100/90 text-xs">
                <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
                  <strong className="text-white">Section 3(p):</strong> {t.section3pDesc || 'Excludes traditional knowledge or aggregation/duplication of known properties.'}
                </div>
                <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
                  <strong className="text-white">Section 3(e):</strong> {t.section3eDesc || 'Mere admixtures are non-patentable without proven synergistic efficacy enhancement.'}
                </div>
                <div className="p-2.5 rounded-lg bg-black/20 border border-white/10">
                  <strong className="text-white">NBA Section 6:</strong> {t.nbaSection6Desc || 'Prior approval from National Biodiversity Authority is mandatory before patent grant.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Patentability & Novelty Assessor Tool */}
      {activeMode === 'patent-assessor' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulation Input Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                {t.patentToolTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your herbal formulation, extraction technology, or synergistic compound to evaluate Section 3(p) non-patentability hurdles and global patent claim strategies:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.formulationNameLabel}
                </label>
                <input
                  type="text"
                  value={inventionTitle}
                  onChange={(e) => setInventionTitle(e.target.value)}
                  placeholder="e.g. Standardized Nanocarrier Formulation of Withania Somnifera & Boswellia Serrata"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.formulationDescLabel}
                </label>
                <textarea
                  rows={3}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="Specify standardized extracts, percentage withanolides/curcuminoids, extraction solvent (e.g. Supercritical CO2), and synergistic ratio..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.indicationLabel}
                </label>
                <input
                  type="text"
                  value={indicationText}
                  onChange={(e) => setIndicationText(e.target.value)}
                  placeholder="e.g. Targeted bioavailable anti-inflammatory therapy with cartilage protection"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleEvaluatePatent}
                  disabled={!inventionTitle.trim() || isAssessing}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-200/50 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isAssessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>{t.evaluatingPatent}</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-4 h-4 text-white" />
                      <span>{t.evaluatePatentBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Benchmark Sample Cases (5 Cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                {t.benchmarkHerbalTitle || 'Benchmark Herbal Inventions'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.benchmarkHerbalSubtitle || 'Load a benchmark case to inspect real Section 3(p) clearance, TKDL prior-art risk mapping, and claim structuring:'}
              </p>

              <div className="space-y-2.5">
                {samplePatentCases.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSamplePatent(sample)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-all space-y-1 group"
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-[#A3E635]">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {sample.ingredients}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patent Assessment Results Dashboard */}
          {patentResult && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
              {/* Header Score Overview */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {patentResult.overallPatentabilityRating}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      TKDL Prior Art Risk: <strong className="text-emerald-700 dark:text-[#A3E635]">{patentResult.tkdlPriorArtRisk.riskLevel}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {patentResult.inventionTitle}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Target Claim: <strong className="text-slate-800 dark:text-slate-200">{patentResult.targetIndication}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-[#A3E635]">{patentResult.noveltyScore}%</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Novelty Index</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{patentResult.inventiveStepScore}%</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Inventive Step</div>
                  </div>
                </div>
              </div>

              {/* Statutory Clearance & NBA Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section 3(p) Analysis */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                    Section 3(p) Clearance Strategy
                  </h3>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Statutory Provision:</strong> {patentResult.section3pHurdleAnalysis.statutoryProvision}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Overcoming Strategy:</strong> {patentResult.section3pHurdleAnalysis.overcomingStrategy}
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px] text-emerald-950 dark:text-emerald-200">
                    <strong>Synergistic Proof Required:</strong> {patentResult.section3pHurdleAnalysis.synergisticProofRequired}
                  </div>
                </div>

                {/* NBA Compliance */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                    National Biodiversity Authority (NBA) ABS Workflow
                  </h3>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Act Reference:</strong> {patentResult.nbaAbsCompliance.actReference}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Exemptions:</strong> {patentResult.nbaAbsCompliance.exemptionsApplicable}
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    {(patentResult.nbaAbsCompliance?.stepByStepProcess || []).map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Draft Patent Claims Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-[#A3E635]" />
                    AI-Drafted Patent Claims (Indian Patent Office & PCT Format)
                  </h3>
                  <button
                    onClick={handleCopyClaims}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                  >
                    {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedDraft ? 'Claims Copied!' : 'Copy Claims'}
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {(patentResult.draftPatentClaims || []).map((claim, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 leading-relaxed"
                    >
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-[#A3E635] font-sans font-bold">
                        <span>Claim {claim.claimNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800">
                          {claim.claimType} Claim
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-xs">
                        {claim.claimText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patent Blueprint Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-3 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Patent Specification Blueprint
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">Abstract:</span>
                    <p>{patentResult.patentDraftSummary.abstract}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">TKDL Differentiation:</span>
                    <p>{patentResult.patentDraftSummary.backgroundAndTKDLDifferentiation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Global Regulatory Matrix */}
      {activeMode === 'global-matrix' && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600 dark:text-[#A3E635]" />
              {t.globalMatrixTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comparative matrix for commercializing and exporting Ayurvedic formulations across major regulatory jurisdictions:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* India AYUSH & FSSAI */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  🇮🇳 India (AYUSH & FSSAI)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Origin Regime
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div><strong>Standard:</strong> Schedule T GMP / Ayurvedic Aahar Reg. 2022</div>
                <div><strong>Safety Data:</strong> Heavy metals (AAS), Microbial load, Aflatoxins</div>
                <div><strong>Claims:</strong> Classical text indications or Rule 158(B) clinical proof</div>
              </div>
            </div>

            {/* USA FDA */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  🇺🇸 USA (FDA)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  21 CFR 111
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div><strong>Pathways:</strong> Dietary Supplement (DSHEA) vs Botanical Drug NDA (21 CFR 312)</div>
                <div><strong>Claims:</strong> Structure/Function allowed; Disease claims require full NDA</div>
                <div><strong>Requirement:</strong> 75-day NDI notification if new botanical entity</div>
              </div>
            </div>

            {/* European Union EMA */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  🇪🇺 European Union (EMA)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  THMPD 2004/24/EC
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div><strong>Traditional Registration:</strong> 30 years historical safety (minimum 15 years in EU)</div>
                <div><strong>Well Established Use:</strong> 10+ years EU clinical bibliographical data</div>
                <div><strong>Quality:</strong> European Pharmacopoeia (Ph. Eur.) monographs</div>
              </div>
            </div>

            {/* UK MHRA */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  🇬🇧 UK (MHRA)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  THR Scheme
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div><strong>Framework:</strong> Traditional Herbal Registration (THR) Certification mark</div>
                <div><strong>Auditing:</strong> UK GMP inspection of manufacturing facilities in India</div>
              </div>
            </div>

            {/* GCC / Middle East */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  🇦🇪 GCC / UAE (MOHAP)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Complementary Medicine
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div><strong>Category:</strong> Registered as Herbal/Natural Health Product</div>
                <div><strong>Requirement:</strong> Halal compliance & absence of synthetic hormones</div>
              </div>
            </div>

            {/* WHO Traditional Medicine */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  🌐 WHO Global Center (Jamnagar)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  WHO TRS 902
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div><strong>Guidelines:</strong> Good Agricultural and Collection Practices (GACP)</div>
                <div><strong>Harmonization:</strong> WHO Global Centre for Traditional Medicine (GCTM)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
