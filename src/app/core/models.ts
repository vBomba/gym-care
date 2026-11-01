import type { AppLocale } from '../i18n/locale';

export interface Range {
  min: number;
  max: number;
}

export type LocaleText = Partial<Record<AppLocale, string>>;

export interface ProgramExercise {
  id: string;
  name: string;
  names?: LocaleText;
  sets: Range;
  reps: Range;
  restMin: Range;
  note?: string;
  notes?: LocaleText;
  weightStepKg: number;
}

export interface ProgramDay {
  id: string;
  name: string;
  names?: LocaleText;
  focus: string;
  focuses?: LocaleText;
  exercises: ProgramExercise[];
}

export interface Program {
  id: 'main';
  name: string;
  days: ProgramDay[];
  updatedAt: string;
}

export type LogMode = 'live' | 'recalled';
export type SessionStatus = 'active' | 'completed';

export interface LoggedSet {
  id: string;
  weightKg: number;
  reps: number;
  completedAt?: string;
  updatedAt: string;
}

export interface SessionExercise {
  id: string;
  programExerciseId: string;
  plannedExerciseId?: string;
  plannedName?: string;
  plannedNames?: LocaleText;
  name: string;
  names?: LocaleText;
  sets: Range;
  reps: Range;
  restMin: Range;
  note?: string;
  notes?: LocaleText;
  weightStepKg: number;
  logs: LoggedSet[];
}

export interface Session {
  id: string;
  programDayId: string;
  dayName: string;
  dayNames?: LocaleText;
  focus: string;
  focuses?: LocaleText;
  performedAt: string;
  mode: LogMode;
  status: SessionStatus;
  exercises: SessionExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface DeletionRecord {
  id: string;
  kind: 'session';
  deletedAt: string;
}

export interface SyncBundle {
  schemaVersion: 1;
  exportedAt: string;
  program: Program;
  sessions: Session[];
  deletions: DeletionRecord[];
  deviceId: string;
}

export interface SeedExercise {
  order: number;
  name: string;
  sets: Range;
  reps: Range;
  restMin: Range;
  note?: string;
}

export interface SeedFile {
  name: string;
  days: Array<{
    id: string;
    name: string;
    focus: string;
    exercises: SeedExercise[];
  }>;
}
