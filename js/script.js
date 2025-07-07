
        
        /* ================================
        This file has been refactored into multiple modular files:
 * - js/game-state.js - Core game state management and main game loop
 * - js/input.js - Input handling system  
 * - js/car.js - Car class and related functionality
 * - js/ball.js - Ball class and goal detection
 * - js/collisions.js - Collision detection systems
 * - js/particles.js - Particle systems
 * - js/explosions.js - Car explosion and scorch mark systems
 * - js/field.js - Field rendering
 * 
 * The functionality now runs from these modular files instead.
 * use this file as a reference for working in new modular files if needed. It represents old code, and changes might be newer than this file.
 */


        /*

        // ----- Canvas Setup -----
        const canvas = document.getElementById("game");
        const ctx = canvas.getContext("2d");

        // Scale the canvas up using CSS for a chunky pixel look
        const PIXEL_SCALE = 1.2;
        canvas.style.width = canvas.width * PIXEL_SCALE + "px";
        canvas.style.height = canvas.height * PIXEL_SCALE + "px";

        // ----- Game State -----
        let gameState = "setup"; // "setup", "countdown", "playing", "goal"
        let lapStartTime = Date.now();

        // Soccer game state
        let scoreP1 = 0;
        let scoreP2 = 0;
        // Celebration state
        let celebrating = false;
        let celebrateTimer = 0;
        const CELEBRATION_MS = 1500; // shorter celebration duration
        const SLOWMO_START_MS = 900; // begin slow-mo late into celebration
        let gameSpeed = 1.0; // Normal speed multiplier

        // Car explosion system
        let carExplosions = [];
        let scorchMarks = [];
        let explodedCar = null; // Track which car exploded
        let celebrationDriver = null; // car that can move during celebration
        let gamePaused = false; // Track pause state
        let countdownInterval = null; // Track countdown interval for cancellation

        // ----- Input Handling -----
        const keys = {};
        const chatInputElement = document.getElementById('chatInput');
        function chatActive(){ return chatInputElement && chatInputElement.style.display !== 'none' && document.activeElement === chatInputElement; }
        function clearKeys(){ Object.keys(keys).forEach(k=>keys[k]=false); }
        window.addEventListener("keydown", (e) => {
            if(chatActive()) return; // don't capture controls while typing
            keys[e.code] = true;
            if (e.code === "Escape") {
                if (gameState === "playing") {
                    togglePause(); // Toggle pause when ESC is pressed during gameplay
                } else if (gameState === "setup") {
                    returnToTitle(); // Return to title from setup
                }
            }
        });
        window.addEventListener("keyup", (e) => {
            if(chatActive()) return;
            keys[e.code] = false;
        });

        // ----- UI Functions -----
        function startGame() {
            // Already in setup, this function might not be needed anymore
            gameState = "setup";
            document.getElementById("chatPanel").classList.remove("hidden");
            document.getElementById("multiplayerPanel").classList.remove("hidden");
            document.getElementById("startGameBtn").classList.remove("hidden");
        }

        function initiateCountdown() {
            // Reset any camera/world offset accumulated in demo
            worldOffsetX = 0;
            worldOffsetY = 0;

            // Ensure cars align to field coordinates after offset reset
            player.x += worldOffsetX; // effectively unchanged but clarity
            player.y += worldOffsetY;
            player2.x += worldOffsetX;
            player2.y += worldOffsetY;

            gameState = "countdown";
            document.getElementById("multiplayerPanel").classList.add("hidden");
            document.getElementById("startGameBtn").classList.add("hidden");
            
            // Hide the logo when match starts
            document.querySelector(".logo-container").classList.add("hidden");
            
            // Hide player cards and login button when match starts
            document.getElementById("playerCard").classList.add("hidden");
            document.getElementById("player2Card").classList.add("hidden");
            document.querySelector(".login-btn").classList.add("hidden");
            
            // Show game control buttons
            document.getElementById("backBtn").classList.remove("hidden");
            document.getElementById("pauseBtn").classList.remove("hidden");
            
            // Compress chat when game starts
            const chatPanelEl = document.getElementById("chatPanel");
            chatPanelEl.classList.add("compressed");
            // add field offset for game area
            document.body.classList.add('field-offset');
            // Shrink retro video player to match chat width
            const retroPlayerEl = document.querySelector('.retro-player');
            if (retroPlayerEl) retroPlayerEl.classList.add('compressed');
            
            // Position cars at starting locations for kickoff
            player.x = 100;
            player.y = canvas.height / 2;
            player.vx = player.vy = 0;
            player.heading = 0;
            
            player2.x = canvas.width - 100;
            player2.y = canvas.height / 2;
            player2.vx = player2.vy = 0;
            player2.heading = Math.PI;
            
            // Place ball at center (hidden until play but ensures visible once playing)
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.vx = ball.vy = 0;
            
            // Start zoom animation
            const canvasEl = document.getElementById("game");
            canvasEl.classList.add("zooming");
            
            // Wait for zoom animation to complete, then start countdown
            setTimeout(() => {
                const countdownOverlay = document.getElementById("countdownOverlay");
                const countdownNumber = document.getElementById("countdownNumber");
                
                countdownOverlay.classList.remove("hidden");
                
                let count = 3;
                countdownNumber.textContent = count;
                countdownNumber.style.animation = "countdownPulse 1s ease-in-out";
                
                countdownInterval = setInterval(() => {
                    count--;
                    if (count > 0) {
                        countdownNumber.textContent = count;
                        countdownNumber.style.animation = "none";
                        setTimeout(() => {
                            countdownNumber.style.animation = "countdownPulse 1s ease-in-out";
                        }, 10);
                    } else {
                        countdownNumber.textContent = "GO!";
                        countdownNumber.style.animation = "none";
                        setTimeout(() => {
                            countdownNumber.style.animation = "countdownPulse 1s ease-in-out";
                        }, 10);
                        
                        setTimeout(() => {
                            countdownOverlay.classList.add("hidden");
                            // Show scoreboard with drop-in animation
                            document.getElementById("scoreBoard").classList.add("visible");
                            // Show pause button with scoreboard
                            document.getElementById("pauseBtn").classList.add("visible");
                            // Initialize timer display for timed mode
                            if (gameType === 'timed') {
                                updateTimerDisplay();
                            }
                            actuallyStartGame();
                        }, 1000);
                        
                        clearInterval(countdownInterval);
                        countdownInterval = null;
                    }
                }, 1000);
            }, 300); // Wait for zoom animation to complete

            // hide chat panel if starting local PvP match
            if(currentMode==='npc' && !npcMode){
                document.getElementById('chatPanel').classList.add('hidden');
            }

            if(currentMode==='npc' && npcMode){ // NPC active – give snark pre-game
                npcSay(preGameLines);
            }
        }

        function actuallyStartGame() {
            if (gameState !== "countdown") return;
            gameState = "playing";
            
            // Initialize game timer for timed mode
            if (gameType === 'timed' && currentMode === 'npc') {
                gameStartTime = Date.now();
                gameEnded = false;
                // Initialize timer display
                updateTimerDisplay();
            }
            
            // Set up for NPC play if in local mode with NPC
            if (currentMode === 'npc' && player2IsNPC) {
                npcMode = true;
                npcLevel = cardNpcLevel;
                
                // Welcome banter
                setTimeout(() => {
                    npcSay(preGameLines);
                }, 1000);
            }

            // Reset car positions
            player.x = 100;
            player.y = canvas.height / 2;
            player.vx = player.vy = 0;
            player.heading = 0;

            player2.x = canvas.width - 100;
            player2.y = canvas.height / 2;
            player2.vx = player2.vy = 0;
            player2.heading = Math.PI;

            resetBall();

            // Enable game controls
            const canvas = document.getElementById("game");
            canvas.classList.add("game-active");
            lapStartTime = Date.now();

            // Show scoreboard and other UI elements
            document.getElementById('scoreBoard').classList.add('visible');
            document.getElementById('pauseBtn').classList.add('visible');
            document.getElementById('backBtn').classList.add('visible');
            document.body.classList.add('field-offset');
        }

        function returnToTitle() {
            gameState = "setup";
            celebrating = false;
            gameSpeed = 1.0;
            carExplosions = [];
            scorchMarks = [];
            explodedCar = null;
            celebrationDriver = null;
            gamePaused = false;
            
            // Hide any active overlays
            document.getElementById('pauseOverlay').classList.add('hidden');
            document.getElementById('gameEndOverlay').classList.add('hidden');
            
            // Hide countdown overlay if visible
            document.getElementById('countdownOverlay').classList.add('hidden');
            
            // Stop countdown if in progress
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            
            // Reset scores and timer
            scoreP1 = 0;
            scoreP2 = 0;
            gameTimer = 0;
            gameStartTime = 0;
            gameEnded = false;
            
            // Hide scoreboard and timer
            document.getElementById('scoreBoard').classList.remove('visible');
            const timerRow = document.getElementById('timerRow');
            if (timerRow) timerRow.style.display = 'none';
            
            // Show UI elements
            document.getElementById("multiplayerPanel").classList.remove("hidden");
            document.getElementById("startGameBtn").classList.remove("hidden");
            
            // Show the logo
            document.querySelector(".logo-container").classList.remove("hidden");
            
            // Show player cards and login button
            document.getElementById("playerCard").classList.remove("hidden");
            document.getElementById("player2Card").classList.remove("hidden");
            document.querySelector(".login-btn").classList.remove("hidden");
            
            // Hide game control buttons
            document.getElementById("backBtn").classList.add("hidden");
            const pauseBtnEl = document.getElementById("pauseBtn");
            pauseBtnEl.classList.remove("visible");
            pauseBtnEl.classList.add("hidden");
            pauseBtnEl.textContent = "⏸";
            pauseBtnEl.classList.remove("paused");
            
            // Expand chat and remove field offset
            const chatPanelEl = document.getElementById("chatPanel");
            chatPanelEl.classList.remove("compressed");
            chatPanelEl.classList.remove("hidden");
            
            // Remove field offset
            document.body.classList.remove('field-offset');
            
            // Expand retro video player
            const retroPlayerEl = document.querySelector('.retro-player');
            if (retroPlayerEl) retroPlayerEl.classList.remove('compressed');
            
            // Remove zoom effect
            const canvasEl = document.getElementById("game");
            canvasEl.classList.remove("zooming");
            
            // Reset ball position
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.vx = ball.vy = 0;
            
            // Reset car positions to starting positions
            player.x = canvas.width / 2 - 100;
            player.y = canvas.height / 2;
            player.vx = player.vy = 0;
            player.heading = 0;
            
            player2.x = canvas.width / 2 + 100;
            player2.y = canvas.height / 2;
            player2.vx = player2.vy = 0;
            player2.heading = Math.PI;
            
            updateUI();
        }

        function togglePause() {
            if (gameState !== "playing") return; // Only allow pause during gameplay
            
            gamePaused = !gamePaused;
            const pauseBtn = document.getElementById("pauseBtn");
            const pauseOverlay = document.getElementById("pauseOverlay");
            
            if (gamePaused) {
                pauseBtn.textContent = "▶";
                pauseBtn.classList.add("paused");
                pauseOverlay.classList.remove("hidden");
            } else {
                pauseBtn.textContent = "⏸";
                pauseBtn.classList.remove("paused");
                pauseOverlay.classList.add("hidden");
            }
        }

        function resumeGame() {
            if (!gamePaused) return;
            
            gamePaused = false;
            const pauseBtn = document.getElementById("pauseBtn");
            const pauseOverlay = document.getElementById("pauseOverlay");
            
            pauseBtn.textContent = "⏸";
            pauseBtn.classList.remove("paused");
            pauseOverlay.classList.add("hidden");
        }

        function restartMatch() {
            if (gameState !== "playing" && gameState !== "gameEnd") return;
            
            // Hide pause overlay
            document.getElementById('pauseOverlay').classList.add('hidden');
            document.getElementById('gameEndOverlay').classList.add('hidden');
            
            // Reset game variables
            gamePaused = false;
            gameEnded = false;
            celebrating = false;
            celebrationDriver = null;
            gameSpeed = 1.0;
            carExplosions = [];
            scorchMarks = [];
            explodedCar = null;
            
            // Reset pause button state
            document.getElementById("pauseBtn").textContent = "⏸";
            document.getElementById("pauseBtn").classList.remove("paused");
            
            // Reset scores and timer
            scoreP1 = 0;
            scoreP2 = 0;
            gameTimer = 0;
            gameStartTime = 0;
            gameTimeElapsed = 0;
            updateUI();
            
            // Restart the game
            initiateCountdown();
        }

        let player1Name = "PLAYER 1";
        let player2Name = "PLAYER 2";

        function updateUI() {
            const scoreEl1 = document.getElementById("topP1");
            const scoreEl2 = document.getElementById("topP2");
            scoreEl1.textContent = scoreP1;
            scoreEl2.textContent = scoreP2;

            // Update name labels
            const labelSpans = document.querySelectorAll('.score-row.labels span');
            if (labelSpans.length >= 2) {
                // In timed mode, there will be 3 spans (PLAYER 1, TIME, PLAYER 2)
                if (gameType === 'timed') {
                    labelSpans[0].textContent = player1Name;
                    labelSpans[labelSpans.length - 1].textContent = player2Name;
                } else {
                    // Points mode (2 spans)
                    labelSpans[0].textContent = player1Name;
                    labelSpans[1].textContent = player2Name;
                }
                // Apply colors only to actual player labels, using current car colours
                labelSpans[0].style.color = player1SelectedColor;
                if (gameType === 'timed') {
                    labelSpans[labelSpans.length - 1].style.color = player2SelectedColor;
                } else {
                    labelSpans[1].style.color = player2SelectedColor;
                }
            }

            // Dynamic score colors
            function getScoreColor(val) {
                if (val <= 3) return '#ffffff';
                if (val <= 7) return '#ffff00';
                return '#bb33ff';
            }
            scoreEl1.style.color = getScoreColor(scoreP1);
            scoreEl2.style.color = getScoreColor(scoreP2);

            // Update timer display for timed mode
            updateTimerDisplay();

            // Keep the embedded <input> intact—only update the text node
            const p1Header = document.getElementById('playerCardName');
            if (p1Header && p1Header.childNodes.length) {
                p1Header.childNodes[0].nodeValue = player1Name;
            }
        }

        function updateTimerDisplay() {
            const scoreLabels = document.getElementById('scoreLabels');
            const scoreValues = document.getElementById('scoreValues');
            
            if (gameType === 'timed' && (gameState === 'playing' || gameState === 'countdown')) {
                // Switch to 3-column timed mode layout
                scoreLabels.classList.add('timed-mode');
                scoreValues.classList.add('timed-mode');
                
                // Check if timer elements already exist, if not create them
                let timerLabel = document.getElementById('timerLabel');
                let timerDisplay = document.getElementById('timerDisplay');
                
                if (!timerLabel) {
                    timerLabel = document.createElement('span');
                    timerLabel.id = 'timerLabel';
                    timerLabel.textContent = 'TIME';
                    scoreLabels.insertBefore(timerLabel, scoreLabels.children[1]);
                }
                
                if (!timerDisplay) {
                    timerDisplay = document.createElement('span');
                    timerDisplay.id = 'timerDisplay';
                    timerDisplay.className = 'timer-display';
                    scoreValues.insertBefore(timerDisplay, scoreValues.children[1]);
                }
                
                if (gameState === 'playing' && gameStartTime > 0) {
                    // During gameplay, show countdown
                    const timeElapsed = (Date.now() - gameStartTime) / 1000;
                    const timeRemaining = Math.max(0, (matchTimeMinutes * 60) - timeElapsed);
                    
                    // Format time as MM:SS
                    const minutes = Math.floor(timeRemaining / 60);
                    const seconds = Math.floor(timeRemaining % 60);
                    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    
                    timerDisplay.textContent = formattedTime;
                    
                    // Add visual warnings as time runs out
                    timerDisplay.classList.remove('warning', 'critical');
                    if (timeRemaining <= 30) {
                        timerDisplay.classList.add('critical');
                    } else if (timeRemaining <= 60) {
                        timerDisplay.classList.add('warning');
                    }
                    
                    // Hide timer when time runs out
                    if (timeRemaining <= 0) {
                        timerDisplay.textContent = '0:00';
                    }
                } else {
                    // During countdown, show full match time
                    const minutes = Math.floor(matchTimeMinutes);
                    const seconds = Math.floor((matchTimeMinutes % 1) * 60);
                    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    timerDisplay.textContent = formattedTime;
                    timerDisplay.classList.remove('warning', 'critical');
                }
            } else {
                // Switch back to 2-column points mode layout
                scoreLabels.classList.remove('timed-mode');
                scoreValues.classList.remove('timed-mode');
                
                // Remove timer elements if they exist
                const timerLabel = document.getElementById('timerLabel');
                const timerDisplay = document.getElementById('timerDisplay');
                
                if (timerLabel) {
                    timerLabel.remove();
                }
                if (timerDisplay) {
                    timerDisplay.remove();
                }
            }
        }

        // ----- Enhanced Car with Drifting -----
        class Car {
            constructor(x, y, color, controls) {
                this.x = x;
                this.y = y;
                this.heading = -Math.PI / 2;

                // Physics
                this.vx = 0;
                this.vy = 0;
                this.acceleration = 0.1;  // slower throttle
                this.maxSpeed = 4;        // lower top speed
                this.friction = 0.03;
                this.turnSpeed = 0.05;
                this.currentTurnRate = 0; // track current turning rate for player card
                this.displayRotation = 0; // smooth rotation for player card display
                
                // Drift mechanics
                this.gripLevel = 0.85; // How much car grips vs slides
                this.driftAmount = 0; // Visual drift indicator
                this.handbrake = false;
                this.boostTimer = 0; // frames of temporary speed boost
                // Dimensions for drawing
                this.w = 14; // car width
                this.h = 24; // car length

                this.color = color;
                this.controls = controls;
                // Explosion / respawn state
                this.isDestroyed = false; // true while car is blown up
                this.respawnTimer = 0;     // frames remaining until respawn
            }

            update() {
                // Handle destruction / respawn
                if (this.isDestroyed) {
                    if (this.respawnTimer > 0) {
                        this.respawnTimer--;
                        return; // remain inactive while waiting to respawn
                    }
                    // Respawn at default kickoff position
                    if (this === player) {
                        this.x = 100;
                        this.y = canvas.height / 2;
                        this.heading = 0;
                    } else {
                        this.x = canvas.width - 100;
                        this.y = canvas.height / 2;
                        this.heading = Math.PI;
                    }
                    this.vx = this.vy = 0;
                    this.isDestroyed = false;
                }

                // Allow control except during countdown or if celebrating and not the celebrationDriver
                if (gameState === "countdown" || (celebrating && this !== celebrationDriver)) return;

                // Capture previous handbrake state then update current
                const prevHandbrake = this.handbrake;
                this.handbrake = keys[this.controls.brake];

                // === Convert world velocity to car-local coordinates ===
                const cos = Math.cos(this.heading);
                const sin = Math.sin(this.heading);
                let forward = this.vx * cos + this.vy * sin;      // velocity along heading
                let lateral = -this.vx * sin + this.vy * cos;     // sideways velocity (drift component)

                // === Throttle & Brake ===
                if (keys[this.controls.forward]) forward += this.acceleration;
                if (keys[this.controls.back])    forward -= this.acceleration * 0.8;

                // === Steering ===
                let steerInput = 0;
                if (keys[this.controls.left])  steerInput = -1;
                else if (keys[this.controls.right]) steerInput = 1;

                // Turn rate grows with speed for tighter feel
                let turnRate = steerInput * this.turnSpeed * (Math.abs(forward) / 2 + 0.3);
                if (forward < 0) turnRate = -turnRate; // invert steering when reversing
                
                // Store the current turn rate for player card display
                this.currentTurnRate = turnRate;
                
                // Smooth interpolation for player card display rotation
                const maxRotation = Math.PI / 6; // 30 degrees
                const rotationScale = 50; // scale turn rate to rotation range
                const targetRotation = Math.max(-maxRotation, Math.min(maxRotation, turnRate * rotationScale));
                
                // Smooth interpolation - gradually move toward target rotation
                const lerpSpeed = 0.15; // how fast to interpolate (0.1 = slow, 0.3 = fast)
                this.displayRotation += (targetRotation - this.displayRotation) * lerpSpeed;
                
                this.heading += turnRate;

                // === Handbrake & Drift Physics ===
                const forwardFriction = 0.02;                        // always present
                const sideFriction = this.handbrake ? 0.03 : 0.3;     // VERY grippy unless handbrake pressed

                forward *= (1 - forwardFriction);
                lateral *= (1 - sideFriction);

                // Drift indicator based on lateral slip
                const slip = Math.abs(lateral);
                this.driftAmount = Math.min(slip * 25, 100);

                // --- Drift particle effects ---
                if (this.handbrake && slip > 0.4) {
                    // tyre marks - create one for each rear wheel
                    const wheelOffset = this.w / 2 - 1; // distance from center to each wheel
                    const rearWheelDistance = this.h / 2 - 3; // distance from center to rear axle
                    
                    // Calculate rear wheel positions in world coordinates
                    const leftWheelX = this.x - sin * wheelOffset - cos * rearWheelDistance;
                    const leftWheelY = this.y + cos * wheelOffset - sin * rearWheelDistance;
                    const rightWheelX = this.x + sin * wheelOffset - cos * rearWheelDistance;
                    const rightWheelY = this.y - cos * wheelOffset - sin * rearWheelDistance;
                    
                    // Create tire marks at both rear wheel positions
                    tyreMarks.push({ x: leftWheelX, y: leftWheelY, life: 200 });
                    tyreMarks.push({ x: rightWheelX, y: rightWheelY, life: 200 });
                    
                    // smoke
                    smoke.push({ x: this.x - cos*15, y: this.y - sin*15, vy: -0.5+Math.random()*-0.5, vx:(Math.random()-0.5)*0.5, life:60, alpha:1 });
                    // accumulate drift charge
                    this.driftCharge = (this.driftCharge || 0) + 1;
                    if (this.driftCharge > 60) {
                        // continuous sparks after holding drift > 1s - but only in match mode, not demo
                        if (gameState !== "setup") {
                            for (let s=0; s<2; s++) {
                                sparks.push({ x: this.x - cos*14, y: this.y - sin*14, vx:(Math.random()-0.5)*4, vy:(Math.random()-1.5)*4, life:30 });
                            }
                        }
                    }
                    // flame when boost ready
                    if(this.driftCharge > 60){
                        flames.push({ x: this.x - cos*18, y: this.y - sin*18, vx:-cos*0.2, vy:-sin*0.2, life:20, max:20 });
                    }
                } else {
                    // if we just released after long drift, give boost
                    if (prevHandbrake && !this.handbrake && (this.driftCharge||0) > 60) {
                        forward += 6;            // stronger boost impulse
                        this.boostTimer = 30;     // 30 frames (~0.5s) higher top speed
                        for(let f=0; f<40; f++){
                            flames.push({ x: this.x, y: this.y, vx:(Math.random()-0.5)*3, vy:(Math.random()-0.5)*3, life:25, max:25 });
                        }
                    }
                    this.driftCharge = 0;
                }

                // === Convert back to world velocity ===
                this.vx =  cos * forward - sin * lateral;
                this.vy =  sin * forward + cos * lateral;

                // === Speed cap (allow temporary boost over maxSpeed) ===
                const speed = Math.hypot(this.vx, this.vy);
                const currentMax = this.boostTimer>0 ? this.maxSpeed+2 : this.maxSpeed;
                if (speed > currentMax) {
                    this.vx *= currentMax / speed;
                    this.vy *= currentMax / speed;
                }

                if(this.boostTimer>0) this.boostTimer--; // countdown

                // === Update position ===
                this.x += this.vx;
                this.y += this.vy;

                // Check goal post collisions
                this.handleGoalPostCollisions();

                // Track / canvas bounds
                this.checkTrackBounds();
            }

            checkTrackBounds() {
                if (gameState === "setup") {
                    // Lock cars to field boundaries (inside the white lines) for ALL demo modes
                    const fieldMargin = 20; // margin equal to pitch white border
                    if (this.x < fieldMargin) { this.x = fieldMargin; this.vx = Math.abs(this.vx) * 0.5; }
                    if (this.x > canvas.width - fieldMargin) { this.x = canvas.width - fieldMargin; this.vx = -Math.abs(this.vx) * 0.5; }
                    if (this.y < fieldMargin) { this.y = fieldMargin; this.vy = Math.abs(this.vy) * 0.5; }
                    if (this.y > canvas.height - fieldMargin) { this.y = canvas.height - fieldMargin; this.vy = -Math.abs(this.vy) * 0.5; }

                    return;
                }
                // Simple boundary check - slow down if hitting grass
                if (!this.isOnTrack()) {
                    this.vx *= 0.8;
                    this.vy *= 0.8;
                }
                
                // Keep in canvas bounds
                if (this.x < 20) { this.x = 20; this.vx = Math.abs(this.vx) * 0.5; }
                if (this.x > canvas.width - 20) { this.x = canvas.width - 20; this.vx = -Math.abs(this.vx) * 0.5; }
                if (this.y < 20) { this.y = 20; this.vy = Math.abs(this.vy) * 0.5; }
                if (this.y > canvas.height - 20) { this.y = canvas.height - 20; this.vy = -Math.abs(this.vy) * 0.5; }
            }

            isOnTrack() {
                // Whole canvas is playable field now
                return true;
            }

            draw() {
                if (this.isDestroyed) return; // don't render destroyed cars
                ctx.save();
                ctx.translate(this.x + worldOffsetX, this.y + worldOffsetY);
                ctx.rotate(this.heading);

                // Main car body (same dimensions)
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.h / 2, -this.w / 2, this.h, this.w);
                
                // Racing stripe down the middle
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-this.h / 2, -1, this.h, 2);
                
                // Front nose/bumper
                ctx.fillStyle = getDarkerShade(this.color);
                ctx.fillRect(this.h / 2 - 3, -this.w / 2, 3, this.w);
                
                // Headlights
                ctx.fillStyle = "#ffff99";
                ctx.fillRect(this.h / 2 - 1, -this.w / 2 + 2, 1, 2);
                ctx.fillRect(this.h / 2 - 1, this.w / 2 - 4, 1, 2);
                
                // Windshield (cockpit)
                ctx.fillStyle = "#333";
                ctx.fillRect(-2, -this.w / 2 + 3, 8, this.w - 6);
                
                // Side air intakes
                ctx.fillStyle = "#000";
                ctx.fillRect(-this.h / 4, -this.w / 2, 3, 2);
                ctx.fillRect(-this.h / 4, this.w / 2 - 2, 3, 2);

                // Rear spoiler
                ctx.fillStyle = "#222";
                ctx.fillRect(-this.h / 2 - 2, -this.w / 2 + 2, 2, this.w - 4);
                ctx.fillRect(-this.h / 2 - 3, -this.w / 2 + 4, 1, this.w - 8);
                
                // Wheels (racing tires)
                ctx.fillStyle = "#111";
                // Front wheels
                ctx.fillRect(this.h / 2 - 7, -this.w / 2 - 1, 4, 2);
                ctx.fillRect(this.h / 2 - 7, this.w / 2 - 1, 4, 2);
                // Rear wheels
                ctx.fillRect(-this.h / 2 + 3, -this.w / 2 - 1, 4, 2);
                ctx.fillRect(-this.h / 2 + 3, this.w / 2 - 1, 4, 2);
                
                // Wheel rims
                ctx.fillStyle = "#666";
                ctx.fillRect(this.h / 2 - 6, -this.w / 2, 2, 1);
                ctx.fillRect(this.h / 2 - 6, this.w / 2 - 1, 2, 1);
                ctx.fillRect(-this.h / 2 + 4, -this.w / 2, 2, 1);
                ctx.fillRect(-this.h / 2 + 4, this.w / 2 - 1, 2, 1);

                // Drift effect (enhanced for racing)
                if (this.driftAmount > 30) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                    for (let i = 0; i < 4; i++) {
                        ctx.fillRect(-this.h / 2 - 5 - i * 2, -1, 2, 1);
                    }
                    // Tire smoke
                    ctx.fillStyle = "rgba(200, 200, 200, 0.6)";
                    ctx.fillRect(-this.h / 2 - 8, -2, 3, 4);
                }

                ctx.restore();
            }

            handleGoalPostCollisions() {
                const goalH = 120;
                const goalTop = (canvas.height - goalH) / 2;
                const goalBottom = goalTop + goalH;
                const postRadius = 8;
                const carRadius = Math.max(this.w, this.h) / 2;

                // Left goal posts
                const leftTopPost = { x: 20, y: goalTop };
                const leftBottomPost = { x: 20, y: goalBottom };
                
                // Right goal posts  
                const rightTopPost = { x: canvas.width - 20, y: goalTop };
                const rightBottomPost = { x: canvas.width - 20, y: goalBottom };

                const posts = [leftTopPost, leftBottomPost, rightTopPost, rightBottomPost];

                posts.forEach(post => {
                    const dx = this.x - post.x;
                    const dy = this.y - post.y;
                    const dist = Math.hypot(dx, dy);
                    
                    if (dist < carRadius + postRadius) {
                        // Collision detected - push car out and apply gentle bounce
                        const overlap = (carRadius + postRadius) - dist + 1;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        
                        // Push car out of collision
                        this.x += nx * overlap;
                        this.y += ny * overlap;
                        
                        // Apply gentle bounce (cars don't go flying like ball)
                        this.vx = nx * 2;
                        this.vy = ny * 2;
                    }
                });
            }
        }

        // ----- Soccer Ball -----
        class Ball {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.r = 12;
                this.vx = 0;
                this.vy = 0;
            }

            update() {
                // Apply friction
                this.vx *= 0.98;
                this.vy *= 0.98;

                // Update position
                this.x += this.vx;
                this.y += this.vy;

                // Check goal post collisions
                this.handleGoalPostCollisions();

                // Bounce off field boundaries, allowing for goals
                const goalH = 120;
                const goalTop = (canvas.height - goalH) / 2;
                const goalBottom = goalTop + goalH;
                const inGoalMouthY = this.y > goalTop && this.y < goalBottom;

                if (this.x - this.r < 20 && !inGoalMouthY) { this.x = 20 + this.r; this.vx *= -0.6; }
                if (this.x + this.r > canvas.width - 20 && !inGoalMouthY) { this.x = canvas.width - 20 - this.r; this.vx *= -0.6; }
                if (this.y - this.r < 20) { this.y = 20 + this.r; this.vy *= -0.6; }
                if (this.y + this.r > canvas.height - 20) { this.y = canvas.height - 20 - this.r; this.vy *= -0.6; }
            }

            handleGoalPostCollisions() {
                const goalH = 120;
                const goalTop = (canvas.height - goalH) / 2;
                const goalBottom = goalTop + goalH;
                const postRadius = 8;
                const bounceForce = 1.5; // Strong bounce for ball

                // Left goal posts
                const leftTopPost = { x: 20, y: goalTop };
                const leftBottomPost = { x: 20, y: goalBottom };
                
                // Right goal posts  
                const rightTopPost = { x: canvas.width - 20, y: goalTop };
                const rightBottomPost = { x: canvas.width - 20, y: goalBottom };

                const posts = [leftTopPost, leftBottomPost, rightTopPost, rightBottomPost];

                posts.forEach(post => {
                    const dx = this.x - post.x;
                    const dy = this.y - post.y;
                    const dist = Math.hypot(dx, dy);
                    
                    if (dist < this.r + postRadius) {
                        // Collision detected - push ball out and apply strong bounce
                        const overlap = (this.r + postRadius) - dist + 1;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        
                        // Push ball out of collision
                        this.x += nx * overlap;
                        this.y += ny * overlap;
                        
                        // Apply strong bounce force
                        const speed = Math.hypot(this.vx, this.vy);
                        this.vx = nx * Math.max(speed * bounceForce, 8);
                        this.vy = ny * Math.max(speed * bounceForce, 8);
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

        // ----- Field Drawing -----
        function drawField() {
            // --- Background ---
            if (gameState === "setup") {
                // Asphalt city roads background
                ctx.fillStyle = "#404040";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = "#2d5a2d"; // full grass in match
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Translate pitch elements with world offset in setup
            ctx.save();
            if (gameState === "setup") {
                ctx.translate(worldOffsetX, worldOffsetY);
            }

            // Draw grass rectangle for pitch only (within white border)
            ctx.fillStyle = "#2d5a2d";
            ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

            // --- Existing white pitch lines (unchanged code below) ---
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 20);
            ctx.lineTo(canvas.width / 2, canvas.height - 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
            ctx.stroke();
            const goalH = 120;
            const goalTop = (canvas.height - goalH) / 2;
            const goalBottom = goalTop + goalH;
            const penaltyBoxW = 120;
            const penaltyBoxH = 200;
            const penaltyBoxTop = (canvas.height - penaltyBoxH) / 2;
            // Left side markings
            ctx.fillStyle = hexToRgba(player.color, 0.5);
            ctx.fillRect(0, goalTop, 20, goalH);
            ctx.strokeRect(20, penaltyBoxTop, penaltyBoxW, penaltyBoxH);
            const goalAreaW = 60;
            const goalAreaH = 120;
            const goalAreaTop = (canvas.height - goalAreaH) / 2;
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
            ctx.fillRect(canvas.width - 20, goalTop, 20, goalH);
            ctx.strokeRect(canvas.width - 20 - penaltyBoxW, penaltyBoxTop, penaltyBoxW, penaltyBoxH);
            ctx.strokeRect(canvas.width - 20 - goalAreaW, goalAreaTop, goalAreaW, goalAreaH);
            ctx.fillStyle = "#888";
            ctx.beginPath();
            ctx.arc(canvas.width - 20, goalTop, 8, Math.PI / 2, 3 * Math.PI / 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(canvas.width - 20, goalBottom, 8, Math.PI / 2, 3 * Math.PI / 2);
            ctx.fill();

            // Center spot
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // --- CRT scan-line overlay (drawn last so it covers entire scene) ---
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
                ctx.fillRect(0, y, canvas.width, 2);
            }
        }

        // ----- Initialize Entities -----
        // Control maps
        const player1Controls = { forward:"KeyW", back:"KeyS", left:"KeyA", right:"KeyD", brake:"Space" };
        const player2Controls = { forward:"ArrowUp", back:"ArrowDown", left:"ArrowLeft", right:"ArrowRight", brake:"ShiftRight" };

        // Initialize red car in front of its goal for demo mode
        const player  = new Car(100, canvas.height / 2, "#c62828", player1Controls);
        // Initialize blue car off-screen (hidden in setup mode)
        const player2 = new Car(-100, -100, "#2962ff", player2Controls);

        const players = [player, player2];

        // Initialize ball at field center in setup mode
        let ball = new Ball(canvas.width / 2, canvas.height / 2);

        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.vx = 0;
            ball.vy = 0;
        }

        // Game timer and win condition variables
        let gameTimer = 0;
        let gameStartTime = 0;
        let gameTimeElapsed = 0;
        let gameEnded = false;

        // Enhanced score tracking with win conditions
        function startCelebration(goalSide) {
            celebrating = true;
            celebrateTimer = 0;
            if(goalSide === "left") scoreP2 += 1; else scoreP1 += 1;
            updateUI();

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
            const goalH = 120;
            const goalTop = (canvas.height - goalH) / 2;
            const goalBottom = goalTop + goalH;
            const penetration = ball.r / 2; // must cross this much past goal line

            if (celebrating) return;

            // Left goal scored when ball center is sufficiently past the goal line
            if (ball.x <= 20 - penetration && ball.y >= goalTop && ball.y <= goalBottom) {
                startCelebration("left");
            }
            // Right goal scored
            if (ball.x >= canvas.width - 20 + penetration && ball.y >= goalTop && ball.y <= goalBottom) {
                startCelebration("right");
            }
        }

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

        // Add new function below handleCarBallCollision
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

        // ----- Setup & Game Loop -----
        function gameLoop() {
            // Clear and draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawField();
            
            if (gameState === "setup") {
                // Practice playground logic
                player.update();
                
                // Update Player 2 in local mode
                if (currentMode === 'npc') {
                    if (player2IsNPC) {
                        // NPC remains idle in demo; just basic physics update
                        player2.update();
                    } else {
                        // Human control for Player 2
                        player2.update();
                    }
                    handleCarBallCollision(player2);
                    // Add car-to-car collision physics in demo mode
                    handleCarCarCollisions();
                }
                
                ball.update();
                handleCarBallCollision(player);
                updatePracticeCamera();
                updateAllParticles();

                // Draw scene (no obstacles)
                player.draw();
                
                // Draw Player 2 in local mode
                if (currentMode === 'npc') {
                    player2.draw();
                }
                
                ball.draw();
                drawFlames();
                drawTyreMarks();
                drawSparks();

            } else if (gameState === "countdown") {
                // Draw starting positions during countdown (no physics)
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
            ball.update();

            if (!celebrating) {
                // Normal gameplay for all cars
                const hits = [];
                    player.update();
                    if (handleCarBallCollision(player)) hits.push(player);
                    if (npcMode) {
                        npcUpdate(player2, ball);
                    } else {
                        player2.update();
                    }
                    if (handleCarBallCollision(player2)) hits.push(player2);

                    // NEW: simultaneous hit knock-back
                    if (hits.length > 1) {
                        // Stop ball momentum
                        ball.vx *= 0.1;
                        ball.vy *= 0.1;

                        // Powerful knock-back to both cars
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
                updateAllParticles();
            } else {
                // Celebration physics
                celebrateTimer += 16; // approximate ms per frame
                    
                    // Calculate slow-motion effect
                    if (celebrateTimer >= SLOWMO_START_MS) {
                        // Transition to slow motion over 1.5 seconds (half the celebration time)
                        const slowmoProgress = (celebrateTimer - SLOWMO_START_MS) / (CELEBRATION_MS - SLOWMO_START_MS);
                        
                        // Use smooth easing curve (ease-in-out) for gradual transition
                        const easedProgress = slowmoProgress * slowmoProgress * (3.0 - 2.0 * slowmoProgress);
                        
                        gameSpeed = 1.0 - (easedProgress * 0.6); // Slow down to 40% speed gradually
                        gameSpeed = Math.max(gameSpeed, 0.4); // Don't go below 40% speed
                    } else {
                        gameSpeed = 1.0; // Normal speed
                    }
                    
                    // Allow the winning car to drive around and show off (with speed multiplier)
                    const winningCar = explodedCar === player ? player2 : player;
                    
                    // Apply slow-motion to car physics
                    const originalAccel = winningCar.acceleration;
                    const originalTurnSpeed = winningCar.turnSpeed;
                    winningCar.acceleration *= gameSpeed;
                    winningCar.turnSpeed *= gameSpeed;
                    
                    winningCar.update(); // Winner can drive normally
                    
                    // Restore original values
                    winningCar.acceleration = originalAccel;
                    winningCar.turnSpeed = originalTurnSpeed;
                    
                    // Apply slow-motion to car velocity
                    winningCar.vx *= gameSpeed;
                    winningCar.vy *= gameSpeed;
                    
                    // Ball is hidden during celebration - no physics needed

                    updateCarExplosions(); // Update car explosion particles
                updateAllParticles();

                if (celebrateTimer >= CELEBRATION_MS) {
                    celebrating = false;
                    celebrationDriver = null;
                    gameSpeed = 1.0;
                    carExplosions = []; // Clear explosions
                    scorchMarks = []; // Clear scorch marks when field resets
                    explodedCar = null; // Reset exploded car
                    resetBall();
                    // Reset both cars to their side positions
                    player.x = 100;
                    player.y = canvas.height / 2;
                    player.vx = player.vy = 0;
                    player.heading = 0;

                    player2.x = canvas.width - 100;
                    player2.y = canvas.height / 2;
                    player2.vx = player2.vy = 0;
                    player2.heading = Math.PI;
                }
            }
                
            updateUI();
            
            drawTyreMarks();
                drawScorchMarks(); // Draw permanent scorch marks
                // Only draw cars that haven't exploded
                players.forEach(car => {
                    if (car !== explodedCar) {
                        car.draw();
                    }
                });
            drawFlames();
                drawCarExplosions(); // Draw car explosion effects
                // Only draw ball when not celebrating
                if (!celebrating) {
            ball.draw();
                }
            }

            drawPlayerCard();

            // Draw player 2 card in local mode
            if (currentMode === 'npc') {
                drawPlayer2Card();
            }

            requestAnimationFrame(gameLoop);
        }

        // ----- Particle Updates -----
        let smoke = [];
        let tyreMarks = [];
        let sparks = [];
        let flames = [];
        // World/camera offset accumulates the shifts applied in practice mode
        let worldOffsetX = 0;
        let worldOffsetY = 0;

        function updateParticles(arr) {
            for (let i = arr.length-1; i>=0; i--) {
                const p = arr[i];
                const speedMultiplier = celebrating ? gameSpeed : 1.0;
                p.x += (p.vx || 0) * speedMultiplier;
                p.y += (p.vy || 0) * speedMultiplier;
                p.life -= speedMultiplier;
                if (p.alpha!==undefined) p.alpha = p.life/60;
                if (p.life<=0) arr.splice(i,1);
            }
        }

        function drawSmoke() {
            ctx.save(); ctx.translate(worldOffsetX, worldOffsetY);
            smoke.forEach(p=> {
                ctx.fillStyle = `rgba(200,200,200,${p.alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
                ctx.fill();
            });
            ctx.restore();
        }

        function drawTyreMarks() {
            ctx.save(); ctx.translate(worldOffsetX, worldOffsetY);
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
            ctx.save(); ctx.translate(worldOffsetX, worldOffsetY);
            sparks.forEach(s=> {
                ctx.fillStyle = `rgba(255,${200+Math.random()*55|0},0,${s.life/30})`;
                ctx.fillRect(s.x, s.y,2,2);
            });
            ctx.restore();
        }

        function drawFlames() {
            ctx.save(); ctx.translate(worldOffsetX, worldOffsetY);
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

        function updateAllParticles() {
            updateParticles(smoke);
            updateParticles(tyreMarks);
            updateParticles(sparks);
            updateParticles(flames);
        }

        let npcMode = false;
        let npcLevel = 1;

        // Maps level (1-10) to AI parameters
        const aiParams = {
            // level: [aimError, reactionSpeed (throttle), turnSpeedFactor, defensiveAggression]
            1:  [0.6, 0.7, 0.6, 0.2],  // Very clumsy
            2:  [0.5, 0.75, 0.65, 0.3],
            3:  [0.4, 0.8, 0.7, 0.4],
            4:  [0.3, 0.85, 0.75, 0.5],
            5:  [0.2, 0.9, 0.8, 0.6],  // Competent
            6:  [0.15, 0.92, 0.85, 0.65],
            7:  [0.1, 0.94, 0.9, 0.7],
            8:  [0.05, 0.96, 0.95, 0.8],
            9:  [0.02, 0.98, 1.0, 0.9],
            10: [0, 1.0, 1.0, 1.0]    // Perfect
        };

        function setNpcLevel(level) {
            npcLevel = parseInt(level, 10);
        }

        function toggleNPCMode() {
            npcMode = !npcMode;
            const btn = document.getElementById('npcToggleBtn');
            if (btn) btn.textContent = npcMode ? 'NPC: ON' : 'NPC: OFF';
            updateP2NameVisibility();

            // Set player2 label appropriately
            player2Name = npcMode ? 'NPC' : 'PLAYER 2';
            updateUI();
        }

        function updateP2NameVisibility() {
            const row = document.getElementById('p2NameRow');
            if (!row) return;
            row.style.display = npcMode ? 'none' : 'flex';
        }

        // === NEW REALISTIC NPC AI ===
        function npcUpdate(car, ball, customLevel = null) {
            // identical physics to player (ensure any earlier overrides are gone)
            car.maxSpeed = 6;
            car.acceleration = 0.15;

            // Use custom level if provided (for card-based NPC), otherwise use global npcLevel
            const currentLevel = customLevel !== null ? customLevel : npcLevel;

            // Difficulty affects reaction sharpness (lower angleThreshold means snappier)
            const angleThreshold = 0.3 - (currentLevel * 0.02); // 0.28 at level10
            const closeDist      = 50;                      // distance considered "close" to target

            // 1. Decide high-level state
            const ballOnNpcHalf = ball.x > canvas.width / 2;
            const ballNearGoal  = ball.x > canvas.width - 140; // near NPC goal on the right

            let targetX, targetY;

            if (ballNearGoal) {
                // EMERGENCY CLEAR: drive directly at the ball to clear it away
                targetX = ball.x;
                targetY = ball.y;
            } else if (ballOnNpcHalf) {
                // DEFEND: position between ball and goal
                targetX = ball.x + 60; // a bit behind the ball toward center
                targetY = ball.y;
            } else {
                // ATTACK: get behind ball toward player goal (left side)
                const goalX = 20;
                const goalY = canvas.height / 2;
                const vecGX = goalX - ball.x;
                const vecGY = goalY - ball.y;
                const len   = Math.hypot(vecGX, vecGY) || 1;
                const approach = 60;
                targetX = ball.x - (vecGX / len) * approach;
                targetY = ball.y - (vecGY / len) * approach;
            }

            // 2. Steering toward target
            const dx = targetX - car.x;
            const dy = targetY - car.y;
            const dist = Math.hypot(dx, dy);
            const desiredAngle = Math.atan2(dy, dx);
            let angleDiff = desiredAngle - car.heading;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            // Clear previous frame inputs
            Object.values(car.controls).forEach(c => keys[c] = false);

            // Turn toward target
            if (angleDiff > angleThreshold) keys[car.controls.right] = true;
            else if (angleDiff < -angleThreshold) keys[car.controls.left] = true;

            // Throttle / brake
            if (Math.abs(angleDiff) < Math.PI / 3) {
                // mostly facing target
                if (dist > closeDist) keys[car.controls.forward] = true;
                else if (dist < 20) keys[car.controls.brake] = true; // too close, slow down
            } else {
                // need a big turn, maybe slow with handbrake at high diff levels
                if (currentLevel > 6 && dist < 120) keys[car.controls.brake] = true;
            }

            // Apply turn speed scaling with difficulty for responsiveness
            car.turnSpeed = 0.05 * (0.6 + currentLevel * 0.04); // 0.64 .. 1.0
            car.update();
            car.turnSpeed = 0.05; // reset for player frame
        }

        // ----- New UI Functions -----
        let currentMode = 'matchmaking';
        function selectMode(mode) {
            // Update button states
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Hide all mode content
            document.querySelectorAll('.mode-content').forEach(content => content.classList.add('hidden'));
            
            // Show selected mode content
            document.getElementById(mode + 'Mode').classList.remove('hidden');

            currentMode = mode; // remember for later logic

            // Handle local mode layout
            if (mode === 'npc') {
                document.body.classList.add('local-mode');
                // Initialize player 2 card canvas if needed
                initializePlayer2Card();
                
                // Spawn Player 2 car in demo world when switching to local mode
                if (gameState === "setup") {
                    // Position Player 2 car on the field (right side)
                    player2.x = canvas.width - 150;
                    player2.y = canvas.height / 2;
                    player2.vx = 0;
                    player2.vy = 0;
                    player2.heading = Math.PI; // pointing left initially
                    
                    // Reset camera and car position if car is outside field bounds
                    const fieldMargin = 30;
                    const carOutOfBounds = player.x < fieldMargin || player.x > canvas.width - fieldMargin ||
                                         player.y < fieldMargin || player.y > canvas.height - fieldMargin;
                    
                    if (carOutOfBounds) {
                        // Reset camera to center
                        worldOffsetX = 0;
                        worldOffsetY = 0;
                        
                        // Move car to center of field
                        player.x = canvas.width / 2;
                        player.y = canvas.height / 2;
                        player.vx = 0;
                        player.vy = 0;
                        player.heading = -Math.PI / 2; // pointing up
                    }
                }
            } else {
                document.body.classList.remove('local-mode');
                
                // Hide Player 2 car when leaving local mode (move off-screen)
                if (gameState === "setup") {
                    player2.x = -100;
                    player2.y = -100;
                    player2.vx = 0;
                    player2.vy = 0;
                }
            }
        }

        function createRoom() {
            document.getElementById('roomInfo').classList.remove('hidden');
            // Simulate room creation
            addChatMessage('system', 'Room ABC123 created!');
        }

        function joinRoom() {
            const roomCode = document.getElementById('roomCodeInput').value;
            if (roomCode) {
                addChatMessage('system', `Joining room ${roomCode}...`);
            }
        }

        function findMatch() {
            document.getElementById('matchmakingStatus').classList.remove('hidden');
            addChatMessage('system', 'Searching for opponents...');
        }

        function addChatMessage(type, message) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${type}`;
            // Split at first ':' to separate name
            const idx = message.indexOf(':');
            let nameText = message;
            let msgText = '';
            if(idx !== -1){
               nameText = message.slice(0, idx+1);
               msgText  = message.slice(idx+1);
            }
            const nameSpan = document.createElement('span');
            nameSpan.textContent = nameText;
            nameSpan.style.fontWeight = 'bold';
            const contentSpan = document.createElement('span');
            contentSpan.textContent = msgText;
            contentSpan.style.fontWeight = 'normal';

            // Helper to convert hex to rgba with given alpha
            const hexToRgba = (hex, alpha = 0.1) => {
                const cleanHex = hex.replace('#', '');
                const bigint = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c=>c+c).join('') : cleanHex, 16);
                const r = (bigint >> 16) & 255;
                const g = (bigint >> 8) & 255;
                const b = bigint & 255;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };

            // Dynamically apply player-selected colors for name and message display
            if (type === 'self') {
                // Player 1 (self) colors
                const p1Color  = getComputedStyle(document.documentElement).getPropertyValue('--player1-color').trim()  || '#c62828';
                const p1Accent = getComputedStyle(document.documentElement).getPropertyValue('--player1-accent').trim() || '#ff5252';
                nameSpan.style.color    = p1Color;   // Name in primary car colour
                contentSpan.style.color = p1Accent;  // Message body in accent colour
                messageDiv.style.backgroundColor = hexToRgba(p1Color, 0.1);
            } else if (type === 'friend') {
                // Player 2 (friend) colors
                const p2Color  = getComputedStyle(document.documentElement).getPropertyValue('--player2-color').trim()  || '#2962ff';
                const p2Accent = getComputedStyle(document.documentElement).getPropertyValue('--player2-accent').trim() || '#448aff';
                nameSpan.style.color    = p2Color;
                contentSpan.style.color = p2Accent;
                messageDiv.style.backgroundColor = hexToRgba(p2Color, 0.1);
            }
            
            messageDiv.appendChild(nameSpan);
            messageDiv.appendChild(contentSpan);
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Chat functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && (gameState === 'setup' || gameState === 'playing' || gameState==='countdown') && !chatActive()) {
                const chatPrompt = document.querySelector('.chat-prompt');
                chatPrompt.style.display = 'none';
                chatInputElement.value = '';
                chatInputElement.style.display = 'block';
                chatInputElement.focus();
                clearKeys();
                e.preventDefault();
            }
        });

        chatInputElement.addEventListener('keypress', (e)=>{
            if(e.key==='Enter'){
                const msg = e.target.value.trim();
                if(msg){ addChatMessage('self',`${player1Name}: ${msg}`); }
                e.target.value='';
                e.target.style.display='none';
                document.querySelector('.chat-prompt').style.display='block';
                clearKeys();
            }
        });

        chatInputElement.addEventListener('blur', ()=>{
            if(chatInputElement.style.display!=='none'){
                chatInputElement.style.display='none';
                document.querySelector('.chat-prompt').style.display='block';
                clearKeys();
            }
        });

        // Car explosion system
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

        function updateCarExplosions() {
            for (let i = carExplosions.length - 1; i >= 0; i--) {
                const p = carExplosions[i];
                p.vy += 0.2 * gameSpeed; // gravity affected by slow-mo
                p.x += p.vx * gameSpeed; // movement affected by slow-mo
                p.y += p.vy * gameSpeed;
                p.vx *= (0.98 + (1 - 0.98) * gameSpeed); // air resistance affected by slow-mo
                p.life -= gameSpeed; // particle life affected by slow-mo
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

        // --- Practice mode: obstacles, camera, and collisions -----------------
        const obstacles = [];
        function generateObstacles() {
            obstacles.length = 0;
            const NUM_OBSTACLES = 40;
            for (let i = 0; i < NUM_OBSTACLES; i++) {
                const w = 40 + Math.random() * 60;
                const h = 40 + Math.random() * 60;
                const x = (Math.random() - 0.5) * 3000;
                const y = (Math.random() - 0.5) * 3000;
                obstacles.push({ x, y, w, h });
            }
        }
        function drawObstacles() {
            if (gameState !== "setup") return;
            ctx.save();
            ctx.translate(worldOffsetX, worldOffsetY);
            ctx.fillStyle = "#7a7a7a";
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 2;
            obstacles.forEach(o => {
                ctx.fillRect(o.x, o.y, o.w, o.h);
                ctx.strokeRect(o.x, o.y, o.w, o.h);
            });
            ctx.restore();
        }
        function handleObstacleCollisions(obj, radius) {
            if (gameState !== "setup") return;
            obstacles.forEach(ob => {
                const nearestX = Math.max(ob.x, Math.min(obj.x, ob.x + ob.w));
                const nearestY = Math.max(ob.y, Math.min(obj.y, ob.y + ob.h));
                const dx = obj.x - nearestX;
                const dy = obj.y - nearestY;
                const dist = Math.hypot(dx, dy);
                if (dist < radius) {
                    const overlap = radius - dist + 0.1;
                    const nx = dx / (dist || 1);
                    const ny = dy / (dist || 1);
                    obj.x += nx * overlap;
                    obj.y += ny * overlap;
                    if (obj.vx !== undefined) obj.vx = -obj.vx * 0.5;
                    if (obj.vy !== undefined) obj.vy = -obj.vy * 0.5;
                }
            });
        }
        function updatePracticeCamera() {
            // Keep the camera static in demo (setup) mode by resetting any world offset
            // This disables the external camera pan entirely.
            worldOffsetX = 0;
            worldOffsetY = 0;
            // No further processing required.
        }
        // Obstacle system disabled – no concrete blocks in lobby
        obstacles.length = 0;

        // Player Card canvas
        const cardCanvas = document.getElementById('playerCardCanvas');
        const cardCtx = cardCanvas ? cardCanvas.getContext('2d') : null;
        function drawPlayerCard() {
            if(!cardCtx) return;
            
            // Update canvas actual size to match CSS size
            cardCanvas.width = 240;
            cardCanvas.height = 320;
            
            cardCtx.clearRect(0,0,cardCanvas.width,cardCanvas.height);
            
            // Scale up the car for the larger display - make it much bigger
            const scale = 8; // Increased from 5 to 8 for much bigger car
            const carW = player.w * scale; // car width scaled
            const carH = player.h * scale; // car length scaled
            
            cardCtx.save();
            cardCtx.translate(cardCanvas.width/2, cardCanvas.height/2);
            
            // Use the smooth display rotation for realistic turning animation
            // Apply the base rotation (pointing up) plus the smooth turning tilt
            cardCtx.rotate(-Math.PI / 2 + player.displayRotation);
            
            // Main car body (scaled up)
            cardCtx.fillStyle = player.color;
            cardCtx.fillRect(-carH / 2, -carW / 2, carH, carW);
            
            // Racing stripe down the middle
            cardCtx.fillStyle = "#ffffff";
            cardCtx.fillRect(-carH / 2, -scale, carH, 2 * scale);
            
            // Front nose/bumper
            cardCtx.fillStyle = getDarkerShade(player.color);
            cardCtx.fillRect(carH / 2 - 3 * scale, -carW / 2, 3 * scale, carW);
            
            // Headlights
            cardCtx.fillStyle = "#ffff99";
            cardCtx.fillRect(carH / 2 - scale, -carW / 2 + 2 * scale, scale, 2 * scale);
            cardCtx.fillRect(carH / 2 - scale, carW / 2 - 4 * scale, scale, 2 * scale);
            
            // Windshield (cockpit)
            cardCtx.fillStyle = "#333";
            cardCtx.fillRect(-2 * scale, -carW / 2 + 3 * scale, 8 * scale, carW - 6 * scale);
            
            // Side air intakes
            cardCtx.fillStyle = "#000";
            cardCtx.fillRect(-carH / 4, -carW / 2, 3 * scale, 2 * scale);
            cardCtx.fillRect(-carH / 4, carW / 2 - 2 * scale, 3 * scale, 2 * scale);

            // Rear spoiler
            cardCtx.fillStyle = "#222";
            cardCtx.fillRect(-carH / 2 - 2 * scale, -carW / 2 + 2 * scale, 2 * scale, carW - 4 * scale);
            cardCtx.fillRect(-carH / 2 - 3 * scale, -carW / 2 + 4 * scale, scale, carW - 8 * scale);
            
            // Wheels (racing tires)
            cardCtx.fillStyle = "#111";
            // Front wheels
            cardCtx.fillRect(carH / 2 - 7 * scale, -carW / 2 - scale, 4 * scale, 2 * scale);
            cardCtx.fillRect(carH / 2 - 7 * scale, carW / 2 - scale, 4 * scale, 2 * scale);
            // Rear wheels
            cardCtx.fillRect(-carH / 2 + 3 * scale, -carW / 2 - scale, 4 * scale, 2 * scale);
            cardCtx.fillRect(-carH / 2 + 3 * scale, carW / 2 - scale, 4 * scale, 2 * scale);
            
            // Wheel rims
            cardCtx.fillStyle = "#666";
            cardCtx.fillRect(carH / 2 - 6 * scale, -carW / 2, 2 * scale, scale);
            cardCtx.fillRect(carH / 2 - 6 * scale, carW / 2 - scale, 2 * scale, scale);
            cardCtx.fillRect(-carH / 2 + 4 * scale, -carW / 2, 2 * scale, scale);
            cardCtx.fillRect(-carH / 2 + 4 * scale, carW / 2 - scale, 2 * scale, scale);
            
            cardCtx.restore();
        }

        // Player 2 Card canvas
        const card2Canvas = document.getElementById('player2CardCanvas');
        const card2Ctx = card2Canvas ? card2Canvas.getContext('2d') : null;
        
        function initializePlayer2Card() {
            // Initialize the player 2 card canvas if it's not already set up
            if (card2Canvas && !card2Canvas.initialized) {
                card2Canvas.width = 240;
                card2Canvas.height = 320;
                card2Canvas.initialized = true;
            }
        }

        function drawPlayer2Card() {
            if(!card2Ctx) return;
            
            // Update canvas actual size to match CSS size
            card2Canvas.width = 240;
            card2Canvas.height = 320;
            
            card2Ctx.clearRect(0,0,card2Canvas.width,card2Canvas.height);
            
            // Scale up the car for the larger display - make it much bigger
            const scale = 8; // Same scale as player 1
            const carW = player2.w * scale; // car width scaled
            const carH = player2.h * scale; // car length scaled
            
            card2Ctx.save();
            card2Ctx.translate(card2Canvas.width/2, card2Canvas.height/2);
            
            // Use the smooth display rotation for realistic turning animation
            // Apply the base rotation (pointing up) plus the smooth turning tilt
            card2Ctx.rotate(-Math.PI / 2 + player2.displayRotation);
            
            // Main car body (scaled up)
            card2Ctx.fillStyle = player2.color;
            card2Ctx.fillRect(-carH / 2, -carW / 2, carH, carW);
            
            // Racing stripe down the middle
            card2Ctx.fillStyle = "#ffffff";
            card2Ctx.fillRect(-carH / 2, -scale, carH, 2 * scale);
            
            // Front nose/bumper
            card2Ctx.fillStyle = getDarkerShade(player2.color);
            card2Ctx.fillRect(carH / 2 - 3 * scale, -carW / 2, 3 * scale, carW);
            
            // Headlights
            card2Ctx.fillStyle = "#ffff99";
            card2Ctx.fillRect(carH / 2 - scale, -carW / 2 + 2 * scale, scale, 2 * scale);
            card2Ctx.fillRect(carH / 2 - scale, carW / 2 - 4 * scale, scale, 2 * scale);
            
            // Windshield (cockpit)
            card2Ctx.fillStyle = "#333";
            card2Ctx.fillRect(-2 * scale, -carW / 2 + 3 * scale, 8 * scale, carW - 6 * scale);
            
            // Side air intakes
            card2Ctx.fillStyle = "#000";
            card2Ctx.fillRect(-carH / 4, -carW / 2, 3 * scale, 2 * scale);
            card2Ctx.fillRect(-carH / 4, carW / 2 - 2 * scale, 3 * scale, 2 * scale);

            // Rear spoiler
            card2Ctx.fillStyle = "#222";
            card2Ctx.fillRect(-carH / 2 - 2 * scale, -carW / 2 + 2 * scale, 2 * scale, carW - 4 * scale);
            card2Ctx.fillRect(-carH / 2 - 3 * scale, -carW / 2 + 4 * scale, scale, carW - 8 * scale);
            
            // Wheels (racing tires)
            card2Ctx.fillStyle = "#111";
            // Front wheels
            card2Ctx.fillRect(carH / 2 - 7 * scale, -carW / 2 - scale, 4 * scale, 2 * scale);
            card2Ctx.fillRect(carH / 2 - 7 * scale, carW / 2 - scale, 4 * scale, 2 * scale);
            // Rear wheels
            card2Ctx.fillRect(-carH / 2 + 3 * scale, -carW / 2 - scale, 4 * scale, 2 * scale);
            card2Ctx.fillRect(-carH / 2 + 3 * scale, carW / 2 - scale, 4 * scale, 2 * scale);
            
            // Wheel rims
            card2Ctx.fillStyle = "#666";
            card2Ctx.fillRect(carH / 2 - 6 * scale, -carW / 2, 2 * scale, scale);
            card2Ctx.fillRect(carH / 2 - 6 * scale, carW / 2 - scale, 2 * scale, scale);
            card2Ctx.fillRect(-carH / 2 + 4 * scale, -carW / 2, 2 * scale, scale);
            card2Ctx.fillRect(-carH / 2 + 4 * scale, carW / 2 - scale, 2 * scale, scale);
            
            card2Ctx.restore();
        }

        gameLoop();

        // --- Snarky NPC banter ---
        const preGameLines = [
            "Blue machine coming through – hope you brought tissues!",
            "I'll try not to embarrass you... too much.",
            "Stretch those fingers, you're gonna need 'em." ];
        const npcScoredLines = [
            "Goal! Did you blink or are you always that slow?",
            "Too easy – I scored while checking my mirrors.",
            "Another one for the highlight reel!" ];
        const playerScoredLines = [
            "Lucky bounce – enjoy it, it won't happen again.",
            "I slipped! Rematch that shot, rookie.",
            "Okay, warm-up over, time to turn on beast-mode." ];

        function npcSay(arr){ if(!npcMode) return; // only speak when NPC is active
            const line = arr[Math.floor(Math.random()*arr.length)];
            addChatMessage('friend', `NPC: ${line}`);
        }

        // Player card name editing functionality
        function editPlayerName(playerNum) {
            if (playerNum === 2 && player2IsNPC) return;
            const nameElement = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
            const inputElement = document.getElementById(playerNum === 1 ? 'player1NameInput' : 'player2NameInput');
            // show only if not already visible
            if (inputElement.style.display === 'block') {
                // If the input is already visible, just refocus and select its text
                inputElement.focus();
                inputElement.select();
                return;
            }
            // store current text then clear for readability
            const currentText = (playerNum === 1 ? player1Name : player2Name);
            nameElement.dataset.originalText = currentText;
            nameElement.childNodes[0].nodeValue = '';
            inputElement.style.display = 'block';
            inputElement.value = currentText;
            inputElement.focus();
            inputElement.select();
        }

        function savePlayerName(playerNum) {
            const nameElement = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
            const inputElement = document.getElementById(playerNum === 1 ? 'player1NameInput' : 'player2NameInput');
            const newNameRaw = inputElement.value.trim();
            const defaultName = playerNum === 1 ? 'PLAYER 1' : (player2IsNPC ? 'NPC' : 'PLAYER 2');
            const newName = (newNameRaw || defaultName).toUpperCase();
            if (playerNum === 1) {
                player1Name = newName;
            } else if (!player2IsNPC) {
                player2Name = newName;
            }
            nameElement.childNodes[0].nodeValue = newName;
            inputElement.style.display = 'none';
            updateUI();
        }

        function handleNameKeypress(event, playerNum) {
            if (event.key === 'Enter') {
                savePlayerName(playerNum);
            } else if (event.key === 'Escape') {
                const nameElement = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
                const inputElement = document.getElementById(playerNum === 1 ? 'player1NameInput' : 'player2NameInput');
                // restore original text
                const original = nameElement.dataset.originalText || (playerNum === 1 ? player1Name : player2Name);
                nameElement.childNodes[0].nodeValue = original;
                inputElement.style.display = 'none';
            }
        }

        // Player 2 dropdown functionality
        function togglePlayer2Dropdown(event) {
            event.stopPropagation();
            const dropdown = document.getElementById('player2Dropdown');
            dropdown.classList.toggle('show');
            
            // Close dropdown when clicking elsewhere
            if (dropdown.classList.contains('show')) {
                setTimeout(() => {
                    document.addEventListener('click', closeDropdown);
                }, 0);
            }
        }

        function closeDropdown() {
            const dropdown = document.getElementById('player2Dropdown');
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }

        let player2IsNPC = false;
        let cardNpcLevel = 10; // Default difficulty for card NPC

        function setPlayer2Type(type) {
            const dropdown = document.getElementById('player2Dropdown');
            const difficultyButtons = document.getElementById('npcDifficultyButtons');
            const nameElement = document.getElementById('player2CardName');
            const inputElement = document.getElementById('player2NameInput');
            
            dropdown.classList.remove('show');
            inputElement.style.display = 'none'; // ensure text field hidden
            
            if (type === 'npc') {
                player2IsNPC = true;
                player2Name = 'NPC';
                difficultyButtons.classList.add('show');
                nameElement.childNodes[0].nodeValue = 'NPC';
            } else {
                player2IsNPC = false;
                player2Name = 'PLAYER 2';
                difficultyButtons.classList.remove('show');
                nameElement.childNodes[0].nodeValue = player2Name;
            }
            
            updateUI();
        }

        function setNpcDifficulty(level) {
            cardNpcLevel = level;
            
            // Update button states
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        // Game settings functions (aesthetic only for now)
        let gameType = 'points'; // 'points' or 'timed'
        let pointsToWin = 5;
        let matchTimeMinutes = 5;

        function setGameType(type) {
            gameType = type;
            
            // Update button states
            document.querySelectorAll('.game-type-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Show/hide appropriate settings
            const pointsSettings = document.getElementById('pointsSettings');
            const timedSettings = document.getElementById('timedSettings');
            
            if (type === 'points') {
                pointsSettings.classList.remove('hidden');
                timedSettings.classList.add('hidden');
            } else if (type === 'timed') {
                pointsSettings.classList.add('hidden');
                timedSettings.classList.remove('hidden');
            }
        }

        function setPointsToWin(points) {
            pointsToWin = points;
            
            // Update button states
            document.querySelectorAll('.points-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        function setMatchTime(minutes) {
            matchTimeMinutes = minutes;
            
            // Update button states
            document.querySelectorAll('.time-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        // Initialize pause system
        document.addEventListener('DOMContentLoaded', function() {
            // Add click event listener to pause button
            const pauseBtn = document.getElementById('pauseBtn');
            if (pauseBtn) {
                pauseBtn.addEventListener('click', togglePause);
            }
        });

        // Win condition checking function
        function checkWinConditions() {
            if (gameEnded || currentMode !== 'npc') return; // Only check in local mode
            
            let winner = null;
            let winCondition = '';
            
            if (gameType === 'points') {
                // Points-based win condition
                if (scoreP1 >= pointsToWin) {
                    winner = 1;
                    winCondition = `First to ${pointsToWin} points!`;
                } else if (scoreP2 >= pointsToWin) {
                    winner = 2;
                    winCondition = `First to ${pointsToWin} points!`;
                }
            } else if (gameType === 'timed') {
                // Time-based win condition - check if time is up
                const timeElapsed = (Date.now() - gameStartTime) / 1000;
                if (timeElapsed >= matchTimeMinutes * 60) {
                    if (scoreP1 > scoreP2) {
                        winner = 1;
                        winCondition = `Time's up! ${matchTimeMinutes} minute match completed.`;
                    } else if (scoreP2 > scoreP1) {
                        winner = 2;
                        winCondition = `Time's up! ${matchTimeMinutes} minute match completed.`;
                    } else {
                        // Tie game
                        showGameEndScreen(0, winCondition);
                        return;
                    }
                }
            }
            
            if (winner) {
                showGameEndScreen(winner, winCondition);
            }
        }

        // Display game end screen
        function showGameEndScreen(winner, winCondition) {
            gameEnded = true;
            gameState = "gameEnd";
            
            const overlay = document.getElementById('gameEndOverlay');
            const title = document.getElementById('gameEndTitle');
            const subtitle = document.getElementById('gameEndSubtitle');
            const finalP1Name = document.getElementById('finalP1Name');
            const finalP1Score = document.getElementById('finalP1Score');
            const finalP2Name = document.getElementById('finalP2Name');
            const finalP2Score = document.getElementById('finalP2Score');
            
            // Update display content
            finalP1Name.textContent = player1Name;
            finalP1Score.textContent = scoreP1;
            finalP2Name.textContent = player2IsNPC ? 'NPC' : player2Name;
            finalP2Score.textContent = scoreP2;
            
            if (winner === 0) {
                title.textContent = "TIE GAME!";
                subtitle.textContent = "It's a draw!";
            } else if (winner === 1) {
                title.textContent = "WINNER!";
                subtitle.textContent = `${player1Name} Wins!`;
            } else {
                title.textContent = "WINNER!";
                subtitle.textContent = `${player2IsNPC ? 'NPC' : player2Name} Wins!`;
            }
            
            overlay.classList.remove('hidden');
        }

        // Play again function
        function playAgain() {
            const overlay = document.getElementById('gameEndOverlay');
            overlay.classList.add('hidden');
            
            // Reset game state
            gameEnded = false;
            scoreP1 = 0;
            scoreP2 = 0;
            gameTimer = 0;
            gameStartTime = 0;
            gameTimeElapsed = 0;
            celebrating = false;
            celebrationDriver = null;
            gameSpeed = 1.0;
            carExplosions = [];
            scorchMarks = [];
            explodedCar = null;
            
            // Reset and restart the game
            updateUI();
            initiateCountdown();
        }

        // --- Car Color Customization System ---
        let player1SelectedColor = "#c62828"; // Default red
        let player2SelectedColor = "#2962ff"; // Default blue

        // Color theme mapping for UI elements
        const colorThemes = {
            "#c62828": { // Red
                primary: "#c62828",
                secondary: "#8b0000",
                accent: "#ff5252"
            },
            "#7b1fa2": { // Purple
                primary: "#7b1fa2",
                secondary: "#4a148c",
                accent: "#ba68c8"
            },
            "#f9a825": { // Yellow
                primary: "#f9a825",
                secondary: "#e65100",
                accent: "#ffca28"
            },
            "#e91e63": { // Pink
                primary: "#e91e63",
                secondary: "#ad1457",
                accent: "#f48fb1"
            },
            "#212121": { // Black
                primary: "#212121",
                secondary: "#000000",
                accent: "#616161"
            },
            "#2962ff": { // Blue (Player 2 default)
                primary: "#2962ff",
                secondary: "#1a237e",
                accent: "#448aff"
            }
        };

        function selectCarColor(playerNum, color) {
            // Prevent selecting a colour that is already in use by the other player
            if ((playerNum === 1 && color === player2SelectedColor) ||
                (playerNum === 2 && color === player1SelectedColor)) {
                return; // Colour taken, do nothing
            }

            // Update the selected colour
            if (playerNum === 1) {
                player1SelectedColor = color;
                player.color = color;
            } else {
                player2SelectedColor = color;
                player2.color = color;
            }

            // Update color selector UI
            updateColorSelectorUI(playerNum, color);
            
            // Update player card header color
            updatePlayerCardHeader(playerNum, color);
            
            // Update other UI elements based on color theme
            updateUITheme(playerNum, color);
            
            // Redraw the player card to show new car color
            if (playerNum === 1) {
                drawPlayerCard();
            } else {
                drawPlayer2Card();
            }
        }

        function updateColorSelectorUI(playerNum, selectedColor) {
            const selector = document.getElementById(`player${playerNum}ColorSelector`);
            const options = selector.querySelectorAll('.color-option');
            
            options.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.color === selectedColor) {
                    option.classList.add('selected');
                }
            });

            // After updating selections, refresh availability of colours for both players
            updateColorAvailability();
        }

        // Disable colours already chosen by the opposite player so they can't be selected twice
        function updateColorAvailability() {
            const player1Selector = document.getElementById('player1ColorSelector');
            const player2Selector = document.getElementById('player2ColorSelector');

            if (!player1Selector || !player2Selector) return; // safety

            const p1Options = player1Selector.querySelectorAll('.color-option');
            const p2Options = player2Selector.querySelectorAll('.color-option');

            // Helper to refresh state for a set of options
            function refreshOptions(options, unavailableColor) {
                options.forEach(opt => {
                    opt.classList.remove('unavailable');
                    // Always allow interaction by default
                    opt.style.pointerEvents = '';
                    opt.style.opacity = '';
                    opt.style.filter = '';

                    if (opt.dataset.color === unavailableColor && !opt.classList.contains('selected')) {
                        opt.classList.add('unavailable');
                    }
                });
            }

            // A colour picked by one player becomes unavailable for the other
            refreshOptions(p1Options, player2SelectedColor);
            refreshOptions(p2Options, player1SelectedColor);
        }

        function updatePlayerCardHeader(playerNum, color) {
            const header = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
            const theme = colorThemes[color];
            header.style.backgroundColor = theme.primary;
        }

        function updateUITheme(playerNum, color) {
            const theme = colorThemes[color];
            
            // Update scoreboard numeric colours
            const scoreElement = document.getElementById(playerNum === 1 ? 'topP1' : 'topP2');
            if (scoreElement) {
                scoreElement.style.color = theme.accent;
            }
            
            // Update scoreboard name label colours
            const labelSpans = document.querySelectorAll('.score-row.labels span');
            if (labelSpans.length) {
                if (playerNum === 1) {
                    labelSpans[0].style.color = theme.primary;
                } else {
                    labelSpans[labelSpans.length - 1].style.color = theme.primary;
                }
            }
            
            // Update chat message colors when player sends messages
            // This will be applied when messages are sent
            if (playerNum === 1) {
                document.documentElement.style.setProperty('--player1-color', theme.primary);
                document.documentElement.style.setProperty('--player1-accent', theme.accent);
            } else {
                document.documentElement.style.setProperty('--player2-color', theme.primary);
                document.documentElement.style.setProperty('--player2-accent', theme.accent);
            }
        }

        function getDarkerShade(color) {
            // Helper function to get darker shade for car details
            const colorMap = {
                "#c62828": "#8b0000", // Red -> Dark Red
                "#7b1fa2": "#4a148c", // Purple -> Dark Purple
                "#f9a825": "#e65100", // Yellow -> Dark Orange
                "#e91e63": "#ad1457", // Pink -> Dark Pink
                "#212121": "#000000", // Black -> True Black
                "#2962ff": "#1a237e"  // Blue -> Dark Blue
            };
            return colorMap[color] || "#333333";
        }

        // Initialize color selectors with default selections
        function initializeColorSelectors() {
            updateColorSelectorUI(1, player1SelectedColor);
            updateColorSelectorUI(2, player2SelectedColor);
            updatePlayerCardHeader(1, player1SelectedColor);
            updatePlayerCardHeader(2, player2SelectedColor);
            updateUITheme(1, player1SelectedColor);
            updateUITheme(2, player2SelectedColor);
        }

        // Call initialization when page loads
        setTimeout(initializeColorSelectors, 100);

        // --- Snarky NPC banter ---

        // Utility to convert a hex colour to an rgba string with adjustable alpha
        function hexToRgba(hex, alpha = 0.3) {
            const cleanHex = hex.replace('#', '');
            const bigint = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        // Trigger a car explosion and set it up for respawn
        function causeCarExplosion(car) {
            if (car.isDestroyed) return; // already destroyed
            createCarExplosion(car.x, car.y, car.color);
            createScorchMark(car.x, car.y);
            car.isDestroyed = true;
            car.respawnTimer = 120; // ~2 seconds at 60 fps
            // hide car off-screen while destroyed
            car.x = -1000;
            car.y = -1000;
            car.vx = car.vy = 0;
        } */
