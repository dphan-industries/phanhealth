import { test } from "node:test";
import assert from "node:assert/strict";
import { IDBFactory } from "fake-indexeddb";
import {
  validateReading,
  openDatabase,
  saveRecord,
  readRecords,
} from "../lib/storage.ts";
test("validation accepts formats without clinical interpretation", () => {
  assert.equal(validateReading("Heart rate", "68", ""), "");
  assert.equal(validateReading("Blood pressure", "118", "76"), "");
  assert.equal(validateReading("Heart rate", "999", ""), "");
  for (const value of ["", "0", "-1", "1.5", "1000", "abc"])
    assert.ok(validateReading("Heart rate", value, ""));
  assert.ok(validateReading("Blood pressure", "118", ""));
});
test("versioned database persists readings and incidents across connections", async () => {
  globalThis.indexedDB = new IDBFactory();
  const db = await openDatabase();
  assert.equal(db.version, 2);
  assert.deepEqual(
    [...db.objectStoreNames],
    ["incidents", "preferences", "readings", "resources", "wellness"],
  );
  db.close();
  const reading = {
    id: "fictional",
    kind: "Heart rate",
    value: "72",
    unit: "bpm",
    timestamp: "2026-11-04T10:00:00Z",
    note: "Test",
    source: "Manual entry",
  };
  await saveRecord("readings", reading);
  await saveRecord("incidents", {
    id: "scenario",
    timestamp: reading.timestamp,
    notes: "Fictional observation",
  });
  assert.deepEqual(await readRecords("readings"), [reading]);
  assert.equal(
    (await readRecords("incidents"))[0].notes,
    "Fictional observation",
  );
});
test("database failures reject without claiming a successful save", async () => {
  globalThis.indexedDB = {
    open() {
      const req = {};
      queueMicrotask(() => req.onerror());
      return req;
    },
  };
  await assert.rejects(
    saveRecord("readings", { id: "failed" }),
    /Local database unavailable/,
  );
});
import { IDBDatabase } from "fake-indexeddb";
test("aborted write transactions do not persist or report success", async () => {
  globalThis.indexedDB = new IDBFactory();
  const db = await openDatabase();
  db.close();
  const original = IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction = function (...args) {
    const tx = original.apply(this, args);
    if (args[1] === "readwrite") queueMicrotask(() => tx.abort());
    return tx;
  };
  try {
    await assert.rejects(
      saveRecord("readings", {
        id: "aborted",
        kind: "Heart rate",
        value: "72",
        unit: "bpm",
        timestamp: "2026-11-04T10:00:00Z",
        note: "",
        source: "Manual entry",
      }),
      /failed|aborted/,
    );
  } finally {
    IDBDatabase.prototype.transaction = original;
  }
  assert.deepEqual(await readRecords("readings"), []);
});
