
import React, { useState, useRef } from 'react';
import { Language, Exercise, RecoveryData } from '../types';
import { TRANSLATIONS } from '../constants';
import { GoogleGenAI } from "@google/genai";
import { processTrainingImage } from '../services/geminiService';

interface HealthViewProps {
  language: Language;
  exercises: Exercise[];
  recovery: RecoveryData | null;
  onAddExercise: (exercise: Omit<Exercise, 'id'>) => void;
  onUpdateRecovery: (data: RecoveryData) => void;
  onLogAction: (action: string, details: string) => void;
}

const HealthView: React.FC<HealthViewProps> = ({ language, exercises, recovery, onAddExercise, onUpdateRecovery, onLogAction }) => {
  const t = TRANSLATIONS[language];
  const [tab, setTab] = useState<'workout' | 'recovery'>('workout');
  const [isAdding, setIsAdding] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({ name: '', duration: 30, intensity: 'medium' as const });
  const [recoveryForm, setRecoveryForm] = useState({ startDate: recovery?.startDate || new Date().toISOString().split('T')[0], dailyCost: recovery?.dailyCost || 0 });
  const [aiWorkout, setAiWorkout] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onAddExercise({ ...formData, date: new Date().toISOString() });
    setIsAdding(false);
    setFormData({ name: '', duration: 30, intensity: 'medium' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    onLogAction('Health', 'Started training import from image');
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const importedExercises = await processTrainingImage(base64Data);
        
        if (importedExercises.length > 0) {
          importedExercises.forEach(ex => onAddExercise(ex));
          onLogAction('Health', `Imported ${importedExercises.length} exercises from image`);
          alert(t.importSuccess);
        } else {
          alert(t.importError);
        }
        setImporting(false);
      };
    } catch (err) {
      console.error(err);
      alert(t.importError);
      setImporting(false);
    }
  };

  const handleSubmitRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRecovery({ startDate: recoveryForm.startDate, dailyCost: Number(recoveryForm.dailyCost) });
    setIsConfiguring(false);
    onLogAction('Recovery', 'Updated journey settings');
  };

  const handleGenerateWorkout = async () => {
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = language === 'pt' 
        ? "Sugira 3 exercícios simples de 15 min. Use emojis e seja muito curto."
        : "Suggest 3 simple 15 min exercises. Use emojis and be very short.";
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiWorkout(response.text || "Error");
      onLogAction('Health IA', 'Generated workout');
    } catch (error) { console.error(error); } 
    finally { setLoadingAI(false); }
  };

  // Calculations for Recovery
  const calculateDays = () => {
    if (!recovery) return 0;
    const start = new Date(recovery.startDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysClean = calculateDays();
  const moneySaved = daysClean * (recovery?.dailyCost || 0);

  // Simple Data for Chart simulation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = 6 - i;
    const daySavings = Math.max(0, (daysClean - d)) * (recovery?.dailyCost || 0);
    return daySavings;
  });
  const maxSavings = Math.max(...last7Days, 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tab Selector */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mx-auto border border-slate-200">
        <button onClick={() => setTab('workout')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'workout' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
          <i className="fa-solid fa-dumbbell mr-2"></i>{t.addExercise}
        </button>
        <button onClick={() => setTab('recovery')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'recovery' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
          <i className="fa-solid fa-medal mr-2"></i>{t.recoveryTab}
        </button>
      </div>

      {tab === 'workout' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500"><i className="fa-solid fa-heart-pulse"></i></div>
              <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</p><p className="text-sm font-bold text-slate-800">{t.healthTitle}</p></div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500"><i className="fa-solid fa-clock"></i></div>
              <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.duration}</p><p className="text-sm font-bold text-slate-800">{exercises.reduce((acc, c) => acc + c.duration, 0)} min</p></div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><i className="fa-solid fa-fire"></i></div>
              <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Goal</p><p className="text-sm font-bold text-slate-800">{exercises.length} / 5</p></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleGenerateWorkout} className="flex-1 min-w-[140px] bg-indigo-50 text-indigo-600 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-indigo-100 hover:bg-indigo-100">
              {loadingAI ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-sparkles"></i>}{t.generateWorkout}
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={importing}
              className="flex-1 min-w-[140px] bg-slate-50 text-slate-600 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-100"
            >
              {importing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-qrcode"></i>}
              {importing ? t.importing : t.importTraining}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
            <button onClick={() => setIsAdding(!isAdding)} className="flex-1 min-w-[140px] bg-indigo-600 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
              <i className={`fa-solid ${isAdding ? 'fa-xmark' : 'fa-plus'}`}></i>{isAdding ? t.cancel : t.addExercise}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleSubmitWorkout} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95">
              <div className="col-span-2">
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none outline-none text-sm" placeholder={t.exerciseName} />
              </div>
              <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="px-4 py-2 bg-slate-50 rounded-xl border-none outline-none text-sm" />
              <select value={formData.intensity} onChange={e => setFormData({ ...formData, intensity: e.target.value as any })} className="px-4 py-2 bg-slate-50 rounded-xl border-none outline-none text-sm">
                <option value="low">{t.low}</option><option value="medium">{t.medium}</option><option value="high">{t.high}</option>
              </select>
              <button type="submit" className="col-span-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold">{t.save}</button>
            </form>
          )}

          {aiWorkout && (
            <div className="bg-indigo-600 p-5 rounded-2xl text-white text-sm relative animate-in slide-in-from-top-4">
              <button onClick={() => setAiWorkout(null)} className="absolute top-3 right-3 opacity-50"><i className="fa-solid fa-xmark"></i></button>
              <p className="font-bold mb-2 flex items-center gap-2"><i className="fa-solid fa-star"></i> AI Suggestion</p>
              <div className="whitespace-pre-wrap opacity-90">{aiWorkout}</div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.recentExercises}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {exercises.slice(-5).reverse().map(ex => (
                <div key={ex.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid fa-bolt text-xs ${ex.intensity === 'high' ? 'text-rose-500' : 'text-emerald-500'}`}></i>
                    <span className="text-sm font-bold text-slate-700">{ex.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">{ex.duration}m</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${ex.intensity === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{t[ex.intensity]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {!recovery || isConfiguring ? (
            <form onSubmit={handleSubmitRecovery} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-3">
                <i className="fa-solid fa-gear text-indigo-500"></i>{t.setupRecovery}
              </h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{t.startDate}</label>
                <input type="date" value={recoveryForm.startDate} onChange={e => setRecoveryForm({ ...recoveryForm, startDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{t.dailyCost}</label>
                <input type="number" placeholder="0.00" value={recoveryForm.dailyCost} onChange={e => setRecoveryForm({ ...recoveryForm, dailyCost: Number(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 rounded-2xl outline-none" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">{t.save}</button>
              {recovery && <button onClick={() => setIsConfiguring(false)} className="w-full text-slate-400 text-xs py-2">{t.cancel}</button>}
            </form>
          ) : (
            <>
              {/* Recovery Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-lg shadow-indigo-100">
                  <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">{t.daysClean}</p>
                  <p className="text-4xl font-black mt-2 tracking-tighter">{daysClean}</p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] bg-white/10 w-fit px-3 py-1 rounded-full">
                    <i className="fa-solid fa-rocket"></i> Since {new Date(recovery.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-emerald-500 p-6 rounded-[2.5rem] text-white shadow-lg shadow-emerald-100">
                  <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">{t.moneySaved}</p>
                  <p className="text-4xl font-black mt-2 tracking-tighter">${moneySaved.toFixed(2)}</p>
                  <button onClick={() => setIsConfiguring(true)} className="mt-4 text-[10px] border border-white/30 px-3 py-1 rounded-full hover:bg-white/10 transition-colors">
                    <i className="fa-solid fa-pen mr-1"></i> Edit habit
                  </button>
                </div>
              </div>

              {/* Recovery Graphics */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t.savingChart}</h3>
                    <p className="text-[10px] text-slate-400">Progresso dos últimos 7 dias</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-500">+${(recovery.dailyCost * 7).toFixed(2)} / wk</p>
                  </div>
                </div>

                <div className="h-40 flex items-end justify-between gap-2 pt-4">
                  {last7Days.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-lg transition-all duration-1000" 
                        style={{ height: `${(val / maxSavings) * 100}%`, minHeight: '4px' }}
                      ></div>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">D-{6-i}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t.moneySaved}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Old Habit Cost: ${recovery.dailyCost}/day</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthView;
