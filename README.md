# Finucci

Classic Italian card game Scopa. Play like the Finuccis.

## Play Online

- [Start game now...](https://omerkel.github.io/Finucci/javascript/html5/src/)

## Progressive Web App (PWA)

The HTML5 app under `javascript/html5/src` is configured as a PWA with:

- install support via `manifest.json`
- standalone display mode
- service worker registration in `index.js`
- offline caching for code, styles, worker scripts, and card/image assets

### Install (Desktop / Mobile)

1. Open the online app link above in a modern browser.
1. Use the browser install action for your platform.
  Chrome/Edge desktop: Install icon in address bar.
  Android Chrome: Add to Home screen / Install app.
  iOS Safari: Share -> Add to Home Screen.
1. Start the installed app once while online to ensure caches are primed.

### Offline Behavior

- App shell files (`index.html`, `index.js`, CSS, JS modules, manifest) are pre-cached.
- Card assets for both decks are pre-cached:
  - `carte_merkel`
  - `mazzo_spagnolo`
- Runtime requests are cached with stale-while-revalidate for scripts/styles/images/fonts/workers.
- Navigations use network-first with cached fallback to the app shell when offline.

### PWA Troubleshooting

If updates do not appear immediately or offline behavior looks stale:

1. Close all open app tabs/windows.
2. Reopen the app once while online.
3. Do a hard refresh.
   Windows/Linux: Ctrl+F5 (or Ctrl+Shift+R).
   macOS: Cmd+Shift+R.
4. If needed, clear site data for the app origin
   (cache + service workers), then reload.

For local development/service-worker testing:

- Prefer testing over `http://localhost`
  (service workers are not available on plain `file://`).
- After changing `sw.js`, refresh once online so the new worker can install
  and activate.

## Repository Structure

Top-level layout:

- `doc/` — project documentation (rules, requirements, architecture)
- `img/` — source/generator material for card decks and media
- `javascript/html5/` — web implementation (Vite + Vitest)

HTML5 app layout (`javascript/html5/src`):

- `index.html` — app shell and overlay pages
- `index.js` — app entry point, wiring, service worker registration
- `manifest.json` — PWA manifest
- `sw.js` — service worker (offline caching and fetch strategies)
- `ai/` — AI strategies (greedy, negamax, mcts, evaluation helpers)
- `config/` — configuration and constants
- `core/` — game rules/engine/domain logic
- `ui/` — view, controller, and components
- `css/` — styling
- `img/` — runtime assets (icons, deck faces/backs)
- `persistence/` — save/load handling
- `utils/` — shared utilities
- `workers/` — web worker entry points
- `test/` — Vitest suites
