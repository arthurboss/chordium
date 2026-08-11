import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslation, storeTranslation, deleteLyrics } from '@/storage/services/lyrics-storage';
import {
  canTranslate,
  prepareTranslator,
  requiresDownloadConsent,
  translateLyrics,
} from '@/services/translation/get-translator';
import {
  isTranslatableLanguage,
  LYRICS_SOURCE_LANGUAGE as SOURCE_LANGUAGE,
} from '@/services/translation/types';

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

  // Only the app's own languages can be translated into, and the source needs no
  // translating; anything else leaves the toggle out of the way.
  const target = isTranslatableLanguage(language) && language !== SOURCE_LANGUAGE ? language : null;
  const isTranslatable = target !== null && !!lyrics.trim();

  useEffect(() => {
    const ref = runIdRef;
    const runId = ++ref.current;
    const isStale = () => ref.current !== runId;

    setTranslated(null);
    setShowTranslation(false);
    setDownloadProgress(0);

    if (!isTranslatable || !target) {
      setStatus('unnecessary');
      return;
    }
    setStatus('idle');

    (async () => {
      const cached = path ? await getTranslation(path, target) : null;
      if (isStale()) return;
      if (cached) {
        setTranslated(cached);
        setStatus('ready');
        return;
      }

      // Nothing can translate here, so the toggle stays out of the way rather
      // than offering something that would never finish.
      if (!(await canTranslate(SOURCE_LANGUAGE, target))) {
        if (!isStale()) setStatus('unnecessary');
        return;
      }
      if (isStale()) return;

      // Downloading a model is the reader's call, so stop and ask unless they
      // already agreed in this session.
      if (!consented && (await requiresDownloadConsent(SOURCE_LANGUAGE, target))) {
        if (!isStale()) setStatus('needs-consent');
        return;
      }
      if (isStale()) return;

      setStatus('translating');
      try {
        const result = await translateLyrics(lyrics, {
          from: SOURCE_LANGUAGE,
          to: target,
          onProgress: (ratio) => {
            if (!isStale()) setDownloadProgress(ratio);
          },
        });
        if (isStale()) return;
        setTranslated(result);
        setStatus('ready');
        if (path) await storeTranslation(path, target, result);
      } catch (error) {
        console.error('Failed to translate lyrics:', error);
        if (!isStale()) setStatus('failed');
      }
    })();

    return () => { ref.current++; };
  }, [path, target, lyrics, isTranslatable, consented]);

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
      if (!target) return;
      setStatus('translating');
      const runId = runIdRef.current;
      void prepareTranslator(SOURCE_LANGUAGE, target, (ratio) => {
        if (runIdRef.current === runId) setDownloadProgress(ratio);
      }).finally(() => setConsented(true));
    }, [target]),
    clear: clearLyrics,
  };
}
