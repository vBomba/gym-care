import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { loggedCount } from '../core/format';
import type { Session } from '../core/models';
import {
  dayKey,
  monthMatrix,
  sessionMaxWeight,
  sessionSetCount,
  sessionVolume,
} from '../core/stats';
import { TrainingStore } from '../core/training.store';
import { I18nService } from '../i18n/i18n.service';
import { TrendChart, type TrendPoint } from '../shared/trend-chart';

type TrendMetric = 'volume' | 'max' | 'sets';

@Component({
  selector: 'app-history',
  imports: [RouterLink, TrendChart],
  templateUrl: './history.page.html',
})
export class HistoryPage {
  protected readonly store = inject(TrainingStore);
  protected readonly i18n = inject(I18nService);
  protected readonly loggedCount = loggedCount;

  protected readonly cursor = signal({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  protected readonly selectedDay = signal<string | null>(null);
  protected readonly metric = signal<TrendMetric>('volume');
  private readonly monthPinned = signal(false);

  constructor() {
    effect(() => {
      if (this.monthPinned()) {
        return;
      }
      const latest = this.store.completedSessions()[0];
      if (!latest) {
        return;
      }
      const date = new Date(latest.performedAt);
      this.cursor.set({ year: date.getFullYear(), month: date.getMonth() });
      this.monthPinned.set(true);
    });
  }

  protected readonly weekdayLabels = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.i18n.tag(), { weekday: 'short' });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2024, 0, 1 + index); // Monday-based sample week
      return formatter.format(date);
    });
  });

  protected readonly monthLabel = computed(() => {
    const { year, month } = this.cursor();
    return new Intl.DateTimeFormat(this.i18n.tag(), {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month, 1));
  });

  protected readonly weeks = computed(() => {
    const { year, month } = this.cursor();
    return monthMatrix(year, month);
  });

  protected readonly sessionsByDay = computed(() => {
    const map = new Map<string, Session[]>();
    for (const session of this.store.completedSessions()) {
      const key = dayKey(session.performedAt);
      const list = map.get(key) ?? [];
      list.push(session);
      map.set(key, list);
    }
    return map;
  });

  protected readonly visibleSessions = computed(() => {
    const selected = this.selectedDay();
    const sessions = this.store.completedSessions();
    if (!selected) {
      return sessions;
    }
    return sessions.filter((session) => dayKey(session.performedAt) === selected);
  });

  protected readonly trendPoints = computed((): TrendPoint[] => {
    const metric = this.metric();
    const sessions = [...this.store.completedSessions()]
      .reverse()
      .slice(-12);
    return sessions.map((session) => {
      const value =
        metric === 'volume'
          ? sessionVolume(session)
          : metric === 'max'
            ? sessionMaxWeight(session)
            : sessionSetCount(session);
      return {
        label: this.shortDay(session.performedAt),
        value,
      };
    });
  });

  protected shiftMonth(delta: number): void {
    const current = this.cursor();
    const date = new Date(current.year, current.month + delta, 1);
    this.monthPinned.set(true);
    this.cursor.set({ year: date.getFullYear(), month: date.getMonth() });
  }

  protected selectDay(date: Date | null): void {
    if (!date) {
      return;
    }
    const key = this.localKey(date);
    if (!this.sessionsByDay().has(key)) {
      return;
    }
    this.selectedDay.set(this.selectedDay() === key ? null : key);
  }

  protected isSelected(date: Date | null): boolean {
    if (!date) {
      return false;
    }
    return this.selectedDay() === this.localKey(date);
  }

  protected hasSession(date: Date | null): boolean {
    if (!date) {
      return false;
    }
    return this.sessionsByDay().has(this.localKey(date));
  }

  protected sessionCount(date: Date | null): number {
    if (!date) {
      return 0;
    }
    return this.sessionsByDay().get(this.localKey(date))?.length ?? 0;
  }

  protected isToday(date: Date | null): boolean {
    if (!date) {
      return false;
    }
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  protected clearDay(): void {
    this.selectedDay.set(null);
  }

  protected setMetric(metric: TrendMetric): void {
    this.metric.set(metric);
  }

  protected formatTrendValue = (value: number): string => {
    if (this.metric() === 'sets') {
      return this.i18n.formatNum(value);
    }
    return `${this.i18n.formatNum(value)} ${this.i18n.t('kg')}`;
  };

  private localKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private shortDay(iso: string): string {
    return new Intl.DateTimeFormat(this.i18n.tag(), {
      day: 'numeric',
      month: 'short',
    }).format(new Date(iso));
  }
}
