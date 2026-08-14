import { RecognizerUnavailableError, type RecognitionSession, type Recognizer } from './types';

/**
 * The browser's own SpeechRecognition, used only where it can be made to run on
 * the device.
 *
 * Chromium has exposed this API for years, but by default it streams the
 * microphone to the vendor's servers. The app works offline and keeps what it
 * holds on the device, so the cloud path is deliberately not used: this backend is
 * offered only when processLocally is available, which keeps recordings on the
 * machine and costs no download of ours. Everywhere else the model below takes
 * over.
 */
interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  processLocally?: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
  /** Whether on-device recognition is installed for these languages. */
  available?(options: { langs: string[]; processLocally: boolean }): Promise<string>;
  /** Asks the browser to fetch its own on-device model for these languages. */
  install?(options: { langs: string[] }): Promise<boolean>;
}

function getConstructor(): SpeechRecognitionConstructor | null {
  const scope = globalThis as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

/**
 * Whether this browser can recognise speech without sending it anywhere.
 *
 * The property only exists on builds that implement on-device recognition, so its
 * absence rules the backend out without asking about any particular language. The
 * secure-context check is separate and cannot be inferred from it: the property is
 * on the prototype either way, but the microphone is refused over plain http on
 * anything but localhost, so without this the button would offer a recognition
 * that cannot start.
 */
export function isNativeRecognizerSupported(): boolean {
  if (typeof globalThis.isSecureContext === 'boolean' && !globalThis.isSecureContext) return false;
  const Recognition = getConstructor();
  if (!Recognition) return false;
  try {
    return 'processLocally' in Recognition.prototype;
  } catch {
    return false;
  }
}

/**
 * How the browser's recogniser stands on a language:
 * - "no": it cannot run on the device for this language.
 * - "needs-install": it can, once the browser has fetched its own model.
 * - "ready": it can, right now.
 */
export type NativeState = 'no' | 'needs-install' | 'ready';

export async function getNativeState(language: string): Promise<NativeState> {
  const Recognition = getConstructor();
  if (!Recognition || !isNativeRecognizerSupported() || !Recognition.available) return 'no';
  try {
    const status = await Recognition.available({ langs: [language], processLocally: true });
    if (status === 'unavailable') return 'no';
    return status === 'available' ? 'ready' : 'needs-install';
  } catch {
    return 'no';
  }
}

/**
 * Asks the browser to fetch its own recognition model. Must be called straight
 * from a click, for the same reason the translator's language packs are: the
 * browser refuses outside a user gesture, and awaiting anything first spends it.
 */
export function installNative(language: string): Promise<boolean> | null {
  const Recognition = getConstructor();
  if (!Recognition?.install) return null;
  return Recognition.install({ langs: [language] }).catch(() => false);
}

export function createNativeRecognizer(): Recognizer {
  return {
    id: 'native',
    listen(language) {
      const Recognition = getConstructor();
      if (!Recognition) {
        throw new RecognizerUnavailableError('SpeechRecognition is not available');
      }

      const recognition = new Recognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.processLocally = true;

      let heard = '';
      const transcript = new Promise<string>((resolve, reject) => {
        recognition.onresult = (event) => {
          for (let i = 0; i < event.results.length; i += 1) {
            const result = event.results[i];
            if (result.isFinal) heard += result[0].transcript;
          }
        };
        // "no-speech" and "aborted" are ordinary outcomes of a reader who changed
        // their mind, so they settle empty rather than as failures.
        recognition.onerror = (event) => {
          const error = event.error ?? 'unknown';
          if (error === 'no-speech' || error === 'aborted') resolve('');
          else reject(new RecognizerUnavailableError(`Speech recognition failed: ${error}`));
        };
        // Settled on end rather than on the first result, so a recognition that
        // hears nothing finishes as an empty transcript instead of hanging.
        recognition.onend = () => resolve(heard.trim());
      });

      recognition.start();

      return Promise.resolve<RecognitionSession>({
        stop: () => recognition.stop(),
        abort: () => recognition.abort(),
        transcript,
      });
    },
  };
}
