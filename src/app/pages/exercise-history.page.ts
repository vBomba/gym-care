import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { exerciseMaxWeight, exerciseVolume } from '../core/stats';
import { TrainingStore } from '../core/training.store';
import { I18nService } from '../i18n/i18n.service';
import { ExerciseArt } from '../shared/exercise-art';
import { TrendChart, type TrendPoint } from '../shared/trend-chart';

type TrendMetric = 'volume' | 'max';

@Component({
  selector: 'app-exercise-history',
  imports: [RouterLink, ExerciseArt, TrendChart],
  templateUrl: './exercise-history.page.html',
})
export class ExerciseHistoryPage {
  protected readonly store = inject(TrainingStore);
  protected readonly i18n = inject(I18nService);
  protected readonly exerciseId = inject(ActivatedRoute).snapshot.paramMap.get('exerciseId') ?? '';
  protected readonly metric = signal<TrendMetric>('max');

  protected readonly name = computed(() => {
    const fromProgram = this.store
      .program()
      ?.days.flatMap((day) => day.exercises)
      .find((exercise) => exercise.id === this.exerciseId);
    if (fromProgram) {
      return this.i18n.exerciseName(this.exerciseId, fromProgram.name, fromProgram.names);
    }
    for (const session of this.store.sessions()) {
      const found = session.exercises.find((exercise) => exercise.programExerciseId === this.exerciseId);
      if (found) {
        return this.i18n.exerciseName(this.exerciseId, found.name, found.names);
      }
    }
    return this.i18n.t('exerciseFallback');
  });

  protected readonly rows = computed(() =>
    this.store
      .completedSessions()
      .map((session) => {
        const exercise = session.exercises.find(
          (item) => item.programExerciseId === this.exerciseId && item.logs.length > 0,
        );
        if (!exercise) {
          return null;
        }
        return {
          id: session.id,
          when: session.performedAt,
          dayId: session.programDayId,
          dayName: session.dayName,
          dayNames: session.dayNames,
          logs: exercise.logs,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null),
  );

  protected readonly trendPoints = computed((): TrendPoint[] => {
    const metric = this.metric();
    return [...this.rows()].reverse().map((row) => ({
      label: this.shortDay(row.when),
      value: metric === 'max' ? exerciseMaxWeight(row.logs) : exerciseVolume(row.logs),
    }));
  });

  protected setMetric(metric: TrendMetric): void {
    this.metric.set(metric);
  }

  protected formatTrendValue = (value: number): string =>
    `${this.i18n.formatNum(value)} ${this.i18n.t('kg')}`;

  private shortDay(iso: string): string {
    return new Intl.DateTimeFormat(this.i18n.tag(), {
      day: 'numeric',
      month: 'short',
    }).format(new Date(iso));
  }
}
