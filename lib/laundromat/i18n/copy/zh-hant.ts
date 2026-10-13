import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const zhHant = {
  locale: "zh-Hant",
  languageName: "繁體中文",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe：自助洗衣店裡的療癒專注計時器與 lofi",
    description:
      "在一間安靜的自助洗衣店裡，把洗衣當作專注計時器。洗衣、烘乾、專注、lofi、咖啡、寫給陌生人的筆記本，或者只是放空。免費，無需註冊。",
    intro:
      "瀏覽器裡一間安靜的自助洗衣店。啟動一台洗衣機或烘衣機，設定 5 到 60 分鐘當作專注計時，結束時會收到通知；用電視播 lo-fi 頻道，煮一杯咖啡，再在共用筆記本裡手寫留言。寫滿的筆記本會放到書架上。",
    keywords: [
      "自助洗衣店",
      "專注計時器",
      "番茄鐘",
      "lofi",
      "讀書計時器",
      "工作背景音樂",
      "療癒",
      "共用筆記本",
    ],
    inspiredBy: "靈感來自",
    openGraphLocale: "zh_TW",
  },
  toolbar: {
    soundOn: "聲音開",
    soundOff: "聲音關",
    share: "分享",
    linkCopied: "已複製連結",
    shareText:
      "瀏覽器裡一間安靜的自助洗衣店。丟一籃衣服進去，讓計時器跑著，讀讀別人留下的話。",
    language: "語言",
    builtBy: "李雨軒製作",
    updateAvailable: "已更新 · 重新整理",
  },
  tabDone: "好了",
  readoutDone: "好了",
  matWelcome: "歡迎",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "洗衣機" : "烘衣機"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}，空著`,
    freeTooltip: (o: { name: string }) => `${o.name} · 空著`,
    loadedLabel: (o: { name: string }) => `${o.name}，衣服已放入，可以啟動`,
    loadedTooltip: (o: { name: string }) => `${o.name} · 已放入`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}，${o.kind === "washer" ? "洗衣中" : "烘衣中"}，還剩 ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "洗衣中" : "烘衣中"} · ${o.time} 結束`,
    doneLabel: (o: { name: string }) => `${o.name}，好了，把衣服拿出來吧`,
    doneTooltip: (o: { name: string }) => `${o.name} · 好了`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}，正在${o.kind === "washer" ? "洗" : "烘"}別人的衣服，還剩 ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `別人在${o.kind === "washer" ? "洗衣" : "烘衣"} · ${o.time} 結束`,
    othersLoadedLabel: (o: { name: string }) => `${o.name}，裡面有別人的衣服`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · 別人的衣服，還沒開始`,
    othersDoneLabel: (o: { name: string }) => `${o.name}，別人的衣服好了`,
    othersDoneTooltip: (o: { name: string }) => `${o.name} · 別人的，好了`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · 好了`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer" ? "把衣服拿出來，挑一台烘衣機" : "你的衣服烘乾了",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name} ${{ dial: "旋鈕", start: "啟動鍵", door: "機門" }[o.control]}，別人正在使用`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `別人的${o.kind === "washer" ? "洗衣" : "烘衣"} · ${o.time} 結束`,
    othersLoadedTooltip: "別人的衣服 · 還沒開始",
    othersDoneTooltip: "別人的衣服 · 等主人來拿",
    doneAt: (o: { time: string }) => `${o.time} 結束`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name} 時間，${o.minutes} 分鐘`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `轉動 · ${o.minutes} 分鐘 → ${o.nextMinutes} 分鐘`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name} 啟動，${o.minutes} 分鐘${o.kind === "washer" ? "洗衣" : "烘衣"}${o.canNotify ? "，結束時通知你" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `啟動 · ${o.minutes} 分鐘${o.kind === "washer" ? "洗衣" : "烘衣"}${o.canNotify ? " · 會通知你" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}，${o.kind === "washer" ? "洗好" : "烘乾"}時提醒我`,
    remindTooltip: (o: { doneAt: string }) => `提醒我 · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) => `${o.name} 啟動，${o.reminderOn ? "已開啟提醒，" : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `已開啟提醒 · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name} 啟動`,
    loadFirstTooltip: "先放衣服",
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "洗衣中" : "烘衣中"} · ${o.doneAt}`,
    doneDoorTooltip: "開門 · 拿出衣服",
    loadedDoorTooltip: "開門 · 把衣服拿回來",
    loadableDoorTooltip: "放入衣服",
    doorLabel: (o: { name: string }) => `${o.name} 機門`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name} 機門，${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `門墊，帶著${o.laundry === "folded" ? "烘乾的" : "洗好的"}衣服回家`,
    readyTooltip: "回家 · 帶上你的衣服",
    waitingLabel: "門墊，衣服好了就從這裡回家",
    waitingTooltip: "回家的路 · 先把衣服洗完",
  },
  laundryBasket: {
    labels: {
      empty: "洗衣籃，空的",
      dirty: "洗衣籃，待洗的衣服",
      wet: "洗衣籃，待烘乾的濕衣服",
      folded: "洗衣籃，乾淨的乾衣服",
    },
    tooltips: {
      empty: "籃子 · 空的",
      dirty: "髒衣服 · 放進洗衣機",
      wet: "濕衣服 · 放進烘乾機",
      folded: "洗好烘乾了 · 可以回家了",
    },
  },
  coffee: {
    machineLabel: "咖啡機",
    brewingMachineLabel: "咖啡機，正在煮",
    brewingTooltip: "正在煮…",
    idleSwitchLabel: "咖啡機開關，煮一杯咖啡",
    idleSwitchTooltip: "煮一杯咖啡",
    brewingSwitchLabel: "咖啡機開關，正在煮",
    readyMachineLabel: "咖啡機，壺裡有咖啡",
    readyMachineTooltip: "咖啡好了",
    topUpSwitchLabel: "咖啡機開關，把壺續滿",
    topUpSwitchTooltip: "續滿咖啡壺",
    fullSwitchLabel: "咖啡機開關，壺已經滿了",
    fullSwitchTooltip: "壺滿了 · 先倒一杯",
    emptyFlaskLabel: "咖啡壺，空的",
    emptyFlaskTooltip: "壺空了",
    brewingFlaskLabel: "咖啡壺，正在煮",
    othersBrewingMachineLabel: "咖啡機，別人在煮咖啡",
    othersBrewingSwitchLabel: "咖啡機開關，別人在煮咖啡",
    othersBrewingFlaskLabel: "咖啡壺，別人在煮咖啡",
    othersBrewingTooltip: (o: { time: string }) =>
      `別人在煮咖啡 · ${o.time} 結束`,
    pourLabel: "咖啡壺，倒一杯",
    pourTooltip: "倒一杯",
    cupFullFlaskLabel: "咖啡壺，先喝完杯裡的",
    cupFullFlaskTooltip: "先喝完這杯",
    fullCupLabel: "咖啡杯，喝一口",
    fullCupTooltip: "喝掉",
    emptyCupLabel: "咖啡杯，空的",
    emptyCupTooltip: "空杯子",
  },
  plant: {
    label: "盆栽，摸摸草",
    tooltip: "摸摸草",
  },
  board: {
    label: "告示板，洗衣店的新鮮事",
    tooltip: "新鮮事",
    eyebrow: "告示板",
    heading: "新鮮事",
    subtitle: "洗衣店裡的小變化，最新的在最前。",
    updated: (o: { date: string }) => `${o.date} 更新`,
    footer: "全年無休，24 小時營業",
    close: "關閉",
    closeHint: "按 esc 關閉",
    tags: {
      opening: "開幕",
      tv: "電視",
      notebook: "筆記本",
      languages: "語言",
      room: "店內",
      coffee: "咖啡",
      window: "窗戶",
      light: "光線",
      board: "告示板",
    },
    updates: {
      "whats-new-board": {
        title: "新添一塊告示板",
        body: "這塊立牌告訴你有什麼新鮮事。白天像紙一樣安靜，入夜後亮起燈來。",
      },
      "twelve-stations": {
        title: "電視有了十二個頻道",
        body: "從自習室到深空，七個新的 lofi 電台填滿了調台旋鈕。",
      },
      "page-drag": {
        title: "拖曳翻頁",
        body: "沿著頁面外側邊緣任意位置拖曳，就能翻頁。",
      },
      "window-light": {
        title: "陽光照進窗戶",
        body: "白天的光線會照到機器和地板上，日出日落時變得溫暖。",
      },
      "shared-coffee": {
        title: "一壺咖啡大家分",
        body: "最多七個人可以從同一個壺裡倒咖啡。",
      },
      "street-view": {
        title: "窗外的街道",
        body: "窗外是一條街，被陽光或月光照亮。",
      },
      "tube-counter": {
        title: "誰在這裡",
        body: "後牆上的輝光管會數出洗衣店裡的每個人，也包括你。",
      },
      "coffee-counter": {
        title: "櫃檯上的咖啡",
        body: "煮一壺，倒一杯，邊等衣服轉邊喝。",
      },
      "shared-machines": {
        title: "別人也在洗衣服",
        body: "看看其他人在用哪台機器。你放衣服時，別人的衣服不會動。",
      },
      "eighteen-languages": {
        title: "18 種語言營業",
        body: "整間洗衣店都說你的語言。在角落的地球圖示切換。",
      },
      "shared-notebook": {
        title: "寫給陌生人的筆記本",
        body: "給下一個進來的人留一句話。寫滿的本子會放上書架。",
      },
      "lofi-tv": {
        title: "電視裡的 lofi",
        body: "打開電視聽 lofi 電台，有調台和音量旋鈕。",
      },
      opening: {
        title: "laundro.cafe 開幕",
        body: "瀏覽器裡一間安靜的洗衣店：洗衣、烘乾，專注 5 到 60 分鐘。",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `輝光管計數器，${o.count === 1 ? "只有你在這裡" : `這裡有 ${o.count} 個人`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "只有你在這裡" : `這裡有 ${o.count} 個人`,
    offLabel: "輝光管計數器，關閉",
    offTooltip: "關閉",
  },
  tv: {
    stations: {
      "rainy-cafe": "雨天咖啡館",
      "piano-night": "鋼琴之夜",
      "late-wash": "深夜洗衣",
      "tape-hiss": "錄音帶沙沙",
      "city-at-3am": "凌晨三點的城市",
      "study-hall": "自習室",
      "smoky-jazz": "煙霧爵士",
      fireplace: "壁爐",
      "neon-tokyo": "霓虹東京",
      "string-quartet": "弦樂四重奏",
      "porch-guitar": "門廊吉他",
      "deep-space": "深空",
    },
    station: (o: { channel: string; name: string }) =>
      `${o.channel} 台 · ${o.name}`,
    offLabel: "電視，關",
    offTooltip: "電視 · 關",
    onLabel: (o: { station: string }) => `電視，開，${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `電視螢幕，${o.station}，在 YouTube 上觀看`,
    screenOnTooltip: "在 YouTube 上觀看 ↗",
    screenOffLabel: "電視螢幕，關，打開",
    turnOn: "打開",
    tunerLabel: (o: { station: string }) => `電視頻道，${o.station}`,
    tunerTooltip: (o: { nextName: string }) => `下一台 · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `電視音量，${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `音量 · ${o.percent}%`,
    powerOnLabel: "電視電源，開，關掉",
    turnOff: "關掉",
    powerOffLabel: "電視電源，關，打開",
    noSignal: "無訊號",
  },
  shelf: {
    loadingLabel: "書架，正在查看寫滿的筆記本",
    loadingTooltip: "正在看書架…",
    offlineLabel: "書架，暫時離線",
    offlineTooltip: "書架暫時離線",
    emptyLabel: "書架，還沒有寫滿的筆記本",
    emptyTooltip: "還沒有寫滿的筆記本",
    readyLabel: "看看放著寫滿筆記本的書架",
    bookCount: (o: { count: number }) => `${o.count} 本寫滿的筆記本`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `打開第 ${o.number} 本筆記本，${o.span}，${o.entries}`,
    entryCount: (o: { count: number }) => `${o.count} 則留言`,
  },
  notebook: {
    objectLabel: "打開筆記本",
    objectTooltip: "陌生人的留言",
    number: (o: { number: number }) => `第 ${o.number} 本`,
    dialogLabel: (o: { number: number }) => `第 ${o.number} 本筆記本`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `始於 ${o.day}`,
    insideCover: "封面內頁",
    insideCoverAndPage: (o: { page: number }) => `封面內頁 · 第 ${o.page} 頁`,
    page: (o: { page: number }) => `第 ${o.page} 頁`,
    pages: (o: { left: number; right: number }) => `第 ${o.left}–${o.right} 頁`,
    pageButtonLabel: (o: { page: number }) => `第 ${o.page} 頁，翻到其他頁`,
    previousPage: "上一頁",
    nextPage: "下一頁",
    scrubberLabel: "頁碼",
    goToPage: "翻到",
    pageInputLabel: (o: { pageCount: number }) => `頁碼，1 到 ${o.pageCount}`,
    report: "檢舉",
    reported: "已檢舉",
    opening: "正在打開筆記本…",
    missing: (o: { number: number }) => `沒有第 ${o.number} 本筆記本`,
    full: (o: { number: number }) => `第 ${o.number} 本筆記本已寫滿 · 只能閱讀`,
    someoneWritingInNotebook: "有人正在筆記本上寫字 · 等一下",
    someoneWriting: "有人正在寫 · 等一下",
    comeBackToWrite: "兩分鐘後再來寫下一則",
    startsNext: (o: { number: number }) =>
      `這則留言會開啟第 ${o.number} 本筆記本`,
    writePromptBeforeKeys: "給下一個人留句話 · 按",
    writePromptAfterKeys: "儲存",
    textareaLabel: "在筆記本上寫一句話",
    notifyWhenFree: "空出來時告訴我",
    notifyPending: "到時會通知你",
    saveNote: "儲存我的留言",
    savingNote: "正在儲存…",
    close: "關閉",
    freeNotificationTitle: "筆記本空出來了",
    freeNotificationBody: "輪到你寫了",
    leaveFailures: {
      offline: "筆記本暫時離線 · 你寫的內容還留在這裡",
      rate_limited: "每兩分鐘只能留一則 · 等等再試",
      daily_limit_reached: "今天留得夠多了 · 明天再來",
      contains_link: "筆記本裡不能放連結",
      too_long: "太長了，寫不下 · 再短一點",
      sign_off_too_long: "署名太長了",
      empty_body: "先寫點什麼吧",
      unknown: "出了點問題 · 再試一次",
    },
  },
  firstVisit: {
    garments: {
      tee: "T 恤",
      jeans: "牛仔褲",
      sweater: "毛衣",
      towel: "毛巾",
      socks: "襪子",
      shirt: "襯衫",
    },
    garmentLabel: (o: { garment: string }) => `把${o.garment}放進籃子`,
    basketEmpty: "把地上的衣服丟進來",
    basketPartial: (o: { count: number; total: number }) =>
      `已放 ${o.count}/${o.total} 件 · 再放幾件，或走向門口`,
    basketFull: "都放好了 · 走向門口",
    lampOffTooltip: "關燈",
    lampOnTooltip: "開燈",
    lampOffLabel: "關掉檯燈",
    lampOnLabel: "打開檯燈",
    doorReadyTooltip: "拿去洗衣店",
    doorWaitingTooltip: "先把衣服收好",
    doorReadyLabel: "把籃子拿去洗衣店",
    doorWaitingLabel: "通往洗衣店的門，先把衣服收好",
    justListen: "只聽聽 →",
  },
} satisfies LaundromatCopy;
