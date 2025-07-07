/* ================================
 *  Input Handling
 * ================================*/

// Input handling is now managed by globals.js

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

// Player name editing functionality
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