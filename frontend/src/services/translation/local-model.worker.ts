/// <reference lib="webworker" />
import type { TranslationStep } from './local-model-config';

/**
 * Runs the fallback translator away from the main thread.
 *
 * The models run through WebAssembly, which holds on to the thread it is given
 * for as long as it is working. On the main thread that freezes the page for the
 * whole of a song, so all of it happens here instead and only messages cross
 * back.
 */

type TranslationPipeline = (text: string) => Promise<Array<{ translation_text: string }>>;

const pipelines = new Map<string, Promise<TranslationPipeline>>();

interface FileProgressEvent {
  status?: string;
  file?: string;
  loaded?: number;
  total?: number;
}

/**
 * Sums bytes across every file of every model being fetched, so one download
 * reads as one figure rather than each file reporting its own.
 */
function createDownloadReporter(report: (ratio: number) => void, expectedBytes: number) {
  const files = new Map<string, { loaded: number; total: number }>();
  let highest = 0;

  return (event: FileProgressEvent) => {
    if (!event.file) return;
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
    // Files are announced as the download goes, so the expected size keeps the
    // first few small ones from reading as the whole thing.
    const total = Math.max(announced, expectedBytes);
    const ratio = Math.min(loaded / total, 0.99);
    if (ratio > highest) {
      highest = ratio;
      report(highest);
    }
  };
}

async function loadPipeline(
  model: string,
  onProgress?: (event: FileProgressEvent) => void
): Promise<TranslationPipeline> {
  let pending = pipelines.get(model);
  if (!pending) {
    pending = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      return (await pipeline('translation', model, {
        // The runtime cannot build a session from the other quantisations these
        // models publish.
        dtype: 'q8',
        progress_callback: onProgress,
      })) as unknown as TranslationPipeline;
    })().catch((error) => {
      pipelines.delete(model);
      throw error;
    });
    pipelines.set(model, pending);
  }
  return pending;
}

function post(message: unknown) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(message);
}

interface DownloadRequest {
  type: 'download';
  id: number;
  models: string[];
  expectedBytes: number;
}

interface TranslateRequest {
  type: 'translate';
  id: number;
  lines: string[];
  steps: TranslationStep[];
  expectedBytes: number;
}

interface ForgetRequest {
  type: 'forget';
  id: number;
  models: string[];
}

type Request = DownloadRequest | TranslateRequest | ForgetRequest;

self.onmessage = async (event: MessageEvent<Request>) => {
  const request = event.data;
  try {
    if (request.type === 'download') {
      const report = createDownloadReporter(
        (ratio) => post({ type: 'progress', id: request.id, phase: 'download', ratio }),
        request.expectedBytes
      );
      for (const model of request.models) await loadPipeline(model, report);
      post({ type: 'done', id: request.id });
      return;
    }

    if (request.type === 'forget') {
      // Dropped so the next use rebuilds from whatever is on the device now.
      for (const model of request.models) pipelines.delete(model);
      post({ type: 'done', id: request.id });
      return;
    }

    const report = createDownloadReporter(
      (ratio) => post({ type: 'progress', id: request.id, phase: 'download', ratio }),
      request.expectedBytes
    );
    const loaded: TranslationPipeline[] = [];
    for (const step of request.steps) loaded.push(await loadPipeline(step.model, report));

    // Every line goes through each step in turn, and progress is counted in
    // lines so the reader sees the translating itself move, not just the
    // download that came before it.
    const translated: string[] = [];
    for (const [index, line] of request.lines.entries()) {
      let text = line;
      for (const pipe of loaded) {
        const [result] = await pipe(text);
        text = result?.translation_text ?? text;
      }
      translated.push(text);
      post({
        type: 'progress',
        id: request.id,
        phase: 'translate',
        ratio: (index + 1) / request.lines.length,
      });
    }
    post({ type: 'result', id: request.id, lines: translated });
  } catch (error) {
    post({ type: 'error', id: request.id, message: String(error) });
  }
};
