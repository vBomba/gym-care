export type AppLocale = 'uk' | 'pl' | 'en';

export const LOCALES: AppLocale[] = ['uk', 'pl', 'en'];

export const LOCALE_LABEL: Record<AppLocale, string> = {
  uk: 'UA',
  pl: 'PL',
  en: 'EN',
};

export const LOCALE_TAG: Record<AppLocale, string> = {
  uk: 'uk-UA',
  pl: 'pl-PL',
  en: 'en-GB',
};

export const STORAGE_KEY = 'gym-care.locale';
