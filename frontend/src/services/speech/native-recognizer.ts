import { RecognizerUnavailableError, type RecognitionSession, type Recognizer } from './types';

/**
 * The browser's own SpeechRecognition, preferred wherever it exposes the API
 * because it needs no download of ours, exactly as the browser's translator is
 * preferred over the model that backs it up.
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
 * Whether the browser said it can keep the audio on the device, as last asked.
 *
 * Held here rather than looked up when needed because the answer arrives as a
 * promise and listening cannot afford to wait for one: it has to begin in the click
 * that asked for it. Unknown counts as no, which only means on-device recognition
 * is not requested on the very first attempt.
 */
let recognisesLocally = false;

/**
 * Asks whether on-device recognition is available, for the next time listening
 * starts. Called while the button is being set up, well away from the click.
 */
export async function probeLocalRecognition(language: string): Promise<void> {
  const Recognition = getConstructor();
  if (!Recognition?.available) {
    recognisesLocally = false;
    return;
  }
  try {
    recognisesLocally =
      (await Recognition.available({ langs: [language], processLocally: true })) === 'available';
  } catch {
    recognisesLocally = false;
  }
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
      // Requested only where the browser has already said it can, so that the audio
      // stays on the device and the search keeps working offline. Elsewhere the
      // default stands, and nothing here waits on an answer.
      if (recognisesLocally) recognition.processLocally = true;

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

      // Started in the same turn as the click, with nothing awaited in between.
      recognition.start();

      return {
        stop: () => recognition.stop(),
        abort: () => recognition.abort(),
        transcript,
      } satisfies RecognitionSession;
    },
  };
}
