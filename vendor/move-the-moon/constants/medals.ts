export type Medal = {
  emoji: string;
  label: string;
  color: string;
};

export const MEDAL_HINTS =
  "🥉 50 · 🥈 75 · 🥇 100 · 🏅 150 · 💎 200 · 💠 250 · 👑 300";

export function getMedal(score: number): Medal | null {
  if (score >= 300)
    return { emoji: "👑", label: "GRANDMASTER", color: "#ff4500" };
  if (score >= 250) return { emoji: "💠", label: "MASTER", color: "#00ffff" };
  if (score >= 200) return { emoji: "💎", label: "DIAMOND", color: "#b9f2ff" };
  if (score >= 150) return { emoji: "🏅", label: "PLATINUM", color: "#e0f0ff" };
  if (score >= 100) return { emoji: "🥇", label: "GOLD", color: "#FFD700" };
  if (score >= 75) return { emoji: "🥈", label: "SILVER", color: "#C0C0C0" };
  if (score >= 50) return { emoji: "🥉", label: "BRONZE", color: "#CD7F32" };
  return null;
}
