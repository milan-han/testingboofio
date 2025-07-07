/* ================================
 *  Game State Management
 * ================================*/

// Game state variables are now managed by globals.js

// Timing variables for normalized game speed
let lastFrameTime = 0;
let deltaTime = 0;
const TARGET_FPS = 60; // Target 60 FPS for consistent gameplay
const FRAME_TIME_MS = 1000 / TARGET_FPS; // ~16.67ms per frame at 60fps

// Main Game Loop
function gameLoop(currentTime = 0) {
    // Calculate delta time for consistent physics across different framerates
    if (lastFrameTime === 0) {
        lastFrameTime = currentTime;
    }
    
    const rawDeltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    // Normalize delta time to target framerate (60fps = 16.67ms per frame)
    // This ensures the game runs at the same speed regardless of actual framerate
    deltaTime = rawDeltaTime / FRAME_TIME_MS;
    
    // Cap delta time to prevent huge jumps when tab is inactive/resumed
    deltaTime = Math.min(deltaTime, 3.0);
    
    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    
    if (gameState === "setup") {
        // Practice playground logic
        player.update(deltaTime);
        
        // Update Player 2 in local mode
        if (currentMode === 'npc') {
            if (player2IsNPC) {
                player2.update(deltaTime);
            } else {
                player2.update(deltaTime);
            }
            handleCarBallCollision(player2);
            handleCarCarCollisions();
        }
        
        ball.update(deltaTime);
        handleCarBallCollision(player);
        updatePracticeCamera();
        updateAllParticles(deltaTime);

        // Draw scene
        player.draw();
        
        if (currentMode === 'npc') {
            player2.draw();
        }
        
        ball.draw();
        drawFlames();
        drawTyreMarks();
        drawSparks();

    } else if (gameState === "countdown") {
        // Draw starting positions during countdown
        player.draw();
        player2.draw();
    } else if (gameState === "playing") {
        // Check if game is paused
        if (gamePaused) {
            // Draw everything but don't update physics
            drawTyreMarks();
            drawScorchMarks();
            players.forEach(car => {
                if (car !== explodedCar) {
                    car.draw();
                }
            });
            drawFlames();
            drawCarExplosions();
            if (!celebrating) {
                ball.draw();
            }
            
            drawPlayerCard();
            if (currentMode === 'npc') {
                drawPlayer2Card();
            }
            
            requestAnimationFrame(gameLoop);
            return;
        }
        
        // Check for time-based win conditions in local mode
        if (gameType === 'timed' && currentMode === 'npc' && !gameEnded && gameStartTime) {
            const timeElapsed = (Date.now() - gameStartTime) / 1000;
            if (timeElapsed >= matchTimeMinutes * 60) {
                checkWinConditions();
            }
        }
        
        // Normal gameplay
        ball.update(deltaTime);

        if (!celebrating) {
            // Normal gameplay for all cars
            const hits = [];
            player.update(deltaTime);
            if (handleCarBallCollision(player)) hits.push(player);
            if (npcMode) {
                npcUpdate(player2, ball, deltaTime);
            } else {
                player2.update(deltaTime);
            }
            if (handleCarBallCollision(player2)) hits.push(player2);

            // Simultaneous hit knock-back
            if (hits.length > 1) {
                ball.vx *= 0.1;
                ball.vy *= 0.1;

                hits.forEach(car => {
                    const dx = car.x - ball.x;
                    const dy = car.y - ball.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const KNOCKBACK = 8;
                    car.vx += nx * KNOCKBACK;
                    car.vy += ny * KNOCKBACK;
                });
            }
            handleCarCarCollisions();
            detectGoal();
            updateCarExplosions(deltaTime);
            updateAllParticles(deltaTime);
        } else {
            // Celebration physics - use actual elapsed time instead of assuming 16ms frames
            celebrateTimer += rawDeltaTime; // Use actual time elapsed, not assumed frame time
                
            if (celebrateTimer >= SLOWMO_START_MS) {
                const slowmoProgress = (celebrateTimer - SLOWMO_START_MS) / (CELEBRATION_MS - SLOWMO_START_MS);
                const easedProgress = slowmoProgress * slowmoProgress * (3.0 - 2.0 * slowmoProgress);
                gameSpeed = 1.0 - (easedProgress * 0.6);
                gameSpeed = Math.max(gameSpeed, 0.4);
            } else {
                gameSpeed = 1.0;
            }
            
            const winningCar = explodedCar === player ? player2 : player;
            
            const originalAccel = winningCar.acceleration;
            const originalTurnSpeed = winningCar.turnSpeed;
            winningCar.acceleration *= gameSpeed;
            winningCar.turnSpeed *= gameSpeed;
            
            winningCar.update(deltaTime);
            
            winningCar.acceleration = originalAccel;
            winningCar.turnSpeed = originalTurnSpeed;
            
            winningCar.vx *= gameSpeed;
            winningCar.vy *= gameSpeed;

            updateCarExplosions(deltaTime);
            updateAllParticles(deltaTime);

            if (celebrateTimer >= CELEBRATION_MS) {
                celebrating = false;
                celebrationDriver = null;
                gameSpeed = 1.0;
                carExplosions = [];
                scorchMarks = [];
                explodedCar = null;
                resetBall();
                
                // Use base canvas dimensions instead of DPR-scaled dimensions
                const baseWidth = 960;
                const baseHeight = 600;
                
                // Reset both cars to their side positions
                player.x = 100;
                player.y = baseHeight / 2;
                player.vx = player.vy = 0;
                player.heading = 0;

                player2.x = baseWidth - 100;
                player2.y = baseHeight / 2;
                player2.vx = player2.vy = 0;
                player2.heading = Math.PI;
            }
        }
            
        updateUI();
        
        drawTyreMarks();
        drawScorchMarks();
        players.forEach(car => {
            if (car !== explodedCar) {
                car.draw();
            }
        });
        drawFlames();
        drawCarExplosions();
        if (!celebrating) {
            ball.draw();
        }
    }

    drawPlayerCard();

    if (currentMode === 'npc') {
        drawPlayer2Card();
    }

    requestAnimationFrame(gameLoop);
}

// Initialize game objects now that all classes are loaded
initializeGameObjects();

// Start the game loop
gameLoop(); 