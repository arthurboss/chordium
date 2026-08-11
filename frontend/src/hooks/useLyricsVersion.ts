import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslation, storeTranslation, deleteLyrics } from '@/storage/services/lyrics-storage';
import {
  canTranslate,
  prepareTranslator,
  requiresDownloadConsent,
  translateLyrics,
} from '@/services/translation/get-translator';
import { detectLyricsLanguage } from '@/services/translation/detect-language';
import {
  getEnabledLanguages,
  setLanguageEnabled,
} from '@/services/translation/enabled-languages';
import { isTranslatableLanguage } from '@/services/translation/types';

interface UseLyricsVersionOptions {
  /** Identifies the song in storage, so a translation is fetched once per song. */
  path: string;
  /** The sung words, already stripped of chords. */
  lyrics: string;
}

export type TranslationStatus =
  /** Working out what this song and language need. */
  | 'idle'
  /** Nothing to translate: the lyrics are already in the app's language. */
  | 'unnecessary'
  /** Translating is possible but no backend on this device can do it. */
  | 'unavailable'
  | 'needs-consent'
  | 'translating'
  | 'ready'
  | 'failed';

/**
 * Keeps a translation of the lyrics in the app's language ready to show.
 *
 * The words are read in whatever language they are sung in rather than the
 * source site's, so a song is only offered for translation when it is actually
 * in a different language from the app. Browsers without a built-in translator
 * need a model downloaded first, which is only done once the reader agrees, and
 * each language is cached separately so switching back and forth does not
 * repeat the work.
 */
export function useLyricsVersion({ path, lyrics }: UseLyricsVersionOptions) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'en';

  const [translated, setTranslated] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [consented, setConsented] = useState(false);
  // Bumped to run the whole thing again after a failure.
  const [attempt, setAttempt] = useState(0);

  // Re-running the effect must abandon any translation still in flight, whose
  // result belongs to the previous song or language.
  const runIdRef = useRef(0);

  const source = useMemo(() => detectLyricsLanguage(lyrics), [lyrics]);
  const target = isTranslatableLanguage(language) ? language : null;
  // Unreadable lyrics are left alone rather than translated from a guess, and a
  // song already in the app's language needs nothing doing.
  const isTranslatable = !!source && !!target && source !== target && !!lyrics.trim();

  useEffect(() => {
    const ref = runIdRef;
    const runId = ++ref.current;
    const isStale = () => ref.current !== runId;

    setTranslated(null);
    setShowTranslation(false);
    setDownloadProgress(0);

    if (!isTranslatable || !target || !source) {
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

      // Nothing here can translate, which the toggle says outright rather than
      // offering something that would never finish.
      if (!(await canTranslate(source, target))) {
        if (!isStale()) setStatus('unavailable');
        return;
      }
      if (isStale()) return;

      // A language turned off in the language list is not translated into until
      // the reader asks for it again, which the toggle offers.
      if (!consented && !getEnabledLanguages().includes(target)) {
        if (!isStale()) setStatus('needs-consent');
        return;
      }

      // Downloading a model is the reader's call, so stop and ask unless they
      // already agreed in this session.
      if (!consented && (await requiresDownloadConsent(source, target))) {
        if (!isStale()) setStatus('needs-consent');
        return;
      }
      if (isStale()) return;

      setStatus('translating');
      try {
        const result = await translateLyrics(lyrics, {
          from: source,
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
  }, [path, source, target, lyrics, isTranslatable, consented, attempt]);

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
      if (!source || !target) return;
      setStatus('translating');
      // Agreeing here also turns the language on in the language list, so the two
      // never disagree about what is available.
      setLanguageEnabled(target, true);
      const runId = runIdRef.current;
      void prepareTranslator(source, target, (ratio) => {
        if (runIdRef.current === runId) setDownloadProgress(ratio);
      }).finally(() => setConsented(true));
    }, [source, target]),
    /** Runs the translation again after it failed. */
    retry: useCallback(() => setAttempt((n) => n + 1), []),
    clear: clearLyrics,
  };
}
