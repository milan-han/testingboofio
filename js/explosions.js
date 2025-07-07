/* ================================
 *  Car Explosion Systems
 * ================================*/

function createCarExplosion(x, y, carColor) {
    // Determine explosion colors based on car color
    let explosionColors, coreColors, sparkColors;
    
    if (carColor === "#c62828") {
        // Red car explosion - dark reds
        explosionColors = ['#8b0000', '#660000', '#4d0000', '#330000', '#990000', '#770000'];
        coreColors = ['#aa0000', '#880000', '#cc0000', '#660000'];
        sparkColors = ['#993300', '#772200', '#551100'];
    } else if (carColor === "#2962ff") {
        // Blue car explosion - dark blues
        explosionColors = ['#000080', '#000066', '#00004d', '#000033', '#000099', '#000077'];
        coreColors = ['#0000aa', '#000088', '#0000cc', '#000066'];
        sparkColors = ['#003399', '#002277', '#001155'];
    } else if (carColor === "#7b1fa2") {
        // Purple car explosion - dark purples
        explosionColors = ['#4a148c', '#3d1474', '#31105d', '#240c46', '#5e1a96', '#4f1680'];
        coreColors = ['#6a1b9a', '#5e1690', '#7b1fa2', '#4a148c'];
        sparkColors = ['#663399', '#552277', '#441155'];
    } else if (carColor === "#f9a825") {
        // Yellow car explosion - dark oranges/yellows
        explosionColors = ['#e65100', '#d84315', '#bf360c', '#a52714', '#ff6f00', '#ef6c00'];
        coreColors = ['#ff8f00', '#ff6f00', '#ffa000', '#e65100'];
        sparkColors = ['#cc6600', '#bb5500', '#aa4400'];
    } else if (carColor === "#e91e63") {
        // Pink car explosion - dark pinks/magentas
        explosionColors = ['#ad1457', '#880e4f', '#6d1b42', '#4f1235', '#c2185b', '#9c1449'];
        coreColors = ['#e91e63', '#c2185b', '#f06292', '#ad1457'];
        sparkColors = ['#cc3366', '#bb2255', '#aa1144'];
    } else if (carColor === "#212121") {
        // Black car explosion - dark grays/blacks with metallic shine
        explosionColors = ['#424242', '#303030', '#1a1a1a', '#0d0d0d', '#555555', '#333333'];
        coreColors = ['#616161', '#424242', '#757575', '#303030'];
        sparkColors = ['#666666', '#444444', '#222222'];
    } else {
        // Fallback to red if unknown color
        explosionColors = ['#8b0000', '#660000', '#4d0000', '#330000', '#990000', '#770000'];
        coreColors = ['#aa0000', '#880000', '#cc0000', '#660000'];
        sparkColors = ['#993300', '#772200', '#551100'];
    }
    
    // Phase 1: Initial explosion burst (more contained)
    for (let i = 0; i < 60; i++) {
        const speed = Math.random() * 12 + 4;
        const angle = Math.random() * Math.PI * 2;
        
        carExplosions.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
            vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 3 - 2,
            life: Math.random() * 45 + 30,
            maxLife: Math.random() * 45 + 30,
            size: Math.floor(Math.random() * 3) + 2,
            color: explosionColors[Math.floor(Math.random() * explosionColors.length)],
            type: 'explosion',
            phase: 'burst'
        });
    }
    
    // Phase 2: Central intense flame core (more focused)
    for (let i = 0; i < 25; i++) {
        carExplosions.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 - 1,
            life: Math.random() * 35 + 25,
            maxLife: Math.random() * 35 + 25,
            size: Math.floor(Math.random() * 2) + 2,
            color: coreColors[Math.floor(Math.random() * coreColors.length)],
            type: 'core',
            phase: 'core'
        });
    }
    
    // Phase 3: Outer sparks and embers (less spread)
    for (let i = 0; i < 35; i++) {
        const distance = Math.random() * 20 + 8;
        const angle = Math.random() * Math.PI * 2;
        
        carExplosions.push({
            x: x + Math.cos(angle) * distance,
            y: y + Math.sin(angle) * distance,
            vx: Math.cos(angle) * (Math.random() * 6 + 2),
            vy: Math.sin(angle) * (Math.random() * 6 + 2) - 1,
            life: Math.random() * 60 + 40,
            maxLife: Math.random() * 60 + 40,
            size: Math.floor(Math.random() * 2) + 1,
            color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
            type: 'spark',
            phase: 'sparks'
        });
    }
    
    // Phase 4: Delayed secondary explosions (fewer car parts)
    setTimeout(() => {
        for (let i = 0; i < 15; i++) {
            const partColors = ['#444444', '#222222', '#555555', '#111111']; // Keep debris neutral
            carExplosions.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 2,
                life: Math.random() * 70 + 50,
                maxLife: Math.random() * 70 + 50,
                size: Math.floor(Math.random() * 2) + 1,
                color: partColors[Math.floor(Math.random() * partColors.length)],
                type: 'debris',
                phase: 'debris'
            });
        }
    }, 150 * gameSpeed);
}

function createScorchMark(x, y) {
    // Create a retro pixelated square burn mark that matches the game's aesthetic
    const baseSize = 50; // Keep the large size
    const pixelSize = 2; // Smaller pixels - back to 2x2 from 3x3
    const gridSize = Math.floor(baseSize / pixelSize);
    
    const scorchGrid = [];
    
    // Create a roughly square burn pattern with gradient from center
    for (let i = 0; i < gridSize; i++) {
        scorchGrid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            const distFromCenter = Math.hypot(i - gridSize/2, j - gridSize/2);
            const maxDist = gridSize / 2;
            const normalizedDist = Math.min(distFromCenter / maxDist, 1);
            
            // Create probability based on distance from center
            let burnChance = 1 - normalizedDist;
            
            // Add slight randomness for organic feel
            burnChance += (Math.random() - 0.5) * 0.2;
            
            // Store the normalized distance for gradient coloring
            if (burnChance > 0.15) {
                scorchGrid[i][j] = normalizedDist; // Store distance for gradient
            } else {
                scorchGrid[i][j] = null; // No burn
            }
        }
    }
    
    scorchMarks.push({
        x: x - (gridSize * pixelSize) / 2, // Center the grid
        y: y - (gridSize * pixelSize) / 2,
        grid: scorchGrid,
        pixelSize: pixelSize,
        gridSize: gridSize
    });
}

function updateCarExplosions(deltaTime = 1.0) {
    for (let i = carExplosions.length - 1; i >= 0; i--) {
        const p = carExplosions[i];
        const speedMultiplier = (celebrating ? gameSpeed : 1.0) * deltaTime;
        p.vy += 0.2 * speedMultiplier; // gravity affected by slow-mo and delta time
        p.x += p.vx * speedMultiplier; // movement affected by slow-mo and delta time
        p.y += p.vy * speedMultiplier;
        p.vx *= Math.pow(0.98, speedMultiplier); // air resistance affected by slow-mo and delta time
        p.life -= speedMultiplier; // particle life affected by slow-mo and delta time
        if (p.life <= 0) carExplosions.splice(i, 1);
    }
}

function drawCarExplosions() {
    carExplosions.forEach(p => {
        const alpha = p.life / p.maxLife;
        
        if (p.phase === 'core') {
            // Draw boost-style flame core with pixelated pattern
            const size = Math.floor(6 * alpha) + 2;
            const pixelSize = 2;
            
            // Use boost flame drawing technique
            ctx.fillStyle = p.color;
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    // Create jagged flame pattern like boost
                    if (Math.random() > 0.3) {
                        const offsetX = (i - size/2) * pixelSize;
                        const offsetY = (j - size/2) * pixelSize;
                        ctx.fillRect(p.x + offsetX, p.y + offsetY, pixelSize, pixelSize);
                    }
                }
            }
            
            // Ultra-bright center like boost flames
            if (alpha > 0.6) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(p.x - 1, p.y - 1, 3, 3);
            }
            
        } else if (p.phase === 'burst') {
            // Main explosion chunks with enhanced effects
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            
            // Add bright core for fresh particles
            if (alpha > 0.8) {
                ctx.fillStyle = '#ffffff';
                const coreSize = Math.max(1, p.size - 1);
                ctx.fillRect(p.x + 0.5, p.y + 0.5, coreSize, coreSize);
            }
            
            // Enhanced outer sparks
            if (p.size > 3 && alpha > 0.6) {
                ctx.fillStyle = '#ffff99';
                const sparkPositions = [
                    {x: p.x - p.size, y: p.y},
                    {x: p.x + p.size, y: p.y},
                    {x: p.x, y: p.y - p.size},
                    {x: p.x, y: p.y + p.size}
                ];
                sparkPositions.forEach(spark => {
                    if (Math.random() > 0.4) {
                        ctx.fillRect(spark.x, spark.y, 1, 1);
                    }
                });
            }
            
        } else if (p.phase === 'sparks') {
            // Boost-style trailing sparks
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            
            // Add spark trails
            if (Math.random() > 0.7) {
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(p.x - p.vx * 0.3, p.y - p.vy * 0.3, 1, 1);
            }
            
        } else if (p.phase === 'debris') {
            // Car parts and debris
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            
            // Add some metallic shine to parts
            if (alpha > 0.5 && Math.random() > 0.8) {
                ctx.fillStyle = '#cccccc';
                ctx.fillRect(p.x, p.y, 1, 1);
            }
        }
    });
}

function drawScorchMarks() {
    scorchMarks.forEach(mark => {
        // Draw pixelated square burn mark with gradient
        for (let i = 0; i < mark.gridSize; i++) {
            for (let j = 0; j < mark.gridSize; j++) {
                const burnDistance = mark.grid[i][j];
                if (burnDistance === null) continue;
                
                const pixelX = mark.x + i * mark.pixelSize;
                const pixelY = mark.y + j * mark.pixelSize;
                
                // Create gradient from black center to brown edges with opacity
                let color;
                let opacity;
                if (burnDistance < 0.3) {
                    // Center - pure black, completely opaque
                    color = '0, 0, 0';
                    opacity = 1.0;
                } else if (burnDistance < 0.5) {
                    // Inner area - very dark brown, very opaque
                    color = '10, 6, 2';
                    opacity = 0.95;
                } else if (burnDistance < 0.7) {
                    // Middle area - dark brown, mostly opaque
                    color = '26, 15, 8';
                    opacity = 0.85;
                } else if (burnDistance < 0.85) {
                    // Outer area - medium brown, semi-opaque
                    color = '45, 27, 16';
                    opacity = 0.7;
                } else {
                    // Edge - light brown, more transparent
                    color = '74, 48, 32';
                    opacity = 0.5;
                }
                
                ctx.fillStyle = `rgba(${color}, ${opacity})`;
                ctx.fillRect(pixelX, pixelY, mark.pixelSize, mark.pixelSize);
            }
        }
    });
} 