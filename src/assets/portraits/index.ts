export interface PortraitSpec {
  id: string
  title: string
  role: "hero" | "rogue" | "brute" | "poison" | "swordsman" | "cultist"
  image?: string
  palette: {
    primary: string
    secondary: string
    glow: string
  }
  emblem: string
}

export const PLAYER_PORTRAIT: PortraitSpec = {
  id: "player-default",
  title: "江湖少侠",
  role: "hero",
  image: "/portraits/player-default.webp",
  palette: {
    primary: "#2f3444",
    secondary: "#b8965a",
    glow: "rgba(255, 219, 120, 0.35)",
  },
  emblem: "侠",
}

export const ENEMY_PORTRAITS: Record<string, PortraitSpec> = {
  xialiubang: {
    id: "xialiubang",
    title: "市井流氓",
    role: "rogue",
    image: "/portraits/xialiubang.webp",
    palette: { primary: "#4a4038", secondary: "#a56a43", glow: "rgba(210, 140, 80, 0.28)" },
    emblem: "匪",
  },
  shanzei: {
    id: "shanzei",
    title: "山贼头目",
    role: "brute",
    image: "/portraits/shanzei.webp",
    palette: { primary: "#3a342f", secondary: "#8b2c1f", glow: "rgba(180, 80, 55, 0.32)" },
    emblem: "贼",
  },
  duyaozi: {
    id: "duyaozi",
    title: "毒药贩子",
    role: "poison",
    image: "/portraits/duyaozi.webp",
    palette: { primary: "#2f3d2f", secondary: "#7d3c98", glow: "rgba(122, 84, 186, 0.34)" },
    emblem: "毒",
  },
  emingke: {
    id: "emingke",
    title: "恶名剑客",
    role: "swordsman",
    image: "/portraits/emingke.webp",
    palette: { primary: "#2c313a", secondary: "#9db7d5", glow: "rgba(160, 210, 255, 0.28)" },
    emblem: "剑",
  },
  xiejiaoshi: {
    id: "xiejiaoshi",
    title: "邪教护法",
    role: "cultist",
    image: "/portraits/xiejiaoshi.webp",
    palette: { primary: "#2f2438", secondary: "#a33fa3", glow: "rgba(180, 90, 210, 0.32)" },
    emblem: "煞",
  },
  default: {
    id: "default",
    title: "江湖敌手",
    role: "rogue",
    image: "/portraits/default.webp",
    palette: { primary: "#353535", secondary: "#8b2c1f", glow: "rgba(180, 100, 70, 0.3)" },
    emblem: "敌",
  },
}
