import type { GarmentKind } from "@/lib/laundromat/first-visit/bedroom-config";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import type { LeaveEntryFailureReason } from "@/lib/laundromat/notebook/describe-leave-failure";
import type { MachineKind } from "@/lib/laundromat/scene-config";
import type { TvStationId } from "@/lib/laundromat/tv/tv-state";

type Machine = { kind: MachineKind; number: number };

export const en = {
  locale: "en",
  languageName: "English",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: a cozy laundromat focus timer with lofi",
    description:
      "Do your laundry as a focus timer in a quiet laundromat. Wash, dry, focus, lofi, coffee, a notebook for strangers, or just zone out. Free, no sign-up.",
    intro:
      "A quiet laundromat in your browser. Start a washer or dryer cycle from 5 to 60 minutes as a focus timer and get a notification when it is done, play lo-fi stations on the TV, brew a coffee, and leave a handwritten note in the shared notebook. Filled notebooks go on the shelf.",
    keywords: [
      "laundromat",
      "focus timer",
      "pomodoro timer",
      "lofi",
      "focus music for work",
      "study with me",
      "cozy",
      "shared notebook",
    ],
    inspiredBy: "inspired by",
    openGraphLocale: "en_US",
  },
  toolbar: {
    soundOn: "sound on",
    soundOff: "sound off",
    share: "share",
    linkCopied: "link copied",
    shareText:
      "A quiet laundromat in your browser. Put a load in, let the timer run, and read the notes people left behind.",
    language: "Language",
    builtBy: "built by Li Yuxuan with ❤️",
  },
  tabDone: "done",
  readoutDone: "done",
  matWelcome: "welcome",
  machine: {
    name: (machine: Machine) =>
      `${machine.kind === "washer" ? "Washer" : "Dryer"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, free`,
    freeTooltip: (o: { name: string }) => `${o.name} · free`,
    loadedLabel: (o: { name: string }) => `${o.name}, loaded, ready to start`,
    loadedTooltip: (o: { name: string }) => `${o.name} · loaded`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, ${o.kind === "washer" ? "washing" : "drying"}, ${o.remaining} left`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "washing" : "drying"} · done at ${o.time}`,
    doneLabel: (o: { name: string }) =>
      `${o.name}, done, take your laundry out`,
    doneTooltip: (o: { name: string }) => `${o.name} · done`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, ${o.kind === "washer" ? "washing" : "drying"} someone else's laundry, ${o.remaining} left`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `someone else is ${o.kind === "washer" ? "washing" : "drying"} · done at ${o.time}`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, someone else's laundry is in it`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · someone else's laundry, not started`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, someone else's laundry is done`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · someone else's, done`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · done`,
    doneNotificationBody: (o: { kind: MachineKind }): string =>
      o.kind === "washer"
        ? "take your laundry out and pick a dryer"
        : "your laundry is dry",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) => `${o.name} ${o.control}, in use by someone else`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `someone else's ${o.kind === "washer" ? "wash" : "dry"} · done at ${o.time}`,
    othersLoadedTooltip: "someone else's laundry · not started yet",
    othersDoneTooltip: "someone else's laundry · waiting for its owner",
    doneAt: (o: { time: string }) => `done at ${o.time}`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name} cycle, ${o.minutes} minutes`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `turn · ${o.minutes} min → ${o.nextMinutes} min`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name} start, ${o.minutes} minute ${o.kind === "washer" ? "wash" : "dry"}${o.canNotify ? ", notifies you when done" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `start · ${o.minutes} min ${o.kind === "washer" ? "wash" : "dry"}${o.canNotify ? " · notifies you" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, remind me when the ${o.kind === "washer" ? "wash" : "dry"} is done`,
    remindTooltip: (o: { doneAt: string }) => `remind me · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) => `${o.name} start, ${o.reminderOn ? "reminder on, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `reminder on · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name} start`,
    loadFirstTooltip: "load laundry first",
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "washing" : "drying"} · ${o.doneAt}`,
    doneDoorTooltip: "open door · take laundry out",
    loadedDoorTooltip: "open door · take laundry back out",
    loadableDoorTooltip: "load laundry",
    doorLabel: (o: { name: string }) => `${o.name} door`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name} door, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `Welcome mat, take your ${o.laundry === "folded" ? "dry" : "washed"} laundry home`,
    readyTooltip: "head home · take your laundry with you",
    waitingLabel: "Welcome mat, the way home once your laundry is done",
    waitingTooltip: "the way home · finish your laundry first",
  },
  laundryBasket: {
    labels: {
      empty: "Laundry basket, empty",
      dirty: "Laundry basket, clothes to wash",
      wet: "Laundry basket, wet clothes to dry",
      folded: "Laundry basket, clean dry clothes",
    },
    tooltips: {
      empty: "basket · empty",
      dirty: "dirty clothes · into a washer",
      wet: "wet clothes · into a dryer",
      folded: "clean and dry · ready to go home",
    },
  },
  coffee: {
    machineLabel: "Coffee machine",
    brewingMachineLabel: "Coffee machine, brewing",
    brewingTooltip: "brewing…",
    idleSwitchLabel: "Coffee machine switch, brew a coffee",
    idleSwitchTooltip: "brew a coffee",
    brewingSwitchLabel: "Coffee machine switch, brewing",
    readyMachineLabel: "Coffee machine, coffee in the flask",
    readyMachineTooltip: "coffee's ready",
    topUpSwitchLabel: "Coffee machine switch, top up the flask",
    topUpSwitchTooltip: "top up the flask",
    fullSwitchLabel: "Coffee machine switch, the flask is full",
    fullSwitchTooltip: "flask is full · pour a cup first",
    emptyFlaskLabel: "Coffee flask, empty",
    emptyFlaskTooltip: "flask is empty",
    brewingFlaskLabel: "Coffee flask, brewing",
    othersBrewingMachineLabel: "Coffee machine, someone else is brewing",
    othersBrewingSwitchLabel: "Coffee machine switch, someone else is brewing",
    othersBrewingFlaskLabel: "Coffee flask, someone else is brewing",
    othersBrewingTooltip: (o: { time: string }) =>
      `someone else is brewing · done at ${o.time}`,
    pourLabel: "Coffee flask, pour a cup",
    pourTooltip: "pour a cup",
    cupFullFlaskLabel: "Coffee flask, finish your cup first",
    cupFullFlaskTooltip: "finish your cup first",
    fullCupLabel: "Coffee cup, drink",
    fullCupTooltip: "drink",
    emptyCupLabel: "Coffee cup, empty",
    emptyCupTooltip: "empty cup",
  },
  plant: {
    label: "Plant, touch grass",
    tooltip: "touch grass",
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Tube counter, ${o.count === 1 ? "just you here" : `${o.count} people here`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "just you here" : `${o.count} people here`,
    offLabel: "Tube counter, off",
    offTooltip: "off",
  },
  tv: {
    stations: {
      "rainy-cafe": "rainy café",
      "piano-night": "piano night",
      "late-wash": "late wash",
      "tape-hiss": "tape hiss",
      "city-at-3am": "city at 3 a.m.",
    } satisfies { [id in TvStationId]: string },
    station: (o: { channel: string; name: string }) =>
      `ch ${o.channel} · ${o.name}`,
    offLabel: "TV, off",
    offTooltip: "tv · off",
    onLabel: (o: { station: string }) => `TV, on, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `TV screen, ${o.station}, watch on YouTube`,
    screenOnTooltip: "watch on YouTube ↗",
    screenOffLabel: "TV screen, off, turn on",
    turnOn: "turn on",
    tunerLabel: (o: { station: string }) => `TV channel, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) => `next station · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `TV volume, ${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `volume · ${o.percent}%`,
    powerOnLabel: "TV power, on, turn off",
    turnOff: "turn off",
    powerOffLabel: "TV power, off, turn on",
    noSignal: "no signal",
  },
  shelf: {
    loadingLabel: "Shelf, checking for filled notebooks",
    loadingTooltip: "checking the shelf…",
    offlineLabel: "Shelf, offline at the moment",
    offlineTooltip: "the shelf is offline at the moment",
    emptyLabel: "Shelf, no filled notebooks yet",
    emptyTooltip: "no filled notebooks yet",
    readyLabel: "Look at the shelf of filled notebooks",
    bookCount: (o: { count: number }) =>
      o.count === 1 ? "1 filled notebook" : `${o.count} filled notebooks`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `Open notebook No. ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) =>
      `${o.count} ${o.count === 1 ? "entry" : "entries"}`,
  },
  notebook: {
    objectLabel: "Open the notebook",
    objectTooltip: "notes from strangers",
    number: (o: { number: number }) => `No. ${o.number}`,
    dialogLabel: (o: { number: number }) => `Notebook No. ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `since ${o.day}`,
    insideCover: "inside cover",
    insideCoverAndPage: (o: { page: number }) => `inside cover · p. ${o.page}`,
    page: (o: { page: number }) => `p. ${o.page}`,
    pages: (o: { left: number; right: number }) => `pp. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `Page ${o.page}, go to another page`,
    previousPage: "Previous page",
    nextPage: "Next page",
    scrubberLabel: "Page",
    goToPage: "go to page",
    pageInputLabel: (o: { pageCount: number }) =>
      `Page number, 1 to ${o.pageCount}`,
    report: "report",
    reported: "reported",
    opening: "opening the notebook…",
    missing: (o: { number: number }) => `there is no notebook No. ${o.number}`,
    full: (o: { number: number }) =>
      `notebook No. ${o.number} is full · read only`,
    someoneWritingInNotebook:
      "someone is writing in the notebook · wait your turn",
    someoneWriting: "someone is writing right now · wait your turn",
    startsNext: (o: { number: number }) =>
      `this note starts notebook No. ${o.number}`,
    writePromptBeforeKeys: "write a note for the next person · ",
    writePromptAfterKeys: " to save it",
    textareaLabel: "Write a note in the notebook",
    notifyWhenFree: "tell me when it's free",
    notifyPending: "we'll let you know",
    saveNote: "save my note",
    savingNote: "saving…",
    close: "close",
    freeNotificationTitle: "the notebook is free",
    freeNotificationBody: "your turn to write",
    leaveFailures: {
      offline: "notebook is offline at the moment · your note stays here",
      rate_limited: "one note every two minutes · try again soon",
      daily_limit_reached: "that's enough notes for today · come back tomorrow",
      contains_link: "no links in the notebook",
      too_long: "too long for the notebook · shorten it a little",
      sign_off_too_long: "the sign-off is too long",
      empty_body: "write something first",
      unknown: "something went wrong · try again",
    } satisfies { [reason in LeaveEntryFailureReason]: string },
  },
  firstVisit: {
    garments: {
      tee: "t-shirt",
      jeans: "jeans",
      sweater: "sweater",
      towel: "towel",
      socks: "socks",
      shirt: "shirt",
    } satisfies { [kind in GarmentKind]: string },
    garmentLabel: (o: { garment: string }) =>
      `Put the ${o.garment} in the basket`,
    basketEmpty: "toss the clothes from the floor in here",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.count} of ${o.total} in · add more, or head to the door`,
    basketFull: "all in · head to the door",
    lampOffTooltip: "turn the lamp off",
    lampOnTooltip: "turn the lamp on",
    lampOffLabel: "Turn the lamp off",
    lampOnLabel: "Turn the lamp on",
    doorReadyTooltip: "carry it to the laundromat",
    doorWaitingTooltip: "pick up your laundry first",
    doorReadyLabel: "Carry the basket to the laundromat",
    doorWaitingLabel: "Door to the laundromat, pick up your laundry first",
    justListen: "just listen →",
  },
} satisfies { locale: LaundromatLocale; [key: string]: unknown };
