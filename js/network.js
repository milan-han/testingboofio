(function (global) {
    'use strict';

    if (!global.io) {
        console.warn('socket.io client not found; multiplayer disabled');
        return;
    }

    const socket = global.io({ autoConnect: true });
    let currentRoom = null;
    let lastPing = 0;

    function emitUpdate(event, state) {
        if (!currentRoom) return;
        socket.emit('state:update', { event, state, roomId: currentRoom });
    }

    function joinQuickplay() {
        socket.emit('quickplay:join');
    }

    function joinRoom(roomId) {
        currentRoom = roomId;
        socket.emit('room:join', roomId);
    }

    function reconnect() {
        if (currentRoom) {
            socket.connect();
            socket.emit('room:join', currentRoom);
        }
    }

    socket.on('room:joined', ({ roomId }) => {
        currentRoom = roomId;
    });

    socket.on('player:left', () => {
        // future: handle removal from local state
    });

    socket.on('state:update', (payload) => {
        const RoomState = global.RoomState;
        if (!RoomState || typeof RoomState._applyState !== 'function') return;
        RoomState._applyState(payload.state);
    });

    socket.on('pong', () => {
        const latency = Date.now() - lastPing;
        global.Network.latency = latency;
    });

    if (global.RoomState && global.RoomState.subscribe) {
        global.RoomState.subscribe(emitUpdate);
    }

    // simple heartbeat to measure latency
    setInterval(() => {
        if (socket.connected) {
            lastPing = Date.now();
            socket.emit('ping');
        }
    }, 2000);

    global.Network = { socket, joinQuickplay, joinRoom, reconnect };
})(window);
