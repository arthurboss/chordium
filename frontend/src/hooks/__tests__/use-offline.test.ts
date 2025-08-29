import { renderHook, act } from '@testing-library/react';
import { useOffline } from '../use-offline';

describe('useOffline', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    // Restore original navigator
    global.navigator = originalNavigator;
  });

  it('should return online state when navigator.onLine is true', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOffline());

    expect(result.current.isOffline).toBe(false);
    expect(result.current.wasOnline).toBe(true);
    expect(result.current.lastOnline).toBeInstanceOf(Date);
  });

  it('should return offline state when navigator.onLine is false', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOffline());

    expect(result.current.isOffline).toBe(true);
    expect(result.current.wasOnline).toBe(false);
    expect(result.current.lastOnline).toBeNull();
  });

  it('should update state when online event is fired', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOffline());

    // Initially offline
    expect(result.current.isOffline).toBe(true);

    // Simulate going online
    act(() => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOffline).toBe(false);
    expect(result.current.wasOnline).toBe(true);
    expect(result.current.lastOnline).toBeInstanceOf(Date);
  });

  it('should update state when offline event is fired', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOffline());

    // Initially online
    expect(result.current.isOffline).toBe(false);

    // Simulate going offline
    act(() => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOffline).toBe(true);
    expect(result.current.wasOnline).toBe(true);
    expect(result.current.lastOnline).toBeInstanceOf(Date);
  });

  it('should preserve wasOnline state when going offline', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: true,
    });

    const { result } = renderHook(() => useOffline());

    // Initially online
    expect(result.current.wasOnline).toBe(true);

    // Go offline
    act(() => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    // Should preserve wasOnline state
    expect(result.current.wasOnline).toBe(true);
    expect(result.current.isOffline).toBe(true);
  });
});


