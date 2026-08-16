export interface DialoguePortrait {
  name: string
  src: string
  objectPosition?: string
}

export const DIALOGUE_PORTRAITS: Record<string, DialoguePortrait> = {
  郭靖: {
    name: "郭靖",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Guo%20Jing%2C%20honest%20young%20hero%20with%20broad%20face%20and%20thick%20brows%2C%20simple%20dark%20green%20Song%20dynasty%20robe%2C%20leather%20archery%20strap%2C%20calm%20resolute%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  黄蓉: {
    name: "黄蓉",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Huang%20Rong%2C%20clever%20young%20woman%20with%20bright%20alert%20eyes%2C%20white%20and%20pale%20gold%20Song%20dynasty%20robe%2C%20small%20gold%20hair%20ornament%2C%20subtle%20confident%20smile%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  洪七公: {
    name: "洪七公",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Hong%20Qigong%2C%20weathered%20elderly%20beggar%20hero%2C%20messy%20gray%20hair%2C%20short%20beard%2C%20patched%20olive%20robe%2C%20bamboo%20staff%20over%20one%20shoulder%2C%20keen%20humorous%20eyes%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  黄药师: {
    name: "黄药师",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Huang%20Yaoshi%2C%20aloof%20middle-aged%20scholar%20martial%20artist%2C%20sharp%20features%2C%20dark%20teal%20robe%2C%20jade%20flute%2C%20reserved%20cold%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  欧阳锋: {
    name: "欧阳锋",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Ouyang%20Feng%2C%20severe%20western%20regions%20martial%20master%2C%20high%20cheekbones%2C%20white%20and%20sand-colored%20robe%2C%20serpent-headed%20staff%2C%20dangerous%20focused%20gaze%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  杨康: {
    name: "杨康",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Yang%20Kang%2C%20handsome%20young%20Jin%20prince%2C%20refined%20sharp%20features%2C%20black%20and%20deep%20red%20embroidered%20robe%2C%20gold%20hair%20crown%2C%20guarded%20ambitious%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  穆念慈: {
    name: "穆念慈",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Mu%20Nianci%2C%20resolute%20young%20woman%20martial%20artist%2C%20plain%20burgundy%20and%20charcoal%20robe%2C%20hair%20tied%20for%20travel%2C%20quiet%20steady%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  华筝: {
    name: "华筝",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Hua%20Zheng%2C%20Mongolian%20steppe%20princess%2C%20braided%20dark%20hair%2C%20deep%20blue%20and%20red%20riding%20coat%2C%20small%20silver%20ornaments%2C%20direct%20independent%20gaze%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  李萍: {
    name: "李萍",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Li%20Ping%2C%20strong%20middle-aged%20Song%20dynasty%20mother%2C%20weathered%20kind%20face%2C%20plain%20brown%20and%20indigo%20frontier%20clothing%2C%20firm%20unadorned%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  丘处机: {
    name: "丘处机",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Qiu%20Chuji%2C%20tall%20Taoist%20swordsman%2C%20black%20and%20white%20hair%2C%20dark%20gray%20Quanzhen%20robe%2C%20sword%20hilt%20visible%2C%20stern%20righteous%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  柯镇恶: {
    name: "柯镇恶",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Ke%20Zhen%27e%2C%20blind%20elderly%20martial%20artist%2C%20weathered%20face%2C%20closed%20clouded%20eyes%2C%20dark%20rough%20robe%2C%20iron%20staff%2C%20unyielding%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  韩小莹: {
    name: "韩小莹",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Han%20Xiaoying%2C%20gentle%20but%20decisive%20woman%20swordswoman%2C%20muted%20blue-gray%20robe%2C%20simple%20hairpin%2C%20sword%20at%20shoulder%2C%20calm%20watchful%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  完颜洪烈: {
    name: "完颜洪烈",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Wanyan%20Honglie%2C%20middle-aged%20Jin%20dynasty%20prince%2C%20controlled%20handsome%20face%2C%20dark%20gold%20and%20black%20court%20robe%2C%20subtle%20royal%20crown%2C%20calculating%20composed%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  郭啸天: {
    name: "郭啸天",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Guo%20Xiaotian%2C%20upright%20Song%20dynasty%20village%20hero%2C%20broad%20shoulders%2C%20thick%20brows%2C%20plain%20dark%20green%20winter%20robe%2C%20double%20halberd%20shaft%20behind%20shoulder%2C%20forthright%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  杨铁心: {
    name: "杨铁心",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Yang%20Tiexin%2C%20lean%20Song%20dynasty%20spear%20fighter%2C%20strong%20jaw%2C%20plain%20charcoal%20winter%20robe%2C%20iron%20spear%20behind%20shoulder%2C%20loyal%20intense%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  包惜弱: {
    name: "包惜弱",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Bao%20Xiruo%2C%20gentle%20Song%20dynasty%20village%20woman%2C%20soft%20features%2C%20plain%20pale%20blue%20winter%20robe%2C%20simple%20hair%20wrap%2C%20compassionate%20but%20worried%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
  哲别: {
    name: "哲别",
    src: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=hand-painted%20realistic%20Chinese%20wuxia%20RPG%20character%20portrait%2C%20Jebe%2C%20Mongolian%20master%20archer%2C%20weathered%20steppe%20warrior%2C%20braided%20hair%2C%20brown%20leather%20lamellar%20armor%2C%20bow%20over%20shoulder%2C%20focused%20laconic%20expression%2C%20head%20and%20shoulders%2C%20ink%20and%20mineral%20color%20painting%2C%20muted%20dark%20background%2C%20consistent%20game%20portrait%20style%2C%20no%20text%2C%20no%20logo&image_size=portrait_4_3",
  },
}

export const DIALOGUE_PORTRAIT_ALIASES: Record<string, string> = {
  小叫花: "黄蓉",
  蓉儿: "黄蓉",
  靖儿: "郭靖",
  老叫花: "洪七公",
  北丐: "洪七公",
  东邪: "黄药师",
  西毒: "欧阳锋",
  长春子丘处机: "丘处机",
  穆易: "杨铁心",
  六王爷: "完颜洪烈",
}
