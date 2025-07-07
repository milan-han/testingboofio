/* =====================================
 *  RoomState – central room management
 * =====================================
 * Provides a single source of truth for anything the lobby/game title screen
 * needs to know about the current room (players, mode, ready states, sandbox
 * settings…).  Other modules can subscribe to changes via RoomState.subscribe().
 *
 *  NOTE: This file is loaded as a normal <script> tag (non-module).
 *        It attaches RoomState onto window so legacy code can access it until
 *        we refactor other parts of the codebase.
 *
 *  Usage Example:
 *    // Add the local user as first player
 *    const me = RoomState.addPlayer({ type: 'local', name: 'PLAYER 1', color: '#c62828' });
 *
 *    // Listen for any changes
 *    const unsubscribe = RoomState.subscribe((event, state) => {
 *        console.log(event, state);
 *    });
 *
 *    // Mark the local player ready
 *    RoomState.markReady(me.id, true);
 *    // Later… unsubscribe();
 * =====================================*/

(function (global) {
    "use strict";

    /**
     * Generates a short unique id (good enough for client-side use).
     */
    function uid() {
        return (
            Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
        );
    }

    /* ---------- Internal state ---------- */
    const _subscribers = [];

    const _state = {
        // players: max 4 entries
        // { id, type: 'local'|'online'|'npc', name, username, color, team (1|2), ready }
        players: [],

        // 'quickplay' | 'custom' | 'sandbox' (default custom)
        mode: 'custom',

        // Game rules / lobby settings (extend as needed)
        settings: {
            gameType: 'points',      // 'points' | 'timed'
            pointsToWin: 5,
            matchTimeMinutes: 5,
        },

        // Sandbox tweaks (all multipliers are 1.0 by default)
        sandbox: {
            carSpeed: 1,
            carSize: 1,
            ballSize: 1,
            goalSize: 1,
        },
    };

    /* ---------- Utility helpers ---------- */
    function _notify(event) {
        const snapshot = RoomState.getState(); // shallow clone for safety
        _subscribers.forEach((fn) => {
            try { fn(event, snapshot); } catch (err) { console.error(err); }
        });
    }

    function _findPlayer(id) {
        return _state.players.find((p) => p.id === id);
    }

    /* ---------- Public API ---------- */
    const RoomState = {
        /* ===== Subscriptions ===== */
        subscribe(fn) {
            if (typeof fn !== 'function') return () => {};
            _subscribers.push(fn);
            // Return unsubscribe handle
            return () => {
                const idx = _subscribers.indexOf(fn);
                if (idx !== -1) _subscribers.splice(idx, 1);
            };
        },

        /* ===== Immutable snapshot ===== */
        getState() {
            // Return a deep clone that callers are unable to mutate.
            // Simple structuredClone polyfill for older browsers.
            if (typeof structuredClone === 'function') {
                return structuredClone(_state);
            }
            return JSON.parse(JSON.stringify(_state));
        },

        /* ===== Player management ===== */
        /** Adds a player; returns the new player object (snapshot copy). */
        addPlayer({
            type = 'local', // 'local' | 'online' | 'npc'
            name = 'PLAYER',
            username = 'Guest',
            color = '#c62828',
            team = 1,
        } = {}) {
            if (_state.mode === 'quickplay') {
                // In quickplay only 2 players max and no NPCs
                if (type === 'npc') {
                    console.warn('NPCs are not allowed in quickplay');
                    return null;
                }
                if (_state.players.length >= 2) {
                    console.warn('Quickplay is limited to 2 players');
                    return null;
                }
            }
            if (_state.players.length >= 4) {
                console.warn('Room is full – cannot add more players');
                return null;
            }
            const id = uid();
            const player = {
                id,
                type,
                name,
                username,
                color,
                team: team === 2 ? 2 : 1,
                ready: false,
            };
            _state.players.push(player);
            _notify('player_added');
            return RoomState.getState().players.find((p) => p.id === id);
        },

        /** Removes player by id. */
        removePlayer(id) {
            const idx = _state.players.findIndex((p) => p.id === id);
            if (idx === -1) return;
            _state.players.splice(idx, 1);
            _notify('player_removed');
        },

        /** Updates player properties. */
        updatePlayer(id, updates = {}) {
            const p = _findPlayer(id);
            if (!p) return;
            Object.assign(p, updates);
            _notify('player_updated');
        },

        /** Marks ready/unready for a player. */
        markReady(id, ready = true) {
            const p = _findPlayer(id);
            if (!p) return;
            p.ready = !!ready;
            _notify('player_ready');
            // If every non-NPC player is ready, fire all_ready
            const humanPlayers = _state.players.filter((pl) => pl.type !== 'npc');
            if (
                humanPlayers.length > 0 &&
                humanPlayers.every((pl) => pl.ready)
            ) {
                _notify('all_ready');
            }
        },

        /* ===== Mode & settings ===== */
        setMode(mode) {
            if (!['quickplay', 'custom', 'sandbox'].includes(mode)) {
                console.warn('Invalid mode', mode);
                return;
            }
            // Prevent switching to quickplay if >2 human (non-NPC) players are already in the room
            if (mode === 'quickplay') {
                const humanPlayers = _state.players.filter((pl) => pl.type !== 'npc');
                if (humanPlayers.length > 2) {
                    console.warn('Cannot switch to quickplay with more than 2 human players');
                    return;
                }
            }
            _state.mode = mode;
            _notify('mode_changed');
        },

        setSettings(newSettings = {}) {
            Object.assign(_state.settings, newSettings);
            _notify('settings_changed');
        },

        setSandbox(newSandbox = {}) {
            Object.assign(_state.sandbox, newSandbox);
            _notify('sandbox_updated');
        },

        /** Replace entire state from network */
        _applyState(snapshot = {}) {
            _state.players = Array.isArray(snapshot.players)
                ? snapshot.players.slice(0, 4)
                : [];
            _state.mode = snapshot.mode || _state.mode;
            Object.assign(_state.settings, snapshot.settings || {});
            Object.assign(_state.sandbox, snapshot.sandbox || {});
            _notify('state_synced');
        },

        /* ===== Convenience helpers ===== */
        get players() {
            return RoomState.getState().players;
        },

        get mode() {
            return _state.mode;
        },

        isRoomFull() {
            return _state.players.length >= 4;
        },
    };

    // Expose globally
    global.RoomState = RoomState;
})(window); 