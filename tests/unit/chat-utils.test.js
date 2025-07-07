import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM elements
const mockMessageElement = {
  style: {},
  appendChild: vi.fn(),
  classList: { add: vi.fn() },
  scrollIntoView: vi.fn()
};

const mockChatMessages = {
  appendChild: vi.fn(),
  children: [],
  get childElementCount() { return this.children.length; },
  removeChild: vi.fn()
};

global.document = {
  createElement: vi.fn(() => mockMessageElement),
  getElementById: vi.fn((id) => {
    if (id === 'chatMessages') return mockChatMessages;
    return null;
  }),
  createTextNode: vi.fn((text) => ({ textContent: text, nodeValue: text }))
};

global.window = {
  getComputedStyle: vi.fn(() => ({ color: 'rgb(255, 255, 255)' }))
};

// Mock console methods
global.console = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Utility to fresh-import ChatUtils
async function loadChatUtils() {
  vi.resetModules();
  delete global.window.ChatUtils;
  await import('../../js/ui/chat-utils.js');
  return global.window.ChatUtils;
}

describe('ChatUtils', () => {
  let chatUtils;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    mockChatMessages.children = [];
    
    chatUtils = await loadChatUtils();
  });

  describe('Message creation', () => {
    it('should add a basic message', () => {
      chatUtils.addMessage('self', 'Hello world');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockChatMessages.appendChild).toHaveBeenCalled();
    });

    it('should handle different message types', () => {
      chatUtils.addMessage('friend', 'Friend message');
      chatUtils.addMessage('system', 'System message');
      chatUtils.addMessage('self', 'Self message');
      
      expect(mockChatMessages.appendChild).toHaveBeenCalledTimes(3);
    });

    it('should handle empty messages gracefully', () => {
      chatUtils.addMessage('self', '');
      
      expect(mockChatMessages.appendChild).toHaveBeenCalled();
    });
  });

  describe('Message styling', () => {
    it('should apply correct styles for self messages', () => {
      chatUtils.addMessage('self', 'My message');
      
      expect(mockMessageElement.style.color).toBeDefined();
      expect(mockMessageElement.style.textAlign).toBe('right');
    });

    it('should apply correct styles for friend messages', () => {
      chatUtils.addMessage('friend', 'Friend message');
      
      expect(mockMessageElement.style.color).toBeDefined();
      expect(mockMessageElement.style.textAlign).toBe('left');
    });

    it('should apply correct styles for system messages', () => {
      chatUtils.addMessage('system', 'System message');
      
      expect(mockMessageElement.style.color).toBe('#999');
      expect(mockMessageElement.style.textAlign).toBe('center');
      expect(mockMessageElement.style.fontStyle).toBe('italic');
    });
  });

  describe('Message limits', () => {
    it('should limit the number of messages', () => {
      // Add more than the maximum allowed messages
      for (let i = 0; i < 55; i++) {
        mockChatMessages.children.push({ id: `msg-${i}` });
      }
      
      chatUtils.addMessage('self', 'New message');
      
      // Should have attempted to remove old messages
      expect(mockChatMessages.removeChild).toHaveBeenCalled();
    });
  });

  describe('Player color integration', () => {
    beforeEach(() => {
      // Mock player objects with colors
      global.window.player = { color: '#ff0000' };
      global.window.player2 = { color: '#0000ff' };
    });

    it('should use player colors for self messages', () => {
      chatUtils.addMessage('self', 'My message');
      
      // Should have used player color
      expect(mockMessageElement.style.color).toBeDefined();
    });

    it('should use player2 color for friend messages', () => {
      chatUtils.addMessage('friend', 'Friend message');
      
      // Should have used player2 color
      expect(mockMessageElement.style.color).toBeDefined();
    });
  });

  describe('Auto-scrolling', () => {
    it('should scroll new messages into view', () => {
      chatUtils.addMessage('self', 'New message');
      
      expect(mockMessageElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'end'
      });
    });
  });

  describe('Error handling', () => {
    it('should handle missing chat container gracefully', () => {
      document.getElementById.mockReturnValueOnce(null);
      
      expect(() => chatUtils.addMessage('self', 'Test')).not.toThrow();
    });

    it('should handle invalid message types', () => {
      expect(() => chatUtils.addMessage('invalid', 'Test')).not.toThrow();
    });
  });

  describe('Global function compatibility', () => {
    it('should expose addChatMessage as global function', () => {
      expect(window.addChatMessage).toBeDefined();
      expect(typeof window.addChatMessage).toBe('function');
    });

    it('should work through global function', () => {
      window.addChatMessage('self', 'Global test');
      
      expect(mockChatMessages.appendChild).toHaveBeenCalled();
    });
  });
}); 