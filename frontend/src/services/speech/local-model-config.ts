/**
 * The one model the app downloads for browsers that cannot recognise speech
 * themselves.
 *
 * Multilingual rather than the English-only build: the app is shown in four
 * languages and a spoken search should work in all of them, and a single model
 * covering every one of them is the same arrangement the translator uses. The
 * smaller "tiny" tier was measured at roughly a fifth worse word error rate,
 * which falls hardest on exactly what is being said here, names of acts and
 * titles, so the larger tier is worth its extra weight. Purpose-built
 * short-utterance alternatives were considered and rejected: none publishes a
 * browser-runnable build for German or Portuguese.
 */
export const LOCAL_MODEL_ID = 'onnx-community/whisper-base';

/**
 * Approximate download size, shown before the model is fetched. Measured from the
 * weights actually requested at this quantisation: a 22 MB encoder and a 51 MB
 * merged decoder.
 */
export const LOCAL_MODEL_SIZE_MB = 73;

/**
 * The exact commit the weights come from, pinned for the same reason the
 * translation model's are: left unpinned the runtime resolves whatever the branch
 * points at now, so weights republished upstream can leave a device holding one
 * file from before the change and another from after, and a session built from the
 * pair either refuses to load or answers with nonsense. Moving to newer weights is
 * a deliberate change here, since it costs every reader the whole download a second
 * time.
 */
export const LOCAL_MODEL_REVISION = '1846881b6b3a3024392c1eea3ad983695bc23925';

/**
 * The model names languages by their bare two-letter codes, so the app's regional
 * Portuguese has to be reduced to the language itself.
 */
const MODEL_CODES: Record<string, string> = {
  en: 'en',
  es: 'es',
  'pt-BR': 'pt',
  pt: 'pt',
  de: 'de',
};

export function toModelCode(language: string): string | null {
  return MODEL_CODES[language] ?? MODEL_CODES[language.split('-')[0]] ?? null;
}

/**
 * Longest recording accepted, after which listening stops on its own. A spoken
 * search is a few words; anything beyond this is a microphone left open, and
 * transcribing it would cost far more than it could return.
 */
export const MAX_LISTEN_MS = 10_000;
