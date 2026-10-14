import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const ja = {
  locale: "ja",
  languageName: "日本語",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe：コインランドリーの静かな集中タイマーと lofi",
    description:
      "静かなコインランドリーで、洗濯を集中タイマーに。洗って、乾かして、集中して、lofi、コーヒー、見知らぬ誰かへのノート、それともただぼんやり。無料・登録不要。",
    intro:
      "ブラウザの中の静かなコインランドリー。洗濯機か乾燥機を 5〜60 分で回して集中タイマーにすれば、終わったときに通知が届く。テレビで lo-fi のチャンネルを流し、コーヒーを淹れて、共有ノートに手書きのメモを残そう。書き終えたノートは棚に並ぶ。",
    keywords: [
      "コインランドリー",
      "集中タイマー",
      "ポモドーロ",
      "lofi",
      "作業用BGM",
      "勉強タイマー",
      "癒し",
      "共有ノート",
    ],
    inspiredBy: "着想をくれた本",
    openGraphLocale: "ja_JP",
  },
  toolbar: {
    soundOn: "サウンド オン",
    soundOff: "サウンド オフ",
    share: "シェア",
    linkCopied: "リンクをコピーした",
    shareText:
      "ブラウザの中の静かなコインランドリー。洗濯物を入れて、タイマーを回して、誰かが残したメモを読もう。",
    language: "言語",
    settings: "設定",
    builtBy: "Li Yuxuan が ❤️ をこめて作りました",
    updateAvailable: "再読み込みで更新されたコインランドリーへ",
  },
  settings: {
    heading: "設定",
    rendering: "描画",
    renderingHint:
      "ライトでは、やわらかな光、植物の揺れ、ノートと掲示板へのズームを省きます。遅めの端末やメモリが少ないときに役立ちます。",
    qualityAuto: "自動",
    qualityAutoHint: (o: { quality: string }) =>
      `この端末では${o.quality}を使用`,
    qualityFull: "フル",
    qualityFullHint: "すべての光と動き",
    qualityLite: "ライト",
    qualityLiteHint: "メモリとバッテリーにやさしい",
    close: "閉じる",
    closeHint: "esc で閉じる",
    roomSounds: "店内の音",
    roomSoundsHint:
      "店内とそこにいる人たちの音です。オフにしても、消えるのはあなたにだけです。",
    roomSoundsAllOn: "すべてオン",
    roomSoundsAllOff: "すべてオフ",
    roomSoundOn: "オン",
    roomSoundOff: "オフ",
    roomSound: {
      machines: { label: "マシン", hint: "回っている洗濯機と乾燥機" },
      "shop-bell": { label: "ドアベル", hint: "誰かが入ってくると鳴ります" },
      unloading: {
        label: "取り出し",
        hint: "誰かが洗濯物を取り出すときのドアの音",
      },
      coffee: {
        label: "コーヒー",
        hint: "抽出のこぽこぽ音とできあがりのビープ",
      },
      tv: { label: "テレビの砂嵐", hint: "信号のないテレビのザーッという音" },
      lamp: {
        label: "ランプ",
        hint: "ランプがちらついて点き、カチッと消える音",
      },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
  },
  tabDone: "完了",
  readoutDone: "完了",
  matWelcome: "ようこそ",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "洗濯機" : "乾燥機"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}、空いている`,
    freeTooltip: (o: { name: string }) => `${o.name} · 空き`,
    loadedLabel: (o: { name: string }) =>
      `${o.name}、洗濯物が入っている、スタートできる`,
    loadedTooltip: (o: { name: string }) => `${o.name} · 投入済み`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}、${o.kind === "washer" ? "洗濯中" : "乾燥中"}、残り ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "洗濯中" : "乾燥中"} · ${o.time} に終わる`,
    doneLabel: (o: { name: string }) =>
      `${o.name}、終わった、洗濯物を取り出そう`,
    doneTooltip: (o: { name: string }) => `${o.name} · 完了`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}、ほかの人の洗濯物を${o.kind === "washer" ? "洗濯中" : "乾燥中"}、残り ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `ほかの人が${o.kind === "washer" ? "洗濯中" : "乾燥中"} · ${o.time} に終わる`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}、ほかの人の洗濯物が入っている`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · ほかの人の、未スタート`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}、ほかの人の洗濯物が終わっている`,
    othersDoneTooltip: (o: { name: string }) => `${o.name} · ほかの人の、完了`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · 完了`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "洗濯物を取り出して、乾燥機を選ぼう"
        : "洗濯物が乾いたよ",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name}の${{ dial: "ダイヤル", start: "スタートボタン", door: "ドア" }[o.control]}、ほかの人が使用中`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `ほかの人の${o.kind === "washer" ? "洗濯" : "乾燥"} · ${o.time} に終わる`,
    othersLoadedTooltip: "ほかの人の洗濯物 · まだスタートしていない",
    othersDoneTooltip: "ほかの人の洗濯物 · 持ち主を待っている",
    doneAt: (o: { time: string }) => `${o.time} に終わる`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name}の時間、${o.minutes} 分`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `回す · ${o.minutes} 分 → ${o.nextMinutes} 分`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name}のスタート、${o.minutes} 分の${o.kind === "washer" ? "洗濯" : "乾燥"}${o.canNotify ? "、終わったら通知する" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `スタート · ${o.minutes} 分の${o.kind === "washer" ? "洗濯" : "乾燥"}${o.canNotify ? " · 通知あり" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}、${o.kind === "washer" ? "洗濯" : "乾燥"}が終わったら知らせて`,
    remindTooltip: (o: { doneAt: string }) => `知らせて · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) => `${o.name}のスタート、${o.reminderOn ? "通知オン、" : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `通知オン · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name}のスタート`,
    loadFirstTooltip: "先に洗濯物を入れて",
    needsWashingTooltip: "まず洗濯から",
    alreadyWashedTooltip: "洗濯ずみ · 次は乾燥",
    alreadyDryTooltip: "もう乾いてる · 家に持ち帰ろう",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `洗濯物は${o.name}で待ってるよ`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer" ? "まだ洗濯中" : "まだ乾燥中",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `洗濯物ができあがり · ${o.name}`,
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "洗濯中" : "乾燥中"} · ${o.doneAt}`,
    doneDoorTooltip: "ドアを開ける · 洗濯物を取り出す",
    loadedDoorTooltip: "ドアを開ける · 洗濯物を出す",
    loadableDoorTooltip: "洗濯物を入れる",
    doorLabel: (o: { name: string }) => `${o.name}のドア`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name}のドア、${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `玄関マット、${o.laundry === "folded" ? "乾いた" : "洗った"}洗濯物を持って帰る`,
    readyTooltip: "家に帰る · きれいな洗濯物を持って帰ろう",
    awayLabel: "玄関マット、洗濯物を機械に残して家へ帰る",
    awayTooltip: "家に帰る · 洗濯物は機械の中に残るよ",
    wetLabel: "玄関マット、濡れた洗濯物を持って家へ帰る",
    wetTooltip: "家に帰る · 服はまだ濡れてる",
    dirtyLabel: "玄関マット、帰る前に服を洗濯機に入れよう",
    dirtyTooltip: "まず洗濯から · 服を洗濯機に入れよう",
  },
  laundryBasket: {
    labels: {
      empty: "ランドリーバスケット、空",
      dirty: "ランドリーバスケット、洗う服",
      wet: "ランドリーバスケット、乾かす濡れた服",
      folded: "ランドリーバスケット、乾いたきれいな服",
    },
    tooltips: {
      empty: "かご · 空っぽ",
      dirty: "汚れた服 · 洗濯機へ",
      wet: "濡れた服 · 乾燥機へ",
      folded: "きれいに乾いた · 帰る準備OK",
    },
  },
  coffee: {
    machineLabel: "コーヒーマシン",
    brewingMachineLabel: "コーヒーマシン、抽出中",
    brewingTooltip: "抽出中…",
    idleSwitchLabel: "コーヒーマシンのスイッチ、コーヒーを淹れる",
    idleSwitchTooltip: "コーヒーを淹れる",
    brewingSwitchLabel: "コーヒーマシンのスイッチ、抽出中",
    readyMachineLabel: "コーヒーマシン、ポットにコーヒーがある",
    readyMachineTooltip: "コーヒーができた",
    topUpSwitchLabel: "コーヒーマシンのスイッチ、ポットを継ぎ足す",
    topUpSwitchTooltip: "継ぎ足す",
    fullSwitchLabel: "コーヒーマシンのスイッチ、ポットがいっぱい",
    fullSwitchTooltip: "ポットがいっぱい · 先に一杯注ぐ",
    emptyFlaskLabel: "コーヒーポット、空",
    emptyFlaskTooltip: "ポットは空",
    brewingFlaskLabel: "コーヒーポット、抽出中",
    othersBrewingMachineLabel: "コーヒーマシン、ほかの人が抽出中",
    othersBrewingSwitchLabel: "コーヒーマシンのスイッチ、ほかの人が抽出中",
    othersBrewingFlaskLabel: "コーヒーポット、ほかの人が抽出中",
    othersBrewingTooltip: (o: { time: string }) =>
      `ほかの人が抽出中 · ${o.time} に終わる`,
    pourLabel: "コーヒーポット、一杯注ぐ",
    pourTooltip: "一杯注ぐ",
    cupFullFlaskLabel: "コーヒーポット、先にカップを飲み終える",
    cupFullFlaskTooltip: "先に飲み終える",
    fullCupLabel: "コーヒーカップ、飲む",
    fullCupTooltip: "飲む",
    emptyCupLabel: "コーヒーカップ、空",
    emptyCupTooltip: "空のカップ",
  },
  plant: {
    label: "観葉植物、草に触れる",
    tooltip: "草に触れる",
  },
  board: {
    label: "掲示板、コインランドリーのお知らせ",
    tooltip: "お知らせ",
    eyebrow: "掲示板",
    heading: "お知らせ",
    subtitle: "コインランドリーの小さな変化を、新しい順に。",
    updated: (o: { date: string }) => `${o.date} 更新`,
    footer: "年中無休・24時間営業",
    close: "閉じる",
    closeHint: "esc で閉じる",
    tags: {
      opening: "オープン",
      tv: "テレビ",
      notebook: "ノート",
      languages: "言語",
      room: "店内",
      coffee: "コーヒー",
      window: "窓",
      light: "光",
      board: "掲示板",
    },
    updates: {
      "room-sound-dials": {
        title: "聞こえる音を選べるように",
        body: "設定に、マシンからドアベルまで、店内の音ごとのダイヤルができました。聞きたくない音はオフにできます。ほかの人の店内はそのままです。",
      },
      "home-mid-wash": {
        title: "洗濯中に家へ帰れる",
        body: "玄関マットから、洗濯の途中でも家に帰れます。濡れた服はかごに入れて持ち帰り、乾いた服はベッドの上に。",
      },
      "bedroom-curtains": {
        title: "家のカーテンと新しいランプ",
        body: "部屋のカーテンやランプをクリックしてみて。どちらの部屋も、太陽や月、ランプに合わせて明るくなったり暗くなったりします。",
      },
      "settings-lite": {
        title: "設定とライトモード",
        body: "ツールバーの歯車から設定を開けます。動作の重い端末ではライトにすると、メモリとバッテリーを節約できます。",
      },
      "door-bell": {
        title: "ドアにベルを設置",
        body: "入店するとき、そして誰かが入ってくるたびに、小さなベルが鳴ります。",
      },
      "whats-new-board": {
        title: "お知らせボードを設置",
        body: "このスタンドで新しいことをお知らせします。昼は紙のように、夜は明かりが灯ります。",
      },
      "twelve-stations": {
        title: "テレビが12チャンネルに",
        body: "自習室から深宇宙まで、新しい lofi ラジオが7局加わりました。",
      },
      "page-drag": {
        title: "ドラッグでページをめくる",
        body: "ページの外側の端ならどこからでも、ドラッグしてめくれます。",
      },
      "window-light": {
        title: "窓から差し込む日差し",
        body: "昼の光が洗濯機や床まで届き、朝夕にはあたたかな色に変わります。",
      },
      "shared-coffee": {
        title: "コーヒーをみんなで",
        body: "同じポットから最大7人まで注げます。",
      },
      "street-view": {
        title: "窓の外の通り",
        body: "窓から通りが見えます。昼は日差し、夜は月明かりに照らされて。",
      },
      "tube-counter": {
        title: "いまいる人のカウンター",
        body: "奥の壁のニキシー管が、あなたも含めて店内の人数を数えます。",
      },
      "coffee-counter": {
        title: "カウンターのコーヒー",
        body: "ポットで淹れて一杯注ぎ、洗濯が回るあいだに飲めます。",
      },
      "shared-machines": {
        title: "ほかの人の洗濯",
        body: "ほかの人が使っている洗濯機が見えます。自分の洗濯物を入れても、ほかの人のものはそのまま。",
      },
      "eighteen-languages": {
        title: "18の言語で営業",
        body: "店内すべてがあなたの言語に。隅の地球儀から切り替えられます。",
      },
      "shared-notebook": {
        title: "見知らぬ誰かへのノート",
        body: "次に来る人へメモを残せます。いっぱいになったノートは棚へ。",
      },
      "lofi-tv": {
        title: "テレビで lofi",
        body: "テレビをつけて lofi ラジオを。選局つまみと音量つまみ付き。",
      },
      opening: {
        title: "laundro.cafe オープン",
        body: "ブラウザの中の静かなコインランドリー。洗って、乾かして、5〜60分集中。",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `ニキシー管カウンター、${o.count === 1 ? "いるのはあなただけ" : `いま${o.count}人`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "いるのはあなただけ" : `いま${o.count}人`,
    offLabel: "ニキシー管カウンター、オフ",
    offTooltip: "オフ",
  },
  tv: {
    stations: {
      "rainy-cafe": "雨のカフェ",
      "piano-night": "ピアノの夜",
      "late-wash": "夜更けの洗濯",
      "tape-hiss": "テープのノイズ",
      "city-at-3am": "午前3時の街",
      "study-hall": "自習室",
      "smoky-jazz": "けむたいジャズ",
      fireplace: "暖炉",
      "neon-tokyo": "ネオンの東京",
      "string-quartet": "弦楽四重奏",
      "porch-guitar": "縁側のギター",
      "deep-space": "深宇宙",
    },
    station: (o: { channel: string; name: string }) =>
      `ch ${o.channel} · ${o.name}`,
    offLabel: "テレビ、オフ",
    offTooltip: "テレビ · オフ",
    onLabel: (o: { station: string }) => `テレビ、オン、${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `テレビ画面、${o.station}、YouTube で見る`,
    screenOnTooltip: "YouTube で見る ↗",
    screenOffLabel: "テレビ画面、オフ、つける",
    turnOn: "つける",
    tunerLabel: (o: { station: string }) => `テレビのチャンネル、${o.station}`,
    tunerTooltip: (o: { nextName: string }) => `次のチャンネル · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `テレビの音量、${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `音量 · ${o.percent}%`,
    powerOnLabel: "テレビの電源、オン、消す",
    turnOff: "消す",
    powerOffLabel: "テレビの電源、オフ、つける",
    noSignal: "信号なし",
  },
  shelf: {
    loadingLabel: "棚、書き終えたノートを確認中",
    loadingTooltip: "棚を確認中…",
    offlineLabel: "棚、いまはオフライン",
    offlineTooltip: "棚はいまオフライン",
    emptyLabel: "棚、書き終えたノートはまだない",
    emptyTooltip: "書き終えたノートはまだない",
    readyLabel: "書き終えたノートの棚を見る",
    bookCount: (o: { count: number }) => `書き終えたノート ${o.count} 冊`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `ノート No. ${o.number} を開く、${o.span}、${o.entries}`,
    entryCount: (o: { count: number }) => `${o.count} 件のメモ`,
  },
  notebook: {
    objectLabel: "ノートを開く",
    objectTooltip: "知らない誰かのメモ",
    number: (o: { number: number }) => `No. ${o.number}`,
    dialogLabel: (o: { number: number }) => `ノート No. ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `${o.day} から`,
    insideCover: "表紙の裏",
    insideCoverAndPage: (o: { page: number }) => `表紙の裏 · ${o.page} ページ`,
    page: (o: { page: number }) => `${o.page} ページ`,
    pages: (o: { left: number; right: number }) =>
      `${o.left}–${o.right} ページ`,
    pageButtonLabel: (o: { page: number }) =>
      `${o.page} ページ、別のページへ移動`,
    previousPage: "前のページ",
    nextPage: "次のページ",
    scrubberLabel: "ページ",
    goToPage: "ページへ移動",
    pageInputLabel: (o: { pageCount: number }) =>
      `ページ番号、1〜${o.pageCount}`,
    report: "報告",
    reported: "報告済み",
    opening: "ノートを開いている…",
    missing: (o: { number: number }) => `ノート No. ${o.number} はない`,
    full: (o: { number: number }) =>
      `ノート No. ${o.number} はいっぱい · 読むだけ`,
    someoneWritingInNotebook: "誰かがノートに書いている · 順番を待って",
    someoneWriting: "誰かがいま書いている · 順番を待って",
    comeBackToWrite: "2分後にまた来て、もう1つ書いてね",
    startsNext: (o: { number: number }) =>
      `このメモからノート No. ${o.number} が始まる`,
    writePromptBeforeKeys: "次の人へメモを書こう · ",
    writePromptAfterKeys: "で保存",
    textareaLabel: "ノートにメモを書く",
    notifyWhenFree: "空いたら知らせて",
    notifyPending: "空いたら知らせるね",
    saveNote: "メモを保存",
    savingNote: "保存中…",
    close: "閉じる",
    freeNotificationTitle: "ノートが空いた",
    freeNotificationBody: "書く番だよ",
    leaveFailures: {
      offline: "ノートはいまオフライン · メモはここに残っている",
      rate_limited: "メモは2分に1回まで · 少し待ってもう一度",
      contains_link: "ノートにリンクは書けない",
      too_long: "ノートには長すぎる · 少し短くして",
      sign_off_too_long: "署名が長すぎる",
      empty_body: "まず何か書いて",
      unknown: "うまくいかなかった · もう一度試して",
    },
  },
  firstVisit: {
    garments: {
      tee: "Tシャツ",
      jeans: "ジーンズ",
      sweater: "セーター",
      towel: "タオル",
      socks: "靴下",
      shirt: "シャツ",
    },
    garmentLabel: (o: { garment: string }) => `${o.garment}をかごに入れる`,
    basketEmpty: "床の服をここに入れて",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.total} 枚中 ${o.count} 枚 · もっと入れるか、ドアへ`,
    basketFull: "全部入った · ドアへ",
    basketWet: "服はまだ濡れてる · コインランドリーで乾かそう",
    lampOffTooltip: "ランプを消す",
    lampOnTooltip: "ランプをつける",
    lampOffLabel: "ランプを消す",
    lampOnLabel: "ランプをつける",
    curtainCloseTooltip: "カーテンを閉める",
    curtainOpenTooltip: "カーテンを開ける",
    curtainCloseLabel: "カーテンを閉める",
    curtainOpenLabel: "カーテンを開ける",
    doorReadyTooltip: "コインランドリーへ持っていく",
    doorWaitingTooltip: "先に洗濯物を拾って",
    doorAwayTooltip: "コインランドリーへ戻る · 洗濯物は機械の中",
    doorAwayLabel: "コインランドリーへ戻る、洗濯物はまだ機械の中",
    doorReadyLabel: "かごをコインランドリーへ持っていく",
    doorWaitingLabel: "コインランドリーへのドア、先に洗濯物を拾って",
    justListen: "聴くだけ →",
  },
} satisfies LaundromatCopy;
