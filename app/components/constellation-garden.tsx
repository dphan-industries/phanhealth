import { useEffect, useRef, useState } from "react";
import { gardens, connectStar } from "../../lib/garden";
export default function ConstellationGarden() {
  const [pattern, setPattern] = useState(0);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Start with the softly glowing star.");
  const [paused, setPaused] = useState(false);
  const activeRef = useRef<HTMLButtonElement>(null);
  const garden = gardens[pattern];
  const complete = progress === garden.points.length;
  useEffect(() => {
    if (progress > 0 && !complete && !paused)
      activeRef.current?.focus({ preventScroll: true });
  }, [progress, complete, paused]);
  function select(index: number) {
    if (paused) return;
    const next = connectStar(progress, index, garden.points.length);
    if (next === progress) {
      setMessage("Your next star is the glowing one. Take your time.");
      return;
    }
    setProgress(next);
    setMessage(
      next === garden.points.length
        ? "A new constellation is growing in your garden."
        : `${next} stars connected. Follow the next soft glow.`,
    );
  }
  function change(next: number) {
    setPattern(next);
    setProgress(0);
    setPaused(false);
    setMessage(
      "A fresh sky. Start wherever your attention settles, then follow the glowing star.",
    );
  }
  return (
    <div className="constellation-garden">
      <div className="garden-heading">
        <div>
          <span className="tag">CONSTELLATION GARDEN · OFFLINE MINI GAME</span>
          <h3>{garden.name}</h3>
          <p>{garden.subtitle} Connect the stars in order, at your own pace.</p>
        </div>
        <button className="secondary" onClick={() => setPaused(!paused)}>
          {paused ? "Resume" : "Pause garden"}
        </button>
      </div>
      <div
        className="garden-board"
        role="group"
        aria-label={`${garden.name}, connect ${garden.points.length} stars in order`}
      >
        <div className="garden-nebula" aria-hidden="true" />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            points={garden.points
              .slice(0, progress)
              .map((p) => p.join(","))
              .join(" ")}
            fill="none"
            stroke={complete ? "#edd3a1" : "#80dfdb"}
            strokeWidth=".35"
          />
          {progress > 0 &&
            garden.points
              .slice(0, progress)
              .map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r=".5" fill="#c1f4ed" />
              ))}
        </svg>
        {garden.points.map(([x, y], index) => (
          <button
            key={`${pattern}-${index}`}
            ref={index === progress ? activeRef : undefined}
            className={`garden-star ${index === progress ? "next-star" : ""} ${index < progress ? "connected-star" : ""}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            disabled={paused || index < progress || complete}
            aria-label={`Star ${index + 1}${index < progress ? ", connected" : index === progress ? ", next" : ""}`}
            onClick={() => select(index)}
          >
            <span aria-hidden="true">✦</span>
            <small>{index + 1}</small>
          </button>
        ))}
        {paused && (
          <div className="garden-pause">
            <h4>A little pause.</h4>
            <p>Your sky will be here when you return.</p>
            <button className="primary" onClick={() => setPaused(false)}>
              Resume garden
            </button>
          </div>
        )}
        {complete && (
          <div className="garden-complete">
            <span>✧</span>
            <h4>A quiet little constellation.</h4>
            <p>You can stay with it, or explore another sky.</p>
            <button
              className="primary"
              onClick={() => change((pattern + 1) % gardens.length)}
            >
              Explore another sky →
            </button>
          </div>
        )}
      </div>
      <div className="garden-footer">
        <p role="status">{message}</p>
        <span>
          {progress} / {garden.points.length} connected
        </span>
        <button className="text-button" onClick={() => change(pattern)}>
          Start this sky again
        </button>
        <label>
          Choose a sky
          <select value={pattern} onChange={(e) => change(+e.target.value)}>
            {gardens.map((g, i) => (
              <option key={g.name} value={i}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="garden-note">
        An untimed break, with no penalties or leaderboard. Imaginary patterns,
        not an astronomy lesson. Progress lasts while Earth Room remains open.
      </p>
    </div>
  );
}
