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

/** What the library reports as it fetches each of the model's files. */
interface FileProgressEvent {
  status?: string;
  file?: string;
  loaded?: number;
  total?: number;
}

/**
 * Turns the library's per-file reports into one figure for the whole download.
 *
 * Each file reports its own percentage, so passing those straight through makes
 * the reading lurch about as the files interleave. Bytes are summed across every
 * file instead, and the figure is never allowed to fall.
 */
function aggregateProgress(onProgress?: (ratio: number) => void) {
  const files = new Map<string, { loaded: number; total: number }>();
  let highest = 0;

  return (event: FileProgressEvent) => {
    if (!onProgress || !event.file) return;

    if (event.status === 'done') {
      const known = files.get(event.file);
      if (known) files.set(event.file, { loaded: known.total, total: known.total });
    } else if (typeof event.total === 'number') {
      files.set(event.file, { loaded: event.loaded ?? 0, total: event.total });
    }

    let loaded = 0;
    let announced = 0;
    for (const file of files.values()) {
      loaded += file.loaded;
      announced += file.total;
    }

    // Files are announced as the download goes along, so early on the announced
    // total is a small fraction of the real one and the first few tiny files
    // would read as the whole thing being finished. The model's known size holds
    // the denominator down until the real figure overtakes it.
    const total = Math.max(announced, LOCAL_MODEL_SIZE_MB * 1024 * 1024);

    // Held just short of the end, because finishing is announced by the download
    // resolving rather than by the bytes adding up.
    const ratio = Math.min(loaded / total, 0.99);
    if (ratio > highest) {
      highest = ratio;
      onProgress(highest);
    }
  };
}

/**
 * Counts downloads so a cancellation can be told apart from a later attempt. The
 * library gives no way to abort its own requests, so cancelling stops the app
 * acting on the result and clears whatever reached the cache once it stops.
 */
let downloadGeneration = 0;
let cancelledGeneration = -1;

/**
 * The model weights are large, so the library and the model are only fetched
 * once a translation is actually requested, and then reused.
 */
async function getPipeline(onProgress?: (ratio: number) => void): Promise<TranslationPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      return (await pipeline('translation', LOCAL_MODEL_ID, {
        progress_callback: aggregateProgress(onProgress),
      })) as unknown as TranslationPipeline;
    })().catch((error) => {
      // Allow a later attempt to retry instead of replaying this failure.
      pipelinePromise = null;
      throw error;
    });
  }
  return pipelinePromise;
}

export type DownloadOutcome = 'completed' | 'cancelled';

/**
 * Fetches the model up front, so it is there before any lyrics need it. Stopping
 * partway leaves nothing behind: whatever arrived is cleared once the library
 * stops writing, so the next attempt starts fresh rather than from half a model.
 */
export async function downloadLocalModel(
  onProgress?: (ratio: number) => void
): Promise<DownloadOutcome> {
  const generation = ++downloadGeneration;
  const isCancelled = () => cancelledGeneration >= generation;
  try {
    await getPipeline((ratio) => {
      if (!isCancelled()) onProgress?.(ratio);
    });
    if (!isCancelled()) return 'completed';
  } catch (error) {
    if (!isCancelled()) throw error;
  }
  // Only tidy up when nothing newer has taken over, or this would delete the
  // model a later attempt is busy fetching.
  if (downloadGeneration === generation) await deleteLocalModel();
  return 'cancelled';
}

/**
 * Calls off a download in progress. The caller can move on straight away; the
 * cache is cleared in the background once the library stops.
 */
export function cancelLocalModelDownload(): void {
  cancelledGeneration = downloadGeneration;
  // A later attempt must build its own pipeline rather than join this one.
  pipelinePromise = null;
  // What has already arrived goes now; the download itself clears anything the
  // library writes after this, once it stops.
  void deleteLocalModel();
}

function isModelFile(url: string): boolean {
  return url.includes(LOCAL_MODEL_ID);
}

function isModelWeights(url: string): boolean {
  return isModelFile(url) && url.includes('.onnx');
}

/** Whether the model has already been fetched, so no consent is needed again. */
export function isLocalModelLoaded(): boolean {
  return pipelinePromise !== null;
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
      // The weights are what make the model usable. Its config and tokenizer
      // files are fetched first and are tiny, so counting those would report a
      // part-downloaded model as ready.
      if (cached.some((request) => isModelWeights(request.url))) return true;
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
        if (isModelFile(request.url)) await cache.delete(request);
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
