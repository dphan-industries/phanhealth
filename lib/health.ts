import type { Reading } from "./storage.ts";
export const METRICS = [
  "Heart rate",
  "Blood pressure",
  "Blood glucose",
  "Body temperature",
] as const;
export const UNITS: Record<Reading["kind"], string> = {
  "Heart rate": "bpm",
  "Blood pressure": "mmHg",
  "Blood glucose": "mg/dL",
  "Body temperature": "°C",
};
export const SOURCES = {
  nasa: "https://www.nasa.gov/hrp/risks/",
  hazards: "https://www.nasa.gov/hrp/hazards/",
  bp: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
  pulse:
    "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse",
  glucose:
    "https://www.cdc.gov/diabetes/treatment/treatment-low-blood-sugar-hypoglycemia.html",
  highGlucose: "https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html",
  hypothermia: "https://medlineplus.gov/ency/article/000038.htm",
  temperature: "https://medlineplus.gov/ency/article/003090.htm",
  emergency:
    "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support",
  science: "https://science.nasa.gov/biological-physical/data/",
};
export const ENVIRONMENTS = {
  Spacecraft:
    "Microgravity: secure crew and equipment using trained procedures. Do not assume Earth posture or CPR positioning works here. Earth support may be delayed; use onboard medical procedures first.",
  "Space station":
    "Microgravity: use the approved restraint and measurement setup. Coordinate with the crew medical officer and ground medical team through mission communications.",
  Rover:
    "Limited space and equipment: stop vehicle operations safely before assessment. Record cabin alarms, suit use, and recent exertion; use the vehicle emergency plan.",
  "Moon base":
    "Partial gravity and dust exposure: use habitat-approved measurement, contamination-control, and medical procedures. Record EVA context; do not substitute Earth positioning rules.",
  "Mars base":
    "Partial gravity and delayed Earth communications: use onboard procedures and the crew medical officer without waiting for a ground reply during an emergency.",
  "Earth training":
    "Earth-only educational reference ranges apply to adults; individual targets and measurement technique still require a qualified clinician. Use local emergency services for emergencies.",
} as const;
export type Environment = keyof typeof ENVIRONMENTS;
export type Assessment = {
  level: "urgent" | "review" | "context";
  title: string;
  why: string;
  actions: string[];
  source: string;
};
export function assessReading(
  reading: Pick<Reading, "kind" | "value">,
  resting = false,
): Assessment {
  const [a, b] = reading.value.split("/").map(Number);
  const result = (
    level: Assessment["level"],
    title: string,
    why: string,
    actions: string[],
    source: string,
  ): Assessment => ({ level, title, why, actions, source });
  if (
    !Number.isFinite(a) ||
    (reading.kind === "Blood pressure" && !Number.isFinite(b))
  )
    return result(
      "context",
      "Cannot assess this value",
      "A valid measurement is required.",
      ["Check units and the original device reading."],
      SOURCES.nasa,
    );
  if (reading.kind === "Blood pressure") {
    if (a > 180 || b > 120)
      return result(
        "urgent",
        "Severe BP range — prompt medical attention",
        "AHA adult Earth reference: systolic above 180 or diastolic above 120. This alone is not a diagnosis.",
        [
          "With chest pain, breathing difficulty, weakness, or speech/vision changes, activate emergency response immediately.",
          "Without those symptoms, repeat after at least one minute and obtain immediate medical advice if still this high. In flight, contact the crew medical officer and use the approved mission procedure.",
        ],
        SOURCES.bp,
      );
    const range =
      a >= 140 || b >= 90
        ? "Stage 2"
        : a >= 130 || b >= 80
          ? "Stage 1"
          : a >= 120
            ? "Elevated"
            : "Below the elevated BP cutoffs";
    return result(
      range === "Below the elevated BP cutoffs" ? "context" : "review",
      range + " — Earth reference",
      "One reading does not diagnose hypertension or prove safety. Low BP and symptoms require separate assessment.",
      [
        "Confirm cuff size and technique; record posture, activity, and symptoms.",
        "Discuss repeated changes with the crew medical officer; follow your individualized plan. Do not change medication from this app.",
      ],
      SOURCES.bp,
    );
  }
  if (reading.kind === "Heart rate")
    return result(
      resting && (a < 60 || a > 100) ? "review" : "context",
      resting && (a < 60 || a > 100)
        ? "Outside common adult resting range"
        : "Activity context needed",
      "AHA describes 60–100 bpm as common for resting adults. Training, medicines, activity, and symptoms change interpretation.",
      [
        "If this is unexpected at rest, confirm the measurement and discuss persistent changes with the medical officer.",
        "Symptoms such as collapse or chest pain take priority over the number.",
      ],
      SOURCES.pulse,
    );
  if (reading.kind === "Blood glucose") {
    if (a < 55)
      return result(
        "urgent",
        "Severely low glucose reference",
        "CDC Earth guidance identifies values below 55 mg/dL as severely low.",
        [
          "Get immediate crew medical help and follow the prescribed hypoglycemia plan.",
          "Do not give food or drink to someone unable to swallow safely.",
        ],
        SOURCES.glucose,
      );
    if (a < 70)
      return result(
        "review",
        "Low glucose reference — act promptly",
        "CDC Earth guidance considers glucose below 70 mg/dL low.",
        [
          "Alert the medical officer and follow your prescribed low-glucose plan now.",
          "Earth education for a conscious adult able to swallow: 15 g fast-acting carbohydrate, recheck after 15 minutes, and repeat if still below 70. This is not an approved flight protocol.",
        ],
        SOURCES.glucose,
      );
    if (a >= 250)
      return result(
        "review",
        "High glucose — medical review",
        "CDC advises people with diabetes to check ketones when glucose is 250 mg/dL or above, or when sick.",
        [
          "Follow your clinician’s diabetes/sick-day plan; contact the medical officer.",
          "Vomiting, difficult breathing, or altered awareness requires urgent help. No insulin dose is calculated here.",
        ],
        SOURCES.highGlucose,
      );
    return result(
      "context",
      "Compare with your personal glucose target",
      "Fasting, meals, medicines, and diagnosis affect glucose targets. This app cannot establish a normal value for you.",
      [
        "Record time since food and device method; compare with your clinician-set target.",
      ],
      SOURCES.glucose,
    );
  }
  if (a < 35)
    return result(
      "urgent",
      "Low temperature — urgent medical attention",
      "A core temperature below 35°C is a hypothermia reference. Confirm the device and measurement site without delaying help for symptoms.",
      [
        "Alert the crew medical officer and follow the approved cold-exposure procedure.",
      ],
      SOURCES.hypothermia,
    );
  return result(
    a >= 39.4 ? "urgent" : a > 37.5 ? "review" : "context",
    a >= 39.4
      ? "High temperature — prompt medical review"
      : a > 37.5
        ? "Possible fever — verify method"
        : "Temperature needs measurement context",
    "Oral temperature above roughly 37.2–37.5°C can indicate fever in adults. Site, time of day, and exertion affect interpretation.",
    [
      "Record measurement site and device; repeat using the correct procedure.",
      "Persistent fever or new symptoms needs medical review. Confusion, breathing difficulty, or collapse requires urgent help. An unexpectedly low temperature also needs medical review.",
    ],
    SOURCES.temperature,
  );
}
export const MEASUREMENT_HELP: Record<
  Reading["kind"],
  { what: string; why: string; steps: string[]; source: string }
> = {
  "Heart rate": {
    what: "Heartbeats per minute (bpm).",
    why: "Activity, stress, and cardiovascular adaptation can change the pulse; context is essential.",
    steps: [
      "Use a supported monitor or follow its manufacturer procedure.",
      "Record whether you were resting, exercising, or recovering.",
      "Confirm skin contact and save the displayed bpm with symptoms.",
    ],
    source: SOURCES.pulse,
  },
  "Blood pressure": {
    what: "Systolic / diastolic pressure in mmHg.",
    why: "Tracks circulation; a single reading cannot establish a disease or rule out an emergency.",
    steps: [
      "Use an approved cuff and correct size.",
      "Follow the mission-specific positioning and restraint procedure; Earth seated instructions do not translate directly to microgravity.",
      "Record both values, activity, symptoms, and repeat measurements when instructed.",
    ],
    source: SOURCES.bp,
  },
  "Blood glucose": {
    what: "Blood sugar in mg/dL. Do not enter mmol/L into this field.",
    why: "Food intake, illness, and medicines affect glucose; low values can require prompt action.",
    steps: [
      "Use the approved glucose meter and strip/sensor instructions.",
      "Follow contamination control and sharps containment procedures; do not improvise a fingerstick in flight.",
      "Record fasting/after-meal context and meter result. This app does not read a CGM.",
    ],
    source: SOURCES.glucose,
  },
  "Body temperature": {
    what: "Temperature in °C, with one decimal place.",
    why: "Can support investigation of illness, but is not a direct measure of immune function.",
    steps: [
      "Use the approved thermometer and cleaning procedure.",
      "Record the site (oral, ear, skin, etc.); those methods are not interchangeable.",
      "Enter °C; convert °F before entry. Record time and recent exertion.",
    ],
    source: SOURCES.temperature,
  },
};
export const HAZARDS = [
  {
    title: "Radiation",
    risk: "Exposure can affect multiple body systems.",
    track:
      "Record dosimeter readings and exposure periods in the daily log. Vital signs cannot estimate radiation dose.",
    act: "Follow radiation alerts and the mission shelter plan; dose interpretation belongs to radiation specialists.",
  },
  {
    title: "Isolation & confinement",
    risk: "Sleep, mood, and performance can change.",
    track: "Log sleep and mood consistently, plus fatigue or social concerns.",
    act: "Protect scheduled rest and arrange a confidential crew/medical check-in when changes persist. Recreation is optional, not treatment.",
  },
  {
    title: "Distance from Earth",
    risk: "Communication delays limit immediate ground support.",
    track:
      "Keep local readings, notes, and action records for the medical officer.",
    act: "Use onboard procedures during urgent events; queue a report for manual transfer when communications return.",
  },
  {
    title: "Altered gravity",
    risk: "Bone, muscle, and cardiovascular adaptation need monitoring.",
    track:
      "Log prescribed exercise completion, discomfort, and cardiovascular measurements.",
    act: "Follow the individualized resistance/aerobic plan. Exercise minutes do not measure bone density.",
  },
  {
    title: "Hostile closed environment",
    risk: "Cabin conditions, infection, and nutrition affect health.",
    track:
      "Record habitat alarms, illness observations, meals, fluids, and temperature.",
    act: "Report shared crew symptoms or environmental alarms; follow habitat procedures. Notes cannot measure immune function.",
  },
];
