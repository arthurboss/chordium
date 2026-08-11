/** Languages the app can translate lyrics into, matching the available UI locales. */
export const TRANSLATABLE_LANGUAGES = ['en', 'es', 'pt-BR', 'de'] as const;

export type TranslatableLanguage = (typeof TRANSLATABLE_LANGUAGES)[number];

export function isTranslatableLanguage(lang: string): lang is TranslatableLanguage {
  return (TRANSLATABLE_LANGUAGES as readonly string[]).includes(lang);
}

/** Lyrics come from the source site in Brazilian Portuguese. */
export const LYRICS_SOURCE_LANGUAGE: TranslatableLanguage = 'pt-BR';

export interface Translator {
  /** Identifies which backend produced a translation, for logging and tests. */
  readonly id: 'chrome' | 'local-model';
  translate(text: string, from: string, to: string): Promise<string>;
}

/**
 * Thrown when a translator cannot run at all, as opposed to failing on one
 * input. Callers treat this as "try the next translator".
 */
export class TranslatorUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranslatorUnavailableError';
  }
}

/**
 * Translates stanza by stanza and line by line, preserving the blank lines
 * between stanzas. Every backend translates a single line at a time (models
 * truncate long input, and both Chrome's API and NLLB otherwise collapse
 * newlines into spaces), so this is shared rather than reimplemented per backend.
 */
export async function translateLineByLine(
  text: string,
  translateOne: (line: string) => Promise<string>
): Promise<string> {
  const stanzas = text.split(/\n{2,}/);
  const translated: string[] = [];
  for (const stanza of stanzas) {
    const trimmed = stanza.trim();
    if (!trimmed) {
      translated.push('');
      continue;
    }
    const lines: string[] = [];
    for (const line of trimmed.split('\n')) {
      if (!line.trim()) {
        lines.push('');
        continue;
      }
      lines.push(await translateOne(line));
    }
    translated.push(lines.join('\n'));
  }
  return translated.join('\n\n');
}
