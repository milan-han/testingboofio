(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('room');
        if (roomId && window.Network && typeof window.Network.joinRoom === 'function') {
            if (window.RoomState && window.RoomState.setMode) {
                window.RoomState.setMode('custom');
            }
            window.Network.joinRoom(roomId);
        }
    });
})();
