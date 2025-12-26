
import React from 'react';
import { AppLog, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LogsViewProps {
  language: Language;
  logs: AppLog[];
}

const LogsView: React.FC<LogsViewProps> = ({ language, logs }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">{t.navLogs}</h2>
        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase">
          Local Database (SQLite simulation)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">{t.logTime}</th>
              <th className="px-6 py-4">{t.logAction}</th>
              <th className="px-6 py-4">{t.logDetails}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                  No logs recorded yet.
                </td>
              </tr>
            ) : (
              [...logs].reverse().map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsView;
