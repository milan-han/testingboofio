# LocalBoof.io – Car-Ball Game

Welcome to **LocalBoof.io**, a retro-futuristic, Rocket-League-inspired browser game built with vanilla JavaScript, HTML5 Canvas, and modular SCSS. This README will help you:

1. Get the game running locally in seconds
2. Understand where things live inside the repo
3. Follow the recommended developer workflow
4. Leverage the in-depth documentation inside the `Guides/` folder

---

## 1&nbsp;·&nbsp;Quick Start

### Prerequisites
* **Node.js ≥ 18** (includes `npm`)

### Install & Run the Dev Server
```bash
# grab deps
npm install

# launch Vite with hot-module replacement
npm run dev
```
Open your browser at **http://localhost:5173**. Vite will live-reload JS and SCSS as you edit.

### Start the Multiplayer Server
To experiment with the new WebSocket layer run:
```bash
npm start
```
This starts an Express + Socket.IO server on **http://localhost:3000** serving the same files with multiplayer sync enabled.

### Custom Room Links
Click **CUSTOMPLAY** in the game menu to generate a private room.
Share the URL with `?room=<id>` so a friend can join directly and play in real-time.

### One-Click Offline Demo
If you only need a fast demo with no build tools, simply double-click `index.html`. Most features work, but HMR and Sass compiling are disabled.

### Production Build
```bash
npm run build        # outputs optimised assets to /dist
```
Serve the contents of `dist/` with any static host (e.g. Netlify, GitHub Pages).

---

## 2&nbsp;·&nbsp;Repository Layout

```
assets/          Static images & SVG icons
Guides/          Long-form documentation (architecture, UI, style guide)
js/              Game logic & UI scripts (non-module, loaded via <script>)
scss/            Modular SCSS, compiled by Vite to CSS
index.html       Game shell & DOM scaffolding
vite.config.js   Build/dev tooling config
```

### Key JavaScript Files

**Core System (Modular Architecture):**
* `js/core/game-store.js`    – Centralized state management with subscribe pattern
* `js/core/canvas-renderer.js` – Canvas setup and responsive scaling
* `js/core/match-controller.js` – Game flow (countdown, start, pause, win conditions)
* `js/core/player-manager.js` – Player management, colors, settings
* `js/core/npc-ai.js`        – NPC behavior and difficulty management
* `js/ui/chat-utils.js`      – Chat message handling and styling
* `js/utils/helpers.js`      – Utility functions (color manipulation, drawing)

**Legacy Files (Refactored):**
* `js/room-state.js`   – Central lobby store & pub/sub
* `js/globals.js`      – Compatibility layer + essential utilities (refactored from 1400+ lines)
* `js/ui-*.js`         – UI widgets (menu, chat, driver cards)
* `js/game-state.js`   – State machine for `setup → playing → ended`

### SCSS Organisation
`scss/main.scss` is the entry point that `@use`s partials under:
* `base/`   – reset, variables, typography
* `layout/` – grid helpers, z-index map
* `components/` – buttons, chat, overlays, etc.
* `states/` – visibility & transition utilities
* `utils/`  – mixins and helper functions

---

## 3&nbsp;·&nbsp;Navigating the Code

### Modular Architecture (2024 Refactor)
The codebase has been refactored from a single 1400+ line `globals.js` monolith into focused, testable modules:

1. **State Management** `GameStore` replaces global variables with a subscribe pattern. All game state flows through this centralized store.
2. **Module Structure** Core functionality is organized under `js/core/`, UI utilities under `js/ui/`, and shared helpers under `js/utils/`.
3. **Backward Compatibility** The refactored `globals.js` provides a compatibility layer so existing code continues to work seamlessly.
4. **Dependency Order** Modules are loaded in dependency order in `index.html` (core → utils → UI → game logic).

### Navigation Guidelines
1. **UI vs Gameplay**   UI scripts are prefixed with `ui-` while gameplay physics/AI live in single-purpose files like `car.js` and `ball.js`.
2. **State Management** `GameStore` is the **single source of truth** for game state. `RoomState` handles lobby/multiplayer state.
3. **Sass Variables**   Colours, spacing, and typography tokens sit in `scss/base/_variables.scss`; follow them to stay on-brand.
4. **HTML Entrypoint**  `index.html` wires everything together with classic `<script>` tags for maximum compatibility. Vite injects the compiled CSS bundle at runtime.

---

## 4&nbsp;·&nbsp;Using the Guides Folder

The `/Guides` directory contains rich Markdown docs to accelerate onboarding:

| Guide | What it covers | When to read |
| ----- | -------------- | ------------ |
| [`TECHNICAL_OVERVIEW.md`](Guides/TECHNICAL_OVERVIEW.md) | Mermaid architecture diagram, lobby store pattern, file cheat-sheet | Day 1 – grasp the big picture |
| [`UI_LAYOUT_GUIDE.md`](Guides/UI_LAYOUT_GUIDE.md) | ASCII wireframes, CSS hooks, grid recommendations | Editing layout or adding panels |
| [`STYLE_GUIDE.md`](Guides/STYLE_GUIDE.md) | Colours, typography, spacing, component states, Sass variables | Any time you touch SCSS or visual design |
| [`TESTING_GUIDE.md`](Guides/TESTING_GUIDE.md) | Vitest/Testing Library/Playwright – writing & running tests | Whenever you add or refactor code |
| [`COMPONENTS.md`](Guides/COMPONENTS.md) | Detailed breakdown of every UI component, expected behaviours & edge-cases | Any time you touch UI logic or visuals |

All guides are plain Markdown—open them in your IDE, on GitHub, or render with any viewer. Use `⌘F` to jump to keywords like "driver card" or "npc".

---

## 5&nbsp;·&nbsp;Common Developer Tasks

| Task | Command / File |
| ---- | -------------- |
| Start dev server (HMR) | `npm run dev` |
| Build production bundle | `npm run build` |
| Add a new colour token | `scss/base/_variables.scss` |
| Tune NPC difficulty | `js/core/npc-ai.js` → `NPCAI` class |
| Modify game state logic | `js/core/game-store.js` → `GameStore` class |
| Update match flow (countdown, pause) | `js/core/match-controller.js` → `MatchController` class |
| Change player management | `js/core/player-manager.js` → `PlayerManager` class |
| Modify chat functionality | `js/ui/chat-utils.js` → `ChatUtils` class |
| Add utility functions | `js/utils/helpers.js` |
| Change countdown duration | `js/game-state.js` |
| Run all tests | `npm test` |

---

## 6&nbsp;·&nbsp;Contributing

1. Create a branch `feat/<your-feature>`
2. Follow the coding conventions in the Style Guide
3. Submit a pull request with a clear description of *what* & *why*
4. If your change affects UI behaviour or components documented in `/Guides`, update the relevant guide (especially `COMPONENTS.md`) in the same PR

PRs that improve documentation, refactor legacy code, or add tests are highly appreciated!

---


