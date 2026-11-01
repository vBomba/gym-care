import type { AppLocale } from './locale';

/** Canonical Ukrainian seed strings used to detect unedited program content. */
export const CANONICAL: Record<string, string> = {
  program: 'Full Body: Фокус на Верх + Улюблені вправи',
  'day-a': 'День А: Жим + Молитва',
  'day-a.focus': 'Груди, плечі та верх преса',
  'day-a-1': 'Жим штанги лежачи (або на похилій лаві)',
  'day-a-2': 'Підтягування з вагою (або тяга верхнього блоку)',
  'day-a-3': 'Жим гантелей сидячи / жим штанги стоячи',
  'day-a-3.note': 'Чергувати між тренуваннями',
  'day-a-4': 'Махи гантелями в сторони',
  'day-a-5': 'Згинання рук на біцепс зі штангою',
  'day-a-6': 'Присід зі штангою',
  'day-a-7': 'Скручування на нижньому блоці («молитва»)',
  'day-a-7.note': 'З прогресією ваги',
  'day-b': 'День Б: Станова + Підйом ніг у висі',
  'day-b.focus': 'Спина, задня поверхня і низ преса',
  'day-b-1': 'Станова тяга класична (або сумо)',
  'day-b-2': 'Жим штанги на похилій лаві (груди/плечі)',
  'day-b-3': 'Тяга штанги в нахилі до пояса (товщина спини)',
  'day-b-4': 'Віджимання на брусах з вагою (груди/трицепс)',
  'day-b-5': 'Зворотно-похилі розведення (задня дельта)',
  'day-b-6': 'Підйом ніг у висі на перекладині',
  'day-b-6.note': 'Можна з гантеллю між стопами',
};

/** Older Ukrainian labels still treated as catalog matches during migration. */
export const LEGACY_CANONICAL: Record<string, string[]> = {
  'day-a-3': ['Жим гантелей сидячи (дельти)'],
  'day-a-6': ['Жим ногами в тренажері (підтримуюче для ніг)'],
};

type ContentDict = Record<string, string>;

const uk: ContentDict = { ...CANONICAL };

const pl: ContentDict = {
  program: 'Full Body: Fokus na górę + ulubione ćwiczenia',
  'day-a': 'Dzień A: Wyciskanie + Modlitwa',
  'day-a.focus': 'Klatka, barki i górny brzuch',
  'day-a-1': 'Wyciskanie sztangi leżąc (lub na skośnej ławce)',
  'day-a-2': 'Podciąganie z obciążeniem (lub ściąganie wyciągu)',
  'day-a-3': 'Wyciskanie hantli siedząc / wyciskanie sztangi stojąc',
  'day-a-3.note': 'Naprzemiennie między treningami',
  'day-a-4': 'Unoszenie hantli bokiem',
  'day-a-5': 'Uginanie ramion ze sztangą (biceps)',
  'day-a-6': 'Przysiad ze sztangą',
  'day-a-7': 'Spięcia na dolnym wyciągu («modlitwa»)',
  'day-a-7.note': 'Z progresją obciążenia',
  'day-b': 'Dzień B: Martwy ciąg + Unoszenie nóg w zwisie',
  'day-b.focus': 'Plecy, tył ud i dolny brzuch',
  'day-b-1': 'Martwy ciąg klasyczny (lub sumo)',
  'day-b-2': 'Wyciskanie sztangi na skośnej ławce (klatka/barki)',
  'day-b-3': 'Wiosłowanie sztangą w opadzie (grubość pleców)',
  'day-b-4': 'Pompki na poręczach z obciążeniem (klatka/triceps)',
  'day-b-5': 'Rozpiętki w opadzie (tylny bark)',
  'day-b-6': 'Unoszenie nóg w zwisie na drążku',
  'day-b-6.note': 'Można z hantlem między stopami',
};

const en: ContentDict = {
  program: 'Full Body: Upper focus + favourite lifts',
  'day-a': 'Day A: Press + Prayer',
  'day-a.focus': 'Chest, shoulders and upper abs',
  'day-a-1': 'Barbell bench press (or incline)',
  'day-a-2': 'Weighted pull-ups (or lat pulldown)',
  'day-a-3': 'Seated dumbbell press / standing barbell press',
  'day-a-3.note': 'Alternate between workouts',
  'day-a-4': 'Dumbbell lateral raises',
  'day-a-5': 'Barbell biceps curl',
  'day-a-6': 'Barbell squat',
  'day-a-7': 'Cable crunch («prayer»)',
  'day-a-7.note': 'With weight progression',
  'day-b': 'Day B: Deadlift + Hanging leg raise',
  'day-b.focus': 'Back, posterior chain and lower abs',
  'day-b-1': 'Conventional deadlift (or sumo)',
  'day-b-2': 'Incline barbell press (chest/shoulders)',
  'day-b-3': 'Barbell bent-over row (back thickness)',
  'day-b-4': 'Weighted dips (chest/triceps)',
  'day-b-5': 'Bent-over reverse fly (rear delt)',
  'day-b-6': 'Hanging leg raise',
  'day-b-6.note': 'Can hold a dumbbell between the feet',
};

export const CONTENT: Record<AppLocale, ContentDict> = { uk, pl, en };

const aliases = new Map<string, string>();
for (const locale of Object.keys(CONTENT) as AppLocale[]) {
  for (const [id, text] of Object.entries(CONTENT[locale])) {
    aliases.set(text, id);
  }
}
for (const [id, texts] of Object.entries(LEGACY_CANONICAL)) {
  for (const text of texts) {
    aliases.set(text, id);
  }
}

export function contentIdFor(text: string | undefined | null): string | null {
  if (!text) {
    return null;
  }
  return aliases.get(text) ?? null;
}

export function translateContent(
  locale: AppLocale,
  id: string | null | undefined,
  fallback: string,
): string {
  if (!id) {
    return fallback;
  }
  return CONTENT[locale][id] ?? fallback;
}

export function displayContent(
  locale: AppLocale,
  id: string | null | undefined,
  stored: string,
): string {
  if (!id) {
    return stored;
  }
  const translated = CONTENT[locale][id];
  if (!translated) {
    return stored;
  }
  const known =
    aliases.has(stored) ||
    stored === CANONICAL[id] ||
    (LEGACY_CANONICAL[id]?.includes(stored) ?? false);
  return known || !stored ? translated : stored;
}
