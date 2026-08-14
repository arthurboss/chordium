import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../native-recognizer', () => ({
  isNativeRecognizerSupported: vi.fn(),
  createNativeRecognizer: () => ({ id: 'native' }),
}));

vi.mock('../local-model-recognizer', () => ({
  isLocalModelSupported: vi.fn(),
  isLocalModelDownloaded: vi.fn(),
  createLocalModelRecognizer: () => ({ id: 'local-model' }),
}));

import {
  canListen,
  createRecognizer,
  requiresDownloadConsent,
  resolveRecognizerKind,
} from '../get-recognizer';
import { isNativeRecognizerSupported } from '../native-recognizer';
import { isLocalModelDownloaded, isLocalModelSupported } from '../local-model-recognizer';

const nativeSupported = vi.mocked(isNativeRecognizerSupported);
const localSupported = vi.mocked(isLocalModelSupported);
const localDownloaded = vi.mocked(isLocalModelDownloaded);

describe('resolveRecognizerKind', () => {
  beforeEach(() => vi.resetAllMocks());

  it('prefers the browser wherever it can hear, since it needs no download', () => {
    nativeSupported.mockReturnValue(true);
    expect(resolveRecognizerKind()).toBe('native');
  });

  it('falls back to the downloaded model where the browser cannot', () => {
    nativeSupported.mockReturnValue(false);
    expect(resolveRecognizerKind()).toBe('local-model');
  });
});

describe('requiresDownloadConsent', () => {
  beforeEach(() => vi.resetAllMocks());

  it('needs none where the browser hears for itself, so the first press listens', async () => {
    nativeSupported.mockReturnValue(true);
    expect(await requiresDownloadConsent()).toBe(false);
    // The fallback is not even consulted when the browser can do it.
    expect(localDownloaded).not.toHaveBeenCalled();
  });

  it('needs consent when only our model can serve and it is absent', async () => {
    nativeSupported.mockReturnValue(false);
    localSupported.mockReturnValue(true);
    localDownloaded.mockResolvedValue(false);
    expect(await requiresDownloadConsent()).toBe(true);
  });

  it('needs none once our model is on the device', async () => {
    nativeSupported.mockReturnValue(false);
    localSupported.mockReturnValue(true);
    localDownloaded.mockResolvedValue(true);
    expect(await requiresDownloadConsent()).toBe(false);
  });

  it('needs none where nothing can run, since there is nothing to agree to', async () => {
    nativeSupported.mockReturnValue(false);
    localSupported.mockReturnValue(false);
    expect(await requiresDownloadConsent()).toBe(false);
  });
});

describe('canListen', () => {
  beforeEach(() => vi.resetAllMocks());

  it('can when the browser hears for itself', () => {
    nativeSupported.mockReturnValue(true);
    localSupported.mockReturnValue(false);
    expect(canListen()).toBe(true);
  });

  it('can when only the downloaded model is possible', () => {
    nativeSupported.mockReturnValue(false);
    localSupported.mockReturnValue(true);
    expect(canListen()).toBe(true);
  });

  it('cannot in an insecure context, where neither backend can run', () => {
    nativeSupported.mockReturnValue(false);
    localSupported.mockReturnValue(false);
    expect(canListen()).toBe(false);
  });
});

describe('createRecognizer', () => {
  it('builds the backend it is asked for', () => {
    expect(createRecognizer('native').id).toBe('native');
    expect(createRecognizer('local-model').id).toBe('local-model');
  });
});
