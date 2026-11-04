import { useId, useRef, useState } from "react";
export default function NumberControl({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState("");
  function open() {
    setDraft(value);
    dialog.current?.showModal();
  }
  function adjust(amount: number) {
    onChange(String(Math.max(1, Math.min(999, (Number(value) || 0) + amount))));
  }
  return (
    <div className="number-control">
      <label htmlFor={id}>
        {label} <small>{unit}</small>
      </label>
      <div className="number-stepper">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => adjust(-1)}
        >
          −
        </button>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={open}
          inputMode="none"
          placeholder="—"
          autoComplete="off"
          aria-describedby={`${id}-hint`}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => adjust(1)}
        >
          +
        </button>
      </div>
      <button className="text-button" type="button" onClick={open}>
        Open {label.toLowerCase()} keypad
      </button>
      <details>
        <summary>Slide to adjust</summary>
        <input
          type="range"
          aria-label={`${label} slider`}
          min="1"
          max="999"
          step="1"
          value={Number(value) || 1}
          onChange={(e) => onChange(e.target.value)}
        />
      </details>
      <small id={`${id}-hint`}>
        Tap the number, use + / −, or type with a keyboard.
      </small>
      <dialog
        ref={dialog}
        className="keypad-dialog"
        aria-labelledby={`${id}-title`}
      >
        <h2 id={`${id}-title`}>{label}</h2>
        <p>{unit} · whole numbers only</p>
        <output aria-live="polite" className="keypad-output">
          {draft || "—"}
        </output>
        <div className="keypad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "Clear", "0", "⌫"].map(
            (key) => (
              <button
                type="button"
                key={key}
                aria-label={key === "⌫" ? "Backspace" : key}
                onClick={() =>
                  setDraft((old) =>
                    key === "Clear"
                      ? ""
                      : key === "⌫"
                        ? old.slice(0, -1)
                        : (old + key).slice(0, 3),
                  )
                }
              >
                {key}
              </button>
            ),
          )}
        </div>
        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={() => dialog.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => {
              onChange(draft);
              dialog.current?.close();
            }}
          >
            Use number
          </button>
        </div>
      </dialog>
    </div>
  );
}
