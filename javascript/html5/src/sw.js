const CACHE_VERSION = "Scopa-pwa-v3";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const CORE_APP_ASSETS = [
  "./",
  "./index.html",
  "./index.js",
  "./manifest.json",
  "./css/index.css",
  "./css/game.css",
  "./ai/ai-baseline.js",
  "./ai/ai-manager.js",
  "./ai/ai-strategy.js",
  "./ai/evaluation-heuristics.js",
  "./ai/greedy-variants.js",
  "./ai/mcts.js",
  "./ai/negamax.js",
  "./ai/phase2-endgame.js",
  "./ai/phase2-enhanced-strategies.js",
  "./config/configuration.js",
  "./config/constants.js",
  "./config/messages.js",
  "./core/capture.js",
  "./core/card.js",
  "./core/dealing.js",
  "./core/deck.js",
  "./core/game-engine.js",
  "./core/game-state.js",
  "./core/round-end.js",
  "./core/rules.js",
  "./core/scopa.js",
  "./core/scoring.js",
  "./core/turn.js",
  "./persistence/persistence-manager.js",
  "./ui/game-controller.js",
  "./ui/game-ui.js",
  "./ui/game-view.js",
  "./ui/game-view-enhanced.js",
  "./ui/components/card.js",
  "./ui/components/difficulty-selector.js",
  "./ui/components/game-board.js",
  "./ui/components/statistics-panel.js",
  "./utils/event-bus.js",
  "./utils/logger.js",
  "./workers/ai-worker.js",
  "./img/icons/favicon.ico",
  "./img/icons/cc_by_nc_nd.png",
  "./img/icons/cc_by_nc_sa.png",
  "./img/icons/Scopa32.png",
  "./img/icons/Scopa48.png",
  "./img/icons/Scopa60.png",
  "./img/icons/Scopa64.png",
  "./img/icons/Scopa90.png",
  "./img/icons/Scopa120.png",
  "./img/icons/Scopa128.png",
  "./img/icons/Scopa256.png",
  "./img/oliver_card_playing.jpg",
];

function buildItalianDeckAssets() {
  const suits = ["denari", "coppe", "spade", "bastoni"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "asso",
    "cavallo",
    "fante",
    "re",
  ];

  const assets = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      assets.push(`./img/deck/carte_merkel/${suit}_${rank}.svg`);
    }
  }

  assets.push("./img/deck/carte_merkel/carte_da_gioco_italiane_back.svg");
  assets.push("./img/deck/carte_merkel/carte_da_gioco_italiane_sheet.svg");
  return assets;
}

function buildSpanishDeckAssets() {
  const suits = ["oros", "copas", "espadas", "bastos"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "as",
    "caballo",
    "sota",
    "rey",
  ];

  const assets = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      assets.push(`./img/deck/mazzo_spagnolo/${suit}_${rank}.svg`);
    }
  }

  assets.push("./img/deck/mazzo_spagnolo/baraja_espanola_back.svg");
  assets.push("./img/deck/mazzo_spagnolo/baraja_espanola_sheet.svg");
  return assets;
}

const APP_SHELL_ASSETS = [
  ...new Set([
    ...CORE_APP_ASSETS,
    ...buildItalianDeckAssets(),
    ...buildSpanishDeckAssets(),
  ]),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.all(
        APP_SHELL_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { cache: "no-cache" });
            if (response.ok) {
              await cache.put(asset, response.clone());
            }
          } catch {
            // Continue installing even if one optional asset fails.
          }
        }),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function cacheRuntimeResponse(request, response) {
  if (!response || response.status !== 200 || response.type === "opaque") {
    return;
  }

  // Clone immediately before the response body can be consumed by the browser.
  const responseForCache = response.clone();

  caches.open(RUNTIME_CACHE).then((cache) => {
    cache.put(request, responseForCache);
  });
}

function staleWhileRevalidate(request) {
  return caches.match(request).then((cached) => {
    const networkFetch = fetch(request)
      .then((response) => {
        cacheRuntimeResponse(request, response);
        return response;
      })
      .catch(() => cached);

    return cached || networkFetch;
  });
}

function networkFirstNavigation(request) {
  return fetch(request)
    .then((response) => {
      cacheRuntimeResponse(request, response);
      return response;
    })
    .catch(async () => {
      const cachedPage = await caches.match("./index.html");
      if (cachedPage) return cachedPage;
      return caches.match("./");
    });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  const destination = request.destination;
  if (
    destination === "style" ||
    destination === "script" ||
    destination === "worker" ||
    destination === "image" ||
    destination === "font"
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        cacheRuntimeResponse(request, response);
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
