import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChordSheetViewer from '../ChordSheetViewer';

const { toggleAutoScroll } = vi.hoisted(() => ({ toggleAutoScroll: vi.fn() }));

vi.mock('@/hooks/use-auto-scroll', () => ({
  useAutoScroll: () => ({
    autoScroll: false,
    scrollSpeed: 3,
    setScrollSpeed: vi.fn(),
    toggleAutoScroll,
  }),
}));

vi.mock('@/hooks/use-chord-display-settings', () => ({
  useChordDisplaySettings: () => ({
    fontSize: 16,
    fontStyle: 'default',
    viewMode: 'simplificada',
    setViewMode: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-chord-editor', () => ({
  useChordEditor: () => ({
    isEditing: false,
    setIsEditing: vi.fn(),
    editContent: '',
    setEditContent: vi.fn(),
    handleSaveEdits: vi.fn(),
    updateEditContent: vi.fn(),
  }),
}));

vi.mock('../ChordDisplay/ChordSheetContent', () => ({ default: () => <div /> }));
vi.mock('../ChordDisplay/components/StickyControlsBar', () => ({
  default: ({ onToggleFullscreen }: { onToggleFullscreen: () => void }) => (
    <button onClick={onToggleFullscreen}>toggle-fullscreen</button>
  ),
}));
vi.mock('../ChordDisplay/ChordEdit', () => ({ default: () => <div /> }));

const chordSheet = {
  rawHtml: '<div />',
  songChords: [],
  songKey: 'C',
  guitarCapo: 0,
  title: 'Test song',
  artist: 'Test artist',
} as never;

function setFullscreen(element: Element | null) {
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => element,
  });
  act(() => {
    document.dispatchEvent(new Event('fullscreenchange'));
  });
}

describe('ChordSheetViewer fullscreen auto-scroll', () => {
  beforeEach(() => {
    toggleAutoScroll.mockReset();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    setFullscreen(null);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('stops auto-scroll when fullscreen is left by the browser', () => {
    const { container } = render(<ChordSheetViewer chordSheet={chordSheet} content="" />);

    setFullscreen(container.querySelector('#chord-sheet-viewer'));
    expect(toggleAutoScroll).not.toHaveBeenCalled();

    setFullscreen(null);
    expect(toggleAutoScroll).toHaveBeenCalledWith(false);
  });

  it('stops auto-scroll before the exit starts', async () => {
    const order: string[] = [];
    toggleAutoScroll.mockImplementation(() => {
      order.push('stop');
    });
    const exitFullscreen = vi.fn(async () => {
      order.push('exit');
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        get: () => null,
      });
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });

    const { container, getByText } = render(<ChordSheetViewer chordSheet={chordSheet} content="" />);
    setFullscreen(container.querySelector('#chord-sheet-viewer'));

    fireEvent.click(getByText('toggle-fullscreen'));

    await waitFor(() => expect(exitFullscreen).toHaveBeenCalled());
    expect(toggleAutoScroll).toHaveBeenCalledWith(false);
    expect(order).toEqual(['stop', 'exit']);
  });

  it('leaves auto-scroll alone when it was never in fullscreen', () => {
    render(<ChordSheetViewer chordSheet={chordSheet} content="" />);

    setFullscreen(null);

    expect(toggleAutoScroll).not.toHaveBeenCalled();
  });
});
