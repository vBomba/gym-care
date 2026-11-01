import type { Range, Session } from './models';

export function formatNum(value: number, locale = 'uk-UA'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

export function weightInput(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export function parseNum(raw: string): number | null {
  const value = Number(raw.replace(',', '.').trim());
  return Number.isFinite(value) ? value : null;
}

export function formatRange(range: Range, locale = 'uk-UA'): string {
  return range.min === range.max
    ? formatNum(range.min, locale)
    : `${formatNum(range.min, locale)}–${formatNum(range.max, locale)}`;
}

export function formatWhen(iso: string, locale = 'uk-UA'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function loggedCount(session: Session): number {
  return session.exercises.reduce((sum, exercise) => sum + exercise.logs.length, 0);
}

export function plannedCount(session: Session): number {
  return session.exercises.reduce((sum, exercise) => sum + exercise.sets.max, 0);
}

export function roundKg(value: number): number {
  return Math.max(0, Math.round(value * 100) / 100);
}

export function defaultWeight(name: string): number {
  return /підтягуван|висі|брус|podciąg|zwis|poręcz|pull-?up|hang|dip/i.test(name) ? 0 : 20;
}

export function todayInputValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function nowTimeInputValue(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
