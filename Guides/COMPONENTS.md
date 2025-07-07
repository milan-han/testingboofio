# COMPONENTS.md — UI Components & Behaviour Reference

> A living document describing every interactive element in **LocalBoof.io**.  
> If you change the UI, update this guide in the same pull-request.

## Table of Contents
1. Buttons & Action Triggers
2. Panels & Layout Containers
3. Player Cards
4. Chat System
5. Mode Matrix & Edge-Cases
6. If/Then Behaviour Flows
7. Keeping this Guide Up-to-Date
8. In-Game Components
9. Mode Switching Rules
10. Invite & Auto-Join Link
11. Field Preview Canvas
12. Sandbox Controls
13. Identity & Live Editing
14. Player Card Enhancements
15. Chat Visibility Clarification

---

## 1. Buttons & Action Triggers

### Quickplay (`#quickplayBtn`)
Purpose: one-click start for a 1 v 1 local vs NPC match.

Flow:
1. Sets `RoomState.mode = 'quickplay'`.
2. Ensures **exactly one** local driver.
3. Hides the **NPC** option in the Add-Player popup.
4. Limits the room to **max 2 drivers** (local + online).

Edge-cases:
* Clicking while a match is running does nothing.
* Attempts to add an NPC in this mode are blocked with a console warning.

### Customplay (`#customplayBtn`)
Purpose: unlock full lobby configuration (local, online, NPC).  
Flow: sets `RoomState.mode = 'custom'` and re-enables all Add-Player options.

### Mode Toggles (`#mode1v1`, `#mode2v2`)
Select desired team size *after* choosing Customplay.
* **1v1** – at most 1 driver per team (default).
* **2v2** – up to 2 drivers per team.

### Press F to Play (keyboard **F** or `#playBtn`)
Starts or restarts the match once **every driver is ready**.

### Add Player (`#invite-player-btn`)
Opens `#invite-popup` with three options:
1. **Local Player** – adds a hot-seat driver.
2. **NPC** – spawns a computer opponent (disabled in Quickplay).
3. **Copy Link** – copies the current URL for a friend to join online.

### Leave Room (`#leaveRoomBtn`)
Removes all secondary drivers (NPC / online / 2nd local) and returns to the Stats panel.

### Mute / Unmute (icon in video box)
Toggles game SFX on/off.

---

## 2. Panels & Layout Containers

### Chat Panel (`#chatPanel`)
Persistent lobby chat.
* Hidden when *exactly two* local drivers are present **and** no online players (couch co-op use-case).
* Visible in all other situations.

### Friends Panel
Lists online friends and their status. (Read-only in v0.1.)

### Video Panel
Currently streams a looping VHS clip — placeholder for a future spectator cam.

### Stats Panel (`#player-stats-panel`)
Shows win / loss tallies for the currently selected user.

### Drivers Panel (`#drivers-panel`)
Drag-and-drop teams, set readiness, tweak NPCs. Auto-opens after adding a driver.

---

## 3. Player Cards (`.player-card`)
Visual representation of **local** drivers.

| State   | Visual Cue                                 |
|---------|--------------------------------------------|
| Default | Full-height card with car sprite           |
| Ready   | Green border + ✔ badge                    |
| Stacked | Half-height, stacked bottom-right on small layouts |

Layout rules:
* **1 local** → big card bottom-right.
* **2 locals (no online)** → cards split left/right (`body.local-mode` CSS flag).
* **2 locals + online(s)** → cards compressed & stacked bottom-right.

---

## 4. Chat System
* Open by pressing **/** or clicking the input area.
* Sends plain text to every connected client.
* Chat is read-only for NPCs.
* Auto-scrolls on new messages; pauses on hover.

---

## 5. Mode Matrix & Edge-Cases

| Feature               | Quickplay | Custom 1v1 | Custom 2v2 |
|-----------------------|-----------|-----------|-----------|
| Add NPC               | ❌        | ✅        | ✅        |
| Max Local Players     | 1         | 2         | 2         |
| Max Total Drivers     | 2         | 2         | 4         |
| Chat Hidden (2 locals)| ✅        | ❌        | ❌        |

---

## 6. If/Then Behaviour Flows

1. **Quickplay Selected**  
   If a match is in progress → ignore click.  
   Else → reset room → add 1 local driver → disable NPC option.

2. **Add Player → NPC**  
   If `RoomState.mode === 'quickplay'` → block & warn.  
   Else → `RoomState.addPlayer({type:'npc', …})`.

3. **Second Local Driver Added**  
   If no online drivers → add `body.local-mode` class and split cards.  
   Else → stack cards & hide chat.

4. **Driver Toggles Ready**  
   When **all** drivers ready → enable Play button + flash green.

---

## 7. Keeping this Guide Up-to-Date
Whenever you change **markup**, any `ui-*.js`, or SCSS that affects a component:
1. Update the appropriate section(s) here.
2. Describe behavioural changes in *If/Then Behaviour Flows*.
3. Link to the commit, PR, or relevant tests if helpful.

*Docs drift is a bug—fix it before merging.* 

---

## 8. In-Game Components

### Pitch Transition
When a match starts (`GameState.phase === 'playing'`) the lobby panels (`#drivers-panel`, `#chatPanel`, `#statsPanel`, `#friendsPanel`) slide off-screen using the `slide-out` utility class and the field canvas expands to fill the viewport. The transition is reversed when the phase returns to `'lobby'` or `'ended'`. The chat panel remains visible throughout the transition if it was visible beforehand.

### Countdown Overlay (`#countdownOverlay`)
A full-screen translucent layer displaying centred numbers **3 – 2 – 1 – GO**.
* Appears whenever `GameState.phase` switches to `'countdown'`.
* Hides automatically on `'playing'`.

### Scoreboard (`#scoreboard`)
Fixed top-centre HUD that shows team scores and remaining time.
* Updates on every `RoomState.goalScored` event.
* The leading team's score flashes red for 1 s on change.

### Pause Overlay (`#pauseOverlay`)
Triggered when the host presses **P** or when the window loses focus.
* Freezes physics & timers, keeps chat active.
* Displays "⏸ Paused – press P to resume".

### End-of-Match Stats Panel (`#endStats`)
Slides in from the right once `GameState.phase === 'ended'`.
* Lists goals, assists, saves, and awards an MVP badge.
* In **Quickplay** the panel auto-closes after 5 s and triggers an automatic rematch.

---

## 9. Mode Switching Rules

1. **Custom → Quickplay Guard**  
   Quickplay can only be activated if the room currently contains **≤ 2 human drivers** (locals + online). Attempting to switch with more drivers flashes the Quickplay button red and logs a console warning.
2. **Auto-Lock to 2 v 2 when 2 Humans**  
   In Quickplay, once both teams have at least one human driver the room capacity locks to **2 v 2** (max 4 drivers) and the NPC option is permanently disabled.

---

## 10. Invite & Auto-Join Link

The **Copy Link** option shares a URL containing the `roomId`. Visiting the link:
* Automatically attempts to join if the room is **not full**.
* Redirects to a "Room Full" fallback page otherwise.

---

## 11. Field Preview Canvas (`#field-preview`)

The centre canvas re-renders on **every** `RoomState` mutation, ensuring team colours, driver positions, and sandbox tweaks are live for every client.

---

## 12. Sandbox Controls (`#sandboxPanel`)

Accessible via the `?sandbox` query param or the **S** key when you are the host.
* Sliders for ball gravity, boost respawn, and car-speed multiplier.
* Values persist in `RoomState.sandbox` and broadcast to all clients, updating the field preview in real-time.

---

## 13. Identity & Live Editing

* **USERNAME** – account identifier, immutable, shown in the Stats panel header.
* **NAME** – in-room display name, editable inline on the Player Card; edits call `RoomState.updateName(id, value)` and propagate instantly to every client.

---

## 14. Player Card Enhancements

Each `.player-card` now includes a **Remove** button (`.remove-driver-btn`, × icon top-right).
* Visible to the driver them-self and to the host.
* Clicking calls `RoomState.removeDriver(id)` and emits a system chat message.

NPC cards display a colour swatch and difficulty badge. Clicking either opens an inline pop-over editor (no blocking prompt) where the host can tweak:
* Team colour (palette grid)
* AI difficulty (Easy / Normal / Hard)
Changes save on blur and broadcast live.

---

## 15. Chat Visibility Clarification

The chat panel remains visible whenever **any online driver is present**, even if two local players are seated. This check runs on every `RoomState.driverAdded` and `RoomState.driverRemoved` event. 