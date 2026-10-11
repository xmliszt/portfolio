import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

function pluralize(o: {
  count: number;
  one: string;
  few: string;
  many: string;
}) {
  const form = new Intl.PluralRules("pl").select(o.count);
  return form === "one" ? o.one : form === "few" ? o.few : o.many;
}

function minutesFor(count: number) {
  return pluralize({ count, one: "minutę", few: "minuty", many: "minut" });
}

export const pl = {
  locale: "pl",
  languageName: "Polski",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: spokojne miejsce do skupienia w przeglądarce",
    description:
      "Spokojna pralnia w przeglądarce. Zrób pranie jako timer skupienia, włącz lo-fi w telewizorze, zaparz kawę i zostaw liścik we wspólnym notesie.",
    intro:
      "Spokojna pralnia w przeglądarce. Uruchom pralkę albo suszarkę na 5 do 60 minut jako timer skupienia i dostań powiadomienie, gdy skończy, włącz stacje lo-fi w telewizorze, zaparz kawę i zostaw odręczny liścik we wspólnym notesie. Zapełnione notesy trafiają na półkę.",
    keywords: [
      "pralnia",
      "timer skupienia",
      "pomodoro",
      "lo-fi",
      "przytulnie",
      "izometryczny",
      "interaktywny",
      "wspólny notes",
    ],
    openGraphLocale: "pl_PL",
  },
  toolbar: {
    soundOn: "dźwięk wł.",
    soundOff: "dźwięk wył.",
    share: "udostępnij",
    linkCopied: "link skopiowany",
    shareText:
      "Spokojna pralnia w przeglądarce. Wrzuć pranie, niech timer leci, i poczytaj liściki, które zostawili inni.",
    language: "Język",
  },
  tabDone: "gotowe",
  readoutDone: "gotowe",
  matWelcome: "witaj",
  machine: {
    name: (machine) =>
      `${machine.kind === "washer" ? "Pralka" : "Suszarka"} ${machine.number}`,
    freeLabel: (o) => `${o.name}, wolna`,
    freeTooltip: (o) => `${o.name} · wolna`,
    loadedLabel: (o) => `${o.name}, załadowana, gotowa do startu`,
    loadedTooltip: (o) => `${o.name} · załadowana`,
    runningLabel: (o) =>
      `${o.name}, ${o.kind === "washer" ? "pierze" : "suszy"}, zostało ${o.remaining}`,
    runningTooltip: (o) =>
      `${o.kind === "washer" ? "pranie" : "suszenie"} · gotowe o ${o.time}`,
    doneLabel: (o) => `${o.name}, gotowe, wyjmij pranie`,
    doneTooltip: (o) => `${o.name} · gotowe`,
    othersRunningLabel: (o) =>
      `${o.name}, ${o.kind === "washer" ? "pierze" : "suszy"} cudze pranie, zostało ${o.remaining}`,
    othersRunningTooltip: (o) =>
      `ktoś ${o.kind === "washer" ? "pierze" : "suszy"} · gotowe o ${o.time}`,
    othersDoneLabel: (o) => `${o.name}, cudze pranie jest gotowe`,
    othersDoneTooltip: (o) => `${o.name} · cudze, gotowe`,
    doneNotificationTitle: (o) => `${o.name} · gotowe`,
    doneNotificationBody: (o) =>
      o.kind === "washer"
        ? "wyjmij pranie i wybierz suszarkę"
        : "twoje pranie jest suche",
  },
  machineControl: {
    controlInUseLabel: (o) =>
      `${{ dial: "Pokrętło", start: "Przycisk start", door: "Drzwiczki" }[o.control]} (${o.name}), w użyciu przez kogoś innego`,
    othersRunningTooltip: (o) =>
      `cudze ${o.kind === "washer" ? "pranie" : "suszenie"} · gotowe o ${o.time}`,
    othersDoneTooltip: "cudze pranie · czeka na właściciela",
    doneAt: (o) => `gotowe o ${o.time}`,
    dialLabel: (o) =>
      `${o.name}, program na ${o.minutes} ${minutesFor(o.minutes)}`,
    dialTooltip: (o) => `obróć · ${o.minutes} min → ${o.nextMinutes} min`,
    startLabel: (o) =>
      `${o.name}, start, ${o.kind === "washer" ? "pranie" : "suszenie"} na ${o.minutes} ${minutesFor(o.minutes)}${o.canNotify ? ", powiadomi cię, gdy skończy" : ""}`,
    startTooltip: (o) =>
      `start · ${o.kind === "washer" ? "pranie" : "suszenie"} ${o.minutes} min${o.canNotify ? " · z powiadomieniem" : ""}`,
    remindLabel: (o) =>
      `${o.name}, przypomnij mi, gdy ${o.kind === "washer" ? "pranie" : "suszenie"} się skończy`,
    remindTooltip: (o) => `przypomnij mi · ${o.doneAt}`,
    runningStartLabel: (o) =>
      `${o.name}, start, ${o.reminderOn ? "przypomnienie włączone, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o) => `przypomnienie włączone · ${o.doneAt}`,
    idleStartLabel: (o) => `${o.name}, start`,
    loadFirstTooltip: "najpierw włóż pranie",
    runningDoorTooltip: (o) =>
      `${o.kind === "washer" ? "pranie" : "suszenie"} · ${o.doneAt}`,
    doneDoorTooltip: "otwórz drzwiczki · wyjmij pranie",
    loadedDoorTooltip: "otwórz drzwiczki · wyjmij pranie z powrotem",
    loadableDoorTooltip: "włóż pranie",
    doorLabel: (o) => `${o.name}, drzwiczki`,
    doorLabelWithHint: (o) => `${o.name}, drzwiczki, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o) =>
      `Wycieraczka, zabierz ${o.laundry === "folded" ? "suche" : "uprane"} pranie do domu`,
    readyTooltip: "do domu · zabierz pranie ze sobą",
    waitingLabel: "Wycieraczka, droga do domu, gdy pranie będzie gotowe",
    waitingTooltip: "droga do domu · najpierw skończ pranie",
  },
  coffee: {
    machineLabel: "Ekspres do kawy",
    brewingMachineLabel: "Ekspres do kawy, parzy",
    brewingTooltip: "parzy się…",
    hotMachineLabel: "Ekspres do kawy, na stole stoi gorąca kawa",
    hotMachineTooltip: "kawa na stole",
    idleSwitchLabel: "Włącznik ekspresu, zaparz kawę",
    idleSwitchTooltip: "zaparz kawę",
    brewingSwitchLabel: "Włącznik ekspresu, parzy",
    hotSwitchLabel: "Włącznik ekspresu, zaparz kolejną kawę",
    hotSwitchTooltip: "jeszcze jedną",
  },
  tv: {
    stations: {
      "rainy-cafe": "deszczowa kawiarnia",
      "piano-night": "nocne pianino",
      "late-wash": "późne pranie",
      "tape-hiss": "szum taśmy",
      "city-at-3am": "miasto o trzeciej w nocy",
    },
    station: (o) => `kan. ${o.channel} · ${o.name}`,
    offLabel: "Telewizor, wyłączony",
    offTooltip: "tv · wył.",
    onLabel: (o) => `Telewizor, włączony, ${o.station}`,
    screenOnLabel: (o) => `Ekran telewizora, ${o.station}, oglądaj na YouTube`,
    screenOnTooltip: "oglądaj na YouTube ↗",
    screenOffLabel: "Ekran telewizora, wyłączony, włącz",
    turnOn: "włącz",
    tunerLabel: (o) => `Kanał telewizora, ${o.station}`,
    tunerTooltip: (o) => `następna stacja · ${o.nextName}`,
    volumeLabel: (o) => `Głośność telewizora, ${o.percent}%`,
    volumeTooltip: (o) => `głośność · ${o.percent}%`,
    powerOnLabel: "Zasilanie telewizora, włączony, wyłącz",
    turnOff: "wyłącz",
    powerOffLabel: "Zasilanie telewizora, wyłączony, włącz",
    noSignal: "brak sygnału",
  },
  shelf: {
    loadingLabel: "Półka, szukamy zapełnionych notesów",
    loadingTooltip: "zaglądamy na półkę…",
    offlineLabel: "Półka, chwilowo offline",
    offlineTooltip: "półka jest chwilowo offline",
    emptyLabel: "Półka, jeszcze brak zapełnionych notesów",
    emptyTooltip: "jeszcze brak zapełnionych notesów",
    readyLabel: "Zobacz półkę z zapełnionymi notesami",
    bookCount: (o) =>
      `${o.count} ${pluralize({ count: o.count, one: "zapełniony notes", few: "zapełnione notesy", many: "zapełnionych notesów" })}`,
    bookLabel: (o) => `Otwórz notes nr ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o) =>
      `${o.count} ${pluralize({ count: o.count, one: "wpis", few: "wpisy", many: "wpisów" })}`,
  },
  notebook: {
    objectLabel: "Otwórz notes",
    objectTooltip: "liściki od nieznajomych",
    number: (o) => `Nr ${o.number}`,
    dialogLabel: (o) => `Notes nr ${o.number}`,
    daySpan: (o) => `${o.from} – ${o.to}`,
    since: (o) => `od ${o.day}`,
    insideCover: "wewnętrzna okładka",
    insideCoverAndPage: (o) => `wewnętrzna okładka · s. ${o.page}`,
    page: (o) => `s. ${o.page}`,
    pages: (o) => `s. ${o.left}–${o.right}`,
    pageButtonLabel: (o) => `Strona ${o.page}, przejdź do innej strony`,
    previousPage: "Poprzednia strona",
    nextPage: "Następna strona",
    scrubberLabel: "Strona",
    goToPage: "przejdź do strony",
    pageInputLabel: (o) => `Numer strony, od 1 do ${o.pageCount}`,
    report: "zgłoś",
    reported: "zgłoszono",
    opening: "otwieram notes…",
    missing: (o) => `nie ma notesu nr ${o.number}`,
    full: (o) => `notes nr ${o.number} jest pełny · tylko do odczytu`,
    someoneWritingInNotebook: "ktoś pisze w notesie · poczekaj na swoją kolej",
    someoneWriting: "ktoś właśnie pisze · poczekaj na swoją kolej",
    startsNext: (o) => `ten liścik zaczyna notes nr ${o.number}`,
    writePromptBeforeKeys: "napisz liścik dla następnej osoby · ",
    writePromptAfterKeys: ", by go zapisać",
    textareaLabel: "Napisz liścik w notesie",
    notifyWhenFree: "daj znać, gdy będzie wolny",
    notifyPending: "damy ci znać",
    saveNote: "zapisz liścik",
    savingNote: "zapisuję…",
    close: "zamknij",
    freeNotificationTitle: "notes jest wolny",
    freeNotificationBody: "twoja kolej, by pisać",
    leaveFailures: {
      offline: "notes jest chwilowo offline · twój liścik zostaje tutaj",
      rate_limited: "jeden liścik co dwie minuty · spróbuj za chwilę",
      daily_limit_reached: "dość liścików na dziś · wróć jutro",
      contains_link: "żadnych linków w notesie",
      too_long: "za długie na notes · skróć trochę",
      sign_off_too_long: "podpis jest za długi",
      empty_body: "najpierw coś napisz",
      unknown: "coś poszło nie tak · spróbuj ponownie",
    },
  },
  firstVisit: {
    garments: {
      tee: "koszulka",
      jeans: "dżinsy",
      sweater: "sweter",
      towel: "ręcznik",
      socks: "skarpetki",
      shirt: "koszula",
    },
    garmentLabel: (o) => `Włóż do kosza: ${o.garment}`,
    basketEmpty: "wrzuć tu ubrania z podłogi",
    basketPartial: (o) =>
      `${o.count} z ${o.total} w koszu · dorzuć więcej albo idź do drzwi`,
    basketFull: "wszystko w koszu · idź do drzwi",
    lampOffTooltip: "zgaś lampę",
    lampOnTooltip: "zapal lampę",
    lampOffLabel: "Zgaś lampę",
    lampOnLabel: "Zapal lampę",
    doorReadyTooltip: "zanieś do pralni",
    doorWaitingTooltip: "najpierw zbierz pranie",
    doorReadyLabel: "Zanieś kosz do pralni",
    doorWaitingLabel: "Drzwi do pralni, najpierw zbierz pranie",
    justListen: "po prostu posłuchaj →",
  },
} satisfies LaundromatCopy;
