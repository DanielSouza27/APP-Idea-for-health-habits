
import React, { useState } from 'react';
import { AgendaItem, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AgendaViewProps {
  language: Language;
  items: AgendaItem[];
  selectedDate: Date;
  onAddItem: (item: Omit<AgendaItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ language, items, selectedDate, onAddItem, onDeleteItem }) => {
  const t = TRANSLATIONS[language];
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', type: 'task' as const });

  const dayItems = items.filter(item => new Date(item.date).toDateString() === selectedDate.toDateString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onAddItem({ ...formData, date: selectedDate.toISOString() });
    setFormData({ title: '', description: '', type: 'task' });
    setShowForm(false);
  };

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {selectedDate.getDate()} {selectedDate.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'short' })}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dayItems.length} items</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'}`}></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {showForm && (
          <form onSubmit={handleSubmit} className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-3 animate-in fade-in zoom-in-95">
            <input
              type="text" autoFocus placeholder={t.title} value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-sm font-bold bg-slate-50 border-none outline-none p-3 rounded-xl"
            />
            <div className="flex gap-2">
              <select
                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="flex-1 bg-slate-50 border-none outline-none text-xs font-bold p-3 rounded-xl text-slate-500"
              >
                <option value="task">{t.tasks}</option>
                <option value="event">{t.events}</option>
                <option value="note">{t.notes}</option>
              </select>
              <button type="submit" className="bg-indigo-600 text-white px-6 rounded-xl text-xs font-bold">
                {t.save}
              </button>
            </div>
          </form>
        )}

        {dayItems.length === 0 && !showForm ? (
          <div className="text-center py-20 opacity-30">
            <i className="fa-solid fa-feather-pointed text-4xl mb-4"></i>
            <p className="text-sm font-bold uppercase tracking-widest">{t.noEvents}</p>
          </div>
        ) : (
          dayItems.map(item => (
            <div key={item.id} className="group p-4 bg-white rounded-2xl border border-slate-50 flex justify-between items-center transition-all hover:border-indigo-100 hover:shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${item.type === 'task' ? 'bg-amber-400' : item.type === 'event' ? 'bg-indigo-500' : 'bg-emerald-400'}`}></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                  {item.description && <p className="text-[10px] text-slate-400">{item.description}</p>}
                </div>
              </div>
              <button onClick={() => onDeleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                <i className="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgendaView;
