import { Injectable, computed, inject, signal } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';
import { db } from './db';
import { hydrateProgramLocales } from './locale-text';
import type {
  LogMode,
  LoggedSet,
  Program,
  ProgramDay,
  ProgramExercise,
  SeedFile,
  Session,
  SessionExercise,
} from './models';
import { applyProgramSeedPatch, markProgramPatched, needsProgramPatch } from './program-sync';

@Injectable({ providedIn: 'root' })
export class TrainingStore {
  private readonly i18n = inject(I18nService);

  readonly program = signal<Program | null>(null);
  readonly sessions = signal<Session[]>([]);
  readonly ready = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeSession = computed(
    () => this.sessions().find((session) => session.status === 'active') ?? null,
  );

  readonly completedSessions = computed(() =>
    this.sessions()
      .filter((session) => session.status === 'completed')
      .sort((a, b) => b.performedAt.localeCompare(a.performedAt)),
  );

  readonly nextDay = computed(() => {
    const program = this.program();
    if (!program || program.days.length === 0) {
      return null;
    }
    const last = this.completedSessions().find((session) =>
      session.exercises.some((exercise) => exercise.logs.length > 0),
    );
    if (!last) {
      return program.days[0] ?? null;
    }
    const index = program.days.findIndex((day) => day.id === last.programDayId);
    return program.days[(index + 1) % program.days.length] ?? program.days[0] ?? null;
  });

  private initPromise: Promise<void> | null = null;

  init(): Promise<void> {
    this.initPromise ??= this.doInit();
    return this.initPromise;
  }

  lastLogs(programExerciseId: string, excludeSessionId?: string): LoggedSet[] | null {
    for (const session of this.completedSessions()) {
      if (session.id === excludeSessionId) {
        continue;
      }
      const exercise = session.exercises.find(
        (item) => item.programExerciseId === programExerciseId && item.logs.length > 0,
      );
      if (exercise) {
        return exercise.logs;
      }
    }
    return null;
  }

  async startSession(dayId: string, mode: LogMode, performedAt?: string): Promise<string | null> {
    const active = this.activeSession();
    if (active) {
      return active.id;
    }
    const day = this.program()?.days.find((item) => item.id === dayId);
    if (!day) {
      return null;
    }
    const now = new Date().toISOString();
    const session: Session = {
      id: crypto.randomUUID(),
      programDayId: day.id,
      dayName: day.name,
      dayNames: day.names ? { ...day.names } : undefined,
      focus: day.focus,
      focuses: day.focuses ? { ...day.focuses } : undefined,
      performedAt: performedAt ?? now,
      mode,
      status: 'active',
      exercises: day.exercises.map((exercise) => this.snapshotExercise(exercise)),
      createdAt: now,
      updatedAt: now,
    };
    await db.sessions.put(session);
    await this.reload();
    return session.id;
  }

  async addSet(sessionId: string, exerciseId: string, weightKg: number, reps: number): Promise<void> {
    const now = new Date().toISOString();
    await this.updateSession(sessionId, (session) => {
      const exercise = session.exercises.find((item) => item.id === exerciseId);
      if (!exercise) {
        return session;
      }
      const set: LoggedSet = {
        id: crypto.randomUUID(),
        weightKg,
        reps,
        updatedAt: now,
      };
      if (session.mode === 'live') {
        set.completedAt = now;
      }
      exercise.logs.push(set);
      return session;
    });
  }

  async patchSet(
    sessionId: string,
    exerciseId: string,
    setId: string,
    patch: Pick<LoggedSet, 'weightKg' | 'reps'>,
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.updateSession(sessionId, (session) => {
      const exercise = session.exercises.find((item) => item.id === exerciseId);
      const set = exercise?.logs.find((item) => item.id === setId);
      if (!set) {
        return session;
      }
      set.weightKg = patch.weightKg;
      set.reps = patch.reps;
      set.updatedAt = now;
      return session;
    });
  }

  async replaceExercise(
    sessionId: string,
    exerciseId: string,
    replacement: ProgramExercise,
  ): Promise<void> {
    const name = replacement.name.trim();
    if (!name) {
      return;
    }
    await this.updateSession(sessionId, (session) => {
      const index = session.exercises.findIndex((item) => item.id === exerciseId);
      const exercise = session.exercises[index];
      if (!exercise) {
        return session;
      }
      const next: SessionExercise = {
        id: exercise.id,
        programExerciseId: replacement.id,
        plannedExerciseId: exercise.plannedExerciseId ?? exercise.programExerciseId,
        plannedName: exercise.plannedName ?? exercise.name,
        plannedNames: exercise.plannedNames ?? (exercise.names ? { ...exercise.names } : undefined),
        name,
        names: replacement.names ? { ...replacement.names } : undefined,
        sets: { ...replacement.sets },
        reps: { ...replacement.reps },
        restMin: { ...replacement.restMin },
        weightStepKg: replacement.weightStepKg,
        logs: exercise.logs,
      };
      if (replacement.notes) {
        next.notes = { ...replacement.notes };
      }
      if (replacement.note) {
        next.note = replacement.note;
      }
      session.exercises[index] = next;
      return session;
    });
  }

  async removeSet(sessionId: string, exerciseId: string, setId: string): Promise<void> {
    await this.updateSession(sessionId, (session) => {
      const exercise = session.exercises.find((item) => item.id === exerciseId);
      if (!exercise) {
        return session;
      }
      exercise.logs = exercise.logs.filter((set) => set.id !== setId);
      return session;
    });
  }

  async finishSession(sessionId: string): Promise<void> {
    await this.updateSession(sessionId, (session) => {
      session.status = 'completed';
      return session;
    });
  }

  async cancelSession(sessionId: string): Promise<void> {
    const now = new Date().toISOString();
    await db.transaction('rw', db.sessions, db.deletions, async () => {
      await db.sessions.delete(sessionId);
      await db.deletions.put({
        id: sessionId,
        kind: 'session',
        deletedAt: now,
      });
    });
    await this.reload();
  }

  /** Used by sync after applying a remote/local merge. */
  async reloadFromDb(): Promise<void> {
    await this.reload();
  }

  async saveProgramDay(day: ProgramDay): Promise<void> {
    const program = await db.program.get('main');
    if (!program) {
      return;
    }
    program.days = program.days.map((item) => (item.id === day.id ? day : item));
    program.updatedAt = new Date().toISOString();
    await db.program.put(program);
    await this.reload();
  }

  private async doInit(): Promise<void> {
    try {
      const response = await fetch('program.json');
      if (!response.ok) {
        throw new Error(`program.json ${response.status}`);
      }
      const seed = (await response.json()) as SeedFile;
      const existing = await db.program.get('main');
      if (!existing) {
        await db.program.put(this.createProgram(seed));
        markProgramPatched();
      } else if (needsProgramPatch()) {
        await db.program.put(applyProgramSeedPatch(existing, seed));
        markProgramPatched();
      }
      await this.reload();
      this.ready.set(true);
    } catch (error) {
      console.error(error);
      this.error.set(this.i18n.t('dbError'));
    }
  }

  private createProgram(seed: SeedFile): Program {
    const now = new Date().toISOString();
    return hydrateProgramLocales({
      id: 'main',
      name: seed.name,
      updatedAt: now,
      days: seed.days.map((day) => ({
        id: day.id,
        name: day.name,
        focus: day.focus,
        exercises: day.exercises.map((exercise) => {
          const mapped: ProgramExercise = {
            id: `${day.id}-${exercise.order}`,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            restMin: exercise.restMin,
            weightStepKg: 2.5,
          };
          return exercise.note ? { ...mapped, note: exercise.note } : mapped;
        }),
      })),
    });
  }

  private snapshotExercise(exercise: Program['days'][number]['exercises'][number]): SessionExercise {
    const snapshot: SessionExercise = {
      id: crypto.randomUUID(),
      programExerciseId: exercise.id,
      plannedExerciseId: exercise.id,
      plannedName: exercise.name,
      plannedNames: exercise.names ? { ...exercise.names } : undefined,
      name: exercise.name,
      names: exercise.names ? { ...exercise.names } : undefined,
      sets: { ...exercise.sets },
      reps: { ...exercise.reps },
      restMin: { ...exercise.restMin },
      weightStepKg: exercise.weightStepKg,
      logs: [],
    };
    if (exercise.notes) {
      snapshot.notes = { ...exercise.notes };
    }
    if (exercise.note) {
      snapshot.note = exercise.note;
    }
    return snapshot;
  }

  private async updateSession(id: string, recipe: (session: Session) => Session): Promise<void> {
    const current = await db.sessions.get(id);
    if (!current) {
      return;
    }
    const next = recipe(structuredClone(current));
    next.updatedAt = new Date().toISOString();
    await db.sessions.put(next);
    await this.reload();
  }

  private async reload(): Promise<void> {
    const [rawProgram, sessions] = await Promise.all([
      db.program.get('main'),
      db.sessions.orderBy('performedAt').reverse().toArray(),
    ]);
    let program = rawProgram ?? null;
    if (program) {
      const needsPersist = program.days.some(
        (day) => !day.names || !day.focuses || day.exercises.some((exercise) => !exercise.names),
      );
      program = hydrateProgramLocales(program);
      if (needsPersist) {
        program.updatedAt = new Date().toISOString();
        await db.program.put(program);
      }
    }
    this.program.set(program);
    this.sessions.set(sessions);
  }
}
