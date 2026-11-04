import { useEffect, useRef, useState } from "react";
import {
  parseHeartRate,
  parseBloodPressure,
  type BLEDevice,
  type BLECharacteristic,
  type BLENavigator,
} from "../../lib/bluetooth";
export type SensorReading = {
  kind: "Heart rate" | "Blood pressure";
  first: string;
  second: string;
  source: "Bluetooth sensor" | "Simulated sensor";
  timestamp: string;
  device: string;
};
export default function Wearables({
  onReview,
}: {
  onReview: (reading: SensorReading) => void;
}) {
  const [status, setStatus] = useState("Disconnected");
  const [error, setError] = useState("");
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [supported, setSupported] = useState(false);
  const [now, setNow] = useState(0);
  const [metric, setMetric] = useState("Heart rate");
  const connection = useRef<BLEDevice | null>(null);
  const characteristic = useRef<BLECharacteristic | null>(null);
  const simulation = useRef<ReturnType<typeof setInterval> | null>(null);
  const listener = useRef<((e: Event) => void) | null>(null);
  const session = useRef(0);
  function stop() {
    session.current++;
    if (simulation.current) clearInterval(simulation.current);
    simulation.current = null;
    if (characteristic.current && listener.current)
      characteristic.current.removeEventListener(
        "characteristicvaluechanged",
        listener.current,
      );
    void characteristic.current?.stopNotifications().catch(() => {});
    characteristic.current = null;
    const previousDevice = connection.current;
    connection.current = null;
    previousDevice?.gatt?.disconnect();
    setStatus("Disconnected");
    setLatest(null);
  }
  useEffect(() => {
    queueMicrotask(() => setSupported(!!(navigator as BLENavigator).bluetooth));
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(clock);
      if (simulation.current) clearInterval(simulation.current);
      if (characteristic.current && listener.current)
        characteristic.current.removeEventListener(
          "characteristicvaluechanged",
          listener.current,
        );
      connection.current?.gatt?.disconnect();
    };
  }, []);
  async function connect() {
    stop();
    const attempt = session.current;
    setError("");
    setStatus("Choose a device…");
    try {
      const service = metric === "Heart rate" ? "heart_rate" : "blood_pressure";
      const device = await (navigator as BLENavigator).bluetooth!.requestDevice(
        { filters: [{ services: [service] }] },
      );
      if (attempt !== session.current) return;
      connection.current = device;
      device.addEventListener("gattserverdisconnected", () => {
        if (connection.current !== device) return;
        setStatus("Disconnected — latest reading is no longer live");
        setLatest(null);
      });
      setStatus("Connecting…");
      const server = await device.gatt!.connect();
      const primary = await server.getPrimaryService(service);
      const char = await primary.getCharacteristic(
        metric === "Heart rate"
          ? "heart_rate_measurement"
          : "blood_pressure_measurement",
      );
      if (attempt !== session.current) {
        device.gatt?.disconnect();
        return;
      }
      characteristic.current = char;
      listener.current = (e) => {
        if (connection.current !== device) return;
        try {
          const data = (e.target as BLECharacteristic).value;
          if (!data) return;
          let first: string;
          let second = "";
          if (metric === "Heart rate") {
            const packet = parseHeartRate(data);
            if (packet.contact === "not detected")
              throw new Error(
                "Sensor reports no skin contact. Reading not imported.",
              );
            first = String(packet.bpm);
          } else {
            const packet = parseBloodPressure(data);
            first = String(packet.systolic);
            second = String(packet.diastolic);
          }
          setLatest({
            kind: metric as SensorReading["kind"],
            first,
            second,
            source: "Bluetooth sensor",
            timestamp: new Date().toISOString(),
            device: device.name || "Unnamed BLE device",
          });
          setError("");
          setStatus("Receiving device readings");
        } catch (e) {
          setError((e as Error).message);
          setLatest(null);
        }
      };
      char.addEventListener("characteristicvaluechanged", listener.current);
      await char.startNotifications();
      setStatus("Connected — waiting for a measurement");
    } catch (e) {
      if (attempt !== session.current) return;
      connection.current?.gatt?.disconnect();
      setLatest(null);
      setStatus("Disconnected");
      setError(
        (e as Error).name === "NotFoundError"
          ? "No compatible device was selected. If your watch is missing, it may not be broadcasting the selected standard BLE service. Normal phone pairing is not enough. See the Galaxy Watch guidance below."
          : (e as Error).message,
      );
    }
  }
  function simulate() {
    stop();
    setError("");
    setStatus("SIMULATION — no physical device connected");
    let tick = 0;
    const emit = () => {
      const sample = [68, 70, 69, 87, 72, 71][tick++ % 6];
      setLatest({
        kind: "Heart rate",
        first: String(sample),
        second: "",
        source: "Simulated sensor",
        timestamp: new Date().toISOString(),
        device: "Fictional crew wrist sensor",
      });
    };
    emit();
    simulation.current = setInterval(emit, 4000);
  }
  const age = latest
    ? Math.max(
        0,
        Math.floor(
          ((now || Date.parse(latest.timestamp)) -
            Date.parse(latest.timestamp)) /
            1000,
        ),
      )
    : 0;
  return (
    <section className="panel device-panel">
      <div className="eyebrow">DEVICE BAY · LOCAL BLUETOOTH</div>
      <h2>Your sensors. One health log.</h2>
      <p>
        Connect a nearby device that advertises the standard Bluetooth Heart
        Rate or Blood Pressure service. No cloud account or internet is required
        for the local radio connection. Browser and operating-system support
        vary.
      </p>
      <div className="device-layout">
        <div>
          <label>
            Device measurement
            <select
              value={metric}
              onChange={(e) => {
                stop();
                setMetric(e.target.value);
              }}
            >
              <option>Heart rate</option>
              <option>Blood pressure</option>
            </select>
          </label>
          <div className="actions">
            <button
              className="primary"
              disabled={
                !supported ||
                status.includes("Connecting") ||
                status.includes("Choose")
              }
              onClick={connect}
            >
              Find Bluetooth device
            </button>
            <button className="secondary" onClick={stop}>
              Disconnect / stop
            </button>
          </div>
          {!supported && (
            <div className="alert">
              Web Bluetooth is unavailable in this browser. Try a supported
              Chrome or Edge environment on a compatible operating system.
              Manual entry and the clearly labeled simulator remain available.
            </div>
          )}
          <div className="reading-insight">
            <strong>Galaxy Watch connection guidance</strong>
            <p>
              Direct Samsung watch integration is not implemented in this
              browser prototype. A paired Galaxy Watch will only appear here if
              it actively broadcasts the selected standard BLE service. This app
              cannot switch that broadcasting on remotely.
            </p>
            <ol>
              <li>Choose Heart rate for a heart-rate broadcaster.</li>
              <li>
                If you use a compatible watch broadcaster, start its broadcast
                on the watch and grant its sensor permissions before scanning
                here.
              </li>
              <li>
                Keep the watch nearby. If another app is receiving its
                broadcast, disconnect that session and retry.
              </li>
              <li>
                If the watch never appears, repeating normal Bluetooth pairing
                will not add Samsung Health access. A native watch/Android
                companion integration is a separate requirement.
              </li>
            </ol>
            <p>
              Galaxy Watch 9 has not been hardware-tested with this app.
              Installing Crew Health on your home screen does not add native
              Samsung sensor access.
            </p>
            <a
              href="https://developer.samsung.com/codelab/health/heart-rate-data-transfer.html"
              target="_blank"
              rel="noreferrer"
            >
              Samsung’s watch-to-phone integration guide ↗
            </a>
          </div>
          <div className="reading-insight">
            <strong>Compatibility depends on the service, not the brand</strong>
            <p>
              Apple Watch does not offer general HealthKit access to this web
              app. Samsung and Garmin models may require a broadcast mode or
              native companion integration. They will appear only if they
              advertise the selected standard BLE service. Pairing alone does
              not expose every health metric.
            </p>
            <p>
              Blood pressure requires an actual compatible measurement device;
              heart-rate data is never converted into a blood-pressure estimate.
            </p>
          </div>
        </div>
        <div className="sensor-display">
          <span className="tag">{latest?.source || "NO ACTIVE SOURCE"}</span>
          <p role="status">{status}</p>
          <strong>
            {latest
              ? `${latest.first}${latest.second ? " / " + latest.second : ""}`
              : "—"}
            <small>{latest?.kind === "Blood pressure" ? "mmHg" : "bpm"}</small>
          </strong>
          {latest && (
            <>
              <p>
                {latest.device}
                <br />
                Received on this device:{" "}
                <time>{new Date(latest.timestamp).toLocaleString()}</time>
                <br />
                {age}s old {age > 30 ? "· STALE — wait for a new reading" : ""}
              </p>
              <button
                className="primary"
                disabled={age > 30}
                onClick={() => onReview(latest)}
              >
                Review this reading →
              </button>
            </>
          )}
          <button className="text-button" onClick={simulate}>
            Start fictional sensor simulation
          </button>
          <small>
            Simulation is labeled at capture, review and save. No automatic
            saving or background monitoring.
          </small>
        </div>
      </div>
      {error && (
        <div role="alert" className="alert">
          {error}
        </div>
      )}
      <p className="fine-print">
        Real device values remain on this browser unless you export them. This
        prototype is not medically validated. No hardware connection has been
        verified until a real device emits a valid measurement.
      </p>
    </section>
  );
}
