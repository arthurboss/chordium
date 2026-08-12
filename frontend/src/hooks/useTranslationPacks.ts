import { useCallback, useEffect, useState } from 'react';
import {
  getChromePairState,
  isChromeTranslatorSupported,
  warmChromePair,
} from '@/services/translation/chrome-translator';
import {
  cancelLocalModelDownload,
  deleteLocalModel,
  downloadLocalModel,
  isLocalModelDownloaded,
  isLocalModelSupported,
  LOCAL_MODEL_SIZE_MB,
} from '@/services/translation/local-model-translator';
import { TRANSLATABLE_LANGUAGES, type TranslatableLanguage } from '@/services/translation/types';

/**
 * How a language stands for translating lyrics into it:
 * - "installed": ready to translate, offline included.
 * - "downloadable": needs a one-off download the reader has to start.
 * - "downloading": that download is running.
 * - "unavailable": this browser cannot translate into it at all.
 */
export type PackStatus = 'installed' | 'downloadable' | 'downloading' | 'unavailable';

/** Where translations come from on this browser. */
export type TranslationBackend = 'chrome' | 'local-model' | 'none';

export type ModelStatus = 'absent' | 'downloading' | 'present';

function detectBackend(): TranslationBackend {
  if (isChromeTranslatorSupported()) return 'chrome';
  return isLocalModelSupported() ? 'local-model' : 'none';
}

/**
 * The language a song is most likely written in, for the purpose of reporting on
 * the one being asked about. The browser tracks each direction separately and
 * only downloads one at a time, so a language stands on a single representative
 * route rather than every possible one; a song in some other language still
 * gets its own offer when it is opened.
 */
function representativeSourceFor(language: TranslatableLanguage): TranslatableLanguage {
  return language === 'en' ? 'pt-BR' : 'en';
}

/**
 * Tracks what each of the app's languages needs before lyrics can be translated
 * into it, and lets the reader fetch it.
 *
 * The two backends are managed differently because they are shaped differently.
 * The browser's own translator keeps a separate pack per language, which it will
 * not let a page delete, so those are only ever added. The fallback is a single
 * large model covering every language, which is ours to delete and worth
 * offering to remove.
 */
export function useTranslationPacks() {
  const [backend] = useState<TranslationBackend>(detectBackend);
  const [statuses, setStatuses] = useState<Partial<Record<TranslatableLanguage, PackStatus>>>({});
  const [progress, setProgress] = useState<Partial<Record<TranslatableLanguage, number>>>({});
  const [modelStatus, setModelStatus] = useState<ModelStatus>('absent');
  const [modelProgress, setModelProgress] = useState(0);

  const refresh = useCallback(async () => {
    if (backend === 'local-model') {
      // One model serves every language, so they all stand or fall together.
      const present = await isLocalModelDownloaded();
      setModelStatus((current) => (current === 'downloading' ? current : present ? 'present' : 'absent'));
      setStatuses(
        Object.fromEntries(
          TRANSLATABLE_LANGUAGES.map((language) => [language, present ? 'installed' : 'downloadable'])
        )
      );
      return;
    }

    if (backend === 'none') {
      setStatuses(
        Object.fromEntries(TRANSLATABLE_LANGUAGES.map((language) => [language, 'unavailable']))
      );
      return;
    }

    const entries = await Promise.all(
      TRANSLATABLE_LANGUAGES.map(async (language) => {
        const state = await getChromePairState(representativeSourceFor(language), language);
        const status: PackStatus =
          state === 'ready' ? 'installed' : state === 'needs-gesture' ? 'downloadable' : 'unavailable';
        return [language, status] as const;
      })
    );
    setStatuses((current) => {
      const next = { ...current };
      for (const [language, status] of entries) {
        // A download in flight is not yet visible to the availability check, so
        // its own callbacks own that language's status until it settles.
        if (next[language] !== 'downloading') next[language] = status;
      }
      return next;
    });
  }, [backend]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * Must be called straight from a click: the browser refuses to fetch a
   * language pack outside a user gesture, and awaiting anything first spends it.
   */
  const download = useCallback((language: TranslatableLanguage) => {
    setProgress((current) => ({ ...current, [language]: 0 }));
    setStatuses((current) => ({ ...current, [language]: 'downloading' }));

    const warming = warmChromePair(representativeSourceFor(language), language, (ratio) =>
      setProgress((current) => ({ ...current, [language]: ratio }))
    );
    if (!warming) {
      setStatuses((current) => ({ ...current, [language]: 'unavailable' }));
      return;
    }
    void warming.then(async () => {
      const state = await getChromePairState(representativeSourceFor(language), language);
      setStatuses((current) => ({
        ...current,
        [language]: state === 'ready' ? 'installed' : 'downloadable',
      }));
    });
  }, []);

  const downloadModel = useCallback(() => {
    setModelProgress(0);
    setModelStatus('downloading');
    void downloadLocalModel((ratio) => setModelProgress(ratio))
      .then((outcome) => {
        setModelStatus(outcome === 'completed' ? 'present' : 'absent');
        if (outcome === 'cancelled') setModelProgress(0);
      })
      .catch((error) => {
        console.error('Failed to download the translation model:', error);
        setModelStatus('absent');
        setModelProgress(0);
      })
      .finally(() => void refresh());
  }, [refresh]);

  /**
   * The library cannot be made to drop its requests, so the reader is taken back
   * to the offer at once and the part-downloaded model is cleared behind them.
   */
  const cancelModelDownload = useCallback(() => {
    cancelLocalModelDownload();
    setModelStatus('absent');
    setModelProgress(0);
  }, []);

  const removeModel = useCallback(async () => {
    await deleteLocalModel();
    await refresh();
  }, [refresh]);

  return {
    backend,
    statuses,
    progress,
    download,
    modelStatus,
    modelProgress,
    modelSizeMb: LOCAL_MODEL_SIZE_MB,
    downloadModel,
    cancelModelDownload,
    removeModel,
    refresh,
  };
}
