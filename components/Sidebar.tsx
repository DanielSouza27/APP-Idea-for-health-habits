
import React from 'react';
import { View, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, language, setLanguage }) => {
  const t = TRANSLATIONS[language];

  const menuItems = [
    { id: View.CALENDAR, label: t.navCalendar, icon: 'fa-calendar-days' },
    { id: View.AGENDA, label: t.navAgenda, icon: 'fa-list-check' },
    { id: View.RESEARCH, label: t.navResearch, icon: 'fa-magnifying-glass' },
    { id: View.CHAT, label: t.navChat, icon: 'fa-comments' },
    { id: View.HEALTH, label: t.navHealth, icon: 'fa-dumbbell' },
    { id: View.ACTIVITY, label: t.navActivity, icon: 'fa-timeline' },
  ];

  return (
    <aside className="w-56 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
      <div className="p-8">
        <h1 className="text-lg font-black text-indigo-600 flex items-center gap-3 tracking-tight uppercase">
          <i className="fa-solid fa-shapes text-xl"></i>
          <span>{t.appName}</span>
        </h1>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
                  currentView === item.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center text-xs opacity-90`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6">
        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
          <button
            onClick={() => setLanguage('pt')}
            className={`flex-1 py-1 text-[10px] rounded-lg transition-all font-bold ${
              language === 'pt' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-1 text-[10px] rounded-lg transition-all font-bold ${
              language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
