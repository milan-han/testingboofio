# UI Layout Guide

## 1. High-Level Page Structure

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  LOGO (top-left)        [Login] (top-left)                                   │
│                                                                               │
│                                GAME MENU (bottom)                            │
│                                                                               │
│                        ┌──────────────────────────┐                          │
│  RETRO VIDEO           │                          │                          │
│  (top-left column)     │    GAME CANVAS           │         SOCIAL PANEL     │
│                        │    (soccer field)        │       (Friends list      │
│  CHAT PANEL            │                          │       above player card) │
│  (bottom-left)         └──────────────────────────┘                          │
│                                                                               │
│                      ┌──────────────────────────────────────────────┐         │
│                      │      GAME MENU SYSTEM (bottom, full-width)   │         │
│                      │ ┌──────────────────────────────────────────┐ │         │
│                      │ │  [Play Options] [Mode Select] [Teams]    │ │         │
│                      │ │  [Drag & Drop Team Selection]            │ │         │
│                      │ └──────────────────────────────────────────┘ │         │
│                      └──────────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────────────────────────┘
```

Legend:
* **Game menu** is now a full-width, bottom-anchored panel with three columns: play options, mode select, and player/team info.
* **Drag-and-drop team selection** allows users to assign drivers to Team 1 or Team 2 before starting a match.
* The **old multiplayer panel** and red placeholder box have been fully replaced by the new menu system.
* The **game menu** is always visible at the bottom, with responsive width and compact layout.

### Key Elements & CSS Hooks
| Area | Main Selector(s) | Notes |
|------|------------------|-------|
| Logo | `.logo-container`, `.game-logo` | Positioned in top-left corner |
| Login Button | `.login-btn` | Simple CTA top-left |
| Retro Video | `.retro-player` | 4:3 video above chat |
| Chat | `.chat-panel` *(header/messages/input)* | Anchored bottom-left, hidden in local mode |
| Game Field | `#game` *(canvas tag)* | Scales/zooms with classes `.zooming`, `.game-active` |
| Scoreboard | `.scoreboard` | Slides down when visible |
| Game Menu | `.game-menu-container` | Full-width, bottom-anchored menu panel |
| Play Options | `.panel-play-options` | Left column of menu (Quickplay/Customplay/Sandbox) |
| Mode Select | `.panel-center-content` | Center column (mode, start button) |
| Player/Teams | `.panel-player-info` | Right column (stats, team selection) |
| Team Selection | `.team-selection-grid`, `.team-dropzone`, `.driver-card` | Drag-and-drop team assignment |
| Social Panel | `.social-panel` | Anchored above player card in bottom-right with 20px spacing |
| Player Card(s) | `.player-card`, `.player-card.player-2` | Anchored bottom-right; in local mode: P1 bottom-left, P2 bottom-right |
| Overlays | `.countdown-overlay`, `.pause-overlay`, `.game-end-overlay` | Full-screen state layers |

---

## 2. Flow of Positioning
1. **Canvas centring** – `#game` is absolutely positioned at `top: 50%; left: 50%` then translated `(-50%, -50%)`. Scaling (`scale(0.7 → 1)`) drives the zoom-in effect.
2. **Side panels** – Left column (video + chat) and right column (social + player card) are anchored with hard-coded `left/right/top/bottom` values.
3. **Game menu** – Full-width, bottom-anchored, grid-based layout with three main columns.
4. **Overlays** (countdown, pause, end-game) are full-viewport flex containers toggled via `display` or `opacity` classes.
5. **Responsive tweaks** are handled by adding/removing utility classes such as `.field-offset`, `.compressed`, `.local-mode`, etc. There is **no media-query-driven responsiveness**; layout relies on JavaScript toggling classes.

---

## 3. Game Menu System

- **Component**: `.game-menu-container`
- **Columns**:
  - `.panel-play-options`: Play mode selection (Quickplay, Customplay, Sandbox)
  - `.panel-center-content`: Mode select (1v1, 2v2), start button ("PRESS F TO PLAY")
  - `.panel-player-info`: Player stats, invite player, and **drag-and-drop team selection**
- **Team Selection**:
  - `.team-selection-grid`: Two-column grid for Team 1 and Team 2
  - `.team-dropzone`: Drop area for each team
  - `.driver-card`: Draggable player/NPC/online card
  - Players can be freely dragged between teams; multiple players per team supported
  - New players added via invite popup (`+ invite player +`)
- **Start Button**: Always says "PRESS F TO PLAY"; starts the match immediately.
- **Fully responsive**: Menu shrinks on mobile and stacks columns vertically.

---

## 4. Recommendations for a Scalable, Readable Layout

### 4.1 Adopt a Layout System
* **CSS Grid at the root** – The `<body>` element uses `display: grid` with named areas: `header`, `left`, `main`, `right`, and `footer`.
* **Flexbox internally** – Each grid area uses Flexbox (or Grid again) for its own alignment so components remain independent.

```html
<body class="layout-grid">
  <header class="site-header">…logo / login…</header>
  <aside  class="site-sidebar site-sidebar--left">…retro-video & chat…</aside>
  <main   class="site-main"><canvas id="game" width="960" height="600"></canvas></main>
  <aside  class="site-sidebar site-sidebar--right">…multiplayer panel / player cards…</aside>
  <footer class="site-footer">…start button / scoreboard…</footer>
</body>
```

```scss
/* layout/_grid.scss */
.layout-grid {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "left    main    right"
    "footer  footer  footer";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: minmax(14rem, 18rem) 1fr minmax(14rem, 18rem);
  gap: var(--space-4);
  height: 100vh;
}

/* Collapse side-bars below the canvas on tablets */
@media (max-width: 64rem) {
  .layout-grid {
    grid-template-areas:
      "header"
      "main"
      "left"
      "right"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

Additional helper classes:
* `.layout--wide` – switches to wider sidebars on ultra-wide screens.
* `.layout--no-sidebar` – hides the side areas and expands `main` to `grid-column: 1 / -1`.

### 4.2 Modularise Styles
The project already uses **Sass** modules organised like so:

```
scss/
├── main.scss          // entry point imported by Vite
├── base/              // reset, variables, typography
├── layout/            // grid & z-index helpers
├── components/        // UI components
├── states/            // visibility, transitions
└── utils/             // mixins & helpers
```

`main.scss` simply `@use`-imports each partial. During development **Vite** compiles these SCSS files into a single CSS bundle with hot-module replacement for near-instant feedback. 