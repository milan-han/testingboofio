/* ================================
 *  Global Variables and Utilities
 * ================================*/

// Canvas Setup
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Remove fixed PIXEL_SCALE and make the canvas responsively scale to the viewport
function applyResponsiveCanvasScaling() {
    const rawScale = Math.min(
        window.innerWidth  / canvas.width,
        window.innerHeight / canvas.height
    );

    // Determine whether the game is currently zoomed in (match countdown or active)
    const zoomed = canvas.classList.contains("zooming") || canvas.classList.contains("game-active");

    // Base scale caps
    const maxScale = zoomed ? 1 : 0.7; // 0.7 for menu, 1 when zoomed
    const scale    = Math.min(rawScale, maxScale);

    canvas.style.transform = `translate(-50%, -65%) scale(${scale})`;
}

// Run once on load and anytime the viewport size changes
window.addEventListener("resize", applyResponsiveCanvasScaling);
window.addEventListener("orientationchange", applyResponsiveCanvasScaling);
applyResponsiveCanvasScaling();

// Particle arrays (moved from particles.js to ensure global access)
let smoke = [];
let tyreMarks = [];
let sparks = [];
let flames = [];

// Game State Variables
let gameState = "setup"; // "setup", "countdown", "playing", "goal"
let lapStartTime = Date.now();

// Soccer game state
let scoreP1 = 0;
let scoreP2 = 0;

// Celebration state
let celebrating = false;
let celebrateTimer = 0;
const CELEBRATION_MS = 1500;
const SLOWMO_START_MS = 900;
let gameSpeed = 1.0;

// Car explosion system
let carExplosions = [];
let scorchMarks = [];
let explodedCar = null;
let celebrationDriver = null;
let gamePaused = false;
let countdownInterval = null;

// Game timer and win condition variables
let gameTimer = 0;
let gameStartTime = 0;
let gameTimeElapsed = 0;
let gameEnded = false;

// Player names
let player1Name = "PLAYER 1";
let player2Name = "PLAYER 2";

// Current mode
let currentMode = 'matchmaking';

// World/camera offset
let worldOffsetX = 0;
let worldOffsetY = 0;

// Player objects (will be initialized after Car and Ball classes are loaded)
let player = null;
let player2 = null;
let ball = null;
let players = [];

// Game settings functions
let gameType = 'points'; // 'points' or 'timed'
let pointsToWin = 5;
let matchTimeMinutes = 5;

// NPC AI variables
let npcMode = false;
let npcLevel = 10;
let player2IsNPC = true;
let cardNpcLevel = 10;

// NPC dialogue arrays
const preGameLines = [
    "Ready to get schooled?",
    "This should be easy...",
    "Hope you're ready to lose!",
    "Let's see what you've got.",
    "Time to show you how it's done!"
];

const npcScoredLines = [
    "Too easy!",
    "Is that all you've got?",
    "GOOOAL! Better luck next time!",
    "And that's how it's done!",
    "Maybe try harder next time?"
];

const playerScoredLines = [
    "Lucky shot...",
    "That won't happen again!",
    "You got lucky there.",
    "Alright, now I'm warmed up!",
    "Fine, game on!"
];

// Initialize game objects after all classes are loaded
function initializeGameObjects() {
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

// Essential Game Functions
function initiateCountdown() {
    // Use base canvas dimensions instead of DPR-scaled dimensions
    const baseWidth = 960;
    const baseHeight = 600;
    
    // Reset any camera/world offset accumulated in demo
    worldOffsetX = 0;
    worldOffsetY = 0;

    gameState = "countdown";
    // Hide new game menu instead of old multiplayer panel
    document.getElementById("gameMenuContainer").classList.add("hidden");
    // Hide old elements if they exist
    const oldMultiplayerPanel = document.getElementById("multiplayerPanel");
    if (oldMultiplayerPanel) {
        oldMultiplayerPanel.classList.add("hidden");
    }
    const oldStartBtn = document.getElementById("startGameBtn");
    if (oldStartBtn) {
        oldStartBtn.classList.add("hidden");
    }
    
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
    document.body.classList.add('field-offset');
    
    // Shrink retro video player to match chat width
    const retroPlayerEl = document.querySelector('.retro-player');
    if (retroPlayerEl) retroPlayerEl.classList.add('compressed');
    
    // Position cars at starting locations for kickoff
    player.x = 100;
    player.y = baseHeight / 2;
    player.vx = player.vy = 0;
    player.heading = 0;
    
    player2.x = baseWidth - 100;
    player2.y = baseHeight / 2;
    player2.vx = player2.vy = 0;
    player2.heading = Math.PI;
    
    // Place ball at center
    ball.x = baseWidth / 2;
    ball.y = baseHeight / 2;
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
                    document.getElementById("scoreBoard").classList.add("visible");
                    document.getElementById("pauseBtn").classList.add("visible");
                    actuallyStartGame();
                }, 1000);
                
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        }, 1000);
    }, 300);
}

function actuallyStartGame() {
    if (gameState !== "countdown") return;
    gameState = "playing";
    
    // Initialize game timer for timed mode
    if (gameType === 'timed' && currentMode === 'npc') {
        gameStartTime = Date.now();
        gameEnded = false;
    }
    
    // Use base canvas dimensions instead of DPR-scaled dimensions
    const baseWidth = 960;
    const baseHeight = 600;
    
    // Reset car positions
    player.x = 100;
    player.y = baseHeight / 2;
    player.vx = player.vy = 0;
    player.heading = 0;

    player2.x = baseWidth - 100;
    player2.y = baseHeight / 2;
    player2.vx = player2.vy = 0;
    player2.heading = Math.PI;

    resetBall();

    // Enable game controls
    canvas.classList.add("game-active");
    lapStartTime = Date.now();

    // Show scoreboard and other UI elements
    document.getElementById('scoreBoard').classList.add('visible');
    document.getElementById('pauseBtn').classList.add('visible');
    document.getElementById('backBtn').classList.add('visible');
    document.body.classList.add('field-offset');
}

function resumeGame() {
    if (gameState !== "playing") return;
    gamePaused = false;
    document.getElementById('pauseOverlay').classList.add('hidden');
    
    // Update pause button state
    const pauseBtn = document.getElementById("pauseBtn");
    pauseBtn.textContent = "⏸";
    pauseBtn.classList.remove("paused");
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

function returnToTitle() {
    // Use base canvas dimensions instead of DPR-scaled dimensions
    const baseWidth = 960;
    const baseHeight = 600;
    
    // Reset game state
    gameState = "setup";
    gamePaused = false;
    celebrating = false;
    celebrateTimer = 0;
    gameSpeed = 1.0;
    gameEnded = false;
    
    // Clear countdown interval if it exists
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Reset scores
    scoreP1 = 0;
    scoreP2 = 0;
    
    // Hide game UI elements
    document.getElementById("scoreBoard").classList.remove("visible");
    document.getElementById("countdownOverlay").classList.add("hidden");
    document.getElementById("pauseOverlay").classList.add("hidden");
    document.getElementById("gameEndOverlay").classList.add("hidden");
    
    // Show menu elements - use new game menu instead of old multiplayer panel
    document.getElementById("gameMenuContainer").classList.remove("hidden");
    // Hide old elements if they exist
    const oldMultiplayerPanel = document.getElementById("multiplayerPanel");
    if (oldMultiplayerPanel) {
        oldMultiplayerPanel.classList.add("hidden");
    }
    const oldStartBtn = document.getElementById("startGameBtn");
    if (oldStartBtn) {
        oldStartBtn.classList.add("hidden");
    }
    document.querySelector(".logo-container").classList.remove("hidden");
    
    // Show player cards and login button
    document.getElementById("playerCard").classList.remove("hidden");
    if (currentMode === 'npc') {
        document.getElementById("player2Card").classList.remove("hidden");
    }
    document.querySelector(".login-btn").classList.remove("hidden");
    
    // Hide game control buttons
    document.getElementById("backBtn").classList.add("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
    
    // Reset chat panel and field offset
    const chatPanelEl = document.getElementById("chatPanel");
    chatPanelEl.classList.remove("compressed");
    document.body.classList.remove('field-offset');
    
    // Reset retro video player size
    const retroPlayerEl = document.querySelector('.retro-player');
    if (retroPlayerEl) retroPlayerEl.classList.remove('compressed');
    
    // Remove zoom effect
    const canvasEl = document.getElementById("game");
    canvasEl.classList.remove("zooming");
    
    // Reset ball and car positions
    ball.x = baseWidth / 2;
    ball.y = baseHeight / 2;
    ball.vx = ball.vy = 0;
    
    player.x = baseWidth / 2 - 100;
    player.y = baseHeight / 2;
    player.vx = player.vy = 0;
    player.heading = 0;
    
    player2.x = baseWidth / 2 + 100;
    player2.y = baseHeight / 2;
    player2.vx = player2.vy = 0;
    player2.heading = Math.PI;
    
    updateUI();
}

function resetBall() {
    // Use base canvas dimensions instead of DPR-scaled dimensions
    const baseWidth = 960;
    const baseHeight = 600;
    
    ball.x = baseWidth / 2;
    ball.y = baseHeight / 2;
    ball.vx = 0;
    ball.vy = 0;
}

function updateUI() {
    // Update scoreboard
    const p1Score = document.getElementById("topP1");
    const p2Score = document.getElementById("topP2");
    if (p1Score) p1Score.textContent = scoreP1;
    if (p2Score) p2Score.textContent = scoreP2;
}

// Input Handling
const keys = {};
const chatInputElement = document.getElementById('chatInput');

function chatActive() { 
    return chatInputElement && chatInputElement.style.display !== 'none' && document.activeElement === chatInputElement; 
}

function clearKeys() { 
    Object.keys(keys).forEach(k => keys[k] = false); 
}

// Utility Functions
function hexToRgba(hex, alpha = 0.3) {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getDarkerShade(color) {
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

// UI Functions
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
        
        // Set Player 2 to human by default in local mode so they can edit their name
        setPlayer2Type('human');
        
        // Spawn Player 2 car in demo world when switching to local mode
        if (gameState === "setup") {
            // Use base canvas dimensions instead of DPR-scaled dimensions
            const baseWidth = 960;
            const baseHeight = 600;
            
            // Position Player 2 car on the field (right side)
            player2.x = baseWidth - 150;
            player2.y = baseHeight / 2;
            player2.vx = 0;
            player2.vy = 0;
            player2.heading = Math.PI; // pointing left initially
            
            // Reset camera and car position if car is outside field bounds
            const fieldMargin = 30;
            const carOutOfBounds = player.x < fieldMargin || player.x > baseWidth - fieldMargin ||
                                 player.y < fieldMargin || player.y > baseHeight - fieldMargin;
            
            if (carOutOfBounds) {
                // Reset camera to center
                worldOffsetX = 0;
                worldOffsetY = 0;
                
                // Move car to center of field
                player.x = baseWidth / 2;
                player.y = baseHeight / 2;
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

// Car Color Customization System
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

    // --- Sync to RoomState colour ---
    if (typeof RoomState !== 'undefined') {
        const locals = RoomState.players.filter(p => p.type === 'local');
        const target = locals[playerNum - 1];
        if (target) {
            RoomState.updatePlayer(target.id, { color });
        }
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

// Initialize color selectors with default selections
function initializeColorSelectors() {
    updateColorSelectorUI(1, player1SelectedColor);
    updateColorSelectorUI(2, player2SelectedColor);
    updatePlayerCardHeader(1, player1SelectedColor);
    updatePlayerCardHeader(2, player2SelectedColor);
    updateUITheme(1, player1SelectedColor);
    updateUITheme(2, player2SelectedColor);
}

// Player card functions
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
    if (playerNum === 2 && player2IsNPC) return;
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
    // --- Sync to RoomState ---
    if (typeof RoomState !== 'undefined') {
        const locals = RoomState.players.filter(p => p.type === 'local');
        const target = locals[playerNum - 1];
        if (target) {
            RoomState.updatePlayer(target.id, { name: newName });
        }
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

// Game settings functions
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

// Player Card canvas drawing
const cardCanvas = document.getElementById('playerCardCanvas');
const cardCtx = cardCanvas ? cardCanvas.getContext('2d') : null;

function drawBlueprintGrid(ctx, width, height) {
    ctx.save();
    
    // Set grid style - subtle blue color with low opacity
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.15)';
    ctx.lineWidth = 0.5;
    
    const gridSize = 20; // Grid square size
    const smallGridSize = 5; // Small grid divisions
    
    // Draw major grid lines
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();
    
    // Draw minor grid lines
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.08)';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    for (let x = 0; x <= width; x += smallGridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += smallGridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();
    
    // Add corner brackets for that technical blueprint look
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.25)';
    ctx.lineWidth = 1;
    const bracketSize = 15;
    
    // Top-left bracket
    ctx.beginPath();
    ctx.moveTo(0, bracketSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(bracketSize, 0);
    ctx.stroke();
    
    // Top-right bracket
    ctx.beginPath();
    ctx.moveTo(width - bracketSize, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, bracketSize);
    ctx.stroke();
    
    // Bottom-left bracket
    ctx.beginPath();
    ctx.moveTo(0, height - bracketSize);
    ctx.lineTo(0, height);
    ctx.lineTo(bracketSize, height);
    ctx.stroke();
    
    // Bottom-right bracket
    ctx.beginPath();
    ctx.moveTo(width - bracketSize, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, height - bracketSize);
    ctx.stroke();
    
    // Add center crosshairs
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.12)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(width/2 - 10, height/2);
    ctx.lineTo(width/2 + 10, height/2);
    ctx.moveTo(width/2, height/2 - 10);
    ctx.lineTo(width/2, height/2 + 10);
    ctx.stroke();
    
    ctx.restore();
}

function drawPlayerCard() {
    if(!cardCtx) return;
    
    // Update canvas actual size to match CSS size
    cardCanvas.width = 240;
    cardCanvas.height = 320;
    
    cardCtx.clearRect(0,0,cardCanvas.width,cardCanvas.height);
    
    // Draw blueprint grid background for the entire card
    drawBlueprintGrid(cardCtx, cardCanvas.width, cardCanvas.height);
    
    // Scale up the car for the larger display - make it much bigger
    const scale = 8; // Increased from 5 to 8 for much bigger car
    const carW = player.w * scale; // car width scaled
    const carH = player.h * scale; // car length scaled
    
    cardCtx.save();
    // Position car centered vertically in the smaller canvas
    cardCtx.translate(cardCanvas.width/2, cardCanvas.height/2 + 10); // moved down from -20 to +10 to prevent top cutoff
    
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
    
    // Draw blueprint grid background for the entire card
    drawBlueprintGrid(card2Ctx, card2Canvas.width, card2Canvas.height);
    
    // Scale up the car for the larger display - make it much bigger
    const scale = 8; // Same scale as player 1
    const carW = player2.w * scale; // car width scaled
    const carH = player2.h * scale; // car length scaled
    
    card2Ctx.save();
    // Position car centered vertically in the smaller canvas
    card2Ctx.translate(card2Canvas.width/2, card2Canvas.height/2 + 10); // moved down from -20 to +10 to prevent top cutoff
    
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

// Call initialization when page loads
setTimeout(initializeColorSelectors, 100); 

// === Ready/Play logic ===
function onPressF() {
    if (typeof RoomState === "undefined") {
        // Fallback: just start local game if available
        if (typeof initiateCountdown === 'function' && typeof gameState !== 'undefined' && gameState === 'setup') {
            initiateCountdown();
        }
        return;
    }

    const state = RoomState.getState();
    const hasOnline = state.players.some(p => p.type === 'online');

    if (hasOnline) {
        // Toggle ready state for every local player on this client
        const locals = state.players.filter(p => p.type === 'local');
        const currentlyReady = locals.every(pl => pl.ready);
        locals.forEach(pl => RoomState.markReady(pl.id, !currentlyReady));
    } else {
        // Pure local / NPC lobby – start immediately
        if (typeof initiateCountdown === 'function' && typeof gameState !== 'undefined' && gameState === 'setup') {
            initiateCountdown();
        }
    }
}

// Modify existing keydown listener to delegate F key to onPressF and skip further handling
// (insert at the very top of the listener body just after chatActive check)
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
    if (e.code === "KeyF") {
        onPressF();
    }
});

window.addEventListener("keyup", (e) => {
    if(chatActive()) return;
    keys[e.code] = false;
});

function togglePause() {
    if (gameState !== "playing") return;
    
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById("pauseBtn");
    const pauseOverlay = document.getElementById('pauseOverlay');
    
    if (gamePaused) {
        pauseBtn.textContent = "▶";
        pauseBtn.classList.add("paused");
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseBtn.textContent = "⏸";
        pauseBtn.classList.remove("paused");
        pauseOverlay.classList.add('hidden');
    }
}

// Initialize game when DOM is loaded
// Note: Actual initialization is deferred to game-state.js since it loads last
// and ensures all classes (Car, Ball) are available 

// NPC AI Update Function
function npcUpdate(car, ball, deltaTime = 1.0, customLevel = null) {
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
    car.update(deltaTime); // Pass deltaTime to car update
    car.turnSpeed = 0.05; // reset for player frame
}

// NPC dialogue function
function npcSay(lines) {
    if (!lines || lines.length === 0) return;
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    addChatMessage('friend', `${player2Name}: ${randomLine}`);
}

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

// Show game end screen
function showGameEndScreen(winner, winCondition) {
    gameEnded = true;
    gameState = "gameEnd";
    
    const overlay = document.getElementById('gameEndOverlay');
    const title = document.getElementById('gameEndTitle');
    const subtitle = document.getElementById('gameEndSubtitle');
    const finalP1Name = document.getElementById('finalP1Name');
    const finalP2Name = document.getElementById('finalP2Name');
    const finalP1Score = document.getElementById('finalP1Score');
    const finalP2Score = document.getElementById('finalP2Score');
    
    if (winner === 0) {
        title.textContent = "TIE GAME!";
        subtitle.textContent = winCondition;
    } else {
        title.textContent = "WINNER!";
        subtitle.textContent = winner === 1 ? `${player1Name} Wins!` : `${player2Name} Wins!`;
    }
    
    finalP1Name.textContent = player1Name;
    finalP2Name.textContent = player2Name;
    finalP1Score.textContent = scoreP1;
    finalP2Score.textContent = scoreP2;
    
    overlay.classList.remove('hidden');
}

// Listen for RoomState "all_ready" event to start the match when every human is ready
if (typeof RoomState !== "undefined") {
    RoomState.subscribe((evt) => {
        if (evt === 'all_ready') {
            if (typeof initiateCountdown === 'function' && typeof gameState !== 'undefined' && gameState === 'setup') {
                initiateCountdown();
            }
        }
    });
} 