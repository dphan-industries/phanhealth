import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
function worker() {
  const entries = new Map();
  const handlers = {};
  const cache = {
    async addAll(urls) {
      for (const u of urls)
        entries.set(
          u,
          new Response(
            u === "/"
              ? '<script src="/_next/static/app.js"></script><link href="/_next/static/app.css"/>'
              : "asset",
          ),
        );
    },
    async match(u) {
      return entries.get(typeof u === "string" ? u : u.url)?.clone();
    },
    async put(u, r) {
      entries.set(u, r);
    },
  };
  const context = {
    Response,
    URL,
    fetch: async () => {
      throw Error("Network unavailable");
    },
    caches: {
      open: async () => cache,
      keys: async () => ["crew-health-v16"],
      delete: async () => true,
    },
    self: {
      location: { origin: "https://local.test" },
      clients: { claim: async () => {} },
      skipWaiting: async () => {},
      addEventListener: (name, fn) => (handlers[name] = fn),
    },
  };
  vm.runInNewContext(
    readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"),
    context,
  );
  return { entries, handlers };
}
async function install(w) {
  let pending;
  w.handlers.install({ waitUntil: (p) => (pending = p) });
  await pending;
}
async function verify(w) {
  let pending;
  let ready;
  w.handlers.message({
    data: { type: "VERIFY" },
    ports: [{ postMessage: (data) => (ready = data.ready) }],
    waitUntil: (p) => (pending = p),
  });
  await pending;
  return ready;
}
test("readiness requires all shell resources", async () => {
  const w = worker();
  assert.equal(await verify(w), false);
  await install(w);
  assert.equal(await verify(w), true);
  w.entries.delete("/_next/static/app.js");
  assert.equal(await verify(w), false);
});
test("cached navigation works without network access", async () => {
  const w = worker();
  await install(w);
  let response;
  w.handlers.fetch({
    request: { url: "https://local.test/", method: "GET", mode: "navigate" },
    respondWith: (p) => (response = p),
  });
  assert.match(await (await response).text(), /app.js/);
});
test("missing bundled guide chunk prevents offline readiness", async () => {
  const w = worker();
  await install(w);
  w.entries.delete("/_next/static/app.js");
  assert.equal(await verify(w), false);
});
test("offline readiness includes the bundled Move the Moon game", async () => {
  const w = worker();
  await install(w);
  assert.equal(await verify(w), true);
  for (const name of ["index.html", "preview.png", "favicon.ico"])
    assert.ok(w.entries.has(`/games/move-the-moon/${name}`));
  w.entries.delete("/games/move-the-moon/preview.png");
  assert.equal(await verify(w), false);
});

test("game navigation uses its own cached document when the network is unavailable", async () => {
  const w = worker(); await install(w);
  w.entries.set('/games/move-the-moon/index.html', new Response('<title>Move the Moon</title>'));
  let response;
  w.handlers.fetch({ request: { url: 'https://local.test/games/move-the-moon', method: 'GET', mode: 'navigate' }, respondWith: p => response = p });
  assert.match(await (await response).text(), /Move the Moon/);
});
