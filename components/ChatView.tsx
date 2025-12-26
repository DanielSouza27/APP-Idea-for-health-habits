
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Language, ChatMessage, Exercise } from '../types';
import { TRANSLATIONS } from '../constants';

interface ChatViewProps {
  language: Language;
  onLogAction: (action: string, details: string) => void;
  lightStatus: boolean;
  setLightStatus: (status: boolean) => void;
  onLogExercise?: (ex: Omit<Exercise, 'id'>) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ language, onLogAction, lightStatus, setLightStatus, onLogExercise }) => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: language === 'pt' ? 'Como posso ajudar?' : 'How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const controlLightFunction: FunctionDeclaration = {
    name: 'controlLight',
    parameters: {
      type: Type.OBJECT,
      description: 'Control lights',
      properties: { status: { type: Type.STRING, enum: ['on', 'off'] } },
      required: ['status'],
    },
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: input }] }],
        config: {
          tools: [{ functionDeclarations: [controlLightFunction] }],
          systemInstruction: "Keep responses short and helpful. Use emojis."
        }
      });
      let responseText = response.text || '';
      if (response.functionCalls) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'controlLight') {
            const newStatus = fc.args.status === 'on';
            setLightStatus(newStatus);
            responseText = `💡 ${newStatus ? 'On' : 'Off'}`;
          }
        }
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${lightStatus ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'}`}></div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.lightStatus}: {lightStatus ? t.lightOn : t.lightOff}</span>
        </div>
        <i className="fa-solid fa-sparkles text-indigo-400"></i>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.role === 'user' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400 animate-pulse">{t.aiThinking}</div>}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4">
        <div className="relative flex items-center bg-slate-50 rounded-2xl px-4 py-1 border border-slate-100 focus-within:border-indigo-200 transition-all">
          <input
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={t.chatPlaceholder} disabled={loading}
            className="flex-1 py-3 bg-transparent outline-none text-sm"
          />
          <button type="submit" disabled={loading} className="text-indigo-600 p-2 hover:scale-110 transition-transform">
            <i className="fa-solid fa-arrow-up-long"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatView;
