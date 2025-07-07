(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        if (typeof RoomState === "undefined") return;
        chatEl = document.getElementById("chatPanel");
        if (!chatEl) return;

        // Initial state
        updateChatVisibility(RoomState.getState());

        RoomState.subscribe((evt, state) => {
            updateChatVisibility(state);
        });
    });

    let chatEl;

    function updateChatVisibility(state) {
        if (!chatEl) return;
        const locals  = state.players.filter((p) => p.type === "local");
        const onlines = state.players.filter((p) => p.type === "online");
        const shouldHide = locals.length >= 2 && onlines.length === 0;
        chatEl.classList.toggle("hidden", shouldHide);
    }
})(); 