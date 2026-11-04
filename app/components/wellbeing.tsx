import { useEffect, useState } from "react";
import { readRecords, saveRecord, type Wellness } from "../../lib/storage";
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
  const [records, setRecords] = useState<Wellness[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dirty = !!(sleep || mood || note || area !== "No area");
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  useEffect(() => {
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
    setBusy(true);
    try {
      const record = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sleep,
        mood,
        bodyArea: area,
        note,
      };
      await saveRecord("wellness", record);
      setRecords((v) => [record, ...v]);
      setSleep("");
      setMood("");
      setArea("No area");
      setNote("");
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
        Log sleep, mood and a body-area observation. These are personal notes,
        not a symptom checker or diagnosis.
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
        </div>
      </div>
      <h3 className="subheading">Your wellbeing journal</h3>
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
