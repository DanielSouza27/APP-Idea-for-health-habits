
import React, { useState } from 'react';
import { Language, SearchResult, AgendaItem } from '../types';
import { TRANSLATIONS } from '../constants';
import { performResearch } from '../services/geminiService';

interface ResearchViewProps {
  language: Language;
  onLogAction: (action: string, details: string) => void;
  onAddItem: (item: Omit<AgendaItem, 'id'>) => void;
}

const ResearchView: React.FC<ResearchViewProps> = ({ language, onLogAction, onAddItem }) => {
  const t = TRANSLATIONS[language];
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const data = await performResearch(query);
      setResult(data);
      onLogAction('AI Research', `Query: ${query}`);
      
      // Automatically register any actions identified by AI
      if (data.actions && data.actions.length > 0) {
        data.actions.forEach(action => {
          onAddItem({
            title: action.title,
            description: `Generated from research: ${query}`,
            type: action.type,
            date: action.date || new Date().toISOString()
          });
          onLogAction('Auto Agenda', `Added ${action.type}: ${action.title}`);
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900">{t.navResearch}</h2>
        <p className="text-slate-500">{t.searchPlaceholder}</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-14 pr-24 py-5 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none text-lg transition-all shadow-sm"
        />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
          <i className="fa-solid fa-magnifying-glass text-xl"></i>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-bold flex items-center gap-2 disabled:bg-slate-300"
        >
          {loading ? (
            <i className="fa-solid fa-circle-notch fa-spin"></i>
          ) : (
            <i className="fa-solid fa-wand-sparkles"></i>
          )}
          {loading ? '...' : 'Ask'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation"></i>
          {error}
        </div>
      )}

      {loading && !result && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-500">
          <div className="p-8 space-y-6">
            <div className="prose prose-slate max-w-none">
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {result.text}
              </div>
            </div>

            {result.actions && result.actions.length > 0 && (
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                  Auto-registered Actions
                </p>
                <ul className="space-y-1">
                  {result.actions.map((act, i) => (
                    <li key={i} className="text-xs font-bold text-indigo-700 flex items-center gap-2">
                      <i className="fa-solid fa-check-circle"></i>
                      {act.title} ({act.type})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.sources.length > 0 && (
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {t.sources}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-indigo-600 hover:bg-indigo-50 transition-colors text-xs font-semibold border border-slate-100"
                    >
                      <i className="fa-solid fa-link"></i>
                      {source.title || 'Source'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchView;
