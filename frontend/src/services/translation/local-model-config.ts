import { TRANSLATABLE_LANGUAGES, type TranslatableLanguage } from './types';

/**
 * Small per-language models, with English as the hub.
 *
 * One model per direction keeps each download to around a hundred megabytes and
 * lets a reader take only the languages they want, rather than one bundle
 * covering every language at eight times the size. English needs nothing of its
 * own: everything reaches everything else through it.
 */
interface LanguageModels {
  /** Translates English into this language. */
  fromEnglish: string;
  /** Translates this language into English. */
  toEnglish: string;
  /** Rough download size for both, in megabytes. */
  sizeMb: number;
}

/**
 * Portuguese has no direct model published for the runtime, so it goes through
 * the Romance-language pair, which outputs Portuguese. Its sibling languages are
 * served by their own direct models instead: the Romance model ignores the token
 * that is supposed to pick between them and always answers in Portuguese.
 */
const LANGUAGE_MODELS: Record<Exclude<TranslatableLanguage, 'en'>, LanguageModels> = {
  de: {
    fromEnglish: 'Xenova/opus-mt-en-de',
    toEnglish: 'Xenova/opus-mt-de-en',
    sizeMb: 202,
  },
  es: {
    fromEnglish: 'Xenova/opus-mt-en-es',
    toEnglish: 'Xenova/opus-mt-es-en',
    sizeMb: 202,
  },
  'pt-BR': {
    fromEnglish: 'Xenova/opus-mt-en-ROMANCE',
    toEnglish: 'Xenova/opus-mt-ROMANCE-en',
    sizeMb: 214,
  },
};

export const HUB_LANGUAGE: TranslatableLanguage = 'en';

export function isHubLanguage(language: string): boolean {
  return language === HUB_LANGUAGE;
}

/** The models a language needs before it can be translated to or from. */
export function modelsForLanguage(language: TranslatableLanguage): string[] {
  if (isHubLanguage(language)) return [];
  const models = LANGUAGE_MODELS[language];
  return [models.fromEnglish, models.toEnglish];
}

export function downloadSizeMbFor(language: TranslatableLanguage): number {
  return isHubLanguage(language) ? 0 : LANGUAGE_MODELS[language].sizeMb;
}

/** Every language that has to be downloaded before it can be used. */
export const DOWNLOADABLE_LANGUAGES = TRANSLATABLE_LANGUAGES.filter(
  (language) => !isHubLanguage(language)
);

export interface TranslationStep {
  model: string;
}

/**
 * The models to run a line through, in order, to get from one language to
 * another. Anything that is not already English is taken there first, because
 * that is the only language every model has in common.
 */
export function routeBetween(
  from: TranslatableLanguage,
  to: TranslatableLanguage
): TranslationStep[] {
  const steps: TranslationStep[] = [];
  if (!isHubLanguage(from)) steps.push({ model: LANGUAGE_MODELS[from].toEnglish });
  if (!isHubLanguage(to)) steps.push({ model: LANGUAGE_MODELS[to].fromEnglish });
  return steps;
}
