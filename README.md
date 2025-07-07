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
* `js/room-state.js` – Central lobby store & pub/sub
* `js/globals.js`    – Core game loop, input, NPC AI
* `js/ui-*.js`       – UI widgets (menu, chat, driver cards)
* `js/game-state.js` – State machine for `setup → playing → ended`

### SCSS Organisation
`scss/main.scss` is the entry point that `@use`s partials under:
* `base/`   – reset, variables, typography
* `layout/` – grid helpers, z-index map
* `components/` – buttons, chat, overlays, etc.
* `states/` – visibility & transition utilities
* `utils/`  – mixins and helper functions

---

## 3&nbsp;·&nbsp;Navigating the Code

1. **UI vs Gameplay**   UI scripts are prefixed with `ui-` while gameplay physics/AI live in single-purpose files like `car.js` and `ball.js`.
2. **Lobby Flow**       `RoomState` is the **single source of truth** for players, teams, and ready status. All UI reads/writes via its API.
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

All guides are plain Markdown—open them in your IDE, on GitHub, or render with any viewer. Use `⌘F` to jump to keywords like "driver card" or "npc".

---

## 5&nbsp;·&nbsp;Common Developer Tasks

| Task | Command / File |
| ---- | -------------- |
| Start dev server (HMR) | `npm run dev` |
| Build production bundle | `npm run build` |
| Add a new colour token | `scss/base/_variables.scss` |
| Tune NPC difficulty | `js/globals.js` → `npcUpdate()` |
| Change countdown duration | `js/game-state.js` |
| Run all tests | `npm test` |

---

## 6&nbsp;·&nbsp;Contributing

1. Create a branch `feat/<your-feature>`
2. Follow the coding conventions in the Style Guide
3. Submit a pull request with a clear description of *what* & *why*

PRs that improve documentation, refactor legacy code, or add tests are highly appreciated!

---


