import { CANONICAL, CONTENT, LEGACY_CANONICAL } from '../i18n/content';
import { LOCALES, type AppLocale } from '../i18n/locale';
import type { LocaleText, Program, ProgramDay, ProgramExercise } from './models';

export function primaryText(map: LocaleText | undefined, fallback = ''): string {
  return (
    map?.uk?.trim() ||
    map?.en?.trim() ||
    map?.pl?.trim() ||
    fallback.trim()
  );
}

export function textForLocale(
  map: LocaleText | undefined,
  locale: AppLocale,
  fallback = '',
): string {
  return map?.[locale]?.trim() || primaryText(map, fallback);
}

export function withLocaleText(
  map: LocaleText | undefined,
  locale: AppLocale,
  value: string,
): LocaleText {
  return { ...map, [locale]: value };
}

function seedMap(id: string, fallback: string): LocaleText {
  const hasCatalog = Boolean(CONTENT.uk[id]);
  const matchesCatalog =
    hasCatalog &&
    (fallback === CANONICAL[id] ||
      (LEGACY_CANONICAL[id]?.includes(fallback) ?? false) ||
      LOCALES.some((locale) => CONTENT[locale][id] === fallback));
  if (matchesCatalog) {
    const map: LocaleText = {};
    for (const locale of LOCALES) {
      map[locale] = CONTENT[locale][id] ?? fallback;
    }
    return map;
  }
  return { uk: fallback, pl: fallback, en: fallback };
}

function hydrateExercise(exercise: ProgramExercise): ProgramExercise {
  const names = exercise.names ?? seedMap(exercise.id, exercise.name);
  const noteFallback = exercise.note ?? '';
  const notes =
    exercise.notes ??
    (noteFallback ? seedMap(`${exercise.id}.note`, noteFallback) : undefined);
  const next: ProgramExercise = {
    ...exercise,
    names,
    name: primaryText(names, exercise.name),
  };
  if (notes && primaryText(notes)) {
    next.notes = notes;
    next.note = primaryText(notes);
  } else {
    delete next.notes;
    delete next.note;
  }
  return next;
}

function hydrateDay(day: ProgramDay): ProgramDay {
  const names = day.names ?? seedMap(day.id, day.name);
  const focuses = day.focuses ?? seedMap(`${day.id}.focus`, day.focus);
  return {
    ...day,
    names,
    focuses,
    name: primaryText(names, day.name),
    focus: primaryText(focuses, day.focus),
    exercises: day.exercises.map(hydrateExercise),
  };
}

export function hydrateProgramLocales(program: Program): Program {
  return {
    ...program,
    days: program.days.map(hydrateDay),
  };
}
