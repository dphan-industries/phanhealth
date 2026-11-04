import type { Reading } from "./storage";
export const samples: Reading[] = [
  {
    id: "sample-1",
    kind: "Heart rate",
    value: "68",
    unit: "bpm",
    timestamp: "2026-11-04T08:30:00",
    note: "Fictional reference reading",
    source: "Manual entry",
  },
  {
    id: "sample-2",
    kind: "Blood pressure",
    value: "118 / 76",
    unit: "mmHg",
    timestamp: "2026-11-04T08:35:00",
    note: "Fictional reference reading",
    source: "Manual entry",
  },
];
export const guides = [
  {
    title: "Taking a heart rate reading",
    category: "MEASUREMENT · 2 MIN",
    why: "Heart rate counts beats per minute. Recording activity and context makes comparisons more useful; this app cannot tell whether a value is medically safe.",
    steps: [
      "Follow the approved monitor instructions and wait for its displayed value to settle.",
      "For an Earth-based manual pulse check, locate your wrist pulse with two fingertips and count beats for 60 seconds. Use mission-approved methods in flight.",
      "Record bpm, the measurement time, source and any activity context. Review the entry before saving.",
    ],
    source:
      "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse",
    text: "Use the approved device and its manufacturer instructions. Enter the displayed whole-number reading in bpm. Record the time and any relevant observations. This prototype does not interpret medical safety.",
  },
  {
    title: "Recording blood pressure",
    category: "MEASUREMENT · 3 MIN",
    why: "Systolic is the pressure during a heartbeat; diastolic is the pressure between beats. Both are recorded in mmHg. Heart rate alone cannot provide these values.",
    steps: [
      "Use the approved blood-pressure device, cuff size and manufacturer procedure. In-flight positioning requires a medically reviewed mission protocol.",
      "Earth-based reference: rest quietly for five minutes, use a bare upper arm, support your back and arm, and keep the cuff at heart level. These positioning instructions are not a microgravity protocol.",
      "Record the displayed systolic and diastolic pair, time and context. This app checks entry format and shows a nonclinical demonstration comparison only.",
    ],
    source:
      "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/monitoring-your-blood-pressure-at-home",
    text: "Follow the approved device instructions and your mission training. Record the displayed systolic and diastolic values in mmHg. This prototype validates entry format only.",
  },
  {
    title: "Your offline field manual",
    category: "MISSION SYSTEMS · 2 MIN",
    why: "A local copy keeps the essential console available when Earth communications are unavailable. It is not permanent storage.",
    steps: [
      "Open the production app while connected and wait for verified offline readiness.",
      "Before disconnecting, check that readings can be saved and reopened. Installation is optional.",
      "Export a report for user-controlled transfer or backup. Photos, reminders and home destinations remain device-local.",
    ],
    source: "",
    text: "Preload this app while connected. Wait for verified offline readiness. Installation is optional. Readings stay in this browser on this device and may be cleared or evicted. Export fictional records if needed. No automatic synchronization or background alarms are provided.",
  },
];
