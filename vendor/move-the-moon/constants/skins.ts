import { ImageSourcePropType } from "react-native";

export type SkinType = "earth" | "moon" | "bg";

export type Skin = {
  id: string;
  name: string;
  type: SkinType;
  color: string;
  cost: number;
  owned: boolean;
};

type SkinCatalogItem = Skin & {
  asset?: ImageSourcePropType;
};

const SKIN_CATALOG: Record<SkinType, SkinCatalogItem[]> = {
  earth: [
    {
      id: "default_earth",
      name: "Earth",
      type: "earth",
      color: "#0a4a8a",
      cost: 0,
      owned: true,
      asset: require("../assets/images/earth.png"),
    },
    {
      id: "frozen_earth",
      name: "Frozen Earth",
      type: "earth",
      color: "#a8d8ea",
      cost: 250,
      owned: false,
      asset: require("../assets/images/frozen_earth.png"),
    },
    {
      id: "cyber_earth",
      name: "Cyber Earth",
      type: "earth",
      color: "#2ca51c",
      cost: 250,
      owned: false,
      asset: require("../assets/images/cyber_earth.png"),
    },
    {
      id: "desert_earth",
      name: "Desert Earth",
      type: "earth",
      color: "#c49b63",
      cost: 300,
      owned: false,
      asset: require("../assets/images/desert_earth.png"),
    },
    {
      id: "jurassic_earth",
      name: "Jurassic Earth",
      type: "earth",
      color: "#4f8a3c",
      cost: 450,
      owned: false,
      asset: require("../assets/images/jurassic_earth.png"),
    },
    {
      id: "ocean_earth",
      name: "Ocean Earth",
      type: "earth",
      color: "#2d7dd2",
      cost: 450,
      owned: false,
      asset: require("../assets/images/ocean_earth.png"),
    },
    {
      id: "pink_earth",
      name: "Pink Earth",
      type: "earth",
      color: "#d97aa8",
      cost: 500,
      owned: false,
      asset: require("../assets/images/pink_earth.png"),
    },
  ],

  moon: [
    {
      id: "default_moon",
      name: "Moon",
      type: "moon",
      color: "#d4c9a0",
      cost: 0,
      owned: true,
      asset: require("../assets/images/moon.png"),
    },
    {
      id: "blood_moon",
      name: "Blood Moon",
      type: "moon",
      color: "#8B0000",
      cost: 250,
      owned: false,
      asset: require("../assets/images/blood_moon.png"),
    },
    {
      id: "cheese_moon",
      name: "Cheese Moon",
      type: "moon",
      color: "#f0c94d",
      cost: 250,
      owned: false,
      asset: require("../assets/images/cheese_moon.png"),
    },
    {
      id: "green_moon",
      name: "Green Moon",
      type: "moon",
      color: "#5fae4b",
      cost: 300,
      owned: false,
      asset: require("../assets/images/green_moon.png"),
    },
    {
      id: "orange_moon",
      name: "Orange Moon",
      type: "moon",
      color: "#f28c28",
      cost: 300,
      owned: false,
      asset: require("../assets/images/orange_moon.png"),
    },
    {
      id: "pink_moon",
      name: "Pink Moon",
      type: "moon",
      color: "#e78fb3",
      cost: 450,
      owned: false,
      asset: require("../assets/images/pink_moon.png"),
    },
    {
      id: "purple_moon",
      name: "Purple Moon",
      type: "moon",
      color: "#8a63d2",
      cost: 500,
      owned: false,
      asset: require("../assets/images/purple_moon.png"),
    },
    {
      id: "sky_blue_moon",
      name: "Sky Blue Moon",
      type: "moon",
      color: "#6ec6ff",
      cost: 500,
      owned: false,
      asset: require("../assets/images/sky_blue_moon.png"),
    },
    {
      id: "mineral_moon",
      name: "Mineral Moon",
      type: "moon",
      color: "#8a9bc4",
      cost: 1000,
      owned: false,
      asset: require("../assets/images/mineral_moon.png"),
    },
  ],
  bg: [
    {
      id: "default_bg",
      name: "Deep Space",
      type: "bg",
      color: "#050a1a",
      cost: 0,
      owned: true,
    },
    {
      id: "nebula",
      name: "Nebula",
      type: "bg",
      color: "#2E1A47",
      cost: 300,
      owned: false,
    },
    {
      id: "galaxy",
      name: "Galaxy",
      type: "bg",
      color: "#12284A",
      cost: 350,
      owned: false,
    },
    {
      id: "midnight_ocean_bg",
      name: "Midnight Ocean",
      type: "bg",
      color: "#163847",
      cost: 350,
      owned: false,
    },
    {
      id: "aurora_bg",
      name: "Aurora",
      type: "bg",
      color: "#1B3F37",
      cost: 500,
      owned: false,
    },
    {
      id: "eclipse_bg",
      name: "Eclipse",
      type: "bg",
      color: "#1A1624",
      cost: 500,
      owned: false,
    },
    {
      id: "crimson_void_bg",
      name: "Crimson Void",
      type: "bg",
      color: "#40222A",
      cost: 500,
      owned: false,
    },
    {
      id: "solar_night_bg",
      name: "Solar Night",
      type: "bg",
      color: "#40311C",
      cost: 500,
      owned: false,
    },
    {
      id: "frozen_cosmos_bg",
      name: "Frozen Cosmos",
      type: "bg",
      color: "#AEBFD1",
      cost: 750,
      owned: false,
    },
    {
      id: "phantom_drift_bg",
      name: "Phantom Drift",
      type: "bg",
      color: "#202A46",
      cost: 750,
      owned: false,
    },
    {
      id: "blush_cloud_bg",
      name: "Blush Cloud",
      type: "bg",
      color: "#B88FA3",
      cost: 800,
      owned: false,
    },
    {
      id: "rose_glow_bg",
      name: "Rose Glow",
      type: "bg",
      color: "#A86F87",
      cost: 800,
      owned: false,
    },
    {
      id: "sky_dream_bg",
      name: "Sky Dream",
      type: "bg",
      color: "#7FA8D1",
      cost: 1000,
      owned: false,
    },
    {
      id: "pastel_blue_bg",
      name: "Pastel Blue",
      type: "bg",
      color: "#90A9D6",
      cost: 1000,
      owned: false,
    },
    {
      id: "cloud_white_bg",
      name: "Cloud White",
      type: "bg",
      color: "#D8E0EA",
      cost: 1000,
      owned: false,
    },
  ],
};

export const SHOP_ITEMS: Record<SkinType, Skin[]> = {
  earth: SKIN_CATALOG.earth.map(({ asset, ...skin }) => skin),
  moon: SKIN_CATALOG.moon.map(({ asset, ...skin }) => skin),
  bg: SKIN_CATALOG.bg.map(({ asset, ...skin }) => skin),
};

export const SKINS: Skin[] = [
  ...SHOP_ITEMS.earth,
  ...SHOP_ITEMS.moon,
  ...SHOP_ITEMS.bg,
];

export const SKIN_ASSETS: Record<string, ImageSourcePropType> =
  Object.fromEntries(
    Object.values(SKIN_CATALOG)
      .flat()
      .filter((skin) => skin.asset)
      .map((skin) => [skin.id, skin.asset as ImageSourcePropType]),
  );
