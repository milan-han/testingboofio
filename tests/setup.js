import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Add Jest compatibility for tests that use jest.fn(), jest.spyOn(), etc.
global.jest = vi;
global.spyOn = vi.spyOn;

// Add DOM globals that jsdom doesn't provide by default
if (typeof window !== 'undefined') {
  Object.defineProperties(window.Node.prototype, {
    TEXT_NODE: { value: 3 },
    ELEMENT_NODE: { value: 1 },
    DOCUMENT_NODE: { value: 9 },
    DOCUMENT_FRAGMENT_NODE: { value: 11 }
  });
}

// Add any missing DOM APIs that your tests might need
if (typeof window !== 'undefined') {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {}
    });
  }
} 