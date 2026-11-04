export type UITheme = {
  atmosphereBase: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;

  titleMain: string;
  titleSub: string;
  titleGlow: string;

  textPrimary: string;
  textMuted: string;
  textFaint: string;

  panelBg: string;
  overlayBg: string;

  buttonBg: string;
  buttonBorder: string;
  buttonText: string;

  coin: string;
  success: string;
  danger: string;
};

export function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");

  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function makeDarkTheme(
  accent: string,
  titleGlow: string,
  options?: Partial<UITheme>,
): UITheme {
  return {
    accent,
    accentSoft: withAlpha(accent, 0.25),
    accentStrong: withAlpha(accent, 0.92),

    atmosphereBase: accent,

    titleMain: "#FFFFFF",
    titleSub: "rgba(255,255,255,0.72)",
    titleGlow,

    textPrimary: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.74)",
    textFaint: "rgba(255,255,255,0.42)",

    panelBg: "#081024",
    overlayBg: "#020614",

    buttonBg: "#0A1432",
    buttonBorder: withAlpha(accent, 0.7),
    buttonText: "#FFFFFF",

    coin: "#F0C040",
    success: "#4AFF80",
    danger: "#FF6060",

    ...options,
  };
}

function makeLightTheme(
  accent: string,
  titleGlow: string,
  options?: Partial<UITheme>,
): UITheme {
  return {
    accent,
    accentSoft: withAlpha(accent, 0.26),
    accentStrong: withAlpha(accent, 0.96),

    atmosphereBase: "#6F7F95",

    titleMain: "#1F2D42",
    titleSub: "rgba(31,45,66,0.86)",
    titleGlow,

    textPrimary: "#1F2D42",
    textMuted: "rgba(31,45,66,0.84)",
    textFaint: "rgba(31,45,66,0.66)",

    panelBg: "#F4F7FB",
    overlayBg: "#CDD8E6",

    buttonBg: "#EEF3FA",
    buttonBorder: withAlpha(accent, 0.78),
    buttonText: "#1F2D42",

    coin: "#8D6710",
    success: "#247E46",
    danger: "#B6404F",

    ...options,
  };
}

const UI_THEMES: Record<string, UITheme> = {
  default_bg: makeDarkTheme("#50A0FF", "#50A0FF"),

  nebula: makeDarkTheme("#B185FF", "#C9A4FF", {
    panelBg: "#140D24",
    overlayBg: "#07040F",
    buttonBg: "#1A1030",
  }),

  galaxy: makeDarkTheme("#6EA8FF", "#8BC0FF", {
    panelBg: "#091426",
    overlayBg: "#030811",
    buttonBg: "#0D1A32",
  }),

  midnight_ocean_bg: makeDarkTheme("#6BC7D9", "#90DCE8", {
    panelBg: "#081A21",
    overlayBg: "#030B0F",
    buttonBg: "#0B2028",
  }),

  aurora_bg: makeDarkTheme("#79D8B3", "#9DE7C8", {
    panelBg: "#0B1B18",
    overlayBg: "#040B09",
    buttonBg: "#102520",
  }),

  eclipse_bg: makeDarkTheme("#B0A5D9", "#D0C8F0", {
    panelBg: "#121018",
    overlayBg: "#07060B",
    buttonBg: "#191622",
  }),

  crimson_void_bg: makeDarkTheme("#E48AA4", "#F0A3B8", {
    panelBg: "#1A0D12",
    overlayBg: "#0C0508",
    buttonBg: "#261119",
  }),

  solar_night_bg: makeDarkTheme("#E3BB72", "#F0D08E", {
    panelBg: "#24190D",
    overlayBg: "#120B05",
    buttonBg: "#322313",
  }),

  frozen_cosmos_bg: makeLightTheme("#8FB9E3", "#D7E7F7", {
    atmosphereBase: "#6E859C",
    panelBg: "#EFF5FB",
    overlayBg: "#C6D6E4",
    buttonBg: "#E5EEF7",
    titleMain: "#23344A",
    titleSub: "rgba(35,52,74,0.78)",
    textPrimary: "#23344A",
    textMuted: "rgba(35,52,74,0.78)",
    textFaint: "rgba(35,52,74,0.54)",
    buttonText: "#23344A",
    coin: "#23344A",
  }),

  phantom_drift_bg: makeDarkTheme("#98A9FF", "#B7C2FF", {
    panelBg: "#0E1528",
    overlayBg: "#050812",
    buttonBg: "#151E38",
  }),

  blush_cloud_bg: makeLightTheme("#D89BBE", "#F0CADC", {
    atmosphereBase: "#8B7682",
    panelBg: "#F8F0F5",
    overlayBg: "#E4D0DC",
    buttonBg: "#F4E7EF",
    titleMain: "#4A3140",
    titleSub: "rgba(74,49,64,0.76)",
    textPrimary: "#4A3140",
    textMuted: "rgba(74,49,64,0.76)",
    textFaint: "rgba(74,49,64,0.52)",
    buttonText: "#4A3140",
    coin: "#4A3140",
  }),

  rose_glow_bg: makeDarkTheme("#F09CC0", "#FFC0D8", {
    panelBg: "#241019",
    overlayBg: "#11070B",
    buttonBg: "#31131F",
    coin: "#F0DDD4",
  }),

  sky_dream_bg: makeLightTheme("#7FB6FF", "#C6E1FF", {
    atmosphereBase: "#6C8198",

    panelBg: "#F0F6FC",
    overlayBg: "#CDDDEE",
    buttonBg: "#E7F0F9",
    titleMain: "#24405A",
    titleSub: "rgba(36,64,90,0.78)",
    textPrimary: "#24405A",
    textMuted: "rgba(36,64,90,0.78)",
    textFaint: "rgba(36,64,90,0.52)",
    buttonText: "#24405A",
    coin: "#24405A",
  }),

  pastel_blue_bg: makeLightTheme("#99B8FF", "#D4E0FF", {
    atmosphereBase: "#7283A3",
    panelBg: "#F3F6FC",
    overlayBg: "#D4DCEC",
    buttonBg: "#EBF0FA",
    titleMain: "#2A3C63",
    titleSub: "rgba(42,60,99,0.78)",
    textPrimary: "#2A3C63",
    textMuted: "rgba(42,60,99,0.78)",
    textFaint: "rgba(42,60,99,0.52)",
    buttonText: "#2A3C63",
    coin: "#2A3C63",
  }),

  cloud_white_bg: makeLightTheme("#A9BCD6", "#EEF4FB", {
    atmosphereBase: "#7E8E9F",
    panelBg: "#F9FAFC",
    overlayBg: "#DDE5EE",
    buttonBg: "#EFF4F9",
    titleMain: "#314257",
    titleSub: "rgba(49,66,87,0.76)",
    textPrimary: "#314257",
    textMuted: "rgba(49,66,87,0.76)",
    textFaint: "rgba(49,66,87,0.50)",
    buttonText: "#314257",
    coin: "#314257",
  }),
};

export function getUITheme(activeBg: string): UITheme {
  return UI_THEMES[activeBg] ?? UI_THEMES.default_bg;
}
