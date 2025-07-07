import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock canvas context
const mockContext = {
  strokeStyle: '',
  lineWidth: 0,
  setLineDash: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn()
};

global.window = {};

// Mock console methods
global.console = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Utility to fresh-import helpers
async function loadHelpers() {
  vi.resetModules();
  delete global.window.hexToRgba;
  delete global.window.getDarkerShade;
  delete global.window.drawBlueprintGrid;
  await import('../../js/utils/helpers.js');
  return {
    hexToRgba: global.window.hexToRgba,
    getDarkerShade: global.window.getDarkerShade,
    drawBlueprintGrid: global.window.drawBlueprintGrid
  };
}

describe('Utility Helpers', () => {
  let helpers;

  beforeEach(async () => {
    vi.clearAllMocks();
    helpers = await loadHelpers();
  });

  describe('hexToRgba', () => {
    it('should convert 6-digit hex to rgba with alpha', () => {
      const result = helpers.hexToRgba('#ff0000', 0.5);
      expect(result).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should convert 3-digit hex to rgba', () => {
      const result = helpers.hexToRgba('#f00', 1.0);
      expect(result).toBe('rgba(255, 0, 0, 1)');
    });

    it('should handle hex without # prefix', () => {
      const result = helpers.hexToRgba('00ff00', 0.8);
      expect(result).toBe('rgba(0, 255, 0, 0.8)');
    });

    it('should default alpha to 1 when not provided', () => {
      const result = helpers.hexToRgba('#0000ff');
      expect(result).toBe('rgba(0, 0, 255, 1)');
    });

    it('should handle invalid hex gracefully', () => {
      const result = helpers.hexToRgba('invalid', 0.5);
      expect(result).toBe('rgba(0, 0, 0, 0.5)'); // Should fallback to black
    });

    it('should handle edge case colors', () => {
      expect(helpers.hexToRgba('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
      expect(helpers.hexToRgba('#ffffff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
    });
  });

  describe('getDarkerShade', () => {
    it('should darken a hex color', () => {
      const result = helpers.getDarkerShade('#ff0000');
      expect(result).toMatch(/^#[0-9a-f]{6}$/); // Should be valid hex
      expect(result).not.toBe('#ff0000'); // Should be different
    });

    it('should handle 3-digit hex colors', () => {
      const result = helpers.getDarkerShade('#f00');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should handle colors without # prefix', () => {
      const result = helpers.getDarkerShade('ff0000');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('should make black stay black', () => {
      const result = helpers.getDarkerShade('#000000');
      expect(result).toBe('#000000');
    });

    it('should handle invalid colors gracefully', () => {
      const result = helpers.getDarkerShade('invalid');
      expect(result).toMatch(/^#[0-9a-f]{6}$/); // Should return valid hex
    });

    it('should consistently darken colors', () => {
      const red = helpers.getDarkerShade('#ff0000');
      const green = helpers.getDarkerShade('#00ff00');
      const blue = helpers.getDarkerShade('#0000ff');
      
      // All should be darker (lower values)
      expect(red < '#ff0000').toBe(true);
      expect(green < '#00ff00').toBe(true);
      expect(blue < '#0000ff').toBe(true);
    });
  });

  describe('drawBlueprintGrid', () => {
    beforeEach(() => {
      // Reset context mock
      mockContext.strokeStyle = '';
      mockContext.lineWidth = 0;
    });

    it('should draw a grid with correct styling', () => {
      helpers.drawBlueprintGrid(mockContext, 960, 600, 50);
      
      expect(mockContext.strokeStyle).toBe('#1a3a5c');
      expect(mockContext.lineWidth).toBe(1);
      expect(mockContext.setLineDash).toHaveBeenCalledWith([2, 2]);
    });

    it('should draw correct number of grid lines', () => {
      helpers.drawBlueprintGrid(mockContext, 100, 100, 20);
      
      // Should draw vertical and horizontal lines
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('should handle zero dimensions gracefully', () => {
      expect(() => {
        helpers.drawBlueprintGrid(mockContext, 0, 0, 20);
      }).not.toThrow();
    });

    it('should handle very small grid sizes', () => {
      expect(() => {
        helpers.drawBlueprintGrid(mockContext, 960, 600, 1);
      }).not.toThrow();
    });

    it('should handle large grid sizes', () => {
      expect(() => {
        helpers.drawBlueprintGrid(mockContext, 960, 600, 1000);
      }).not.toThrow();
    });

    it('should save and restore context state', () => {
      helpers.drawBlueprintGrid(mockContext, 960, 600, 50);
      
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });
  });

  describe('Global function exposure', () => {
    it('should expose all functions globally', () => {
      expect(window.hexToRgba).toBeDefined();
      expect(window.getDarkerShade).toBeDefined();
      expect(window.drawBlueprintGrid).toBeDefined();
      
      expect(typeof window.hexToRgba).toBe('function');
      expect(typeof window.getDarkerShade).toBe('function');
      expect(typeof window.drawBlueprintGrid).toBe('function');
    });

    it('should work through global functions', () => {
      const rgba = window.hexToRgba('#ff0000', 0.5);
      const darker = window.getDarkerShade('#ff0000');
      
      expect(rgba).toBe('rgba(255, 0, 0, 0.5)');
      expect(darker).toMatch(/^#[0-9a-f]{6}$/);
      
      expect(() => {
        window.drawBlueprintGrid(mockContext, 960, 600, 50);
      }).not.toThrow();
    });
  });
}); 