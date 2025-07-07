/* ================================
 *  Utility Helper Functions
 * ================================*/

/**
 * Convert hex color to rgba with specified alpha
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
function hexToRgba(hex, alpha = 0.3) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get a darker shade of a color
 * @param {string} color - Color string
 * @returns {string} Darker color
 */
function getDarkerShade(color) {
    // Simple darkening by reducing brightness
    if (color.startsWith('#')) {
        const r = Math.max(0, parseInt(color.slice(1, 3), 16) - 40);
        const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 40);
        const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 40);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return color;
}

/**
 * Draw a blueprint-style grid background
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function drawBlueprintGrid(ctx, width, height) {
    const GRID_SPACING = 20;
    const GRID_ALPHA = 0.15;
    
    ctx.save();
    ctx.globalAlpha = GRID_ALPHA;
    ctx.strokeStyle = "#00BFFF";
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= width; x += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Blueprint corner markers
    const markerSize = 10;
    const corners = [
        [0, 0], [width, 0], [0, height], [width, height]
    ];
    
    corners.forEach(([x, y]) => {
        ctx.strokeRect(x - markerSize/2, y - markerSize/2, markerSize, markerSize);
    });
    
    ctx.restore();
}

// Export functions (IIFE pattern for compatibility)
window.UtilHelpers = {
    hexToRgba,
    getDarkerShade,
    drawBlueprintGrid
}; 