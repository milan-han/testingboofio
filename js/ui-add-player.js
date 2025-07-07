(function () {
    "use strict";

    console.log("ui-add-player loaded");

    document.addEventListener("DOMContentLoaded", () => {
        const addBtn = document.getElementById("invite-player-btn");
        const popup = document.getElementById("invite-popup");
        if (!addBtn || !popup) return;

        // Change label to ADD PLAYER
        addBtn.textContent = "ADD PLAYER";

        // Ensure popup is styled as pop-over (remove overlay click-to-dismiss behaviour)
        popup.classList.add("popover"); // CSS adjustment (requires CSS tweak if desired)
        // Hide overlay background if any
        // popup.classList.remove("popup-overlay");

        // Clicking the add player button toggles popup visibility
        addBtn.addEventListener("click", (e) => {
            e.stopImmediatePropagation();
            popup.classList.toggle("hidden");
            if (!popup.classList.contains("popup-overlay")) {
                const rect = addBtn.getBoundingClientRect();
                popup.style.left = rect.left + "px";
                popup.style.top = rect.bottom + 6 + "px";
            }
        });

        // Close if clicking outside
        document.addEventListener("click", (evt) => {
            if (!popup.classList.contains("hidden") && !popup.contains(evt.target) && evt.target !== addBtn) {
                popup.classList.add("hidden");
            }
        });

        // Map options
        popup.querySelectorAll(".popup-option").forEach((opt) => {
            opt.addEventListener("click", (e) => {
                e.stopImmediatePropagation();
                popup.classList.add("hidden");
                handleOption(opt.textContent.trim().toUpperCase());
            });
        });

        // Hide default close button in pop-over mode
        const closeBtn = document.getElementById("popup-close-btn");
        if (closeBtn) closeBtn.style.display = "none";

        // Subscribe to mode changes to enable/disable NPC option
        if (typeof RoomState !== 'undefined') {
            RoomState.subscribe((evt, state) => {
                if (evt === 'mode_changed' || evt === 'init') {
                    const npcOption = Array.from(popup.querySelectorAll('.popup-option')).find(o => o.textContent.trim().toUpperCase() === 'NPC');
                    if (!npcOption) return;
                    if (state.mode === 'quickplay') {
                        npcOption.style.display = 'none';
                    } else {
                        npcOption.style.display = '';
                    }
                }
            });
        }
    });

    function handleOption(type) {
        console.log("AddPlayer Option", type);
        switch (type) {
            case "NPC":
                addNPC();
                break;
            case "LOCAL PLAYER":
                addLocal();
                break;
            case "COPY LINK":
                copyJoinLink();
                break;
            default:
                console.warn("Unknown option", type);
        }

        if (type !== "COPY LINK") {
            const stats = document.getElementById("player-stats-panel");
            const drivers = document.getElementById("drivers-panel");
            if (stats && drivers) {
                stats.classList.add("hidden");
                drivers.classList.remove("hidden");
            }
        }
    }

    function addNPC() {
        if (typeof RoomState !== 'undefined' && RoomState.mode === 'quickplay') {
            console.warn('Cannot add NPC in quickplay');
            return;
        }
        if (typeof RoomState === "undefined") return;
        const idx = RoomState.players.filter((p) => p.type === "npc").length + 1;
        RoomState.addPlayer({
            type: "npc",
            name: "NPC " + idx,
            color: randomColor(),
            team: 2,
        });
    }

    function addLocal() {
        if (typeof RoomState !== 'undefined' && RoomState.mode === 'quickplay' && RoomState.players.length >= 2) {
            console.warn('Quickplay limited to 2 drivers');
            return;
        }
        if (typeof RoomState === "undefined") return;
        const idx = RoomState.players.filter((p) => p.type === "local").length + 1;
        RoomState.addPlayer({
            type: "local",
            name: "PLAYER " + idx,
            color: idx === 1 ? "#c62828" : "#2962ff",
            team: idx % 2 === 0 ? 2 : 1,
        });
    }

    function copyJoinLink() {
        const url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                console.log("Link copied to clipboard");
            });
        } else {
            // Fallback prompt
            window.prompt("Copy link to clipboard:", url);
        }
    }

    function randomColor() {
        const palette = ["#c62828", "#2962ff", "#7b1fa2", "#f9a825", "#e91e63", "#212121"];
        return palette[Math.floor(Math.random() * palette.length)];
    }
})(); 