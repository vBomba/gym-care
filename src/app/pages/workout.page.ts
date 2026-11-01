import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  defaultWeight,
  loggedCount,
  parseNum,
  plannedCount,
  roundKg,
  weightInput,
} from '../core/format';
import type { LoggedSet, ProgramExercise, Session, SessionExercise } from '../core/models';
import { RestTimer } from '../core/rest-timer';
import { SyncService } from '../core/sync/sync.service';
import { TrainingStore } from '../core/training.store';
import { I18nService } from '../i18n/i18n.service';
import { ExerciseArt } from '../shared/exercise-art';

@Component({
  selector: 'app-workout',
  imports: [RouterLink, ExerciseArt],
  templateUrl: './workout.page.html',
})
export class WorkoutPage {
  protected readonly store = inject(TrainingStore);
  protected readonly timer = inject(RestTimer);
  protected readonly i18n = inject(I18nService);
  private readonly sync = inject(SyncService);
  protected readonly weightInput = weightInput;
  protected readonly loggedCount = loggedCount;
  protected readonly plannedCount = plannedCount;

  private readonly router = inject(Router);
  private readonly sessionId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  protected readonly openId = signal<string | null>(null);
  protected readonly draftWeight = signal(20);
  protected readonly draftReps = signal(8);
  protected readonly confirm = signal<'finish' | 'cancel' | null>(null);
  protected readonly finishError = signal('');
  protected readonly renamingId = signal<string | null>(null);
  protected readonly renameDraft = signal('');

  protected readonly session = computed(
    () => this.store.sessions().find((item) => item.id === this.sessionId) ?? null,
  );

  protected readonly progress = computed(() => {
    const session = this.session();
    if (!session) {
      return 0;
    }
    const planned = plannedCount(session);
    if (planned <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((loggedCount(session) / planned) * 100));
  });

  constructor() {
    const session = this.store.sessions().find((item) => item.id === this.sessionId);
    const target =
      session?.exercises.find((exercise) => exercise.logs.length < exercise.sets.max) ??
      session?.exercises[0];
    if (session && target) {
      this.openId.set(target.id);
      this.prepareDraft(session, target.id);
    }
  }

  protected toggle(exerciseId: string): void {
    const session = this.session();
    if (!session) {
      return;
    }
    if (this.openId() === exerciseId) {
      this.openId.set(null);
      return;
    }
    this.prepareDraft(session, exerciseId);
    this.openId.set(exerciseId);
  }

  protected nudgeWeight(exercise: SessionExercise, direction: number): void {
    this.draftWeight.set(roundKg(this.draftWeight() + direction * exercise.weightStepKg));
  }

  protected nudgeReps(direction: number): void {
    this.draftReps.set(Math.max(1, this.draftReps() + direction));
  }

  protected onDraftWeight(event: Event): void {
    const value = parseNum((event.target as HTMLInputElement).value);
    if (value !== null) {
      this.draftWeight.set(roundKg(value));
    }
  }

  protected onDraftReps(event: Event): void {
    const value = parseNum((event.target as HTMLInputElement).value);
    if (value !== null) {
      this.draftReps.set(Math.max(1, Math.round(value)));
    }
  }

  protected async commit(exercise: SessionExercise): Promise<void> {
    const session = this.session();
    if (!session || this.draftReps() < 1) {
      return;
    }
    await this.store.addSet(session.id, exercise.id, this.draftWeight(), this.draftReps());
    if (session.mode === 'live' && session.status === 'active') {
      this.timer.start(exercise.restMin.max);
    }
  }

  protected async changeWeight(
    exercise: SessionExercise,
    set: LoggedSet,
    direction: number,
  ): Promise<void> {
    const session = this.session();
    if (!session) {
      return;
    }
    await this.store.patchSet(session.id, exercise.id, set.id, {
      weightKg: roundKg(set.weightKg + direction * exercise.weightStepKg),
      reps: set.reps,
    });
  }

  protected async changeReps(
    exercise: SessionExercise,
    set: LoggedSet,
    direction: number,
  ): Promise<void> {
    const session = this.session();
    if (!session) {
      return;
    }
    await this.store.patchSet(session.id, exercise.id, set.id, {
      weightKg: set.weightKg,
      reps: Math.max(1, set.reps + direction),
    });
  }

  protected async editWeight(exercise: SessionExercise, set: LoggedSet, event: Event): Promise<void> {
    const session = this.session();
    const value = parseNum((event.target as HTMLInputElement).value);
    if (!session || value === null) {
      return;
    }
    await this.store.patchSet(session.id, exercise.id, set.id, {
      weightKg: roundKg(value),
      reps: set.reps,
    });
  }

  protected async editReps(exercise: SessionExercise, set: LoggedSet, event: Event): Promise<void> {
    const session = this.session();
    const value = parseNum((event.target as HTMLInputElement).value);
    if (!session || value === null) {
      return;
    }
    await this.store.patchSet(session.id, exercise.id, set.id, {
      weightKg: set.weightKg,
      reps: Math.max(1, Math.round(value)),
    });
  }

  protected startRename(exercise: SessionExercise): void {
    this.renamingId.set(this.renamingId() === exercise.id ? null : exercise.id);
    this.renameDraft.set(
      this.i18n.exerciseName(exercise.programExerciseId, exercise.name, exercise.names),
    );
  }

  protected onRename(event: Event): void {
    this.renameDraft.set((event.target as HTMLInputElement).value);
  }

  protected alternatives(exercise: SessionExercise): ProgramExercise[] {
    return (
      this.store
        .program()
        ?.days.flatMap((day) => day.exercises)
        .filter((item) => item.id !== exercise.programExerciseId) ?? []
    );
  }

  protected replaced(exercise: SessionExercise): boolean {
    const plannedId = exercise.plannedExerciseId ?? exercise.programExerciseId;
    return plannedId !== exercise.programExerciseId;
  }

  protected insteadLabel(exercise: SessionExercise): string {
    return this.i18n.t('insteadOf', {
      name: this.i18n.exerciseName(
        exercise.plannedExerciseId,
        exercise.plannedName ?? '',
        exercise.plannedNames,
      ),
    });
  }

  protected async chooseExercise(
    exercise: SessionExercise,
    replacement: ProgramExercise,
  ): Promise<void> {
    await this.applyReplacement(exercise, replacement);
  }

  protected async saveCustomName(exercise: SessionExercise): Promise<void> {
    const name = this.renameDraft().trim();
    if (!name || name === exercise.name) {
      this.renamingId.set(null);
      return;
    }
    const known = this.store
      .program()
      ?.days.flatMap((day) => day.exercises)
      .find((item) => {
        if (item.name === name) {
          return true;
        }
        return Object.values(item.names ?? {}).some((value) => value === name);
      });
    if (known) {
      await this.applyReplacement(exercise, known);
      return;
    }
    const names = { uk: name, pl: name, en: name };
    const custom: ProgramExercise = {
      id: `custom:${name.toLocaleLowerCase('uk')}`,
      name,
      names,
      sets: { ...exercise.sets },
      reps: { ...exercise.reps },
      restMin: { ...exercise.restMin },
      weightStepKg: exercise.weightStepKg,
    };
    if (exercise.notes) {
      custom.notes = { ...exercise.notes };
    }
    if (exercise.note) {
      custom.note = exercise.note;
    }
    await this.applyReplacement(exercise, custom);
  }

  protected async restoreExercise(exercise: SessionExercise): Promise<void> {
    const plannedId = exercise.plannedExerciseId ?? exercise.programExerciseId;
    const planned = this.store
      .program()
      ?.days.flatMap((day) => day.exercises)
      .find((item) => item.id === plannedId);
    if (!planned) {
      return;
    }
    await this.applyReplacement(exercise, planned);
  }

  protected async remove(exercise: SessionExercise, set: LoggedSet): Promise<void> {
    const session = this.session();
    if (!session) {
      return;
    }
    await this.store.removeSet(session.id, exercise.id, set.id);
  }

  protected async finish(): Promise<void> {
    const session = this.session();
    if (!session) {
      return;
    }
    if (loggedCount(session) === 0) {
      this.finishError.set(this.i18n.t('needOneSet'));
      this.confirm.set(null);
      return;
    }
    await this.store.finishSession(session.id);
    void this.sync.tryAutoSync();
    this.timer.skip();
    await this.router.navigateByUrl('/');
  }

  protected async cancel(): Promise<void> {
    await this.store.cancelSession(this.sessionId);
    this.timer.skip();
    await this.router.navigateByUrl('/');
  }

  private async applyReplacement(
    exercise: SessionExercise,
    replacement: ProgramExercise,
  ): Promise<void> {
    const session = this.session();
    if (!session) {
      return;
    }
    await this.store.replaceExercise(session.id, exercise.id, replacement);
    this.renamingId.set(null);
    const updated = this.session();
    if (updated) {
      this.prepareDraft(updated, exercise.id);
    }
  }

  private prepareDraft(session: Session, exerciseId: string): void {
    const exercise = session.exercises.find((item) => item.id === exerciseId);
    if (!exercise) {
      return;
    }
    const recent =
      exercise.logs.at(-1) ?? this.store.lastLogs(exercise.programExerciseId, session.id)?.at(-1);
    this.draftWeight.set(recent?.weightKg ?? defaultWeight(exercise.name));
    this.draftReps.set(recent?.reps ?? exercise.reps.min);
  }
}
