
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface OffModeOverlayProps {
  language: Language;
}

const OffModeOverlay: React.FC<OffModeOverlayProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-2 border-indigo-500/30 flex items-center justify-center animate-pulse">
          <i className="fa-solid fa-moon text-4xl text-indigo-400"></i>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900"></div>
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black uppercase tracking-[0.2em] text-indigo-400">
          {t.offModeTitle}
        </h2>
        <p className="text-slate-400 text-sm font-medium italic opacity-70">
          {t.offModeMsg}
        </p>
      </div>

      <div className="mt-12 flex gap-1.5">
        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0s]"></div>
        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};

export default OffModeOverlay;
