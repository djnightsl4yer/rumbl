import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onTab?: (direction: 'forward' | 'backward') => void;
  trapFocus?: boolean;
  autoFocus?: boolean;
}

export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) {
  const { onEscape, onEnter, onTab, trapFocus = false, autoFocus = false } = options;

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    );
  }, [containerRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key === 'Enter' && onEnter) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'BUTTON' && target.tagName !== 'A') {
          event.preventDefault();
          onEnter();
          return;
        }
      }

      if (event.key === 'Tab' && trapFocus) {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (event.shiftKey) {
          if (activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
          onTab?.('backward');
        } else {
          if (activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
          onTab?.('forward');
        }
      }
    },
    [onEscape, onEnter, onTab, trapFocus, getFocusableElements]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);

    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, handleKeyDown, autoFocus, getFocusableElements]);

  return {
    getFocusableElements,
  };
}

export function useArrowNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    loop?: boolean;
    columns?: number;
  } = {}
) {
  const { orientation = 'vertical', loop = true, columns = 1 } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      );

      const currentIndex = focusableElements.findIndex(
        (el) => el === document.activeElement
      );

      if (currentIndex === -1) return;

      let targetIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (orientation === 'grid') {
            targetIndex = currentIndex + columns;
          } else if (orientation === 'vertical') {
            targetIndex = currentIndex + 1;
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (orientation === 'grid') {
            targetIndex = currentIndex - columns;
          } else if (orientation === 'vertical') {
            targetIndex = currentIndex - 1;
          }
          break;

        case 'ArrowRight':
          event.preventDefault();
          if (orientation === 'horizontal' || orientation === 'grid') {
            targetIndex = currentIndex + 1;
          }
          break;

        case 'ArrowLeft':
          event.preventDefault();
          if (orientation === 'horizontal' || orientation === 'grid') {
            targetIndex = currentIndex - 1;
          }
          break;

        case 'Home':
          event.preventDefault();
          targetIndex = 0;
          break;

        case 'End':
          event.preventDefault();
          targetIndex = focusableElements.length - 1;
          break;

        default:
          return;
      }

      if (loop) {
        targetIndex =
          (targetIndex + focusableElements.length) % focusableElements.length;
      } else {
        targetIndex = Math.max(0, Math.min(targetIndex, focusableElements.length - 1));
      }

      if (focusableElements[targetIndex]) {
        focusableElements[targetIndex].focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, orientation, loop, columns]);
}
