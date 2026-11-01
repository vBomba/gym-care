import { Injectable, computed, effect, signal } from '@angular/core';
import { textForLocale } from '../core/locale-text';
import type { LocaleText, LoggedSet, Range } from '../core/models';
import { displayContent } from './content';
import {
  LOCALES,
  LOCALE_LABEL,
  LOCALE_TAG,
  STORAGE_KEY,
  type AppLocale,
} from './locale';
import { MESSAGES, type MessageKey } from './messages';

type Params = Record<string, string | number>;

function readStored(): AppLocale {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'uk' || value === 'pl' || value === 'en') {
      return value;
    }
  } catch {
    /* ignore */
  }
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('pl')) {
    return 'pl';
  }
  if (nav.startsWith('en')) {
    return 'en';
  }
  return 'uk';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<AppLocale>(readStored());
  readonly locales = LOCALES;
  readonly labels = LOCALE_LABEL;
  readonly tag = computed(() => LOCALE_TAG[this.locale()]);

  constructor() {
    effect(() => {
      const locale = this.locale();
      try {
        localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        /* ignore */
      }
      document.documentElement.lang = locale;
    });
  }

  setLocale(locale: AppLocale): void {
    this.locale.set(locale);
  }

  t(key: MessageKey, params?: Params): string {
    let text = MESSAGES[this.locale()][key] ?? MESSAGES.uk[key] ?? key;
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  programName(stored: string, names?: LocaleText): string {
    return this.pick(names, stored, 'program');
  }

  dayName(id: string | null | undefined, stored: string, names?: LocaleText): string {
    return this.pick(names, stored, id);
  }

  dayFocus(id: string | null | undefined, stored: string, focuses?: LocaleText): string {
    return this.pick(focuses, stored, id ? `${id}.focus` : null);
  }

  exerciseName(id: string | null | undefined, stored: string, names?: LocaleText): string {
    return this.pick(names, stored, id);
  }

  exerciseNote(
    id: string | null | undefined,
    stored: string | undefined,
    notes?: LocaleText,
  ): string {
    if (!stored && !textForLocale(notes, this.locale())) {
      return '';
    }
    return this.pick(notes, stored ?? '', id ? `${id}.note` : null);
  }

  private pick(
    map: LocaleText | undefined,
    stored: string,
    contentId: string | null | undefined,
  ): string {
    const locale = this.locale();
    const fromMap = map?.[locale]?.trim();
    if (fromMap) {
      return fromMap;
    }
    if (map && textForLocale(map, locale, stored)) {
      return textForLocale(map, locale, stored);
    }
    return displayContent(locale, contentId, stored);
  }

  formatNum(value: number): string {
    return new Intl.NumberFormat(this.tag(), { maximumFractionDigits: 2 }).format(value);
  }

  formatRange(range: Range): string {
    return range.min === range.max
      ? this.formatNum(range.min)
      : `${this.formatNum(range.min)}–${this.formatNum(range.max)}`;
  }

  formatTarget(exercise: { sets: Range; reps: Range; restMin: Range }): string {
    return `${this.formatRange(exercise.sets)} × ${this.formatRange(exercise.reps)} · ${this.formatRange(exercise.restMin)} ${this.t('min')}`;
  }

  formatLogs(logs: LoggedSet[]): string {
    const first = logs[0];
    if (!first) {
      return '';
    }
    const sameWeight = logs.every((set) => set.weightKg === first.weightKg);
    if (sameWeight) {
      return `${this.formatNum(first.weightKg)} ${this.t('kg')} × ${logs.map((set) => set.reps).join(', ')}`;
    }
    return logs.map((set) => `${this.formatNum(set.weightKg)}×${set.reps}`).join(', ');
  }

  formatWhen(iso: string): string {
    return new Intl.DateTimeFormat(this.tag(), {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  }

  pluralSets(count: number): string {
    const locale = this.locale();
    if (locale === 'en') {
      return this.t(count === 1 ? 'sets_one' : 'sets_many', { n: count });
    }
    const mod100 = Math.abs(count) % 100;
    const mod10 = mod100 % 10;
    if (mod100 >= 11 && mod100 <= 14) {
      return this.t('sets_many', { n: count });
    }
    if (mod10 === 1) {
      return this.t('sets_one', { n: count });
    }
    if (mod10 >= 2 && mod10 <= 4) {
      return this.t('sets_few', { n: count });
    }
    return this.t('sets_many', { n: count });
  }
}
