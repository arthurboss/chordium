import { TranslatorUnavailableError, type Translator } from './types';
import { LOCAL_MODEL_ID, LOCAL_MODEL_SIZE_MB, toModelCode } from './local-model-config';

export { LOCAL_MODEL_ID, LOCAL_MODEL_SIZE_MB };

/**
 * Fallback translator for browsers without the Translator API. The work happens
 * in a worker; this side only sends it lines and reports what it says back.
 */

/** Which stage a translation is at, so the two can be told apart in the UI. */
export type TranslationPhase = 'download' | 'translate';

export interface LocalProgress {
  phase: TranslationPhase;
  ratio: number;
}

type WorkerMessage =
  | { type: 'progress'; id: number; phase: TranslationPhase; ratio: number }
  | { type: 'result'; id: number; lines: string[] }
  | { type: 'done'; id: number }
  | { type: 'error'; id: number; message: string };

interface PendingJob {
  resolve: (lines: string[]) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: LocalProgress) => void;
}

let worker: Worker | null = null;
const jobs = new Map<number, PendingJob>();
let nextJobId = 0;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./local-model.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      const job = jobs.get(message.id);
      if (!job) return;
      if (message.type === 'progress') {
        job.onProgress?.({ phase: message.phase, ratio: message.ratio });
        return;
      }
      jobs.delete(message.id);
      if (message.type === 'error') job.reject(new Error(message.message));
      else if (message.type === 'result') job.resolve(message.lines);
      else job.resolve([]);
    };
  }
  return worker;
}

function ask(
  request: Record<string, unknown>,
  onProgress?: (progress: LocalProgress) => void
): Promise<string[]> {
  const id = ++nextJobId;
  const target = getWorker();
  return new Promise<string[]>((resolve, reject) => {
    jobs.set(id, { resolve, reject, onProgress });
    target.postMessage({ ...request, id });
  });
}

/**
 * The model is cached through the Cache API, which only exists in a secure
 * context. Over plain http on anything but localhost it is absent and loading
 * the model would stall with no error, so the caller is told up front instead.
 */
export function isLocalModelSupported(): boolean {
  return typeof caches !== 'undefined' && typeof Worker !== 'undefined';
}

/**
 * Counts downloads so a cancellation can be told apart from a later attempt. The
 * library gives no way to abort its own requests, so cancelling stops the app
 * acting on the result and clears whatever reached the cache.
 */
let downloadGeneration = 0;
let cancelledGeneration = -1;

export type DownloadOutcome = 'completed' | 'cancelled';

/**
 * Fetches the model up front, so it is there before any lyrics need it. Stopping
 * partway leaves nothing behind: whatever arrived is cleared, so the next attempt
 * starts fresh rather than from half a model.
 */
export async function downloadLocalModel(
  onProgress?: (ratio: number) => void
): Promise<DownloadOutcome> {
  const generation = ++downloadGeneration;
  const isCancelled = () => cancelledGeneration >= generation;
  try {
    await ask({ type: 'download' }, (progress) => {
      if (!isCancelled()) onProgress?.(progress.ratio);
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
 * cache is cleared behind them.
 */
export function cancelLocalModelDownload(): void {
  cancelledGeneration = downloadGeneration;
  void deleteLocalModel();
}

function isModelFile(url: string): boolean {
  return url.includes(LOCAL_MODEL_ID);
}

function isModelWeights(url: string): boolean {
  return isModelFile(url) && url.includes('.onnx');
}

/**
 * Whether the weights are on the device from an earlier visit. The weights are
 * what make the model usable; its config and tokenizer files are fetched first
 * and are tiny, so counting those would report a part-downloaded model as ready.
 */
export async function isLocalModelDownloaded(): Promise<boolean> {
  if (!isLocalModelSupported()) return false;
  try {
    for (const name of await caches.keys()) {
      const cached = await (await caches.open(name)).keys();
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
  if (!isLocalModelSupported()) return;
  try {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (isModelFile(request.url)) await cache.delete(request);
      }
    }
    // The worker holds a loaded copy, which has to go too or it would keep
    // serving a model the reader has removed.
    await ask({ type: 'forget' });
  } catch (error) {
    console.error('Failed to delete the translation model:', error);
  }
}

/**
 * Splits lyrics into the lines to be translated, noting where the blank lines
 * between stanzas were so they can be put back afterwards. Each line goes on its
 * own because the model truncates long input.
 */
function toLines(text: string): { lines: string[]; layout: Array<number | null> } {
  const lines: string[] = [];
  const layout: Array<number | null> = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) {
      layout.push(null);
      continue;
    }
    layout.push(lines.length);
    lines.push(raw);
  }
  return { lines, layout };
}

export function createLocalModelTranslator(
  onProgress?: (progress: LocalProgress) => void
): Translator {
  return {
    id: 'local-model',
    async translate(text, from, to) {
      if (!isLocalModelSupported()) {
        throw new TranslatorUnavailableError(
          'Translation needs a secure context (https or localhost)'
        );
      }
      const source = toModelCode(from);
      const target = toModelCode(to);
      if (!source || !target) {
        throw new TranslatorUnavailableError(`Unsupported language pair: ${from} to ${to}`);
      }

      const { lines, layout } = toLines(text);
      if (lines.length === 0) return text;

      const translated = await ask(
        { type: 'translate', lines, from: source, to: target },
        onProgress
      );
      return layout.map((index) => (index === null ? '' : translated[index] ?? '')).join('\n');
    },
  };
}
