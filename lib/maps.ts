export type Coordinates = { lat: number; lon: number };
function coordinateString({ lat, lon }: Coordinates) {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  )
    throw new Error("Choose valid map coordinates.");
  return `${lat.toFixed(6)},${lon.toFixed(6)}`;
}
export function googleMapsUrl(place: Coordinates, streetView = false) {
  const params = new URLSearchParams({
    api: "1",
    map_action: streetView ? "pano" : "map",
  });
  params.set(streetView ? "viewpoint" : "center", coordinateString(place));
  if (!streetView) {
    params.set("zoom", "14");
    params.set("basemap", "satellite");
  }
  return `https://www.google.com/maps/@?${params}`;
}
export function googleSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: query.trim().slice(0, 300) })}`;
}
export function googleEmbedUrl(
  place: Coordinates,
  key: string,
  streetView = false,
) {
  if (!key.trim()) return "";
  const params = new URLSearchParams({ key });
  params.set(streetView ? "location" : "center", coordinateString(place));
  if (!streetView) {
    params.set("zoom", "14");
    params.set("maptype", "satellite");
  }
  return `https://www.google.com/maps/embed/v1/${streetView ? "streetview" : "view"}?${params}`;
}
