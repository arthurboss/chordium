import { useCallback, useEffect, useState } from 'react';
import { getChromePairState, warmChromePair } from '@/services/translation/chrome-translator';
import { isLocalModelSupported } from '@/services/translation/local-model-translator';
import {
  getStoredTranslationLanguages,
  removeTranslationsForLanguage,
} from '@/storage/services/lyrics-storage';
import { TRANSLATABLE_LANGUAGES, type TranslatableLanguage } from '@/services/translation/types';

/**
 * How a language stands for translating lyrics into it:
 * - "installed": ready to translate, offline included.
 * - "downloadable": needs a one-off download the reader has to start.
 * - "downloading": that download is running.
 * - "unavailable": this browser cannot translate into it at all.
 */
export type PackStatus = 'installed' | 'downloadable' | 'downloading' | 'unavailable';

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

async function readStatus(language: TranslatableLanguage): Promise<PackStatus> {
  const state = await getChromePairState(representativeSourceFor(language), language);
  if (state === 'ready') return 'installed';
  if (state === 'needs-gesture') return 'downloadable';
  return isLocalModelSupported() ? 'downloadable' : 'unavailable';
}

/**
 * Tracks, per app language, whether lyrics can be translated into it yet and
 * lets the reader fetch what is missing or clear what is stored. Languages are
 * downloaded one at a time rather than as one bundle, so each is offered alone.
 */
export function useTranslationPacks() {
  const [statuses, setStatuses] = useState<Partial<Record<TranslatableLanguage, PackStatus>>>({});
  const [progress, setProgress] = useState<Partial<Record<TranslatableLanguage, number>>>({});
  const [storedLanguages, setStoredLanguages] = useState<TranslatableLanguage[]>([]);

  const refresh = useCallback(async () => {
    const [entries, stored] = await Promise.all([
      Promise.all(
        TRANSLATABLE_LANGUAGES.map(
          async (language) => [language, await readStatus(language)] as const
        )
      ),
      getStoredTranslationLanguages(),
    ]);
    setStoredLanguages(stored);
    setStatuses((current) => {
      const next = { ...current };
      for (const [language, status] of entries) {
        // A download in flight is not yet visible to the availability check, so
        // its own callbacks own that language's status until it settles.
        if (next[language] !== 'downloading') next[language] = status;
      }
      return next;
    });
  }, []);

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
      const settled = await readStatus(language);
      setStatuses((current) => ({ ...current, [language]: settled }));
    });
  }, []);

  const removeStored = useCallback(
    async (language: TranslatableLanguage) => {
      await removeTranslationsForLanguage(language);
      await refresh();
    },
    [refresh]
  );

  return { statuses, progress, storedLanguages, download, removeStored, refresh };
}
