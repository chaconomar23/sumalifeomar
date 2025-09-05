export enum HabitType {
  TIMED = 'Timed',
  CHECK_IN = 'Check-in',
  COUNTER = 'Counter',
}

export enum HabitCategory {
  MIND = 'Mente',
  BODY = 'Cuerpo',
  HEALTH = 'Salud',
  SPIRITUALITY = 'Espiritualidad',
  FINANCES = 'Finanzas',
  SOCIAL = 'Social',
  LEISURE = 'Ocio',
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  type: HabitType;
  duration?: number; // in minutes, for TIMED
  goal?: number; // for COUNTER
  rules?: string;
}

export interface ScheduledHabit extends Habit {
  instanceId: string; // Unique ID for this specific instance in the schedule
  startTime: number; // hour from 0-23, can be decimal e.g., 9.5 for 9:30
  completed: boolean;
}

export interface SubjectSchedule {
  id: string;
  day: number; // 0 for Sunday, 1 for Monday, etc.
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface Subject {
  id: string;
  name: string;
  schedule: SubjectSchedule[];
  color: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

export interface Grade {
  id: string;
  assignmentTitle: string;
  score: number;
  maxScore: number;
  date: Date;
}

export interface SubjectWithGrades extends Subject {
  grades: Grade[];
}

export interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
