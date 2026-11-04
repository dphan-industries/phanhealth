# Move the Moon integration

Copied from David's Desktop/MoveTheMoon Expo project on 2026-11-04. The original project is untouched. Source snapshot is in vendor/move-the-moon; exported web distribution is public/games/move-the-moon. Crew Health embeds that original game in a portrait iframe with explicit launch, close, and restart controls. Earth Room is removed from all app navigation and rendering; its source remains dormant for possible later work.

Original artwork, gameplay, Peace mode (long-press Earth on the menu), shop, local high scores, coins, skins, and sounds are retained. Native rewarded ads are disabled, including reward buttons; no ad requests or fake ad rewards. Sound starts muted. Web additions: arrow-key orbit controls, Space/Escape pause, pause when the document becomes hidden. Leaving the recreation view destroys the iframe and ends that run. Native game progress is not migrated; web saves stay in the browser's AsyncStorage/localStorage.

Export: from vendor/move-the-moon run `node node_modules/expo/bin/cli export --platform web --output-dir ../../public/games/move-the-moon`. Dependencies currently reuse the original project's node_modules through a local ignored junction. For an independent source rebuild, install the copied package-lock dependencies in the vendor folder. The committed exported assets need no Expo dependencies to run or build Crew Health. Expo baseUrl is /games/move-the-moon. Native ads import uses web-ads.ts, a disabled adapter.

All exported game assets are explicitly precached by public/sw.js, around 27 MB before compression. OFFLINE READY requires the complete inventory. If re-exporting, regenerate the worker's game asset list and bump its cache version. Cached game navigations must return the game's document, not Crew Health's root HTML. Storage quota failures must not claim readiness.

Reference: https://docs.expo.dev/more/expo-cli/#hosting-with-sub-paths

Validation: production build and lint pass; 18 automated tests pass, including independent cached game navigation and missing-game-resource readiness. Browser checks confirmed the original menu, gameplay score progression, Space pause, and shop. With the local preview server stopped, a fresh app reload and game launch still rendered the original menu and shop from cache. This is a server-unavailable check, not a physical airplane-mode or real-phone installation test. The game was also opened at a 390px viewport. Preview is left on the game menu.

Drag selection fix: game-local CSS disables text selection and native image dragging, with selectstart/dragstart cancellation inside the game's document. Pointer, touch, keyboard, and shop scrolling handlers remain available. The main Crew Health document retains selectable text. Offline cache updated to v13.

Browser verification of drag fix: dragged across the active arena; computed user-select was none and the game document selection remained empty. Keyboard pause still opened the pause controls. All 18 offline/storage/sensor tests pass.

