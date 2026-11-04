export type Asteroid = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
};

export type Particle = {
  id: number;
  x: number;
  y: number;
  anim: import("react-native").Animated.Value;
  color: string;
};

export type Screen = "menu" | "game" | "leaderboard" | "shop";
