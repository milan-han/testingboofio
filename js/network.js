(function (global) {
    'use strict';

    if (!global.io) {
        console.warn('socket.io client not found; multiplayer disabled');
        return;
    }

    const socket = global.io();

    function emitUpdate(event, state) {
        socket.emit('room:update', { event, state });
    }

    socket.on('room:update', (payload) => {
        const RoomState = global.RoomState;
        if (!RoomState || typeof RoomState._applyState !== 'function') return;
        RoomState._applyState(payload.state);
    });

    if (global.RoomState && global.RoomState.subscribe) {
        global.RoomState.subscribe(emitUpdate);
    }

    global.Network = { socket };
})(window);
