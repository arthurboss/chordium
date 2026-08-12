import { useCallback, useEffect, useState } from 'react';
import {
  getChromePairState,
  isChromeTranslatorSupported,
  warmChromePair,
} from '@/services/translation/chrome-translator';
import {
  deleteLanguageModels,
  downloadLanguageModels,
  isLanguageDownloaded,
  isLocalModelSupported,
} from '@/services/translation/local-model-translator';
import { downloadSizeMbFor } from '@/services/translation/local-model-config';
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
 * into it, and lets the reader fetch it or clear it again.
 *
 * Both backends are per language, but they differ in what can be done with them:
 * the browser's own packs cannot be deleted by a page, while the fallback's
 * models are the app's own and are large enough to be worth reclaiming.
 */
export function useTranslationPacks() {
  const [backend] = useState<TranslationBackend>(detectBackend);
  const [statuses, setStatuses] = useState<Partial<Record<TranslatableLanguage, PackStatus>>>({});
  const [progress, setProgress] = useState<Partial<Record<TranslatableLanguage, number>>>({});

  const refresh = useCallback(async () => {
    if (backend === 'none') {
      setStatuses(
        Object.fromEntries(TRANSLATABLE_LANGUAGES.map((language) => [language, 'unavailable']))
      );
      return;
    }

    const entries = await Promise.all(
      TRANSLATABLE_LANGUAGES.map(async (language) => {
        let status: PackStatus;
        if (backend === 'local-model') {
          status = (await isLanguageDownloaded(language)) ? 'installed' : 'downloadable';
        } else {
          const state = await getChromePairState(representativeSourceFor(language), language);
          status =
            state === 'ready'
              ? 'installed'
              : state === 'needs-gesture'
                ? 'downloadable'
                : 'unavailable';
        }
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
   * For the browser's own translator this must be called straight from a click:
   * it refuses to fetch a language pack outside a user gesture, and awaiting
   * anything first spends it.
   */
  const download = useCallback(
    (language: TranslatableLanguage) => {
      setProgress((current) => ({ ...current, [language]: 0 }));
      setStatuses((current) => ({ ...current, [language]: 'downloading' }));

      if (backend === 'local-model') {
        void downloadLanguageModels(language, (ratio) =>
          setProgress((current) => ({ ...current, [language]: ratio }))
        )
          .then(() => setStatuses((current) => ({ ...current, [language]: 'installed' })))
          .catch((error) => {
            console.error('Failed to download the language models:', error);
            setStatuses((current) => ({ ...current, [language]: 'downloadable' }));
            setProgress((current) => ({ ...current, [language]: 0 }));
          });
        return;
      }

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
    },
    [backend]
  );

  const remove = useCallback(
    async (language: TranslatableLanguage) => {
      await deleteLanguageModels(language);
      await refresh();
    },
    [refresh]
  );

  return {
    backend,
    statuses,
    progress,
    download,
    /** Only the fallback's models are the app's to remove. */
    canRemove: backend === 'local-model',
    remove,
    sizeMbFor: downloadSizeMbFor,
    refresh,
  };
}
