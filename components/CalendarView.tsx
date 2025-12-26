
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, MONTH_THEMES } from '../constants';
import { generateDailyRecipe } from '../services/geminiService';

interface CalendarViewProps {
  language: Language;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ language, selectedDate, onDateSelect }) => {
  const t = TRANSLATIONS[language];
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const fetchRecipe = async (date: Date) => {
    setLoadingRecipe(true);
    setRecipe(null);
    try {
      const dateStr = date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US');
      const suggestion = await generateDailyRecipe(dateStr, language);
      setRecipe(suggestion);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleDayClick = (date: Date) => {
    onDateSelect(date);
    fetchRecipe(date);
  };

  useEffect(() => {
    fetchRecipe(selectedDate);
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDays = daysInMonth(year, month);
  const firstDay = startDayOfMonth(year, month);

  const monthsPT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const monthsEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdaysPT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weekdaysEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthName = language === 'pt' ? monthsPT[month] : monthsEN[month];
  const weekdays = language === 'pt' ? weekdaysPT : weekdaysEN;

  // Month Theme Data
  const theme = MONTH_THEMES[month];
  const themeText = language === 'pt' ? theme.pt : theme.en;

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 border-b border-r border-slate-100 bg-slate-50/50"></div>);
  }

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const isToday = new Date().toDateString() === date.toDateString();
    const isSelected = selectedDate.toDateString() === date.toDateString();

    days.push(
      <button
        key={d}
        onClick={() => handleDayClick(date)}
        className={`h-24 border-b border-r border-slate-100 p-2 text-left align-top transition-colors relative group hover:bg-indigo-50/50 ${
          isSelected ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-300' : 'bg-white'
        }`}
      >
        <span className={`text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-full ${
          isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
        }`}>
          {d}
        </span>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="space-y-1">
            <h2 className={`text-2xl font-black uppercase tracking-tight ${theme.color}`}>
              {monthName} {year}
            </h2>
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-80 ${theme.color}`}>
              <i className={`fa-solid ${theme.icon}`}></i>
              {themeText}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-slate-50">
          {weekdays.map(wd => (
            <div key={wd} className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              {wd}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[400px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">{t.dailyRecipe}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                {selectedDate.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingRecipe ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-50 py-10">
                <i className="fa-solid fa-utensils fa-bounce text-indigo-400 text-2xl"></i>
                <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">{t.recipeLoading}</p>
              </div>
            ) : recipe ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {recipe}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 opacity-30 text-center">
                <i className="fa-solid fa-bowl-food text-3xl mb-3"></i>
                <button 
                  onClick={() => fetchRecipe(selectedDate)}
                  className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  {t.generateRecipe}
                </button>
              </div>
            )}
          </div>
          
          {recipe && (
            <div className="pt-4 border-t border-slate-100 mt-4">
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">IA Powered suggestions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
