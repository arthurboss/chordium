import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resolveTranslatorKind,
  requiresDownloadConsent,
  canTranslate,
  translateLyrics,
} from '../get-translator';
import { isTranslatableLanguage, TRANSLATABLE_LANGUAGES } from '../types';

const localTranslate = vi.hoisted(() => vi.fn());

const localSupported = vi.hoisted(() => vi.fn(() => true));

/** Nothing is on the device unless a test says so. */
const localDownloaded = vi.hoisted(() => vi.fn(async () => false));

vi.mock('../local-model-translator', () => ({
  createLocalModelTranslator: () => ({ id: 'local-model', translate: localTranslate }),
  isLocalModelDownloaded: localDownloaded,
  isLocalModelSupported: localSupported,
}));

interface FakeTranslatorApi {
  availability: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
}

function installTranslatorApi(api: FakeTranslatorApi | undefined) {
  (globalThis as { Translator?: unknown }).Translator = api;
}

describe('translatable languages', () => {
  it('covers the languages the app is offered in', () => {
    expect([...TRANSLATABLE_LANGUAGES]).toEqual(['en', 'es', 'pt-BR', 'de']);
  });

  it('rejects languages the app does not offer', () => {
    expect(isTranslatableLanguage('de')).toBe(true);
    expect(isTranslatableLanguage('fr')).toBe(false);
  });
});

describe('choosing a translator', () => {
  beforeEach(() => {
    localTranslate.mockReset();
    localTranslate.mockResolvedValue('lokale übersetzung');
    localSupported.mockReturnValue(true);
    localDownloaded.mockResolvedValue(false);
  });

  afterEach(() => {
    installTranslatorApi(undefined);
  });

  it("prefers the browser's translator when it handles the pair", async () => {
    installTranslatorApi({
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn(),
    });
    await expect(resolveTranslatorKind('pt-BR', 'de')).resolves.toBe('chrome');
  });

  it('falls back to the local model when the browser has no translator', async () => {
    installTranslatorApi(undefined);
    await expect(resolveTranslatorKind('pt-BR', 'de')).resolves.toBe('local-model');
  });

  it('falls back when the browser cannot handle that pair', async () => {
    installTranslatorApi({
      availability: vi.fn().mockResolvedValue('unavailable'),
      create: vi.fn(),
    });
    await expect(resolveTranslatorKind('pt-BR', 'de')).resolves.toBe('local-model');
  });

  it('asks permission only when a model has to be downloaded', async () => {
    installTranslatorApi({
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn(),
    });
    await expect(requiresDownloadConsent('pt-BR', 'de')).resolves.toBe(false);

    installTranslatorApi(undefined);
    await expect(requiresDownloadConsent('pt-BR', 'de')).resolves.toBe(true);
  });
});

describe('translateLyrics', () => {
  beforeEach(() => {
    localTranslate.mockReset();
    localTranslate.mockResolvedValue('lokale übersetzung');
    localSupported.mockReturnValue(true);
    localDownloaded.mockResolvedValue(false);
  });

  afterEach(() => {
    installTranslatorApi(undefined);
    vi.restoreAllMocks();
  });

  it("returns the browser translation when it succeeds", async () => {
    installTranslatorApi({
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockResolvedValue({
        translate: vi.fn().mockResolvedValue('browser übersetzung'),
      }),
    });
    await expect(translateLyrics('hoje', { from: 'pt-BR', to: 'de' })).resolves.toBe(
      'browser übersetzung'
    );
    expect(localTranslate).not.toHaveBeenCalled();
  });

  it('falls back to the local model when the browser translator fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    installTranslatorApi({
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn().mockRejectedValue(new Error('language pack failed')),
    });
    await expect(translateLyrics('hoje', { from: 'pt-BR', to: 'de' })).resolves.toBe(
      'lokale übersetzung'
    );
    expect(localTranslate).toHaveBeenCalledOnce();
  });

  it('surfaces the failure when the local model itself fails', async () => {
    installTranslatorApi(undefined);
    localTranslate.mockRejectedValue(new Error('out of memory'));
    await expect(translateLyrics('hoje', { from: 'pt-BR', to: 'de' })).rejects.toThrow(
      'out of memory'
    );
  });
});

describe('when nothing can translate', () => {
  beforeEach(() => {
    localSupported.mockReturnValue(false);
  });

  afterEach(() => {
    installTranslatorApi(undefined);
    localSupported.mockReturnValue(true);
    localDownloaded.mockResolvedValue(false);
  });

  it('reports the pair as untranslatable without the local model', async () => {
    installTranslatorApi(undefined);
    await expect(canTranslate('pt-BR', 'de')).resolves.toBe(false);
  });

  it("still translates when the browser's own translator can", async () => {
    installTranslatorApi({
      availability: vi.fn().mockResolvedValue('available'),
      create: vi.fn(),
    });
    await expect(canTranslate('pt-BR', 'de')).resolves.toBe(true);
  });

  it('does not ask to download a model that cannot run', async () => {
    installTranslatorApi(undefined);
    await expect(requiresDownloadConsent('pt-BR', 'de')).resolves.toBe(false);
  });
});
