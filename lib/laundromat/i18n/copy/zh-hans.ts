import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const zhHans = {
  locale: "zh-Hans",
  languageName: "简体中文",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe：自助洗衣店里的治愈专注计时器与 lofi",
    description:
      "在一间安静的自助洗衣店里，把洗衣当作专注计时器。洗衣、烘干、专注、lofi、咖啡、写给陌生人的笔记本，或者只是发会儿呆。免费，无需注册。",
    intro:
      "浏览器里一间安静的自助洗衣店。启动一台洗衣机或烘干机，设定 5 到 60 分钟作为专注计时，结束时会收到通知；用电视放 lo-fi 电台，煮一杯咖啡，再在共享笔记本里手写留言。写满的笔记本会放到书架上。",
    keywords: [
      "自助洗衣店",
      "专注计时器",
      "番茄钟",
      "lofi",
      "学习计时器",
      "工作背景音乐",
      "治愈",
      "共享笔记本",
    ],
    inspiredBy: "灵感来自",
    openGraphLocale: "zh_CN",
  },
  toolbar: {
    soundOn: "声音开",
    soundOff: "声音关",
    share: "分享",
    linkCopied: "链接已复制",
    shareText:
      "浏览器里一间安静的自助洗衣店。放一桶衣服进去，让计时器走着，读读别人留下的话。",
    language: "语言",
    settings: "设置",
    builtBy: "李雨轩制作",
    updateAvailable: "刷新，进入更新后的自助洗衣店",
  },
  settings: {
    heading: "设置",
    rendering: "画面",
    renderingHint:
      "轻量模式会去掉柔光、植物的摆动，以及拉近笔记本和告示板的镜头。适合较慢的设备或内存紧张的时候。",
    qualityAuto: "自动",
    qualityAutoHint: (o: { quality: string }) =>
      `本设备使用「${o.quality}」模式`,
    qualityFull: "完整",
    qualityFullHint: "所有光影与动态",
    qualityLite: "轻量",
    qualityLiteHint: "更省内存和电量",
    close: "关闭",
    closeHint: "按 esc 关闭",
  },
  tabDone: "好了",
  readoutDone: "好了",
  matWelcome: "欢迎",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "洗衣机" : "烘干机"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}，空闲`,
    freeTooltip: (o: { name: string }) => `${o.name} · 空闲`,
    loadedLabel: (o: { name: string }) => `${o.name}，衣服已放入，可以启动`,
    loadedTooltip: (o: { name: string }) => `${o.name} · 已放入`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}，${o.kind === "washer" ? "洗衣中" : "烘干中"}，还剩 ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "洗衣中" : "烘干中"} · ${o.time} 结束`,
    doneLabel: (o: { name: string }) => `${o.name}，好了，把衣服取出来吧`,
    doneTooltip: (o: { name: string }) => `${o.name} · 好了`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}，正在${o.kind === "washer" ? "洗" : "烘干"}别人的衣服，还剩 ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `别人在${o.kind === "washer" ? "洗衣" : "烘干"} · ${o.time} 结束`,
    othersLoadedLabel: (o: { name: string }) => `${o.name}，里面有别人的衣服`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · 别人的衣服，还没开始`,
    othersDoneLabel: (o: { name: string }) => `${o.name}，别人的衣服好了`,
    othersDoneTooltip: (o: { name: string }) => `${o.name} · 别人的，好了`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · 好了`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer" ? "把衣服取出来，选一台烘干机" : "你的衣服烘干了",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name} ${{ dial: "旋钮", start: "启动键", door: "机门" }[o.control]}，别人正在使用`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `别人的${o.kind === "washer" ? "洗衣" : "烘干"} · ${o.time} 结束`,
    othersLoadedTooltip: "别人的衣服 · 还没开始",
    othersDoneTooltip: "别人的衣服 · 等主人来取",
    doneAt: (o: { time: string }) => `${o.time} 结束`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name} 时长，${o.minutes} 分钟`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `转动 · ${o.minutes} 分钟 → ${o.nextMinutes} 分钟`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name} 启动，${o.minutes} 分钟${o.kind === "washer" ? "洗衣" : "烘干"}${o.canNotify ? "，结束时通知你" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `启动 · ${o.minutes} 分钟${o.kind === "washer" ? "洗衣" : "烘干"}${o.canNotify ? " · 会通知你" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}，${o.kind === "washer" ? "洗好" : "烘干"}时提醒我`,
    remindTooltip: (o: { doneAt: string }) => `提醒我 · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) => `${o.name} 启动，${o.reminderOn ? "已开启提醒，" : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `已开启提醒 · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name} 启动`,
    loadFirstTooltip: "先放衣服",
    needsWashingTooltip: "先洗一下",
    alreadyWashedTooltip: "已经洗好了 · 接着烘干",
    alreadyDryTooltip: "已经干了 · 带回家吧",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `你的衣服在${o.name}里等着`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer" ? "你的衣服还在洗" : "你的衣服还在烘",
    elsewhereDoneTooltip: (o: { name: string }) => `你的衣服好了 · 在${o.name}`,
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "洗衣中" : "烘干中"} · ${o.doneAt}`,
    doneDoorTooltip: "开门 · 取出衣服",
    loadedDoorTooltip: "开门 · 把衣服拿回来",
    loadableDoorTooltip: "放入衣服",
    doorLabel: (o: { name: string }) => `${o.name} 机门`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name} 机门，${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `门垫，带上${o.laundry === "folded" ? "烘干的" : "洗好的"}衣服回家`,
    readyTooltip: "回家 · 带上干净的衣服",
    awayLabel: "门垫，把衣服留在机器里先回家",
    awayTooltip: "回家 · 衣服留在机器里",
    wetLabel: "门垫，带着湿衣服回家",
    wetTooltip: "回家 · 衣服还是湿的",
    dirtyLabel: "门垫，回家前先把衣服放进洗衣机",
    dirtyTooltip: "先洗一下 · 把衣服放进洗衣机",
  },
  laundryBasket: {
    labels: {
      empty: "洗衣篮，空的",
      dirty: "洗衣篮，待洗的衣服",
      wet: "洗衣篮，待烘干的湿衣服",
      folded: "洗衣篮，干净的干衣服",
    },
    tooltips: {
      empty: "篮子 · 空的",
      dirty: "脏衣服 · 放进洗衣机",
      wet: "湿衣服 · 放进烘干机",
      folded: "洗好烘干了 · 可以回家了",
    },
  },
  coffee: {
    machineLabel: "咖啡机",
    brewingMachineLabel: "咖啡机，正在煮",
    brewingTooltip: "正在煮…",
    idleSwitchLabel: "咖啡机开关，煮一杯咖啡",
    idleSwitchTooltip: "煮一杯咖啡",
    brewingSwitchLabel: "咖啡机开关，正在煮",
    readyMachineLabel: "咖啡机，壶里有咖啡",
    readyMachineTooltip: "咖啡好了",
    topUpSwitchLabel: "咖啡机开关，把壶续满",
    topUpSwitchTooltip: "续满咖啡壶",
    fullSwitchLabel: "咖啡机开关，壶已经满了",
    fullSwitchTooltip: "壶满了 · 先倒一杯",
    emptyFlaskLabel: "咖啡壶，空的",
    emptyFlaskTooltip: "壶空了",
    brewingFlaskLabel: "咖啡壶，正在煮",
    othersBrewingMachineLabel: "咖啡机，别人在煮咖啡",
    othersBrewingSwitchLabel: "咖啡机开关，别人在煮咖啡",
    othersBrewingFlaskLabel: "咖啡壶，别人在煮咖啡",
    othersBrewingTooltip: (o: { time: string }) =>
      `别人在煮咖啡 · ${o.time} 结束`,
    pourLabel: "咖啡壶，倒一杯",
    pourTooltip: "倒一杯",
    cupFullFlaskLabel: "咖啡壶，先喝完杯里的",
    cupFullFlaskTooltip: "先喝完这杯",
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
    label: "告示板，洗衣房的新鲜事",
    tooltip: "新鲜事",
    eyebrow: "告示板",
    heading: "新鲜事",
    subtitle: "洗衣房里的小变化，最新的在最前。",
    updated: (o: { date: string }) => `${o.date} 更新`,
    footer: "全年无休，24 小时营业",
    close: "关闭",
    closeHint: "按 esc 关闭",
    tags: {
      opening: "开业",
      tv: "电视",
      notebook: "笔记本",
      languages: "语言",
      room: "店内",
      coffee: "咖啡",
      window: "窗户",
      light: "光线",
      board: "告示板",
    },
    updates: {
      "home-mid-wash": {
        title: "洗衣时也能回家",
        body: "踩上门垫，衣服还在洗时也能回家。湿衣服装在篮子里带回，干衣服放在床上。",
      },
      "bedroom-curtains": {
        title: "家里的窗帘和新台灯",
        body: "点一下房间里的窗帘或台灯。现在两个房间都会随着太阳、月亮和灯光变亮或变暗。",
      },
      "settings-lite": {
        title: "设置和轻量模式",
        body: "点工具栏里的齿轮打开设置。在较慢的设备上切换到轻量模式，可以节省内存和电量。",
      },
      "door-bell": {
        title: "门上挂了铃铛",
        body: "你走进来时，或有其他人进门时，小铃铛都会响起。",
      },
      "whats-new-board": {
        title: "新添一块告示板",
        body: "这块立牌告诉你有什么新鲜事。白天像纸一样安静，入夜后亮起灯来。",
      },
      "twelve-stations": {
        title: "电视有了十二个频道",
        body: "从自习室到深空，七个新的 lofi 电台填满了调台旋钮。",
      },
      "page-drag": {
        title: "拖动翻页",
        body: "沿着页面外侧边缘任意位置拖动，就能翻页。",
      },
      "window-light": {
        title: "阳光照进窗户",
        body: "白天的光线会照到机器和地板上，日出日落时变得温暖。",
      },
      "shared-coffee": {
        title: "一壶咖啡大家分",
        body: "最多七个人可以从同一个壶里倒咖啡。",
      },
      "street-view": {
        title: "窗外的街道",
        body: "窗外是一条街，被阳光或月光照亮。",
      },
      "tube-counter": {
        title: "谁在这里",
        body: "后墙上的辉光管会数出洗衣房里的每个人，也包括你。",
      },
      "coffee-counter": {
        title: "柜台上的咖啡",
        body: "煮一壶，倒一杯，边等衣服转边喝。",
      },
      "shared-machines": {
        title: "别人也在洗衣服",
        body: "看看其他人在用哪台机器。你放衣服时，别人的衣服不会动。",
      },
      "eighteen-languages": {
        title: "18 种语言营业",
        body: "整个洗衣房都说你的语言。在角落的地球图标切换。",
      },
      "shared-notebook": {
        title: "写给陌生人的笔记本",
        body: "给下一个进来的人留一句话。写满的本子会放上书架。",
      },
      "lofi-tv": {
        title: "电视里的 lofi",
        body: "打开电视听 lofi 电台，有调台和音量旋钮。",
      },
      opening: {
        title: "laundro.cafe 开业",
        body: "浏览器里一家安静的洗衣房：洗衣、烘干，专注 5 到 60 分钟。",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `辉光管计数器，${o.count === 1 ? "只有你在这里" : `这里有 ${o.count} 个人`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "只有你在这里" : `这里有 ${o.count} 个人`,
    offLabel: "辉光管计数器，关闭",
    offTooltip: "关闭",
  },
  tv: {
    stations: {
      "rainy-cafe": "雨天咖啡馆",
      "piano-night": "钢琴之夜",
      "late-wash": "深夜洗衣",
      "tape-hiss": "磁带沙沙",
      "city-at-3am": "凌晨三点的城市",
      "study-hall": "自习室",
      "smoky-jazz": "烟雾爵士",
      fireplace: "壁炉",
      "neon-tokyo": "霓虹东京",
      "string-quartet": "弦乐四重奏",
      "porch-guitar": "门廊吉他",
      "deep-space": "深空",
    },
    station: (o: { channel: string; name: string }) =>
      `${o.channel} 台 · ${o.name}`,
    offLabel: "电视，关",
    offTooltip: "电视 · 关",
    onLabel: (o: { station: string }) => `电视，开，${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `电视屏幕，${o.station}，在 YouTube 上观看`,
    screenOnTooltip: "在 YouTube 上观看 ↗",
    screenOffLabel: "电视屏幕，关，打开",
    turnOn: "打开",
    tunerLabel: (o: { station: string }) => `电视频道，${o.station}`,
    tunerTooltip: (o: { nextName: string }) => `下一个电台 · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `电视音量，${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `音量 · ${o.percent}%`,
    powerOnLabel: "电视电源，开，关闭",
    turnOff: "关闭",
    powerOffLabel: "电视电源，关，打开",
    noSignal: "无信号",
  },
  shelf: {
    loadingLabel: "书架，正在查看写满的笔记本",
    loadingTooltip: "正在看书架…",
    offlineLabel: "书架，暂时离线",
    offlineTooltip: "书架暂时离线",
    emptyLabel: "书架，还没有写满的笔记本",
    emptyTooltip: "还没有写满的笔记本",
    readyLabel: "看看放着写满笔记本的书架",
    bookCount: (o: { count: number }) => `${o.count} 本写满的笔记本`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `打开第 ${o.number} 本笔记本，${o.span}，${o.entries}`,
    entryCount: (o: { count: number }) => `${o.count} 条留言`,
  },
  notebook: {
    objectLabel: "打开笔记本",
    objectTooltip: "陌生人的留言",
    number: (o: { number: number }) => `第 ${o.number} 本`,
    dialogLabel: (o: { number: number }) => `第 ${o.number} 本笔记本`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `始于 ${o.day}`,
    insideCover: "封面内页",
    insideCoverAndPage: (o: { page: number }) => `封面内页 · 第 ${o.page} 页`,
    page: (o: { page: number }) => `第 ${o.page} 页`,
    pages: (o: { left: number; right: number }) => `第 ${o.left}–${o.right} 页`,
    pageButtonLabel: (o: { page: number }) => `第 ${o.page} 页，翻到其他页`,
    previousPage: "上一页",
    nextPage: "下一页",
    scrubberLabel: "页码",
    goToPage: "翻到",
    pageInputLabel: (o: { pageCount: number }) => `页码，1 到 ${o.pageCount}`,
    report: "举报",
    reported: "已举报",
    opening: "正在打开笔记本…",
    missing: (o: { number: number }) => `没有第 ${o.number} 本笔记本`,
    full: (o: { number: number }) => `第 ${o.number} 本笔记本已写满 · 只能阅读`,
    someoneWritingInNotebook: "有人正在笔记本上写字 · 等一等",
    someoneWriting: "有人正在写 · 等一等",
    comeBackToWrite: "两分钟后再来写下一条",
    startsNext: (o: { number: number }) =>
      `这条留言会开启第 ${o.number} 本笔记本`,
    writePromptBeforeKeys: "给下一个人留句话 · 按",
    writePromptAfterKeys: "保存",
    textareaLabel: "在笔记本上写一句话",
    notifyWhenFree: "空出来时告诉我",
    notifyPending: "到时会通知你",
    saveNote: "保存我的留言",
    savingNote: "正在保存…",
    close: "关闭",
    freeNotificationTitle: "笔记本空出来了",
    freeNotificationBody: "轮到你写了",
    leaveFailures: {
      offline: "笔记本暂时离线 · 你写的内容还留在这里",
      rate_limited: "每两分钟只能留一条 · 稍后再试",
      contains_link: "笔记本里不能放链接",
      too_long: "太长了，写不下 · 再短一点",
      sign_off_too_long: "署名太长了",
      empty_body: "先写点什么吧",
      unknown: "出了点问题 · 再试一次",
    },
  },
  firstVisit: {
    garments: {
      tee: "T 恤",
      jeans: "牛仔裤",
      sweater: "毛衣",
      towel: "毛巾",
      socks: "袜子",
      shirt: "衬衫",
    },
    garmentLabel: (o: { garment: string }) => `把${o.garment}放进篮子`,
    basketEmpty: "把地上的衣服扔进来",
    basketPartial: (o: { count: number; total: number }) =>
      `已放 ${o.count}/${o.total} 件 · 再放几件，或者走向门口`,
    basketFull: "都放好了 · 走向门口",
    basketWet: "衣服还是湿的 · 去洗衣房烘干",
    lampOffTooltip: "关灯",
    lampOnTooltip: "开灯",
    lampOffLabel: "关掉台灯",
    lampOnLabel: "打开台灯",
    curtainCloseTooltip: "拉上窗帘",
    curtainOpenTooltip: "拉开窗帘",
    curtainCloseLabel: "拉上窗帘",
    curtainOpenLabel: "拉开窗帘",
    bedTooltip: "睡觉",
    bedLabel: "去睡觉",
    goodNight: "晚安",
    notSleepy: "不睡了",
    doorReadyTooltip: "拿去洗衣店",
    doorWaitingTooltip: "先把衣服收拾好",
    doorAwayTooltip: "回洗衣房 · 衣服在机器里",
    doorAwayLabel: "回洗衣房，衣服还在机器里",
    doorReadyLabel: "把篮子拿去洗衣店",
    doorWaitingLabel: "通往洗衣店的门，先把衣服收拾好",
    justListen: "只听听 →",
  },
} satisfies LaundromatCopy;
