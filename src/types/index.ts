export type Grade = {
  id: number;
  name: string;
  grade: number;
  credits: number;
};

export type TaskPriority = 'urgent' | 'intermediate' | 'later';

export type Task = {
  id: number;
  title: string;
  priority: TaskPriority;
  dueDate: Date;
  isCompleted: boolean;
};

export type StudySession = {
  id: number;
  topic: string;
  date: string;
  time: string;
  notes: string;
};

export type Class = {
  id: number;
  name: string;
  day: string;
  time: string;
  location: string;
};

export type Screen =
  | 'performance'
  | 'planner'
  | 'tasks'
  | 'schedule'
  | 'premium';
