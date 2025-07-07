/* ================================
 *  Input Handling
 * ================================*/

// Input handling is now managed by globals.js

// Chat functionality
document.addEventListener('keydown', (e) => {
    const gameStore = window.GameStore;
    const gameState = gameStore ? gameStore.get('gameState') : 'setup';
    
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
        if(msg){
            const gameStore = window.GameStore;
            const player1Name = gameStore ? gameStore.get('player1Name') : 'PLAYER 1';
            
            // Use ChatUtils if available, otherwise fallback to global function
            if (window.ChatUtils) {
                window.ChatUtils.addMessage('self', `${player1Name}: ${msg}`);
            } else if (window.addChatMessage) {
                window.addChatMessage('self', `${player1Name}: ${msg}`);
            }
        }
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

// Player name editing functionality
function handleNameKeypress(event, playerNum) {
    if (event.key === 'Enter') {
        savePlayerName(playerNum);
    } else if (event.key === 'Escape') {
        const nameElement = document.getElementById(playerNum === 1 ? 'playerCardName' : 'player2CardName');
        const inputElement = document.getElementById(playerNum === 1 ? 'player1NameInput' : 'player2NameInput');
        // restore original text
        const gameStore = window.GameStore;
        const player1Name = gameStore ? gameStore.get('player1Name') : 'PLAYER 1';
        const player2Name = gameStore ? gameStore.get('player2Name') : 'PLAYER 2';
        const original = nameElement.dataset.originalText || (playerNum === 1 ? player1Name : player2Name);
        nameElement.childNodes[0].nodeValue = original;
        inputElement.style.display = 'none';
    }
} 