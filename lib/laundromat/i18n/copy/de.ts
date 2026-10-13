import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const de = {
  locale: "de",
  languageName: "Deutsch",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: gemütlicher Fokus-Timer im Waschsalon, mit Lofi",
    description:
      "Wasch deine Wäsche als Fokus-Timer in einem ruhigen Waschsalon. Waschen, trocknen, fokussieren, Lofi, Kaffee, ein Notizbuch für Fremde oder einfach abschalten. Kostenlos, ohne Anmeldung.",
    intro:
      "Ein ruhiger Waschsalon in deinem Browser. Starte eine Waschmaschine oder einen Trockner für 5 bis 60 Minuten als Fokus-Timer und bekomm eine Benachrichtigung, wenn er fertig ist, hör Lo-Fi-Sender im Fernseher, koch dir einen Kaffee und hinterlass eine handgeschriebene Notiz im gemeinsamen Notizbuch. Volle Notizbücher kommen ins Regal.",
    keywords: [
      "Waschsalon",
      "Fokus-Timer",
      "Pomodoro",
      "Lofi",
      "Musik zum Arbeiten",
      "Lernen",
      "gemütlich",
      "gemeinsames Notizbuch",
    ],
    inspiredBy: "inspiriert von",
    openGraphLocale: "de_DE",
  },
  toolbar: {
    soundOn: "Ton an",
    soundOff: "Ton aus",
    share: "teilen",
    linkCopied: "Link kopiert",
    shareText:
      "Ein ruhiger Waschsalon in deinem Browser. Steck eine Ladung rein, lass den Timer laufen und lies die Notizen, die andere hinterlassen haben.",
    language: "Sprache",
    builtBy: "mit ❤️ gebaut von Li Yuxuan",
    updateAvailable: "aktualisiert · neu laden",
  },
  tabDone: "fertig",
  readoutDone: "ende",
  matWelcome: "willkommen",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "Waschmaschine" : "Trockner"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, frei`,
    freeTooltip: (o: { name: string }) => `${o.name} · frei`,
    loadedLabel: (o: { name: string }) =>
      `${o.name}, beladen, bereit zum Starten`,
    loadedTooltip: (o: { name: string }) => `${o.name} · beladen`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, ${o.kind === "washer" ? "wäscht" : "trocknet"}, noch ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "wäscht" : "trocknet"} · fertig um ${o.time}`,
    doneLabel: (o: { name: string }) =>
      `${o.name}, fertig, nimm deine Wäsche heraus`,
    doneTooltip: (o: { name: string }) => `${o.name} · fertig`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, ${o.kind === "washer" ? "wäscht" : "trocknet"} die Wäsche von jemand anderem, noch ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `jemand anderes ${o.kind === "washer" ? "wäscht" : "trocknet"} · fertig um ${o.time}`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, die Wäsche von jemand anderem ist drin`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · Wäsche von jemand anderem, nicht gestartet`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, die Wäsche von jemand anderem ist fertig`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · von jemand anderem, fertig`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · fertig`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "nimm deine Wäsche heraus und such dir einen Trockner aus"
        : "deine Wäsche ist trocken",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name}, ${{ dial: "Drehknopf", start: "Starttaste", door: "Tür" }[o.control]}, wird gerade von jemand anderem benutzt`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "Waschgang" : "Trockengang"} von jemand anderem · fertig um ${o.time}`,
    othersLoadedTooltip: "Wäsche von jemand anderem · noch nicht gestartet",
    othersDoneTooltip:
      "Wäsche von jemand anderem · wartet auf ihre Besitzerin oder ihren Besitzer",
    doneAt: (o: { time: string }) => `fertig um ${o.time}`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name}, Programm, ${o.minutes} Minuten`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `drehen · ${o.minutes} Min. → ${o.nextMinutes} Min.`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name}, starten, ${o.kind === "washer" ? "Waschgang" : "Trockengang"} mit ${o.minutes} Minuten${o.canNotify ? ", benachrichtigt dich, wenn er fertig ist" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `starten · ${o.minutes} Min. ${o.kind === "washer" ? "waschen" : "trocknen"}${o.canNotify ? " · mit Benachrichtigung" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, erinnere mich, wenn der ${o.kind === "washer" ? "Waschgang" : "Trockengang"} fertig ist`,
    remindTooltip: (o: { doneAt: string }) => `erinnere mich · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) =>
      `${o.name}, starten, ${o.reminderOn ? "Erinnerung an, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `Erinnerung an · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name}, starten`,
    loadFirstTooltip: "erst Wäsche einladen",
    needsWashingTooltip: "erst waschen",
    alreadyWashedTooltip: "schon gewaschen · jetzt trocknen",
    alreadyDryTooltip: "schon trocken · nimm sie mit nach Hause",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `deine Wäsche wartet in ${o.name}`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "deine Wäsche wird noch gewaschen"
        : "deine Wäsche trocknet noch",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `deine Wäsche ist fertig · in ${o.name}`,
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "wäscht" : "trocknet"} · ${o.doneAt}`,
    doneDoorTooltip: "Tür öffnen · Wäsche herausnehmen",
    loadedDoorTooltip: "Tür öffnen · Wäsche wieder herausnehmen",
    loadableDoorTooltip: "Wäsche einladen",
    doorLabel: (o: { name: string }) => `${o.name}, Tür`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name}, Tür, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `Fußmatte, nimm deine ${o.laundry === "folded" ? "trockene" : "gewaschene"} Wäsche mit nach Hause`,
    readyTooltip: "nach Hause · nimm deine Wäsche mit",
    waitingLabel:
      "Fußmatte, der Weg nach Hause, sobald deine Wäsche fertig ist",
    waitingTooltip: "der Weg nach Hause · erst die Wäsche fertig machen",
  },
  laundryBasket: {
    labels: {
      empty: "Wäschekorb, leer",
      dirty: "Wäschekorb, Wäsche zum Waschen",
      wet: "Wäschekorb, nasse Wäsche zum Trocknen",
      folded: "Wäschekorb, saubere trockene Wäsche",
    },
    tooltips: {
      empty: "Korb · leer",
      dirty: "schmutzige Wäsche · ab in die Waschmaschine",
      wet: "nasse Wäsche · ab in den Trockner",
      folded: "sauber und trocken · bereit für zu Hause",
    },
  },
  coffee: {
    machineLabel: "Kaffeemaschine",
    brewingMachineLabel: "Kaffeemaschine, Kaffee läuft durch",
    brewingTooltip: "Kaffee läuft…",
    idleSwitchLabel: "Schalter der Kaffeemaschine, Kaffee kochen",
    idleSwitchTooltip: "Kaffee kochen",
    brewingSwitchLabel: "Schalter der Kaffeemaschine, Kaffee läuft durch",
    readyMachineLabel: "Kaffeemaschine, Kaffee in der Kanne",
    readyMachineTooltip: "Kaffee ist fertig",
    topUpSwitchLabel: "Schalter der Kaffeemaschine, Kanne auffüllen",
    topUpSwitchTooltip: "Kanne auffüllen",
    fullSwitchLabel: "Schalter der Kaffeemaschine, die Kanne ist voll",
    fullSwitchTooltip: "Kanne ist voll · erst eine Tasse einschenken",
    emptyFlaskLabel: "Kaffeekanne, leer",
    emptyFlaskTooltip: "Kanne ist leer",
    brewingFlaskLabel: "Kaffeekanne, Kaffee läuft durch",
    othersBrewingMachineLabel: "Kaffeemaschine, jemand anderes kocht Kaffee",
    othersBrewingSwitchLabel:
      "Schalter der Kaffeemaschine, jemand anderes kocht Kaffee",
    othersBrewingFlaskLabel: "Kaffeekanne, jemand anderes kocht Kaffee",
    othersBrewingTooltip: (o: { time: string }) =>
      `jemand anderes kocht Kaffee · fertig um ${o.time}`,
    pourLabel: "Kaffeekanne, eine Tasse einschenken",
    pourTooltip: "Tasse einschenken",
    cupFullFlaskLabel: "Kaffeekanne, erst die Tasse austrinken",
    cupFullFlaskTooltip: "erst austrinken",
    fullCupLabel: "Kaffeetasse, trinken",
    fullCupTooltip: "trinken",
    emptyCupLabel: "Kaffeetasse, leer",
    emptyCupTooltip: "leere Tasse",
  },
  plant: {
    label: "Pflanze, Gras anfassen",
    tooltip: "Gras anfassen",
  },
  board: {
    label: "Aushang, was es Neues im Waschsalon gibt",
    tooltip: "was gibt's neues",
    eyebrow: "aushang",
    heading: "was gibt's neues",
    subtitle: "Kleine Änderungen im Waschsalon, die neuesten zuerst.",
    updated: (o: { date: string }) => `aktualisiert am ${o.date}`,
    footer: "immer geöffnet, 24/7",
    close: "schließen",
    closeHint: "esc zum schließen",
    tags: {
      opening: "eröffnung",
      tv: "tv",
      notebook: "notizbuch",
      languages: "sprachen",
      room: "raum",
      coffee: "kaffee",
      window: "fenster",
      light: "licht",
      board: "aushang",
    },
    updates: {
      "bedroom-curtains": {
        title: "zieh zu Hause die Vorhänge",
        body: "Klick auf die Vorhänge in deinem Zimmer, um sie auf- oder zuzuziehen. Das Licht im Zimmer folgt, tagsüber die Sonne, nachts der Mond.",
      },
      "door-bell": {
        title: "eine glocke an der tür",
        body: "Ein Glöckchen klingelt, wenn du hereinkommst, und wenn jemand anderes eintritt.",
      },
      "whats-new-board": {
        title: "ein aushang für neuigkeiten",
        body: "Dieser Ständer zeigt, was neu ist. Tagsüber ruht er wie Papier, nachts leuchtet er.",
      },
      "twelve-stations": {
        title: "zwölf sender im fernseher",
        body: "Sieben neue Lofi-Radios füllen die Senderskala, vom Lernsaal bis zum tiefen Weltraum.",
      },
      "page-drag": {
        title: "seiten durch ziehen umblättern",
        body: "Zieh irgendwo am äußeren Rand einer Seite, um sie umzublättern.",
      },
      "window-light": {
        title: "sonnenlicht durchs fenster",
        body: "Tageslicht fällt auf Maschinen und Boden und wird bei Sonnenauf- und -untergang warm.",
      },
      "shared-coffee": {
        title: "eine kanne kaffee teilen",
        body: "Bis zu sieben von euch schenken aus derselben Kanne ein.",
      },
      "street-view": {
        title: "die straße draußen",
        body: "Das Fenster blickt auf die Straße, beschienen von Sonne oder Mond.",
      },
      "tube-counter": {
        title: "ein zähler, wer da ist",
        body: "Die Röhren an der Rückwand zählen alle im Waschsalon, dich eingeschlossen.",
      },
      "coffee-counter": {
        title: "kaffee auf der theke",
        body: "Brüh eine Kanne, schenk dir ein und trink, während die Wäsche läuft.",
      },
      "shared-machines": {
        title: "andere beim waschen",
        body: "Sieh, welche Maschinen andere benutzen. Ihre Wäsche bleibt liegen, wenn du deine einlegst.",
      },
      "eighteen-languages": {
        title: "in 18 sprachen geöffnet",
        body: "Der ganze Waschsalon spricht deine Sprache. Wechsle sie über den Globus in der Ecke.",
      },
      "shared-notebook": {
        title: "ein notizbuch für fremde",
        body: "Hinterlass eine Notiz für die nächste Person. Volle Notizbücher kommen ins Regal.",
      },
      "lofi-tv": {
        title: "lofi im fernseher",
        body: "Schalte den Fernseher für Lofi-Radio ein, mit Senderknopf und Lautstärkeregler.",
      },
      opening: {
        title: "laundro.cafe öffnet",
        body: "Ein stiller Waschsalon im Browser: waschen, trocknen, 5 bis 60 Minuten konzentrieren.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Röhrenzähler, ${o.count === 1 ? "nur du hier" : `${o.count} Leute hier`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "nur du hier" : `${o.count} Leute hier`,
    offLabel: "Röhrenzähler, aus",
    offTooltip: "aus",
  },
  tv: {
    stations: {
      "rainy-cafe": "café im regen",
      "piano-night": "klaviernacht",
      "late-wash": "späte wäsche",
      "tape-hiss": "bandrauschen",
      "city-at-3am": "stadt um 3 uhr nachts",
      "study-hall": "lernsaal",
      "smoky-jazz": "rauchiger jazz",
      fireplace: "kaminfeuer",
      "neon-tokyo": "neon-tokio",
      "string-quartet": "streichquartett",
      "porch-guitar": "gitarre auf der veranda",
      "deep-space": "tiefer weltraum",
    },
    station: (o: { channel: string; name: string }) =>
      `K ${o.channel} · ${o.name}`,
    offLabel: "Fernseher, aus",
    offTooltip: "Fernseher · aus",
    onLabel: (o: { station: string }) => `Fernseher, an, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `Bildschirm, ${o.station}, auf YouTube ansehen`,
    screenOnTooltip: "auf YouTube ansehen ↗",
    screenOffLabel: "Bildschirm, aus, einschalten",
    turnOn: "einschalten",
    tunerLabel: (o: { station: string }) => `Fernsehsender, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) =>
      `nächster Sender · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) =>
      `Lautstärke des Fernsehers, ${o.percent} %`,
    volumeTooltip: (o: { percent: number }) => `Lautstärke · ${o.percent} %`,
    powerOnLabel: "Ein-/Ausschalter des Fernsehers, an, ausschalten",
    turnOff: "ausschalten",
    powerOffLabel: "Ein-/Ausschalter des Fernsehers, aus, einschalten",
    noSignal: "kein Signal",
  },
  shelf: {
    loadingLabel: "Regal, sucht nach vollen Notizbüchern",
    loadingTooltip: "schaue ins Regal…",
    offlineLabel: "Regal, gerade offline",
    offlineTooltip: "das Regal ist gerade offline",
    emptyLabel: "Regal, noch keine vollen Notizbücher",
    emptyTooltip: "noch keine vollen Notizbücher",
    readyLabel: "Das Regal mit den vollen Notizbüchern ansehen",
    bookCount: (o: { count: number }) =>
      o.count === 1 ? "1 volles Notizbuch" : `${o.count} volle Notizbücher`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `Notizbuch Nr. ${o.number} öffnen, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) =>
      `${o.count} ${o.count === 1 ? "Eintrag" : "Einträge"}`,
  },
  notebook: {
    objectLabel: "Das Notizbuch öffnen",
    objectTooltip: "Notizen von Fremden",
    number: (o: { number: number }) => `Nr. ${o.number}`,
    dialogLabel: (o: { number: number }) => `Notizbuch Nr. ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `seit ${o.day}`,
    insideCover: "Innendeckel",
    insideCoverAndPage: (o: { page: number }) => `Innendeckel · S. ${o.page}`,
    page: (o: { page: number }) => `S. ${o.page}`,
    pages: (o: { left: number; right: number }) => `S. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `Seite ${o.page}, zu einer anderen Seite springen`,
    previousPage: "Vorherige Seite",
    nextPage: "Nächste Seite",
    scrubberLabel: "Seite",
    goToPage: "zur Seite",
    pageInputLabel: (o: { pageCount: number }) =>
      `Seitenzahl, 1 bis ${o.pageCount}`,
    report: "melden",
    reported: "gemeldet",
    opening: "Notizbuch wird geöffnet…",
    missing: (o: { number: number }) =>
      `es gibt kein Notizbuch Nr. ${o.number}`,
    full: (o: { number: number }) =>
      `Notizbuch Nr. ${o.number} ist voll · nur lesen`,
    someoneWritingInNotebook:
      "jemand schreibt gerade ins Notizbuch · warte, bis du dran bist",
    someoneWriting: "jemand schreibt gerade · warte, bis du dran bist",
    comeBackToWrite: "komm in zwei Minuten wieder, um noch eine zu schreiben",
    startsNext: (o: { number: number }) =>
      `mit dieser Notiz beginnt Notizbuch Nr. ${o.number}`,
    writePromptBeforeKeys: "schreib eine Notiz für die nächste Person · ",
    writePromptAfterKeys: " zum Speichern",
    textareaLabel: "Eine Notiz ins Notizbuch schreiben",
    notifyWhenFree: "sag mir, wenn es frei ist",
    notifyPending: "wir sagen dir Bescheid",
    saveNote: "Notiz speichern",
    savingNote: "wird gespeichert…",
    close: "schließen",
    freeNotificationTitle: "das Notizbuch ist frei",
    freeNotificationBody: "du bist dran mit Schreiben",
    leaveFailures: {
      offline: "das Notizbuch ist gerade offline · deine Notiz bleibt hier",
      rate_limited: "eine Notiz alle zwei Minuten · versuch es gleich noch mal",
      daily_limit_reached: "genug Notizen für heute · komm morgen wieder",
      contains_link: "keine Links im Notizbuch",
      too_long: "zu lang für das Notizbuch · kürz sie ein bisschen",
      sign_off_too_long: "die Unterschrift ist zu lang",
      empty_body: "schreib zuerst etwas",
      unknown: "etwas ist schiefgelaufen · versuch es noch mal",
    },
  },
  firstVisit: {
    garments: {
      tee: "T-Shirt",
      jeans: "Jeans",
      sweater: "Pullover",
      towel: "Handtuch",
      socks: "Socken",
      shirt: "Hemd",
    },
    garmentLabel: (o: { garment: string }) => `In den Korb legen: ${o.garment}`,
    basketEmpty: "wirf die Kleidung vom Boden hier rein",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.count} von ${o.total} drin · leg mehr rein oder geh zur Tür`,
    basketFull: "alles drin · geh zur Tür",
    lampOffTooltip: "Lampe ausschalten",
    lampOnTooltip: "Lampe einschalten",
    lampOffLabel: "Die Lampe ausschalten",
    lampOnLabel: "Die Lampe einschalten",
    curtainCloseTooltip: "die Vorhänge zuziehen",
    curtainOpenTooltip: "die Vorhänge aufziehen",
    curtainCloseLabel: "Die Vorhänge zuziehen",
    curtainOpenLabel: "Die Vorhänge aufziehen",
    doorReadyTooltip: "zum Waschsalon tragen",
    doorWaitingTooltip: "heb zuerst deine Wäsche auf",
    doorReadyLabel: "Den Korb zum Waschsalon tragen",
    doorWaitingLabel: "Tür zum Waschsalon, heb zuerst deine Wäsche auf",
    justListen: "nur zuhören →",
  },
} satisfies LaundromatCopy;
