import { TranslatorUnavailableError, translateLineByLine, type Translator } from './types';

/**
 * Chrome's on-device Translator API, available in Chromium 138+. Chrome ships
 * language packs itself, so there is nothing for us to download and nothing to
 * warn the user about.
 */
interface ChromeTranslatorInstance {
  translate(text: string): Promise<string>;
  destroy?(): void;
}

interface ChromeTranslatorMonitor {
  addEventListener(type: 'downloadprogress', listener: (event: { loaded: number }) => void): void;
}

interface ChromeTranslatorApi {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
  create(options: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (monitor: ChromeTranslatorMonitor) => void;
  }): Promise<ChromeTranslatorInstance>;
}

function getApi(): ChromeTranslatorApi | null {
  const api = (globalThis as { Translator?: ChromeTranslatorApi }).Translator;
  return api && typeof api.create === 'function' && typeof api.availability === 'function' ? api : null;
}

export function isChromeTranslatorSupported(): boolean {
  return getApi() !== null;
}

/**
 * How the browser's translator stands on a language pair:
 * - "no": the pair is not supported at all.
 * - "needs-gesture": supported, but the language pack has to be fetched, which
 *   the browser only allows in response to a click.
 * - "ready": the pack is present, so translating can start unprompted.
 */
export type ChromePairState = 'no' | 'needs-gesture' | 'ready';

export async function getChromePairState(from: string, to: string): Promise<ChromePairState> {
  const api = getApi();
  if (!api) return 'no';
  try {
    const status = await api.availability({ sourceLanguage: from, targetLanguage: to });
    if (status === 'unavailable') return 'no';
    return status === 'available' ? 'ready' : 'needs-gesture';
  } catch {
    return 'no';
  }
}

/**
 * Starts fetching a language pack. Must be called straight from a click: the
 * browser refuses to download one outside a user gesture, and awaiting anything
 * first spends it.
 *
 * The download itself runs through Chrome's own component updater rather than
 * the page's network stack, so it is invisible to fetch/XHR listeners and
 * DevTools' Network panel; onProgress via the API's own monitor is the only way
 * to observe it.
 */
export function warmChromePair(
  from: string,
  to: string,
  onProgress?: (ratio: number) => void
): Promise<unknown> | null {
  const api = getApi();
  if (!api) return null;
  return api
    .create({
      sourceLanguage: from,
      targetLanguage: to,
      monitor(monitor) {
        monitor.addEventListener('downloadprogress', (event) => onProgress?.(event.loaded));
      },
    })
    .catch(() => null);
}

export function createChromeTranslator(): Translator {
  // Instances are per language pair and reusable, so they are kept for the
  // lifetime of the page rather than rebuilt per line.
  const instances = new Map<string, Promise<ChromeTranslatorInstance>>();

  return {
    id: 'chrome',
    async translate(text, from, to) {
      const api = getApi();
      if (!api) throw new TranslatorUnavailableError('Translator API is not available');

      const key = `${from}->${to}`;
      let instance = instances.get(key);
      if (!instance) {
        instance = api.create({ sourceLanguage: from, targetLanguage: to });
        instances.set(key, instance);
      }

      try {
        const resolved = await instance;
        // Chrome's translate() collapses newlines into spaces, so lyrics are
        // sent one line at a time to keep their stanza structure.
        return await translateLineByLine(text, (line) => resolved.translate(line));
      } catch (error) {
        // A failed create() must not be cached, or every later attempt for this
        // pair resolves to the same rejected promise.
        instances.delete(key);
        throw error;
      }
    },
  };
}
