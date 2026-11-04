import { useEffect, useState } from "react";
import { readRecords, saveRecord, type Preference } from "../../lib/storage";
export type Reminder = { at: string; title: string; acknowledged: boolean };
export default function Reminders() {
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [at, setAt] = useState("");
  const [title, setTitle] = useState("Daily crew check-in");
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    readRecords<Preference>("preferences")
      .then((p) => {
        const saved = p.find((r) => r.id === "reminder");
        if (saved) {
          try {
            const value = JSON.parse(saved.value);
            if (
              typeof value.at === "string" &&
              Number.isFinite(Date.parse(value.at))
            )
              setReminder(value);
          } catch {
            setError("Saved reminder could not be read. Set a new one.");
          }
        }
      })
      .catch((e) => setError(e.message));
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  const due = !!(
    reminder &&
    !reminder.acknowledged &&
    now >= Date.parse(reminder.at)
  );
  async function update(next: Reminder) {
    try {
      await saveRecord("preferences", {
        id: "reminder",
        value: JSON.stringify(next),
      });
      setReminder(next);
      setError("");
      setMessage(
        next.acknowledged
          ? "Reminder dismissed."
          : "Reminder saved for this device.",
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <details className="panel reminders">
        <summary>
          Onboard reminder{" "}
          <span>
            {reminder && !reminder.acknowledged
              ? new Date(reminder.at).toLocaleString()
              : "Not scheduled"}
          </span>
        </summary>
        <p>
          Visible reminders work while this app is open. A closed, suspended or
          sleeping browser cannot guarantee alarms; missed reminders appear when
          you return. No medical or emergency monitoring.
        </p>
        <div className="actions" aria-label="Quick reminder options">
          {[1, 5, 30].map((minutes) => (
            <button
              key={minutes}
              className="secondary"
              onClick={() =>
                void update({
                  at: new Date(Date.now() + minutes * 60000).toISOString(),
                  title: title.trim() || "Crew check-in",
                  acknowledged: false,
                })
              }
            >
              In {minutes} minute{minutes === 1 ? "" : "s"}
            </button>
          ))}
        </div>
        <div className="input-row">
          <label>
            Reminder label
            <input
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Date and time <small>Device local time</small>
            <input
              type="datetime-local"
              value={at}
              onChange={(e) => setAt(e.target.value)}
            />
          </label>
        </div>
        <button
          className="secondary"
          onClick={() => {
            if (
              !at ||
              !Number.isFinite(Date.parse(at)) ||
              Date.parse(at) <= Date.now()
            ) {
              setError("Choose a future date and time.");
              return;
            }
            void update({
              at: new Date(at).toISOString(),
              title: title.trim() || "Crew check-in",
              acknowledged: false,
            });
          }}
        >
          Schedule reminder
        </button>
        {reminder && !reminder.acknowledged && (
          <button
            className="text-button"
            onClick={() => void update({ ...reminder, acknowledged: true })}
          >
            Cancel reminder
          </button>
        )}
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </details>
      {due && (
        <aside className="reminder-toast" role="status">
          <strong>◇ Reminder: {reminder!.title}</strong>
          <p>Scheduled {new Date(reminder!.at).toLocaleString()}</p>
          <button
            className="primary"
            onClick={() => void update({ ...reminder!, acknowledged: true })}
          >
            Dismiss reminder
          </button>
        </aside>
      )}
    </>
  );
}
