/* ================================
 *  Canvas Renderer & Responsive Scaling
 * ================================*/

class CanvasRenderer {
    constructor(defaultId = 'gameCanvas') {
        this.canvasId = defaultId;
        this.canvas = null;
        this.ctx = null;
        this.dpr = 1;
        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 3.0;
        this.initialized = false;
        this.baseWidth = 960;
        this.baseHeight = 600;
        this.currentWidth = this.baseWidth;
        this.currentHeight = this.baseHeight;
    }

    initCanvas(id = this.canvasId) {
        this.canvasId = id;
        this.canvas = document.getElementById(id);
        if (!this.canvas) {
            console.warn('Canvas element not found:', id);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.applyDevicePixelRatio();
        this.initialized = true;
    }

    applyDevicePixelRatio() {
        if (!this.ctx) return;
        this.dpr = window.devicePixelRatio || 1;
        this.ctx.scale(this.dpr, this.dpr);
    }

    setCanvasDimensions(width, height) {
        if (!this.canvas) return;
        this.currentWidth = width;
        this.currentHeight = height;
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    calculateScaleFactor(containerW, containerH, baseW, baseH) {
        return Math.min(containerW / baseW, containerH / baseH);
    }

    handleResize() {
        if (!this.canvas) return;
        const scale = this.calculateScaleFactor(window.innerWidth, window.innerHeight, this.baseWidth, this.baseHeight);
        const w = Math.round(this.baseWidth * scale);
        const h = Math.round(this.baseHeight * scale);
        this.setCanvasDimensions(w, h);
    }

    setZoom(level) {
        this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, level));
    }

    getZoom() {
        return this.zoom;
    }

    zoomIn() {
        this.setZoom(this.zoom * 1.2);
    }

    zoomOut() {
        this.setZoom(this.zoom / 1.2);
    }

    screenToWorld(x, y) {
        return { x: x / this.zoom, y: y / this.zoom };
    }

    worldToScreen(x, y) {
        return { x: x * this.zoom, y: y * this.zoom };
    }

    getCanvasDimensions() {
        return { width: this.currentWidth, height: this.currentHeight };
    }

    isInitialized() {
        return this.initialized;
    }
}

// Create global instance
const canvasRenderer = new CanvasRenderer();

// Export for global access (IIFE pattern for compatibility)
window.CanvasRenderer = canvasRenderer;

