// Mock the toast hook first
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAsyncError } from '../../useAsyncError';
import { setupAsyncErrorMocks } from './test-utils';
import { toast } from '@/hooks/use-toast';

const mockToast = vi.mocked(toast);

describe('useAsyncError - Event Handler Wrapping', () => {
  beforeEach(() => {
    setupAsyncErrorMocks();
    mockToast.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should wrap event handlers that succeed', () => {
    const { result } = renderHook(() => useAsyncError());
    const mockEvent = { target: { value: 'test' } };
    const successHandler = vi.fn();
    
    const wrappedHandler = result.current.wrapEventHandler(successHandler, 'event-success');
    
    act(() => {
      wrappedHandler(mockEvent);
    });

    expect(successHandler).toHaveBeenCalledWith(mockEvent);
    expect(result.current.error).toBeNull();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should wrap event handlers that throw errors', () => {
    const { result } = renderHook(() => useAsyncError());
    const mockEvent = { target: { value: 'test' } };
    const errorHandler = vi.fn().mockImplementation(() => {
      throw new Error('Event handler error');
    });
    
    const wrappedHandler = result.current.wrapEventHandler(errorHandler, 'event-error');
    
    act(() => {
      const response = wrappedHandler(mockEvent);
      expect(response).toBeUndefined();
    });

    expect(errorHandler).toHaveBeenCalledWith(mockEvent);
    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'Event handler error',
      context: 'event-error',
    }));
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Something went wrong',
      description: 'Event handler error',
      variant: 'destructive',
      duration: 5000,
    });
  });

  it('should wrap click event handlers', () => {
    const { result } = renderHook(() => useAsyncError());
    const clickEvent = new MouseEvent('click');
    const clickHandler = vi.fn();
    
    const wrappedHandler = result.current.wrapEventHandler(clickHandler, 'click-handler');
    
    act(() => {
      wrappedHandler(clickEvent);
    });

    expect(clickHandler).toHaveBeenCalledWith(clickEvent);
    expect(result.current.error).toBeNull();
  });

  it('should wrap form submission handlers', () => {
    const { result } = renderHook(() => useAsyncError());
    const formEvent = { 
      preventDefault: vi.fn(),
      target: { elements: { email: { value: 'test@example.com' } } }
    };
    const formHandler = vi.fn();
    
    const wrappedHandler = result.current.wrapEventHandler(formHandler, 'form-submit');
    
    act(() => {
      wrappedHandler(formEvent);
    });

    expect(formHandler).toHaveBeenCalledWith(formEvent);
    expect(result.current.error).toBeNull();
  });

  it('should wrap change event handlers with errors', () => {
    const { result } = renderHook(() => useAsyncError());
    const changeEvent = { target: { value: 'invalid-value' } };
    const changeHandler = vi.fn().mockImplementation(() => {
      throw new Error('Invalid input value');
    });
    
    const wrappedHandler = result.current.wrapEventHandler(changeHandler, 'change-handler');
    
    act(() => {
      wrappedHandler(changeEvent);
    });

    expect(result.current.error?.message).toBe('Invalid input value');
    expect(result.current.error?.context).toBe('change-handler');
  });

  it('should handle event handlers with string errors', () => {
    const { result } = renderHook(() => useAsyncError());
    const mockEvent = { type: 'keydown' };
    const stringErrorHandler = vi.fn().mockImplementation(() => {
      throw new Error('String error from handler');
    });
    
    const wrappedHandler = result.current.wrapEventHandler(stringErrorHandler, 'string-error-handler');
    
    act(() => {
      wrappedHandler(mockEvent);
    });

    expect(result.current.error).toEqual(expect.objectContaining({
      message: 'String error from handler',
      context: 'string-error-handler',
    }));
  });

  it('should handle event handler execution', () => {
    const { result } = renderHook(() => useAsyncError());
    const mockEvent = { target: { checked: true } };
    const checkboxHandler = vi.fn();
    
    const wrappedHandler = result.current.wrapEventHandler(checkboxHandler, 'checkbox-handler');
    
    act(() => {
      wrappedHandler(mockEvent);
    });

    expect(checkboxHandler).toHaveBeenCalledWith(mockEvent);
  });

  it('should handle multiple event handlers with different contexts', () => {
    const { result } = renderHook(() => useAsyncError());
    
    const buttonHandler = vi.fn().mockImplementation(() => {
      throw new Error('Button error');
    });
    const inputHandler = vi.fn().mockImplementation(() => {
      throw new Error('Input error');
    });
    
    const wrappedButtonHandler = result.current.wrapEventHandler(buttonHandler, 'button-context');
    const wrappedInputHandler = result.current.wrapEventHandler(inputHandler, 'input-context');
    
    act(() => {
      wrappedButtonHandler({ type: 'click' });
    });

    expect(result.current.error?.context).toBe('button-context');
    expect(result.current.error?.message).toBe('Button error');

    act(() => {
      wrappedInputHandler({ type: 'change' });
    });

    expect(result.current.error?.context).toBe('input-context');
    expect(result.current.error?.message).toBe('Input error');
  });

  it('should handle null and undefined event arguments', () => {
    const { result } = renderHook(() => useAsyncError());
    const nullHandler = vi.fn();
    
    const wrappedHandler = result.current.wrapEventHandler(nullHandler, 'null-event');
    
    act(() => {
      wrappedHandler(null);
      wrappedHandler(undefined);
    });

    expect(nullHandler).toHaveBeenCalledWith(null);
    expect(nullHandler).toHaveBeenCalledWith(undefined);
    expect(result.current.error).toBeNull();
  });
});
