(function () {
    "use strict";

    // Wait until DOM & RoomState are ready
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof RoomState === "undefined") {
            console.error("RoomState not found – ui-player-cards.js requires it");
            return;
        }

        // Hide template cards on load – they will be shown as players are added
        ["playerCard", "player2Card"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });

        // Ensure the first local player exists so the UI isn't empty
        if (RoomState.players.length === 0) {
            RoomState.addPlayer({ type: "local", name: "PLAYER 1", color: "#c62828" });
        }

        // Subscribe to RoomState changes
        const unsubscribe = RoomState.subscribe(handleRoomChange);
        // Initial paint
        handleRoomChange("init", RoomState.getState());
    });

    /**
     * Responds to any RoomState update.
     */
    function handleRoomChange(eventName, state) {
        const localPlayers = state.players.filter((p) => p.type === "local");
        const hasOnline = state.players.some((p) => p.type === "online");

        const card1 = document.getElementById("playerCard");
        const card2 = document.getElementById("player2Card");
        if (!card1 || !card2) return;

        resetCardStyles(card1);
        resetCardStyles(card2);

        // ----- Show/Hide based on # of local players -----
        if (localPlayers.length === 0) {
            card1.classList.add("hidden");
            card2.classList.add("hidden");
            document.body.classList.remove("local-mode");
            return;
        }

        // At least one local player → show first card
        populateCard(card1, localPlayers[0]);
        card1.classList.remove("hidden");

        if (localPlayers.length === 1) {
            // Single-player setup
            card2.classList.add("hidden");
            document.body.classList.remove("local-mode");
            return;
        }

        // Two local players – show second card
        populateCard(card2, localPlayers[1]);
        card2.classList.remove("hidden");

        if (hasOnline) {
            // Need to compress/stack both cards in the same area (bottom-right)
            compressAndStack(card1, card2);
        } else {
            // Pure local two-player mode – spread cards left/right via CSS helper
            document.body.classList.add("local-mode");
        }
    }

    /** Resets inline styles & classes applied by this module. */
    function resetCardStyles(card) {
        card.style.height = "";
        card.style.bottom = "20px";
        card.classList.remove("stacked");
    }

    /** Updates card header name (color updates handled elsewhere for now). */
    function populateCard(card, player) {
        if (!card || !player) return;
        const header = card.querySelector(".player-card-header");
        if (header) {
            // Replace text node (keep inner elements like input)
            // Approach: set firstChild.nodeValue when firstChild is text
            if (header.firstChild && header.firstChild.nodeType === Node.TEXT_NODE) {
                header.firstChild.nodeValue = player.name.toUpperCase() + " ";
            } else {
                header.textContent = player.name.toUpperCase();
            }
        }

        // Toggle ready visual class
        if (player.ready) card.classList.add("ready"); else card.classList.remove("ready");
    }

    /**
     * Compresses two cards vertically and stacks them in the bottom-right corner.
     */
    function compressAndStack(topCard, bottomCard) {
        const fullH = 420; // original height from SCSS
        const compressedH = Math.round(fullH / 2);

        [topCard, bottomCard].forEach((c) => c.classList.add("stacked"));

        topCard.style.height = compressedH + "px";
        bottomCard.style.height = compressedH + "px";

        // Bottom card remains at bottom:20px (already set), top card sits just above it
        topCard.style.bottom = compressedH + 40 + "px"; // include card gap (20px)

        // Ensure both cards are right-aligned (remove left offset if local-mode was active)
        topCard.style.left = "";
        bottomCard.style.left = "";
        topCard.style.right = "20px";
        bottomCard.style.right = "20px";

        document.body.classList.remove("local-mode");
    }

    // CSS for ready badge in player cards
    if (!document.getElementById("readyPlayerCardStyle")) {
        const style = document.createElement("style");
        style.id = "readyPlayerCardStyle";
        style.textContent = `.player-card.ready .player-card-header::after { content: 'READY'; font-size: 8px; color: #4caf50; margin-left: 6px; }`;
        document.head.appendChild(style);
    }
})(); 