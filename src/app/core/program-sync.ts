import { CANONICAL, CONTENT, LEGACY_CANONICAL } from '../i18n/content';
import { LOCALES } from '../i18n/locale';
import { hydrateProgramLocales, primaryText } from './locale-text';
import type { LocaleText, Program, ProgramExercise, SeedFile } from './models';

const PATCH_KEY = 'gym-care.program-patch';
const PATCH_ID = 'rest15-squat-ohp-2026-11';

function catalogMap(id: string): LocaleText {
  const map: LocaleText = {};
  for (const locale of LOCALES) {
    map[locale] = CONTENT[locale][id] ?? '';
  }
  return map;
}

function isSeedLabel(id: string, value: string | undefined): boolean {
  if (!value) {
    return true;
  }
  if (value === CANONICAL[id]) {
    return true;
  }
  if (LEGACY_CANONICAL[id]?.includes(value)) {
    return true;
  }
  return LOCALES.some((locale) => CONTENT[locale][id] === value);
}

function applySeedExercise(
  exercise: ProgramExercise,
  seed: { name: string; restMin: ProgramExercise['restMin']; note?: string },
  forceRename: boolean,
): ProgramExercise {
  const next: ProgramExercise = {
    ...exercise,
    restMin: { ...seed.restMin },
  };

  if (forceRename || isSeedLabel(exercise.id, exercise.name)) {
    next.name = seed.name;
    next.names = catalogMap(exercise.id);
  }

  const noteId = `${exercise.id}.note`;
  if (seed.note) {
    if (forceRename || isSeedLabel(noteId, exercise.note) || !exercise.note) {
      next.note = seed.note;
      next.notes = catalogMap(noteId);
    }
  } else if (forceRename && (exercise.id === 'day-a-6' || isSeedLabel(noteId, exercise.note))) {
    delete next.note;
    delete next.notes;
  }

  next.name = primaryText(next.names, next.name);
  if (next.notes) {
    next.note = primaryText(next.notes) || undefined;
    if (!next.note) {
      delete next.note;
      delete next.notes;
    }
  }
  return next;
}

export function needsProgramPatch(): boolean {
  try {
    return localStorage.getItem(PATCH_KEY) !== PATCH_ID;
  } catch {
    return true;
  }
}

export function markProgramPatched(): void {
  try {
    localStorage.setItem(PATCH_KEY, PATCH_ID);
  } catch {
    /* ignore */
  }
}

export function applyProgramSeedPatch(program: Program, seed: SeedFile): Program {
  const seedById = new Map<string, { name: string; restMin: ProgramExercise['restMin']; note?: string }>();
  for (const day of seed.days) {
    for (const exercise of day.exercises) {
      seedById.set(`${day.id}-${exercise.order}`, {
        name: exercise.name,
        restMin: exercise.restMin,
        note: exercise.note,
      });
    }
  }

  const patched: Program = {
    ...program,
    days: program.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => {
        const seedExercise = seedById.get(exercise.id);
        if (!seedExercise) {
          return exercise;
        }
        const forceRename = exercise.id === 'day-a-3' || exercise.id === 'day-a-6';
        return applySeedExercise(exercise, seedExercise, forceRename);
      }),
    })),
    updatedAt: new Date().toISOString(),
  };

  return hydrateProgramLocales(patched);
}
