"use client";
import { useEffect, useState } from "react";
import { readRecords, type Preference } from "../../lib/storage";
import { SOURCES, ENVIRONMENTS, type Environment } from "../../lib/health";
export default function EmergencyGuide({
  onSummary,
}: {
  onSummary: (summary: string) => void;
}) {
  const [environment, setEnvironment] = useState<Environment | null>(null);
  useEffect(() => {
    readRecords<Preference>("preferences")
      .then((rows) => {
        const value = rows.find((r) => r.id === "mission-environment")?.value;
        setEnvironment(
          value && value in ENVIRONMENTS
            ? (value as Environment)
            : "Spacecraft",
        );
      })
      .catch(() => setEnvironment(null));
  }, []);
  const [scenario, setScenario] = useState("Chest pain / collapse");
  const [response, setResponse] = useState("Unknown");
  const [breathing, setBreathing] = useState("Unknown");
  const [checked, setChecked] = useState<string[]>([]);
  const steps = [
    "Alert nearby crew and the crew medical officer. Activate the mission emergency plan.",
    "Check scene / cabin / suit safety before approaching. Do not expose another crew member to a hazard.",
    "Assess responsiveness and normal breathing using your training. Gasping is not normal breathing.",
    "Bring the emergency kit and AED if available; follow its prompts and your trained mission procedure.",
    "Assign a crew member to mission communications; do not delay immediate aid while awaiting Earth.",
    "Record times, symptoms, readings, actions and response for the medical handoff.",
  ];
  useEffect(() => {
    if (checked.length || response !== "Unknown" || breathing !== "Unknown")
      onSummary(
        `Emergency rehearsal: ${scenario}\nEnvironment: ${environment || "Unknown"}\nResponsive: ${response}; normal breathing: ${breathing}\nActions practiced: ${checked.join("; ")}\nNo help was dispatched by this app.`,
      );
  }, [checked, response, breathing, scenario, onSummary, environment]);
  return (
    <div className="emergency-guide">
      <h3>Guided emergency rehearsal</h3>
      <div className="instruction">
        <strong>
          Environment:{" "}
          {environment || "Not available — use your actual mission plan"}
        </strong>
        {environment && <p>{ENVIRONMENTS[environment]}</p>}
      </div>
      <p>
        <strong>Real event?</strong> Stop the simulation, alert crew, and use
        your approved emergency procedure now. On Earth, call local emergency
        services. This software cannot call for help or replace training.
      </p>
      <label>
        Training scenario
        <select
          value={scenario}
          onChange={(e) => {
            setScenario(e.target.value);
            setChecked([]);
          }}
        >
          <option>Chest pain / collapse</option>
          <option>Low glucose / altered awareness</option>
          <option>Fever / possible illness</option>
          <option>Cabin alarm / shared crew symptoms</option>
        </select>
      </label>
      <div className="input-row">
        <label>
          Responsive?
          <select
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          >
            <option>Unknown</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </label>
        <label>
          Breathing normally?
          <select
            value={breathing}
            onChange={(e) => setBreathing(e.target.value)}
          >
            <option>Unknown</option>
            <option>Yes</option>
            <option>No / gasping</option>
          </select>
        </label>
      </div>
      {(response === "No" || breathing === "No / gasping") && (
        <div className="alert" role="alert">
          Treat unresponsiveness with absent or abnormal breathing as an
          emergency. Activate response and begin CPR/AED according to your
          training and approved procedure. Microgravity requires trained
          positioning and restraint techniques; Earth positioning instructions
          are not a flight protocol.
        </div>
      )}
      {scenario === "Low glucose / altered awareness" && (
        <p>
          Get medical help immediately for altered awareness or inability to
          swallow. Do not give oral food or fluid to someone unable to swallow
          safely. Use the prescribed hypoglycemia rescue plan; this app supplies
          no medication dose.
        </p>
      )}
      {scenario === "Fever / possible illness" && (
        <p>
          Report symptoms and temperature method to the medical officer. Follow
          infection-control instructions and review whether other crew are
          affected. Fever alone does not identify the cause.
        </p>
      )}
      {scenario === "Cabin alarm / shared crew symptoms" && (
        <p>
          Use the habitat / vehicle environmental emergency procedure. Tell crew
          about shared symptoms and alarms. Do not enter a hazardous space
          without the required equipment and training.
        </p>
      )}
      <fieldset>
        <legend>Rehearsal checklist — mark actions practiced</legend>
        {steps.map((s, i) => (
          <label className="check-label" key={s}>
            <input
              type="checkbox"
              checked={checked.includes(s)}
              onChange={(e) =>
                setChecked((v) =>
                  e.target.checked ? [...v, s] : v.filter((x) => x !== s),
                )
              }
            />
            {i + 1}. {s}
          </label>
        ))}
      </fieldset>
      <p>
        {checked.length} / {steps.length} rehearsal actions recorded here. These
        checkboxes do not verify treatment or dispatch help.
      </p>
      <p>
        <a href={SOURCES.emergency} target="_blank" rel="noreferrer">
          AHA adult basic life support · Earth reference ↗
        </a>
      </p>
    </div>
  );
}
