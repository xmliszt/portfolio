import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const ko = {
  locale: "ko",
  languageName: "한국어",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: 빨래방에서 하는 아늑한 집중 타이머와 로파이",
    description:
      "조용한 빨래방에서 빨래를 집중 타이머 삼아 돌려 봐. 빨래, 건조, 집중, 로파이, 커피, 낯선 이를 위한 노트, 아니면 그냥 멍때리기. 무료, 가입 없이.",
    intro:
      "브라우저 속 조용한 빨래방. 세탁기나 건조기를 5분에서 60분까지 돌려 집중 타이머로 쓰고, 끝나면 알림을 받아. TV로 lo-fi 채널을 틀고, 커피를 내리고, 공유 노트에 손글씨 메모를 남겨 봐. 다 채운 노트는 선반에 꽂혀.",
    keywords: [
      "빨래방",
      "집중 타이머",
      "뽀모도로",
      "로파이",
      "작업용 BGM",
      "공부 타이머",
      "아늑한",
      "공유 노트",
    ],
    inspiredBy: "영감을 준 책",
    openGraphLocale: "ko_KR",
  },
  toolbar: {
    soundOn: "소리 켬",
    soundOff: "소리 끔",
    share: "공유",
    linkCopied: "링크 복사됨",
    shareText:
      "브라우저 속 조용한 빨래방. 빨래를 넣고, 타이머를 돌리고, 사람들이 남긴 메모를 읽어 봐.",
    language: "언어",
    builtBy: "Li Yuxuan이 ❤️을 담아 만들었어요",
  },
  tabDone: "완료",
  readoutDone: "완료",
  matWelcome: "환영",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "세탁기" : "건조기"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, 비어 있음`,
    freeTooltip: (o: { name: string }) => `${o.name} · 비어 있음`,
    loadedLabel: (o: { name: string }) =>
      `${o.name}, 빨래 넣음, 시작할 수 있음`,
    loadedTooltip: (o: { name: string }) => `${o.name} · 빨래 넣음`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, ${o.kind === "washer" ? "세탁 중" : "건조 중"}, ${o.remaining} 남음`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "세탁 중" : "건조 중"} · ${o.time} 완료`,
    doneLabel: (o: { name: string }) => `${o.name}, 완료, 빨래를 꺼내 줘`,
    doneTooltip: (o: { name: string }) => `${o.name} · 완료`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, 다른 사람의 빨래 ${o.kind === "washer" ? "세탁 중" : "건조 중"}, ${o.remaining} 남음`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `다른 사람이 ${o.kind === "washer" ? "세탁 중" : "건조 중"} · ${o.time} 완료`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, 다른 사람의 빨래가 들어 있어요`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · 다른 사람의 빨래, 시작 전`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, 다른 사람의 빨래가 끝남`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · 다른 사람 빨래, 완료`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · 완료`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "빨래를 꺼내서 건조기를 골라 줘"
        : "빨래가 다 말랐어",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name} ${{ dial: "다이얼", start: "시작 버튼", door: "문" }[o.control]}, 다른 사람이 사용 중`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `다른 사람의 ${o.kind === "washer" ? "세탁" : "건조"} · ${o.time} 완료`,
    othersLoadedTooltip: "다른 사람의 빨래 · 아직 시작 전",
    othersDoneTooltip: "다른 사람의 빨래 · 주인을 기다리는 중",
    doneAt: (o: { time: string }) => `${o.time} 완료`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name} 코스, ${o.minutes}분`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `돌리기 · ${o.minutes}분 → ${o.nextMinutes}분`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name} 시작, ${o.minutes}분 ${o.kind === "washer" ? "세탁" : "건조"}${o.canNotify ? ", 끝나면 알려 줌" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `시작 · ${o.minutes}분 ${o.kind === "washer" ? "세탁" : "건조"}${o.canNotify ? " · 알림 있음" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, ${o.kind === "washer" ? "세탁" : "건조"} 끝나면 알려 줘`,
    remindTooltip: (o: { doneAt: string }) => `알려 줘 · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) => `${o.name} 시작, ${o.reminderOn ? "알림 켜짐, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `알림 켜짐 · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name} 시작`,
    loadFirstTooltip: "먼저 빨래를 넣어 줘",
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "세탁 중" : "건조 중"} · ${o.doneAt}`,
    doneDoorTooltip: "문 열기 · 빨래 꺼내기",
    loadedDoorTooltip: "문 열기 · 빨래 다시 꺼내기",
    loadableDoorTooltip: "빨래 넣기",
    doorLabel: (o: { name: string }) => `${o.name} 문`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name} 문, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `현관 매트, ${o.laundry === "folded" ? "건조한" : "세탁한"} 빨래를 들고 집에 가기`,
    readyTooltip: "집으로 · 빨래 챙겨서",
    waitingLabel: "현관 매트, 빨래가 끝나면 여기로 집에 가",
    waitingTooltip: "집에 가는 길 · 빨래부터 끝내자",
  },
  laundryBasket: {
    labels: {
      empty: "빨래 바구니, 비어 있음",
      dirty: "빨래 바구니, 빨 옷",
      wet: "빨래 바구니, 말릴 젖은 옷",
      folded: "빨래 바구니, 깨끗하게 마른 옷",
    },
    tooltips: {
      empty: "바구니 · 비어 있어",
      dirty: "빨랫감 · 세탁기로",
      wet: "젖은 옷 · 건조기로",
      folded: "다 말랐어 · 집에 갈 준비 끝",
    },
  },
  coffee: {
    machineLabel: "커피 머신",
    brewingMachineLabel: "커피 머신, 내리는 중",
    brewingTooltip: "내리는 중…",
    idleSwitchLabel: "커피 머신 스위치, 커피 내리기",
    idleSwitchTooltip: "커피 내리기",
    brewingSwitchLabel: "커피 머신 스위치, 내리는 중",
    readyMachineLabel: "커피 머신, 포트에 커피가 있음",
    readyMachineTooltip: "커피 준비됨",
    topUpSwitchLabel: "커피 머신 스위치, 포트 채우기",
    topUpSwitchTooltip: "포트 채우기",
    fullSwitchLabel: "커피 머신 스위치, 포트가 가득 참",
    fullSwitchTooltip: "포트가 가득 참 · 먼저 한 잔 따르기",
    emptyFlaskLabel: "커피 포트, 비어 있음",
    emptyFlaskTooltip: "포트가 비어 있음",
    brewingFlaskLabel: "커피 포트, 내리는 중",
    othersBrewingMachineLabel: "커피 머신, 다른 사람이 내리는 중",
    othersBrewingSwitchLabel: "커피 머신 스위치, 다른 사람이 내리는 중",
    othersBrewingFlaskLabel: "커피 포트, 다른 사람이 내리는 중",
    othersBrewingTooltip: (o: { time: string }) =>
      `다른 사람이 내리는 중 · ${o.time} 완료`,
    pourLabel: "커피 포트, 한 잔 따르기",
    pourTooltip: "한 잔 따르기",
    cupFullFlaskLabel: "커피 포트, 잔을 먼저 비우기",
    cupFullFlaskTooltip: "잔을 먼저 비우기",
    fullCupLabel: "커피 잔, 마시기",
    fullCupTooltip: "마시기",
    emptyCupLabel: "커피 잔, 비어 있음",
    emptyCupTooltip: "빈 잔",
  },
  plant: {
    label: "화분, 풀 만지기",
    tooltip: "풀 만지기",
  },
  board: {
    label: "게시판, 빨래방의 새 소식",
    tooltip: "새 소식",
    eyebrow: "게시판",
    heading: "새 소식",
    subtitle: "빨래방의 작은 변화들, 최신 순으로.",
    updated: (o: { date: string }) => `${o.date} 업데이트`,
    footer: "연중무휴, 24시간",
    close: "닫기",
    closeHint: "esc로 닫기",
    tags: {
      opening: "오픈",
      tv: "tv",
      notebook: "노트",
      languages: "언어",
      room: "실내",
      coffee: "커피",
      window: "창문",
      light: "빛",
      board: "게시판",
    },
    updates: {
      "whats-new-board": {
        title: "새 소식 게시판",
        body: "이 스탠드가 새 소식을 알려 줘요. 낮에는 종이처럼, 밤에는 불이 켜져요.",
      },
      "twelve-stations": {
        title: "tv 채널 12개",
        body: "독서실부터 깊은 우주까지, 새 로파이 라디오 7개가 다이얼을 채웠어요.",
      },
      "page-drag": {
        title: "드래그로 페이지 넘기기",
        body: "페이지 바깥 가장자리 어디서든 드래그해서 넘길 수 있어요.",
      },
      "window-light": {
        title: "창문으로 드는 햇살",
        body: "햇빛이 기계와 바닥까지 닿고, 해 뜰 녘과 해 질 녘엔 따뜻해져요.",
      },
      "shared-coffee": {
        title: "커피 한 주전자를 함께",
        body: "최대 7명이 같은 주전자에서 따를 수 있어요.",
      },
      "street-view": {
        title: "바깥 거리",
        body: "창문 너머로 해나 달이 비추는 거리가 보여요.",
      },
      "tube-counter": {
        title: "지금 있는 사람 수",
        body: "뒷벽의 닉시관이 당신을 포함해 빨래방에 있는 모두를 세어요.",
      },
      "coffee-counter": {
        title: "카운터의 커피",
        body: "한 주전자 내리고 한 잔 따라, 빨래가 도는 동안 마셔요.",
      },
      "shared-machines": {
        title: "함께 빨래하는 사람들",
        body: "다른 사람이 쓰는 기계가 보여요. 내 빨래를 넣어도 그들의 빨래는 그대로예요.",
      },
      "eighteen-languages": {
        title: "18개 언어로 영업",
        body: "빨래방 전체가 당신의 언어로. 구석의 지구본에서 바꿀 수 있어요.",
      },
      "shared-notebook": {
        title: "낯선 이를 위한 노트",
        body: "다음에 올 사람에게 메모를 남겨요. 다 쓴 노트는 선반에 꽂혀요.",
      },
      "lofi-tv": {
        title: "tv로 듣는 로파이",
        body: "tv를 켜고 로파이 라디오를 들어요. 채널과 볼륨 손잡이가 있어요.",
      },
      opening: {
        title: "laundro.cafe 오픈",
        body: "브라우저 속 조용한 빨래방. 빨고, 말리고, 5~60분 집중해요.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `닉시관 카운터, ${o.count === 1 ? "혼자 있어요" : `지금 ${o.count}명`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "혼자 있어요" : `지금 ${o.count}명`,
    offLabel: "닉시관 카운터, 꺼짐",
    offTooltip: "꺼짐",
  },
  tv: {
    stations: {
      "rainy-cafe": "비 오는 카페",
      "piano-night": "피아노의 밤",
      "late-wash": "늦은 빨래",
      "tape-hiss": "테이프 잡음",
      "city-at-3am": "새벽 3시의 도시",
      "study-hall": "독서실",
      "smoky-jazz": "자욱한 재즈",
      fireplace: "벽난로",
      "neon-tokyo": "네온 도쿄",
      "string-quartet": "현악 사중주",
      "porch-guitar": "현관의 기타",
      "deep-space": "깊은 우주",
    },
    station: (o: { channel: string; name: string }) =>
      `ch ${o.channel} · ${o.name}`,
    offLabel: "TV, 꺼짐",
    offTooltip: "tv · 꺼짐",
    onLabel: (o: { station: string }) => `TV, 켜짐, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `TV 화면, ${o.station}, YouTube에서 보기`,
    screenOnTooltip: "YouTube에서 보기 ↗",
    screenOffLabel: "TV 화면, 꺼짐, 켜기",
    turnOn: "켜기",
    tunerLabel: (o: { station: string }) => `TV 채널, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) => `다음 채널 · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `TV 볼륨, ${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `볼륨 · ${o.percent}%`,
    powerOnLabel: "TV 전원, 켜짐, 끄기",
    turnOff: "끄기",
    powerOffLabel: "TV 전원, 꺼짐, 켜기",
    noSignal: "신호 없음",
  },
  shelf: {
    loadingLabel: "선반, 다 채운 노트를 확인하는 중",
    loadingTooltip: "선반 확인 중…",
    offlineLabel: "선반, 지금은 오프라인",
    offlineTooltip: "선반이 지금은 오프라인이야",
    emptyLabel: "선반, 아직 다 채운 노트가 없음",
    emptyTooltip: "아직 다 채운 노트가 없어",
    readyLabel: "다 채운 노트가 꽂힌 선반 보기",
    bookCount: (o: { count: number }) => `다 채운 노트 ${o.count}권`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `노트 제${o.number}권 열기, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) => `메모 ${o.count}개`,
  },
  notebook: {
    objectLabel: "노트 열기",
    objectTooltip: "낯선 사람들의 메모",
    number: (o: { number: number }) => `제${o.number}권`,
    dialogLabel: (o: { number: number }) => `노트 제${o.number}권`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `${o.day}부터`,
    insideCover: "표지 안쪽",
    insideCoverAndPage: (o: { page: number }) => `표지 안쪽 · ${o.page}쪽`,
    page: (o: { page: number }) => `${o.page}쪽`,
    pages: (o: { left: number; right: number }) => `${o.left}–${o.right}쪽`,
    pageButtonLabel: (o: { page: number }) => `${o.page}쪽, 다른 쪽으로 이동`,
    previousPage: "이전 쪽",
    nextPage: "다음 쪽",
    scrubberLabel: "쪽",
    goToPage: "쪽 이동",
    pageInputLabel: (o: { pageCount: number }) =>
      `쪽 번호, 1부터 ${o.pageCount}까지`,
    report: "신고",
    reported: "신고됨",
    opening: "노트를 여는 중…",
    missing: (o: { number: number }) => `노트 제${o.number}권은 없어`,
    full: (o: { number: number }) =>
      `노트 제${o.number}권은 꽉 찼어 · 읽기만 가능`,
    someoneWritingInNotebook: "누가 노트에 쓰는 중 · 차례를 기다려 줘",
    someoneWriting: "누가 지금 쓰는 중 · 차례를 기다려 줘",
    comeBackToWrite: "2분 뒤에 다시 와서 하나 더 써 줘",
    startsNext: (o: { number: number }) =>
      `이 메모로 노트 제${o.number}권이 시작돼`,
    writePromptBeforeKeys: "다음 사람에게 메모를 남겨 봐 · ",
    writePromptAfterKeys: "로 저장",
    textareaLabel: "노트에 메모 쓰기",
    notifyWhenFree: "비면 알려 줘",
    notifyPending: "비면 알려 줄게",
    saveNote: "메모 저장",
    savingNote: "저장 중…",
    close: "닫기",
    freeNotificationTitle: "노트가 비었어",
    freeNotificationBody: "이제 네 차례야",
    leaveFailures: {
      offline: "노트가 지금 오프라인이야 · 메모는 여기 그대로 있어",
      rate_limited: "메모는 2분에 한 번 · 조금 뒤에 다시 해 봐",
      daily_limit_reached: "오늘은 충분히 남겼어 · 내일 또 와",
      contains_link: "노트에는 링크를 남길 수 없어",
      too_long: "노트에 쓰기엔 너무 길어 · 조금만 줄여 줘",
      sign_off_too_long: "서명이 너무 길어",
      empty_body: "먼저 뭔가 써 줘",
      unknown: "문제가 생겼어 · 다시 해 봐",
    },
  },
  firstVisit: {
    garments: {
      tee: "티셔츠",
      jeans: "청바지",
      sweater: "스웨터",
      towel: "수건",
      socks: "양말",
      shirt: "셔츠",
    },
    garmentLabel: (o: { garment: string }) => `바구니에 ${o.garment} 넣기`,
    basketEmpty: "바닥에 있는 옷을 여기에 넣어 줘",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.total}개 중 ${o.count}개 넣음 · 더 넣거나 문으로 가기`,
    basketFull: "다 넣었어 · 문으로 가자",
    lampOffTooltip: "램프 끄기",
    lampOnTooltip: "램프 켜기",
    lampOffLabel: "램프 끄기",
    lampOnLabel: "램프 켜기",
    doorReadyTooltip: "빨래방으로 가져가기",
    doorWaitingTooltip: "먼저 빨래를 챙겨 줘",
    doorReadyLabel: "바구니를 빨래방으로 가져가기",
    doorWaitingLabel: "빨래방으로 가는 문, 먼저 빨래를 챙겨 줘",
    justListen: "그냥 듣기 →",
  },
} satisfies LaundromatCopy;
