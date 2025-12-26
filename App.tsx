
import React, { useState, useEffect, useCallback } from 'react';
import { View, Language, AgendaItem, AppLog, Exercise, RecoveryData } from './types';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import AgendaView from './components/AgendaView';
import ResearchView from './components/ResearchView';
import ChatView from './components/ChatView';
import HealthView from './components/HealthView';
import ActivityView from './components/ActivityView';
import OffModeOverlay from './components/OffModeOverlay';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.CALENDAR);
  const [language, setLanguage] = useState<Language>('pt');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lightStatus, setLightStatus] = useState<boolean>(false);
  const [isAway, setIsAway] = useState<boolean>(false);
  
  // Storage hooks (Persisted to localStorage)
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(() => {
    const saved = localStorage.getItem('app_agenda');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('app_exercises');
    return saved ? JSON.parse(saved) : [];
  });

  const [recovery, setRecovery] = useState<RecoveryData | null>(() => {
    const saved = localStorage.getItem('app_recovery');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [logs, setLogs] = useState<AppLog[]>(() => {
    const saved = localStorage.getItem('app_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Mode Off Logic: Detect when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsAway(true);
      } else {
        setTimeout(() => setIsAway(false), 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_agenda', JSON.stringify(agendaItems));
  }, [agendaItems]);

  useEffect(() => {
    localStorage.setItem('app_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('app_recovery', JSON.stringify(recovery));
  }, [recovery]);

  useEffect(() => {
    localStorage.setItem('app_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = useCallback((action: string, details: string) => {
    const newLog: AppLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      details
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  const addAgendaItem = useCallback((item: Omit<AgendaItem, 'id'>) => {
    const newItem: AgendaItem = { ...item, id: crypto.randomUUID() };
    setAgendaItems(prev => [...prev, newItem]);
    addLog('Agenda Add', `Added ${item.type}: ${item.title}`);
  }, [addLog]);

  const deleteAgendaItem = (id: string) => {
    const item = agendaItems.find(i => i.id === id);
    setAgendaItems(prev => prev.filter(i => i.id !== id));
    if (item) addLog('Agenda Delete', `Removed ${item.type}: ${item.title}`);
  };

  const addExercise = useCallback((ex: Omit<Exercise, 'id'>) => {
    const newEx: Exercise = { ...ex, id: crypto.randomUUID() };
    setExercises(prev => [...prev, newEx]);
    addLog('Health Log', `Logged exercise: ${ex.name}`);
  }, [addLog]);

  const updateRecovery = useCallback((data: RecoveryData) => {
    setRecovery(data);
    addLog('Recovery Update', `Journey started on ${data.startDate}`);
  }, [addLog]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setView(View.AGENDA);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {isAway && <OffModeOverlay language={language} />}
      
      <Sidebar currentView={view} setView={setView} language={language} setLanguage={setLanguage} />
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {view === View.CALENDAR && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CalendarView language={language} selectedDate={selectedDate} onDateSelect={handleDateSelect} />
          </div>
        )}

        {view === View.AGENDA && (
          <div className="h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-right-4 duration-500">
            <AgendaView language={language} items={agendaItems} selectedDate={selectedDate} onAddItem={addAgendaItem} onDeleteItem={deleteAgendaItem} />
          </div>
        )}

        {view === View.RESEARCH && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <ResearchView language={language} onLogAction={addLog} onAddItem={addAgendaItem} />
          </div>
        )}

        {view === View.CHAT && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ChatView language={language} onLogAction={addLog} lightStatus={lightStatus} setLightStatus={setLightStatus} onLogExercise={addExercise} />
          </div>
        )}

        {view === View.HEALTH && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HealthView 
              language={language}
              exercises={exercises}
              recovery={recovery}
              onAddExercise={addExercise}
              onUpdateRecovery={updateRecovery}
              onLogAction={addLog}
            />
          </div>
        )}

        {view === View.ACTIVITY && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <ActivityView language={language} logs={logs} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
