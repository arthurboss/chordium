import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslation, storeTranslation, deleteLyrics } from '@/storage/services/lyrics-storage';
import {
  canTranslate,
  requiresDownloadConsent,
  translateLyrics,
} from '@/services/translation/get-translator';
import { detectLyricsLanguage } from '@/services/translation/detect-language';
import {
  onTranslationPacksChanged,
  openLanguageManager,
} from '@/services/translation/language-manager';
import type { TranslationPhase } from '@/services/translation/get-translator';
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
  /** The device has not got what this pair needs yet, which is a download away. */
  | 'needs-download'
  | 'translating'
  | 'ready'
  | 'failed';

/**
 * Keeps a translation of the lyrics in the app's language ready to show.
 *
 * The words are read in whatever language they are sung in rather than the
 * source site's, so a song is only offered for translation when it is actually
 * in a different language from the app. Anything the device is missing is
 * fetched from the language manager rather than here, and each language is
 * cached separately so switching back and forth does not repeat the work.
 */
export function useLyricsVersion({ path, lyrics }: UseLyricsVersionOptions) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'en';

  const [translated, setTranslated] = useState<string | null>(null);
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  // Fetching a model and translating with it are both slow but quite different,
  // and a single figure covering both would sit still through one of them.
  const [phase, setPhase] = useState<TranslationPhase | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  // Bumped to run the whole thing again: after a failure, or once a download has
  // given the device something it did not have before.
  const [attempt, setAttempt] = useState(0);

  // Re-running the effect must abandon any translation still in flight, whose
  // result belongs to the previous song or language.
  const runIdRef = useRef(0);

  const source = useMemo(() => detectLyricsLanguage(lyrics), [lyrics]);
  const target = isTranslatableLanguage(language) ? language : null;
  // Unreadable lyrics are left alone rather than translated from a guess, and a
  // song already in the app's language needs nothing doing.
  const isTranslatable = !!source && !!target && source !== target && !!lyrics.trim();

  // Whatever the reader fetched in the language manager may be exactly what this
  // song was missing, so it picks up from there on its own.
  useEffect(() => onTranslationPacksChanged(() => setAttempt((n) => n + 1)), []);

  useEffect(() => {
    const ref = runIdRef;
    const runId = ++ref.current;
    const isStale = () => ref.current !== runId;

    setTranslated(null);
    setShowTranslation(false);
    setDownloadProgress(0);
    setPhase(null);

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

      // Downloading is the reader's call and is made in the language manager, so
      // stop here and let the toggle send them there.
      if (await requiresDownloadConsent(source, target)) {
        if (!isStale()) setStatus('needs-download');
        return;
      }
      if (isStale()) return;

      setStatus('translating');
      try {
        const result = await translateLyrics(lyrics, {
          from: source,
          to: target,
          onProgress: ({ phase: stage, ratio }) => {
            if (isStale()) return;
            setPhase(stage);
            setDownloadProgress(ratio);
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
  }, [path, source, target, lyrics, isTranslatable, attempt]);

  const clearLyrics = useCallback(async () => {
    setTranslated(null);
    await deleteLyrics(path);
  }, [path]);

  return {
    /** Lyrics to render: the translation while it is toggled on, else the original. */
    displayLyrics: showTranslation && translated ? translated : lyrics,
    /** The translation on its own, for showing it beside the original rather than instead of it. */
    translatedLyrics: translated,
    showTranslation,
    setShowTranslation,
    hasTranslation: !!translated,
    status,
    downloadProgress,
    /** Whether the figure above refers to a download or to translating. */
    translationPhase: phase,
    /**
     * Opens the language manager, where the missing download lives. The song
     * carries its own language along so the pair it needs is the one fetched.
     */
    requestSetup: useCallback(() => {
      openLanguageManager({ source: source ?? undefined });
    }, [source]),
    /** Runs the translation again after it failed. */
    retry: useCallback(() => setAttempt((n) => n + 1), []),
    clear: clearLyrics,
  };
}
