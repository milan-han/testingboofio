/* ================================
 *  Collision Detection Systems
 * ================================*/

function handleCarBallCollision(car) {
    const dx = ball.x - car.x;
    const dy = ball.y - car.y;
    const dist = Math.hypot(dx, dy);
    const minDist = ball.r + Math.max(car.w, car.h) / 2;
    if (dist < minDist) {
        const overlap = minDist - dist + 0.1;
        const nx = dx / dist;
        const ny = dy / dist;
        // Push ball out of collision
        ball.x += nx * overlap;
        ball.y += ny * overlap;
        // Apply impulse based on car velocity
        ball.vx += car.vx * 0.5 + nx * 2;
        ball.vy += car.vy * 0.5 + ny * 2;
        return true;
    }
    return false;
}

function handleCarCarCollisions() {
    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            const a = players[i];
            const b = players[j];
            // Skip if either car is currently destroyed
            if (a.isDestroyed || b.isDestroyed) continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy);
            const ra = Math.max(a.w, a.h) / 2;
            const rb = Math.max(b.w, b.h) / 2;
            const minDist = ra + rb;
            if (dist < minDist && dist !== 0) {
                const nx = dx / dist;
                const ny = dy / dist;
                const overlap = minDist - dist;

                // Separate cars
                a.x -= nx * overlap / 2;
                a.y -= ny * overlap / 2;
                b.x += nx * overlap / 2;
                b.y += ny * overlap / 2;

                // Simple elastic impulse
                const relVx = a.vx - b.vx;
                const relVy = a.vy - b.vy;
                const relDot = relVx * nx + relVy * ny;
                if (relDot < 0) {
                    const restitution = 0.2; // much softer bounce
                    const impulse = -(1 + restitution) * relDot / 2;
                    a.vx += nx * impulse;
                    a.vy += ny * impulse;
                    b.vx -= nx * impulse;
                    b.vy -= ny * impulse;

                    // Extra damping so cars don't keep shoving
                    const DAMP = 0.6;
                    a.vx *= DAMP;
                    a.vy *= DAMP;
                    b.vx *= DAMP;
                    b.vy *= DAMP;
                }

                // --- Boost demolition check ---
                if (!celebrating) {
                    const SPEED_THRESHOLD = 2;
                    if (a.boostTimer > 0 && Math.hypot(a.vx, a.vy) > SPEED_THRESHOLD) {
                        causeCarExplosion(b);
                    } else if (b.boostTimer > 0 && Math.hypot(b.vx, b.vy) > SPEED_THRESHOLD) {
                        causeCarExplosion(a);
                    }
                }
            }
        }
    }
} 