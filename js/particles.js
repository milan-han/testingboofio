/* ================================
 *  Particle Systems
 * ================================*/

// Particle arrays are now declared in globals.js

function updateParticles(arr, deltaTime = 1.0) {
    for (let i = arr.length-1; i>=0; i--) {
        const p = arr[i];
        const speedMultiplier = (celebrating ? gameSpeed : 1.0) * deltaTime;
        p.x += (p.vx || 0) * speedMultiplier;
        p.y += (p.vy || 0) * speedMultiplier;
        p.life -= speedMultiplier;
        if (p.alpha!==undefined) p.alpha = p.life/60;
        if (p.life<=0) arr.splice(i,1);
    }
}

function updateAllParticles(deltaTime = 1.0) {
    updateParticles(smoke, deltaTime);
    updateParticles(tyreMarks, deltaTime);
    updateParticles(sparks, deltaTime);
    updateParticles(flames, deltaTime);
}

function drawSmoke() {
    ctx.save(); 
    ctx.translate(worldOffsetX, worldOffsetY);
    smoke.forEach(p=> {
        ctx.fillStyle = `rgba(200,200,200,${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fill();
    });
    ctx.restore();
}

function drawTyreMarks() {
    ctx.save(); 
    ctx.translate(worldOffsetX, worldOffsetY);
    tyreMarks.forEach(t=> {
        ctx.strokeStyle = `rgba(50,50,50,${t.life/200})`;
        ctx.lineWidth =2;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x+1, t.y+1);
        ctx.stroke();
    });
    ctx.restore();
}

function drawSparks() {
    ctx.save(); 
    ctx.translate(worldOffsetX, worldOffsetY);
    sparks.forEach(s=> {
        ctx.fillStyle = `rgba(255,${200+Math.random()*55|0},0,${s.life/30})`;
        ctx.fillRect(s.x, s.y,2,2);
    });
    ctx.restore();
}

function drawFlames() {
    ctx.save(); 
    ctx.translate(worldOffsetX, worldOffsetY);
    flames.forEach(f => {
        const a = f.life / f.max;
        const size = Math.floor(5 * a) + 1;
        
        // Pixel art flame colors - cycle through retro palette
        const colors = ['#ff4444', '#ff8800', '#ffff00', '#ff6600'];
        const colorIndex = Math.floor((f.max - f.life) / 5) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        
        // Draw pixelated flame burst
        const pixelSize = 2;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // Create jagged flame pattern
                if (Math.random() > 0.3) {
                    const offsetX = (i - size/2) * pixelSize;
                    const offsetY = (j - size/2) * pixelSize;
                    ctx.fillRect(f.x + offsetX, f.y + offsetY, pixelSize, pixelSize);
                }
            }
        }
        
        // Add bright center core
        if (a > 0.5) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(f.x - 1, f.y - 1, 2, 2);
        }
        
        // Add outer sparks for big explosions
        if (size > 3) {
            ctx.fillStyle = '#ffaa00';
            const sparkPositions = [
                {x: f.x - size * 2, y: f.y},
                {x: f.x + size * 2, y: f.y},
                {x: f.x, y: f.y - size * 2},
                {x: f.x, y: f.y + size * 2}
            ];
            sparkPositions.forEach(spark => {
                if (Math.random() > 0.5) {
                    ctx.fillRect(spark.x, spark.y, 1, 1);
                }
            });
        }
    });
    ctx.restore();
} 