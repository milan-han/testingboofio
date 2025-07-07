/* ================================
 *  Match Flow Controller
 * ================================*/

/**
 * MatchController class for managing game state transitions and match flow
 */
class MatchController {
    constructor() {
        this.baseWidth = 960;
        this.baseHeight = 600;
        this.countdownInterval = null;
        
        // Bind methods to preserve context
        this.initiateCountdown = this.initiateCountdown.bind(this);
        this.actuallyStartGame = this.actuallyStartGame.bind(this);
        this.togglePause = this.togglePause.bind(this);
        this.checkWinConditions = this.checkWinConditions.bind(this);
    }
    
    /**
     * Initiate countdown sequence before game starts
     */
    initiateCountdown() {
        const gameStore = window.GameStore;
        if (!gameStore) return;
        
        // Reset any camera/world offset accumulated in demo
        gameStore.set({
            worldOffsetX: 0,
            worldOffsetY: 0,
            gameState: "countdown"
        });
        
        // Hide menu elements
        this.hideMenuElements();
        
        // Show game elements
        this.showGameElements();
        
        // Position players at starting locations
        this.positionPlayersForKickoff();
        
        // Start zoom animation and countdown
        this.startCountdownSequence();
    }
    
    /**
     * Hide menu elements when game starts
     */
    hideMenuElements() {
        const elementsToHide = [
            "gameMenuContainer",
            "multiplayerPanel", // old element
            "startGameBtn", // old element
            ".logo-container",
            "playerCard",
            "player2Card",
            ".login-btn"
        ];
        
        elementsToHide.forEach(selector => {
            const element = selector.startsWith('.') ? 
                document.querySelector(selector) : 
                document.getElementById(selector);
            if (element) {
                element.classList.add("hidden");
            }
        });
    }
    
    /**
     * Show game elements when game starts
     */
    showGameElements() {
        // Show game control buttons
        const backBtn = document.getElementById("backBtn");
        const pauseBtn = document.getElementById("pauseBtn");
        if (backBtn) backBtn.classList.remove("hidden");
        if (pauseBtn) pauseBtn.classList.remove("hidden");
        
        // Compress chat when game starts
        const chatPanelEl = document.getElementById("chatPanel");
        if (chatPanelEl) chatPanelEl.classList.add("compressed");
        document.body.classList.add('field-offset');
        
        // Shrink retro video player to match chat width
        const retroPlayerEl = document.querySelector('.retro-player');
        if (retroPlayerEl) retroPlayerEl.classList.add('compressed');
    }
    
    /**
     * Position players at kickoff locations
     */
    positionPlayersForKickoff() {
        if (!window.player || !window.player2 || !window.ball) return;
        
        // Player 1 - left side
        window.player.x = 100;
        window.player.y = this.baseHeight / 2;
        window.player.vx = window.player.vy = 0;
        window.player.heading = 0;
        
        // Player 2 - right side
        window.player2.x = this.baseWidth - 100;
        window.player2.y = this.baseHeight / 2;
        window.player2.vx = window.player2.vy = 0;
        window.player2.heading = Math.PI;
        
        // Ball at center
        window.ball.x = this.baseWidth / 2;
        window.ball.y = this.baseHeight / 2;
        window.ball.vx = window.ball.vy = 0;
    }
    
    /**
     * Start the countdown sequence with zoom animation
     */
    startCountdownSequence() {
        const canvasRenderer = window.CanvasRenderer;
        if (canvasRenderer) {
            canvasRenderer.enableZoom();
        }
        
        // Wait for zoom animation to complete, then start countdown
        setTimeout(() => {
            this.displayCountdown();
        }, 300);
    }
    
    /**
     * Display countdown overlay and numbers
     */
    displayCountdown() {
        const countdownOverlay = document.getElementById("countdownOverlay");
        const countdownNumber = document.getElementById("countdownNumber");
        
        if (!countdownOverlay || !countdownNumber) return;
        
        countdownOverlay.classList.remove("hidden");
        
        let count = 3;
        countdownNumber.textContent = count;
        countdownNumber.style.animation = "countdownPulse 1s ease-in-out";
        
        this.countdownInterval = setInterval(() => {
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
                    document.getElementById("scoreBoard")?.classList.add("visible");
                    document.getElementById("pauseBtn")?.classList.add("visible");
                    this.actuallyStartGame();
                }, 1000);
                
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }
        }, 1000);
    }
    
    /**
     * Actually start the game after countdown
     */
    actuallyStartGame() {
        const gameStore = window.GameStore;
        if (!gameStore) return;
        
        if (gameStore.get('gameState') !== "countdown") return;
        
        gameStore.set('gameState', "playing");
        
        // Initialize game timer for timed mode
        const gameType = gameStore.get('gameType');
        const currentMode = gameStore.get('currentMode');
        
        if (gameType === 'timed' && currentMode === 'npc') {
            gameStore.set({
                gameStartTime: Date.now(),
                gameEnded: false
            });
        }
        
        // Reset positions and ball
        this.positionPlayersForKickoff();
        this.resetBall();
        
        // Enable game controls
        const canvasRenderer = window.CanvasRenderer;
        if (canvasRenderer) {
            canvasRenderer.setGameActive();
        }
        
        gameStore.set('lapStartTime', Date.now());
        
        // Show UI elements
        const scoreBoard = document.getElementById('scoreBoard');
        const pauseBtn = document.getElementById('pauseBtn');
        const backBtn = document.getElementById('backBtn');
        
        if (scoreBoard) scoreBoard.classList.add('visible');
        if (pauseBtn) pauseBtn.classList.add('visible');
        if (backBtn) backBtn.classList.add('visible');
        
        document.body.classList.add('field-offset');
    }
    
    /**
     * Resume game from pause
     */
    resumeGame() {
        const gameStore = window.GameStore;
        if (!gameStore) return;
        
        gameStore.set('gamePaused', false);
        const pauseBtn = document.getElementById("pauseBtn");
        const pauseOverlay = document.getElementById('pauseOverlay');
        
        if (pauseBtn) {
            pauseBtn.textContent = "⏸";
            pauseBtn.classList.remove("paused");
        }
        if (pauseOverlay) {
            pauseOverlay.classList.add('hidden');
        }
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        const gameStore = window.GameStore;
        if (!gameStore || gameStore.get('gameState') !== "playing") return;
        
        const isPaused = gameStore.get('gamePaused');
        gameStore.set('gamePaused', !isPaused);
        
        const pauseBtn = document.getElementById("pauseBtn");
        const pauseOverlay = document.getElementById('pauseOverlay');
        
        if (!isPaused) {
            // Pausing
            if (pauseBtn) {
                pauseBtn.textContent = "▶";
                pauseBtn.classList.add("paused");
            }
            if (pauseOverlay) pauseOverlay.classList.remove('hidden');
        } else {
            // Resuming
            if (pauseBtn) {
                pauseBtn.textContent = "⏸";
                pauseBtn.classList.remove("paused");
            }
            if (pauseOverlay) pauseOverlay.classList.add('hidden');
        }
    }
    
    /**
     * Restart the current match
     */
    restartMatch() {
        const gameStore = window.GameStore;
        if (!gameStore) return;
        
        const gameState = gameStore.get('gameState');
        if (gameState !== "playing" && gameState !== "gameEnd") return;
        
        // Hide overlays
        document.getElementById('pauseOverlay')?.classList.add('hidden');
        document.getElementById('gameEndOverlay')?.classList.add('hidden');
        
        // Reset game state
        gameStore.set({
            gamePaused: false,
            gameEnded: false,
            celebrating: false,
            celebrationDriver: null,
            gameSpeed: 1.0,
            explodedCar: null,
            gameTimer: 0,
            gameStartTime: 0,
            gameTimeElapsed: 0
        });
        
        // Reset scores
        gameStore.resetScores();
        
        // Reset pause button state
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.textContent = "⏸";
            pauseBtn.classList.remove("paused");
        }
        
        // Clear explosion effects
        if (window.carExplosions) window.carExplosions.length = 0;
        if (window.scorchMarks) window.scorchMarks.length = 0;
        
        this.updateUI();
        this.initiateCountdown();
    }
    
    /**
     * Play again after game end
     */
    playAgain() {
        const overlay = document.getElementById('gameEndOverlay');
        if (overlay) overlay.classList.add('hidden');
        
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set({
                gameEnded: false,
                celebrating: false,
                celebrationDriver: null,
                gameSpeed: 1.0,
                explodedCar: null,
                gameTimer: 0,
                gameStartTime: 0,
                gameTimeElapsed: 0
            });
            gameStore.resetScores();
        }
        
        // Clear explosion effects
        if (window.carExplosions) window.carExplosions.length = 0;
        if (window.scorchMarks) window.scorchMarks.length = 0;
        
        this.updateUI();
        this.initiateCountdown();
    }
    
    /**
     * Return to title screen
     */
    returnToTitle() {
        const gameStore = window.GameStore;
        if (!gameStore) return;
        
        // Reset game state
        gameStore.set({
            gameState: "setup",
            gamePaused: false,
            celebrating: false,
            celebrateTimer: 0,
            gameSpeed: 1.0,
            gameEnded: false,
            countdownInterval: null
        });
        
        // Clear countdown interval if it exists
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Reset scores
        gameStore.resetScores();
        
        // Hide game UI elements
        this.hideGameElements();
        
        // Show menu elements
        this.showMenuElements();
        
        // Reset positions
        this.resetToMenuPositions();
        
        this.updateUI();
    }
    
    /**
     * Hide game UI elements
     */
    hideGameElements() {
        const elementsToHide = [
            "scoreBoard",
            "countdownOverlay", 
            "pauseOverlay",
            "gameEndOverlay",
            "backBtn",
            "pauseBtn"
        ];
        
        elementsToHide.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove("visible");
                element.classList.add("hidden");
            }
        });
    }
    
    /**
     * Show menu elements
     */
    showMenuElements() {
        const gameStore = window.GameStore;
        const currentMode = gameStore ? gameStore.get('currentMode') : 'npc';
        
        // Show new game menu instead of old multiplayer panel
        document.getElementById("gameMenuContainer")?.classList.remove("hidden");
        
        // Hide old elements if they exist
        document.getElementById("multiplayerPanel")?.classList.add("hidden");
        document.getElementById("startGameBtn")?.classList.add("hidden");
        
        document.querySelector(".logo-container")?.classList.remove("hidden");
        
        // Show player cards and login button
        document.getElementById("playerCard")?.classList.remove("hidden");
        if (currentMode === 'npc') {
            document.getElementById("player2Card")?.classList.remove("hidden");
        }
        document.querySelector(".login-btn")?.classList.remove("hidden");
        
        // Reset chat panel and field offset
        const chatPanelEl = document.getElementById("chatPanel");
        if (chatPanelEl) chatPanelEl.classList.remove("compressed");
        document.body.classList.remove('field-offset');
        
        // Reset retro video player size
        const retroPlayerEl = document.querySelector('.retro-player');
        if (retroPlayerEl) retroPlayerEl.classList.remove('compressed');
        
        // Remove zoom effect
        const canvasRenderer = window.CanvasRenderer;
        if (canvasRenderer) {
            canvasRenderer.disableZoom();
            canvasRenderer.setGameInactive();
        }
    }
    
    /**
     * Reset to menu positions
     */
    resetToMenuPositions() {
        if (!window.player || !window.player2 || !window.ball) return;
        
        // Reset ball
        window.ball.x = this.baseWidth / 2;
        window.ball.y = this.baseHeight / 2;
        window.ball.vx = window.ball.vy = 0;
        
        // Reset player positions for menu
        window.player.x = this.baseWidth / 2 - 100;
        window.player.y = this.baseHeight / 2;
        window.player.vx = window.player.vy = 0;
        window.player.heading = 0;
        
        window.player2.x = this.baseWidth / 2 + 100;
        window.player2.y = this.baseHeight / 2;
        window.player2.vx = window.player2.vy = 0;
        window.player2.heading = Math.PI;
    }
    
    /**
     * Reset ball to center
     */
    resetBall() {
        if (!window.ball) return;
        
        window.ball.x = this.baseWidth / 2;
        window.ball.y = this.baseHeight / 2;
        window.ball.vx = 0;
        window.ball.vy = 0;
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        const gameStore = window.GameStore;
        if (!gameStore) return;
        
        // Update scoreboard
        const p1Score = document.getElementById("topP1");
        const p2Score = document.getElementById("topP2");
        if (p1Score) p1Score.textContent = gameStore.get('scoreP1');
        if (p2Score) p2Score.textContent = gameStore.get('scoreP2');
    }
    
    /**
     * Check win conditions
     */
    checkWinConditions() {
        const gameStore = window.GameStore;
        if (!gameStore) return;
        
        const gameEnded = gameStore.get('gameEnded');
        const currentMode = gameStore.get('currentMode');
        
        if (gameEnded || currentMode !== 'npc') return; // Only check in NPC mode
        
        let winner = null;
        let winCondition = '';
        
        const gameType = gameStore.get('gameType');
        const scoreP1 = gameStore.get('scoreP1');
        const scoreP2 = gameStore.get('scoreP2');
        const pointsToWin = gameStore.get('pointsToWin');
        const matchTimeMinutes = gameStore.get('matchTimeMinutes');
        const gameStartTime = gameStore.get('gameStartTime');
        
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
                    this.showGameEndScreen(0, winCondition);
                    return;
                }
            }
        }
        
        if (winner) {
            this.showGameEndScreen(winner, winCondition);
        }
    }
    
    /**
     * Show game end screen
     * @param {number} winner - Winner (0 for tie, 1 for player1, 2 for player2)
     * @param {string} winCondition - Win condition text
     */
    showGameEndScreen(winner, winCondition) {
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set({
                gameEnded: true,
                gameState: "gameEnd"
            });
        }
        
        const overlay = document.getElementById('gameEndOverlay');
        const title = document.getElementById('gameEndTitle');
        const subtitle = document.getElementById('gameEndSubtitle');
        const finalP1Name = document.getElementById('finalP1Name');
        const finalP2Name = document.getElementById('finalP2Name');
        const finalP1Score = document.getElementById('finalP1Score');
        const finalP2Score = document.getElementById('finalP2Score');
        
        if (title && subtitle) {
            if (winner === 0) {
                title.textContent = "TIE GAME!";
                subtitle.textContent = winCondition;
            } else {
                title.textContent = "WINNER!";
                const player1Name = gameStore ? gameStore.get('player1Name') : 'PLAYER 1';
                const player2Name = gameStore ? gameStore.get('player2Name') : 'PLAYER 2';
                subtitle.textContent = winner === 1 ? `${player1Name} Wins!` : `${player2Name} Wins!`;
            }
        }
        
        if (finalP1Name && finalP2Name && finalP1Score && finalP2Score && gameStore) {
            finalP1Name.textContent = gameStore.get('player1Name');
            finalP2Name.textContent = gameStore.get('player2Name');
            finalP1Score.textContent = gameStore.get('scoreP1');
            finalP2Score.textContent = gameStore.get('scoreP2');
        }
        
        if (overlay) overlay.classList.remove('hidden');
    }
}

// Create global instance
const matchController = new MatchController();

// Export for global access (IIFE pattern for compatibility)
window.MatchController = matchController;

// Provide backward compatibility for existing code
window.initiateCountdown = () => matchController.initiateCountdown();
window.actuallyStartGame = () => matchController.actuallyStartGame();
window.resumeGame = () => matchController.resumeGame();
window.restartMatch = () => matchController.restartMatch();
window.playAgain = () => matchController.playAgain();
window.returnToTitle = () => matchController.returnToTitle();
window.resetBall = () => matchController.resetBall();
window.updateUI = () => matchController.updateUI();
window.togglePause = () => matchController.togglePause();
window.checkWinConditions = () => matchController.checkWinConditions();
window.showGameEndScreen = (winner, winCondition) => matchController.showGameEndScreen(winner, winCondition); 