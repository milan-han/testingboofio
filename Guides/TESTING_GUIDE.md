# Testing Guide – Keeping LocalBoof.io Bug-Free 🚦

> "A change without a failing test is just hope." – Every developer ever

LocalBoof.io ships with a **three-layer testing stack** that lets you verify everything from pure business logic up to full browser flows – all from the command line.

| Layer | Target code | Tool & why | Typical assertions | Script |
| ----- | ----------- | ---------- | ------------------ | ------- |
| 1. Pure logic | `room-state.js`, helpers | **Vitest**<br/>Same syntax as Jest but Vite-native, includes fake timers & snapshot utils. | `addPlayer` respects caps<br/>`all_ready` fires exactly once | `npm run test:unit` |
| 2. DOM / component glue | `ui-*.js` in jsdom | **Vitest + @testing-library/dom**<br/>Headless jsdom lets you mount non-React widgets, call their `init` function, and inspect the real DOM tree. | Clicking "ADD PLAYER ➜ Local" injects a new card element<br/>Two locals hide chat pane<br/>`RoomState` mutates as expected | `npm run test:dom` |
| 3. End-to-end flows | Real browser, canvas, keyboard | **Playwright Test**<br/>Headless Chromium/WebKit/Firefox. Works fine with HTML5 Canvas, can press actual keys. | Launch page, hit `F`, verify countdown appears<br/>Add NPC via pop-over, ensure driver list updates<br/>Resize window to 1280×720 ⇒ field still centred | `npm run test:e2e` |

---

## 1 · Running the Tests

```bash
# install all dev dependencies (once)
npm install

# run every suite sequentially
npm test            # alias for unit → dom → e2e

# or target a single layer
npm run test:unit   # logic only
npm run test:dom    # jsdom DOM tests
npm run test:e2e    # Playwright
```

Vitest will display coloured output and fast fail by default. Playwright prints a concise reporter by default (`--reporter=line`).

---

## 2 · Project Structure

```
tests/              Vitest suites
  ├─ ui-add-player.test.js   DOM example
  └─ (add more *.test.js)
e2e/                Playwright suites (create this dir)
  └─ lobby-flow.spec.ts
```

• Place **unit & DOM** tests anywhere under `tests/`. Filename must end with `.test.js` (or `.test.ts`).
• Place **e2e** specs under `e2e/` so they are ignored by Vitest.

---

## 3 · Writing Unit & DOM Tests (Vitest)

Vitest supports the familiar Jest API (`describe`, `it`, `expect`). For DOM interaction we import helpers from `@testing-library/dom`.

```js
import { fireEvent } from '@testing-library/dom';

// minimal DOM skeleton required by the widget
beforeEach(() => {
  document.body.innerHTML = `
    <button id="invite-player-btn"></button>
    <div id="invite-popup" class="hidden"></div>`;
});

it('shows the popup', () => {
  const btn = document.getElementById('invite-player-btn');
  fireEvent.click(btn);
  expect(document.getElementById('invite-popup')).not.toHaveClass('hidden');
});
```

### Tips
• Use `vi.useFakeTimers()` to test timeout-based logic.<br/>
• Snapshot DOM with `expect(element).toMatchSnapshot()`.<br/>
• Prefer Testing-Library's "user-facing" queries (`getByRole`, `getByText`) once you add ARIA markup.

---

## 4 · Writing End-to-End Tests (Playwright)

```ts
// e2e/lobby-flow.spec.ts
import { test, expect } from '@playwright/test';

test('local player can add an NPC', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('#invite-player-btn');
  await page.click('text=NPC');
  const cards = await page.locator('.player-card').all();
  expect(cards).toHaveLength(2);
});
```

Run the dev server in a second terminal (`npm run dev`) or programmatically launch it in `globalSetup`.

### Screenshots & videos
Add `--trace on` or `--video on` flags for rich debugging. Artifacts land under `playwright-report/`.

---

## 5 · Debugging Tips

• Prefix any Vitest command with `npx vitest run --reporter verbose` for extra info.<br/>
• Use `npx playwright show-report` to open the HTML report.<br/>
• Playwright browsers are cached globally at `~/.cache/ms-playwright` – delete if you need a fresh install.

---

Happy testing! 🧪 