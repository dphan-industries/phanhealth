import { useEffect, useState } from "react";
import {
  googleMapsUrl,
  googleSearchUrl,
  googleEmbedUrl,
  type Coordinates,
} from "../../lib/maps";
export default function GoogleExplorer({
  place,
  onChoose,
  onOffline,
}: {
  place: Coordinates & { name: string };
  onChoose: (place: Coordinates & { name: string }) => void;
  onOffline: () => void;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY || "";
  const [activated, setActivated] = useState(false);
  const [street, setStreet] = useState(true);
  const [search, setSearch] = useState("");
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    queueMicrotask(update);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setSlow(true), 15000);
    return () => clearTimeout(timer);
  }, [loading]);
  function activate(nextStreet: boolean) {
    setStreet(nextStreet);
    setActivated(true);
    setLoading(true);
    setSlow(false);
    setRevision((r) => r + 1);
  }
  return (
    <div
      className={`google-explorer ${activated && key && online ? "map-activated" : ""}`}
    >
      <div className="google-explorer-bar">
        <span>
          <b>Google Maps</b>
          <small>ONLINE EXPLORER · RECORDED IMAGERY</small>
        </span>
        <div>
          <button
            aria-pressed={!street}
            onClick={() => {
              if (key) activate(false);
              else setStreet(false);
            }}
          >
            Satellite
          </button>
          <button
            aria-pressed={street}
            onClick={() => {
              if (key) activate(true);
              else setStreet(true);
            }}
          >
            Street View
          </button>
        </div>
      </div>
      {activated && key && online ? (
        <>
          <iframe
            key={`${revision}-${place.lat}-${place.lon}-${street}`}
            title={`Google ${street ? "Street View" : "satellite map"} near ${place.name}`}
            src={googleEmbedUrl(place, key, street)}
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => {
              setLoading(false);
              setSlow(false);
            }}
            onError={() => {
              setLoading(false);
              setSlow(true);
            }}
          />
          {loading && (
            <div className="map-status" role="status">
              Opening Google {street ? "Street View" : "Maps"}…
            </div>
          )}
          {slow && (
            <div className="map-status" role="status">
              The Google view could not be confirmed. Coverage, connectivity or
              the configured API key may be unavailable.{" "}
              <a
                href={googleMapsUrl(place, street)}
                target="_blank"
                rel="noreferrer"
              >
                Open directly in Google ↗
              </a>
            </div>
          )}
          <div className="map-footer">
            <span>
              {place.name} · imagery dates and coverage are provided by Google.
            </span>
            <a
              href={googleMapsUrl(place, street)}
              target="_blank"
              rel="noreferrer"
            >
              Open larger ↗
            </a>
            <button onClick={() => setActivated(false)}>
              Close online view
            </button>
          </div>
        </>
      ) : (
        <div className="google-landing">
          <div className="map-motif" aria-hidden="true">
            <span />
            <span />
            <span />
            <i />
          </div>
          <div className="google-landing-copy">
            <span className="tag">A LITTLE CLOSER TO HOME</span>
            <h3>
              Find a place.
              <br />
              Step into the view.
            </h3>
            <p>
              Explore streets in 360°, look around, and follow the navigation
              arrows to move through places with Street View coverage.
            </p>
            <p className="selected-place">
              ⌖ {place.name}
              <small>
                {place.lat.toFixed(3)}°, {place.lon.toFixed(3)}°
              </small>
            </p>
            {!online ? (
              <div className="map-offline" role="status">
                Your device reports offline. Google views need a connection; the
                bundled globe, nature scenes and game remain available.
              </div>
            ) : (
              <div className="actions">
                {key ? (
                  <button className="primary" onClick={() => activate(street)}>
                    Load Google {street ? "Street View" : "Maps"}
                  </button>
                ) : (
                  <a
                    className="primary"
                    href={googleMapsUrl(place, street)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {street
                      ? "Walk here in Google Street View"
                      : "Explore Google satellite map"}{" "}
                    ↗
                  </a>
                )}
                <button
                  className="secondary"
                  onClick={() => {
                    onChoose({
                      name: "Paris · Google Street View starting point",
                      lat: 48.857832,
                      lon: 2.295226,
                    });
                    setStreet(true);
                    if (activated) setActivated(false);
                  }}
                >
                  Try Paris
                </button>
              </div>
            )}
            <p className="map-disclosure">
              {key
                ? "Loads an online Google view when selected."
                : "Opens Google in another tab. The in-app embed is prepared but needs a configured Google Maps API key."}{" "}
              Street View is recorded photography, with gaps in coverage. Health
              records are not sent.
            </p>
            <button className="text-button" onClick={onOffline}>
              Explore the offline globe instead →
            </button>
          </div>
        </div>
      )}
      <form
        className="google-place-search"
        onSubmit={(e) => {
          e.preventDefault();
          if (search.trim())
            window.open(
              googleSearchUrl(search),
              "_blank",
              "noopener,noreferrer",
            );
        }}
      >
        <label>
          Search a city, street or landmark
          <input
            value={search}
            maxLength={300}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="A familiar street, Kyoto, Yosemite…"
          />
        </label>
        <a
          aria-disabled={!search.trim()}
          className="secondary"
          href={search.trim() ? googleSearchUrl(search) : undefined}
          target="_blank"
          rel="noreferrer"
        >
          Find in Google Maps ↗
        </a>
        <span>
          In Google Maps, choose a blue Street View route and follow its arrows.
          Country/coordinate controls below set this panel’s destination.
        </span>
      </form>
    </div>
  );
}
