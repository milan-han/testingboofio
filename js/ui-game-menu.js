(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // Element References
        const quickplayBtn = document.getElementById('quickplay-btn');
        const customplayBtn = document.getElementById('customplay-btn');
        const sandboxPanel = document.getElementById('sandbox-panel');
        const quickplayOptions = document.getElementById('quickplay-options');
        const customplayOptions = document.getElementById('customplay-options');

        const invitePlayerBtn = document.getElementById('invite-player-btn');
        const invitePopup = document.getElementById('invite-popup');
        const popupCloseBtn = document.getElementById('popup-close-btn');
        const popupOptions = invitePopup ? invitePopup.querySelectorAll('.popup-option') : [];

        const playerStatsPanel = document.getElementById('player-stats-panel');
        const driversPanel = document.getElementById('drivers-panel');
        const startButton = document.querySelector('.panel-start');

        // Current menu state
        let currentMenuMode = 'quickplay'; // 'quickplay' or 'customplay'
        let hasPlayer2 = false;

        // Toggle between Quick Play and Custom Play
        quickplayBtn && quickplayBtn.addEventListener('click', () => {
            currentMenuMode = 'quickplay';
            quickplayBtn.classList.add('active');
            customplayBtn.classList.remove('active');
            sandboxPanel.classList.add('hidden');
            quickplayOptions.classList.remove('hidden');
            customplayOptions.classList.add('hidden');

            // Set global currentMode based on whether we have a player 2
            if (hasPlayer2) {
                window.currentMode = 'npc'; // Local mode
            } else {
                window.currentMode = 'matchmaking'; // Online mode
            }

            updateStartButton();
        });

        customplayBtn && customplayBtn.addEventListener('click', () => {
            currentMenuMode = 'customplay';
            customplayBtn.classList.add('active');
            quickplayBtn.classList.remove('active');
            sandboxPanel.classList.remove('hidden');
            quickplayOptions.classList.add('hidden');
            customplayOptions.classList.remove('hidden');

            // Always local mode for custom play
            window.currentMode = 'npc';
            updateStartButton();
        });

        // Invite Player Flow
        invitePlayerBtn && invitePlayerBtn.addEventListener('click', () => {
            invitePopup.classList.remove('hidden');
        });

        popupCloseBtn && popupCloseBtn.addEventListener('click', () => {
            invitePopup.classList.add('hidden');
        });

        invitePopup && invitePopup.addEventListener('click', (e) => {
            if (e.target === invitePopup) {
                invitePopup.classList.add('hidden');
            }
        });

        popupOptions && popupOptions.forEach(option => {
            option.addEventListener('click', () => {
                const optionType = option.textContent.trim();
                invitePopup.classList.add('hidden');

                // Add player 2 based on selection
                hasPlayer2 = true;
                playerStatsPanel && playerStatsPanel.classList.add('hidden');
                driversPanel && driversPanel.classList.remove('hidden');

                // Add new driver to team system
                if (typeof addNewDriverToTeam === 'function') {
                    addNewDriverToTeam(optionType);
                }

                // Show player 2 card
                const player2Card = document.getElementById('player2Card');
                if (player2Card) {
                    player2Card.classList.remove('hidden');
                    // Set up player 2 based on selection
                    if (typeof setPlayer2Type === 'function') {
                        if (optionType === 'NPC') {
                            setPlayer2Type('npc');
                        } else {
                            setPlayer2Type('human');
                        }
                    }
                }

                // Update global mode
                window.currentMode = 'npc';

                // Enable local mode layout
                document.body.classList.add('local-mode');

                // Initialize player 2 if needed
                if (typeof initializePlayer2Card === 'function') {
                    initializePlayer2Card();
                }

                updateStartButton();
            });
        });

        // Handle button group clicks (for active states)
        function handleButtonGroup(containerSelector, buttonSelector) {
            const container = document.querySelector(containerSelector);
            if (container) {
                container.addEventListener('click', (e) => {
                    const button = e.target.closest(buttonSelector);
                    if (button) {
                        // Handle type switching specially
                        if (button.dataset.type) {
                            const typeButtons = container.querySelectorAll('[data-type]');
                            typeButtons.forEach(btn => btn.classList.remove('active'));
                            button.classList.add('active');

                            // Show/hide appropriate options
                            const timeOptions = document.getElementById('time-options');
                            const pointsOptions = document.getElementById('points-options');

                            if (button.dataset.type === 'timed') {
                                timeOptions.classList.remove('hidden');
                                pointsOptions.classList.add('hidden');
                            } else {
                                timeOptions.classList.add('hidden');
                                pointsOptions.classList.remove('hidden');
                            }
                        } else {
                            // Handle normal button groups
                            const buttons = container.querySelectorAll(buttonSelector);
                            buttons.forEach(btn => btn.classList.remove('active'));
                            button.classList.add('active');
                        }

                        // Handle game settings
                        if (containerSelector === '#customplay-options') {
                            updateGameSettings();
                        }
                    }
                });
            }
        }

        handleButtonGroup('#quickplay-options', '.mode-btn');
        handleButtonGroup('#customplay-options', '.option-btn');

        // Update start button text based on mode
        function updateStartButton() {
            if (startButton) {
                startButton.textContent = 'PRESS F TO PLAY';
            }
        }

        // Update game settings based on custom play options
        function updateGameSettings() {
            const activeTypeBtn = document.querySelector('#customplay-options [data-type].active');

            if (activeTypeBtn) {
                window.gameType = activeTypeBtn.dataset.type;
            }

            if (window.gameType === 'timed') {
                const activeTimeBtn = document.querySelector('#time-options .option-btn.active');
                if (activeTimeBtn && activeTimeBtn.dataset.time) {
                    window.matchTimeMinutes = parseInt(activeTimeBtn.dataset.time);
                }
            } else if (window.gameType === 'points') {
                const activePointsBtn = document.querySelector('#points-options .option-btn.active');
                if (activePointsBtn && activePointsBtn.dataset.points) {
                    window.pointsToWin = parseInt(activePointsBtn.dataset.points);
                }
            }
        }

        // Enhanced start button functionality
        startButton && startButton.addEventListener('click', (e) => {
            e.preventDefault();
            startActualGame();
        });

        // Start the actual game
        function startActualGame() {
            updateGameSettings();
            const menu = document.getElementById('gameMenuContainer');
            if (menu) menu.classList.add('hidden');
            if (typeof initiateCountdown === 'function') {
                initiateCountdown();
            }
        }

        // Initialize
        updateStartButton();
        initializeDragAndDrop();
    });

    // Drag and Drop Team Selection System
    function initializeDragAndDrop() {
        const driverCards = document.querySelectorAll('.driver-card');
        const dropZones = document.querySelectorAll('.team-dropzone');

        // Add drag event listeners to all driver cards
        driverCards.forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        // Add drop event listeners to all drop zones
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('drop', handleDrop);
            zone.addEventListener('dragenter', handleDragEnter);
            zone.addEventListener('dragleave', handleDragLeave);
        });
    }

    let draggedElement = null;

    function handleDragStart(e) {
        draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e) {
        e.preventDefault();
        let dropzone = e.target;
        if (!dropzone.classList.contains('team-dropzone')) {
            dropzone = dropzone.closest('.team-dropzone');
        }
        if (dropzone) {
            dropzone.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        let dropzone = e.target;
        if (!dropzone.classList.contains('team-dropzone')) {
            dropzone = dropzone.closest('.team-dropzone');
        }
        if (dropzone) {
            dropzone.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        let dropzone = e.target;
        if (!dropzone.classList.contains('team-dropzone')) {
            dropzone = dropzone.closest('.team-dropzone');
        }
        if (dropzone) {
            dropzone.classList.remove('drag-over');
            if (draggedElement && dropzone.classList.contains('team-dropzone')) {
                const newCard = draggedElement.cloneNode(true);
                dropzone.appendChild(newCard);
                draggedElement.remove();
                newCard.addEventListener('dragstart', handleDragStart);
                newCard.addEventListener('dragend', handleDragEnd);
                updateTeamAssignments();
            }
        }
    }

    function updateTeamAssignments() {
        const team1Zone = document.getElementById('team1-zone');
        const team2Zone = document.getElementById('team2-zone');
        const team1Players = Array.from(team1Zone.querySelectorAll('.driver-card')).map(card => card.dataset.driver);
        const team2Players = Array.from(team2Zone.querySelectorAll('.driver-card')).map(card => card.dataset.driver);
        console.log('Team 1:', team1Players);
        console.log('Team 2:', team2Players);
    }

    function addNewDriverToTeam(playerType) {
        const team2Zone = document.getElementById('team2-zone');
        const driverCount = document.querySelectorAll('.driver-card').length;
        let driverName = 'PLAYER ' + (driverCount + 1);
        let driverKey = 'player' + (driverCount + 1);
        if (playerType === 'NPC') {
            driverName = 'NPC ' + (driverCount);
            driverKey = 'npc' + (driverCount);
        } else if (playerType === 'LOCAL PLAYER') {
            driverName = 'LOCAL ' + (driverCount);
            driverKey = 'local' + (driverCount);
        } else if (playerType === 'ONLINE PLAYER') {
            driverName = 'ONLINE ' + (driverCount);
            driverKey = 'online' + (driverCount);
        }
        const newDriverCard = document.createElement('div');
        newDriverCard.className = 'driver-card';
        newDriverCard.draggable = true;
        newDriverCard.dataset.driver = driverKey;
        newDriverCard.textContent = driverName;
        team2Zone.appendChild(newDriverCard);
        newDriverCard.addEventListener('dragstart', handleDragStart);
        newDriverCard.addEventListener('dragend', handleDragEnd);
        updateTeamAssignments();
    }
})();
