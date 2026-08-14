/// <reference lib="webworker" />
import { LOCAL_MODEL_ID, LOCAL_MODEL_REVISION, LOCAL_MODEL_SIZE_MB } from './local-model-config';

/**
 * Runs the fallback translator away from the main thread.
 *
 * The model runs through WebAssembly, which holds on to the thread it is given
 * for as long as it is working. On the main thread that freezes the page for the
 * whole of a song, so all of it happens here instead and only messages cross
 * back.
 */

type TranslationPipeline = (
  text: string,
  options: { src_lang: string; tgt_lang: string }
) => Promise<Array<{ translation_text: string }>>;

let pipelinePromise: Promise<TranslationPipeline> | null = null;

interface FileProgressEvent {
  status?: string;
  file?: string;
  loaded?: number;
  total?: number;
}

/**
 * Sums bytes across every file of the model, so one download reads as one figure
 * rather than each file reporting its own and the reading lurching about.
 */
function createDownloadReporter(report: (ratio: number) => void) {
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
    // Files are announced as the download goes, so the known size keeps the first
    // few small ones from reading as the whole thing being finished.
    const total = Math.max(announced, LOCAL_MODEL_SIZE_MB * 1024 * 1024);
    // Held short of the end: finishing is announced by the job resolving.
    const ratio = Math.min(loaded / total, 0.99);
    if (ratio > highest) {
      highest = ratio;
      report(highest);
    }
  };
}

async function getPipeline(
  onProgress?: (event: FileProgressEvent) => void
): Promise<TranslationPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      return (await pipeline('translation', LOCAL_MODEL_ID, {
        // Pinned so a device never ends up with weights from either side of an
        // upstream change.
        revision: LOCAL_MODEL_REVISION,
        // The runtime cannot build a session from the other quantisations this
        // model publishes.
        dtype: 'q8',
        progress_callback: onProgress,
      })) as unknown as TranslationPipeline;
    })().catch((error) => {
      pipelinePromise = null;
      throw error;
    });
  }
  return pipelinePromise;
}

function post(message: unknown) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(message);
}

interface DownloadRequest {
  type: 'download';
  id: number;
}

interface TranslateRequest {
  type: 'translate';
  id: number;
  lines: string[];
  from: string;
  to: string;
}

interface ForgetRequest {
  type: 'forget';
  id: number;
}

type Request = DownloadRequest | TranslateRequest | ForgetRequest;

self.onmessage = async (event: MessageEvent<Request>) => {
  const request = event.data;
  const report = createDownloadReporter((ratio) =>
    post({ type: 'progress', id: request.id, phase: 'download', ratio })
  );

  try {
    if (request.type === 'forget') {
      // Dropped so the next use rebuilds from whatever is on the device now.
      pipelinePromise = null;
      post({ type: 'done', id: request.id });
      return;
    }

    if (request.type === 'download') {
      await getPipeline(report);
      post({ type: 'done', id: request.id });
      return;
    }

    const translate = await getPipeline(report);

    // Every line goes through on its own, and progress is counted in lines so
    // the reader sees the translating itself move, not just the download that
    // came before it.
    const translated: string[] = [];
    for (const [index, line] of request.lines.entries()) {
      const [result] = await translate(line, { src_lang: request.from, tgt_lang: request.to });
      translated.push(result?.translation_text ?? line);
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
