/* ================================
 *  Canvas Renderer & Responsive Scaling
 * ================================*/

/**
 * Canvas Renderer class for managing canvas setup and responsive scaling
 */
class CanvasRenderer {
    constructor(canvasId = "game") {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        
        if (!this.canvas || !this.ctx) {
            throw new Error(`Canvas element with id "${canvasId}" not found`);
        }
        
        this.initialized = false;
        this.resizeCallbacks = new Set();
        
        this.init();
    }
    
    /**
     * Initialize canvas renderer
     */
    init() {
        if (this.initialized) return;
        
        // Set up event listeners for responsive scaling
        this.setupResponsiveScaling();
        
        // Apply initial scaling
        this.applyResponsiveCanvasScaling();
        
        this.initialized = true;
    }
    
    /**
     * Set up responsive scaling event listeners
     */
    setupResponsiveScaling() {
        const handleResize = () => {
            this.applyResponsiveCanvasScaling();
            this.notifyResizeCallbacks();
        };
        
        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);
    }
    
    /**
     * Apply responsive canvas scaling
     * Scales canvas to fit viewport while maintaining aspect ratio
     */
    applyResponsiveCanvasScaling() {
        const rawScale = Math.min(
            window.innerWidth  / this.canvas.width,
            window.innerHeight / this.canvas.height
        );

        // Determine whether the game is currently zoomed in (match countdown or active)
        const zoomed = this.canvas.classList.contains("zooming") || 
                      this.canvas.classList.contains("game-active");

        // Base scale caps
        const maxScale = zoomed ? 1 : 0.7; // 0.7 for menu, 1 when zoomed
        const scale = Math.min(rawScale, maxScale);

        this.canvas.style.transform = `translate(-50%, -65%) scale(${scale})`;
    }
    
    /**
     * Get canvas element
     * @returns {HTMLCanvasElement} Canvas element
     */
    getCanvas() {
        return this.canvas;
    }
    
    /**
     * Get canvas context
     * @returns {CanvasRenderingContext2D} Canvas context
     */
    getContext() {
        return this.ctx;
    }
    
    /**
     * Get canvas dimensions
     * @returns {object} Width and height
     */
    getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    
    /**
     * Set canvas dimensions
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    setDimensions(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.applyResponsiveCanvasScaling();
    }
    
    /**
     * Clear the entire canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Add callback to be called when canvas resizes
     * @param {function} callback - Resize callback function
     * @returns {function} Unsubscribe function
     */
    onResize(callback) {
        this.resizeCallbacks.add(callback);
        return () => this.resizeCallbacks.delete(callback);
    }
    
    /**
     * Notify all resize callbacks
     */
    notifyResizeCallbacks() {
        this.resizeCallbacks.forEach(callback => {
            try {
                callback(this.getDimensions());
            } catch (error) {
                console.error('Error in resize callback:', error);
            }
        });
    }
    
    /**
     * Add zoom class to canvas
     */
    enableZoom() {
        this.canvas.classList.add("zooming");
        this.applyResponsiveCanvasScaling();
    }
    
    /**
     * Remove zoom class from canvas
     */
    disableZoom() {
        this.canvas.classList.remove("zooming");
        this.applyResponsiveCanvasScaling();
    }
    
    /**
     * Add game active class to canvas
     */
    setGameActive() {
        this.canvas.classList.add("game-active");
        this.applyResponsiveCanvasScaling();
    }
    
    /**
     * Remove game active class from canvas
     */
    setGameInactive() {
        this.canvas.classList.remove("game-active");
        this.applyResponsiveCanvasScaling();
    }
}

// Create global instance
const canvasRenderer = new CanvasRenderer();

// Export for global access (IIFE pattern for compatibility)
window.CanvasRenderer = canvasRenderer;

// Provide backward compatibility for existing code
window.canvas = canvasRenderer.getCanvas();
window.ctx = canvasRenderer.getContext(); 