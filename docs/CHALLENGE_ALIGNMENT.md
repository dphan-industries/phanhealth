# 2026 challenge alignment — expanded prototype

This audit uses the full challenge text and transcript supplied by David. It supersedes earlier notes that described a protocol placeholder. The brief permits any health-indicator input and lists optional ideas; it does not require every sensor, ultrasound interpretation, autonomous diagnosis, or detection of every spaceflight disease.

## Implemented software coverage

| Challenge objective | Current implementation | Evidence |
| --- | --- | --- |
| Gather useful indicators | Heart rate, blood pressure, blood glucose (mg/dL), temperature (°C), daily sleep, mood and body observations | `lib/storage.ts`, `app/page.tsx`, `app/components/wellbeing.tsx` |
| Usable input | Touch keypad, steppers, sliders, keyboard, decimal temperature, optional activity/site/meal context | `app/components/number-control.tsx`, `app/components/measurement-instructions.tsx` |
| Explain how and why | Instructions and source links for all four measured indicators; sleep/mood context; body-region function and monitoring education | `lib/health.ts`, `app/components/wellbeing.tsx` |
| Evaluate and act | Explicit educational reference categories, reasons, source links, next steps, urgent-symptom override, missing/stale data labels, prior personal readings | `assessReading` in `lib/health.ts`, `app/components/mission-health.tsx` |
| Guidance on improvements / treatment | Measurement verification, clinician/crew escalation, prescribed-plan guidance, CDC adult Earth low-glucose education, rest/social-support and exercise/nutrition plan reminders | `lib/health.ts`, mission and wellbeing components |
| Emergency situation in transcript | Chest-pain/collapse rehearsal, responsiveness and breathing branches, crew response checklist, trained CPR/AED escalation, mission/ground-delay cautions, local action summary | `app/components/emergency-guide.tsx`, `app/page.tsx` |
| Adapt to environments (optional) | Persisted spacecraft, space station, rover, Moon base, Mars base, Earth-training context with different operational cautions | `ENVIRONMENTS` in `lib/health.ts` |
| Time-to-time prompts (optional) | Persistent foreground reminders, configurable labels/time; missed reminders on return | `app/components/reminders.tsx` |
| Dynamic charts (optional) | HR/BP/glucose/temperature history and period-filtered plots; readings retain units and source | `app/components/trends.tsx` |
| Color/status interpretation (optional) | Urgent/review/context cards use text and symbols as well as restrained colors. No green “medically safe” result | mission health and trends |
| Clickable body figure (optional) | Keyboard/click body regions and dropdown; function, monitoring explanation and latest relevant recorded values | wellbeing component |
| Engagement (optional) | Daily reading checklist, seven-day check-in participation count, original Move the Moon and Peace mode | dashboard, wellbeing, game |
| Five hazards / broader observations | Hazard → track → act cards; meals, fluids, aerobic/resistance activity, dosimeter-transcribed 24-hour dose, habitat/EVA/illness notes | mission health and wellbeing |
| Autonomous/offline workflow | Cached content and exported game, local database, verified readiness, review/save, incident/follow-up journal, manual medical handoff download and JSON transfer | service worker, storage and transfer modules |
| NASA resources | NASA hazards/risks and OSDR references available in Mission health; source links are online, the explanatory text is bundled offline | `SOURCES` in `lib/health.ts` |

## Important interpretation

This is software decision support for an adult educational prototype. The app does not diagnose disease, decide medication doses, or invent flight-approved treatment protocols. Its AHA/CDC/MedlinePlus references are **Earth guidance**, explicitly labeled and not validated for altered gravity or an individual astronaut. Symptoms can require action regardless of recorded numbers. No alert, medical message, or emergency call is transmitted by the app.

Bone-density loss, immune dysfunction, radiation injury, and cabin hazards cannot be inferred from a pulse or a mood entry. Exercise, dose and environmental observations are supporting records; no densitometer, lab assay, dosimeter feed or cabin sensor is integrated. Optional examples such as camera input and ultrasound are not implemented and are not claimed as requirements.

## Still requires external work / validation

- Qualified clinical and aerospace-medicine review, individualized target/response plans and approved in-flight procedures.
- Real BLE hardware testing and any native watch/phone integration; Samsung Watch 9 remains unverified and is not natively integrated.
- Real phone installation, physical network-disconnect, storage quota/eviction, multi-browser, and assistive-technology testing.
- No OSDR model training or dataset validation has been performed. Links are research references only.
- Existing source comparison flags remain explicitly labeled arbitrary exhibition comparisons, separate from cited reference guidance. Neither establishes medical safety.

## Verification

24 automated tests pass, including new metric units/decimal validation, BP category boundaries, glucose thresholds, context-sensitive pulse, high/low temperature escalation, and round-trip-compatible report/routine validation. Production build and lint pass. Browser validation and screenshots are described in the README. Existing IndexedDB schema 2 and schema-1 report compatibility are retained; routine fields are optional so old records still load. Offline cache is crew-health-v16.

## Source register (checked 4 November 2026)

- NASA Human Research Program hazards: https://www.nasa.gov/hrp/hazards/
- NASA health risks: https://www.nasa.gov/hrp/risks/
- NASA open biological/physical science data: https://science.nasa.gov/biological-physical/data/
- AHA adult BP categories: https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings
- AHA heart-rate context: https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse
- CDC low glucose: https://www.cdc.gov/diabetes/treatment/treatment-low-blood-sugar-hypoglycemia.html
- CDC DKA / high glucose context: https://www.cdc.gov/diabetes/about/diabetic-ketoacidosis.html
- MedlinePlus fever / method context: https://medlineplus.gov/ency/article/003090.htm
- MedlinePlus low body temperature: https://medlineplus.gov/ency/article/000038.htm
- AHA adult basic life support: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support

Final browser evidence: a separate localhost origin used fictional records, preserving the owner's 127.0.0.1 data. Verified 37.2°C touch-keypad entry/review/save, glucose save and temperature chart selection, source-linked guidance, persistent Mars context, red-flag escalation, action logging, emergency responsiveness/breathing/checklist notes and saved summary, 1500 mL keypad entry, daily routine save, and medical handoff download containing measurements, wellbeing and saved logs. With the preview server stopped, the app reloaded, saved another temperature with its method context, retained it after another refresh and reopened Mission Health with Mars context. At a 390px viewport the updated Mission Health page had no horizontal overflow. This is not physical airplane-mode or hardware/clinical validation.
