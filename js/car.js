/* ================================
 *  Car Class and Physics
 * ================================*/

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

    update(deltaTime = 1.0) {
        // Handle destruction / respawn
        if (this.isDestroyed) {
            if (this.respawnTimer > 0) {
                this.respawnTimer -= deltaTime; // Use delta time instead of frame counting
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
        const gameStore = window.GameStore;
        const gameState = gameStore ? gameStore.get('gameState') : 'setup';
        const celebrating = gameStore ? gameStore.get('celebrating') : false;
        const celebrationDriver = gameStore ? gameStore.get('celebrationDriver') : null;
        
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
        if (keys[this.controls.forward]) forward += this.acceleration * deltaTime;
        if (keys[this.controls.back])    forward -= this.acceleration * 0.8 * deltaTime;

        // === Steering ===
        let steerInput = 0;
        if (keys[this.controls.left])  steerInput = -1;
        else if (keys[this.controls.right]) steerInput = 1;

        // Turn rate grows with speed for tighter feel
        let turnRate = steerInput * this.turnSpeed * (Math.abs(forward) / 2 + 0.3) * deltaTime;
        if (forward < 0) turnRate = -turnRate; // invert steering when reversing
        
        // Store the current turn rate for player card display
        this.currentTurnRate = turnRate;
        
        // Smooth interpolation for player card display rotation
        const maxRotation = Math.PI / 6; // 30 degrees
        const rotationScale = 50; // scale turn rate to rotation range
        const targetRotation = Math.max(-maxRotation, Math.min(maxRotation, turnRate * rotationScale));
        
        // Smooth interpolation - gradually move toward target rotation
        const lerpSpeed = 0.15 * deltaTime; // Apply delta time to interpolation speed
        this.displayRotation += (targetRotation - this.displayRotation) * lerpSpeed;
        
        this.heading += turnRate;

        // === Handbrake & Drift Physics ===
        const forwardFriction = 0.02 * deltaTime;                        // always present
        const sideFriction = this.handbrake ? 0.03 * deltaTime : 0.3 * deltaTime;     // VERY grippy unless handbrake pressed

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
            // accumulate drift charge based on time, not frames
            this.driftCharge = (this.driftCharge || 0) + deltaTime;
            if (this.driftCharge > 60) { // 60 time units = 1 second at 60fps
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
                this.boostTimer = 30;    // 30 time units (~0.5s) higher top speed
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

        if(this.boostTimer>0) this.boostTimer -= deltaTime; // countdown using delta time

        // === Update position ===
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Check goal post collisions
        this.handleGoalPostCollisions();

        // Track / canvas bounds
        this.checkTrackBounds();
    }

    checkTrackBounds() {
        // Use base canvas dimensions instead of DPR-scaled dimensions
        const baseWidth = 960;
        const baseHeight = 600;
        
        const gameStore = window.GameStore;
        const gameState = gameStore ? gameStore.get('gameState') : 'setup';
        
        if (gameState === "setup") {
            // Lock cars to field boundaries (inside the white lines) for ALL demo modes
            const fieldMargin = 20; // margin equal to pitch white border
            if (this.x < fieldMargin) { this.x = fieldMargin; this.vx = Math.abs(this.vx) * 0.5; }
            if (this.x > baseWidth - fieldMargin) { this.x = baseWidth - fieldMargin; this.vx = -Math.abs(this.vx) * 0.5; }
            if (this.y < fieldMargin) { this.y = fieldMargin; this.vy = Math.abs(this.vy) * 0.5; }
            if (this.y > baseHeight - fieldMargin) { this.y = baseHeight - fieldMargin; this.vy = -Math.abs(this.vy) * 0.5; }

            return;
        }
        // Simple boundary check - slow down if hitting grass
        if (!this.isOnTrack()) {
            this.vx *= 0.8;
            this.vy *= 0.8;
        }
        
        // Keep in canvas bounds
        if (this.x < 20) { this.x = 20; this.vx = Math.abs(this.vx) * 0.5; }
        if (this.x > baseWidth - 20) { this.x = baseWidth - 20; this.vx = -Math.abs(this.vx) * 0.5; }
        if (this.y < 20) { this.y = 20; this.vy = Math.abs(this.vy) * 0.5; }
        if (this.y > baseHeight - 20) { this.y = baseHeight - 20; this.vy = -Math.abs(this.vy) * 0.5; }
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

// Car initialization is now managed by globals.js

// Trigger a car explosion and set it up for respawn
function causeCarExplosion(car) {
    if (car.isDestroyed) return; // already destroyed
    createCarExplosion(car.x, car.y, car.color);
    // Don't create scorch marks for boofing explosions - only for goal explosions
    // createScorchMark(car.x, car.y);
    car.isDestroyed = true;
    car.respawnTimer = 120; // ~2 seconds in time units (120 time units = 2 seconds at 60fps)
    // hide car off-screen while destroyed
    car.x = -1000;
    car.y = -1000;
    car.vx = car.vy = 0;
} 