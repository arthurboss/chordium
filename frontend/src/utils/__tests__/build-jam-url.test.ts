import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * `buildJamUrl` decides which host a shared jam code points at.
 *
 * Production rewrites to the canonical host because the same build is served on
 * several hostnames and the per-deployment one stops serving the app after the
 * next deploy. Previews must NOT be rewritten, or a code scanned while
 * reviewing a branch would open production instead of the branch.
 */

const ORIGIN = 'https://app-git-some-branch-arthurboss.vercel.app';
const CANONICAL = 'https://chordium.vercel.app';

async function buildUrl() {
  // Re-import per case so the module re-reads the stubbed env.
  vi.resetModules();
  const { buildJamUrl, JAM_QR_PREFIX } = await import('../chordSheetQR');
  return buildJamUrl(JAM_QR_PREFIX + 'PAYLOAD', 'Oasis', 'Wonderwall');
}

describe('buildJamUrl — which host a shared code targets', () => {
  const realEnv = process.env.VERCEL_ENV;

  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: ORIGIN } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    process.env.VERCEL_ENV = realEnv;
    vi.resetModules();
  });

  it('rewrites to the canonical host in production', async () => {
    vi.stubEnv('VITE_APP_URL', CANONICAL);
    process.env.VERCEL_ENV = 'production';

    expect(new URL(await buildUrl()).origin).toBe(CANONICAL);
  });

  it('keeps the preview origin so a scanned code opens the branch', async () => {
    vi.stubEnv('VITE_APP_URL', CANONICAL);
    process.env.VERCEL_ENV = 'preview';

    expect(new URL(await buildUrl()).origin).toBe(ORIGIN);
  });

  it('keeps the local origin in development', async () => {
    vi.stubEnv('VITE_APP_URL', CANONICAL);
    process.env.VERCEL_ENV = '';

    expect(new URL(await buildUrl()).origin).toBe(ORIGIN);
  });

  it('falls back to the current origin when no canonical host is configured', async () => {
    vi.stubEnv('VITE_APP_URL', '');
    process.env.VERCEL_ENV = 'production';

    expect(new URL(await buildUrl()).origin).toBe(ORIGIN);
  });

  it('keeps the song path and payload regardless of host', async () => {
    vi.stubEnv('VITE_APP_URL', CANONICAL);
    process.env.VERCEL_ENV = 'production';

    const url = new URL(await buildUrl());
    expect(url.pathname).toBe('/oasis/wonderwall');
    expect(url.searchParams.get('d')).toBe('PAYLOAD');
  });
});
