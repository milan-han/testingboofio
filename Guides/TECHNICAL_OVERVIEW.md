# Technical Architecture Overview

```mermaid
flowchart TD
    subgraph Title-Screen
        UIPanels["Side Panels & Bottom Menu"]
        RoomState[("RoomState – lobby store")]
        UIAddPlayer["ui-add-player.js"]
        UIPlayerCards["ui-player-cards.js"]
        UIDriverMenu["ui-driver-menu.js"]
        UIChatToggle["ui-chat-toggle.js"]
    end

    subgraph Core-System
        GameStore[("GameStore – state management")]
        CanvasRenderer["CanvasRenderer – scaling"]
        MatchController["MatchController – game flow"]
        PlayerManager["PlayerManager – player logic"]
        NPCAI["NPCAI – bot behavior"]
        ChatUtils["ChatUtils – messaging"]
        Helpers["Helpers – utilities"]
    end

    subgraph Gameplay
        Globals["globals.js – compatibility layer"]
        GameState["game-state.js"]
        CarJS("car.js")
        BallJS("ball.js")
    end

    % Relationships
    UIAddPlayer ----> RoomState
    UIDriverMenu ----> RoomState
    UIPlayerCards ----> RoomState
    UIChatToggle ----> RoomState
    RoomState -- subscribes --> UIDriverMenu
    RoomState -- subscribes --> UIPlayerCards
    RoomState -- subscribes --> UIChatToggle
    RoomState -- all_ready --> MatchController
    
    % Core system relationships
    MatchController --> GameStore
    PlayerManager --> GameStore
    NPCAI --> GameStore
    MatchController --> CanvasRenderer
    ChatUtils --> Helpers
    
    % Legacy integration
    Globals --> GameStore
    Globals --> MatchController
    Globals --> PlayerManager
    Globals --> NPCAI
    Globals --> ChatUtils
    GameState --> GameStore
    CarJS --> GameStore
    BallJS --> GameStore
```

## Key Points

### 2024 Modular Refactor
1. **GameStore** (in `js/core/game-store.js`) is *the* source-of-truth for game state. All game variables now flow through this centralized store with a subscribe pattern.
2. **Modular Architecture** – The 1400+ line `globals.js` monolith has been decomposed into focused modules under `js/core/`, `js/ui/`, and `js/utils/`.
3. **Backward Compatibility** – The refactored `globals.js` provides a compatibility layer using property getters/setters that delegate to the new modules.
4. **Subscribe Pattern** – Components can subscribe to specific state changes (e.g., `gameStore.subscribe('scoreP1', callback)`) for reactive updates.

### Lobby System
1. **RoomState** (in `js/room-state.js`) handles lobby/multiplayer state. All UI widgets read/write via its API (`addPlayer`, `removePlayer`, `updatePlayer`, `markReady`, etc.).
2. **State Separation** – Game state (scores, celebration, etc.) lives in `GameStore`. Lobby state (players, teams, ready status) lives in `RoomState`.
3. **Module Loading** – All code is loaded with plain `<script>` tags (non-module) for maximum compatibility. Dependencies are loaded in order in `index.html`.

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

### Core System (New Modular Architecture)
| Path | Responsibility |
|------|----------------|
| `js/core/game-store.js` | Centralized state management with subscribe pattern. |
| `js/core/canvas-renderer.js` | Canvas setup, responsive scaling, zoom controls. |
| `js/core/match-controller.js` | Game flow: countdown, start, pause, win conditions. |
| `js/core/player-manager.js` | Player management, color selection, name editing, settings. |
| `js/core/npc-ai.js` | NPC behavior, difficulty levels, dialogue system. |
| `js/ui/chat-utils.js` | Chat message handling, styling, player color integration. |
| `js/utils/helpers.js` | Utility functions: color manipulation, drawing helpers. |

### UI & Lobby System
| Path | Responsibility |
|------|----------------|
| `js/room-state.js` | Central lobby store & pub/sub for multiplayer. |
| `js/ui-add-player.js` | Pop-over, "ADD PLAYER" flow, restrictions. |
| `js/ui-player-cards.js` | Bottom-right local cards + chat hide/show. |
| `js/ui-driver-menu.js` | Team assignment, ready decals, leave room. |
| `js/ui-chat-toggle.js` | Auto-hides chat for splitscreen locals. |
| `js/social-panel.js` | Friends list UI, add/remove/invite logic. |

### Legacy Files (Refactored)
| Path | Responsibility |
|------|----------------|
| `js/globals.js` | Compatibility layer + essential utilities (refactored from 1400+ lines). |
| `js/game-state.js` | Runs countdown & transitions between `setup`/`playing`/`ended`. |
| `js/field.js` | Draws the field & preview canvas. |

---

## Roadmap / Next Steps

### ✅ Completed (2024 Refactor)
1. **Modular Architecture** ✅  
   • Successfully decomposed 1400+ line `globals.js` monolith into focused modules.
   • Implemented centralized `GameStore` with subscribe pattern.
   • Created compatibility layer for seamless backward compatibility.
2. **Testing Foundation** ✅  
   • Added Vitest unit testing framework.
   • Created test structure for new modules.

### 🔄 In Progress / Next Steps
1. **Real-time Multiplayer Layer**  
   • Replace in-memory `RoomState` with network-synchronised store (WebSocket or WebRTC).  
   • Implement peer-to-server quick-match queue (for Quickplay) & room link join.
2. **Complete Module Migration**  
   • Migrate remaining UI functions (drawPlayerCard, etc.) to dedicated modules.
   • Refactor car/ball physics to use GameStore directly.
3. **Enhanced Testing**  
   • Expand unit test coverage for all new modules.
   • Add integration tests for state management flows.
4. **Sandbox Live Tweaks**  
   • Build UI sliders bound to `RoomState.sandbox` multipliers.  
   • Broadcast changes to all peers & hot-apply to in-progress matches.
5. **Responsive / Mobile**  
   • Audit SCSS for fixed pixel values; adopt rem/viewport units.
6. **Code Quality**  
   • ESLint + Prettier config to stabilise code style.
   • Performance optimization using the new modular structure.
7. **Accessibility & UX**  
   • Keyboard trap for pop-overs, ARIA labels on draggable driver cards.

---

## Navigation Tips for Developers

### File Organization (Post-Refactor)
* **Core modules**: `js/core/*` contains the main game logic (state, rendering, match flow, players, AI).
* **UI utilities**: `js/ui/*` contains reusable UI components and utilities.
* **Shared helpers**: `js/utils/*` contains utility functions used across the codebase.
* **Legacy files**: UI files start with `ui-*`. Core gameplay is in `car.js`, `ball.js`, etc.

### State Management
* **Game state**: Use `GameStore.get()` and `GameStore.set()` for all game variables. Subscribe to changes with `GameStore.subscribe()`.
* **Lobby state**: Use `RoomState` API for multiplayer/lobby functionality.
* **Avoid global variables**: The compatibility layer in `globals.js` redirects to modules, but prefer direct module usage.

### Development Workflow
* **Hot-reloading**: Project uses **Vite** (see `vite.config.js`). Run `npm run dev` to start local server with HMR.
* **Testing**: Run `npm test` for unit tests. New modules have test coverage under `tests/unit/`.
* **Sass**: Entry point `scss/main.scss` compiles via the Vite plugin – use variables in `base/_variables.scss`.
* **Chrome DevTools grid/flex overlay** is invaluable for inspecting the complex layout. Toggle via `⌥-⌘-C → Layout`.

---

*Happy hacking!* 🏎️⚽️ 