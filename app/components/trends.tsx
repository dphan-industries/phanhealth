import { useState, useEffect } from "react";
import type { Reading } from "../../lib/storage";
import { explainReading, orderedReadings, values } from "../../lib/insights";
export function ReadingInsight({
  reading,
  previous,
}: {
  reading: Pick<Reading, "kind" | "value">;
  previous?: Reading;
}) {
  const result = explainReading(reading, previous);
  return (
    <div className={`reading-insight ${result.flagged ? "demo-flag" : ""}`}>
      <strong>
        {result.flagged ? "◇" : "✓"} {result.title}
      </strong>
      <p>{result.explanation}</p>
      <small>
        Prototype explanation · no medical assessment. Rest, activity, device
        quality and mission context are not evaluated.
      </small>
    </div>
  );
}
export default function Trends({ records }: { records: Reading[] }) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    queueMicrotask(() => setNow(Date.now()));
  }, []);
  const [kind, setKind] = useState<Reading["kind"]>("Heart rate");
  const [range, setRange] = useState("all");
  const all = orderedReadings(records, kind);
  const rows = all
    .filter(
      (r) =>
        range === "all" ||
        now - Date.parse(r.timestamp) <= Number(range) * 86400000,
    )
    .slice(-30);
  const nums = rows.flatMap(values);
  const min = nums.length ? Math.min(...nums) - 5 : 0;
  const max = nums.length ? Math.max(...nums) + 5 : 100;
  const x = (i: number) =>
    45 + (rows.length > 1 ? i / (rows.length - 1) : 0.5) * 690;
  const y = (v: number) => 170 - ((v - min) / (max - min)) * 135;
  return (
    <section className="panel trends">
      <div className="section-heading">
        <h2>Changes over time</h2>
        <span className="tag">ACTUAL SAVED VALUES</span>
      </div>
      <div className="input-row">
        <label>
          Trend measurement
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Reading["kind"])}
          >
            <option>Heart rate</option>
            <option>Blood pressure</option>
          </select>
        </label>
        <label>
          Period
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="all">All records</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </label>
      </div>
      {rows.length ? (
        <>
          <svg
            viewBox="0 0 780 220"
            role="img"
            aria-label={`${kind} trend, ${rows.length} readings. Exact values and timestamps follow in the table.`}
          >
            <line x1="45" y1="175" x2="735" y2="175" stroke="#46606d" />
            {[min, (min + max) / 2, max].map((v) => (
              <g key={v}>
                <line x1="45" y1={y(v)} x2="735" y2={y(v)} stroke="#233b47" />
                <text x="4" y={y(v) + 4} fill="#aac6d1" fontSize="11">
                  {Math.round(v)}
                </text>
              </g>
            ))}
            {(kind === "Heart rate" ? [0] : [0, 1]).map((series) => (
              <g key={series}>
                <polyline
                  points={rows
                    .map((r, i) => `${x(i)},${y(values(r)[series])}`)
                    .join(" ")}
                  fill="none"
                  stroke={series ? "#c7b5f5" : "#80e6e5"}
                  strokeWidth="2"
                />
                {rows.map((r, i) => (
                  <circle
                    key={r.id}
                    cx={x(i)}
                    cy={y(values(r)[series])}
                    r="4"
                    fill={series ? "#c7b5f5" : "#80e6e5"}
                  >
                    <title>
                      {new Date(r.timestamp).toLocaleString()}:{" "}
                      {values(r)[series]} {r.unit} · {r.source}
                    </title>
                  </circle>
                ))}
              </g>
            ))}
            <text x="45" y="205" fill="#aac6d1" fontSize="11">
              {new Date(rows[0].timestamp).toLocaleDateString()}
            </text>
            <text x="735" y="205" textAnchor="end" fill="#aac6d1" fontSize="11">
              {new Date(rows.at(-1)!.timestamp).toLocaleDateString()}
            </text>
          </svg>
          <p>
            {kind === "Heart rate"
              ? "Heart rate · bpm"
              : "Cyan: systolic · Purple: diastolic · mmHg"}{" "}
            · Samples and sensor simulations retain their source labels. Points
            are spaced by record order, not elapsed time.
          </p>
          <ReadingInsight reading={rows.at(-1)!} previous={rows.at(-2)} />
        </>
      ) : (
        <p>No readings in this period. Save a reading to begin a trend.</p>
      )}
    </section>
  );
}
