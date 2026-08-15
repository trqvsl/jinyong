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

const portraitUrl = (prompt: string) =>
  `https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=portrait_4_3`

const portraitPrompt = (subject: string, costume: string, pose: string) =>
  `cinematic full-body portrait of ${subject}, ${costume}, ${pose}, clear expressive face, ancient China, dramatic rim light, misty neutral background, premium wuxia RPG character art, no text`

export const PLAYER_PORTRAIT: PortraitSpec = {
  id: "player-default",
  title: "江湖少侠",
  role: "hero",
  image: portraitUrl(portraitPrompt(
    "a young Chinese wuxia hero",
    "dark blue traveling robes and leather bracers",
    "confident open-palm martial arts stance"
  )),
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
    image: portraitUrl(portraitPrompt(
      "a sly Chinese street thug",
      "worn grey-brown short robes with a red waist sash",
      "crooked bare-fist fighting stance"
    )),
    palette: { primary: "#4a4038", secondary: "#a56a43", glow: "rgba(210, 140, 80, 0.28)" },
    emblem: "匪",
  },
  shanzei: {
    id: "shanzei",
    title: "山贼头目",
    role: "brute",
    image: portraitUrl(portraitPrompt(
      "a rugged Chinese mountain bandit chief",
      "weathered brown and red robes with rough leather armor",
      "aggressive stance holding a broad saber"
    )),
    palette: { primary: "#3a342f", secondary: "#8b2c1f", glow: "rgba(180, 80, 55, 0.32)" },
    emblem: "贼",
  },
  duyaozi: {
    id: "duyaozi",
    title: "毒药贩子",
    role: "poison",
    image: portraitUrl(portraitPrompt(
      "a sinister Chinese poison master",
      "dark green robes with medicine gourds and hidden needles",
      "crouched venomous martial arts stance"
    )),
    palette: { primary: "#2f3d2f", secondary: "#7d3c98", glow: "rgba(122, 84, 186, 0.34)" },
    emblem: "毒",
  },
  emingke: {
    id: "emingke",
    title: "恶名剑客",
    role: "swordsman",
    image: portraitUrl(portraitPrompt(
      "a dangerous Chinese wandering swordsman",
      "black and silver robes",
      "fast dueling stance with a drawn jian sword"
    )),
    palette: { primary: "#2c313a", secondary: "#9db7d5", glow: "rgba(160, 210, 255, 0.28)" },
    emblem: "剑",
  },
  xiejiaoshi: {
    id: "xiejiaoshi",
    title: "邪教护法",
    role: "cultist",
    image: portraitUrl(portraitPrompt(
      "a ruthless Chinese cult guardian",
      "black crimson ceremonial robes and light armor",
      "menacing two-handed palm stance"
    )),
    palette: { primary: "#2f2438", secondary: "#a33fa3", glow: "rgba(180, 90, 210, 0.32)" },
    emblem: "煞",
  },
  default: {
    id: "default",
    title: "江湖敌手",
    role: "rogue",
    image: portraitUrl(portraitPrompt(
      "a mysterious Chinese jianghu fighter",
      "dark weathered martial robes",
      "guarded combat stance"
    )),
    palette: { primary: "#353535", secondary: "#8b2c1f", glow: "rgba(180, 100, 70, 0.3)" },
    emblem: "敌",
  },
  guojing: {
    id: "guojing",
    title: "北侠",
    role: "hero",
    image: portraitUrl(portraitPrompt(
      "Guo Jing, an upright broad-shouldered young Chinese martial hero",
      "simple dark blue Mongolian-influenced traveling robes",
      "powerful dragon-subduing palm stance"
    )),
    palette: { primary: "#24373a", secondary: "#c29c55", glow: "rgba(222, 181, 93, 0.34)" },
    emblem: "靖",
  },
  huangrong: {
    id: "huangrong",
    title: "女中诸葛",
    role: "hero",
    image: portraitUrl(portraitPrompt(
      "Huang Rong, a clever young Chinese wuxia heroine",
      "elegant pale green and white Peach Blossom Island robes",
      "agile stance holding a green bamboo staff"
    )),
    palette: { primary: "#31594f", secondary: "#d8bd75", glow: "rgba(115, 210, 173, 0.34)" },
    emblem: "蓉",
  },
  huangyaoshi: {
    id: "huangyaoshi",
    title: "东邪",
    role: "swordsman",
    image: portraitUrl(portraitPrompt(
      "Huang Yaoshi, an aloof elegant middle-aged Chinese martial arts master",
      "flowing teal scholar robes",
      "calm stance holding a jade flute"
    )),
    palette: { primary: "#264d4a", secondary: "#8ec8be", glow: "rgba(91, 194, 176, 0.34)" },
    emblem: "邪",
  },
  "huangyaoshi-npc": {
    id: "huangyaoshi-npc",
    title: "东邪",
    role: "swordsman",
    image: portraitUrl(portraitPrompt(
      "Huang Yaoshi, an aloof elegant middle-aged Chinese martial arts master",
      "flowing teal scholar robes",
      "calm stance holding a jade flute"
    )),
    palette: { primary: "#264d4a", secondary: "#8ec8be", glow: "rgba(91, 194, 176, 0.34)" },
    emblem: "邪",
  },
  ouyangfeng: {
    id: "ouyangfeng",
    title: "西毒",
    role: "poison",
    image: portraitUrl(portraitPrompt(
      "Ouyang Feng, a formidable older Chinese poison master from the western regions",
      "white and dark green layered robes with serpent ornaments",
      "low coiled toad-style martial arts stance"
    )),
    palette: { primary: "#364533", secondary: "#b4cf73", glow: "rgba(151, 200, 90, 0.36)" },
    emblem: "毒",
  },
  "ouyangfeng-npc": {
    id: "ouyangfeng-npc",
    title: "西毒",
    role: "poison",
    image: portraitUrl(portraitPrompt(
      "Ouyang Feng, a formidable older Chinese poison master from the western regions",
      "white and dark green layered robes with serpent ornaments",
      "low coiled toad-style martial arts stance"
    )),
    palette: { primary: "#364533", secondary: "#b4cf73", glow: "rgba(151, 200, 90, 0.36)" },
    emblem: "毒",
  },
  meichaofeng: {
    id: "meichaofeng",
    title: "铁尸",
    role: "poison",
    image: portraitUrl(portraitPrompt(
      "Mei Chaofeng, a blind fierce Chinese female martial artist",
      "black wind-torn robes with silver hair ornaments",
      "nine-yin claw stance with iron chain"
    )),
    palette: { primary: "#302a3d", secondary: "#a68ac9", glow: "rgba(151, 105, 203, 0.36)" },
    emblem: "梅",
  },
  yangkang: {
    id: "yangkang",
    title: "小王爷",
    role: "swordsman",
    image: portraitUrl(portraitPrompt(
      "Yang Kang, a handsome conflicted young Chinese noble martial artist",
      "dark red Jin prince robes with light gold armor",
      "elegant but dangerous claw and spear stance"
    )),
    palette: { primary: "#49282a", secondary: "#d2a65c", glow: "rgba(214, 125, 72, 0.34)" },
    emblem: "康",
  },
  guanjun: {
    id: "guanjun",
    title: "官军",
    role: "brute",
    image: portraitUrl(portraitPrompt(
      "an armored ancient Chinese military officer",
      "dark lamellar armor with a red cloak",
      "disciplined spear fighting stance"
    )),
    palette: { primary: "#30353b", secondary: "#b64839", glow: "rgba(200, 81, 61, 0.34)" },
    emblem: "军",
  },
}
