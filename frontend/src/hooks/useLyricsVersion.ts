import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslation, storeTranslation, deleteLyrics } from '@/storage/services/lyrics-storage';
import {
  canTranslate,
  prepareTranslator,
  requiresDownloadConsent,
  translateLyrics,
} from '@/services/translation/get-translator';
import { isTranslatableLanguage } from '@/services/translation/types';

/** Lyrics come from the source site in Brazilian Portuguese. */
const SOURCE_LANGUAGE = 'pt-BR';

interface UseLyricsVersionOptions {
  /** Identifies the song in storage, so a translation is fetched once per song. */
  path: string;
  /** The sung words, already stripped of chords. */
  lyrics: string;
}

export type TranslationStatus =
  | 'idle'
  | 'unnecessary'
  | 'needs-consent'
  | 'translating'
  | 'ready'
  | 'failed';

/**
 * Keeps a translation of the lyrics in the app's language ready to show.
 *
 * Translating starts as soon as the lyrics are known rather than waiting for the
 * toggle, so the words are already there when the reader asks for them. Browsers
 * without a built-in translator need a model downloaded first, which is only
 * done once the reader agrees, and each language is cached separately so
 * switching languages back and forth does not repeat the work.
 */
export function useLyricsVersion({ path, lyrics }: UseLyricsVersionOptions) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'en';

  const [translated, setTranslated] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [consented, setConsented] = useState(false);

  // Re-running the effect must abandon any translation still in flight, whose
  // result belongs to the previous song or language.
  const runIdRef = useRef(0);

  const isTranslatable =
    isTranslatableLanguage(language) && language !== SOURCE_LANGUAGE && !!lyrics.trim();

  useEffect(() => {
    const ref = runIdRef;
    const runId = ++ref.current;
    const isStale = () => ref.current !== runId;

    setTranslated(null);
    setShowTranslation(false);
    setDownloadProgress(0);

    if (!isTranslatable) {
      setStatus('unnecessary');
      return;
    }
    setStatus('idle');

    (async () => {
      const cached = path ? await getTranslation(path, language) : null;
      if (isStale()) return;
      if (cached) {
        setTranslated(cached);
        setStatus('ready');
        return;
      }

      // Nothing can translate here, so the toggle stays out of the way rather
      // than offering something that would never finish.
      if (!(await canTranslate(SOURCE_LANGUAGE, language))) {
        if (!isStale()) setStatus('unnecessary');
        return;
      }
      if (isStale()) return;

      // Downloading a model is the reader's call, so stop and ask unless they
      // already agreed in this session.
      if (!consented && (await requiresDownloadConsent(SOURCE_LANGUAGE, language))) {
        if (!isStale()) setStatus('needs-consent');
        return;
      }
      if (isStale()) return;

      setStatus('translating');
      try {
        const result = await translateLyrics(lyrics, {
          from: SOURCE_LANGUAGE,
          to: language,
          onProgress: (ratio) => {
            if (!isStale()) setDownloadProgress(ratio);
          },
        });
        if (isStale()) return;
        setTranslated(result);
        setStatus('ready');
        if (path) await storeTranslation(path, language, result);
      } catch (error) {
        console.error('Failed to translate lyrics:', error);
        if (!isStale()) setStatus('failed');
      }
    })();

    return () => { ref.current++; };
  }, [path, language, lyrics, isTranslatable, consented]);

  const clearLyrics = useCallback(async () => {
    setTranslated(null);
    await deleteLyrics(path);
  }, [path]);

  return {
    /** Lyrics to render: the translation while it is toggled on, else the original. */
    displayLyrics: showTranslation && translated ? translated : lyrics,
    showTranslation,
    setShowTranslation,
    hasTranslation: !!translated,
    status,
    downloadProgress,
    /**
     * Called from the reader's click. The download starts here rather than in the
     * effect that follows, because the browser only permits it while the click
     * is still being handled.
     */
    acceptDownload: useCallback(() => {
      setStatus('translating');
      void prepareTranslator(SOURCE_LANGUAGE, language).finally(() => setConsented(true));
    }, [language]),
    clear: clearLyrics,
  };
}
