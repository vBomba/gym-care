import type { LoggedSet, Session } from './models';

export function dayKey(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function setVolume(set: LoggedSet): number {
  return set.weightKg * set.reps;
}

export function sessionVolume(session: Session): number {
  return session.exercises.reduce(
    (sum, exercise) => sum + exercise.logs.reduce((inner, set) => inner + setVolume(set), 0),
    0,
  );
}

export function sessionMaxWeight(session: Session): number {
  let max = 0;
  for (const exercise of session.exercises) {
    for (const set of exercise.logs) {
      max = Math.max(max, set.weightKg);
    }
  }
  return max;
}

export function sessionSetCount(session: Session): number {
  return session.exercises.reduce((sum, exercise) => sum + exercise.logs.length, 0);
}

export function exerciseMaxWeight(logs: LoggedSet[]): number {
  return logs.reduce((max, set) => Math.max(max, set.weightKg), 0);
}

export function exerciseVolume(logs: LoggedSet[]): number {
  return logs.reduce((sum, set) => sum + setVolume(set), 0);
}

export function monthMatrix(year: number, monthIndex: number): Array<Array<Date | null>> {
  const first = new Date(year, monthIndex, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startPad; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
