/* ================================
 *  Field Drawing
 * ================================*/

function drawField() {
    // Use base canvas dimensions instead of DPR-scaled dimensions
    const baseWidth = 960;
    const baseHeight = 600;
    
    // --- Background ---
    if (gameState === "menu") {
        // Asphalt city roads background
        ctx.fillStyle = "#404040";
        ctx.fillRect(0, 0, baseWidth, baseHeight);
    } else {
        ctx.fillStyle = "#2d5a2d"; // full grass in match
        ctx.fillRect(0, 0, baseWidth, baseHeight);
    }

    // Translate pitch elements with world offset in menu mode
    ctx.save();
    if (gameState === "menu") {
        ctx.translate(worldOffsetX, worldOffsetY);
    }

    // Draw grass rectangle for pitch only (within white border)
    ctx.fillStyle = "#2d5a2d";
    ctx.fillRect(20, 20, baseWidth - 40, baseHeight - 40);

    // --- White pitch lines ---
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, baseWidth - 40, baseHeight - 40);
    ctx.beginPath();
    ctx.moveTo(baseWidth / 2, 20);
    ctx.lineTo(baseWidth / 2, baseHeight - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(baseWidth / 2, baseHeight / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    const goalH = 120;
    const goalTop = (baseHeight - goalH) / 2;
    const goalBottom = goalTop + goalH;
    const penaltyBoxW = 120;
    const penaltyBoxH = 200;
    const penaltyBoxTop = (baseHeight - penaltyBoxH) / 2;
    
    // Left side markings
    ctx.fillStyle = hexToRgba(player.color, 0.5);
    ctx.fillRect(0, goalTop, 20, goalH);
    ctx.strokeRect(20, penaltyBoxTop, penaltyBoxW, penaltyBoxH);
    const goalAreaW = 60;
    const goalAreaH = 120;
    const goalAreaTop = (baseHeight - goalAreaH) / 2;
    ctx.strokeRect(20, goalAreaTop, goalAreaW, goalAreaH);
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.arc(20, goalTop, 8, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(20, goalBottom, 8, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    
    // Right side markings
    ctx.fillStyle = hexToRgba(player2.color, 0.5);
    ctx.fillRect(baseWidth - 20, goalTop, 20, goalH);
    ctx.strokeRect(baseWidth - 20 - penaltyBoxW, penaltyBoxTop, penaltyBoxW, penaltyBoxH);
    ctx.strokeRect(baseWidth - 20 - goalAreaW, goalAreaTop, goalAreaW, goalAreaH);
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.arc(baseWidth - 20, goalTop, 8, Math.PI / 2, 3 * Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(baseWidth - 20, goalBottom, 8, Math.PI / 2, 3 * Math.PI / 2);
    ctx.fill();

    // Center spot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(baseWidth / 2, baseHeight / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // --- CRT scan-line overlay (drawn last so it covers entire scene) ---
    for (let y = 0; y < baseHeight; y += 4) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, y, baseWidth, 2);
    }
}

// Practice mode camera update
function updatePracticeCamera() {
    // Keep the camera static in demo (setup) mode by resetting any world offset
    // This disables the external camera pan entirely.
    worldOffsetX = 0;
    worldOffsetY = 0;
    // No further processing required.
} 