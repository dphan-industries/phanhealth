> Current scope (2026-11-04): Earth Room and its map, nature, breathing, and constellation screens are removed from the interface at David’s request. Move the Moon replaces that screen. Earlier Earth Room entries below describe archived work, not currently available features. See docs/MOVE_THE_MOON.md.

# Crew Health Companion — full requirement audit

This tracks the original pasted brief and the subsequent touch, wearable and Earth Room requests. “Implemented” describes the source and app behavior; it does not imply medical validation, flight approval or hardware certification. External dependencies are called out rather than represented by fake connected/live states.

## Original brief

| Requirement | Implementation / evidence | Verification or limit |
|---|---|---|
| Inspect repository, preserve conventions and unrelated files, explain plan | Retained Next.js App Router / React / TypeScript project; local implementation plan given before edits | Existing unrelated assets retained; no deployment or account creation |
| Tablet first, phone and desktop responsive | Mission console CSS, responsive navigation, cards, large controls | Browser screenshots reviewed at tablet and phone widths; final screen-reader audit still required |
| Calm normal mode, restrained emergency mode | Cyan instrument panels; emergency view suppresses unrelated navigation/reminder distractions | Emergency placeholder flow reviewed in browser |
| No color-only status | Text labels, symbols, source badges, explanatory messages | No clinical green/red classification |
| Keyboard, visible focus, semantic labels, reduced motion | Skip link, native dialog keypad, labeled fields, region selector keyboard controls, globe coordinate alternatives; reduced-motion CSS | Quiet view adds focus containment and Escape; assistive-device verification remains |
| Local fonts/assets | System fonts, SVG icons, CSS scenes, bundled map geometry and Three.js | No remote font or imagery needed for core views |
| Fictional profile, date, honest offline readiness | Alex Chen / Asteria; UTC header date; verified cache inventory plus local database loading | Future quota/eviction cannot be guaranteed; failures are explained |
| Today's checklist and recent readings with units/times | Reading-based daily completion, fictional sample badges, saved-source badges and timestamps | Sample data clearly separated from manually/sensor-recorded data |
| Cards for Measurements, History, Guides | Dedicated dashboard launch cards, plus Wearables / Wellbeing / Earth Room | Browser navigation checked |
| Emergency available throughout | Sidebar, floating control, and quiet-view emergency control | Direct Dashboard and previous-view controls retained |
| Prototype label | Header badge, footer and emergency warning | No medical / flight-ready claims |
| Complete measurement flow | Choose → instructions and why → touch/keyboard entry → optional note → review/explanation → save → history | Keypad/review/save and flagged reading checked in browser |
| Heart rate and blood pressure | Both supported; full value, units, timestamp, source and note persist | Manual entries use format-only checks; sensor timestamps indicate receipt on this device |
| Required / structurally plausible values | Whole-number range 1–999 as representation limit | Not a clinical threshold; automated invalid-input tests |
| Warn about unsaved input | Navigation confirmation and browser unload handler; wellbeing dirty state included | Browser policies control unload dialogs; keypad Cancel leaves the prior reading intact |
| Loading, saving, saved, validation and failed save states | Local loading status, disabled saving controls, commit-based success and visible errors retaining drafts | Automated open-failure and aborted-write tests; real browser quota failure remains manual |
| Actual trend/history views | Plotted saved/sample values with series legends, units, timestamps in history and plot tooltips; period selector and history pagination | Points spaced by reading order, explicitly labeled; no decorative waveform presented as telemetry |
| Explain every demonstration flag | HR absolute change ≥15 bpm; BP change ≥20 mmHg in either component vs previous entry or fictional reference | Arbitrary exhibition rules, explicitly nonclinical; tests cover both boundaries and explanations |
| No diagnosis / prediction | No disease classification, automatic diagnosis, medical safety clearance or treatment engine | Medically reviewed interpretation would be separate future work |
| Simulated emergency warning | Explicit training-only warning before scenario | No real emergency treatment provided |
| Fictional scenario and one-step protocol | Placeholder stage contains “Approved mission protocol would appear here.” | Deliberately no invented chest-pain, medication or treatment instructions |
| Observation/timestamp/incident summary | Locally saved incident with timestamp, notes and summary/history | Browser save checked; IndexedDB persistence tests |
| Back/home and unsaved incident notes | Previous-view navigation and Dashboard available; dirty note guard | No note silently discarded by application navigation |
| Real offline shell | Production service worker preloads HTML, all referenced Next static JS/CSS, local manifest and icon; guides/map/scenes are bundled | Cache inventory verification and missing-resource tests; server-stopped browser test |
| IndexedDB schema/version handling | Version 2 adds wellness, preferences and local photo resources to readings/incidents | Version-1 migration test proves existing readings survive |
| No server actions / remote service for core flows | Single client route, local transactions and bundled content | Bluetooth requires local radio support; optional external links require internet |
| Honest first visit/install/offline limits | Readiness verification/timeout/error UI and bundled offline guide | Installation optional; preload required; browser storage may be evicted |
| No remote AI, analytics, fonts, DB or imagery dependence | None added | Online NASA/map links only activate when user opens them |
| No implied automatic cross-device sync | User-reviewed JSON export/import with validation and atomic merge | Browser reviewed import and refresh verified; manual file transfer, no background or cloud synchronization |
| Export and sensitive-data warning | Schema-tagged JSON with readings, incidents and wellbeing | Photos, favorites, reminders excluded; exports unencrypted |
| Privacy/security limitations | Device/browser-local disclosure in UI and README | No mission-grade security, permanent storage or continuous alarms promised |
| Sleep/mood optional idea | Sleep duration, labeled mood choices, saved journal | Browser saved check-in verified |
| Body diagram optional idea | Accessible clickable body regions plus dropdown and notes | No symptom interpretation |
| Reminders optional idea | Persisted local reminder and foreground due banner | Due banner and dismissal verified with server stopped; no OS push/background alarm guarantee |
| Sensor optional idea | Standard BLE Heart Rate and Blood Pressure discovery/notifications, source/time labels, stale readings, disconnect/errors, review-before-save | Parser tests pass; physical devices not available for verification |
| Clean structure and dependencies | Separate input, trends, Bluetooth, globe, Earth Room, wellbeing, reminder and transfer modules | README documents package purposes and licenses |
| Automated tests and production build | Validation, schema migration, persistence, failure, Bluetooth parsing, flags, cache verification and transfer tests | Build/lint/test results recorded in README/handoff |
| Repeatable offline acceptance test | README procedure includes preload, disconnect, save, reload, guides, missing assets and storage failure | Physical disconnect, mobile radios and quota failures still need actual devices |

## Subsequent requests

| Request | Delivered | Remaining external boundary |
|---|---|---|
| Tap numbers instead of typing | Large numeric keypad, + / − controls; optional drag slider; keyboard retained | None for browser implementation |
| Explain how readings compare | Actual trend plots, definitions, measurement education and explained exhibition changes | Clinical interpretation is intentionally not implemented; original brief prohibits diagnoses |
| Bluetooth across devices | Brand-independent standard BLE service discovery for HR and BP; no hard-coded brand restriction | A watch must expose the service. Apple/Samsung/Garmin native health-store integration is not universal browser Bluetooth and is not implemented |
| Calming screen | Earth Room, quiet view, adjustable breathing visual, 1/2/5/10-minute timer, optional synthesized ambience, Stop and reduced motion | Optional comfort feature, no treatment claim |
| Interactive Earth / countries | Three.js globe, drag/zoom/tap, searchable 241 Natural Earth country/territory features, exact coordinate navigation | Country centers approximate; cartography not current live satellite imagery |
| Feel at home | Saved home location and user-imported local photo; offline Ocean/Forest/Mountains/Stillness illustrations | Illustrated nature scenes are generic; not real location panoramas |
| Live view of every country | User-initiated NASA live programming and selected-coordinate online map links | Worldwide live camera coverage / licensed panorama library not supplied or implemented. External imagery is not inherently live. No fake “LIVE” badges |
| Full device integration | Actual BLE implementation and a clearly separate working simulator | No claim that all watches, all browsers, or real hardware have been tested |

## Explicitly unfinished external work

1. Real-device testing and any required native Apple/Samsung/Garmin companion apps / platform approvals.
2. Licensed and verified location-specific live camera or panorama sources. No worldwide live-feed coverage exists in this codebase.
3. Medically reviewed mission protocols and validated clinical interpretation. Placeholders and demonstration comparisons are intentional requirements, not completed clinical software.
4. Physical network-disconnect, real storage-quota/private-browser failure, full assistive-technology, multi-browser and flight-environment testing.
5. Automatic multi-device/cloud synchronization. File transfer is implemented and honestly labeled; no cloud service or account was created.
