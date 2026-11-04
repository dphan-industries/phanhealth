import type { Reading, Incident, Wellness } from "./storage.ts";
import { UNITS, METRICS } from "./health.ts";
import { validateReading, validateRoutine, openDatabase } from "./storage.ts";
export type Transfer = {
  schema: 1;
  readings: Reading[];
  incidents: Incident[];
  wellness: Wellness[];
};
export function parseTransfer(raw: string): Transfer {
  if (raw.length > 5 * 1024 * 1024)
    throw new Error("Report exceeds the 5 MB import limit.");
  const data = JSON.parse(raw);
  if (
    !data ||
    typeof data !== "object" ||
    data.schema !== 1 ||
    ![data.readings, data.incidents, data.wellness].every(Array.isArray)
  )
    throw new Error("Choose a Crew Health schema 1 report.");
  const text = (v: unknown, max = 10000) =>
    typeof v === "string" && v.length <= max;
  const base = (r: Record<string, unknown>) =>
    r &&
    text(r.id, 200) &&
    (r.id as string).length > 0 &&
    text(r.timestamp, 50) &&
    Number.isFinite(Date.parse(r.timestamp as string));
  for (const store of ["readings", "incidents", "wellness"] as const) {
    const ids = data[store].map((r: { id?: string } | null) => r?.id);
    if (new Set(ids).size !== ids.length)
      throw new Error(
        "Report contains duplicate record IDs within a collection.",
      );
  }
  for (const r of data.readings) {
    if (
      !base(r) ||
      !METRICS.includes(r.kind) ||
      !text(r.value, 20) ||
      !text(r.note) ||
      !["Manual entry", "Bluetooth sensor", "Simulated sensor"].includes(
        r.source,
      ) ||
      r.unit !== UNITS[r.kind as Reading["kind"]]
    )
      throw new Error("Invalid reading in report.");
    const parts = r.value.split("/").map((p: string) => p.trim());
    if (
      parts.length !== (r.kind === "Blood pressure" ? 2 : 1) ||
      validateReading(r.kind, parts[0], parts[1])
    )
      throw new Error("Invalid numeric reading in report.");
  }
  for (const r of data.incidents)
    if (!base(r) || !text(r.notes))
      throw new Error("Invalid incident in report.");
  for (const r of data.wellness)
    if (
      !base(r) ||
      !text(r.sleep, 10) ||
      r.sleep.trim() === "" ||
      !Number.isFinite(+r.sleep) ||
      +r.sleep < 0 ||
      +r.sleep > 24 ||
      !["Very low", "Low", "Neutral", "Good", "Very good"].includes(r.mood) ||
      !text(r.bodyArea, 100) ||
      !text(r.note)
    )
      throw new Error("Invalid wellbeing entry in report.");
  for (const r of data.wellness)
    if (validateRoutine(r.routine))
      throw new Error("Invalid routine entry in report.");
  if (
    data.readings.length + data.incidents.length + data.wellness.length >
    10000
  )
    throw new Error("Report contains too many records.");
  return data;
}
export async function importTransfer(data: Transfer) {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(
      ["readings", "incidents", "wellness"],
      "readwrite",
    );
    for (const store of ["readings", "incidents", "wellness"] as const) {
      for (const record of data[store]) {
        const request = tx.objectStore(store).get(record.id);
        request.onsuccess = () => {
          if (!request.result) tx.objectStore(store).add(record);
        };
      }
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(new Error("Import failed. No records were merged."));
    };
    tx.onerror = () => {
      db.close();
      reject(new Error("Import failed. Check available storage."));
    };
  });
}
