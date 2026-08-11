import { useCallback, useEffect, useState } from 'react';
import { getChromePairState, warmChromePair } from '@/services/translation/chrome-translator';
import { isLocalModelSupported } from '@/services/translation/local-model-translator';
import {
  LYRICS_SOURCE_LANGUAGE,
  TRANSLATABLE_LANGUAGES,
  type TranslatableLanguage,
} from '@/services/translation/types';

/**
 * How a language stands for translating lyrics into it:
 * - "source": the language lyrics already come in, so there is nothing to fetch.
 * - "installed": ready to translate, offline included.
 * - "downloadable": needs a one-off download the reader has to start.
 * - "downloading": that download is running.
 * - "unavailable": this browser cannot translate into it at all.
 */
export type PackStatus = 'source' | 'installed' | 'downloadable' | 'downloading' | 'unavailable';

async function readStatus(language: TranslatableLanguage): Promise<PackStatus> {
  if (language === LYRICS_SOURCE_LANGUAGE) return 'source';
  const pairState = await getChromePairState(LYRICS_SOURCE_LANGUAGE, language);
  if (pairState === 'ready') return 'installed';
  if (pairState === 'needs-gesture') return 'downloadable';
  return isLocalModelSupported() ? 'downloadable' : 'unavailable';
}

/**
 * Tracks, per app language, whether lyrics can be translated into it yet and
 * lets the reader fetch what is missing. Language packs are per language rather
 * than one bundle, so each is offered on its own.
 */
export function useTranslationPacks() {
  const [statuses, setStatuses] = useState<Partial<Record<TranslatableLanguage, PackStatus>>>({});
  const [progress, setProgress] = useState<Partial<Record<TranslatableLanguage, number>>>({});

  const refresh = useCallback(async () => {
    const entries = await Promise.all(
      TRANSLATABLE_LANGUAGES.map(async (language) => [language, await readStatus(language)] as const)
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
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * Must be called straight from a click: the browser refuses to fetch a
   * language pack outside a user gesture, and awaiting anything first spends it.
   */
  const download = useCallback(
    (language: TranslatableLanguage) => {
      setProgress((current) => ({ ...current, [language]: 0 }));
      setStatuses((current) => ({ ...current, [language]: 'downloading' }));

      const warming = warmChromePair(LYRICS_SOURCE_LANGUAGE, language, (ratio) =>
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
    },
    []
  );

  return { statuses, progress, download, refresh };
}
