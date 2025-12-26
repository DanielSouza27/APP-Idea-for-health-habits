
export type Language = 'pt' | 'en';

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format
  type: 'task' | 'event' | 'note';
}

export interface Exercise {
  id: string;
  name: string;
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  date: string;
}

export interface RecoveryData {
  startDate: string; // ISO format
  dailyCost: number; // Currency amount
}

export interface AppLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface SearchResult {
  text: string;
  sources: { title: string; uri: string }[];
  actions?: { title: string; type: 'task' | 'event' | 'note'; date?: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export enum View {
  CALENDAR = 'calendar',
  AGENDA = 'agenda',
  RESEARCH = 'research',
  CHAT = 'chat',
  HEALTH = 'health',
  ACTIVITY = 'activity'
}
