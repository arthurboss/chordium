import { decodeRecording } from './decode-audio';
import { LOCAL_MODEL_ID, LOCAL_MODEL_SIZE_MB, MAX_LISTEN_MS, toModelCode } from './local-model-config';
import {
  MicrophoneUnavailableError,
  RecognizerUnavailableError,
  type RecognitionSession,
  type Recognizer,
  type SpeechPhase,
  type SpeechProgress,
} from './types';

export { LOCAL_MODEL_ID, LOCAL_MODEL_SIZE_MB };

/**
 * Recogniser for browsers that cannot hear a search themselves. The work happens in
 * a worker; this side records the microphone and reports what the worker says back.
 */

type WorkerMessage =
  | { type: 'progress'; id: number; phase: SpeechPhase; ratio: number }
  | { type: 'result'; id: number; text: string }
  | { type: 'done'; id: number }
  | { type: 'error'; id: number; message: string };

interface PendingJob {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: SpeechProgress) => void;
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
      else if (message.type === 'result') job.resolve(message.text);
      else job.resolve('');
    };
  }
  return worker;
}

function ask(
  request: Record<string, unknown>,
  onProgress?: (progress: SpeechProgress) => void,
  transfer?: Transferable[]
): Promise<string> {
  const id = ++nextJobId;
  const target = getWorker();
  return new Promise<string>((resolve, reject) => {
    jobs.set(id, { resolve, reject, onProgress });
    target.postMessage({ ...request, id }, transfer ?? []);
  });
}

/**
 * The model is cached through the Cache API, which only exists in a secure context.
 * Over plain http on anything but localhost it is absent and loading the model would
 * stall with no error, so the caller is told up front instead. The microphone is
 * gated the same way, so both halves of this backend stand or fall together.
 */
export function isLocalModelSupported(): boolean {
  return (
    typeof caches !== 'undefined' &&
    typeof Worker !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices?.getUserMedia !== undefined
  );
}

/**
 * Counts downloads so a cancellation can be told apart from a later attempt. The
 * library gives no way to abort its own requests, so cancelling stops the app acting
 * on the result and clears whatever reached the cache.
 */
let downloadGeneration = 0;
let cancelledGeneration = -1;

export type DownloadOutcome = 'completed' | 'cancelled';

/**
 * Fetches the model up front, so it is there before anything is spoken. Stopping
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
  // Only tidy up when nothing newer has taken over, or this would delete the model a
  // later attempt is busy fetching.
  if (downloadGeneration === generation) await deleteLocalModel();
  return 'cancelled';
}

/**
 * Calls off a download in progress. The caller can move on straight away; the cache
 * is cleared behind them.
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
 * Whether the weights are on the device from an earlier visit. The weights are what
 * make the model usable; its config and tokenizer files are fetched first and are
 * tiny, so counting those would report a part-downloaded model as ready.
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

/** Removes the weights from the device, and the worker's loaded copy with them. */
export async function deleteLocalModel(): Promise<void> {
  if (!isLocalModelSupported()) return;
  try {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (isModelFile(request.url)) await cache.delete(request);
      }
    }
    // The worker holds a loaded copy, which has to go too or it would keep serving a
    // model the reader has removed.
    await ask({ type: 'forget' });
  } catch (error) {
    console.error('Failed to delete the speech model:', error);
  }
}

interface Recording {
  stop: () => Promise<Blob>;
  release: () => void;
}

/**
 * Opens the microphone and records until told to stop.
 *
 * The container is left to the browser: whatever its MediaRecorder produces, its own
 * decoder reads back, so there is no format to negotiate.
 */
async function record(): Promise<Recording> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (error) {
    throw new MicrophoneUnavailableError(String(error));
  }

  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  recorder.start();

  const release = () => stream.getTracks().forEach((track) => track.stop());

  return {
    release,
    stop: () =>
      new Promise<Blob>((resolve) => {
        const settle = () => {
          release();
          resolve(new Blob(chunks, { type: recorder.mimeType }));
        };
        if (recorder.state === 'inactive') settle();
        else {
          recorder.onstop = settle;
          recorder.stop();
        }
      }),
  };
}

export function createLocalModelRecognizer(): Recognizer {
  return {
    id: 'local-model',
    listen(language, onProgress) {
      if (!isLocalModelSupported()) {
        throw new RecognizerUnavailableError(
          'Voice search needs a secure context (https or localhost)'
        );
      }
      const code = toModelCode(language);
      if (!code) throw new RecognizerUnavailableError(`Unsupported language: ${language}`);

      let settle: (text: string) => void = () => {};
      let fail: (error: Error) => void = () => {};
      const transcript = new Promise<string>((resolve, reject) => {
        settle = resolve;
        fail = reject;
      });

      let finished = false;

      // Asked for before anything is awaited, so the click that asked for it is not
      // spent first. What it resolves to is awaited only once listening ends.
      const recording = record();

      const finish = async () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        try {
          const audio = await decodeRecording(await (await recording).stop());
          // Nothing was said, so there is nothing to send to the model.
          if (audio.length === 0) {
            settle('');
            return;
          }
          // The samples are handed over rather than copied, since this side has no
          // further use for them once the worker has them.
          settle(await ask({ type: 'transcribe', audio, language: code }, onProgress, [audio.buffer]));
        } catch (error) {
          fail(error instanceof Error ? error : new Error(String(error)));
        }
      };

      // A microphone left open would be recorded until the page closed, so listening
      // ends itself at the cap.
      const timer = setTimeout(() => void finish(), MAX_LISTEN_MS);

      // A microphone the reader refused settles the session rather than leaving it
      // listening for something that will never arrive.
      recording.catch((error: unknown) => {
        finished = true;
        clearTimeout(timer);
        fail(error instanceof Error ? error : new Error(String(error)));
      });

      return {
        stop: () => void finish(),
        abort: () => {
          finished = true;
          clearTimeout(timer);
          void recording.then((open) => open.release()).catch(() => {});
          settle('');
        },
        transcript,
      } satisfies RecognitionSession;
    },
  };
}
