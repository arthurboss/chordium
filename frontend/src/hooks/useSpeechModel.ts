import { useCallback, useState } from 'react';
import { isNativeRecognizerSupported } from '@/services/speech/native-recognizer';
import {
  cancelLocalModelDownload,
  deleteLocalModel,
  downloadLocalModel,
  isLocalModelDownloaded,
  isLocalModelSupported,
  LOCAL_MODEL_SIZE_MB,
} from '@/services/speech/local-model-recognizer';
import { announceSpeechModelChanged } from '@/services/speech/speech-manager';

/** Where spoken searches are recognised on this browser. */
export type SpeechBackend = 'native' | 'local-model' | 'none';

export type SpeechModelStatus = 'absent' | 'downloading' | 'present';

/**
 * Tracks what this device needs before a spoken search can be heard, and lets the
 * reader fetch it.
 *
 * Only the fallback has anything to manage. Where the browser recognises speech
 * itself there is nothing to download and nothing to remove, so the section that
 * uses this says so and offers no action.
 *
 * Nothing here runs until `refresh` is called: this is only relevant once the
 * reader opens the panel that shows it, not on every page load.
 */
export function useSpeechModel() {
  const [backend, setBackend] = useState<SpeechBackend>('none');
  const [status, setStatus] = useState<SpeechModelStatus>('absent');
  const [progress, setProgress] = useState(0);

  const refresh = useCallback(async () => {
    if (isNativeRecognizerSupported()) {
      setBackend('native');
      setStatus('present');
      return;
    }

    if (!isLocalModelSupported()) {
      setBackend('none');
      setStatus('absent');
      return;
    }

    setBackend('local-model');
    const present = await isLocalModelDownloaded();
    // A download in flight is not yet visible to the cache check, so its own
    // callbacks own the status until it settles.
    setStatus((current) => (current === 'downloading' ? current : present ? 'present' : 'absent'));
  }, []);

  const download = useCallback(() => {
    setProgress(0);
    setStatus('downloading');
    void downloadLocalModel((ratio) => setProgress(ratio))
      .then((outcome) => {
        setStatus(outcome === 'completed' ? 'present' : 'absent');
        if (outcome === 'cancelled') setProgress(0);
        else announceSpeechModelChanged();
      })
      .catch((error) => {
        console.error('Failed to download the speech model:', error);
        setStatus('absent');
        setProgress(0);
      })
      .finally(() => void refresh());
  }, [refresh]);

  /**
   * The library cannot be made to drop its requests, so the reader is taken back
   * to the offer at once and the part-downloaded model is cleared behind them.
   */
  const cancelDownload = useCallback(() => {
    cancelLocalModelDownload();
    setStatus('absent');
    setProgress(0);
  }, []);

  const remove = useCallback(async () => {
    await deleteLocalModel();
    await refresh();
    announceSpeechModelChanged();
  }, [refresh]);

  return {
    backend,
    status,
    progress,
    sizeMb: LOCAL_MODEL_SIZE_MB,
    download,
    cancelDownload,
    remove,
    refresh,
  };
}
