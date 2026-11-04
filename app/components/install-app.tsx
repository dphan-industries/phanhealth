"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallApp({ ready }: { ready: boolean }) {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const mode = window.matchMedia("(display-mode: standalone)");
    const update = () =>
      setInstalled(
        mode.matches ||
          !!(navigator as Navigator & { standalone?: boolean }).standalone,
      );
    const capture = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const done = () => {
      setInstalled(true);
      setPrompt(null);
    };
    update();
    mode.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", done);
    return () => {
      mode.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  async function install() {
    if (!prompt) return;
    setBusy(true);
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      setMessage(
        result.outcome === "accepted"
          ? "Installation accepted. Launch Crew Health from your home screen, then check offline readiness there."
          : "Installation dismissed. You can still install from your browser menu.",
      );
    } catch {
      setMessage(
        "Use your browser menu to install Crew Health. Instructions are below.",
      );
    } finally {
      setPrompt(null);
      setBusy(false);
    }
  }
  return (
    <details className="panel install-panel">
      <summary>
        {installed
          ? "✓ Running as an installed app"
          : "↓ Install Crew Health on your home screen"}
      </summary>
      <p>
        Open your personal health console from its own icon, in an app window.
        No app store download is needed.
      </p>
      <p role="status">
        <strong>
          {ready
            ? "Ready for offline use on this browser."
            : "Offline preparation is not yet verified. Keep this app open and connected until OFFLINE READY appears."}
        </strong>
      </p>
      {!installed && prompt && (
        <button className="primary" onClick={install} disabled={busy}>
          {busy ? "Opening installer…" : "Install app"}
        </button>
      )}
      {!installed && (
        <div className="install-instructions">
          <p>
            <strong>iPhone / iPad:</strong> Open this site in Safari. Tap Share
            → Add to Home Screen → Add. If shown, keep “Open as Web App”
            enabled.
          </p>
          <p>
            <strong>Android:</strong> Open in Chrome or Samsung Internet. Open
            the browser menu → Install app or Add to Home screen → confirm.
          </p>
          <p>
            <strong>Computer:</strong> In Chrome or Edge, use the install icon
            in the address bar or the browser menu’s Install option. On Safari
            for Mac, choose File → Add to Dock.
          </p>
        </div>
      )}
      <p>
        After installing, open the home screen app while online and wait for its
        own OFFLINE READY status before disconnecting. Google Maps and Street
        View still need internet. Installation does not prevent device storage
        from being cleared; export important records for backup.
      </p>
      <p className="fine-print">
        Phone installation requires a secure HTTPS site. This computer’s
        localhost preview is for testing; 127.0.0.1 on your phone points to the
        phone itself.
      </p>
      {message && <p role="status">{message}</p>}
    </details>
  );
}
