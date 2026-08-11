import { useCallback, useEffect, useState } from 'react';
import { getChromePairState, warmChromePair } from '@/services/translation/chrome-translator';
import { isLocalModelSupported } from '@/services/translation/local-model-translator';
import {
  getEnabledLanguages,
  setLanguageEnabled,
} from '@/services/translation/enabled-languages';
import {
  getStoredTranslationLanguages,
  removeTranslationsForLanguage,
} from '@/storage/services/lyrics-storage';
import { TRANSLATABLE_LANGUAGES, type TranslatableLanguage } from '@/services/translation/types';

/**
 * How a language stands for translating lyrics into it:
 * - "installed": on, and ready to translate offline included.
 * - "downloadable": off, or on but still missing what it needs.
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

async function readStatus(
  language: TranslatableLanguage,
  isOn: boolean
): Promise<PackStatus> {
  const state = await getChromePairState(representativeSourceFor(language), language);
  if (state === 'no') return isLocalModelSupported() ? 'downloadable' : 'unavailable';
  // A language that is off is offered again rather than reported as ready, even
  // though the browser still holds what it fetched.
  if (!isOn) return 'downloadable';
  return state === 'ready' ? 'installed' : 'downloadable';
}

/**
 * Tracks, per app language, whether lyrics can be translated into it and lets the
 * reader turn one on or off. Languages are handled one at a time rather than as
 * one bundle, so each is offered alone.
 */
export function useTranslationPacks() {
  const [statuses, setStatuses] = useState<Partial<Record<TranslatableLanguage, PackStatus>>>({});
  const [progress, setProgress] = useState<Partial<Record<TranslatableLanguage, number>>>({});

  const refresh = useCallback(async () => {
    // Translations already on the device count as on, so the languages the app
    // shipped with are not offered as though they were missing.
    const enabled = new Set([...getEnabledLanguages(), ...(await getStoredTranslationLanguages())]);
    const entries = await Promise.all(
      TRANSLATABLE_LANGUAGES.map(
        async (language) => [language, await readStatus(language, enabled.has(language))] as const
      )
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
  const download = useCallback((language: TranslatableLanguage) => {
    setProgress((current) => ({ ...current, [language]: 0 }));
    setStatuses((current) => ({ ...current, [language]: 'downloading' }));
    setLanguageEnabled(language, true);

    const warming = warmChromePair(representativeSourceFor(language), language, (ratio) =>
      setProgress((current) => ({ ...current, [language]: ratio }))
    );
    if (!warming) {
      setStatuses((current) => ({ ...current, [language]: 'unavailable' }));
      return;
    }
    void warming.then(async () => {
      const settled = await readStatus(language, true);
      setStatuses((current) => ({ ...current, [language]: settled }));
    });
  }, []);

  /** Turns a language off and drops what it had stored. */
  const removeStored = useCallback(
    async (language: TranslatableLanguage) => {
      setLanguageEnabled(language, false);
      await removeTranslationsForLanguage(language);
      await refresh();
    },
    [refresh]
  );

  return { statuses, progress, download, removeStored, refresh };
}
