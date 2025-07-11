/* ================================
 *  Utility Helper Functions
 * ================================*/

/**
 * Convert hex color to rgba with specified alpha
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} RGBA color string
 */
function hexToRgba(hex, alpha = 1) {
    if (typeof hex !== 'string') {
        return `rgba(0, 0, 0, ${alpha})`;
    }
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
        return `rgba(0, 0, 0, ${alpha})`;
    }
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get a darker shade of a color
 * @param {string} color - Color string
 * @returns {string} Darker color
 */
function getDarkerShade(color, amount = 40) {
    if (typeof color !== 'string') {
        return '#000000';
    }
    let clean = color.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
        clean = '000000';
    }
    const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Draw a blueprint-style grid background
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} [gridSize=20] - Grid spacing in pixels
*/
function drawBlueprintGrid(ctx, width, height, gridSize = 20) {
    const GRID_ALPHA = 0.15;
    
    ctx.save();
    ctx.globalAlpha = GRID_ALPHA;
    ctx.strokeStyle = '#1a3a5c';
    ctx.lineWidth = 1;
    if (typeof ctx.setLineDash === 'function') {
        ctx.setLineDash([2, 2]);
    }
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
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
window.hexToRgba = hexToRgba;
window.getDarkerShade = getDarkerShade;
window.drawBlueprintGrid = drawBlueprintGrid;
window.UtilHelpers = {
    hexToRgba,
    getDarkerShade,
    drawBlueprintGrid
};

if (typeof module !== 'undefined') {
    module.exports = {
        hexToRgba,
        getDarkerShade,
        drawBlueprintGrid
    };
}
