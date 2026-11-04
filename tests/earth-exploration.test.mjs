import { test } from "node:test";
import assert from "node:assert/strict";
import { googleMapsUrl, googleEmbedUrl, googleSearchUrl } from "../lib/maps.ts";
import { gardens, connectStar } from "../lib/garden.ts";
test("Google URLs launch actual Street View and satellite modes with encoded coordinates", () => {
  const p = { lat: 48.857832, lon: 2.295226 };
  const street = new URL(googleMapsUrl(p, true));
  assert.equal(street.origin, "https://www.google.com");
  assert.equal(street.searchParams.get("api"), "1");
  assert.equal(street.searchParams.get("map_action"), "pano");
  assert.equal(street.searchParams.get("viewpoint"), "48.857832,2.295226");
  const map = new URL(googleMapsUrl(p));
  assert.equal(map.searchParams.get("basemap"), "satellite");
  assert.throws(() => googleMapsUrl({ lat: 91, lon: 0 }), /valid/);
  assert.throws(() => googleMapsUrl({ lat: 0, lon: NaN }), /valid/);
});
test("Google embed remains unconfigured without a key and uses supported embed endpoints", () => {
  const p = { lat: 25, lon: 0 };
  assert.equal(googleEmbedUrl(p, ""), "");
  const street = new URL(googleEmbedUrl(p, "restricted-example", true));
  assert.equal(street.pathname, "/maps/embed/v1/streetview");
  assert.equal(street.searchParams.get("location"), "25.000000,0.000000");
  const search = new URL(googleSearchUrl("Kyoto & gardens"));
  assert.equal(search.searchParams.get("query"), "Kyoto & gardens");
});
test("garden advances only the next star and never removes progress on another selection", () => {
  assert.equal(connectStar(0, 0, 6), 1);
  assert.equal(connectStar(1, 4, 6), 1);
  assert.equal(connectStar(3, 0, 6), 3);
  assert.equal(connectStar(6, 6, 6), 6);
  for (const g of gardens) {
    assert.equal(
      new Set(g.points.map((p) => p.join(","))).size,
      g.points.length,
    );
    assert.ok(g.points.every(([x, y]) => x > 5 && x < 95 && y > 5 && y < 95));
    let progress = 0;
    for (let i = 0; i < g.points.length; i++)
      progress = connectStar(progress, i, g.points.length);
    assert.equal(progress, g.points.length);
  }
});
