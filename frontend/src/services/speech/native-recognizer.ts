import { RecognizerUnavailableError, type RecognitionSession, type Recognizer } from './types';

/**
 * The browser's own SpeechRecognition, preferred wherever it exists because it
 * needs no download of ours, exactly as the browser's translator is preferred over
 * the model that backs it up.
 *
 * Where the browser can recognise on the device it is asked to, which also keeps
 * the feature working offline. Where it cannot, it recognises through its vendor
 * instead, which still costs the reader nothing to set up.
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
  /** Only on builds that implement on-device recognition. */
  available?(options: { langs: string[]; processLocally: boolean }): Promise<string>;
}

function getConstructor(): SpeechRecognitionConstructor | null {
  const scope = globalThis as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

/**
 * Whether the browser can hear a search at all.
 *
 * The secure-context check is not about privacy but about whether it can run: the
 * microphone is refused over plain http on anything but localhost, so without this
 * the button would offer a recognition that cannot start.
 */
export function isNativeRecognizerSupported(): boolean {
  if (typeof globalThis.isSecureContext === 'boolean' && !globalThis.isSecureContext) return false;
  return getConstructor() !== null;
}

/**
 * Whether this browser would keep the audio on the device for a language. Nothing
 * depends on the answer being yes: it decides only whether to ask for on-device
 * recognition, since asking for it where it is unavailable fails the whole
 * recognition rather than falling back by itself.
 */
async function canRecogniseLocally(language: string): Promise<boolean> {
  const Recognition = getConstructor();
  if (!Recognition?.available) return false;
  try {
    return (await Recognition.available({ langs: [language], processLocally: true })) === 'available';
  } catch {
    return false;
  }
}

export function createNativeRecognizer(): Recognizer {
  return {
    id: 'native',
    async listen(language) {
      const Recognition = getConstructor();
      if (!Recognition) {
        throw new RecognizerUnavailableError('SpeechRecognition is not available');
      }

      const recognition = new Recognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      // Asked for only where it is offered, so that the audio stays on the device
      // and the search keeps working offline. Elsewhere the default stands.
      if (await canRecogniseLocally(language)) recognition.processLocally = true;

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

      return {
        stop: () => recognition.stop(),
        abort: () => recognition.abort(),
        transcript,
      } satisfies RecognitionSession;
    },
  };
}
