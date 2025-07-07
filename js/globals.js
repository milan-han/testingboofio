/* ================================
 *  Global Variables and Utilities (Refactored)
 * ================================*/

// Canvas Setup - use singleton from CanvasRenderer module
const canvas = window.CanvasRenderer ? window.CanvasRenderer.getCanvas() : document.getElementById("game");
const ctx = window.CanvasRenderer ? window.CanvasRenderer.getContext() : canvas.getContext("2d");

// Input handling variables
window.keys = {};
const chatInputElement = document.getElementById('chatInput');

// Particle arrays (global access needed for game logic)
let smoke = [];
let tyreMarks = [];
let sparks = [];
let flames = [];

// Player objects (will be initialized after Car and Ball classes are loaded)
let player = null;
let player2 = null;
let ball = null;
let players = [];

// Initialize game objects after all classes are loaded
window.initializeGameObjects = function initializeGameObjects() {
    // Use base canvas dimensions instead of DPR-scaled dimensions
    const baseWidth = 960;
    const baseHeight = 600;
    
    // Control maps
    const player1Controls = { forward:"KeyW", back:"KeyS", left:"KeyA", right:"KeyD", brake:"Space" };
    const player2Controls = { forward:"ArrowUp", back:"ArrowDown", left:"ArrowLeft", right:"ArrowRight", brake:"ShiftRight" };

    // Initialize red car in front of its goal for demo mode
    player = new Car(100, baseHeight / 2, "#c62828", player1Controls);
    // Initialize blue car off-screen (hidden in setup mode)
    player2 = new Car(-100, -100, "#2962ff", player2Controls);

    players = [player, player2];

    // Initialize ball at field center in setup mode
    ball = new Ball(baseWidth / 2, baseHeight / 2);
}

// Essential utility functions
window.chatActive = function chatActive() {
    return chatInputElement && chatInputElement.style.display !== 'none' && document.activeElement === chatInputElement;
}

window.clearKeys = function clearKeys() {
    Object.keys(window.keys).forEach(key => window.keys[key] = false);
}

// ================================
//  COMPATIBILITY LAYER
// ================================
// 
// This section provides backward compatibility for code that still expects
// global variables and functions. These now delegate to the new modular APIs.

// Delegate to GameStore for state variables
Object.defineProperty(window, 'gameState', {
    get: () => window.GameStore ? window.GameStore.get('gameState') : 'setup',
    set: (value) => { if (window.GameStore) window.GameStore.set('gameState', value); }
});

Object.defineProperty(window, 'scoreP1', {
    get: () => window.GameStore ? window.GameStore.get('scoreP1') : 0,
    set: (value) => { if (window.GameStore) window.GameStore.set('scoreP1', value); }
});

Object.defineProperty(window, 'scoreP2', {
    get: () => window.GameStore ? window.GameStore.get('scoreP2') : 0,
    set: (value) => { if (window.GameStore) window.GameStore.set('scoreP2', value); }
});

Object.defineProperty(window, 'celebrating', {
    get: () => window.GameStore ? window.GameStore.get('celebrating') : false,
    set: (value) => { if (window.GameStore) window.GameStore.set('celebrating', value); }
});

Object.defineProperty(window, 'celebrateTimer', {
    get: () => window.GameStore ? window.GameStore.get('celebrateTimer') : 0,
    set: (value) => { if (window.GameStore) window.GameStore.set('celebrateTimer', value); }
});

Object.defineProperty(window, 'gameSpeed', {
    get: () => window.GameStore ? window.GameStore.get('gameSpeed') : 1.0,
    set: (value) => { if (window.GameStore) window.GameStore.set('gameSpeed', value); }
});

Object.defineProperty(window, 'celebrationDriver', {
    get: () => window.GameStore ? window.GameStore.get('celebrationDriver') : null,
    set: (value) => { if (window.GameStore) window.GameStore.set('celebrationDriver', value); }
});

Object.defineProperty(window, 'explodedCar', {
    get: () => window.GameStore ? window.GameStore.get('explodedCar') : null,
    set: (value) => { if (window.GameStore) window.GameStore.set('explodedCar', value); }
});

Object.defineProperty(window, 'player1Name', {
    get: () => window.GameStore ? window.GameStore.get('player1Name') : 'PLAYER 1',
    set: (value) => { if (window.GameStore) window.GameStore.set('player1Name', value); }
});

Object.defineProperty(window, 'player2Name', {
    get: () => window.GameStore ? window.GameStore.get('player2Name') : 'PLAYER 2',
    set: (value) => { if (window.GameStore) window.GameStore.set('player2Name', value); }
});

Object.defineProperty(window, 'npcMode', {
    get: () => window.GameStore ? window.GameStore.get('npcMode') : false,
    set: (value) => { if (window.GameStore) window.GameStore.set('npcMode', value); }
});

Object.defineProperty(window, 'player2IsNPC', {
    get: () => window.GameStore ? window.GameStore.get('player2IsNPC') : true,
    set: (value) => { if (window.GameStore) window.GameStore.set('player2IsNPC', value); }
});

Object.defineProperty(window, 'worldOffsetX', {
    get: () => window.GameStore ? window.GameStore.get('worldOffsetX') : 0,
    set: (value) => { if (window.GameStore) window.GameStore.set('worldOffsetX', value); }
});

Object.defineProperty(window, 'worldOffsetY', {
    get: () => window.GameStore ? window.GameStore.get('worldOffsetY') : 0,
    set: (value) => { if (window.GameStore) window.GameStore.set('worldOffsetY', value); }
});

// Delegate to MatchController for match functions
window.initiateCountdown = function() {
    if (window.MatchController) {
        return window.MatchController.initiateCountdown();
    }
};

window.actuallyStartGame = function() {
    if (window.MatchController) {
        return window.MatchController.actuallyStartGame();
    }
};

window.resumeGame = function() {
    if (window.MatchController) {
        return window.MatchController.resumeGame();
    }
};

window.restartMatch = function() {
    if (window.MatchController) {
        return window.MatchController.restartMatch();
    }
};

window.playAgain = function() {
    if (window.MatchController) {
        return window.MatchController.playAgain();
    }
};

window.returnToTitle = function() {
    if (window.MatchController) {
        return window.MatchController.returnToTitle();
    }
};

window.resetBall = function() {
    if (window.MatchController) {
        return window.MatchController.resetBall();
    }
};

window.updateUI = function() {
    if (window.MatchController) {
        return window.MatchController.updateUI();
    }
};

window.togglePause = function() {
    if (window.MatchController) {
        return window.MatchController.togglePause();
    }
};

window.checkWinConditions = function() {
    if (window.MatchController) {
        return window.MatchController.checkWinConditions();
    }
};

// Delegate to PlayerManager for player functions
window.selectCarColor = function(playerNum, color) {
    if (window.PlayerManager) {
        return window.PlayerManager.selectCarColor(playerNum, color);
    }
};

window.editPlayerName = function(playerNum) {
    if (window.PlayerManager) {
        return window.PlayerManager.editPlayerName(playerNum);
    }
};

window.savePlayerName = function(playerNum) {
    if (window.PlayerManager) {
        return window.PlayerManager.savePlayerName(playerNum);
    }
};

window.handleNameKeypress = function(event, playerNum) {
    if (window.PlayerManager) {
        return window.PlayerManager.handleNameKeypress(event, playerNum);
    }
};

window.setPlayer2Type = function(type) {
    if (window.PlayerManager) {
        return window.PlayerManager.setPlayer2Type(type);
    }
};

window.setNpcDifficulty = function(level) {
    if (window.PlayerManager) {
        return window.PlayerManager.setNpcDifficulty(level);
    }
};

window.setGameType = function(type) {
    if (window.PlayerManager) {
        return window.PlayerManager.setGameType(type);
    }
};

window.setPointsToWin = function(points) {
    if (window.PlayerManager) {
        return window.PlayerManager.setPointsToWin(points);
    }
};

window.setMatchTime = function(minutes) {
    if (window.PlayerManager) {
        return window.PlayerManager.setMatchTime(minutes);
    }
};

// Delegate to NPCAI for NPC functions
window.npcUpdate = function(car, ball, deltaTime, customLevel) {
    if (window.NPCAI) {
        return window.NPCAI.update(car, ball, deltaTime, customLevel);
    }
};

// UI Functions that haven't been extracted yet
function selectMode(mode) {
    const gameStore = window.GameStore;
    if (gameStore) {
        gameStore.set('currentMode', mode);
    }
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="selectMode('${mode}')"]`).classList.add('active');
    
    if (mode === 'matchmaking') {
        document.getElementById('matchmaking-options').classList.remove('hidden');
        document.getElementById('local-options').classList.add('hidden');
    } else {
        document.getElementById('local-options').classList.remove('hidden');
        document.getElementById('matchmaking-options').classList.add('hidden');
    }
}

function createRoom() {
    if (window.ChatUtils) {
        window.ChatUtils.addMessage('system', 'Room ABC123 created!');
    }
}

function joinRoom() {
    const roomCode = prompt('Enter room code:') || 'ABC123';
    if (window.ChatUtils) {
        window.ChatUtils.addMessage('system', `Joining room ${roomCode}...`);
    }
}

function findMatch() {
    if (window.ChatUtils) {
        window.ChatUtils.addMessage('system', 'Searching for opponents...');
    }
}

// Drawing functions that haven't been extracted
function drawPlayerCard() {
    const gameStore = window.GameStore;
    if (!gameStore) return;
    
    const gameState = gameStore.get('gameState');
    
    // Rest of drawPlayerCard implementation...
    // (This would need the full implementation from the original globals.js)
}

function initializePlayer2Card() {
    // Player 2 card initialization...
}

function drawPlayer2Card() {
    // Player 2 card drawing...
}

function onPressF() {
    // Press F functionality...
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Globals (clean) loaded - compatibility layer active');
    
    // Initialize game objects if classes are available
    if (typeof Car !== 'undefined' && typeof Ball !== 'undefined') {
        initializeGameObjects();
    }
}); 