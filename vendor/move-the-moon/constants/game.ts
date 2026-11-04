import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const WIDTH = width;
export const HEIGHT = height;
export const CENTER_X = width / 2;
export const CENTER_Y = height / 2;

// Arena sizing
export const MOON_RADIUS = 90;
export const MOON_SIZE = 45;
export const EARTH_SIZE = 90;
export const MAX_ORBIT_RADIUS = MOON_RADIUS * 1.8;
export const SPAWN_DIST = 600;

// Visuals / economy
export const NUM_STARS = 80;
export const COINS_PER_BLOCK = 1;

// Spawn tuning
export const BASE_SPAWN_RATE = 1200;
export const MIN_SPAWN_RATE = 900;
export const SPAWN_RATE_STEP_AMOUNT = 25;

// Speed tuning
export const BASE_ASTEROID_SPEED = 2.1;
export const SPEED_STEP_EVERY_SCORE = 12;
export const SPEED_STEP_AMOUNT = 0.1;
export const MAX_SPEED_MULTIPLIER = 2.8;
