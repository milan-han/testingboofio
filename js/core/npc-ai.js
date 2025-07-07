/* ================================
 *  NPC AI System
 * ================================*/

/**
 * NPC AI class for managing non-player character behavior and dialogue
 */
class NPCAI {
    constructor() {
        // Dialogue arrays for different situations
        this.dialogue = {
            preGame: [
                "Ready to get schooled?",
                "This should be easy...",
                "Hope you're ready to lose!",
                "Let's see what you've got.",
                "Time to show you how it's done!"
            ],
            
            npcScored: [
                "Too easy!",
                "Is that all you've got?",
                "GOOOAL! Better luck next time!",
                "And that's how it's done!",
                "Maybe try harder next time?"
            ],
            
            playerScored: [
                "Lucky shot...",
                "That won't happen again!",
                "You got lucky there.",
                "Alright, now I'm warmed up!",
                "Fine, game on!"
            ]
        };
        
        // AI behavior constants
        this.behaviorConstants = {
            BASE_ANGLE_THRESHOLD: 0.3,
            CLOSE_DISTANCE: 50,
            EMERGENCY_DISTANCE: 140,
            APPROACH_DISTANCE: 60,
            BRAKE_DISTANCE: 20,
            TURN_BRAKE_DISTANCE: 120,
            BASE_TURN_SPEED: 0.05
        };
    }
    
    /**
     * Update NPC AI behavior
     * @param {Car} car - NPC car object
     * @param {Ball} ball - Ball object  
     * @param {number} deltaTime - Time elapsed since last frame
     * @param {number} customLevel - Custom difficulty level (optional)
     */
    update(car, ball, deltaTime = 1.0, customLevel = null) {
        // Ensure consistent physics
        car.maxSpeed = 6;
        car.acceleration = 0.15;
        
        // Get difficulty level from GameStore or use custom level
        const gameStore = window.GameStore;
        const currentLevel = customLevel !== null ? customLevel : 
                            (gameStore ? gameStore.get('npcLevel') : 10);
        
        // Calculate AI parameters based on difficulty
        const { targetX, targetY } = this.calculateTarget(car, ball);
        const shouldMove = this.processMovement(car, targetX, targetY, currentLevel, deltaTime);
        
        return shouldMove;
    }
    
    /**
     * Calculate AI target position based on ball position and game state
     * @param {Car} car - NPC car object
     * @param {Ball} ball - Ball object
     * @returns {object} Target coordinates {targetX, targetY}
     */
    calculateTarget(car, ball) {
        const canvasRenderer = window.CanvasRenderer;
        const canvasWidth = canvasRenderer ? canvasRenderer.getDimensions().width : 960;
        const canvasHeight = canvasRenderer ? canvasRenderer.getDimensions().height : 600;
        
        const ballOnNpcHalf = ball.x > canvasWidth / 2;
        const ballNearGoal = ball.x > canvasWidth - this.behaviorConstants.EMERGENCY_DISTANCE;
        
        let targetX, targetY;
        
        if (ballNearGoal) {
            // EMERGENCY CLEAR: drive directly at the ball to clear it away
            targetX = ball.x;
            targetY = ball.y;
        } else if (ballOnNpcHalf) {
            // DEFEND: position between ball and goal
            targetX = ball.x + this.behaviorConstants.APPROACH_DISTANCE;
            targetY = ball.y;
        } else {
            // ATTACK: get behind ball toward player goal (left side)
            const goalX = 20;
            const goalY = canvasHeight / 2;
            const vecGX = goalX - ball.x;
            const vecGY = goalY - ball.y;
            const len = Math.hypot(vecGX, vecGY) || 1;
            
            targetX = ball.x - (vecGX / len) * this.behaviorConstants.APPROACH_DISTANCE;
            targetY = ball.y - (vecGY / len) * this.behaviorConstants.APPROACH_DISTANCE;
        }
        
        return { targetX, targetY };
    }
    
    /**
     * Process AI movement and input handling
     * @param {Car} car - NPC car object
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {number} level - Difficulty level
     * @param {number} deltaTime - Time elapsed
     * @returns {boolean} Whether the car should move
     */
    processMovement(car, targetX, targetY, level, deltaTime) {
        // Calculate movement parameters
        const dx = targetX - car.x;
        const dy = targetY - car.y;
        const dist = Math.hypot(dx, dy);
        const desiredAngle = Math.atan2(dy, dx);
        
        // Calculate angle difference
        let angleDiff = desiredAngle - car.heading;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // Difficulty affects reaction sharpness
        const angleThreshold = this.behaviorConstants.BASE_ANGLE_THRESHOLD - (level * 0.02);
        
        // Clear previous frame inputs
        this.clearCarInputs(car);
        
        // Apply steering
        this.applySteeringInputs(car, angleDiff, angleThreshold);
        
        // Apply throttle and brake
        this.applyThrottleInputs(car, angleDiff, dist, level);
        
        // Apply difficulty-based turn speed scaling
        car.turnSpeed = this.behaviorConstants.BASE_TURN_SPEED * (0.6 + level * 0.04);
        
        // Update car physics
        car.update(deltaTime);
        
        // Reset turn speed
        car.turnSpeed = this.behaviorConstants.BASE_TURN_SPEED;
        
        return true;
    }
    
    /**
     * Clear all car control inputs
     * @param {Car} car - Car object
     */
    clearCarInputs(car) {
        if (car.controls && window.keys) {
            Object.values(car.controls).forEach(control => {
                window.keys[control] = false;
            });
        }
    }
    
    /**
     * Apply steering inputs based on angle difference
     * @param {Car} car - Car object
     * @param {number} angleDiff - Angle difference to target
     * @param {number} angleThreshold - Threshold for turning
     */
    applySteeringInputs(car, angleDiff, angleThreshold) {
        if (!car.controls || !window.keys) return;
        
        if (angleDiff > angleThreshold) {
            window.keys[car.controls.right] = true;
        } else if (angleDiff < -angleThreshold) {
            window.keys[car.controls.left] = true;
        }
    }
    
    /**
     * Apply throttle and brake inputs
     * @param {Car} car - Car object
     * @param {number} angleDiff - Angle difference to target
     * @param {number} dist - Distance to target
     * @param {number} level - Difficulty level
     */
    applyThrottleInputs(car, angleDiff, dist, level) {
        if (!car.controls || !window.keys) return;
        
        if (Math.abs(angleDiff) < Math.PI / 3) {
            // Mostly facing target
            if (dist > this.behaviorConstants.CLOSE_DISTANCE) {
                window.keys[car.controls.forward] = true;
            } else if (dist < this.behaviorConstants.BRAKE_DISTANCE) {
                window.keys[car.controls.brake] = true;
            }
        } else {
            // Need a big turn, maybe slow with handbrake at higher difficulty levels
            if (level > 6 && dist < this.behaviorConstants.TURN_BRAKE_DISTANCE) {
                window.keys[car.controls.brake] = true;
            }
        }
    }
    
    /**
     * Make NPC say a random line from a dialogue category
     * @param {string} category - Dialogue category ('preGame', 'npcScored', 'playerScored')
     */
    say(category) {
        const lines = this.dialogue[category];
        if (!lines || lines.length === 0) return;
        
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        
        // Get player 2 name from GameStore
        const gameStore = window.GameStore;
        const player2Name = gameStore ? gameStore.get('player2Name') : 'PLAYER 2';
        
        // Use ChatUtils if available, otherwise fall back to global function
        if (window.ChatUtils) {
            window.ChatUtils.addMessage('friend', `${player2Name}: ${randomLine}`);
        } else if (window.addChatMessage) {
            window.addChatMessage('friend', `${player2Name}: ${randomLine}`);
        }
    }
    
    /**
     * Set NPC difficulty level
     * @param {number} level - Difficulty level (1-10)
     */
    setDifficulty(level) {
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set('npcLevel', Math.max(1, Math.min(10, level)));
        }
    }
    
    /**
     * Get current NPC difficulty level
     * @returns {number} Current difficulty level
     */
    getDifficulty() {
        const gameStore = window.GameStore;
        return gameStore ? gameStore.get('npcLevel') : 10;
    }
    
    /**
     * Enable NPC mode
     */
    enableNpcMode() {
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set({
                npcMode: true,
                player2IsNPC: true
            });
        }
    }
    
    /**
     * Disable NPC mode
     */
    disableNpcMode() {
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set({
                npcMode: false,
                player2IsNPC: false
            });
        }
    }
    
    /**
     * Check if NPC mode is active
     * @returns {boolean} Whether NPC mode is active
     */
    isNpcMode() {
        const gameStore = window.GameStore;
        return gameStore ? gameStore.get('npcMode') : false;
    }
}

// Create global instance
const npcAI = new NPCAI();

// Export for global access (IIFE pattern for compatibility)
window.NPCAI = npcAI;

// Provide backward compatibility for existing code
window.npcUpdate = (car, ball, deltaTime, customLevel) => 
    npcAI.update(car, ball, deltaTime, customLevel);

window.npcSay = (lines) => {
    if (Array.isArray(lines)) {
        // Convert old array format to new category format
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        const gameStore = window.GameStore;
        const player2Name = gameStore ? gameStore.get('player2Name') : 'PLAYER 2';
        
        if (window.ChatUtils) {
            window.ChatUtils.addMessage('friend', `${player2Name}: ${randomLine}`);
        } else if (window.addChatMessage) {
            window.addChatMessage('friend', `${player2Name}: ${randomLine}`);
        }
    } else if (typeof lines === 'string') {
        npcAI.say(lines);
    }
};

// Export dialogue arrays for backward compatibility
window.preGameLines = npcAI.dialogue.preGame;
window.npcScoredLines = npcAI.dialogue.npcScored;
window.playerScoredLines = npcAI.dialogue.playerScored; 