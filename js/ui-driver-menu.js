(function () {
    "use strict";

    // Inject minimal CSS for ready indicator once
    if (!document.getElementById("readyCardStyle")) {
        const style = document.createElement("style");
        style.id = "readyCardStyle";
        style.textContent = `.driver-card.ready { border: 2px solid #4caf50; position: relative; }
        .driver-card.ready::after { content: '✔'; position: absolute; right: 4px; top: 2px; font-size: 8px; color: #4caf50; }`;
        document.head.appendChild(style);
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (typeof RoomState === "undefined") return;

        const team1Zone = document.getElementById("team1-zone");
        const team2Zone = document.getElementById("team2-zone");
        if (!team1Zone || !team2Zone) return;

        const leaveBtnContainer = document.querySelector(".drivers-title");
        let leaveBtn = document.getElementById("leaveRoomBtn");
        if (!leaveBtn) {
            leaveBtn = document.createElement("button");
            leaveBtn.id = "leaveRoomBtn";
            leaveBtn.textContent = "LEAVE";
            leaveBtn.style.float = "right";
            leaveBtn.style.fontSize = "6px";
            leaveBtn.style.marginLeft = "8px";
            leaveBtn.addEventListener("click", () => {
                // Remove all online players and second local
                const me = RoomState.players.find(p => p.type === "local");
                const idsToRemove = RoomState.players.filter(p => p !== me).map(p=>p.id);
                idsToRemove.forEach(id=>RoomState.removePlayer(id));

                // Switch panels back
                const stats = document.getElementById("player-stats-panel");
                const drivers = document.getElementById("drivers-panel");
                if (stats && drivers) {
                    stats.classList.remove("hidden");
                    drivers.classList.add("hidden");
                }
            });
            if (leaveBtnContainer) leaveBtnContainer.appendChild(leaveBtn);
        }

        // Render initial
        render();

        RoomState.subscribe(() => {
            render();
        });

        /* ------- helpers ------- */
        function render() {
            const state = RoomState.getState();
            // Clear zones
            team1Zone.innerHTML = "";
            team2Zone.innerHTML = "";
            state.players.forEach((p) => {
                const card = document.createElement("div");
                card.className = "driver-card";
                card.dataset.driverId = p.id;
                card.textContent = p.name.toUpperCase();
                if (p.ready) {
                    card.classList.add("ready");
                } else {
                    card.classList.remove("ready");
                }
                if (p.type === "npc") {
                    card.style.color = p.color;
                    card.addEventListener("click", () => openNpcEditor(p.id));
                }
                const zone = p.team === 2 ? team2Zone : team1Zone;
                zone.appendChild(card);
                card.draggable = true;
                card.addEventListener("dragstart", evt => {
                    evt.dataTransfer.setData("playerId", p.id);
                });
                card.addEventListener("mouseenter", () => showTooltip(card, p));
                card.addEventListener("mouseleave", hideTooltip);
            });
        }

        function openNpcEditor(id) {
            const npc = RoomState.getState().players.find((pl) => pl.id === id);
            if (!npc) return;
            const newName = window.prompt("NPC Name", npc.name);
            if (newName === null) return; // cancelled
            const newColor = window.prompt("NPC Color (hex)", npc.color);
            if (newColor === null) return;
            RoomState.updatePlayer(id, { name: newName, color: newColor });
        }

        // Inside document.addEventListener callback after variable declarations add DnD zone listeners
        team1Zone.addEventListener("dragover", e => e.preventDefault());
        team2Zone.addEventListener("dragover", e => e.preventDefault());
        team1Zone.addEventListener("drop", e => handleDrop(e, 1));
        team2Zone.addEventListener("drop", e => handleDrop(e, 2));

        function handleDrop(e, teamNum) {
            e.preventDefault();
            const id = e.dataTransfer.getData("playerId");
            if (!id) return;
            RoomState.updatePlayer(id, { team: teamNum });
        }

        function getTooltipEl() {
            let tip = document.getElementById("driverTooltip");
            if (!tip) {
                tip = document.createElement("div");
                tip.id = "driverTooltip";
                tip.style.position = "fixed";
                tip.style.background = "#111418";
                tip.style.border = "2px solid #666";
                tip.style.color = "#fff";
                tip.style.fontSize = "10px";
                tip.style.fontFamily = "'Press Start 2P', monospace";
                tip.style.padding = "4px 6px";
                tip.style.zIndex = 200;
                tip.style.pointerEvents = "none";
                tip.style.display = "none";
                document.body.appendChild(tip);
            }
            return tip;
        }

        function showTooltip(card, player) {
            const tip = getTooltipEl();
            let html = "";
            if (player.type === "npc") {
                html = `<strong>${player.name}</strong><br>Color: ${player.color}`;
            } else {
                html = `<strong>${player.username || 'Guest'}</strong><br>Wins: 0`;
            }
            tip.innerHTML = html;
            const rect = card.getBoundingClientRect();
            tip.style.left = rect.left + "px";
            tip.style.top = rect.top - rect.height - 8 + "px";
            tip.style.display = "block";
        }

        function hideTooltip() {
            const tip = getTooltipEl();
            tip.style.display = "none";
        }
    });
})(); 