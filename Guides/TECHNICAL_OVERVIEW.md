# Technical Architecture Overview

```mermaid
flowchart TD
    subgraph Title-Screen
        UIPanels["Side Panels & Bottom Menu"]
        RoomState[("RoomState – global store")]
        UIAddPlayer["ui-add-player.js"]
        UIPlayerCards["ui-player-cards.js"]
        UIDriverMenu["ui-driver-menu.js"]
        UIChatToggle["ui-chat-toggle.js"]
    end

    subgraph Gameplay
        Globals["globals.js – core loop"]
        GameState["game-state.js"]
        CarJS("car.js")
        BallJS("ball.js")
        NPC_AI["npcUpdate()"]
    end

    % Relationships
    UIAddPlayer ----> RoomState
    UIDriverMenu ----> RoomState
    UIPlayerCards ----> RoomState
    UIChatToggle ----> RoomState
    RoomState -- subscribes --> UIDriverMenu
    RoomState -- subscribes --> UIPlayerCards
    RoomState -- subscribes --> UIChatToggle
    RoomState -- all_ready --> Globals
    Globals --> GameState
    Globals --> NPC_AI
```

## Key Points
1. **RoomState** (in `js/room-state.js`) is *the* source-of-truth for the lobby. All UI widgets only read/write via its API (`addPlayer`, `removePlayer`, `updatePlayer`, `markReady`, etc.).
2. Legacy gameplay code (`globals.js`, `game-state.js`, etc.) is largely *stateless* regarding multiplayer; it only consumes **snapshots** of `RoomState` right before kickoff.
3. New lobby code is loaded with plain `<script>` tags (non-module) for ease of integration. It attaches `RoomState` to `window` for compatibility with older logic.

---

## Implemented Flows

### Adding Drivers

| Action | File | Logic |
|--------|------|-------|
| **"ADD PLAYER" button** | `ui-add-player.js` | Shows pop-over with *NPC*, *Local Player*, *Copy Link*. |
| Add **Local** | → `RoomState.addPlayer({ type: 'local' })` | In Quickplay: limited to **≤ 2**. |
| Add **NPC** | → `RoomState.addPlayer({ type: 'npc' })` | Disabled in Quickplay. Random palette colour. |
| **Copy Link** | Copies `window.location.href` – placeholder for future online invite. |

### Player Cards & Chat Behaviour

* `ui-player-cards.js` renders up to two **local** cards (`#playerCard`, `#player2Card`).
  * 1 local → card shown bottom-right.
  * 2 locals (no online) → cards left/right; chat panel hidden.
  * 2 locals **+ online** → cards **stacked & compressed** bottom-right; chat shown.

### Driver Menu (Teams / Ready / Leave)

* `ui-driver-menu.js` mirrors `RoomState` into draggable *driver cards* inside the Game Menu.
* Drag-and-drop between **Team 1** & **Team 2** updates `player.team`.
* **NPC editing** – click a bot card → `prompt` for name & colour.
* **Ready indicator** – green border + ✔ overlay when `player.ready === true`.
* **LEAVE** button removes every player except the first local, then flips the UI back to Stats view.

### Press F to Play / Ready Up

In `globals.js`:

```js
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyF') onPressF();
});

function onPressF() {
  const hasOnline = RoomState.getState().players.some((p) => p.type === 'online');
  if (hasOnline) {
      // toggle ready for *all* locals on this machine
  } else {
      // immediate countdown for local/NPC games
  }
}
```
* When **all non-NPCs** are ready, `RoomState` fires `all_ready` → gameplay countdown starts.

### NPC Logic

* AI loop lives in `globals.js ➜ npcUpdate()` – executed each frame when `currentMode === 'npc'`.
* Difficulty (`npcLevel`) is set per-bot via the *card* editor or the legacy dropdown.
* NPC banter lines arrays (`npcScoredLines`, `playerScoredLines`, etc.) feed `npcSay()` which pushes chat messages.

### Social Panel & Friend Management

* `social-panel.js` powers the **Friends** panel seen on the title screen.
* Supports adding/removing friends, basic invite flow and status updates.
* Layout shifts when the add–friend dropdown expands.

### Mode Restrictions

| Condition | Enforced In | Behaviour |
|-----------|-------------|-----------|
| Quickplay room > 2 players | `room-state.js:addPlayer()` | Rejects addition. |
| Adding NPC in Quickplay | `room-state.js:addPlayer()` **and** UI gating | Rejects addition + hides "NPC" option. |
| Switching to Quickplay with > 2 humans | (TODO) | UI still allows; logic should gate. |

---

## Files of Interest (Cheat-sheet)

| Path | Responsibility |
|------|----------------|
| `js/room-state.js` | Central lobby store & pub/sub. |
| `js/ui-add-player.js` | Pop-over, "ADD PLAYER" flow, restrictions. |
| `js/ui-player-cards.js` | Bottom-right local cards + chat hide/show. |
| `js/ui-driver-menu.js` | Team assignment, ready decals, leave room. |
| `js/ui-chat-toggle.js` | Auto-hides chat for splitscreen locals. |
| `js/globals.js` | Massive legacy file: input handling, Press-F logic, NPC AI. |
| `js/social-panel.js` | Friends list UI, add/remove/invite logic. |
| `js/field.js` | Draws the field & preview canvas. |
| `js/game-state.js` | Runs countdown & transitions between `setup`/`playing`/`ended`. |

---

## Roadmap / Next Steps

1. **Real-time Multiplayer Layer**  
   • Replace in-memory `RoomState` with network-synchronised store (WebSocket or WebRTC).  
   • Implement peer-to-server quick-match queue (for Quickplay) & room link join.
2. **Refactor Gameplay Loop**  
   • Decouple `globals.js` monolith; move car/ball physics into ECS or at least separate modules.
3. **Sandbox Live Tweaks**  
   • Build UI sliders bound to `RoomState.sandbox` multipliers.  
   • Broadcast changes to all peers & hot-apply to in-progress matches.
4. **Responsive / Mobile**  
   • Audit SCSS for fixed pixel values; adopt rem/viewport units.
5. **Testing & Tooling**  
   • Add Vitest for unit tests (e.g., AI steering).  
   • ESLint + Prettier config to stabilise code style.
6. **Accessibility & UX**  
   • Keyboard trap for pop-overs, ARIA labels on draggable driver cards.

---

## Navigation Tips for Developers

* **Search pattern**: UI files all start with `ui-*`. Gameplay core is under plain filenames (`car.js`, `ball.js`, etc.).
* **Global variables** in `globals.js` still leak; when adding new features **prefer RoomState → subscribe pattern**.
* **Hot-reloading**: project uses **Vite** (see `vite.config.js`). Run `npm run dev` to start local server with HMR.
* **Sass**: Entry point `scss/main.scss` compiles via the Vite plugin – use variables in `base/_variables.scss`.
* **Chrome DevTools grid/flex overlay** is invaluable for inspecting the complex layout. Toggle via `⌥-⌘-C → Layout`.

---

*Happy hacking!* 🏎️⚽️ 