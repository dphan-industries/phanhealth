export const gardens = [
  {
    name: "The lantern",
    subtitle: "A little light to carry with you.",
    points: [
      [18, 62],
      [32, 35],
      [49, 23],
      [68, 35],
      [81, 62],
      [50, 78],
    ],
  },
  {
    name: "The wandering kite",
    subtitle: "Let your thoughts drift a little.",
    points: [
      [20, 70],
      [33, 51],
      [45, 28],
      [66, 22],
      [80, 41],
      [64, 60],
      [43, 82],
    ],
  },
  {
    name: "The quiet harbor",
    subtitle: "There is room to rest here.",
    points: [
      [14, 60],
      [29, 36],
      [46, 56],
      [61, 25],
      [80, 43],
      [86, 67],
      [63, 77],
      [40, 75],
    ],
  },
];
export function connectStar(progress: number, selected: number, count: number) {
  return selected === progress && progress < count ? progress + 1 : progress;
}
