import type { Reading } from "./storage";
import { UNITS } from "./health.ts";
export function values(reading: Pick<Reading, "value">): number[] {
  return reading.value.split("/").map((v) => Number(v.trim()));
}
/** Arbitrary exhibition rules, never clinical cutoffs. No flag means no demo change, not medical safety. */
export function explainReading(
  reading: Pick<Reading, "kind" | "value">,
  previous?: Reading,
) {
  const current = values(reading);
  if (reading.kind === "Blood glucose" || reading.kind === "Body temperature") {
    const differences = previous
      ? current.map((v, i) => v - values(previous)[i])
      : [];
    return {
      flagged: false,
      baseline: previous ? "previous recorded reading" : "no prior reading",
      differences,
      title: "Recorded change — context required",
      explanation: previous
        ? `Change from ${previous.value} to ${reading.value} ${UNITS[reading.kind]}. Compare like-for-like methods and conditions.`
        : "No prior personal reading. See the educational assessment below; no fictional baseline is substituted.",
    };
  }
  const base = previous
    ? values(previous)
    : reading.kind === "Heart rate"
      ? [68]
      : [118, 76];
  const differences = current.map((v, i) => v - base[i]);
  const limit = reading.kind === "Heart rate" ? 15 : 20;
  const flagged = differences.some((v) => Math.abs(v) >= limit);
  const baseline = previous
    ? `previous ${previous.source.toLowerCase()} reading (${previous.value})`
    : `fictional exhibition reference (${base.join(" / ")})`;
  return {
    flagged,
    baseline,
    differences,
    title: flagged ? "Illustrative change flag" : "No illustrative change flag",
    explanation: `${reading.kind}: ${current.join(" / ")} compared with ${baseline}. Change: ${differences.map((v) => `${v > 0 ? "+" : ""}${v}`).join(" / ")} ${reading.kind === "Heart rate" ? "bpm" : "mmHg"}. The exhibition rule flags an absolute change of ${limit} or more in any value. This arbitrary, nonclinical rule does not determine whether a reading is healthy or diagnose a condition.`,
  };
}
export function orderedReadings(records: Reading[], kind: Reading["kind"]) {
  return records
    .filter((r) => r.kind === kind)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}
