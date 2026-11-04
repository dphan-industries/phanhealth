import AsyncStorage from "@react-native-async-storage/async-storage";
import { Skin } from "../constants/skins";
import { SoundEffectOption } from "../constants/sounds";

export const saveCoins = async (amount: number) => {
  try {
    await AsyncStorage.setItem("coins", amount.toString());
  } catch {}
};

export const saveScore = async (newScore: number): Promise<number[]> => {
  try {
    const stored = await AsyncStorage.getItem("topScores");
    const scores: number[] = stored ? JSON.parse(stored) : [];
    scores.push(newScore);
    scores.sort((a, b) => b - a);
    const top5 = scores.slice(0, 5);
    await AsyncStorage.setItem("topScores", JSON.stringify(top5));
    return top5;
  } catch {
    return [];
  }
};

export const loadData = async () => {
  try {
    const stored = await AsyncStorage.getItem("topScores");
    const topScores: number[] = stored ? JSON.parse(stored) : [];
    const highScore = topScores[0] ?? 0;

    const storedCoins = await AsyncStorage.getItem("coins");
    const coins = storedCoins ? parseInt(storedCoins, 10) : 0;

    const storedSkins = await AsyncStorage.getItem("ownedSkins");
    const ownedIds: string[] = storedSkins ? JSON.parse(storedSkins) : [];

    const storedActive = await AsyncStorage.getItem("activeSkins");
    const activeSkins = storedActive ? JSON.parse(storedActive) : {};

    const storedMuted = await AsyncStorage.getItem("muted");
    const muted = storedMuted ? JSON.parse(storedMuted) : false;

    const storedSounds = await AsyncStorage.getItem("ownedSounds");
    const ownedSoundIds: string[] = storedSounds
      ? JSON.parse(storedSounds)
      : ["classic_pops"];

    const storedActiveSound = await AsyncStorage.getItem("activeSound");
    const activeSound = storedActiveSound ?? "classic_pops";

    return {
      topScores,
      highScore,
      coins,
      ownedIds,
      activeSkins,
      muted,
      ownedSoundIds,
      activeSound,
    };
  } catch {
    return {
      topScores: [],
      highScore: 0,
      coins: 0,
      ownedIds: [],
      activeSkins: {},
      muted: false,
      ownedSoundIds: ["classic_pops"],
      activeSound: "classic_pops",
    };
  }
};

export const saveSkins = async (skins: Skin[]) => {
  try {
    await AsyncStorage.setItem(
      "ownedSkins",
      JSON.stringify(skins.filter((s) => s.owned).map((s) => s.id)),
    );
  } catch {}
};

export const saveActiveSkin = async (type: string, skinId: string) => {
  try {
    const current = await AsyncStorage.getItem("activeSkins");
    const active = current ? JSON.parse(current) : {};
    active[type] = skinId;
    await AsyncStorage.setItem("activeSkins", JSON.stringify(active));
  } catch {}
};

export const saveSounds = async (sounds: SoundEffectOption[]) => {
  try {
    await AsyncStorage.setItem(
      "ownedSounds",
      JSON.stringify(sounds.filter((s) => s.owned).map((s) => s.id)),
    );
  } catch {}
};

export const saveActiveSound = async (soundId: string) => {
  try {
    await AsyncStorage.setItem("activeSound", soundId);
  } catch {}
};

export const saveMuted = async (muted: boolean) => {
  try {
    await AsyncStorage.setItem("muted", JSON.stringify(muted));
  } catch {}
};
