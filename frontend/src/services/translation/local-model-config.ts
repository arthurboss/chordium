/**
 * The fallback's one model, for browsers with no translator of their own.
 *
 * M2M-100 418M is 50% smaller than NLLB (400MB vs 850MB) while supporting all
 * four languages. It uses simpler language codes (ISO 639-1) instead of NLLB's
 * script-qualified codes. Trade-off: smaller download size at potential cost of
 * translation quality compared to NLLB's specialized approach.
 */
export const LOCAL_MODEL_ID = 'Xenova/m2m100_418M';

/**
 * Estimated download size. M2M-100 418M is roughly half the size of NLLB 600M.
 * Measured as the ONNX quantized weights.
 */
export const LOCAL_MODEL_SIZE_MB = 400;

/** M2M-100 uses simple ISO 639-1 language codes. */
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
