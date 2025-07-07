import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM elements needed by GameStore
global.window = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

// Mock console methods
global.console = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Utility to fresh-import GameStore
async function loadGameStore() {
  vi.resetModules();
  delete global.window.GameStore;
  await import('../../js/core/game-store.js');
  return global.window.GameStore;
}

describe('GameStore', () => {
  let gameStore;

  beforeEach(async () => {
    gameStore = await loadGameStore();
    gameStore.reset();
  });

  describe('Basic state management', () => {
    it('should get and set simple values', () => {
      expect(gameStore.get('gameState')).toBe('setup');
      
      gameStore.set('gameState', 'playing');
      expect(gameStore.get('gameState')).toBe('playing');
    });

    it('should set multiple values with object', () => {
      gameStore.set({
        gameState: 'countdown',
        scoreP1: 5,
        scoreP2: 3
      });
      
      expect(gameStore.get('gameState')).toBe('countdown');
      expect(gameStore.get('scoreP1')).toBe(5);
      expect(gameStore.get('scoreP2')).toBe(3);
    });

    it('should return undefined for unknown keys', () => {
      expect(gameStore.get('unknownKey')).toBeUndefined();
    });
  });

  describe('Subscriptions', () => {
    it('should call subscribers when values change', () => {
      const callback = vi.fn();
      gameStore.subscribe('gameState', callback);
      
      gameStore.set('gameState', 'playing');
      
      expect(callback).toHaveBeenCalledWith('playing', 'setup');
    });

    it('should support global subscribers', () => {
      const callback = vi.fn();
      gameStore.subscribe('*', callback);
      
      gameStore.set('scoreP1', 1);
      
      expect(callback).toHaveBeenCalledWith('scoreP1', 1, 0);
    });

    it('should allow unsubscribing', () => {
      const callback = vi.fn();
      const unsubscribe = gameStore.subscribe('gameState', callback);
      
      unsubscribe();
      gameStore.set('gameState', 'playing');
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Score management', () => {
    it('should increment player scores correctly', () => {
      gameStore.incrementScore(1);
      expect(gameStore.get('scoreP1')).toBe(1);
      expect(gameStore.get('scoreP2')).toBe(0);
      
      gameStore.incrementScore(2);
      expect(gameStore.get('scoreP1')).toBe(1);
      expect(gameStore.get('scoreP2')).toBe(1);
    });

    it('should reset scores to zero', () => {
      gameStore.set({ scoreP1: 5, scoreP2: 3 });
      gameStore.resetScores();
      
      expect(gameStore.get('scoreP1')).toBe(0);
      expect(gameStore.get('scoreP2')).toBe(0);
    });
  });

  describe('Celebration management', () => {
    it('should start celebration correctly', () => {
      gameStore.startCelebration();
      
      expect(gameStore.get('celebrating')).toBe(true);
      expect(gameStore.get('celebrateTimer')).toBe(0);
    });

    it('should end celebration and reset state', () => {
      gameStore.set({
        celebrating: true,
        celebrateTimer: 1000,
        gameSpeed: 0.5
      });
      
      gameStore.endCelebration();
      
      expect(gameStore.get('celebrating')).toBe(false);
      expect(gameStore.get('celebrateTimer')).toBe(0);
      expect(gameStore.get('gameSpeed')).toBe(1.0);
    });
  });

  describe('Game reset', () => {
    it('should reset to initial state', () => {
      gameStore.set({
        gameState: 'playing',
        scoreP1: 5,
        scoreP2: 3,
        celebrating: true
      });
      
      gameStore.reset();
      
      expect(gameStore.get('gameState')).toBe('setup');
      expect(gameStore.get('scoreP1')).toBe(0);
      expect(gameStore.get('scoreP2')).toBe(0);
      expect(gameStore.get('celebrating')).toBe(false);
    });
  });
}); 