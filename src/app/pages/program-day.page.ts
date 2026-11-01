import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { autoTranslateText } from '../core/auto-translate';
import { parseNum } from '../core/format';
import { primaryText, textForLocale, withLocaleText } from '../core/locale-text';
import type { ProgramDay, ProgramExercise, Range } from '../core/models';
import { TrainingStore } from '../core/training.store';
import { I18nService } from '../i18n/i18n.service';
import { LOCALES, type AppLocale } from '../i18n/locale';
import { ExerciseArt } from '../shared/exercise-art';

@Component({
  selector: 'app-program-day',
  imports: [RouterLink, ExerciseArt],
  templateUrl: './program-day.page.html',
})
export class ProgramDayPage {
  private readonly store = inject(TrainingStore);
  protected readonly i18n = inject(I18nService);
  private readonly dayId = inject(ActivatedRoute).snapshot.paramMap.get('dayId') ?? '';

  protected readonly draft = signal<ProgramDay | null>(null);
  protected readonly error = signal('');
  protected readonly saved = signal(false);
  protected readonly editLocale = signal<AppLocale>(this.i18n.locale());
  protected readonly translating = signal(false);
  protected readonly translateStatus = signal('');
  private readonly dirty = signal(false);

  constructor() {
    effect(() => {
      if (this.dirty()) {
        return;
      }
      const day = this.store.program()?.days.find((item) => item.id === this.dayId) ?? null;
      this.draft.set(day ? structuredClone(day) : null);
    });
  }

  protected setEditLocale(locale: AppLocale): void {
    this.editLocale.set(locale);
    this.translateStatus.set('');
  }

  protected dayField(field: 'name' | 'focus'): string {
    const day = this.draft();
    if (!day) {
      return '';
    }
    const map = field === 'name' ? day.names : day.focuses;
    return textForLocale(map, this.editLocale(), day[field]);
  }

  protected exerciseField(exercise: ProgramExercise, field: 'name' | 'note'): string {
    if (field === 'name') {
      return textForLocale(exercise.names, this.editLocale(), exercise.name);
    }
    return textForLocale(exercise.notes, this.editLocale(), exercise.note ?? '');
  }

  protected updateText(field: 'name' | 'focus', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const locale = this.editLocale();
    this.touch((day) => {
      if (field === 'name') {
        const names = withLocaleText(day.names, locale, value);
        return { ...day, names, name: primaryText(names, value) };
      }
      const focuses = withLocaleText(day.focuses, locale, value);
      return { ...day, focuses, focus: primaryText(focuses, value) };
    });
  }

  protected updateExerciseText(
    exerciseId: string,
    field: 'name' | 'note',
    event: Event,
  ): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    const locale = this.editLocale();
    this.touch((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }
        if (field === 'name') {
          const names = withLocaleText(exercise.names, locale, value);
          return { ...exercise, names, name: primaryText(names, value) };
        }
        const notes = withLocaleText(exercise.notes, locale, value);
        const next: ProgramExercise = {
          ...exercise,
          notes,
          note: primaryText(notes) || undefined,
        };
        if (!next.note) {
          delete next.note;
          delete next.notes;
        }
        return next;
      }),
    }));
  }

  protected updateBound(
    exerciseId: string,
    field: 'sets' | 'reps' | 'restMin',
    bound: keyof Range,
    event: Event,
  ): void {
    const value = parseNum((event.target as HTMLInputElement).value);
    if (value === null) {
      return;
    }
    this.touch((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, [field]: { ...exercise[field], [bound]: value } }
          : exercise,
      ),
    }));
  }

  protected updateStep(exerciseId: string, event: Event): void {
    const value = parseNum((event.target as HTMLInputElement).value);
    if (value === null) {
      return;
    }
    this.touch((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, weightStepKg: value } : exercise,
      ),
    }));
  }

  protected move(index: number, delta: number): void {
    this.touch((day) => {
      const exercises = [...day.exercises];
      const target = index + delta;
      if (target < 0 || target >= exercises.length) {
        return day;
      }
      const [item] = exercises.splice(index, 1);
      exercises.splice(target, 0, item!);
      return { ...day, exercises };
    });
  }

  protected remove(exerciseId: string): void {
    this.touch((day) => ({
      ...day,
      exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
  }

  protected addExercise(): void {
    const label = this.i18n.t('newExercise');
    const names = Object.fromEntries(LOCALES.map((code) => [code, label])) as Record<
      AppLocale,
      string
    >;
    const exercise: ProgramExercise = {
      id: crypto.randomUUID(),
      name: label,
      names,
      sets: { min: 3, max: 3 },
      reps: { min: 8, max: 10 },
      restMin: { min: 1.5, max: 1.5 },
      weightStepKg: 2.5,
    };
    this.touch((day) => ({ ...day, exercises: [...day.exercises, exercise] }));
  }

  protected async autoTranslate(): Promise<void> {
    const day = this.draft();
    if (!day || this.translating()) {
      return;
    }
    const from = this.editLocale();
    const targets = LOCALES.filter((locale) => locale !== from);
    this.translating.set(true);
    this.translateStatus.set(this.i18n.t('translating'));
    this.error.set('');
    try {
      const sourceName = textForLocale(day.names, from, day.name);
      const sourceFocus = textForLocale(day.focuses, from, day.focus);
      let names = { ...day.names };
      let focuses = { ...day.focuses };
      for (const to of targets) {
        if (sourceName.trim()) {
          names = withLocaleText(names, to, await autoTranslateText(sourceName, from, to));
        }
        if (sourceFocus.trim()) {
          focuses = withLocaleText(focuses, to, await autoTranslateText(sourceFocus, from, to));
        }
      }

      const exercises: ProgramExercise[] = [];
      for (const exercise of day.exercises) {
        let nextNames = { ...exercise.names };
        let nextNotes = exercise.notes ? { ...exercise.notes } : undefined;
        const sourceExerciseName = textForLocale(exercise.names, from, exercise.name);
        const sourceNote = textForLocale(exercise.notes, from, exercise.note ?? '');
        for (const to of targets) {
          if (sourceExerciseName.trim()) {
            nextNames = withLocaleText(
              nextNames,
              to,
              await autoTranslateText(sourceExerciseName, from, to),
            );
          }
          if (sourceNote.trim()) {
            nextNotes = withLocaleText(
              nextNotes,
              to,
              await autoTranslateText(sourceNote, from, to),
            );
          }
        }
        const next: ProgramExercise = {
          ...exercise,
          names: nextNames,
          name: primaryText(nextNames, exercise.name),
        };
        if (nextNotes && primaryText(nextNotes)) {
          next.notes = nextNotes;
          next.note = primaryText(nextNotes);
        } else {
          delete next.notes;
          delete next.note;
        }
        exercises.push(next);
      }

      this.touch(() => ({
        ...day,
        names,
        focuses,
        name: primaryText(names, day.name),
        focus: primaryText(focuses, day.focus),
        exercises,
      }));
      this.translateStatus.set(this.i18n.t('translateDone'));
    } catch (error) {
      console.error(error);
      this.translateStatus.set('');
      this.error.set(this.i18n.t('translateFail'));
    } finally {
      this.translating.set(false);
    }
  }

  protected async save(): Promise<void> {
    const day = this.draft();
    if (!day) {
      return;
    }
    const problem = this.validate(day);
    if (problem) {
      this.error.set(problem);
      this.saved.set(false);
      return;
    }
    const cleaned: ProgramDay = {
      ...day,
      name: primaryText(day.names, day.name).trim(),
      focus: primaryText(day.focuses, day.focus).trim(),
      names: day.names,
      focuses: day.focuses,
      exercises: day.exercises.map((exercise) => {
        const names = exercise.names;
        const notes = exercise.notes;
        const next: ProgramExercise = {
          id: exercise.id,
          name: primaryText(names, exercise.name).trim(),
          names,
          sets: exercise.sets,
          reps: exercise.reps,
          restMin: exercise.restMin,
          weightStepKg: exercise.weightStepKg,
        };
        const note = primaryText(notes, exercise.note ?? '').trim();
        if (note) {
          next.note = note;
          next.notes = notes;
        }
        return next;
      }),
    };
    await this.store.saveProgramDay(cleaned);
    this.draft.set(structuredClone(cleaned));
    this.dirty.set(false);
    this.error.set('');
    this.translateStatus.set('');
    this.saved.set(true);
  }

  private validate(day: ProgramDay): string | null {
    if (!primaryText(day.names, day.name).trim()) {
      return this.i18n.t('needDayName');
    }
    if (day.exercises.some((exercise) => !primaryText(exercise.names, exercise.name).trim())) {
      return this.i18n.t('needExerciseNames');
    }
    for (const exercise of day.exercises) {
      const label = primaryText(exercise.names, exercise.name);
      if (exercise.sets.min < 1 || exercise.sets.max < exercise.sets.min) {
        return this.i18n.t('checkSets', { name: label });
      }
      if (exercise.reps.min < 1 || exercise.reps.max < exercise.reps.min) {
        return this.i18n.t('checkReps', { name: label });
      }
      if (exercise.restMin.min <= 0 || exercise.restMin.max < exercise.restMin.min) {
        return this.i18n.t('checkRest', { name: label });
      }
      if (exercise.weightStepKg <= 0) {
        return this.i18n.t('checkStep', { name: label });
      }
    }
    return null;
  }

  private touch(recipe: (day: ProgramDay) => ProgramDay): void {
    const day = this.draft();
    if (!day) {
      return;
    }
    this.dirty.set(true);
    this.saved.set(false);
    this.draft.set(recipe(day));
  }
}
