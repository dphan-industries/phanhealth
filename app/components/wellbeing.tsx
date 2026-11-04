import { useEffect, useState } from "react";
import {
  readRecords,
  saveRecord,
  validateRoutine,
  type Reading,
  type Wellness,
} from "../../lib/storage";
import NumberControl from "./number-control";
import { SOURCES, assessReading } from "../../lib/health";
const blankRoutine = {
  waterMl: "",
  meals: "",
  aerobicMinutes: "",
  resistanceMinutes: "",
  radiationUsv: "",
  environmentNotes: "",
};
const routineFields = [
  ["waterMl", "Fluids recorded", "mL"],
  ["meals", "Meals recorded", "meals"],
  ["aerobicMinutes", "Aerobic exercise", "minutes"],
  ["resistanceMinutes", "Resistance exercise", "minutes"],
  ["radiationUsv", "Dosimeter dose for this 24-hour period", "µSv"],
] as const;
const bodyEducation: Record<string, string> = {
  "No area":
    "Select a region to learn its function and choose relevant observations. No area is automatically classified as healthy.",
  Head: "Brain and senses: record headache, dizziness, sleep, mood, and changes in awareness. New confusion or speech/vision changes require immediate crew medical attention.",
  Chest:
    "Heart and lungs circulate blood and exchange gases. Review pulse, blood pressure, breathing symptoms, and activity context. Chest pain or collapse takes priority over any reassuring reading.",
  Abdomen:
    "Digestive organs support nutrition and energy balance. Record meals, fluids, glucose context, appetite, and discomfort; these notes do not diagnose a condition.",
};
const areas = [
  "No area",
  "Head",
  "Chest",
  "Abdomen",
  "Left arm",
  "Right arm",
  "Left leg",
  "Right leg",
];
export default function Wellbeing({
  onDirty,
}: {
  onDirty: (dirty: boolean) => void;
}) {
  const [sleep, setSleep] = useState("");
  const [mood, setMood] = useState("");
  const [area, setArea] = useState("No area");
  const [note, setNote] = useState("");
  const [routine, setRoutine] = useState(blankRoutine);
  const [records, setRecords] = useState<Wellness[]>([]);
  const [vitals, setVitals] = useState<Reading[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(0);
  const ordered = [...records].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
  const dirty = !!(
    sleep ||
    mood ||
    note ||
    area !== "No area" ||
    Object.values(routine).some(Boolean)
  );
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
    readRecords<Reading>("readings")
      .then(setVitals)
      .catch((e) => setError(e.message));
    readRecords<Wellness>("wellness")
      .then(setRecords)
      .catch((e) => setError(e.message));
  }, []);
  async function save() {
    setError("");
    if (sleep === "" || !mood) {
      setError("Choose sleep duration and a mood before saving.");
      return;
    }
    const routineError = validateRoutine(routine);
    if (routineError) {
      setError(routineError);
      return;
    }
    setBusy(true);
    try {
      const record = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sleep,
        mood,
        bodyArea: area,
        note,
        routine,
      };
      await saveRecord("wellness", record);
      setRecords((v) => [record, ...v]);
      setSleep("");
      setMood("");
      setArea("No area");
      setNote("");
      setRoutine(blankRoutine);
      setMessage("Wellbeing check-in saved on this device.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function bodyPart(name: string, path: string) {
    return (
      <g
        key={name}
        role="button"
        tabIndex={0}
        aria-label={`Select ${name.toLowerCase()}`}
        aria-pressed={area === name}
        onClick={() => setArea(name)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setArea(name);
          }
        }}
      >
        <path
          d={path}
          className={area === name ? "body-part selected" : "body-part"}
        />
      </g>
    );
  }
  return (
    <section className="panel wellbeing">
      <div className="eyebrow">PERSONAL LOG · FICTIONAL CHECK-IN</div>
      <h2>More than a number.</h2>
      <p>
        Log sleep over the last 24 hours, choose your current mood, and add a
        body-area observation. Consistent records can help you notice changes in
        rest, mood, and comfort. These are personal notes, not a diagnostic
        questionnaire. Review persistent changes with the crew medical officer.
      </p>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
      <div className="wellbeing-grid">
        <div>
          <label>
            Sleep in the last 24 hours
            <select value={sleep} onChange={(e) => setSleep(e.target.value)}>
              <option value="">Choose duration</option>
              {Array.from({ length: 49 }, (_, i) => (
                <option key={i} value={i / 2}>
                  {i / 2} hours
                </option>
              ))}
            </select>
          </label>
          <fieldset className="mood-field">
            <legend>How are you feeling?</legend>
            <div className="mood-options">
              {["Very low", "Low", "Neutral", "Good", "Very good"].map(
                (m, i) => (
                  <label key={m}>
                    <input
                      type="radio"
                      name="mood"
                      value={m}
                      checked={mood === m}
                      onChange={() => setMood(m)}
                    />
                    <span aria-hidden="true">
                      {["☁", "☂", "◐", "☀", "✦"][i]}
                    </span>
                    {m}
                  </label>
                ),
              )}
            </div>
          </fieldset>
          <label>
            Observation <small>Optional</small>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A fictional observation about rest, mood or comfort…"
            />
          </label>
          <details className="daily-routine">
            <summary>Nutrition, movement, radiation and habitat log</summary>
            <p>
              Record the last 24 hours. Blank means unknown, not zero. Follow
              your individualized nutrition, fluids, and exercise plan; the app
              prescribes no target. Copy dose only from a dosimeter for this
              period, not its lifetime cumulative display.
            </p>
            <div className="routine-grid">
              {routineFields.map(([key, label, unit]) => (
                <NumberControl
                  key={key}
                  label={label}
                  min={0}
                  max={
                    key === "waterMl"
                      ? 50000
                      : key === "meals"
                        ? 24
                        : key.endsWith("Minutes")
                          ? 1440
                          : 1000000
                  }
                  unit={unit}
                  value={routine[key]}
                  onChange={(value) =>
                    setRoutine((r) => ({ ...r, [key]: value }))
                  }
                />
              ))}
            </div>
            <label>
              Habitat alarms, EVA, illness or exposure context
              <textarea
                maxLength={10000}
                value={routine.environmentNotes}
                onChange={(e) =>
                  setRoutine((r) => ({
                    ...r,
                    environmentNotes: e.target.value,
                  }))
                }
                placeholder="Record observed cabin alarms, dose interval, exercise plan completion, appetite or shared crew symptoms."
              />
            </label>
            <p>
              No radiation sensor, cabin monitor, bone-density measurement or
              immune assay is connected. These are
              self-reported/device-transcribed observations.
            </p>
          </details>
          <button className="primary" disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save check-in"}
          </button>
        </div>
        <div className="body-map">
          <h3>Where would you like to add a note?</h3>
          <p>Select an area. No medical interpretation is generated.</p>
          <svg viewBox="0 0 240 340" aria-label="Body-area selector">
            <g fill="none" stroke="#80dae0" strokeWidth="1.5">
              {bodyPart("Head", "M101 45a19 19 0 1 0 38 0 19 19 0 1 0-38 0")}
              {bodyPart("Chest", "M98 75h44l10 75H88z")}
              {bodyPart("Abdomen", "M88 154h64l-5 51H93z")}
              {bodyPart("Right arm", "M84 80l-20 8-20 110 20 5 24-87z")}
              {bodyPart("Left arm", "M156 80l20 8 20 110-20 5-24-87z")}
              {bodyPart("Right leg", "M94 210h23l-6 112H86z")}
              {bodyPart("Left leg", "M123 210h23l8 112h-25z")}
            </g>
          </svg>
          <label>
            Selected area
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              {areas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <small>
            Left and right are the illustrated person’s perspective.
          </small>
          <div className="instruction" aria-live="polite">
            <strong>{area}: function and monitoring</strong>
            <p>
              {bodyEducation[area] ||
                "Bones and muscles support movement and strength. Altered gravity changes their loading. Record discomfort and prescribed exercise completion; pain notes and exercise minutes cannot measure bone density or diagnose bone loss."}
            </p>
            <p>
              Status: self-reported observations and the latest relevant
              recorded values below; no diagnosis is generated.
            </p>
            {vitals
              .filter(
                (r) =>
                  r.source !== "Simulated sensor" &&
                  (area === "Chest"
                    ? ["Heart rate", "Blood pressure"].includes(r.kind)
                    : area === "Head"
                      ? r.kind === "Body temperature"
                      : area === "Abdomen"
                        ? r.kind === "Blood glucose"
                        : false),
              )
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
              .filter(
                (r, i, arr) => arr.findIndex((x) => x.kind === r.kind) === i,
              )
              .map((r) => (
                <p key={r.id}>
                  <strong>
                    {r.kind}: {r.value} {r.unit}
                  </strong>
                  <br />
                  {assessReading(r).title} ·{" "}
                  {new Date(r.timestamp).toLocaleString()} · {r.source}
                </p>
              ))}
            <a href={SOURCES.nasa} target="_blank" rel="noreferrer">
              NASA health-risk reference ↗
            </a>
          </div>
        </div>
      </div>
      <h3 className="subheading">Your wellbeing journal</h3>
      <p>
        <strong>Routine participation:</strong>{" "}
        {
          new Set(
            records
              .filter(
                (r) =>
                  now >= Date.parse(r.timestamp) &&
                  now - Date.parse(r.timestamp) < 7 * 86400000,
              )
              .map((r) => new Date(r.timestamp).toDateString()),
          ).size
        }{" "}
        check-in days recorded in the last 7 days. This rewards participation,
        not a medical outcome.
      </p>
      {ordered.slice(0, 3).length === 3 &&
        ordered
          .slice(0, 3)
          .every((r) => ["Low", "Very low"].includes(r.mood)) && (
          <div className="assessment review">
            <strong>△ Repeated low mood reported</strong>
            <p>
              Arrange a confidential check-in with the crew medical officer and
              review rest, workload, and social support. This pattern is not a
              diagnosis. If you feel unsafe, alert nearby crew immediately.
            </p>
          </div>
        )}
      {!records.length ? (
        <p>No check-ins yet.</p>
      ) : (
        <div className="history-table">
          <table>
            <caption>Saved self-reported check-ins</caption>
            <thead>
              <tr>
                <th>Time</th>
                <th>Sleep</th>
                <th>Mood</th>
                <th>Area / observation</th>
              </tr>
            </thead>
            <tbody>
              {[...records]
                .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                .map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.timestamp).toLocaleString()}</td>
                    <td>{r.sleep} h</td>
                    <td>{r.mood}</td>
                    <td>
                      {r.bodyArea}
                      <small className="block">{r.note}</small>
                      {r.routine && (
                        <details>
                          <summary>Routine and exposure observations</summary>
                          {routineFields.map(([key, label, unit]) => (
                            <p key={key}>
                              {label}:{" "}
                              {r.routine?.[key] === ""
                                ? "Unknown"
                                : `${r.routine?.[key]} ${unit}`}
                            </p>
                          ))}
                          <p>
                            {r.routine.environmentNotes ||
                              "No habitat notes recorded."}
                          </p>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
