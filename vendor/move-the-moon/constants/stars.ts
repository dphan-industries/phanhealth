import { HEIGHT, NUM_STARS, WIDTH } from "./game";

export type Star = { x: number; y: number; size: number; opacity: number };

export const STARS: Star[] = Array.from({ length: NUM_STARS }, () => ({
  x: Math.random() * WIDTH,
  y: Math.random() * HEIGHT,
  size: Math.random() * 2.5 + 0.5,
  opacity: Math.random() * 0.8 + 0.2,
}));
