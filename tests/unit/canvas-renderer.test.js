import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock canvas and context
const mockContext = {
  scale: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn()
};

const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  width: 800,
  height: 600,
  style: {},
  addEventListener: vi.fn()
};

// Mock DOM elements
global.document = {
  getElementById: vi.fn((id) => {
    if (id === 'gameCanvas') return mockCanvas;
    return null;
  }),
  addEventListener: vi.fn()
};

global.window = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  devicePixelRatio: 2,
  innerWidth: 1000,
  innerHeight: 700
};

// Mock console methods
global.console = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Utility to fresh-import CanvasRenderer
async function loadCanvasRenderer() {
  vi.resetModules();
  delete global.window.CanvasRenderer;
  await import('../../js/core/canvas-renderer.js');
  return global.window.CanvasRenderer;
}

describe('CanvasRenderer', () => {
  let canvasRenderer;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    window.devicePixelRatio = 2;
    
    canvasRenderer = await loadCanvasRenderer();
  });

  describe('Initialization', () => {
    it('should initialize canvas with correct dimensions', () => {
      canvasRenderer.initCanvas();
      
      expect(document.getElementById).toHaveBeenCalledWith('gameCanvas');
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('should handle missing canvas element gracefully', () => {
      document.getElementById.mockReturnValueOnce(null);
      
      expect(() => canvasRenderer.initCanvas()).not.toThrow();
    });
  });

  describe('Canvas scaling', () => {
    beforeEach(() => {
      canvasRenderer.initCanvas();
    });

    it('should apply device pixel ratio scaling', () => {
      canvasRenderer.applyDevicePixelRatio();
      
      // Should scale context by device pixel ratio
      expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
    });

    it('should set canvas dimensions correctly', () => {
      canvasRenderer.setCanvasDimensions(960, 600);
      
      expect(mockCanvas.width).toBe(960 * 2); // DPR scaled
      expect(mockCanvas.height).toBe(600 * 2); // DPR scaled
      expect(mockCanvas.style.width).toBe('960px');
      expect(mockCanvas.style.height).toBe('600px');
    });
  });

  describe('Responsive scaling', () => {
    beforeEach(() => {
      canvasRenderer.initCanvas();
    });

    it('should calculate scale factor correctly', () => {
      const scale = canvasRenderer.calculateScaleFactor(1000, 700, 960, 600);
      
      // Should scale to fit within container while maintaining aspect ratio
      expect(scale).toBeCloseTo(1.04, 2); // 1000/960 vs 700/600, min should be ~1.04
    });

    it('should handle responsive resize', () => {
      canvasRenderer.handleResize();
      
      // Should have set up canvas dimensions based on window size
      expect(mockCanvas.style.width).toBeDefined();
      expect(mockCanvas.style.height).toBeDefined();
    });
  });

  describe('Zoom functionality', () => {
    beforeEach(() => {
      canvasRenderer.initCanvas();
    });

    it('should set zoom level within bounds', () => {
      canvasRenderer.setZoom(1.5);
      expect(canvasRenderer.getZoom()).toBe(1.5);
      
      // Test bounds
      canvasRenderer.setZoom(0.1); // Too low
      expect(canvasRenderer.getZoom()).toBe(0.5); // Should clamp to min
      
      canvasRenderer.setZoom(5.0); // Too high
      expect(canvasRenderer.getZoom()).toBe(3.0); // Should clamp to max
    });

    it('should zoom in and out correctly', () => {
      canvasRenderer.setZoom(1.0);
      
      canvasRenderer.zoomIn();
      expect(canvasRenderer.getZoom()).toBe(1.2);
      
      canvasRenderer.zoomOut();
      expect(canvasRenderer.getZoom()).toBe(1.0);
    });
  });

  describe('Coordinate transformation', () => {
    beforeEach(() => {
      canvasRenderer.initCanvas();
    });

    it('should convert screen to world coordinates', () => {
      const worldCoords = canvasRenderer.screenToWorld(400, 300);
      
      expect(worldCoords).toHaveProperty('x');
      expect(worldCoords).toHaveProperty('y');
      expect(typeof worldCoords.x).toBe('number');
      expect(typeof worldCoords.y).toBe('number');
    });

    it('should convert world to screen coordinates', () => {
      const screenCoords = canvasRenderer.worldToScreen(480, 300);
      
      expect(screenCoords).toHaveProperty('x');
      expect(screenCoords).toHaveProperty('y');
      expect(typeof screenCoords.x).toBe('number');
      expect(typeof screenCoords.y).toBe('number');
    });
  });

  describe('Canvas state', () => {
    beforeEach(() => {
      canvasRenderer.initCanvas();
    });

    it('should report canvas dimensions correctly', () => {
      canvasRenderer.setCanvasDimensions(960, 600);
      
      const dimensions = canvasRenderer.getCanvasDimensions();
      expect(dimensions.width).toBe(960);
      expect(dimensions.height).toBe(600);
    });

    it('should report if canvas is initialized', () => {
      expect(canvasRenderer.isInitialized()).toBe(true);
    });
  });
}); 