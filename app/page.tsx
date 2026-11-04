"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  Reading,
  Incident,
  readRecords,
  saveRecord,
  validateReading,
} from "../lib/storage";
import { monitorOffline } from "../lib/offline";
import Icon from "./components/console-icon";
import NumberControl from "./components/number-control";
import Trends, { ReadingInsight } from "./components/trends";
import Wearables, { type SensorReading } from "./components/wearables";
import MoveTheMoon from "./components/move-the-moon";
import Wellbeing from "./components/wellbeing";
import Reminders from "./components/reminders";
import DataTransfer from "./components/data-transfer";
import InstallApp from "./components/install-app";
import { orderedReadings, values, explainReading } from "../lib/insights";
import { samples, guides } from "../lib/content";
type View =
  | "Dashboard"
  | "Measurements"
  | "Health history"
  | "Offline guides"
  | "Emergency assist"
  | "Wearables"
  | "Wellbeing"
  | "Move the Moon";
export default function Home() {
  const [view, setView] = useState<View>("Dashboard");
  const [historyPage, setHistoryPage] = useState(0);
  const [viewHistory, setViewHistory] = useState<View[]>([]);
  const [records, setRecords] = useState<Reading[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [cacheReady, setReady] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [offlineError, setOfflineError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [extraDirty, setExtraDirty] = useState(false);
  const [entrySource, setEntrySource] =
    useState<Reading["source"]>("Manual entry");
  const [entryTimestamp, setEntryTimestamp] = useState("");
  const [entryDevice, setEntryDevice] = useState("");
  const [kind, setKind] = useState("Heart rate");
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [note, setNote] = useState("");
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [guide, setGuide] = useState<number | null>(null);
  const [date, setDate] = useState("04 NOV 2026");
  const dirty = !!(first || second || note || extraDirty);
  const ready = cacheReady && storageReady;
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    queueMicrotask(() => {
      setDate(
        new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
          })
          .toUpperCase(),
      );
      update();
    });
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    Promise.all([
      readRecords<Reading>("readings"),
      readRecords<Incident>("incidents"),
    ])
      .then(([readings, savedIncidents]) => {
        setRecords(readings);
        setIncidents(savedIncidents);
        setStorageReady(true);
      })
      .catch((e) => setStorageError(e.message));
    const stopOffline = monitorOffline(setReady, setOfflineError);
    return () => {
      stopOffline();
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [view]);
  function navigate(next: View, track = true) {
    if (dirty && !window.confirm("Discard unsaved entries and notes?"))
      return false;
    setFirst("");
    setSecond("");
    setNote("");
    setReview(false);
    setStep(0);
    setEntrySource("Manual entry");
    setEntryTimestamp("");
    setEntryDevice("");
    setExtraDirty(false);
    if (track && next !== view)
      setViewHistory((previous) => [...previous, view]);
    setView(next);
    setError("");
    setNotice("");
    return true;
  }
  function goBack() {
    const previous = viewHistory.at(-1) ?? "Dashboard";
    if (navigate(previous, false))
      setViewHistory((history) => history.slice(0, -1));
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      const record: Reading = {
        id: crypto.randomUUID(),
        kind: kind as Reading["kind"],
        value: kind === "Heart rate" ? first : `${first} / ${second}`,
        unit: kind === "Heart rate" ? "bpm" : "mmHg",
        timestamp: entryTimestamp || new Date().toISOString(),
        note,
        source: entrySource,
        ...(entryDevice ? { device: entryDevice } : {}),
      };
      await saveRecord("readings", record);
      setStorageReady(true);
      setStorageError("");
      setRecords((v) => [record, ...v]);
      setHistoryPage(0);
      setFirst("");
      setSecond("");
      setNote("");
      setReview(false);
      setViewHistory((previous) => [...previous, view]);
      setView("Health history");
      setNotice("Reading saved on this device.");
    } catch (e) {
      setError((e as Error).message);
      setStorageReady(false);
      setStorageError(
        "Local saving failed; the draft is retained. Retry before relying on local persistence.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function saveIncident() {
    setBusy(true);
    try {
      const incident = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        notes: note,
      };
      await saveRecord("incidents", incident);
      setStorageReady(true);
      setStorageError("");
      setIncidents((v) => [incident, ...v]);
      setNote("");
      setStep(3);
      setNotice("Simulation saved locally.");
    } catch (e) {
      setError((e as Error).message);
      setStorageReady(false);
      setStorageError(
        "Local saving failed; the draft is retained. Retry before relying on local persistence.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function exportData() {
    try {
      const wellness = await readRecords("wellness");
      const blob = new Blob(
        [
          JSON.stringify(
            {
              schema: 1,
              exportedAt: new Date().toISOString(),
              readings: records,
              incidents,
              wellness,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "crew-health-report.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function reloadRecords() {
    const [r, i] = await Promise.all([
      readRecords<Reading>("readings"),
      readRecords<Incident>("incidents"),
    ]);
    setRecords(r);
    setHistoryPage(0);
    setIncidents(i);
  }
  function reviewSensor(r: SensorReading) {
    if (!navigate("Measurements")) return;
    setKind(r.kind);
    setFirst(r.first);
    setSecond(r.second);
    setEntrySource(r.source);
    setEntryTimestamp(r.timestamp);
    setEntryDevice(r.device);
    setReview(true);
  }
  const today = records.filter(
    (r) => new Date(r.timestamp).toDateString() === new Date().toDateString(),
  );
  const historyRows = useMemo(
    () =>
      [...records, ...samples].sort(
        (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp),
      ),
    [records],
  );
  const previousById = useMemo(() => {
    const result = new Map<string, Reading>();
    for (const k of ["Heart rate", "Blood pressure"] as const) {
      const rows = orderedReadings(records, k);
      for (let i = 1; i < rows.length; i++) result.set(rows[i].id, rows[i - 1]);
    }
    return result;
  }, [records]);
  const latest = (k: string) =>
    [...records]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .find((r) => r.kind === k) || samples.find((r) => r.kind === k)!;
  return (
    <div
      className={`app-shell ${view === "Emergency assist" ? "emergency-mode" : ""}`}
    >
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Dashboard");
          }}
        >
          <span className="brand-mark">
            <Icon name="planet" size={30} />
          </span>
          <span>
            CREW<span className="brand-small">HEALTH COMPANION</span>
          </span>
        </a>
        <div className="mission-tag">
          <i /> ASTERIA EXPEDITION <span>07</span>
        </div>
        <p className="nav-label">FLIGHT CONSOLE</p>
        <nav>
          {(
            [
              "Dashboard",
              "Measurements",
              "Health history",
              "Offline guides",
              "Wearables",
              "Wellbeing",
              "Move the Moon",
            ] as const
          ).map((v, i) => (
            <button
              key={v}
              className={`nav-item ${view === v ? "active" : ""}`}
              onClick={() => navigate(v)}
            >
              <Icon name={v} />
              <span>{v}</span>
              <small>0{i + 1}</small>
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="connection">
            <span className="signal">▂▄▆</span>
            <div>
              DEEP SPACE NETWORK
              <small>
                {online ? "Browser reports online" : "Device offline"} · local
                mode
              </small>
            </div>
          </div>
          <button
            className="emergency"
            onClick={() => navigate("Emergency assist")}
          >
            <Icon name="Emergency assist" /> Emergency assist <span>↗</span>
          </button>
          <small className="sim-note">SIMULATED PROTOCOL ONLY</small>
          <div className="crew">
            <div className="avatar">AC</div>
            <div>
              Alex Chen<small>Mission specialist · Crew 04</small>
            </div>
            <span className="crew-dot" />
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="cross">✦</span> ASTERIA{" "}
            <span className="divider">/</span> CREW HEALTH SYSTEMS
          </div>
          <div className="top-right">
            <span className="prototype">PROTOTYPE</span>
            <span>{date}</span>
            <Icon name="clock" size={16} />
            <span>UTC</span>
          </div>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                MISSION DAY 142 <span> / </span> MEDICAL DECK
              </div>
              <h1 ref={heading} tabIndex={-1}>
                {view === "Dashboard" ? "Your health. Mission critical." : view}
              </h1>
              <p>
                {view === "Dashboard"
                  ? "A little check-in. A stronger mission. Let’s keep you flight-ready."
                  : "Your personal health console, wherever the mission takes you."}
              </p>
            </div>
            <span className="system-status">
              <i />
              {ready
                ? "OFFLINE READY"
                : online
                  ? "CONNECTED · PRELOAD REQUIRED"
                  : "OFFLINE · CACHE UNVERIFIED"}
            </span>
          </div>
          <InstallApp ready={ready} />
          {view !== "Dashboard" && (
            <button className="back" onClick={goBack}>
              ← Back to {viewHistory.at(-1)?.toLowerCase() ?? "dashboard"}
            </button>
          )}
          {offlineError && (
            <div className="alert" role="alert">
              {offlineError}
            </div>
          )}
          {storageError && (
            <div className="alert" role="alert">
              {storageError} Local records are unavailable on this device.
            </div>
          )}
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              ✓ {notice}
            </div>
          )}
          {view === "Dashboard" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <span className="live-dot" /> PERSONAL HEALTH OVERVIEW
                  </div>
                  <h2>
                    One crew.
                    <br />
                    One extraordinary journey.
                  </h2>
                  <p>
                    Your next frontier starts with you.
                    <br />
                    Check in, track your vitals, and stay prepared.
                  </p>
                  <button
                    className="primary"
                    onClick={() => navigate("Measurements")}
                  >
                    Start daily check-in <Icon name="arrow" size={18} />
                  </button>
                  <div className="hero-foot">
                    <Icon name="shield" size={14} /> PRIVATE BY DESIGN <b>·</b>{" "}
                    STORED ON YOUR DEVICE
                  </div>
                </div>
                <div className="orbital" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />
                  <div className="planet">
                    <div className="planet-grid" />
                    <div className="planet-shine" />
                  </div>
                  <span className="orbit-point" />
                  <div className="planet-label">
                    VESSEL POSITION <b>28.4° N / 81.6° W</b>
                  </div>
                  <div className="orbital-top">
                    ✧ &nbsp; ASTERIA / EXPLORATION CLASS
                  </div>
                </div>
                <span className="hero-number">SYS. 01 / HEALTH</span>
              </section>
              <div className="launch-grid">
                {(
                  [
                    "Measurements",
                    "Health history",
                    "Offline guides",
                    "Wearables",
                    "Wellbeing",
                    "Move the Moon",
                  ] as const
                ).map((destination) => (
                  <button
                    key={destination}
                    onClick={() => navigate(destination)}
                  >
                    <Icon name={destination} />
                    <span>
                      {destination}
                      <small>
                        {
                          {
                            Measurements: "Tap to record a reading",
                            "Health history": "Trends and explained flags",
                            "Offline guides": "Your onboard field manual",
                            Wearables: "Bluetooth or simulated sensors",
                            Wellbeing: "Sleep, mood and body notes",
                            "Move the Moon": "Your game. A moment away.",
                          }[destination]
                        }
                      </small>
                    </span>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
              <div className="section-heading">
                <h2>
                  Vital signs <span>YOUR LATEST READINGS</span>
                </h2>
                <button onClick={() => navigate("Health history")}>
                  View health history <Icon name="arrow" size={16} />
                </button>
              </div>
              <div className="vitals">
                {["Heart rate", "Blood pressure"].map((k, i) => {
                  const r = latest(k);
                  return (
                    <button
                      className="vital-card"
                      key={k}
                      onClick={() => {
                        if (navigate("Measurements")) setKind(k);
                      }}
                    >
                      <div className="vital-title">
                        <span className={`metric-icon metric-${i}`}>
                          <Icon name={i ? "drop" : "heart"} />
                        </span>
                        {k}
                        <span className="sample-tag">
                          {r.id.startsWith("sample")
                            ? "SAMPLE"
                            : r.source === "Manual entry"
                              ? "MANUAL"
                              : r.source === "Simulated sensor"
                                ? "SIMULATED"
                                : "BLUETOOTH"}
                        </span>
                      </div>
                      <div className="vital-value">
                        {r.value}
                        <span>{r.unit}</span>
                        <svg
                          className="spark"
                          viewBox="0 0 160 48"
                          aria-hidden="true"
                        >
                          <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            points={orderedReadings(
                              [...samples, ...records],
                              k as Reading["kind"],
                            )
                              .slice(-12)
                              .map((item, index, array) => {
                                const v = values(item)[0];
                                const nums = array.map((a) => values(a)[0]);
                                const min = Math.min(...nums) - 2,
                                  max = Math.max(...nums) + 2;
                                return (
                                  (array.length === 1
                                    ? 80
                                    : (index / (array.length - 1)) * 155) +
                                  "," +
                                  (42 - ((v - min) / (max - min)) * 36)
                                );
                              })
                              .join(" ")}
                          />
                        </svg>
                      </div>
                      <div className="metric-footer">
                        <span>
                          ◇{" "}
                          {r.id.startsWith("sample")
                            ? "Fictional reference"
                            : "Recorded on device"}
                        </span>
                        <time>
                          {new Date(r.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                    </button>
                  );
                })}
                <div className="checkin-card">
                  <div className="vital-title">
                    <span className="metric-icon">
                      <Icon name="check" />
                    </span>
                    Daily check-in
                  </div>
                  <div className="check-count">
                    {new Set(today.map((r) => r.kind)).size}
                    <span>/ 2 complete</span>
                    <div className="progress-ring">
                      {Math.round(
                        (new Set(today.map((r) => r.kind)).size / 2) * 100,
                      )}
                      <small>%</small>
                    </div>
                  </div>
                  <div className="progress-track">
                    <span
                      style={{
                        width: `${new Set(today.map((r) => r.kind)).size * 50}%`,
                      }}
                    />
                  </div>
                  <small>A small routine. A vital difference.</small>
                </div>
              </div>
              <div className="lower-grid">
                <section className="panel checklist">
                  <div className="section-heading">
                    <h2>Today’s mission</h2>
                    <span className="tag">DAILY CHECK-IN</span>
                  </div>
                  <p>Make time for your most important system. You.</p>
                  {["Heart rate", "Blood pressure"].map((k, i) => (
                    <button
                      key={k}
                      className="task"
                      onClick={() => {
                        if (navigate("Measurements")) setKind(k);
                      }}
                    >
                      <span
                        className={`task-box ${today.some((r) => r.kind === k) ? "done" : ""}`}
                      >
                        {today.some((r) => r.kind === k) ? "✓" : ""}
                      </span>
                      <div>
                        Record {k.toLowerCase()}
                        <small>
                          {i
                            ? "A clearer picture of your circulation"
                            : "A moment to check your rhythm"}
                        </small>
                      </div>
                      <span className="task-time">{i ? "3" : "2"} MIN</span>
                      <Icon name="arrow" size={17} />
                    </button>
                  ))}
                </section>
                <section className="panel guide-panel">
                  <div className="eyebrow">KNOWLEDGE, WITHIN REACH</div>
                  <div className="guide-orbit">
                    <Icon name="Offline guides" size={44} />
                  </div>
                  <h2>Prepared for the unexpected.</h2>
                  <p>
                    Your onboard library. Measurement instructions and simulated
                    mission protocols, wherever you are.
                  </p>
                  <button onClick={() => navigate("Offline guides")}>
                    Explore offline guides <Icon name="arrow" size={17} />
                  </button>
                  <span className="available">
                    <i /> 3 BUNDLED GUIDES
                  </span>
                </section>
              </div>
            </>
          )}
          {view === "Measurements" && (
            <section className="panel form-panel">
              <div className="eyebrow">
                {entrySource.toUpperCase()} ·{" "}
                {review ? "02 / REVIEW" : "01 / MEASURE"}
              </div>
              <h2>
                {review ? "Review your reading" : "Make a moment for yourself."}
              </h2>
              {!review ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const message = validateReading(kind, first, second);
                    setError(message);
                    if (!message) setReview(true);
                  }}
                >
                  <label>
                    Measurement
                    <select
                      value={kind}
                      onChange={(e) => {
                        if (
                          dirty &&
                          !window.confirm(
                            "Discard unsaved entries before changing measurement?",
                          )
                        )
                          return;
                        setKind(e.target.value);
                        setFirst("");
                        setSecond("");
                        setNote("");
                      }}
                    >
                      <option>Heart rate</option>
                      <option>Blood pressure</option>
                    </select>
                  </label>
                  <div className="instruction">
                    <strong>Before you begin</strong>
                    <p>
                      {kind === "Heart rate" ? guides[0].text : guides[1].text}
                    </p>
                    <p>
                      <strong>Why it matters:</strong>{" "}
                      {kind === "Heart rate" ? guides[0].why : guides[1].why}
                    </p>
                    <ol className="guide-steps">
                      {(kind === "Heart rate"
                        ? guides[0]
                        : guides[1]
                      ).steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <a
                      className="source-link"
                      target="_blank"
                      rel="noreferrer"
                      href={
                        (kind === "Heart rate" ? guides[0] : guides[1]).source
                      }
                    >
                      Earth-based education source: American Heart Association ↗
                    </a>
                  </div>
                  <div className="input-row">
                    <NumberControl
                      label={kind === "Heart rate" ? "Heart rate" : "Systolic"}
                      unit={kind === "Heart rate" ? "bpm" : "mmHg"}
                      value={first}
                      onChange={(v) => {
                        setFirst(v);
                        setEntrySource("Manual entry");
                        setEntryTimestamp("");
                        setEntryDevice("");
                      }}
                    />
                    {kind === "Blood pressure" && (
                      <NumberControl
                        label="Diastolic"
                        unit="mmHg"
                        value={second}
                        onChange={(v) => {
                          setSecond(v);
                          setEntrySource("Manual entry");
                          setEntryTimestamp("");
                          setEntryDevice("");
                        }}
                      />
                    )}
                  </div>
                  <label>
                    Observation <span>(optional · fictional data only)</span>
                    <textarea
                      maxLength={10000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add context to this reading…"
                    />
                  </label>
                  <p className="fine-print">
                    Format validation only. No medical thresholds or diagnoses.
                  </p>
                  <button className="primary" type="submit">
                    Review reading <Icon name="arrow" size={18} />
                  </button>
                </form>
              ) : (
                <>
                  <div className="review-reading">
                    {first}
                    {kind === "Blood pressure" ? ` / ${second}` : ""}
                    <small>{kind === "Heart rate" ? "bpm" : "mmHg"}</small>
                  </div>
                  <p>
                    {kind} · {entrySource} ·{" "}
                    {entryTimestamp
                      ? new Date(entryTimestamp).toLocaleString()
                      : "timestamp assigned when saved"}{" "}
                    {entryDevice && " · " + entryDevice}
                  </p>
                  <ReadingInsight
                    reading={{
                      kind: kind as Reading["kind"],
                      value:
                        kind === "Heart rate" ? first : first + " / " + second,
                    }}
                    previous={orderedReadings(
                      records,
                      kind as Reading["kind"],
                    ).at(-1)}
                  />
                  <p>{note || "No observation added."}</p>
                  <div className="actions">
                    <button
                      className="secondary"
                      onClick={() => setReview(false)}
                    >
                      Edit reading
                    </button>
                    <button className="primary" onClick={save} disabled={busy}>
                      {busy ? "Saving…" : "Save to this device"}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
          {view === "Health history" && (
            <>
              <Trends records={[...samples, ...records]} />
              <section className="panel">
                <div className="section-heading">
                  <h2>Your health log</h2>
                  <button onClick={exportData}>Export JSON ↗</button>
                </div>
                <p>
                  Entries and source labels on this device. Exported files may
                  contain sensitive notes; handle them carefully.
                </p>
                {!storageReady && !storageError && (
                  <p role="status">Loading local records…</p>
                )}
                <div className="history-table">
                  <table>
                    <caption>
                      Prototype readings · samples fictional · local time ·
                      sensor receipt timestamps
                    </caption>
                    <thead>
                      <tr>
                        <th>Measurement</th>
                        <th>Reading</th>
                        <th>Date / time</th>
                        <th>Source / observation</th>
                        <th>Explained demo flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows
                        .slice(historyPage * 50, (historyPage + 1) * 50)
                        .map((r) => (
                          <tr key={r.id}>
                            <td>{r.kind}</td>
                            <td className="table-value">
                              {r.value} <small>{r.unit}</small>
                            </td>
                            <td>{new Date(r.timestamp).toLocaleString()}</td>
                            <td>
                              {r.id.startsWith("sample") ? "Sample · " : ""}
                              {r.source}
                              {r.device && (
                                <small className="block">{r.device}</small>
                              )}
                              <small className="block">{r.note}</small>
                            </td>
                            <td>
                              <details>
                                <summary>
                                  {
                                    explainReading(r, previousById.get(r.id))
                                      .title
                                  }
                                </summary>
                                <ReadingInsight
                                  reading={r}
                                  previous={previousById.get(r.id)}
                                />
                              </details>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  <button
                    className="secondary"
                    disabled={historyPage === 0}
                    onClick={() => setHistoryPage((p) => p - 1)}
                  >
                    Previous records
                  </button>
                  <span>
                    Page {historyPage + 1} of{" "}
                    {Math.max(1, Math.ceil(historyRows.length / 50))} ·{" "}
                    {historyRows.length} records
                  </span>
                  <button
                    className="secondary"
                    disabled={(historyPage + 1) * 50 >= historyRows.length}
                    onClick={() => setHistoryPage((p) => p + 1)}
                  >
                    Next records
                  </button>
                </div>
                <p className="fine-print">
                  Flags use arbitrary exhibition change rules, never clinical
                  thresholds. A missing flag does not mean a reading is
                  medically safe. Browser storage can be cleared or evicted.
                </p>
                {incidents.length > 0 && (
                  <>
                    <h3>Saved simulations</h3>
                    {incidents.map((i) => (
                      <div className="incident" key={i.id}>
                        <time>{new Date(i.timestamp).toLocaleString()}</time>
                        <p>{i.notes || "No observations recorded."}</p>
                      </div>
                    ))}
                  </>
                )}
              </section>
              <DataTransfer onImported={reloadRecords} />
            </>
          )}
          {view === "Offline guides" && (
            <section className="panel">
              <div className="section-heading">
                <h2>Your onboard library</h2>
                <span className="tag">BUNDLED IN APP SHELL</span>
              </div>
              <p>
                {ready
                  ? "Essential resources verified in this browser cache."
                  : "First visit requires a connection. Wait for verified offline readiness before disconnecting."}{" "}
                Installation is optional.
              </p>
              <div className="guides-grid">
                {guides.map((g, i) => (
                  <button
                    className={`guide-card ${guide === i ? "selected" : ""}`}
                    key={g.title}
                    onClick={() => setGuide(guide === i ? null : i)}
                    aria-expanded={guide === i}
                  >
                    <Icon name="Offline guides" size={30} />
                    <small>{g.category}</small>
                    <h3>{g.title}</h3>
                    <span>
                      {guide === i ? "Close guide −" : "Read guide →"}
                    </span>
                    {guide === i && (
                      <div>
                        <p>{g.text}</p>
                        <p>{g.why}</p>
                        <ol className="guide-steps">
                          {g.steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                        {g.source && (
                          <span className="fine-print">
                            Educational source: American Heart Association ·
                            Earth-based reference. Mission procedures require
                            medical review.
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
          {view === "Emergency assist" && (
            <section className="panel emergency-panel">
              <div className="eyebrow">
                TRAINING ENVIRONMENT · SIMULATION ONLY
              </div>
              <h2>
                {
                  [
                    "Emergency assist simulation",
                    "Fictional scenario: crew observation",
                    "Record your observations",
                    "Incident summary",
                  ][step]
                }
              </h2>
              <div className="alert">
                This prototype is not medical guidance. No treatment protocol is
                provided. Follow your actual approved mission procedures in a
                real emergency.
              </div>
              {step === 0 ? (
                <>
                  <p>
                    Practice navigating a disconnected mission workflow with
                    fictional observations. This simulation provides no
                    diagnosis, medication or treatment instructions.
                  </p>
                  <button className="emergency" onClick={() => setStep(1)}>
                    Open fictional scenario →
                  </button>
                </>
              ) : step === 1 ? (
                <>
                  <p className="protocol">
                    Approved mission protocol would appear here.
                  </p>
                  <p>
                    Placeholder 1 of 1 · A medically reviewed mission protocol
                    must replace this placeholder before operational use.
                  </p>
                  <button className="primary" onClick={() => setStep(2)}>
                    Continue to observation log →
                  </button>
                </>
              ) : step === 2 ? (
                <>
                  <label>
                    Fictional observations
                    <textarea
                      maxLength={10000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Record simulation observations…"
                    />
                  </label>
                  <p>Timestamp will be recorded when the incident is saved.</p>
                  <button
                    className="primary"
                    onClick={saveIncident}
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Save simulation & view summary"}
                  </button>
                </>
              ) : (
                <>
                  <p>Simulation complete. No medical action was recommended.</p>
                  <time>
                    {incidents[0] &&
                      new Date(incidents[0].timestamp).toLocaleString()}
                  </time>
                  <p className="protocol">
                    {incidents[0]?.notes || "No observations recorded."}
                  </p>
                  <button
                    className="secondary"
                    onClick={() => navigate("Health history")}
                  >
                    View saved incident
                  </button>
                </>
              )}
            </section>
          )}
          <div hidden={view !== "Wearables"}>
            <Wearables onReview={reviewSensor} />
          </div>
          {view === "Wellbeing" && <Wellbeing onDirty={setExtraDirty} />}
          {view === "Move the Moon" && <MoveTheMoon />}
          <Reminders />
          <button
            className="global-emergency"
            onClick={() => navigate("Emergency assist")}
          >
            <Icon name="Emergency assist" size={17} /> Emergency assist
          </button>
          <footer>
            <span>
              <Icon name="shield" size={14} />{" "}
              {ready
                ? "ESSENTIAL RESOURCES CACHED"
                : "FIRST VISIT REQUIRES CONNECTION"}{" "}
              <b>·</b> DEVICE-LOCAL STORAGE
            </span>
            <span>
              SPACE APPS 2026 <b>/</b> SAMPLES FICTIONAL · NOT MEDICAL SOFTWARE
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
