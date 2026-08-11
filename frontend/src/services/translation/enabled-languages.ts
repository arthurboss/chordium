import { isTranslatableLanguage, type TranslatableLanguage } from './types';

const STORAGE_KEY = 'chordium-lyrics-translation-languages';

/**
 * The languages the reader has turned on for translating lyrics.
 *
 * The browser gives no way to uninstall a language it has fetched, so whether a
 * language is on for this app is kept here instead. Without it, turning one off
 * would appear to do nothing: the browser would still report it as present and
 * the list would offer no way back.
 */
export function getEnabledLanguages(): TranslatableLanguage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is TranslatableLanguage =>
      typeof item === 'string' && isTranslatableLanguage(item)
    ) : [];
  } catch {
    return [];
  }
}

export function setLanguageEnabled(language: TranslatableLanguage, enabled: boolean): void {
  const current = new Set(getEnabledLanguages());
  if (enabled) current.add(language);
  else current.delete(language);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
  } catch (error) {
    console.warn('Failed to record which languages are on:', error);
  }
}
