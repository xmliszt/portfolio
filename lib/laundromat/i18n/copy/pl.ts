import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
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
    title: "laundro.cafe: przytulny timer skupienia w pralni, z lofi",
    description:
      "Zrób pranie jako timer skupienia w spokojnej pralni. Pranie, suszenie, skupienie, lofi, kawa, notes dla nieznajomych albo po prostu odpoczynek. Za darmo, bez rejestracji.",
    intro:
      "Spokojna pralnia w przeglądarce. Uruchom pralkę albo suszarkę na 5 do 60 minut jako timer skupienia i dostań powiadomienie, gdy skończy, włącz stacje lo-fi w telewizorze, zaparz kawę i zostaw odręczny liścik we wspólnym notesie. Zapełnione notesy trafiają na półkę.",
    keywords: [
      "pralnia",
      "timer skupienia",
      "pomodoro",
      "lofi",
      "muzyka do pracy",
      "nauka",
      "przytulnie",
      "wspólny notes",
    ],
    inspiredBy: "inspiracja",
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
    settings: "ustawienia",
    builtBy: "zrobione z ❤️ przez Li Yuxuan",
    updateAvailable: "odśwież — pralnia zaktualizowana",
  },
  settings: {
    heading: "ustawienia",
    rendering: "renderowanie",
    renderingHint:
      "lite wyłącza miękkie światło, kołysanie rośliny i przybliżenie do notesu i tablicy. pomaga na wolniejszych urządzeniach albo gdy brakuje pamięci.",
    qualityAuto: "auto",
    qualityAutoHint: (o: { quality: string }) =>
      `na tym urządzeniu: ${o.quality}`,
    qualityFull: "pełny",
    qualityFullHint: "całe światło i ruch",
    qualityLite: "lite",
    qualityLiteHint: "lżejszy dla pamięci i baterii",
    close: "zamknij",
    closeHint: "esc, aby zamknąć",
    roomSounds: "dźwięki w pralni",
    roomSoundsHint:
      "dźwięki pralni i ludzi, którzy w niej są. wyłączenie dźwięku wycisza go tylko dla ciebie.",
    roomSoundsAllOn: "włącz wszystkie",
    roomSoundsAllOff: "wyłącz wszystkie",
    roomSoundOn: "wł.",
    roomSoundOff: "wył.",
    roomSound: {
      machines: { label: "maszyny", hint: "kręcące się pralki i suszarki" },
      "shop-bell": { label: "dzwonek", hint: "dzwoni, gdy ktoś wchodzi" },
      unloading: {
        label: "wyjmowanie",
        hint: "zatrzask drzwiczek, gdy ktoś odbiera pranie",
      },
      coffee: {
        label: "kawa",
        hint: "bulgotanie przy parzeniu i piknięcie, gdy gotowa",
      },
      tv: { label: "szum telewizora", hint: "szum telewizora bez sygnału" },
      lamp: {
        label: "lampa",
        hint: "lampa migocze przy włączaniu i klika przy wyłączaniu",
      },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
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
    othersLoadedLabel: (o) => `${o.name}, w środku jest pranie kogoś innego`,
    othersLoadedTooltip: (o) =>
      `${o.name} · pranie kogoś innego, nieuruchomione`,
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
    othersLoadedTooltip: "pranie kogoś innego · jeszcze nieuruchomione",
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
    needsWashingTooltip: "najpierw wypierz",
    alreadyWashedTooltip: "już wyprane · teraz suszenie",
    alreadyDryTooltip: "już suche · zabierz do domu",
    elsewhereLoadedTooltip: (o) => `twoje pranie czeka w: ${o.name}`,
    elsewhereRunningTooltip: (o) =>
      o.kind === "washer"
        ? "twoje ubrania wciąż się piorą"
        : "twoje ubrania wciąż schną",
    elsewhereDoneTooltip: (o) => `twoje pranie gotowe · ${o.name}`,
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
    readyTooltip: "wróć do domu · weź czyste pranie ze sobą",
    awayLabel: "Wycieraczka, wróć do domu i zostaw pranie w maszynie",
    awayTooltip: "wróć do domu · pranie zostaje w maszynie",
    wetLabel: "Wycieraczka, wróć do domu z mokrym praniem",
    wetTooltip: "wróć do domu · ubrania są jeszcze mokre",
    dirtyLabel: "Wycieraczka, włóż ubrania do pralki przed powrotem do domu",
    dirtyTooltip: "najpierw wypierz · włóż ubrania do pralki",
  },
  laundryBasket: {
    labels: {
      empty: "Kosz na pranie, pusty",
      dirty: "Kosz na pranie, rzeczy do prania",
      wet: "Kosz na pranie, mokre rzeczy do suszenia",
      folded: "Kosz na pranie, czyste suche rzeczy",
    },
    tooltips: {
      empty: "kosz · pusty",
      dirty: "brudne rzeczy · do pralki",
      wet: "mokre rzeczy · do suszarki",
      folded: "czyste i suche · gotowe do domu",
    },
  },
  coffee: {
    machineLabel: "Ekspres do kawy",
    brewingMachineLabel: "Ekspres do kawy, parzy",
    brewingTooltip: "parzy się…",
    idleSwitchLabel: "Włącznik ekspresu, zaparz kawę",
    idleSwitchTooltip: "zaparz kawę",
    brewingSwitchLabel: "Włącznik ekspresu, parzy",
    readyMachineLabel: "Ekspres do kawy, kawa w dzbanku",
    readyMachineTooltip: "kawa gotowa",
    topUpSwitchLabel: "Włącznik ekspresu, dolej do dzbanka",
    topUpSwitchTooltip: "dolej do dzbanka",
    fullSwitchLabel: "Włącznik ekspresu, dzbanek jest pełny",
    fullSwitchTooltip: "dzbanek pełny · najpierw nalej filiżankę",
    emptyFlaskLabel: "Dzbanek z kawą, pusty",
    emptyFlaskTooltip: "dzbanek jest pusty",
    brewingFlaskLabel: "Dzbanek z kawą, parzy",
    othersBrewingMachineLabel: "Ekspres do kawy, ktoś parzy kawę",
    othersBrewingSwitchLabel: "Włącznik ekspresu, ktoś parzy kawę",
    othersBrewingFlaskLabel: "Dzbanek z kawą, ktoś parzy kawę",
    othersBrewingTooltip: (o: { time: string }) =>
      `ktoś parzy kawę · gotowe o ${o.time}`,
    pourLabel: "Dzbanek z kawą, nalej filiżankę",
    pourTooltip: "nalej filiżankę",
    cupFullFlaskLabel: "Dzbanek z kawą, najpierw dopij filiżankę",
    cupFullFlaskTooltip: "najpierw dopij",
    fullCupLabel: "Filiżanka kawy, wypij",
    fullCupTooltip: "wypij",
    emptyCupLabel: "Filiżanka kawy, pusta",
    emptyCupTooltip: "pusta filiżanka",
  },
  plant: {
    label: "Roślina, dotknij trawy",
    tooltip: "dotknij trawy",
  },
  board: {
    label: "Tablica, co nowego w pralni",
    tooltip: "co nowego",
    eyebrow: "tablica ogłoszeń",
    heading: "co nowego",
    subtitle: "Drobne zmiany w pralni, od najnowszych.",
    updated: (o: { date: string }) => `zaktualizowano ${o.date}`,
    footer: "zawsze otwarte, 24/7",
    close: "zamknij",
    closeHint: "esc, aby zamknąć",
    tags: {
      opening: "otwarcie",
      tv: "tv",
      notebook: "notes",
      languages: "języki",
      room: "sala",
      coffee: "kawa",
      window: "okno",
      light: "światło",
      board: "tablica",
    },
    updates: {
      "room-sound-dials": {
        title: "wybierz, co słyszysz",
        body: "W ustawieniach jest teraz pokrętło dla każdego dźwięku w pralni, od maszyn po dzwonek. Wyłącz te, których wolisz nie słyszeć. Dla innych pralnia zostaje taka sama.",
      },
      "home-mid-wash": {
        title: "wróć do domu w trakcie prania",
        body: "Stań na wycieraczce, żeby wrócić do domu, gdy pranie trwa. Mokre ubrania wracają w koszu, suche lądują na łóżku.",
      },
      "bedroom-curtains": {
        title: "zasłony i nowa lampa w domu",
        body: "Kliknij zasłony albo lampę w swoim pokoju. Oba pomieszczenia jaśnieją i ciemnieją teraz razem ze słońcem, księżycem i lampami.",
      },
      "settings-lite": {
        title: "ustawienia i tryb lekki",
        body: "Zębatka na pasku otwiera ustawienia. Na wolniejszych urządzeniach wybierz tryb lekki, żeby oszczędzać pamięć i baterię.",
      },
      "door-bell": {
        title: "dzwonek przy drzwiach",
        body: "Mały dzwonek dzwoni, gdy wchodzisz, i za każdym razem, gdy wchodzi ktoś inny.",
      },
      "whats-new-board": {
        title: "tablica z nowościami",
        body: "Ten stojak pokazuje, co nowego. W dzień spokojny jak papier, nocą świeci.",
      },
      "twelve-stations": {
        title: "dwanaście stacji w telewizorze",
        body: "Siedem nowych radiów lofi wypełnia pokrętło, od czytelni po głęboki kosmos.",
      },
      "page-drag": {
        title: "przewracanie stron przeciąganiem",
        body: "Przeciągnij w dowolnym miejscu zewnętrznej krawędzi strony, aby ją przewrócić.",
      },
      "window-light": {
        title: "słońce przez okno",
        body: "Światło dnia sięga maszyn i podłogi, a o wschodzie i zachodzie robi się ciepłe.",
      },
      "shared-coffee": {
        title: "wspólny dzbanek kawy",
        body: "Do siedmiu osób może nalewać z tego samego dzbanka.",
      },
      "street-view": {
        title: "ulica za oknem",
        body: "Okno wychodzi na ulicę oświetloną słońcem albo księżycem.",
      },
      "tube-counter": {
        title: "kto tu jest",
        body: "Lampy na tylnej ścianie liczą wszystkich w pralni, razem z tobą.",
      },
      "coffee-counter": {
        title: "kawa na ladzie",
        body: "Zaparz dzbanek, nalej filiżankę i pij, gdy pranie się kręci.",
      },
      "shared-machines": {
        title: "inni też piorą",
        body: "Zobacz, których maszyn używają inni. Ich pranie zostaje na miejscu, gdy wkładasz swoje.",
      },
      "eighteen-languages": {
        title: "otwarte w 18 językach",
        body: "Cała pralnia mówi twoim językiem. Zmienisz go globusem w rogu.",
      },
      "shared-notebook": {
        title: "notes dla nieznajomych",
        body: "Zostaw notkę dla kolejnej osoby. Zapełnione notesy trafiają na półkę.",
      },
      "lofi-tv": {
        title: "lofi w telewizorze",
        body: "Włącz telewizor, by słuchać radia lofi, z pokrętłem stacji i głośności.",
      },
      opening: {
        title: "laundro.cafe otwarte",
        body: "Cicha pralnia w przeglądarce: pierz, susz i skup się na 5 do 60 minut.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Licznik lampowy, ${o.count === 1 ? "tylko ty tutaj" : `${o.count} ${pluralize({ count: o.count, one: "osoba", few: "osoby", many: "osób" })} tutaj`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1
        ? "tylko ty tutaj"
        : `${o.count} ${pluralize({ count: o.count, one: "osoba", few: "osoby", many: "osób" })} tutaj`,
    offLabel: "Licznik lampowy, wyłączony",
    offTooltip: "wyłączony",
  },
  tv: {
    stations: {
      "rainy-cafe": "deszczowa kawiarnia",
      "piano-night": "nocne pianino",
      "late-wash": "późne pranie",
      "tape-hiss": "szum taśmy",
      "city-at-3am": "miasto o trzeciej w nocy",
      "study-hall": "czytelnia",
      "smoky-jazz": "zadymiony jazz",
      fireplace: "kominek",
      "neon-tokyo": "neonowe tokio",
      "string-quartet": "kwartet smyczkowy",
      "porch-guitar": "gitara na ganku",
      "deep-space": "głęboki kosmos",
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
    comeBackToWrite: "wróć za dwie minuty, żeby napisać kolejny",
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
    basketWet: "ubrania są jeszcze mokre · wysusz je w pralni",
    lampOffTooltip: "zgaś lampę",
    lampOnTooltip: "zapal lampę",
    lampOffLabel: "Zgaś lampę",
    lampOnLabel: "Zapal lampę",
    curtainCloseTooltip: "zasuń zasłony",
    curtainOpenTooltip: "odsuń zasłony",
    curtainCloseLabel: "Zasuń zasłony",
    curtainOpenLabel: "Odsuń zasłony",
    bedTooltip: "iść spać",
    bedLabel: "Iść spać",
    goodNight: "Dobranoc",
    notSleepy: "już nie chcę spać",
    doorReadyTooltip: "zanieś do pralni",
    doorWaitingTooltip: "najpierw zbierz pranie",
    doorAwayTooltip: "wróć do pralni · pranie jest w maszynie",
    doorAwayLabel: "Wróć do pralni, pranie jest jeszcze w maszynie",
    doorReadyLabel: "Zanieś kosz do pralni",
    doorWaitingLabel: "Drzwi do pralni, najpierw zbierz pranie",
    justListen: "po prostu posłuchaj →",
  },
} satisfies LaundromatCopy;
