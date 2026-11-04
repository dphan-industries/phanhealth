"use client";
import { useEffect, useState } from "react";
import {
  type Reading,
  type Incident,
  type Wellness,
  type Preference,
  readRecords,
  saveRecord,
} from "../../lib/storage";
import {
  assessReading,
  ENVIRONMENTS,
  HAZARDS,
  METRICS,
  SOURCES,
  type Environment,
} from "../../lib/health";
export default function MissionHealth({
  records,
  onMeasure,
  onEmergency,
  onSaved,
  onDirty,
}: {
  records: Reading[];
  onMeasure: () => void;
  onEmergency: () => void;
  onSaved: () => Promise<void>;
  onDirty: (dirty: boolean) => void;
}) {
  const [environment, setEnvironment] = useState<Environment>("Spacecraft");
  const [resting, setResting] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [includeDemo, setIncludeDemo] = useState(false);
  const [action, setAction] = useState("");
  const [outcome, setOutcome] = useState("");
  const [selected, setSelected] = useState("General health follow-up");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
    readRecords<Preference>("preferences")
      .then((rows) => {
        const saved = rows.find((x) => x.id === "mission-environment");
        if (saved && saved.value in ENVIRONMENTS)
          setEnvironment(saved.value as Environment);
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    onDirty(!!(action || outcome));
    return () => onDirty(false);
  }, [action, outcome, onDirty]);
  const candidates = records.filter(
    (r) => includeDemo || r.source !== "Simulated sensor",
  );
  const recent = (kind: Reading["kind"]) =>
    candidates
      .filter((r) => r.kind === kind)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  const redFlags = [
    "Chest pain or pressure",
    "Severe breathing difficulty",
    "Collapse / unresponsive / not breathing normally",
    "New weakness, speech or vision change",
    "Confusion or seizure",
  ];
  async function changeEnvironment(value: Environment) {
    setEnvironment(value);
    try {
      await saveRecord("preferences", { id: "mission-environment", value });
      setMessage("Environment saved on this device.");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function logAction() {
    if (!action.trim()) {
      setError("Describe the action or follow-up before saving.");
      return;
    }
    setBusy(true);
    try {
      await saveRecord("incidents", {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        notes: `Assessment follow-up — ${selected}\nEnvironment: ${environment}\nSymptoms reported: ${symptoms.join(", ") || "None selected; not a medical clearance"}\nAction: ${action}\nOutcome / next check: ${outcome}\nEducational decision support, not a diagnosis.`,
      });
      await onSaved();
      setAction("");
      setOutcome("");
      setMessage("Follow-up saved in Health history incident and action logs.");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function exportHandoff() {
    try {
      const [wellness, incidents] = await Promise.all([
        readRecords<Wellness>("wellness"),
        readRecords<Incident>("incidents"),
      ]);
      const checkin = wellness.sort((a, b) =>
        b.timestamp.localeCompare(a.timestamp),
      )[0];
      const followups = incidents
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, 3);
      const latest = METRICS.map((k) => recent(k)[0]).filter(Boolean);
      const text = `CREW HEALTH — MANUAL MEDICAL HANDOFF\nCreated: ${new Date().toISOString()}\nEnvironment: ${environment}\nSymptoms: ${symptoms.join(", ") || "None selected (not a safety assessment)"}\n${latest.map((r) => `${r.kind}: ${r.value} ${r.unit} | ${r.timestamp} | ${r.source} | ${r.note}`).join("\n")}\nAction: ${action || "Not recorded"}\nOutcome / follow-up: ${outcome || "Not recorded"}\nEducational prototype; no diagnosis or transmission. Missing values are unknown.`;
      const combined =
        text +
        (checkin
          ? `\nLatest wellbeing (${checkin.timestamp}): sleep ${checkin.sleep} h; mood ${checkin.mood}; ${checkin.bodyArea}; ${checkin.note}\nRoutine: ${JSON.stringify(checkin.routine || {})}`
          : "\nNo wellbeing entry available.") +
        `\nRecent saved incident / follow-up logs:\n${followups.map((i) => i.timestamp + " — " + i.notes).join("\n") || "None"}`;
      const url = URL.createObjectURL(
        new Blob([combined], { type: "text/plain" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "crew-medical-handoff.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="mission-health">
      <section className="panel">
        <div className="eyebrow">ASSESS · UNDERSTAND · ACT · FOLLOW UP</div>
        <h2>Your mission health briefing</h2>
        <p>
          Adult Earth reference guidance, adapted with mission-context cautions.
          This is an educational prototype, not a diagnosis or an approved
          flight treatment system. A reassuring number never overrides symptoms.
        </p>
        <label>
          Mission environment
          <select
            value={environment}
            onChange={(e) =>
              void changeEnvironment(e.target.value as Environment)
            }
          >
            {Object.keys(ENVIRONMENTS).map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <div className="instruction">
          <strong>{environment}</strong>
          <p>{ENVIRONMENTS[environment]}</p>
        </div>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        <fieldset>
          <legend>Symptoms now — select any that apply</legend>
          <p>Do not delay real emergency response to complete this form.</p>
          <div className="symptom-grid">
            {redFlags.map((s) => (
              <label key={s}>
                <input
                  type="checkbox"
                  checked={symptoms.includes(s)}
                  onChange={(e) =>
                    setSymptoms((old) =>
                      e.target.checked
                        ? [...old, s]
                        : old.filter((x) => x !== s),
                    )
                  }
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
        {symptoms.length > 0 && (
          <div className="assessment urgent" role="alert">
            <h3>! Activate emergency response now</h3>
            <p>
              Alert the crew medical officer and nearby crew. Follow the
              approved onboard emergency procedure; do not wait for a ground
              reply or another measurement. On Earth, contact local emergency
              services. This app sends no alert.
            </p>
            <button className="emergency" onClick={onEmergency}>
              Open emergency guidance
            </button>
          </div>
        )}
        <div className="actions">
          <button className="primary" onClick={onMeasure}>
            Record a health indicator
          </button>
          <button className="secondary" onClick={exportHandoff}>
            Download medical handoff
          </button>
        </div>
        <p className="fine-print">
          Handoff downloads may contain sensitive data; nothing is sent
          automatically.
        </p>
      </section>
      <section className="panel">
        <h2>Latest indicators and next steps</h2>
        <label className="check-label">
          <input
            type="checkbox"
            checked={resting}
            onChange={(e) => setResting(e.target.checked)}
          />
          The latest pulse was taken at rest
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={includeDemo}
            onChange={(e) => setIncludeDemo(e.target.checked)}
          />
          Include simulated sensor records for training
        </label>
        <p>
          Fictional starter samples are excluded. Each card shows its source and
          timestamp. Older readings describe that moment, not your condition
          now.
        </p>
        <div className="assessment-grid">
          {METRICS.map((kind) => {
            const [r, previous] = recent(kind);
            if (!r)
              return (
                <article key={kind} className="assessment context">
                  <h3>○ {kind}: no reading</h3>
                  <p>Unknown. Missing information is not a normal result.</p>
                  <button className="secondary" onClick={onMeasure}>
                    Measure {kind.toLowerCase()}
                  </button>
                </article>
              );
            const result = assessReading(r, resting);
            const stale = now - Date.parse(r.timestamp) > 86400000;
            return (
              <article className={`assessment ${result.level}`} key={kind}>
                <span className="tag">
                  {r.source}
                  {stale ? " · OLDER THAN 24 HOURS" : ""}
                </span>
                <h3>
                  {kind}: {r.value} {r.unit}
                </h3>
                <time>{new Date(r.timestamp).toLocaleString()}</time>
                <h4>
                  {result.level === "urgent"
                    ? "!"
                    : result.level === "review"
                      ? "△"
                      : "○"}{" "}
                  {result.title}
                </h4>
                <p>{result.why}</p>
                {previous ? (
                  <p>
                    Prior recorded value: {previous.value} {previous.unit} on{" "}
                    {new Date(previous.timestamp).toLocaleString()}. Compare
                    like-for-like conditions.
                  </p>
                ) : (
                  <p>No personal prior reading is available.</p>
                )}
                <ol>
                  {result.actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ol>
                <p>{r.note || "No context recorded."}</p>
                <a href={result.source} target="_blank" rel="noreferrer">
                  Source · Earth reference ↗
                </a>
                <p className="fine-print">
                  Source checked 4 Nov 2026. Not validated for flight use.
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    setSelected(
                      `${kind}: ${r.value} ${r.unit} (${r.timestamp})`,
                    );
                    setMessage(
                      "Follow-up target selected. Complete the action log below.",
                    );
                  }}
                >
                  Log a follow-up for {kind.toLowerCase()}
                </button>
              </article>
            );
          })}
        </div>
      </section>
      <section className="panel">
        <h2>Action and follow-up log</h2>
        <p>{selected}</p>
        <label>
          Action taken or planned
          <textarea
            maxLength={3500}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="For example: reported to crew medical officer; repeated measurement using approved procedure."
          />
        </label>
        <label>
          Outcome and next check
          <textarea
            maxLength={3500}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Record what happened and when follow-up is planned."
          />
        </label>
        <button
          className="primary"
          disabled={busy}
          onClick={() => void logAction()}
        >
          {busy ? "Saving…" : "Save follow-up locally"}
        </button>
      </section>
      <section className="panel">
        <h2>Five hazards. A practical monitoring plan.</h2>
        <p>
          These cards connect the challenge’s risks with observations and
          prevention routines. They do not diagnose immune changes, bone loss,
          or radiation injury.
        </p>
        <div className="hazard-grid">
          {HAZARDS.map((h) => (
            <article className="assessment context" key={h.title}>
              <h3>{h.title}</h3>
              <p>{h.risk}</p>
              <strong>Track</strong>
              <p>{h.track}</p>
              <strong>Act</strong>
              <p>{h.act}</p>
            </article>
          ))}
        </div>
        <p>
          <a href={SOURCES.hazards} target="_blank" rel="noreferrer">
            NASA’s five spaceflight hazards ↗
          </a>{" "}
          ·{" "}
          <a href={SOURCES.nasa} target="_blank" rel="noreferrer">
            NASA Human Research Program risks ↗
          </a>
        </p>
        <p>
          <a href={SOURCES.science} target="_blank" rel="noreferrer">
            NASA Open Science Data Repository resources ↗
          </a>{" "}
          — research reference only; no dataset was used to train or validate
          these rules.
        </p>
      </section>
    </div>
  );
}
