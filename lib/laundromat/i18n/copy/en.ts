import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import type {
  BoardTag,
  BoardUpdateId,
} from "@/lib/laundromat/board/board-updates";
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
    shareImage: {
      headline: "a quiet laundromat in your browser.",
      subline:
        "wash, dry, focus, lofi, coffee, a notebook for strangers, or just zone out",
    },
  },
  toolbar: {
    soundOn: "sound on",
    soundOff: "sound off",
    share: "share",
    linkCopied: "link copied",
    shareText:
      "A quiet laundromat in your browser. Put a load in, let the timer run, and read the notes people left behind.",
    language: "Language",
    settings: "settings",
    builtBy: {
      beforeClaude: "built by Li Yuxuan & ",
      afterClaude: " with ❤️",
    },
    updateAvailable: "refresh for updated laundromat",
  },
  settings: {
    heading: "settings",
    rendering: "rendering",
    renderingHint:
      "lite drops the soft lighting, the plant's sway and the zoom into the notebook and board. it helps on slower devices or when memory runs low.",
    qualityAuto: "auto",
    qualityAutoHint: (o: { quality: string }) =>
      `uses ${o.quality} on this device`,
    qualityFull: "full",
    qualityFullHint: "every light and motion",
    qualityLite: "lite",
    qualityLiteHint: "lighter on memory and battery",
    close: "close",
    closeHint: "esc to close",
    temperature: "temperature",
    temperatureHint:
      "the weather panel starts with whatever is usual where you are.",
    roomSounds: "room sounds",
    roomSoundsHint:
      "sounds from the room and the people in it. turning one off or down only changes it for you.",
    roomSoundsAllOn: "all on",
    roomSoundsAllOff: "all off",
    roomSoundOn: "on",
    roomSoundOff: "off",
    roomSoundVolume: (o: { sound: string }) => `${o.sound} volume`,
    roomMix: {
      play: "play the room mix",
      playing: "playing your mix",
      playLabel: "play the room mix at your levels",
      stopLabel: "stop the room mix",
    },
    ticket: {
      heading: "laundry ticket",
      hint: "print a ticket to save your settings as a small file and copy a link to them. open the link, or insert the file here, on any device to get them back.",
      print: "print",
      insert: "insert",
      printLabel:
        "print a laundry ticket, which saves your settings to a file and copies a link to them",
      insertLabel:
        "insert a laundry ticket, which loads your settings from a file",
      ready: "ready",
      printing: "printing…",
      saved: "saved",
      linkCopied: "link copied",
      linkLabel: "link to your laundry ticket",
      copyLink: "copy link",
      copied: "copied",
      linkHint:
        "open this link on another device to bring your settings there.",
      reading: "reading…",
      loaded: "loaded",
      unreadable: "not a ticket",
      title: "laundry ticket",
      number: (o: { number: string }) => `no. ${o.number}`,
      tv: (o: { percent: number }) => `tv ${o.percent}%`,
    },
    roomSound: {
      machines: { label: "machines", hint: "washers and dryers spinning" },
      "shop-bell": { label: "shop bell", hint: "rings when someone walks in" },
      unloading: {
        label: "unloading",
        hint: "a door latch when someone takes their laundry",
      },
      coffee: { label: "coffee", hint: "the brew gurgle and the ready beep" },
      tv: { label: "tv static", hint: "hiss from the tv with no signal" },
      lamp: { label: "lamp", hint: "the lamp flickering on and clicking off" },
      weather: {
        label: "weather",
        hint: "rain and thunder outside the window",
      },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
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
    needsWashingTooltip: "wash it first",
    alreadyWashedTooltip: "already washed · dry it next",
    alreadyDryTooltip: "already dry · take it home",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `your laundry is waiting in ${o.name}`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }): string =>
      o.kind === "washer"
        ? "your clothes are still being washed"
        : "your clothes are still drying",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `your laundry is done · in ${o.name}`,
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
    readyTooltip: "go back home · take your clean laundry with you",
    awayLabel:
      "Welcome mat, go back home and leave your laundry in the machine",
    awayTooltip: "go back home · your laundry stays in the machine",
    wetLabel: "Welcome mat, go back home with the wet laundry",
    wetTooltip: "go back home · the clothes are still wet",
    dirtyLabel: "Welcome mat, put the clothes in a washer before going home",
    dirtyTooltip: "wash it first · put the clothes in a washer",
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
  board: {
    label: "Notice board, what's new at the laundromat",
    tooltip: "what's new",
    eyebrow: "notice board",
    heading: "what's new",
    subtitle: "Small changes around the laundromat, newest first.",
    updated: (o: { date: string }) => `updated ${o.date}`,
    footer: "always open, 24/7",
    close: "close",
    closeHint: "esc to close",
    tags: {
      opening: "opening",
      tv: "tv",
      notebook: "notebook",
      languages: "languages",
      room: "room",
      coffee: "coffee",
      window: "window",
      light: "light",
      board: "board",
    } satisfies { [tag in BoardTag]: string },
    updates: {
      "room-sound-mixer": {
        title: "mix the room your way",
        body: "Each room sound in settings now has its own fader, so the rain can be louder and the machines quieter. Play the room mix to hear them together, and print a laundry ticket to keep your settings or bring them to another device.",
      },
      "weather-panel": {
        title: "the weather, inside and out",
        body: "A panel above the window shows the weather where you are, with today's high and low and the air quality. The windows show it too, rain, snow, fog or a storm, with the sound to match. Your city is a rough guess from your connection. When the air turns unhealthy, an air purifier starts up in the corner.",
      },
      "room-sound-dials": {
        title: "choose the sounds you hear",
        body: "Settings now have a dial for each room sound, from the machines to the shop bell. Turn off any you would rather not hear, and the room stays the same for everyone else.",
      },
      "home-mid-wash": {
        title: "go home while it runs",
        body: "Step on the welcome mat to go home while your laundry runs. Wet clothes come home in the basket, dry ones land on the bed.",
      },
      "bedroom-curtains": {
        title: "curtains and a new lamp at home",
        body: "Click the curtains or the lamp in your room. Both rooms now grow lighter and darker with the sun, the moon and the lamps.",
      },
      "settings-lite": {
        title: "settings and a lite mode",
        body: "The gear in the toolbar opens settings. Switch to lite on slower devices to save memory and battery.",
      },
      "door-bell": {
        title: "a bell on the door",
        body: "A little bell rings when you walk in, and whenever someone else comes in.",
      },
      "whats-new-board": {
        title: "a board for what's new",
        body: "This stand lists what's new. It rests like paper by day and lights up after dark.",
      },
      "twelve-stations": {
        title: "twelve stations on the tv",
        body: "Seven new lofi radios fill the tuner dial, from study hall to deep space.",
      },
      "page-drag": {
        title: "turn pages by dragging",
        body: "Drag anywhere along a page's outer edge to turn it.",
      },
      "window-light": {
        title: "sunlight through the window",
        body: "Daylight reaches the machines and the floor, and turns warm at sunrise and sunset.",
      },
      "shared-coffee": {
        title: "share a pot of coffee",
        body: "Up to seven of you can pour from the same flask.",
      },
      "street-view": {
        title: "the street outside",
        body: "The window looks out on the street, lit by the sun or the moon.",
      },
      "tube-counter": {
        title: "a counter of who's here",
        body: "The tubes on the back wall count everyone in the laundromat, you included.",
      },
      "coffee-counter": {
        title: "coffee on the counter",
        body: "Brew a pot, pour a cup, and drink it while your laundry spins.",
      },
      "shared-machines": {
        title: "others doing laundry",
        body: "See which machines other visitors are using. Their laundry stays put when you load yours.",
      },
      "eighteen-languages": {
        title: "open in 18 languages",
        body: "The whole laundromat speaks your language. Switch it from the globe in the corner.",
      },
      "shared-notebook": {
        title: "a notebook for strangers",
        body: "Leave a note for whoever comes in next. Full notebooks go on the shelf for anyone to read.",
      },
      "lofi-tv": {
        title: "lofi on the tv",
        body: "Turn on the TV for lo-fi radio, with a tuner and a volume knob.",
      },
      opening: {
        title: "laundro.cafe opens",
        body: "A quiet laundromat in your browser: wash, dry, and focus for 5 to 60 minutes.",
      },
    } satisfies { [id in BoardUpdateId]: { title: string; body: string } },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Tube counter, ${o.count === 1 ? "just you here" : `${o.count} people here`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "just you here" : `${o.count} people here`,
    offLabel: "Tube counter, off",
    offTooltip: "off",
  },
  airPurifier: {
    label: (o: { aqi: number }) => `Air purifier, running, AQI ${o.aqi}`,
    tooltip: "air purifier · cleaning the air",
    offLabel: "Air purifier, off",
    offTooltip: "off",
  },
  weatherPanel: {
    conditions: {
      sunny: "sunny",
      clear: "clear",
      cloudy: "cloudy",
      fog: "fog",
      rain: "rain",
      snow: "snow",
      thunder: "thunder",
    },
    outside: "outside",
    high: "H",
    low: "L",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `Weather panel, ${o.temperature} and ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "good",
      moderate: "moderate",
      sensitive: "unhealthy for some",
      unhealthy: "unhealthy",
      veryUnhealthy: "very unhealthy",
      hazardous: "hazardous",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `air quality ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `air ${o.band}`,
    offLabel: "Weather panel, no reading",
    offTooltip: "no reading yet",
  },
  tv: {
    stations: {
      "rainy-cafe": "rainy café",
      "piano-night": "piano night",
      "late-wash": "late wash",
      "tape-hiss": "tape hiss",
      "city-at-3am": "city at 3 a.m.",
      "study-hall": "study hall",
      "smoky-jazz": "smoky jazz",
      fireplace: "fireplace",
      "neon-tokyo": "neon tokyo",
      "string-quartet": "string quartet",
      "porch-guitar": "porch guitar",
      "deep-space": "deep space",
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
    comeBackToWrite: "come back after two minutes to write another one",
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
    basketWet: "the clothes are still wet · dry them at the laundromat",
    lampOffTooltip: "turn the lamp off",
    lampOnTooltip: "turn the lamp on",
    lampOffLabel: "Turn the lamp off",
    lampOnLabel: "Turn the lamp on",
    curtainCloseTooltip: "close the curtains",
    curtainOpenTooltip: "open the curtains",
    curtainCloseLabel: "Close the curtains",
    curtainOpenLabel: "Open the curtains",
    bedTooltip: "go to sleep",
    bedLabel: "Go to sleep",
    goodNight: "Good Night",
    notSleepy: "don't wanna sleep anymore",
    doorReadyTooltip: "carry it to the laundromat",
    doorWaitingTooltip: "pick up your laundry first",
    doorAwayTooltip: "back to the laundromat · your laundry is in the machine",
    doorAwayLabel:
      "Back to the laundromat, your laundry is still in the machine",
    doorReadyLabel: "Carry the basket to the laundromat",
    doorWaitingLabel: "Door to the laundromat, pick up your laundry first",
    justListen: "just listen →",
  },
} satisfies { locale: LaundromatLocale; [key: string]: unknown };
