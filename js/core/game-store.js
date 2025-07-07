/* ================================
 *  Game State Store with Subscribe Pattern
 * ================================*/

/**
 * Centralized game state management with subscription pattern
 * Replaces global variables and provides reactive updates
 */
class GameStore {
    constructor() {
        this.initialState = {
            // Game State
            gameState: "setup", // "setup", "countdown", "playing", "goal"
            lapStartTime: Date.now(),
            
            // Scores
            scoreP1: 0,
            scoreP2: 0,
            
            // Celebration State
            celebrating: false,
            celebrateTimer: 0,
            gameSpeed: 1.0,
            explodedCar: null,
            celebrationDriver: null,
            
            // Game Timer
            gameTimer: 0,
            gameStartTime: 0,
            gameTimeElapsed: 0,
            gameEnded: false,
            gamePaused: false,
            
            // Player Info
            player1Name: "PLAYER 1",
            player2Name: "PLAYER 2",
            
            // Game Mode
            currentMode: 'matchmaking',
            
            // World/Camera
            worldOffsetX: 0,
            worldOffsetY: 0,
            
            // Game Settings
            gameType: 'points', // 'points' or 'timed'
            pointsToWin: 5,
            matchTimeMinutes: 5,
            
            // NPC Settings
            npcMode: false,
            npcLevel: 10,
            player2IsNPC: true,
            cardNpcLevel: 10,
            
            // Countdown
            countdownInterval: null
        };

        // clone to actual state
        this.state = { ...this.initialState };

        this.subscribers = new Map(); // key -> Set of callback functions
        this.globalSubscribers = new Set(); // callbacks that listen to all changes
    }
    
    /**
     * Subscribe to changes in specific state properties
     * @param {string|string[]} keys - State key(s) to watch
     * @param {function} callback - Function to call when state changes
     * @returns {function} Unsubscribe function
     */
    subscribe(keys, callback) {
        if (keys === '*') {
            this.globalSubscribers.add(callback);
            return () => this.globalSubscribers.delete(callback);
        }

        const keyArray = Array.isArray(keys) ? keys : [keys];

        keyArray.forEach(key => {
            if (!this.subscribers.has(key)) {
                this.subscribers.set(key, new Set());
            }
            this.subscribers.get(key).add(callback);
        });

        // Return unsubscribe function
        return () => {
            keyArray.forEach(key => {
                const callbacks = this.subscribers.get(key);
                if (callbacks) {
                    callbacks.delete(callback);
                    if (callbacks.size === 0) {
                        this.subscribers.delete(key);
                    }
                }
            });
        };
    }
    
    /**
     * Subscribe to all state changes
     * @param {function} callback - Function to call on any state change
     * @returns {function} Unsubscribe function
     */
    subscribeToAll(callback) {
        this.globalSubscribers.add(callback);
        return () => this.globalSubscribers.delete(callback);
    }
    
    /**
     * Get current value of a state property
     * @param {string} key - State key
     * @returns {*} Current value
     */
    get(key) {
        return this.state[key];
    }
    
    /**
     * Get entire state object (read-only)
     * @returns {object} Current state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Set state property and notify subscribers
     * @param {string|object} key - State key or object of key-value pairs
     * @param {*} value - New value (if key is string)
     */
    set(key, value) {
        const updates = typeof key === 'object' ? key : { [key]: value };
        const changed = [];

        Object.entries(updates).forEach(([k, v]) => {
            const oldVal = this.state[k];
            if (oldVal !== v) {
                this.state[k] = v;
                changed.push({ key: k, oldVal, newVal: v });
            }
        });

        // Notify subscribers
        changed.forEach(({ key: changedKey, oldVal, newVal }) => {
            const callbacks = this.subscribers.get(changedKey);
            if (callbacks) {
                callbacks.forEach(callback => {
                    try {
                        callback(newVal, oldVal);
                    } catch (error) {
                        console.error('Error in state subscriber:', error);
                    }
                });
            }

            // Notify global subscribers for each key
            this.globalSubscribers.forEach(callback => {
                try {
                    callback(changedKey, newVal, oldVal);
                } catch (error) {
                    console.error('Error in global state subscriber:', error);
                }
            });
        });
    }
    
    /**
     * Reset game state to initial values
     */
    reset() {
        this.state = { ...this.initialState };
        // Notify full reset via global subscribers
        this.globalSubscribers.forEach(cb => {
            try { cb('reset', null, null); } catch (e) { console.error(e); }
        });
    }
    
    /**
     * Reset scores only
     */
    resetScores() {
        this.set({
            scoreP1: 0,
            scoreP2: 0
        });
    }
    
    /**
     * Increment player score
     * @param {number} playerNum - 1 or 2
     */
    incrementScore(playerNum) {
        const key = playerNum === 1 ? 'scoreP1' : 'scoreP2';
        this.set(key, this.get(key) + 1);
    }
    
    /**
     * Start celebration mode
     * @param {*} car - Car that scored
     * @param {*} driver - Driver name
     */
    startCelebration(car, driver) {
        this.set({
            celebrating: true,
            celebrateTimer: 0,
            explodedCar: car || null,
            celebrationDriver: driver || null
        });
    }

    /**
     * End celebration immediately
     */
    endCelebration() {
        this.set({
            celebrating: false,
            celebrateTimer: 0,
            gameSpeed: 1.0,
            explodedCar: null,
            celebrationDriver: null
        });
    }
    
    /**
     * Update celebration timer
     * @param {number} deltaTime - Time elapsed
     */
    updateCelebration(deltaTime) {
        if (this.get('celebrating')) {
            const newTimer = Math.max(0, this.get('celebrateTimer') - deltaTime);
            this.set('celebrateTimer', newTimer);
            
            // Handle slow motion effect
            if (newTimer > 600) { // SLOWMO_START_MS
                this.set('gameSpeed', 0.3);
            } else {
                this.set('gameSpeed', 1.0);
            }
            
            // End celebration
            if (newTimer <= 0) {
                this.set({
                    celebrating: false,
                    explodedCar: null,
                    celebrationDriver: null,
                    gameSpeed: 1.0
                });
            }
        }
    }
}

// Create global instance
const gameStore = new GameStore();

// Export for global access (IIFE pattern for compatibility)
window.GameStore = gameStore;
