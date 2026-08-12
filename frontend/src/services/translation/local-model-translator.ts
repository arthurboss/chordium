import { TranslatorUnavailableError, translateLineByLine, type Translator } from './types';

/**
 * Fallback translator for browsers without the Translator API. Runs an NLLB
 * model in the page via WebAssembly, which means a one-off model download the
 * user has to agree to; see requiresDownloadConsent.
 */
export const LOCAL_MODEL_ID = 'Xenova/nllb-200-distilled-600M';

/** Approximate download size, shown to the user before the model is fetched. */
export const LOCAL_MODEL_SIZE_MB = 600;

/** NLLB identifies languages by its own script-qualified codes. */
const NLLB_CODES: Record<string, string> = {
  en: 'eng_Latn',
  es: 'spa_Latn',
  'pt-BR': 'por_Latn',
  pt: 'por_Latn',
  de: 'deu_Latn',
};

function toNllbCode(lang: string): string {
  const code = NLLB_CODES[lang] ?? NLLB_CODES[lang.split('-')[0]];
  if (!code) throw new TranslatorUnavailableError(`Unsupported language: ${lang}`);
  return code;
}

type TranslationPipeline = (
  text: string,
  options: { src_lang: string; tgt_lang: string }
) => Promise<Array<{ translation_text: string }>>;

let pipelinePromise: Promise<TranslationPipeline> | null = null;

/**
 * The model weights are large, so the library and the model are only fetched
 * once a translation is actually requested, and then reused.
 */
async function getPipeline(onProgress?: (ratio: number) => void): Promise<TranslationPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      return (await pipeline('translation', LOCAL_MODEL_ID, {
        progress_callback: (event: { status?: string; progress?: number }) => {
          if (event.status === 'progress' && typeof event.progress === 'number') {
            onProgress?.(event.progress / 100);
          }
        },
      })) as unknown as TranslationPipeline;
    })().catch((error) => {
      // Allow a later attempt to retry instead of replaying this failure.
      pipelinePromise = null;
      throw error;
    });
  }
  return pipelinePromise;
}

/** Whether the model has already been fetched, so no consent is needed again. */
export function isLocalModelLoaded(): boolean {
  return pipelinePromise !== null;
}

/** Fetches the model up front, so it is there before any lyrics need it. */
export async function downloadLocalModel(onProgress?: (ratio: number) => void): Promise<void> {
  await getPipeline(onProgress);
}

/**
 * Whether the weights are on the device from an earlier visit. The library
 * stores them in the Cache API under the model's own name, so their presence is
 * read from there rather than from this session's state.
 */
export async function isLocalModelDownloaded(): Promise<boolean> {
  if (!isLocalModelSupported()) return false;
  try {
    for (const name of await caches.keys()) {
      const cached = await (await caches.open(name)).keys();
      if (cached.some((request) => request.url.includes(LOCAL_MODEL_ID))) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Removes the weights from the device. Unlike the browser's own language packs,
 * this model is ours to delete, and it is large enough to be worth reclaiming.
 */
export async function deleteLocalModel(): Promise<void> {
  pipelinePromise = null;
  if (!isLocalModelSupported()) return;
  try {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (request.url.includes(LOCAL_MODEL_ID)) await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('Failed to delete the translation model:', error);
  }
}

/**
 * The model is cached through the Cache API, which only exists in a secure
 * context. Over plain http on anything but localhost it is absent and loading
 * the model would stall with no error, so the caller is told up front instead.
 */
export function isLocalModelSupported(): boolean {
  return typeof caches !== 'undefined';
}

export function createLocalModelTranslator(onProgress?: (ratio: number) => void): Translator {
  return {
    id: 'local-model',
    async translate(text, from, to) {
      if (!isLocalModelSupported()) {
        throw new TranslatorUnavailableError(
          'Translation needs a secure context (https or localhost)'
        );
      }
      const translator = await getPipeline(onProgress);
      const src_lang = toNllbCode(from);
      const tgt_lang = toNllbCode(to);

      // The model truncates long inputs, and lyrics are far longer than its
      // window, so each line is translated on its own.
      return translateLineByLine(text, async (line) => {
        const [result] = await translator(line, { src_lang, tgt_lang });
        return result?.translation_text ?? line;
      });
    },
  };
}
