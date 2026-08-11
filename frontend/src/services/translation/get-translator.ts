import { createChromeTranslator, getChromePairState, warmChromePair } from './chrome-translator';
import {
  createLocalModelTranslator,
  isLocalModelLoaded,
  isLocalModelSupported,
} from './local-model-translator';
import type { Translator } from './types';

export type TranslatorKind = 'chrome' | 'local-model';

/**
 * Which backend would handle a given language pair. Chrome's API is preferred
 * wherever it can serve the pair, since it needs no download; everything else
 * falls back to the bundled model. Chrome can also fail at translate() time, in
 * which case translateLyrics retries with the fallback.
 */
export async function resolveTranslatorKind(from: string, to: string): Promise<TranslatorKind> {
  return (await getChromePairState(from, to)) === 'no' ? 'local-model' : 'chrome';
}

/**
 * Whether translating this pair has to wait for the reader to ask for it.
 *
 * Both backends can need it: the browser refuses to fetch a language pack
 * outside a click, and the bundled model is a large download worth agreeing to.
 * Either way the work is deferred until the toggle is pressed.
 */
export async function requiresDownloadConsent(from: string, to: string): Promise<boolean> {
  const chromeState = await getChromePairState(from, to);
  if (chromeState === 'ready') return false;
  if (chromeState === 'needs-gesture') return true;
  return isLocalModelSupported() && !isLocalModelLoaded();
}

/** Whether either backend can translate this pair at all. */
export async function canTranslate(from: string, to: string): Promise<boolean> {
  return (await getChromePairState(from, to)) !== 'no' || isLocalModelSupported();
}

/**
 * Begins any download the pair needs, called from the click that asked for the
 * translation so the browser accepts it. Returns once the pack is in hand, or
 * immediately when the fallback model will be used instead.
 */
export async function prepareTranslator(from: string, to: string): Promise<void> {
  const warming = warmChromePair(from, to);
  if (warming) await warming;
}

export function createTranslator(
  kind: TranslatorKind,
  onProgress?: (ratio: number) => void
): Translator {
  return kind === 'chrome' ? createChromeTranslator() : createLocalModelTranslator(onProgress);
}

export interface TranslateLyricsOptions {
  from: string;
  to: string;
  onProgress?: (ratio: number) => void;
}

/**
 * Translates lyrics with the best available backend, falling back to the local
 * model when Chrome's API is chosen but then fails. The fallback downloads a
 * model, so it only runs when the caller has already accepted that cost.
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
