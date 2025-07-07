(function () {
    'use strict';
    if (!window.Network || !window.Network.socket) return;
    const socket = window.Network.socket;
    socket.on('state:update', (payload) => {
        if (payload.event === 'car') {
            const d = payload.state;
            if (window.player2) {
                Object.assign(window.player2, d);
            }
        }
    });

    function sendState() {
        if (window.player && window.Network.joinRoom && socket.connected) {
            const state = {
                x: window.player.x,
                y: window.player.y,
                vx: window.player.vx,
                vy: window.player.vy,
                heading: window.player.heading,
            };
            socket.emit('state:update', {
                event: 'car',
                state,
                roomId: window.Network.socket.rooms ? Array.from(socket.rooms)[1] : undefined
            });
        }
    }

    setInterval(sendState, 50);
})();
