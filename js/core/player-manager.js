/* ================================
 *  Player Manager
 * ================================*/

/**
 * PlayerManager class for managing players, colors, themes, and settings
 */
class PlayerManager {
    constructor() {
        // Default color selections
        this.player1SelectedColor = "#c62828"; // Default red
        this.player2SelectedColor = "#2962ff"; // Default blue
        
        // Color theme mapping for UI elements
        this.colorThemes = {
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
        
        // Player card canvas setup
        this.cardCanvas = document.getElementById('playerCardCanvas');
        this.cardCtx = this.cardCanvas ? this.cardCanvas.getContext('2d') : null;
    }
    
    /**
     * Initialize player manager
     */
    initialize() {
        this.initializeColorSelectors();
        this.updateUIThemes();
    }
    
    /**
     * Select car color for a player
     * @param {number} playerNum - Player number (1 or 2)
     * @param {string} color - Hex color string
     */
    selectCarColor(playerNum, color) {
        // Prevent selecting a color that is already in use by the other player
        if ((playerNum === 1 && color === this.player2SelectedColor) ||
            (playerNum === 2 && color === this.player1SelectedColor)) {
            return; // Color taken, do nothing
        }
        
        // Update the selected color
        if (playerNum === 1) {
            this.player1SelectedColor = color;
            if (window.player) window.player.color = color;
        } else {
            this.player2SelectedColor = color;
            if (window.player2) window.player2.color = color;
        }
        
        // Update all related UI
        this.updateColorSelectorUI(playerNum, color);
        this.updatePlayerCardHeader(playerNum, color);
        this.updateUITheme(playerNum, color);
        
        // Redraw the player card to show new car color
        if (playerNum === 1) {
            this.drawPlayerCard();
        } else {
            this.drawPlayer2Card();
        }
        
        // Sync to RoomState if available
        this.syncToRoomState(playerNum, color);
    }
    
    /**
     * Update color selector UI
     * @param {number} playerNum - Player number
     * @param {string} selectedColor - Selected color
     */
    updateColorSelectorUI(playerNum, selectedColor) {
        const selector = document.getElementById(`player${playerNum}ColorSelector`);
        if (!selector) return;
        
        const options = selector.querySelectorAll('.color-option');
        
        options.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === selectedColor) {
                option.classList.add('selected');
            }
        });
        
        // After updating selections, refresh availability of colors for both players
        this.updateColorAvailability();
    }
    
    /**
     * Update color availability (disable colors already chosen by the other player)
     */
    updateColorAvailability() {
        const player1Selector = document.getElementById('player1ColorSelector');
        const player2Selector = document.getElementById('player2ColorSelector');
        
        if (!player1Selector || !player2Selector) return;
        
        const p1Options = player1Selector.querySelectorAll('.color-option');
        const p2Options = player2Selector.querySelectorAll('.color-option');
        
        // Helper to refresh state for a set of options
        const refreshOptions = (options, unavailableColor) => {
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
        };
        
        // A color picked by one player becomes unavailable for the other
        refreshOptions(p1Options, this.player2SelectedColor);
        refreshOptions(p2Options, this.player1SelectedColor);
    }
    
    /**
     * Update player card header color
     * @param {number} playerNum - Player number
     * @param {string} color - Color hex string
     */
    updatePlayerCardHeader(playerNum, color) {
        const header = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
        if (!header) return;
        
        const theme = this.colorThemes[color];
        if (theme) {
            header.style.backgroundColor = theme.primary;
        }
    }
    
    /**
     * Update UI theme based on player color
     * @param {number} playerNum - Player number
     * @param {string} color - Color hex string
     */
    updateUITheme(playerNum, color) {
        const theme = this.colorThemes[color];
        if (!theme) return;
        
        // Update scoreboard numeric colors
        const scoreElement = document.getElementById(playerNum === 1 ? 'topP1' : 'topP2');
        if (scoreElement) {
            scoreElement.style.color = theme.accent;
        }
        
        // Update scoreboard name label colors
        const labelSpans = document.querySelectorAll('.score-row.labels span');
        if (labelSpans.length) {
            if (playerNum === 1) {
                labelSpans[0].style.color = theme.primary;
            } else {
                labelSpans[labelSpans.length - 1].style.color = theme.primary;
            }
        }
        
        // Update CSS custom properties for chat messages
        if (playerNum === 1) {
            document.documentElement.style.setProperty('--player1-color', theme.primary);
            document.documentElement.style.setProperty('--player1-accent', theme.accent);
        } else {
            document.documentElement.style.setProperty('--player2-color', theme.primary);
            document.documentElement.style.setProperty('--player2-accent', theme.accent);
        }
    }
    
    /**
     * Initialize color selectors with default selections
     */
    initializeColorSelectors() {
        this.updateColorSelectorUI(1, this.player1SelectedColor);
        this.updateColorSelectorUI(2, this.player2SelectedColor);
        this.updatePlayerCardHeader(1, this.player1SelectedColor);
        this.updatePlayerCardHeader(2, this.player2SelectedColor);
        this.updateUITheme(1, this.player1SelectedColor);
        this.updateUITheme(2, this.player2SelectedColor);
    }
    
    /**
     * Update all UI themes
     */
    updateUIThemes() {
        this.updateUITheme(1, this.player1SelectedColor);
        this.updateUITheme(2, this.player2SelectedColor);
    }
    
    /**
     * Edit player name
     * @param {number} playerNum - Player number
     */
    editPlayerName(playerNum) {
        const gameStore = window.GameStore;
        const player2IsNPC = gameStore ? gameStore.get('player2IsNPC') : true;
        
        if (playerNum === 2 && player2IsNPC) return;
        
        const nameElement = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
        const inputElement = document.getElementById(playerNum === 1 ? 'player1NameInput' : 'player2NameInput');
        
        if (!nameElement || !inputElement) return;
        
        // Show only if not already visible
        if (inputElement.style.display === 'block') {
            // If the input is already visible, just refocus and select its text
            inputElement.focus();
            inputElement.select();
            return;
        }
        
        // Store current text then clear for readability
        const currentText = gameStore ? 
            (playerNum === 1 ? gameStore.get('player1Name') : gameStore.get('player2Name')) :
            (playerNum === 1 ? 'PLAYER 1' : 'PLAYER 2');
            
        nameElement.dataset.originalText = currentText;
        nameElement.childNodes[0].nodeValue = '';
        inputElement.style.display = 'block';
        inputElement.value = currentText;
        inputElement.focus();
        inputElement.select();
    }
    
    /**
     * Save player name
     * @param {number} playerNum - Player number
     */
    savePlayerName(playerNum) {
        const gameStore = window.GameStore;
        const player2IsNPC = gameStore ? gameStore.get('player2IsNPC') : true;
        
        if (playerNum === 2 && player2IsNPC) return;
        
        const nameElement = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
        const inputElement = document.getElementById(playerNum === 1 ? 'player1NameInput' : 'player2NameInput');
        
        if (!nameElement || !inputElement) return;
        
        const newNameRaw = inputElement.value.trim();
        const defaultName = playerNum === 1 ? 'PLAYER 1' : (player2IsNPC ? 'NPC' : 'PLAYER 2');
        const newName = (newNameRaw || defaultName).toUpperCase();
        
        // Update GameStore
        if (gameStore) {
            const key = playerNum === 1 ? 'player1Name' : 'player2Name';
            gameStore.set(key, newName);
        }
        
        // Update UI
        nameElement.childNodes[0].nodeValue = newName;
        inputElement.style.display = 'none';
        
        // Sync to RoomState if available
        this.syncNameToRoomState(playerNum, newName);
    }
    
    /**
     * Handle name input keypress
     * @param {KeyboardEvent} event - Keyboard event
     * @param {number} playerNum - Player number
     */
    handleNameKeypress(event, playerNum) {
        if (event.key === 'Enter') {
            this.savePlayerName(playerNum);
        } else if (event.key === 'Escape') {
            const nameElement = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
            const inputElement = document.getElementById(playerNum === 1 ? 'player1NameInput' : 'player2NameInput');
            
            if (!nameElement || !inputElement) return;
            
            // Restore original text
            const gameStore = window.GameStore;
            const original = nameElement.dataset.originalText || 
                (gameStore ? 
                    (playerNum === 1 ? gameStore.get('player1Name') : gameStore.get('player2Name')) :
                    (playerNum === 1 ? 'PLAYER 1' : 'PLAYER 2')
                );
            nameElement.childNodes[0].nodeValue = original;
            inputElement.style.display = 'none';
        }
    }
    
    /**
     * Set player 2 type (NPC or Human)
     * @param {string} type - 'npc' or 'human'
     */
    setPlayer2Type(type) {
        const gameStore = window.GameStore;
        const dropdown = document.getElementById('player2Dropdown');
        const difficultyButtons = document.getElementById('npcDifficultyButtons');
        const nameElement = document.getElementById('player2CardName');
        const inputElement = document.getElementById('player2NameInput');
        
        if (dropdown) dropdown.classList.remove('show');
        if (inputElement) inputElement.style.display = 'none';
        
        if (type === 'npc') {
            if (gameStore) {
                gameStore.set({
                    player2IsNPC: true,
                    player2Name: 'NPC'
                });
            }
            if (difficultyButtons) difficultyButtons.classList.add('show');
            if (nameElement) nameElement.childNodes[0].nodeValue = 'NPC';
        } else {
            if (gameStore) {
                gameStore.set({
                    player2IsNPC: false,
                    player2Name: 'PLAYER 2'
                });
            }
            if (difficultyButtons) difficultyButtons.classList.remove('show');
            if (nameElement) nameElement.childNodes[0].nodeValue = 'PLAYER 2';
        }
        
        // Update UI
        const matchController = window.MatchController;
        if (matchController) matchController.updateUI();
    }
    
    /**
     * Set NPC difficulty level
     * @param {number} level - Difficulty level (1-10)
     */
    setNpcDifficulty(level) {
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set('cardNpcLevel', level);
        }
        
        // Update button states
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Find and activate the correct button
        const targetBtn = document.querySelector(`[onclick="setNpcDifficulty(${level})"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    /**
     * Set game type (points or timed)
     * @param {string} type - 'points' or 'timed'
     */
    setGameType(type) {
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set('gameType', type);
        }
        
        // Update button states
        document.querySelectorAll('.game-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetBtn = document.querySelector(`[onclick="setGameType('${type}')"]`);
        if (targetBtn) targetBtn.classList.add('active');
        
        // Show/hide appropriate settings
        const pointsSettings = document.getElementById('pointsSettings');
        const timedSettings = document.getElementById('timedSettings');
        
        if (type === 'points') {
            if (pointsSettings) pointsSettings.classList.remove('hidden');
            if (timedSettings) timedSettings.classList.add('hidden');
        } else if (type === 'timed') {
            if (pointsSettings) pointsSettings.classList.add('hidden');
            if (timedSettings) timedSettings.classList.remove('hidden');
        }
    }
    
    /**
     * Set points needed to win
     * @param {number} points - Points to win
     */
    setPointsToWin(points) {
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set('pointsToWin', points);
        }
        
        // Update button states
        document.querySelectorAll('.points-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetBtn = document.querySelector(`[onclick="setPointsToWin(${points})"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    /**
     * Set match time in minutes
     * @param {number} minutes - Match time in minutes
     */
    setMatchTime(minutes) {
        const gameStore = window.GameStore;
        if (gameStore) {
            gameStore.set('matchTimeMinutes', minutes);
        }
        
        // Update button states
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const targetBtn = document.querySelector(`[onclick="setMatchTime(${minutes})"]`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    /**
     * Draw player card (placeholder - would need actual implementation)
     */
    drawPlayerCard() {
        if (!this.cardCtx) return;
        
        // Use UtilHelpers blueprint grid if available
        if (window.UtilHelpers && window.UtilHelpers.drawBlueprintGrid) {
            window.UtilHelpers.drawBlueprintGrid(
                this.cardCtx, 
                this.cardCanvas.width, 
                this.cardCanvas.height
            );
        }
        
        // Additional player card drawing logic would go here
        // This is a placeholder for the actual car rendering
    }
    
    /**
     * Draw player 2 card (placeholder)
     */
    drawPlayer2Card() {
        // Similar to drawPlayerCard but for player 2
        this.drawPlayerCard();
    }
    
    /**
     * Sync color to RoomState
     * @param {number} playerNum - Player number
     * @param {string} color - Color hex string
     */
    syncToRoomState(playerNum, color) {
        if (typeof RoomState !== 'undefined') {
            const locals = RoomState.players.filter(p => p.type === 'local');
            const target = locals[playerNum - 1];
            if (target) {
                RoomState.updatePlayer(target.id, { color });
            }
        }
    }
    
    /**
     * Sync name to RoomState
     * @param {number} playerNum - Player number
     * @param {string} name - Player name
     */
    syncNameToRoomState(playerNum, name) {
        if (typeof RoomState !== 'undefined') {
            const locals = RoomState.players.filter(p => p.type === 'local');
            const target = locals[playerNum - 1];
            if (target) {
                RoomState.updatePlayer(target.id, { name });
            }
        }
    }
    
    /**
     * Get current player color
     * @param {number} playerNum - Player number
     * @returns {string} Color hex string
     */
    getPlayerColor(playerNum) {
        return playerNum === 1 ? this.player1SelectedColor : this.player2SelectedColor;
    }
    
    /**
     * Get color theme for a color
     * @param {string} color - Color hex string
     * @returns {object} Theme object
     */
    getColorTheme(color) {
        return this.colorThemes[color] || this.colorThemes["#c62828"];
    }
}

// Create global instance
const playerManager = new PlayerManager();

// Export for global access (IIFE pattern for compatibility)
window.PlayerManager = playerManager;

// Provide backward compatibility for existing code
window.selectCarColor = (playerNum, color) => playerManager.selectCarColor(playerNum, color);
window.updateColorSelectorUI = (playerNum, selectedColor) => playerManager.updateColorSelectorUI(playerNum, selectedColor);
window.updateColorAvailability = () => playerManager.updateColorAvailability();
window.updatePlayerCardHeader = (playerNum, color) => playerManager.updatePlayerCardHeader(playerNum, color);
window.updateUITheme = (playerNum, color) => playerManager.updateUITheme(playerNum, color);
window.initializeColorSelectors = () => playerManager.initializeColorSelectors();
window.editPlayerName = (playerNum) => playerManager.editPlayerName(playerNum);
window.savePlayerName = (playerNum) => playerManager.savePlayerName(playerNum);
window.handleNameKeypress = (event, playerNum) => playerManager.handleNameKeypress(event, playerNum);
window.setPlayer2Type = (type) => playerManager.setPlayer2Type(type);
window.setNpcDifficulty = (level) => playerManager.setNpcDifficulty(level);
window.setGameType = (type) => playerManager.setGameType(type);
window.setPointsToWin = (points) => playerManager.setPointsToWin(points);
window.setMatchTime = (minutes) => playerManager.setMatchTime(minutes);
window.drawPlayerCard = () => playerManager.drawPlayerCard();
window.drawPlayer2Card = () => playerManager.drawPlayer2Card();

// Export color themes and selections for backward compatibility
window.colorThemes = playerManager.colorThemes;
window.player1SelectedColor = playerManager.player1SelectedColor;
window.player2SelectedColor = playerManager.player2SelectedColor; 