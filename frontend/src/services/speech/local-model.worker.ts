/// <reference lib="webworker" />
import { LOCAL_MODEL_ID, LOCAL_MODEL_REVISION, LOCAL_MODEL_SIZE_MB } from './local-model-config';

/**
 * Runs the downloaded recogniser away from the main thread.
 *
 * The model runs through WebAssembly, which holds on to the thread it is given
 * for as long as it is working. On the main thread that freezes the page for the
 * whole of a transcription, so all of it happens here instead and only messages
 * cross back.
 */

type TranscribePipeline = (
  audio: Float32Array,
  options: Record<string, unknown>
) => Promise<{ text?: string } | Array<{ text?: string }>>;

let pipelinePromise: Promise<TranscribePipeline> | null = null;

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
): Promise<TranscribePipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      return (await pipeline('automatic-speech-recognition', LOCAL_MODEL_ID, {
        // Pinned so a device never ends up with weights from either side of an
        // upstream change.
        revision: LOCAL_MODEL_REVISION,
        dtype: 'q8',
        progress_callback: onProgress,
      })) as unknown as TranscribePipeline;
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

interface TranscribeRequest {
  type: 'transcribe';
  id: number;
  audio: Float32Array;
  language: string;
}

interface ForgetRequest {
  type: 'forget';
  id: number;
}

type Request = DownloadRequest | TranscribeRequest | ForgetRequest;

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

    const transcribe = await getPipeline(report);
    // Transcribing itself reports no progress of its own, so the phase is
    // announced once at the start and the reader sees it working rather than a bar
    // that has stopped at the end of the download.
    post({ type: 'progress', id: request.id, phase: 'transcribe', ratio: 0 });

    const output = await transcribe(request.audio, {
      language: request.language,
      // A search is one short phrase, so there is nothing to segment and no use
      // for the timings that would come with it.
      return_timestamps: false,
      chunk_length_s: 0,
      // Long enough for a spoken title, short enough that a model which starts
      // repeating itself is cut off rather than filling the buffer.
      max_new_tokens: 48,
    });
    const text = (Array.isArray(output) ? output[0]?.text : output.text) ?? '';
    post({ type: 'result', id: request.id, text });
  } catch (error) {
    post({ type: 'error', id: request.id, message: String(error) });
  }
};
