import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from 'vitest';
import StyleToolbar from '../index';
import type { TranslationStatus } from '@/hooks/useLyricsVersion';

const toastInfo = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({ toast: { info: toastInfo, error: toastError } }));

// The labels only need to be distinguishable, so keys stand in for the copy.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && 'percent' in options ? `${key}:${options.percent}` : key,
  }),
}));

function renderToolbar(overrides: {
  translationStatus: TranslationStatus;
  translationProgress?: number;
  translationPhase?: 'download' | 'translate' | null;
  hasTranslation?: boolean;
  onToggleTranslation?: () => void;
  onRequestTranslationSetup?: () => void;
  onRetryTranslation?: () => void;
}) {
  return render(
    <StyleToolbar
      fontSize={14}
      setFontSize={vi.fn()}
      viewMode="tabs-off"
      setViewMode={vi.fn()}
      isLyricsMode
      {...overrides}
    />
  );
}

describe('the translation toggle while a translation is not ready', () => {
  beforeAll(() => {
    // The font-size slider measures its thumb, which jsdom cannot do.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  });

  beforeEach(() => {
    toastInfo.mockReset();
    toastError.mockReset();
  });

  // The suite does not clean the DOM between tests on its own, and a leftover
  // toolbar would be found instead of the one under test.
  afterEach(cleanup);

  it('shows how far the download has got', () => {
    renderToolbar({ translationStatus: 'translating', translationProgress: 0.42 });

    expect(screen.getByText('lyrics.downloadingModel:42')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('tells translating apart from the download it followed', () => {
    renderToolbar({
      translationStatus: 'translating',
      translationProgress: 0.3,
      translationPhase: 'translate',
    });

    expect(screen.getByText('lyrics.translatingProgress:30')).toBeInTheDocument();
  });

  it('leaves out the bar until the download reports something', () => {
    renderToolbar({ translationStatus: 'translating', translationProgress: 0 });

    expect(screen.getByText('lyrics.translating')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('adds nothing to what the label already says when pressed too early', async () => {
    const onToggleTranslation = vi.fn();
    renderToolbar({ translationStatus: 'translating', onToggleTranslation });

    await userEvent.click(screen.getByRole('button', { name: /lyrics\./ }));

    expect(toastInfo).not.toHaveBeenCalled();
    expect(onToggleTranslation).not.toHaveBeenCalled();
  });

  it('explains itself when this browser cannot translate at all', async () => {
    renderToolbar({ translationStatus: 'unavailable' });

    await userEvent.click(screen.getByRole('button', { name: /lyrics\./ }));

    expect(toastError).toHaveBeenCalledWith('lyrics.translationUnavailable');
  });

  it('tries again after a failure instead of staying stuck', async () => {
    const onRetryTranslation = vi.fn();
    renderToolbar({ translationStatus: 'failed', onRetryTranslation });

    await userEvent.click(screen.getByRole('button', { name: /lyrics\./ }));

    expect(onRetryTranslation).toHaveBeenCalledOnce();
  });

  it('asks for the download rather than pretending to translate', () => {
    renderToolbar({ translationStatus: 'needs-download' });

    expect(screen.getByText('lyrics.translationNeedsDownload')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('sends the reader to the language manager to get it', async () => {
    const onRequestTranslationSetup = vi.fn();
    const onToggleTranslation = vi.fn();
    renderToolbar({
      translationStatus: 'needs-download',
      onRequestTranslationSetup,
      onToggleTranslation,
    });

    await userEvent.click(screen.getByRole('button', { name: /lyrics\./ }));

    expect(onRequestTranslationSetup).toHaveBeenCalledOnce();
    expect(onToggleTranslation).not.toHaveBeenCalled();
    expect(toastInfo).not.toHaveBeenCalled();
  });

  it('stays out of the way when there is nothing to translate', () => {
    renderToolbar({ translationStatus: 'unnecessary' });

    expect(screen.getByRole('button', { name: /lyrics\./ })).toBeDisabled();
  });

  it('shows the translation once it is there', async () => {
    const onToggleTranslation = vi.fn();
    renderToolbar({ translationStatus: 'ready', hasTranslation: true, onToggleTranslation });

    await userEvent.click(screen.getByRole('button', { name: /lyrics\./ }));

    expect(onToggleTranslation).toHaveBeenCalledOnce();
    expect(toastInfo).not.toHaveBeenCalled();
  });
});
