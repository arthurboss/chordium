/**
 * The fallback's one model, for browsers with no translator of their own.
 *
 * A single multilingual model covers every language the app offers, in any
 * direction. Per-language models would be a fraction of the size, but no small
 * model published for this runtime can be told reliably which language to answer
 * in: the multilingual Romance model drifts between Portuguese, Spanish and
 * French from one line to the next, even when asked for one of them. This model
 * takes the languages as arguments and honours them.
 */
export const LOCAL_MODEL_ID = 'Xenova/nllb-200-distilled-600M';

/**
 * Approximate download size, shown before the model is fetched. Measured from the
 * weights actually requested; every other quantisation this model publishes is
 * larger, and it is the only one the runtime can build a session from.
 */
export const LOCAL_MODEL_SIZE_MB = 850;

/** The model names languages by its own script-qualified codes. */
const MODEL_CODES: Record<string, string> = {
  en: 'eng_Latn',
  es: 'spa_Latn',
  'pt-BR': 'por_Latn',
  pt: 'por_Latn',
  de: 'deu_Latn',
};

export function toModelCode(language: string): string | null {
  return MODEL_CODES[language] ?? MODEL_CODES[language.split('-')[0]] ?? null;
}
