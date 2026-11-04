"use client";
import { MEASUREMENT_HELP } from "../../lib/health";
import type { Reading } from "../../lib/storage";
export default function MeasurementInstructions({
  kind,
}: {
  kind: Reading["kind"];
}) {
  const h = MEASUREMENT_HELP[kind];
  return (
    <div className="instruction">
      <strong>Before you begin · {h.what}</strong>
      <p>
        <strong>Why it matters:</strong> {h.why}
      </p>
      <ol className="guide-steps">
        {h.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <a
        className="source-link"
        href={h.source}
        target="_blank"
        rel="noreferrer"
      >
        Education source · open reference ↗
      </a>
      <p className="fine-print">
        For adult educational use. Follow the approved device and mission
        procedure; reference guidance is not flight validation.
      </p>
    </div>
  );
}
