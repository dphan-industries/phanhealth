import { test } from "node:test";
import assert from "node:assert/strict";
import { IDBFactory } from "fake-indexeddb";
import { parseTransfer, importTransfer } from "../lib/transfer.ts";
import { readRecords, openDatabase, saveRecord } from "../lib/storage.ts";
const report = {
  schema: 1,
  readings: [
    {
      id: "r1",
      kind: "Heart rate",
      value: "72",
      unit: "bpm",
      timestamp: "2026-11-04T10:00:00Z",
      source: "Manual entry",
      note: "",
    },
  ],
  incidents: [],
  wellness: [],
};
test("report validation rejects malformed or misleading readings", () => {
  assert.equal(parseTransfer(JSON.stringify(report)).readings.length, 1);
  assert.throws(
    () => parseTransfer(JSON.stringify({ ...report, schema: 9 })),
    /schema/,
  );
  assert.throws(
    () =>
      parseTransfer(
        JSON.stringify({
          ...report,
          readings: [{ ...report.readings[0], source: "Apple Watch verified" }],
        }),
      ),
    /Invalid/,
  );
  assert.throws(
    () =>
      parseTransfer(
        JSON.stringify({
          ...report,
          readings: [{ ...report.readings[0], value: "72 / 80" }],
        }),
      ),
    /Invalid/,
  );
});
test("user initiated import merges atomically and preserves existing IDs", async () => {
  globalThis.indexedDB = new IDBFactory();
  await importTransfer(report);
  await importTransfer({
    ...report,
    readings: [{ ...report.readings[0], value: "90" }],
  });
  assert.equal((await readRecords("readings"))[0].value, "72");
  await saveRecord("wellness", {
    id: "w",
    timestamp: "2026-11-04T11:00:00Z",
    sleep: "8",
    mood: "Good",
    bodyArea: "No area",
    note: "",
  });
  assert.equal((await readRecords("wellness")).length, 1);
});
test("version 1 database migrates without losing saved readings", async () => {
  globalThis.indexedDB = new IDBFactory();
  await new Promise((resolve, reject) => {
    const req = indexedDB.open("crew-health", 1);
    req.onupgradeneeded = () => {
      req.result
        .createObjectStore("readings", { keyPath: "id" })
        .put(report.readings[0]);
      req.result.createObjectStore("incidents", { keyPath: "id" });
    };
    req.onsuccess = () => {
      req.result.close();
      resolve();
    };
    req.onerror = reject;
  });
  const db = await openDatabase();
  assert.equal(db.version, 2);
  assert.ok(db.objectStoreNames.contains("resources"));
  db.close();
  assert.equal((await readRecords("readings"))[0].id, "r1");
});
