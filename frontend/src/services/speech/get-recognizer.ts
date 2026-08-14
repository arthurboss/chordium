import {
  createNativeRecognizer,
  getNativeState,
  isNativeRecognizerSupported,
} from './native-recognizer';
import {
  createLocalModelRecognizer,
  isLocalModelDownloaded,
  isLocalModelSupported,
} from './local-model-recognizer';
import type { Recognizer } from './types';

export type RecognizerKind = 'native' | 'local-model';

/**
 * Which backend would hear a given language. The browser's own recogniser is
 * preferred wherever it can run on the device, since it needs no download from
 * us; everything else falls back to the model the app fetches.
 */
export async function resolveRecognizerKind(language: string): Promise<RecognizerKind> {
  return (await getNativeState(language)) === 'no' ? 'local-model' : 'native';
}

/**
 * Whether listening in this language has to wait for the reader to ask for it.
 *
 * Both backends can need it: the browser refuses to fetch its recognition model
 * outside a click, and ours is a large download worth agreeing to. Either way the
 * work is deferred until the microphone is pressed.
 */
export async function requiresDownloadConsent(language: string): Promise<boolean> {
  const native = await getNativeState(language);
  if (native === 'ready') return false;
  if (native === 'needs-install') return true;
  return isLocalModelSupported() && !(await isLocalModelDownloaded());
}

/** Whether either backend can hear this language at all. */
export async function canListen(language: string): Promise<boolean> {
  if (isNativeRecognizerSupported() && (await getNativeState(language)) !== 'no') return true;
  return isLocalModelSupported();
}

export function createRecognizer(kind: RecognizerKind): Recognizer {
  return kind === 'native' ? createNativeRecognizer() : createLocalModelRecognizer();
}
