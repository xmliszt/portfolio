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
  coffee: {
    machineLabel: "咖啡機",
    brewingMachineLabel: "咖啡機，正在煮",
    brewingTooltip: "正在煮…",
    hotMachineLabel: "咖啡機，桌上有一杯熱咖啡",
    hotMachineTooltip: "咖啡在桌上",
    idleSwitchLabel: "咖啡機開關，煮一杯咖啡",
    idleSwitchTooltip: "煮一杯咖啡",
    brewingSwitchLabel: "咖啡機開關，正在煮",
    hotSwitchLabel: "咖啡機開關，再煮一杯",
    hotSwitchTooltip: "再來一杯",
  },
  tv: {
    stations: {
      "rainy-cafe": "雨天咖啡館",
      "piano-night": "鋼琴之夜",
      "late-wash": "深夜洗衣",
      "tape-hiss": "錄音帶沙沙",
      "city-at-3am": "凌晨三點的城市",
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
