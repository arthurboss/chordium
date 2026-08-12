import { createChromeTranslator, getChromePairState, warmChromePair } from './chrome-translator';
import {
  createLocalModelTranslator,
  isLanguageDownloaded,
  isLocalModelSupported,
  type LocalProgress,
  type TranslationPhase,
} from './local-model-translator';
import { isTranslatableLanguage, type Translator } from './types';

export type TranslatorKind = 'chrome' | 'local-model';

/** How far along a translation is, and at what: fetching, or translating. */
export type TranslationProgress = LocalProgress;
export type { TranslationPhase };

/**
 * Which backend would handle a given language pair. Chrome's API is preferred
 * wherever it can serve the pair, since it needs no download; everything else
 * falls back to the bundled models. Chrome can also fail at translate() time, in
 * which case translateLyrics retries with the fallback.
 */
export async function resolveTranslatorKind(from: string, to: string): Promise<TranslatorKind> {
  return (await getChromePairState(from, to)) === 'no' ? 'local-model' : 'chrome';
}

/**
 * Whether translating this pair has to wait for the reader to ask for it.
 *
 * Both backends can need it: the browser refuses to fetch a language pack
 * outside a click, and the fallback's models are a large download worth agreeing
 * to. Either way the work is deferred until the toggle is pressed.
 */
export async function requiresDownloadConsent(from: string, to: string): Promise<boolean> {
  const chromeState = await getChromePairState(from, to);
  if (chromeState === 'ready') return false;
  if (chromeState === 'needs-gesture') return true;
  if (!isLocalModelSupported()) return false;
  // Only ask when something is actually missing: both sides of the pair have to
  // be on the device before a translation can run without a download.
  const pair = [from, to].filter(isTranslatableLanguage);
  const ready = await Promise.all(pair.map(isLanguageDownloaded));
  return ready.some((isReady) => !isReady);
}

/** Whether either backend can translate this pair at all. */
export async function canTranslate(from: string, to: string): Promise<boolean> {
  return (await getChromePairState(from, to)) !== 'no' || isLocalModelSupported();
}

/**
 * Begins any download the pair needs, called from the click that asked for the
 * translation so the browser accepts it. Returns once the pack is in hand, or
 * immediately when the fallback will be used instead, which reports its own
 * progress as it goes.
 */
export async function prepareTranslator(
  from: string,
  to: string,
  onProgress?: (ratio: number) => void
): Promise<void> {
  const warming = warmChromePair(from, to, onProgress);
  if (warming) await warming;
}

export function createTranslator(
  kind: TranslatorKind,
  onProgress?: (progress: TranslationProgress) => void
): Translator {
  return kind === 'chrome' ? createChromeTranslator() : createLocalModelTranslator(onProgress);
}

export interface TranslateLyricsOptions {
  from: string;
  to: string;
  onProgress?: (progress: TranslationProgress) => void;
}

/**
 * Translates lyrics with the best available backend, falling back to the local
 * models when Chrome's API is chosen but then fails.
 */
export async function translateLyrics(
  text: string,
  { from, to, onProgress }: TranslateLyricsOptions
): Promise<string> {
  const kind = await resolveTranslatorKind(from, to);
  try {
    return await createTranslator(kind, onProgress).translate(text, from, to);
  } catch (error) {
    if (kind !== 'chrome') throw error;
    console.warn('Translator API failed, falling back to the local model:', error);
    return createTranslator('local-model', onProgress).translate(text, from, to);
  }
}
