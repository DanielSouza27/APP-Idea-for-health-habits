
import React from 'react';
import { AppLog, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ActivityViewProps {
  language: Language;
  logs: AppLog[];
}

const ActivityView: React.FC<ActivityViewProps> = ({ language, logs }) => {
  const t = TRANSLATIONS[language];

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('agenda')) return 'fa-calendar-plus text-indigo-500';
    if (act.includes('health') || act.includes('workout')) return 'fa-bolt text-rose-500';
    if (act.includes('recovery')) return 'fa-medal text-emerald-500';
    if (act.includes('ai') || act.includes('research')) return 'fa-sparkles text-amber-500';
    if (act.includes('smart')) return 'fa-lightbulb text-amber-400';
    return 'fa-circle-dot text-slate-400';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            {t.navActivity}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {logs.length} events tracked
          </p>
        </div>
      </div>

      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200 ml-[-0.5px]"></div>

        {logs.length === 0 ? (
          <div className="text-center py-20 opacity-30 italic">
            <p className="text-sm font-bold uppercase tracking-widest">No activity yet</p>
          </div>
        ) : (
          [...logs].reverse().map((log, idx) => (
            <div 
              key={log.id} 
              className="relative flex gap-6 items-start group animate-in fade-in slide-in-from-left-4"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="z-10 w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                <i className={`fa-solid ${getActionIcon(log.action)} text-lg`}></i>
              </div>
              
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{log.action}</h4>
                  <span className="text-[10px] font-bold text-slate-300">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:border-indigo-100 transition-colors">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {log.details}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityView;
