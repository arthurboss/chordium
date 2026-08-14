import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../native-recognizer', () => ({
  isNativeRecognizerSupported: vi.fn(),
  getNativeState: vi.fn(),
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
import { getNativeState, isNativeRecognizerSupported } from '../native-recognizer';
import { isLocalModelDownloaded, isLocalModelSupported } from '../local-model-recognizer';

const nativeSupported = vi.mocked(isNativeRecognizerSupported);
const nativeState = vi.mocked(getNativeState);
const localSupported = vi.mocked(isLocalModelSupported);
const localDownloaded = vi.mocked(isLocalModelDownloaded);

describe('resolveRecognizerKind', () => {
  beforeEach(() => vi.resetAllMocks());

  it('prefers the browser when it can recognise on the device, since nothing is downloaded', async () => {
    nativeState.mockResolvedValue('ready');
    expect(await resolveRecognizerKind('en')).toBe('native');
  });

  it('still prefers the browser when it has its own model to fetch first', async () => {
    nativeState.mockResolvedValue('needs-install');
    expect(await resolveRecognizerKind('en')).toBe('native');
  });

  it('falls back to the downloaded model when the browser cannot', async () => {
    nativeState.mockResolvedValue('no');
    expect(await resolveRecognizerKind('de')).toBe('local-model');
  });
});

describe('requiresDownloadConsent', () => {
  beforeEach(() => vi.resetAllMocks());

  it('needs none when the browser is already able', async () => {
    nativeState.mockResolvedValue('ready');
    expect(await requiresDownloadConsent('en')).toBe(false);
  });

  it('needs consent when the browser has to fetch its own model', async () => {
    nativeState.mockResolvedValue('needs-install');
    expect(await requiresDownloadConsent('en')).toBe(true);
  });

  it('needs consent when our model is absent', async () => {
    nativeState.mockResolvedValue('no');
    localSupported.mockReturnValue(true);
    localDownloaded.mockResolvedValue(false);
    expect(await requiresDownloadConsent('de')).toBe(true);
  });

  it('needs none once our model is on the device', async () => {
    nativeState.mockResolvedValue('no');
    localSupported.mockReturnValue(true);
    localDownloaded.mockResolvedValue(true);
    expect(await requiresDownloadConsent('de')).toBe(false);
  });

  it('needs none where nothing can run, since there is nothing to agree to', async () => {
    nativeState.mockResolvedValue('no');
    localSupported.mockReturnValue(false);
    expect(await requiresDownloadConsent('de')).toBe(false);
  });
});

describe('canListen', () => {
  beforeEach(() => vi.resetAllMocks());

  it('can when the browser recognises on the device', async () => {
    nativeSupported.mockReturnValue(true);
    nativeState.mockResolvedValue('ready');
    expect(await canListen('en')).toBe(true);
  });

  it('can when only the downloaded model is possible', async () => {
    nativeSupported.mockReturnValue(false);
    nativeState.mockResolvedValue('no');
    localSupported.mockReturnValue(true);
    expect(await canListen('de')).toBe(true);
  });

  it('cannot in an insecure context, where neither backend can run', async () => {
    nativeSupported.mockReturnValue(false);
    nativeState.mockResolvedValue('no');
    localSupported.mockReturnValue(false);
    expect(await canListen('de')).toBe(false);
  });
});

describe('createRecognizer', () => {
  it('builds the backend it is asked for', () => {
    expect(createRecognizer('native').id).toBe('native');
    expect(createRecognizer('local-model').id).toBe('local-model');
  });
});
