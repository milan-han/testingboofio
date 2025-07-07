# Agent Guide for LocalBoof.io

## Project Overview
This is a real-time multiplayer .io game built with vanilla JavaScript, Socket.IO, and Vite. Players control cars in an arena trying to score goals by hitting a ball into the opponent's goal.

## Environment Setup for Codex

### Quick Bootstrap
If the base container lacks Node.js 20+, run the setup script first:
```bash
chmod +x setup.sh && ./setup.sh
```

This will install dependencies, run validation tests, and check port availability.

## Project Structure
```
js/
├── core/              # Core game systems (DO NOT BREAK THESE)
│   ├── game-store.js      # Centralized state management
│   ├── match-controller.js # Game loop and match logic
│   ├── player-manager.js   # Player spawning and management
│   ├── canvas-renderer.js  # Rendering system
│   └── npc-ai.js          # AI player behavior
├── car.js             # Car physics and controls
├── ball.js            # Ball physics
├── collisions.js      # Collision detection (PERFORMANCE CRITICAL)
├── field.js           # Game field/arena
├── network.js         # WebSocket client communication
├── network-game-sync.js # Real-time state synchronization
├── particles.js       # Visual effects system
├── explosions.js      # Car destruction effects
├── ui/                # User interface components
│   └── chat-utils.js      # Chat functionality
└── utils/
    └── helpers.js         # Utility functions

server.js              # WebSocket server (Socket.IO)
scss/                  # Styling (SASS)
tests/                 # Test suite
```

## Development Environment

### Quick Start
```bash
# Install dependencies
npm install

# Start development server (client)
npm run dev

# Start WebSocket server (separate terminal)
npm start

# Start both servers simultaneously
npm run dev:full

# Run all tests
npm test

# Run linting
npm run lint
```

### Test Commands
- `npm run test:working` - Run currently passing tests only (recommended for development)
- `npm run test:all` - Run all tests (includes some failing tests - good for seeing what needs fixing)
- `npm run test:unit` - Run headless simulation tests only
- `npm run test:dom` - Run DOM/UI tests with jsdom
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:coverage` - Run tests with coverage report

### Validation Steps
1. **Always run working tests after changes**: `npm run validate`
2. **Check linting**: `npm run lint`
3. **Verify game still runs**: Open `http://localhost:5173` after `npm run dev`
4. **Test multiplayer**: Open two browser windows, both should connect

## Code Guidelines

### Validation Requirements
**CRITICAL**: Always run `npm run validate` before finishing any task. This ensures:
- Linting passes
- Working tests continue to pass
- No regressions in core functionality

For performance-critical changes, also run:
```bash
npm run bench  # (when implemented)
```

### Performance Critical Areas
- `js/collisions.js` - Collision detection runs every frame
- `js/core/canvas-renderer.js` - Rendering pipeline
- `js/network-game-sync.js` - Real-time synchronization
- `js/particles.js` - Particle systems

### Safe to Modify
- `js/ui/` - UI components and menus
- `scss/` - Styling and visual design
- `tests/` - Test files
- `js/utils/` - Helper functions

### Testing Requirements
- **Add tests for any new game logic**
- **Update tests when changing existing behavior**
- **Performance-critical code needs benchmark tests**
- **UI changes should have DOM tests**

### WebSocket Protocol
The game uses Socket.IO with these key events:
- `quickplay:join` - Join matchmaking queue
- `room:join` - Join specific room
- `state:update` - Broadcast game state
- `player:joined/left` - Player connection events

## Common Tasks & Validation

### Physics Changes
1. Modify physics code
2. Run `npm run test:unit` (includes physics tests)
3. Test in browser - ball and car movement should feel right
4. Check performance with `npm run dev` - should maintain 60 FPS

### UI Changes
1. Modify UI components in `js/ui/` or `scss/`
2. Run `npm run test:dom` 
3. Test in browser - UI should be responsive and accessible
4. Check across different screen sizes

### Network/Multiplayer Changes
1. Modify `network.js`, `network-game-sync.js`, or `server.js`
2. Run full test suite: `npm test`
3. Test with two browser windows
4. Verify state synchronization works correctly

### Performance Optimization
1. Identify bottleneck using browser dev tools
2. Focus on `collisions.js`, `particles.js`, or `canvas-renderer.js`
3. Add/update benchmark tests in `tests/unit/`
4. Verify FPS stays above 60 in `npm run dev`

## Architecture Notes

### State Management
- Uses centralized `GameStore` class with subscription pattern
- Avoid direct global variable access
- Subscribe to state changes rather than polling

### Rendering
- Canvas-based rendering in `canvas-renderer.js`
- Particle system for visual effects
- Coordinate system: (0,0) is center of field

### Networking
- Client-side prediction for responsive controls
- Server authoritative for game state
- Delta compression for bandwidth efficiency

## Current Test Status

⚠️ **Note for Codex agents**: Some tests are currently failing due to missing implementations or API mismatches. This is intentional - fixing these tests is a great way to contribute!

**Working Tests** (run with `npm run test:working`):
- UI component tests (player cards, game menu, add player)
- Room state management
- Basic UI functionality

**Failing Tests** (areas that need work):
- Performance benchmarks for collision system
- Chat utilities (CSS integration issues)
- Canvas renderer (missing canvas element in tests)
- Game store API mismatches
- Helper functions (missing implementations)

**Great first tasks for Codex**:
1. Fix test setup for canvas renderer tests
2. Implement missing helper functions (hexToRgba, getDarkerShade, etc.)
3. Fix game store test API mismatches
4. Add performance benchmark baseline for collision system
5. Fix chat utility CSS property access in test environment

## AI Agent Workflow

### Before Making Changes
1. **Understand the change**: Read related code files
2. **Check existing tests**: Look in `tests/` for relevant coverage
3. **Identify dependencies**: What other systems might be affected?

### After Making Changes
1. **Run validation**: `npm run validate` must pass
2. **Manual testing**: Start dev server with `npm run dev:full` and verify functionality
3. **Performance check**: Ensure no significant performance regression
4. **Documentation**: Update this file if architecture changes

### Pull Request Guidelines
**Title format**: `[component] Brief description of change`

Examples:
- `[collision] Optimize broadphase detection algorithm`
- `[ui] Fix chat panel overflow scrolling`
- `[network] Add connection retry logic`

**PR Description should include**:
- What changed and why
- How to test the change
- Performance impact (if applicable)
- Screenshot/video for UI changes

### Commit Message Format
Use conventional commits:
- `fix: resolve collision detection edge case`
- `feat: add spectator mode UI`
- `perf: optimize particle system rendering`
- `test: add benchmark for collision system`

### When You're Stuck
- Check browser console for JavaScript errors
- Look at network tab for WebSocket message flow
- Run `npm run test:coverage` to see what's not tested
- Profile performance using browser dev tools

## Debugging Tips
- Use `console.log` in game loop for real-time debugging
- Browser dev tools Network tab shows WebSocket messages
- Performance tab can identify frame rate issues
- `localStorage.debug = 'socket.io-client:socket'` enables Socket.IO debug logs

## Files to Avoid Changing
- `assets/` - Game assets and images
- `e2e/` - End-to-end test configuration (unless updating tests)
- `package-lock.json` - Dependency lock file
- `.git/` - Version control files

Remember: This is a real-time game. Performance and synchronization are critical. Always test multiplayer functionality when making network or game logic changes. 