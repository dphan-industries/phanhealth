export type SoundEffectId =
  | "classic_pops"
  | "water_drop"
  | "toy_squeak"
  | "wine_glass"
  | "magic_twinkle"
  | "bubble_pop"
  | "coin_chime"
  | "page_flip"
  | "soft_breeze"
  | "power_impact"
  | "silly_toot";

export type SoundEffectOption = {
  id: SoundEffectId;
  name: string;
  icon: string;
  cost: number;
  owned: boolean;
};

export const SOUND_EFFECTS: SoundEffectOption[] = [
  {
    id: "classic_pops",
    name: "Classic Pop",
    icon: "🫧",
    cost: 0,
    owned: true,
  },
  {
    id: "water_drop",
    name: "Rain Drop",
    icon: "💧",
    cost: 500,
    owned: false,
  },
  {
    id: "toy_squeak",
    name: "Rubber Squeak",
    icon: "🧸",
    cost: 500,
    owned: false,
  },
  {
    id: "wine_glass",
    name: "Crystal Bell",
    icon: "🔔",
    cost: 500,
    owned: false,
  },
  {
    id: "magic_twinkle",
    name: "Magic Twinkle",
    icon: "✨",
    cost: 500,
    owned: false,
  },
  {
    id: "bubble_pop",
    name: "Bubble Pop",
    icon: "🫧",
    cost: 500,
    owned: false,
  },
  {
    id: "coin_chime",
    name: "Coin Chime",
    icon: "🪙",
    cost: 500,
    owned: false,
  },
  {
    id: "page_flip",
    name: "Page Flip",
    icon: "📖",
    cost: 500,
    owned: false,
  },
  {
    id: "soft_breeze",
    name: "Soft Breeze",
    icon: "🍃",
    cost: 500,
    owned: false,
  },
  {
    id: "power_impact",
    name: "Power Impact",
    icon: "💥",
    cost: 500,
    owned: false,
  },
  {
    id: "silly_toot",
    name: "Silly Toot",
    icon: "🎺",
    cost: 1000,
    owned: false,
  },
];
