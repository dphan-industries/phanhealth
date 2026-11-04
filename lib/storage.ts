export type Reading = {
  id: string;
  kind: "Heart rate" | "Blood pressure";
  value: string;
  unit: string;
  timestamp: string;
  note: string;
  source: "Manual entry" | "Bluetooth sensor" | "Simulated sensor";
  device?: string;
};
export type Incident = { id: string; timestamp: string; notes: string };
export function validateReading(
  kind: string,
  first: string,
  second: string,
): string {
  if (
    !/^\d+$/.test(first) ||
    (kind === "Blood pressure" && !/^\d+$/.test(second))
  )
    return "Enter whole numbers in all required fields.";
  if (
    +first < 1 ||
    +first > 999 ||
    (kind === "Blood pressure" && (+second < 1 || +second > 999))
  )
    return "Use values from 1–999. This checks format only, not medical safety.";
  return "";
}
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("crew-health", 2);
    request.onupgradeneeded = () => {
      for (const name of [
        "readings",
        "incidents",
        "wellness",
        "preferences",
        "resources",
      ])
        if (!request.result.objectStoreNames.contains(name))
          request.result.createObjectStore(name, { keyPath: "id" });
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () =>
      reject(new Error("Local database unavailable. Records cannot be saved."));
    request.onblocked = () =>
      reject(new Error("Close other app tabs to update local storage."));
  });
}
export async function readRecords<T>(store: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store);
    const req = tx.objectStore(store).getAll();
    req.onerror = () => reject(new Error("Unable to read local records."));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    tx.onabort = () => {
      db.close();
      reject(new Error("Unable to read local records."));
    };
  });
}
export async function saveRecord<T extends { id: string }>(
  store: string,
  record: T,
) {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(new Error("Local save failed. Keep this screen open and retry."));
    };
    tx.onabort = () => {
      db.close();
      reject(new Error("Local save aborted. Please retry."));
    };
  });
}

export type Wellness = {
  id: string;
  timestamp: string;
  sleep: string;
  mood: string;
  bodyArea: string;
  note: string;
};
export type Preference = { id: string; value: string };
export type LocalResource = {
  id: string;
  name: string;
  timestamp: string;
  blob: Blob;
};
