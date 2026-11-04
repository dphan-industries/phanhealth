import { useEffect, useRef, useState } from "react";
import GoogleExplorer from "./google-explorer";
import ConstellationGarden from "./constellation-garden";
import EarthGlobe, { destinations } from "./earth-globe";
import {
  readRecords,
  saveRecord,
  type Preference,
  type LocalResource,
} from "../../lib/storage";
type Place = { name: string; lat: number; lon: number };
export default function EarthRoom({
  onEmergency,
}: {
  onEmergency: () => void;
}) {
  const [place, setPlace] = useState<Place>({
    name: "Earth · home",
    lat: 25,
    lon: 0,
  });
  const [latDraft, setLatDraft] = useState("25.00");
  const [lonDraft, setLonDraft] = useState("0.00");
  function choosePlace(next: Place) {
    setPlace(next);
    setLatDraft(next.lat.toFixed(2));
    setLonDraft(next.lon.toFixed(2));
  }
  const [query, setQuery] = useState("");
  const [scene, setScene] = useState("Earth");
  const [favorite, setFavorite] = useState<Place | null>(null);
  const [quiet, setQuiet] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [minutes, setMinutes] = useState("2");
  const [pace, setPace] = useState("5");
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [audioOn, setAudioOn] = useState(false);
  const [volume, setVolume] = useState(0.12);
  const audio = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const roomRef = useRef<HTMLElement>(null);
  const quietButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!quiet) return;
    const previous = document.activeElement as HTMLElement | null;
    quietButton.current?.focus();
    function trap(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setQuiet(false);
        return;
      }
      if (event.key !== "Tab") return;
      const buttons = [
        ...(roomRef.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href], input, select",
        ) ?? []),
      ].filter((el) => el.offsetParent !== null);
      const first = buttons[0],
        last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [quiet]);
  useEffect(
    () => () => {
      if (image) URL.revokeObjectURL(image);
    },
    [image],
  );
  useEffect(() => {
    let url = "";
    Promise.all([
      readRecords<Preference>("preferences"),
      readRecords<LocalResource>("resources"),
    ])
      .then(([prefs, resources]) => {
        const saved = prefs.find((p) => p.id === "earth-home");
        if (saved) {
          try {
            const home = JSON.parse(saved.value);
            if (
              typeof home.name === "string" &&
              Number.isFinite(home.lat) &&
              Number.isFinite(home.lon)
            )
              setFavorite(home);
          } catch {
            /* invalid preference leaves defaults */
          }
        }
        const photo = resources.find((r) => r.id === "earth-photo");
        if (photo) {
          url = URL.createObjectURL(photo.blob);
          setImage(url);
          setImageName(photo.name);
        }
      })
      .catch(() =>
        setMessage(
          "Saved Earth preferences are unavailable. Default scenes still work.",
        ),
      );
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      setElapsed((e) =>
        Math.min(Number(minutes) * 60, e + (now - previous) / 1000),
      );
      previous = now;
    }, 250);
    return () => clearInterval(timer);
  }, [running, minutes]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  useEffect(() => {
    if (gain.current) gain.current.gain.value = volume;
  }, [volume]);
  async function sound() {
    if (audioOn) {
      await audio.current?.suspend();
      setAudioOn(false);
      return;
    }
    try {
      if (!audio.current) {
        audio.current = new AudioContext();
        const ctx = audio.current;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < data.length; i++) {
          last = (last + (Math.random() * 2 - 1) * 0.025) / 1.025;
          data[i] = last * 3;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        gain.current = ctx.createGain();
        gain.current.gain.value = volume;
        source.connect(gain.current);
        gain.current.connect(ctx.destination);
        source.start();
      }
      await audio.current.resume();
      setAudioOn(true);
    } catch {
      setMessage(
        "Audio unavailable. The quiet visual session remains available.",
      );
    }
  }
  async function saveHome() {
    try {
      await saveRecord("preferences", {
        id: "earth-home",
        value: JSON.stringify(place),
      });
      setFavorite(place);
      setMessage("Home destination saved on this device.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setMessage("Choose a JPEG, PNG or WebP image smaller than 8 MB.");
      return;
    }
    try {
      await saveRecord("resources", {
        id: "earth-photo",
        name: file.name,
        timestamp: new Date().toISOString(),
        blob: file,
      });
      if (image) URL.revokeObjectURL(image);
      setImage(URL.createObjectURL(file));
      setImageName(file.name);
      setScene("My view");
      setMessage(
        "Personal photo saved locally for offline viewing. It is not a live camera.",
      );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  const done = elapsed >= Number(minutes) * 60;
  const phase =
    Math.floor(elapsed / Number(pace)) % 2 === 0
      ? "Breathe in gently"
      : "Breathe out gently";
  return (
    <section
      ref={roomRef}
      role={quiet ? "dialog" : undefined}
      aria-modal={quiet || undefined}
      aria-label={quiet ? "Earth Room quiet view" : undefined}
      className={`earth-room ${quiet ? "quiet-mode" : ""}`}
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow">EARTH ROOM · A MOMENT OF HOME</div>
          <h2>Somewhere familiar. A little space.</h2>
        </div>
        <div className="quiet-actions">
          {quiet && (
            <>
              <button
                className="secondary"
                onClick={() => {
                  setRunning(false);
                  setElapsed(0);
                  setBreathing(false);
                  void audio.current?.suspend();
                  setAudioOn(false);
                }}
              >
                Stop session
              </button>
              <button className="secondary" onClick={onEmergency}>
                Emergency assist
              </button>
            </>
          )}
          <button
            ref={quietButton}
            className="secondary"
            onClick={() => setQuiet(!quiet)}
          >
            {quiet ? "Show controls" : "Quiet view"}
          </button>
        </div>
      </div>
      <div className="earth-stage" data-scene={scene}>
        {scene === "Earth" ? (
          <GoogleExplorer
            place={place}
            onChoose={choosePlace}
            onOffline={() => setScene("Globe")}
          />
        ) : scene === "Globe" ? (
          <EarthGlobe
            lat={place.lat}
            lon={place.lon}
            onPick={(lat, lon) =>
              choosePlace({ name: "Selected coordinates", lat, lon })
            }
          />
        ) : ["Ocean", "Forest", "Mountains"].includes(scene) ? (
          <div
            className={`realistic-scene nature-${scene.toLowerCase()}`}
            role="img"
            aria-label={`Photorealistic AI-generated ${scene.toLowerCase()} sanctuary`}
            style={{
              backgroundImage: `url(/scenes/${scene.toLowerCase()}.webp)`,
            }}
          />
        ) : scene === "My view" && image ? (
          <div
            className="personal-scene"
            style={{ backgroundImage: `url("${image}")` }}
            role="img"
            aria-label={imageName}
          />
        ) : scene === "Stillness" ? (
          <div className="landscape landscape-stillness" aria-hidden="true" />
        ) : null}
        <div className="game-holder" hidden={scene !== "Play"}>
          <ConstellationGarden />
        </div>
        {!["Earth", "Play"].includes(scene) && (
          <div className="scene-caption">
            <span className="tag">
              {scene === "My view"
                ? "LOCAL PHOTO · NOT LIVE"
                : scene === "Globe"
                  ? "OFFLINE 3D MAP"
                  : scene === "Stillness"
                    ? "OFFLINE QUIET SPACE"
                    : "AI-GENERATED SCENERY · OFFLINE · NOT LIVE"}
            </span>
            <h3>
              {scene === "Globe"
                ? place.name
                : scene === "My view"
                  ? imageName
                  : scene + " sanctuary"}
            </h3>
            <p>
              {scene === "Globe"
                ? `${place.lat.toFixed(2)}° latitude / ${place.lon.toFixed(2)}° longitude · drag to explore`
                : "A quiet view of home. Stay as long as you like."}
            </p>
          </div>
        )}
        {breathing && !["Earth", "Play"].includes(scene) && (
          <div className="breathing-overlay">
            <div
              className={`breath-orb ${running && !done ? "breath-active" : ""}`}
              style={{ animationDuration: `${Number(pace) * 2}s` }}
            />
            <p aria-live="off">
              {done
                ? "Session complete"
                : running
                  ? phase
                  : "Breathe at your own pace"}
            </p>
          </div>
        )}
      </div>
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
      <div className="earth-controls">
        <div className="scene-choices" aria-label="Choose a calming scene">
          {[
            "Earth",
            "Globe",
            "Ocean",
            "Forest",
            "Mountains",
            "Stillness",
            "Play",
            ...(image ? ["My view"] : []),
          ].map((s) => (
            <button
              key={s}
              className={scene === s ? "selected" : ""}
              aria-pressed={scene === s}
              onClick={() => setScene(s)}
            >
              {s === "Earth"
                ? "Google Maps"
                : s === "Globe"
                  ? "Offline globe"
                  : s === "Play"
                    ? "Mini game"
                    : s}
            </button>
          ))}
        </div>
        <div className="earth-grid">
          <section className="panel">
            <h3>Explore the world</h3>
            <label>
              Find a country or territory
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations…"
              />
            </label>
            <div className="destination-list">
              {destinations
                .filter((d) =>
                  d.name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((d) => (
                  <button
                    key={d.name}
                    className={place.name === d.name ? "selected" : ""}
                    onClick={() => {
                      choosePlace(d);
                      setScene("Earth");
                    }}
                  >
                    {d.name}
                    <span>↗</span>
                  </button>
                ))}
            </div>
            <p>
              Bundled Natural Earth geography. Country centers are approximate;
              boundaries and names are cartographic data, not political
              statements.
            </p>
            <div className="input-row">
              <label>
                Latitude
                <input
                  type="number"
                  min="-90"
                  max="90"
                  step=".01"
                  value={latDraft}
                  onChange={(e) => setLatDraft(e.target.value)}
                />
              </label>
              <label>
                Longitude
                <input
                  type="number"
                  min="-180"
                  max="180"
                  step=".01"
                  value={lonDraft}
                  onChange={(e) => setLonDraft(e.target.value)}
                />
              </label>
            </div>
            <button
              className="secondary"
              onClick={() => {
                if (
                  latDraft === "" ||
                  lonDraft === "" ||
                  !Number.isFinite(+latDraft) ||
                  !Number.isFinite(+lonDraft) ||
                  Math.abs(+latDraft) > 90 ||
                  Math.abs(+lonDraft) > 180
                ) {
                  setMessage(
                    "Enter latitude from −90 to 90 and longitude from −180 to 180.",
                  );
                  return;
                }
                choosePlace({
                  name: "Selected coordinates",
                  lat: +latDraft,
                  lon: +lonDraft,
                });
                setScene("Earth");
                setMessage("Coordinates selected.");
              }}
            >
              Go to coordinates
            </button>
            <div className="actions">
              <button className="secondary" onClick={saveHome}>
                Save as home
              </button>
              {favorite && (
                <button
                  className="primary"
                  onClick={() => {
                    choosePlace(favorite);
                    setScene("Earth");
                  }}
                >
                  Take me home
                </button>
              )}
            </div>
          </section>
          <section className="panel">
            <h3>A quiet moment</h3>
            <p>
              Optional comfort tools, not a treatment or a health score. Choose
              Earth, nature illustrations or a personal photo. Sound starts only
              when you ask.
            </p>
            <label>
              Session length
              <select
                value={minutes}
                disabled={running && !done}
                onChange={(e) => {
                  setMinutes(e.target.value);
                  setElapsed(0);
                }}
              >
                <option value="1">1 minute</option>
                <option value="2">2 minutes</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
              </select>
            </label>
            <label>
              Breathing pace
              <select value={pace} onChange={(e) => setPace(e.target.value)}>
                <option value="3">3 seconds each way</option>
                <option value="4">4 seconds each way</option>
                <option value="5">5 seconds each way</option>
                <option value="6">6 seconds each way</option>
              </select>
            </label>
            <button
              className="secondary"
              aria-pressed={breathing}
              onClick={() => setBreathing(!breathing)}
            >
              {breathing ? "Hide" : "Show"} breathing guide
            </button>
            <div
              className="session-time"
              role="timer"
              aria-label="Session remaining"
            >
              {Math.floor(Math.max(0, Number(minutes) * 60 - elapsed) / 60)}:
              {String(
                Math.floor(Math.max(0, Number(minutes) * 60 - elapsed) % 60),
              ).padStart(2, "0")}
            </div>
            <div className="actions">
              <button
                className="primary"
                onClick={() => {
                  if (done) setElapsed(0);
                  setRunning(!running || done);
                }}
              >
                {running && !done
                  ? "Pause"
                  : done
                    ? "Start again"
                    : "Start session"}
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setRunning(false);
                  setElapsed(0);
                  setBreathing(false);
                  void audio.current?.suspend();
                  setAudioOn(false);
                }}
              >
                Stop
              </button>
            </div>
            {done && (
              <p role="status">
                Your session is complete. Stay a while or return to your
                mission.
              </p>
            )}
            <button
              className="text-button"
              aria-pressed={audioOn}
              onClick={sound}
            >
              {audioOn ? "Mute" : "Play"} synthesized ocean-like ambience
            </button>
            <label>
              Sound level
              <input
                type="range"
                min="0"
                max=".4"
                step=".01"
                value={volume}
                onChange={(e) => setVolume(+e.target.value)}
              />
            </label>
            <label>
              Bring a familiar view{" "}
              <small>Optional local photo · up to 8 MB</small>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => void upload(e.target.files?.[0])}
              />
            </label>
          </section>
        </div>
        <section className="panel live-option">
          <h3>A window beyond the simulation</h3>
          <p>
            Live orbital views require a connection and may switch to recorded
            footage. No worldwide street-level live-camera coverage is bundled.
            These external sites receive ordinary connection information when
            opened; health records are not sent.
          </p>
          <div className="actions">
            <a
              className="secondary"
              href="https://www.nasa.gov/live/"
              target="_blank"
              rel="noreferrer"
            >
              Open NASA live programming ↗
            </a>
            <a
              className="secondary"
              href={`https://www.google.com/maps/@?api=1&map_action=map&center=${place.lat},${place.lon}&zoom=9`}
              target="_blank"
              rel="noreferrer"
            >
              Explore selected coordinates online ↗
            </a>
          </div>
          <p className="fine-print">
            Google Street View and external map imagery are recorded, not live.
            All offline scenes remain accessible without either link.
          </p>
        </section>
      </div>
    </section>
  );
}
