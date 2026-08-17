import {
  MicrophoneUnavailableError,
  RecognizerUnavailableError,
  type RecognitionSession,
  type Recognizer,
} from './types';

/**
 * The browser's own SpeechRecognition, preferred wherever it exposes the API
 * because it needs no download of ours, exactly as the browser's translator is
 * preferred over the model that backs it up.
 *
 * Recognition is left to the browser's default, which recognises through its
 * vendor. On-device recognition is deliberately never requested: asking for it
 * kills the renderer process outright on several Chromium builds. See
 * `createNativeRecognizer` below.
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
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
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
      // On-device recognition is never asked for, neither by probing
      // SpeechRecognition.available({processLocally: true}) nor by setting
      // `processLocally` here. Both reach for media.mojom.OnDeviceSpeechRecognition,
      // and on Chromium builds that advertise the API without providing that
      // interface (Samsung Internet, and Perplexity's Comet) the browser kills the
      // renderer process on the spot: "No binder found for interface
      // media.mojom.OnDeviceSpeechRecognition". That happens below the JS layer, so
      // it cannot be caught, and Comet reports an unmodified Chrome user agent, so
      // affected builds cannot be told apart from a working one beforehand. Vendor
      // recognition, which is the default, works on all of them.

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
          // Told apart from any other failure so that the reader is asked for the
          // microphone again rather than shown a fault they cannot act on.
          else if (error === 'not-allowed' || error === 'service-not-allowed')
            reject(new MicrophoneUnavailableError(`The microphone was refused: ${error}`));
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
