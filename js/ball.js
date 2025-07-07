/* ================================
 *  Ball Class and Physics
 * ================================*/

class Ball {
    constructor(x, y, r = 8) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = 0;
        this.vy = 0;
    }

    update(deltaTime = 1.0) {
        // Use base canvas dimensions instead of DPR-scaled dimensions
        const baseWidth = 960;
        const baseHeight = 600;
        
        // Apply friction
        this.vx *= Math.pow(0.98, deltaTime);
        this.vy *= Math.pow(0.98, deltaTime);

        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Check goal post collisions
        this.handleGoalPostCollisions();

        // Bounce off field boundaries, allowing for goals
        const goalH = 120;
        const goalTop = (baseHeight - goalH) / 2;
        const goalBottom = goalTop + goalH;
        const inGoalMouthY = this.y > goalTop && this.y < goalBottom;

        if (this.x - this.r < 20 && !inGoalMouthY) { this.x = 20 + this.r; this.vx *= -0.6; }
        if (this.x + this.r > baseWidth - 20 && !inGoalMouthY) { this.x = baseWidth - 20 - this.r; this.vx *= -0.6; }
        if (this.y - this.r < 20) { this.y = 20 + this.r; this.vy *= -0.6; }
        if (this.y + this.r > baseHeight - 20) { this.y = baseHeight - 20 - this.r; this.vy *= -0.6; }
    }

    handleGoalPostCollisions() {
        // Use base canvas dimensions
        const baseWidth = 960;
        const baseHeight = 600;
        
        const goalH = 120;
        const goalTop = (baseHeight - goalH) / 2;
        const goalBottom = goalTop + goalH;
        const postRadius = 8;

        // Left goal posts
        const leftTopPost = { x: 20, y: goalTop };
        const leftBottomPost = { x: 20, y: goalBottom };
        
        // Right goal posts
        const rightTopPost = { x: baseWidth - 20, y: goalTop };
        const rightBottomPost = { x: baseWidth - 20, y: goalBottom };

        const posts = [leftTopPost, leftBottomPost, rightTopPost, rightBottomPost];

        posts.forEach(post => {
            const dx = this.x - post.x;
            const dy = this.y - post.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.r + postRadius) {
                // Calculate collision normal
                const nx = dx / distance;
                const ny = dy / distance;

                // Move ball outside post
                this.x = post.x + nx * (this.r + postRadius);
                this.y = post.y + ny * (this.r + postRadius);

                // Reflect velocity
                const dot = this.vx * nx + this.vy * ny;
                this.vx -= 2 * dot * nx;
                this.vy -= 2 * dot * ny;

                // Add some damping
                this.vx *= 0.7;
                this.vy *= 0.7;
            }
        });
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + worldOffsetX, this.y + worldOffsetY);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}

// Goal detection and celebration
function startCelebration(goalSide) {
    const gameStore = window.GameStore;
    
    if (gameStore) {
        gameStore.set('celebrating', true);
        gameStore.set('celebrateTimer', 0);
        
        // Update scores using GameStore
        if (goalSide === "left") {
            gameStore.incrementScore(2); // Player 2 scored
        } else {
            gameStore.incrementScore(1); // Player 1 scored
        }
    } else {
        // Fallback to global variables
        celebrating = true;
        celebrateTimer = 0;
        if(goalSide === "left") scoreP2 += 1; else scoreP1 += 1;
    }
    
    // Update UI
    if (window.MatchController) {
        window.MatchController.updateUI();
    } else if (window.updateUI) {
        window.updateUI();
    }

    // Check win conditions after scoring
    setTimeout(() => {
        checkWinConditions();
    }, CELEBRATION_MS + 100); // Check after celebration ends

    // Hide the ball immediately
    ball.x = -100;
    ball.y = -100;
    ball.vx = ball.vy = 0;

    // Determine losing and winning cars
    explodedCar = goalSide === "left" ? player : player2;
    celebrationDriver = explodedCar === player ? player2 : player; // winner keeps control

    createCarExplosion(explodedCar.x, explodedCar.y, explodedCar.color);
    createScorchMark(explodedCar.x, explodedCar.y);

    // Banter lines (only when NPC active)
    if(npcMode){
        if(goalSide==='left') npcSay(npcScoredLines); else npcSay(playerScoredLines);
    }
}

function detectGoal() {
    // Use base canvas dimensions instead of DPR-scaled dimensions
    const baseWidth = 960;
    const baseHeight = 600;
    
    const goalH = 120;
    const goalTop = (baseHeight - goalH) / 2;
    const goalBottom = goalTop + goalH;
    const penetration = ball.r / 2; // must cross this much past goal line

    if (celebrating) return;

    // Left goal scored when ball center is sufficiently past the goal line
    if (ball.x <= 20 - penetration && ball.y >= goalTop && ball.y <= goalBottom) {
        startCelebration("left");
    }
    // Right goal scored
    if (ball.x >= baseWidth - 20 + penetration && ball.y >= goalTop && ball.y <= goalBottom) {
        startCelebration("right");
    }
} 