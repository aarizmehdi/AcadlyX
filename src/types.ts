export interface Course {
  id: string;
  name: string;
  code: string;
  color: string; // Hex color or Tailwind accent name
  credits?: number;
}

export interface BrokenDownStep {
  id: string;
  title: string;
  dueDate: string; // ISO date string
  isCompleted: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  courseId: string;
  isCompleted: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number; // 0 to 100
  brokenDownSteps?: BrokenDownStep[];
  aiPlanning?: boolean; // currently processing AI breakdown
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string; // ISO string
}

export interface StudySession {
  id: string;
  courseId: string;
  durationMinutes: number;
  timestamp: string; // ISO date
  notes?: string;
}

export interface UserStats {
  totalHoursStudied: number;
  assignmentsCompleted: number;
  gpaGoal: number;
  currentGpa: number;
}

export interface AIConfig {
  provider: 'built-in' | 'custom-gemini' | 'custom-openai';
  apiKey: string;
  endpoint: string;
  model: string;
}

