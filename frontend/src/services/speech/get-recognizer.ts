import { createNativeRecognizer, isNativeRecognizerSupported } from './native-recognizer';
import {
  createLocalModelRecognizer,
  isLocalModelDownloaded,
  isLocalModelSupported,
} from './local-model-recognizer';
import type { Recognizer } from './types';

export type RecognizerKind = 'native' | 'local-model';

/**
 * Which backend would hear a given language. The browser's own recogniser is
 * preferred wherever it exists, since it needs no download from us; everything else
 * falls back to the model the app fetches.
 */
export function resolveRecognizerKind(): RecognizerKind {
  return isNativeRecognizerSupported() ? 'native' : 'local-model';
}

/**
 * Whether listening has to wait for the reader to agree to a download.
 *
 * Only the fallback ever does: the browser's recogniser is ready as soon as it
 * exists, so where it is available the microphone works on the first press.
 */
export async function requiresDownloadConsent(): Promise<boolean> {
  if (isNativeRecognizerSupported()) return false;
  return isLocalModelSupported() && !(await isLocalModelDownloaded());
}

/** Whether either backend can hear a search at all. */
export function canListen(): boolean {
  return isNativeRecognizerSupported() || isLocalModelSupported();
}

export function createRecognizer(kind: RecognizerKind): Recognizer {
  return kind === 'native' ? createNativeRecognizer() : createLocalModelRecognizer();
}
