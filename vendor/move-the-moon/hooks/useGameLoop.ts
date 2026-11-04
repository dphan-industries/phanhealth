import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useEffect, useRef } from "react";
import {
  BASE_ASTEROID_SPEED,
  BASE_SPAWN_RATE,
  CENTER_X,
  CENTER_Y,
  COINS_PER_BLOCK,
  EARTH_SIZE,
  MAX_SPEED_MULTIPLIER,
  MIN_SPAWN_RATE,
  MOON_RADIUS,
  MOON_SIZE,
  SPAWN_DIST,
  SPAWN_RATE_STEP_AMOUNT,
  SPEED_STEP_AMOUNT,
  SPEED_STEP_EVERY_SCORE,
} from "../constants/game";
import { Asteroid } from "../types";
import { saveScore } from "./useStorage";

function createAsteroid(id: number): Asteroid {
  const angle = Math.random() * Math.PI * 2;
  const x = CENTER_X + SPAWN_DIST * Math.cos(angle);
  const y = CENTER_Y + SPAWN_DIST * Math.sin(angle);
  const dx = CENTER_X - x;
  const dy = CENTER_Y - y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const framesToImpact = distance / BASE_ASTEROID_SPEED;
  const vx = dx / framesToImpact;
  const vy = dy / framesToImpact;

  return {
    id,
    x,
    y,
    vx,
    vy,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 1.4,
  };
}

type Props = {
  screen: string;
  gameOver: boolean;
  paused: boolean;
  disableGameplay: boolean;
  score: number;
  moonAngleRef: MutableRefObject<number>;
  gameOverRef: MutableRefObject<boolean>;
  pausedRef: MutableRefObject<boolean>;
  scoreRef: MutableRefObject<number>;
  asteroidId: MutableRefObject<number>;
  spawnIndexRef: MutableRefObject<number>;
  setAsteroids: Dispatch<SetStateAction<Asteroid[]>>;
  setScore: Dispatch<SetStateAction<number>>;
  setRunCoins: Dispatch<SetStateAction<number>>;
  setGameOver: Dispatch<SetStateAction<boolean>>;
  setTopScores: Dispatch<SetStateAction<number[]>>;
  setHighScore: Dispatch<SetStateAction<number>>;
  triggerBlockEffect: (x: number, y: number) => void;
  triggerEarthHit: () => void;
  playPop: () => void;
  gamePhase: string;
};

export function useGameLoop({
  screen,
  gameOver,
  paused,
  disableGameplay,
  score,
  moonAngleRef,
  gameOverRef,
  pausedRef,
  scoreRef,
  asteroidId,
  spawnIndexRef,
  setAsteroids,
  setScore,
  setRunCoins,
  setGameOver,
  setTopScores,
  setHighScore,
  triggerBlockEffect,
  triggerEarthHit,
  playPop,
  gamePhase,
}: Props) {
  const asteroidsRef = useRef<Asteroid[]>([]);
  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerBlockEffectRef = useRef(triggerBlockEffect);
  const triggerEarthHitRef = useRef(triggerEarthHit);
  const playPopRef = useRef(playPop);

  useEffect(() => {
    triggerBlockEffectRef.current = triggerBlockEffect;
  }, [triggerBlockEffect]);

  useEffect(() => {
    triggerEarthHitRef.current = triggerEarthHit;
  }, [triggerEarthHit]);

  useEffect(() => {
    playPopRef.current = playPop;
  }, [playPop]);

  const clearSpawnTimeout = () => {
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (
      screen !== "game" ||
      gameOver ||
      disableGameplay ||
      gamePhase !== "playing"
    ) {
      return;
    }

    asteroidId.current += 1;
    spawnIndexRef.current = 1;

    const first = createAsteroid(asteroidId.current);
    asteroidsRef.current = [first];
    setAsteroids([first]);

    return () => {
      clearSpawnTimeout();
    };
  }, [screen, gameOver, disableGameplay, gamePhase, setAsteroids]);

  useEffect(() => {
    if (
      screen !== "game" ||
      gameOver ||
      disableGameplay ||
      gamePhase !== "playing"
    ) {
      return;
    }

    clearSpawnTimeout();

    const scheduleNextSpawn = () => {
      if (gameOverRef.current || screen !== "game" || disableGameplay) {
        return;
      }

      const speedTier = Math.floor(scoreRef.current / SPEED_STEP_EVERY_SCORE);
      const spawnRate = Math.max(
        MIN_SPAWN_RATE,
        BASE_SPAWN_RATE - speedTier * SPAWN_RATE_STEP_AMOUNT,
      );

      spawnTimeoutRef.current = setTimeout(() => {
        if (!pausedRef.current && !gameOverRef.current) {
          asteroidId.current += 1;
          spawnIndexRef.current += 1;

          const newAsteroid = createAsteroid(asteroidId.current);
          asteroidsRef.current = [...asteroidsRef.current, newAsteroid];
          setAsteroids([...asteroidsRef.current]);
        }

        scheduleNextSpawn();
      }, spawnRate);
    };

    scheduleNextSpawn();

    return () => {
      clearSpawnTimeout();
    };
  }, [
    screen,
    gameOver,
    disableGameplay,
    gamePhase,
    setAsteroids,
    gameOverRef,
    pausedRef,
    scoreRef,
    asteroidId,
    spawnIndexRef,
  ]);

  useEffect(() => {
    if (
      screen !== "game" ||
      gameOver ||
      disableGameplay ||
      gamePhase !== "playing"
    ) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (gameOverRef.current) return;

      if (pausedRef.current) {
        lastTime = now;
        frameId = requestAnimationFrame(loop);
        return;
      }

      const rawDelta = (now - lastTime) / 16.6667;
      const delta = Math.min(rawDelta, 1.25);
      lastTime = now;

      const moonX =
        CENTER_X +
        MOON_RADIUS * Math.cos((moonAngleRef.current * Math.PI) / 180);
      const moonY =
        CENTER_Y +
        MOON_RADIUS * Math.sin((moonAngleRef.current * Math.PI) / 180);

      const speedTier = Math.floor(scoreRef.current / SPEED_STEP_EVERY_SCORE);
      const speedMultiplier = Math.min(
        MAX_SPEED_MULTIPLIER,
        1 + speedTier * SPEED_STEP_AMOUNT,
      );

      const remaining: Asteroid[] = [];
      let blocked = 0;
      let hit = 0;
      let blockX = 0;
      let blockY = 0;

      for (const a of asteroidsRef.current) {
        const nx = a.x + a.vx * speedMultiplier * delta;
        const ny = a.y + a.vy * speedMultiplier * delta;
        const newRotation =
          a.rotation + a.rotationSpeed * speedMultiplier * delta;

        const distMoon = Math.sqrt((nx - moonX) ** 2 + (ny - moonY) ** 2);
        if (distMoon < MOON_SIZE / 2 + 8) {
          blocked += 1;
          blockX = nx;
          blockY = ny;
          continue;
        }

        const distEarth = Math.sqrt(
          (nx - CENTER_X) ** 2 + (ny - CENTER_Y) ** 2,
        );
        if (distEarth < EARTH_SIZE / 2 - 5) {
          hit += 1;
          continue;
        }

        remaining.push({ ...a, x: nx, y: ny, rotation: newRotation });
      }

      asteroidsRef.current = remaining;
      setAsteroids([...remaining]);

      if (blocked > 0) {
        const newScore = scoreRef.current + blocked;
        scoreRef.current = newScore;
        setScore(newScore);

        setRunCoins((prev) => prev + blocked * COINS_PER_BLOCK);

        triggerBlockEffectRef.current(blockX, blockY);
        playPopRef.current();
      }

      if (hit > 0) {
        triggerEarthHitRef.current();
        gameOverRef.current = true;
        setGameOver(true);

        void saveScore(scoreRef.current).then((top5) => {
          setTopScores(top5);
          setHighScore(top5[0] ?? 0);
        });
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [
    screen,
    gameOver,
    disableGameplay,
    gamePhase,
    moonAngleRef,
    gameOverRef,
    pausedRef,
    scoreRef,
    setAsteroids,
    setScore,
    setRunCoins,
    setGameOver,
    setTopScores,
    setHighScore,
  ]);
}
