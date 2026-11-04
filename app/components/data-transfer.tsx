import { useState } from "react";
import {
  parseTransfer,
  importTransfer,
  type Transfer,
} from "../../lib/transfer";
export default function DataTransfer({
  onImported,
}: {
  onImported: () => Promise<void>;
}) {
  const [pending, setPending] = useState<Transfer | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <section className="panel transfer-panel">
      <h3>Move a report between devices</h3>
      <p>
        Export JSON on one device, transfer the file yourself, then import it
        here. This is a user-controlled merge, not automatic synchronization.
        Existing record IDs are preserved. Photos, home destinations and
        reminders are excluded.
      </p>
      <label>
        Choose a Crew Health JSON report
        <input
          type="file"
          accept="application/json,.json"
          onChange={async (e) => {
            setError("");
            setPending(null);
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              if (f.size > 5 * 1024 * 1024)
                throw new Error("Choose a report smaller than 5 MB.");
              setPending(parseTransfer(await f.text()));
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      </label>
      {pending && (
        <>
          <p>
            {pending.readings.length} readings · {pending.incidents.length}{" "}
            incidents · {pending.wellness.length} wellbeing entries. Review the
            source file before merging. Reports may contain sensitive
            observations.
          </p>
          <div className="actions">
            <button
              className="primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await importTransfer(pending);
                  await onImported();
                  setPending(null);
                  setMessage(
                    "Report merged on this device. Duplicate record IDs were skipped.",
                  );
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Importing…" : "Merge reviewed report"}
            </button>
            <button className="secondary" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </>
      )}
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
    </section>
  );
}
