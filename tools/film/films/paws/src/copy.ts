import { de } from "@/lib/paws/i18n/copy/de";
import { en } from "@/lib/paws/i18n/copy/en";
import { es } from "@/lib/paws/i18n/copy/es";
import { fr } from "@/lib/paws/i18n/copy/fr";
import { hi } from "@/lib/paws/i18n/copy/hi";
import { id } from "@/lib/paws/i18n/copy/id";
import { it } from "@/lib/paws/i18n/copy/it";
import { ja } from "@/lib/paws/i18n/copy/ja";
import { ko } from "@/lib/paws/i18n/copy/ko";
import { nl } from "@/lib/paws/i18n/copy/nl";
import { pl } from "@/lib/paws/i18n/copy/pl";
import { ptBR } from "@/lib/paws/i18n/copy/pt-br";
import { ru } from "@/lib/paws/i18n/copy/ru";
import { tr } from "@/lib/paws/i18n/copy/tr";
import { uk } from "@/lib/paws/i18n/copy/uk";
import { vi } from "@/lib/paws/i18n/copy/vi";
import { zhHans } from "@/lib/paws/i18n/copy/zh-hans";
import { zhHant } from "@/lib/paws/i18n/copy/zh-hant";

const IS_ZH = new URLSearchParams(globalThis.location?.search).get("lang") === "zh";
const APP = IS_ZH ? zhHans : en;

const FILM = IS_ZH
  ? {
      captions: ["另一边， 有一只 别人家的猫。", "Paws\u00a0是 一间 住满了 陌生人 猫咪的 房间。", "每个 来过的人， 都会 留下 自己的 指印。", "捏一只 你自己的猫， 带它 进来。", "每只猫 都会说\u00a018\u00a0种语言。"],
      newcomerHello: "嗨，我是新来的",
      newcomerBye: "拜拜",
      title: ["来见见", "这些猫吧"],
      subtitle: "还有别人家的猫",
      facts: "免费 · 18 种语言",
    }
  : {
      captions: ["Somebody’s cat is on the other side.", "Paws is a room full of strangers’ cats.", "Everyone who visits leaves their own prints.", "Make a cat of your own and bring it in.", "Every cat speaks 18 languages."],
      newcomerHello: "hi, I’m new",
      newcomerBye: "bye",
      title: ["Come and meet", "the cats"],
      subtitle: "and other people’s cats",
      facts: "Free · 18 languages",
    };

const FEATURES = IS_ZH
  ? {
      askCats: "能捏出 多少种 猫？",
      cats: ["250,000+", "种不同的猫"],
      steps: ["10 种毛色", "5 种花纹", "4 种肚皮", "4 种肉垫", "体型 · 毛量 · 尾巴 · 耳朵"],
      voices: ["36", "种声音", "每种都有\n自己的叫声"],
      talk: "打一句话， 你的猫 会用 自己的声音 说出来。",
      fingerSteps: ["别动", "按下", "晃一晃", "围住它", "快速划过"],
      fingerCaptions: ["别动， 猫会 走过来 看看。", "按下去， 它会 把爪子 搭上来， 指印 会留下。", "晃一晃， 它会 跟着你 转。", "手指 太多， 它会 往后躲。", "太快了， 它会 跑掉。"],
      shared: "一只猫 可以 同时 搭住 两个陌生人的 手指。",
      socialSteps: ["打招呼", "追逐", "拍尾巴", "依偎", "打盹", "跑酷"],
      social: "猫和猫 之间 也会 一起玩。",
      langs: "每只猫 都会说 你的语言， 一共\u00a018\u00a0种。",
      toys: ["从托盘里 拿一个 玩具 进来。", "猫 一拍， 房间里的人 都看见 它在滚。"],
      box: ["有纸箱， 猫就 钻进去。", "按一下 纸箱， 它就 跳出来。"],
      bowl: ["碰翻 水碗， 隔着水， 肉垫 清清楚楚。", "湿爪子 留下 一串 小脚印。"],
      skySteps: ["清晨", "白天", "黄昏", "夜晚"],
      sky: ["光线 跟着 你那里的 时间 走。", "夏天的 夜里， 有萤火虫。"],
    }
  : {
      askCats: "How many cats can you make?",
      cats: ["250,000+", "different cats"],
      steps: ["10 coats", "5 patterns", "4 bellies", "4 paw pads", "sizes · fluff · tails · ears"],
      voices: ["36", "voices", "each with\nits own meow"],
      talk: "Type something, and your cat says it in its own voice.",
      fingerSteps: ["hold still", "press", "wiggle", "crowd it", "swipe fast"],
      fingerCaptions: ["Hold still, and a cat comes to look.", "Press, and it puts its paws on you. Your print stays.", "Wiggle, and it follows you around.", "Too many fingers, and it backs away.", "Too fast, and it runs off."],
      shared: "One cat can put a paw on two strangers at once.",
      socialSteps: ["say hi", "chase", "bat a tail", "snuggle", "nap", "zoomies"],
      social: "Cats play with each other too.",
      langs: "Every cat speaks your language. 18 of them.",
      toys: ["Bring a toy in from the tray.", "A cat bats it, and everyone in the room sees it roll."],
      box: ["A box? A cat climbs right in.", "Press on the box, and out it hops."],
      bowl: ["Knock a bowl over, and paws come clear through the water.", "Wet paws leave a few prints."],
      skySteps: ["dawn", "day", "dusk", "night"],
      sky: ["The light follows the time where you are.", "Summer nights have fireflies."],
    };

/** The film's words in the language `?lang=` picks (English unless `zh`): the app's own copy, the film's captions and end card, and each other locale's "hello" in the order the film shows them. */
export const COPY = {
  app: APP,
  lines: APP.room.residentLines,
  film: FILM,
  features: FEATURES,
  hellos: [ja, es, IS_ZH ? en : zhHans, fr, ko, de, hi, ptBR, ru, it, vi, tr, nl, pl, uk, id, zhHant].map((copy) => copy.room.residentLines[0]!),
};
