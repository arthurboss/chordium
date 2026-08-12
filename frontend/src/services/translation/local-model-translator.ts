import {
  isTranslatableLanguage,
  TranslatorUnavailableError,
  type Translator,
  type TranslatableLanguage,
} from './types';
import {
  downloadSizeMbFor,
  modelsForLanguage,
  routeBetween,
  type TranslationStep,
} from './local-model-config';

/**
 * Fallback translator for browsers without the Translator API. The work happens
 * in a worker; this side only sends it lines and reports back what it says.
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

function expectedBytesFor(languages: TranslatableLanguage[]): number {
  const megabytes = languages.reduce((total, language) => total + downloadSizeMbFor(language), 0);
  return megabytes * 1024 * 1024;
}

/** Fetches everything a language needs, so it is ready before any lyrics use it. */
export async function downloadLanguageModels(
  language: TranslatableLanguage,
  onProgress?: (ratio: number) => void
): Promise<void> {
  const models = modelsForLanguage(language);
  if (models.length === 0) return;
  await ask({ type: 'download', models, expectedBytes: expectedBytesFor([language]) }, (progress) =>
    onProgress?.(progress.ratio)
  );
}

/**
 * The models are cached through the Cache API, which only exists in a secure
 * context. Over plain http on anything but localhost it is absent and loading a
 * model would stall with no error, so the caller is told up front instead.
 */
export function isLocalModelSupported(): boolean {
  return typeof caches !== 'undefined' && typeof Worker !== 'undefined';
}

async function cachedModelUrls(): Promise<string[]> {
  if (!isLocalModelSupported()) return [];
  try {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      for (const request of await (await caches.open(name)).keys()) urls.push(request.url);
    }
    return urls;
  } catch {
    return [];
  }
}

/**
 * Whether a language's models are on the device. Weights are what make a model
 * usable; its config and tokenizer files are fetched first and are tiny, so
 * counting those would report a part-downloaded language as ready.
 */
export async function isLanguageDownloaded(language: TranslatableLanguage): Promise<boolean> {
  const models = modelsForLanguage(language);
  if (models.length === 0) return true;
  const urls = await cachedModelUrls();
  return models.every((model) => urls.some((url) => url.includes(model) && url.includes('.onnx')));
}

/** Removes a language's models from the device, reclaiming the space. */
export async function deleteLanguageModels(language: TranslatableLanguage): Promise<void> {
  const models = modelsForLanguage(language);
  if (models.length === 0 || !isLocalModelSupported()) return;
  try {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (models.some((model) => request.url.includes(model))) await cache.delete(request);
      }
    }
    // The worker holds a loaded copy, which has to go too or it would keep
    // serving a language the reader has removed.
    await ask({ type: 'forget', models });
  } catch (error) {
    console.error('Failed to delete the language models:', error);
  }
}

function toTranslatable(language: string): TranslatableLanguage {
  if (!isTranslatableLanguage(language)) {
    throw new TranslatorUnavailableError(`Unsupported language: ${language}`);
  }
  return language;
}

/**
 * Splits lyrics into the lines to be translated, noting where the blank lines
 * between stanzas were so they can be put back afterwards.
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
      const source = toTranslatable(from);
      const target = toTranslatable(to);
      const steps: TranslationStep[] = routeBetween(source, target);
      if (steps.length === 0) return text;

      const { lines, layout } = toLines(text);
      if (lines.length === 0) return text;

      const translated = await ask(
        { type: 'translate', lines, steps, expectedBytes: expectedBytesFor([source, target]) },
        onProgress
      );

      return layout.map((index) => (index === null ? '' : translated[index] ?? '')).join('\n');
    },
  };
}
