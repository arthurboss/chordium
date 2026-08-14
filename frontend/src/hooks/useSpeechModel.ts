import { useCallback, useEffect, useState } from 'react';
import {
  getNativeState,
  installNative,
  isNativeRecognizerSupported,
} from '@/services/speech/native-recognizer';
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
 * The two backends are managed differently because they are shaped differently.
 * The browser's own recogniser fetches its model itself and will not let a page
 * delete it, so it is only ever added. Ours is a single download covering every
 * language, which is ours to delete and worth offering to remove.
 */
export function useSpeechModel(language: string) {
  const [backend, setBackend] = useState<SpeechBackend>('none');
  const [status, setStatus] = useState<SpeechModelStatus>('absent');
  const [progress, setProgress] = useState(0);

  const refresh = useCallback(async () => {
    const native = isNativeRecognizerSupported() ? await getNativeState(language) : 'no';
    if (native !== 'no') {
      setBackend('native');
      // A download in flight is not yet visible to the availability check, so its
      // own callbacks own the status until it settles.
      setStatus((current) =>
        current === 'downloading' ? current : native === 'ready' ? 'present' : 'absent'
      );
      return;
    }

    if (!isLocalModelSupported()) {
      setBackend('none');
      setStatus('absent');
      return;
    }

    setBackend('local-model');
    const present = await isLocalModelDownloaded();
    setStatus((current) => (current === 'downloading' ? current : present ? 'present' : 'absent'));
  }, [language]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * Must be called straight from a click: the browser refuses to fetch its
   * recognition model outside a user gesture, and awaiting anything first spends
   * it. Ours has no such rule, but is started the same way so both read alike.
   */
  const download = useCallback(() => {
    setProgress(0);
    setStatus('downloading');

    if (backend === 'native') {
      const installing = installNative(language);
      if (!installing) {
        setStatus('absent');
        return;
      }
      void installing.then(async (installed) => {
        setStatus(installed ? 'present' : 'absent');
        if (installed) announceSpeechModelChanged();
        await refresh();
      });
      return;
    }

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
  }, [backend, language, refresh]);

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
    /** The browser fetches its own recogniser, so its size is not ours to state. */
    hasOwnDownload: backend === 'native',
    download,
    cancelDownload,
    remove,
    refresh,
  };
}
