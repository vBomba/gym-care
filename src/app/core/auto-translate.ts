import type { AppLocale } from '../i18n/locale';

const pair: Record<AppLocale, string> = {
  uk: 'uk',
  pl: 'pl',
  en: 'en',
};

async function translateWithChrome(text: string, from: AppLocale, to: AppLocale): Promise<string | null> {
  const Translator = (globalThis as { Translator?: {
    availability?: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
    create: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<{
      translate: (value: string) => Promise<string>;
    }>;
  } }).Translator;
  if (!Translator) {
    return null;
  }
  try {
    if (Translator.availability) {
      const state = await Translator.availability({
        sourceLanguage: pair[from],
        targetLanguage: pair[to],
      });
      if (state !== 'available' && state !== 'readily') {
        return null;
      }
    }
    const translator = await Translator.create({
      sourceLanguage: pair[from],
      targetLanguage: pair[to],
    });
    return (await translator.translate(text)).trim();
  } catch {
    return null;
  }
}

async function translateWithMyMemory(text: string, from: AppLocale, to: AppLocale): Promise<string> {
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}` +
    `&langpair=${pair[from]}|${pair[to]}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`translate ${response.status}`);
  }
  const data = (await response.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  const translated = data.responseData?.translatedText?.trim();
  if (!translated || (data.responseStatus && data.responseStatus !== 200)) {
    throw new Error('translate failed');
  }
  if (/^\*?\s*MYMEMORY/i.test(translated)) {
    throw new Error('translate quota');
  }
  return translated;
}

export async function autoTranslateText(
  text: string,
  from: AppLocale,
  to: AppLocale,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || from === to) {
    return trimmed;
  }
  const local = await translateWithChrome(trimmed, from, to);
  if (local) {
    return local;
  }
  return translateWithMyMemory(trimmed, from, to);
}
