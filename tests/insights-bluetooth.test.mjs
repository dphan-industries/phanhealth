import { test } from "node:test";
import assert from "node:assert/strict";
import { parseHeartRate, parseBloodPressure } from "../lib/bluetooth.ts";
import { explainReading, orderedReadings } from "../lib/insights.ts";
const packet = (bytes) => new DataView(Uint8Array.from(bytes).buffer);
test("heart-rate parser handles 8-bit and 16-bit values and contact status", () => {
  assert.deepEqual(parseHeartRate(packet([6, 72])), {
    bpm: 72,
    contact: "detected",
  });
  assert.equal(parseHeartRate(packet([1, 44, 1])).bpm, 300);
  assert.equal(parseHeartRate(packet([4, 72])).contact, "not detected");
  assert.throws(() => parseHeartRate(packet([1, 72])), /Incomplete/);
  assert.throws(() => parseHeartRate(packet([0, 0])), /cannot/);
});
test("blood-pressure parser preserves mmHg and converts SFLOAT kPa", () => {
  assert.deepEqual(parseBloodPressure(packet([0, 120, 0, 80, 0, 93, 0])), {
    systolic: 120,
    diastolic: 80,
    convertedFromKpa: false,
  });
  assert.deepEqual(
    parseBloodPressure(packet([1, 160, 240, 107, 240, 125, 240])),
    { systolic: 120, diastolic: 80, convertedFromKpa: true },
  );
  assert.throws(
    () => parseBloodPressure(packet([0, 255, 7, 80, 0, 93, 0])),
    /Invalid/,
  );
  assert.throws(() => parseBloodPressure(packet([0, 1])), /Incomplete/);
});
test("illustrative flags explain change without asserting medical safety", () => {
  const base = {
    id: "a",
    kind: "Heart rate",
    value: "68",
    source: "Manual entry",
    timestamp: "2026-11-01T00:00:00Z",
  };
  assert.equal(explainReading({ ...base, value: "82" }, base).flagged, false);
  const flag = explainReading({ ...base, value: "83" }, base);
  assert.equal(flag.flagged, true);
  assert.match(flag.explanation, /nonclinical/);
  assert.match(flag.explanation, /\+15/);
  assert.equal(
    explainReading({ kind: "Blood pressure", value: "118 / 96" }).flagged,
    true,
  );
  assert.equal(
    orderedReadings(
      [{ ...base, id: "b", timestamp: "2026-11-02T00:00:00Z" }, base],
      "Heart rate",
    )[0].id,
    "a",
  );
});
