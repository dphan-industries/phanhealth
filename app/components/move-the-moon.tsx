"use client";

import Image from "next/image";
import { useState } from "react";

export default function MoveTheMoon() {
  const [playing, setPlaying] = useState(false);
  const [session, setSession] = useState(0);
  return (
    <section className="panel moon-room">
      <div className="eyebrow">RECREATION DECK · YOUR ORIGINAL GAME</div>
      <h2>Move the Moon</h2>
      <p>
        A moment away from the mission. Your game’s original planets, sounds,
        shop, and local scores are bundled here for offline play.
      </p>
      <p id="moon-controls">
        Drag around Earth to move the Moon and block incoming asteroids. Click
        the game to focus it; left / right arrow keys move the Moon, and Space
        or Escape pauses. Your original Peace mode is available through the
        game’s Earth interaction. Sound starts muted; use the game’s sound
        controls to enable it.
      </p>
      <div className="actions">
        {!playing ? (
          <button className="primary" onClick={() => setPlaying(true)}>
            Launch Move the Moon
          </button>
        ) : (
          <>
            <button className="secondary" onClick={() => setPlaying(false)}>
              Close game
            </button>
            <button
              className="secondary"
              onClick={() => {
                if (
                  window.confirm(
                    "Restart the game? Your current run will end; saved game progress stays on this device.",
                  )
                )
                  setSession((s) => s + 1);
              }}
            >
              Restart game
            </button>
          </>
        )}
      </div>
      {playing ? (
        <iframe
          key={session}
          className="moon-game"
          title="Move the Moon game"
            src="/games/move-the-moon"
          aria-describedby="moon-controls"
        />
      ) : (
        <div className="moon-launch">
          <Image
            unoptimized
            src="/games/move-the-moon/preview.png"
            alt="Your original Move the Moon Earth artwork"
            width="150"
            height="150"
          />
          <h3>Your Moon. Your orbit.</h3>
          <p>Launch when you’re ready. No ads or online account.</p>
        </div>
      )}
      <p className="fine-print">
        Closing the game ends the current run. Scores, coins, and equipped items
        save locally in this browser; progress from the original PC or phone
        game is not imported. Offline play is available after OFFLINE READY
        appears.
      </p>
    </section>
  );
}
