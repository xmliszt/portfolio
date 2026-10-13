import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

export const nl = {
  locale: "nl",
  languageName: "Nederlands",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: een gezellige focustimer in de wasserette, met lofi",
    description:
      "Doe je was als focustimer in een rustige wasserette. Wassen, drogen, focussen, lofi, koffie, een notitieboek voor vreemden, of gewoon even niks. Gratis, zonder account.",
    intro:
      "Een rustige wasserette in je browser. Start een wasmachine of droger voor 5 tot 60 minuten als focustimer en krijg een melding als hij klaar is, zet lo-fi-zenders op de tv, zet een kop koffie en laat een handgeschreven berichtje achter in het gedeelde notitieboek. Volle notitieboeken gaan op de plank.",
    keywords: [
      "wasserette",
      "focustimer",
      "pomodoro",
      "lofi",
      "muziek om te werken",
      "studeren",
      "gezellig",
      "gedeeld notitieboek",
    ],
    inspiredBy: "geïnspireerd door",
    openGraphLocale: "nl_NL",
  },
  toolbar: {
    soundOn: "geluid aan",
    soundOff: "geluid uit",
    share: "delen",
    linkCopied: "link gekopieerd",
    shareText:
      "Een rustige wasserette in je browser. Stop er een was in, laat de timer lopen en lees de berichtjes die mensen hebben achtergelaten.",
    language: "Taal",
    settings: "instellingen",
    builtBy: "met ❤️ gemaakt door Li Yuxuan",
    updateAvailable: "vernieuw voor de bijgewerkte wasserette",
  },
  settings: {
    heading: "instellingen",
    rendering: "weergave",
    renderingHint:
      "lite laat het zachte licht, het wiegen van de plant en het inzoomen op het notitieboek en het prikbord weg. handig op tragere apparaten of als het geheugen krap is.",
    qualityAuto: "auto",
    qualityAutoHint: (o: { quality: string }) =>
      `gebruikt ${o.quality} op dit apparaat`,
    qualityFull: "volledig",
    qualityFullHint: "al het licht en alle beweging",
    qualityLite: "lite",
    qualityLiteHint: "lichter voor geheugen en batterij",
    close: "sluiten",
    closeHint: "esc om te sluiten",
  },
  tabDone: "klaar",
  readoutDone: "klaar",
  matWelcome: "welkom",
  machine: {
    name: (machine) =>
      `${machine.kind === "washer" ? "Wasmachine" : "Droger"} ${machine.number}`,
    freeLabel: (o) => `${o.name}, vrij`,
    freeTooltip: (o) => `${o.name} · vrij`,
    loadedLabel: (o) => `${o.name}, gevuld, klaar om te starten`,
    loadedTooltip: (o) => `${o.name} · gevuld`,
    runningLabel: (o) =>
      `${o.name}, ${o.kind === "washer" ? "aan het wassen" : "aan het drogen"}, nog ${o.remaining}`,
    runningTooltip: (o) =>
      `${o.kind === "washer" ? "aan het wassen" : "aan het drogen"} · klaar om ${o.time}`,
    doneLabel: (o) => `${o.name}, klaar, haal je was eruit`,
    doneTooltip: (o) => `${o.name} · klaar`,
    othersRunningLabel: (o) =>
      `${o.name}, ${o.kind === "washer" ? "wast" : "droogt"} de was van iemand anders, nog ${o.remaining}`,
    othersRunningTooltip: (o) =>
      `iemand anders is aan het ${o.kind === "washer" ? "wassen" : "drogen"} · klaar om ${o.time}`,
    othersLoadedLabel: (o) => `${o.name}, de was van iemand anders zit erin`,
    othersLoadedTooltip: (o) =>
      `${o.name} · was van iemand anders, niet gestart`,
    othersDoneLabel: (o) => `${o.name}, de was van iemand anders is klaar`,
    othersDoneTooltip: (o) => `${o.name} · van iemand anders, klaar`,
    doneNotificationTitle: (o) => `${o.name} · klaar`,
    doneNotificationBody: (o) =>
      o.kind === "washer"
        ? "haal je was eruit en kies een droger"
        : "je was is droog",
  },
  machineControl: {
    controlInUseLabel: (o) =>
      `${{ dial: "Draaiknop", start: "Startknop", door: "Deur" }[o.control]} van ${o.name}, in gebruik door iemand anders`,
    othersRunningTooltip: (o) =>
      `${o.kind === "washer" ? "wasbeurt" : "droogbeurt"} van iemand anders · klaar om ${o.time}`,
    othersLoadedTooltip: "was van iemand anders · nog niet gestart",
    othersDoneTooltip: "de was van iemand anders · wacht op de eigenaar",
    doneAt: (o) => `klaar om ${o.time}`,
    dialLabel: (o) =>
      `Programma van ${o.name}, ${o.minutes} ${o.minutes === 1 ? "minuut" : "minuten"}`,
    dialTooltip: (o) => `draaien · ${o.minutes} min → ${o.nextMinutes} min`,
    startLabel: (o) =>
      `Start van ${o.name}, ${o.kind === "washer" ? "wasbeurt" : "droogbeurt"} van ${o.minutes} ${o.minutes === 1 ? "minuut" : "minuten"}${o.canNotify ? ", je krijgt een melding als hij klaar is" : ""}`,
    startTooltip: (o) =>
      `start · ${o.minutes} min ${o.kind === "washer" ? "wassen" : "drogen"}${o.canNotify ? " · met melding" : ""}`,
    remindLabel: (o) =>
      `${o.name}, herinner me als het ${o.kind === "washer" ? "wassen" : "drogen"} klaar is`,
    remindTooltip: (o) => `herinner me · ${o.doneAt}`,
    runningStartLabel: (o) =>
      `Start van ${o.name}, ${o.reminderOn ? "herinnering aan, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o) => `herinnering aan · ${o.doneAt}`,
    idleStartLabel: (o) => `Start van ${o.name}`,
    loadFirstTooltip: "eerst de was erin",
    needsWashingTooltip: "eerst wassen",
    alreadyWashedTooltip: "al gewassen · nu drogen",
    alreadyDryTooltip: "al droog · neem het mee naar huis",
    elsewhereLoadedTooltip: (o) => `je was wacht in ${o.name}`,
    elsewhereRunningTooltip: (o) =>
      o.kind === "washer"
        ? "je kleren worden nog gewassen"
        : "je kleren zijn nog aan het drogen",
    elsewhereDoneTooltip: (o) => `je was is klaar · in ${o.name}`,
    runningDoorTooltip: (o) =>
      `${o.kind === "washer" ? "aan het wassen" : "aan het drogen"} · ${o.doneAt}`,
    doneDoorTooltip: "deur open · was eruit halen",
    loadedDoorTooltip: "deur open · was er weer uit halen",
    loadableDoorTooltip: "was erin doen",
    doorLabel: (o) => `Deur van ${o.name}`,
    doorLabelWithHint: (o) => `Deur van ${o.name}, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o) =>
      `Deurmat, neem je ${o.laundry === "folded" ? "droge" : "gewassen"} was mee naar huis`,
    readyTooltip: "naar huis · neem je was mee",
    awayLabel: "Deurmat, ga naar huis terwijl je was draait",
    awayTooltip: "naar huis · je was draait verder",
    wetLabel: "Deurmat, ga naar huis met de natte was",
    wetTooltip: "naar huis · de kleren zijn nog nat",
    dirtyLabel:
      "Deurmat, doe de kleren in een wasmachine voor je naar huis gaat",
    dirtyTooltip: "eerst wassen · doe de kleren in een wasmachine",
  },
  laundryBasket: {
    labels: {
      empty: "Wasmand, leeg",
      dirty: "Wasmand, was om te wassen",
      wet: "Wasmand, natte was om te drogen",
      folded: "Wasmand, schone droge was",
    },
    tooltips: {
      empty: "mand · leeg",
      dirty: "vuile was · in een wasmachine",
      wet: "natte was · in een droger",
      folded: "schoon en droog · klaar om naar huis te gaan",
    },
  },
  coffee: {
    machineLabel: "Koffiezetapparaat",
    brewingMachineLabel: "Koffiezetapparaat, bezig met zetten",
    brewingTooltip: "koffie zetten…",
    idleSwitchLabel: "Schakelaar van het koffiezetapparaat, zet een kop koffie",
    idleSwitchTooltip: "zet een kop koffie",
    brewingSwitchLabel:
      "Schakelaar van het koffiezetapparaat, bezig met zetten",
    readyMachineLabel: "Koffiezetapparaat, er zit koffie in de kan",
    readyMachineTooltip: "koffie is klaar",
    topUpSwitchLabel: "Schakelaar van het koffiezetapparaat, kan bijvullen",
    topUpSwitchTooltip: "kan bijvullen",
    fullSwitchLabel: "Schakelaar van het koffiezetapparaat, de kan is vol",
    fullSwitchTooltip: "kan is vol · schenk eerst een kop in",
    emptyFlaskLabel: "Koffiekan, leeg",
    emptyFlaskTooltip: "kan is leeg",
    brewingFlaskLabel: "Koffiekan, bezig met zetten",
    othersBrewingMachineLabel: "Koffiezetapparaat, iemand anders zet koffie",
    othersBrewingSwitchLabel:
      "Schakelaar van het koffiezetapparaat, iemand anders zet koffie",
    othersBrewingFlaskLabel: "Koffiekan, iemand anders zet koffie",
    othersBrewingTooltip: (o: { time: string }) =>
      `iemand anders zet koffie · klaar om ${o.time}`,
    pourLabel: "Koffiekan, schenk een kop in",
    pourTooltip: "schenk een kop in",
    cupFullFlaskLabel: "Koffiekan, drink eerst je kop leeg",
    cupFullFlaskTooltip: "drink eerst je kop leeg",
    fullCupLabel: "Koffiekop, drinken",
    fullCupTooltip: "drinken",
    emptyCupLabel: "Koffiekop, leeg",
    emptyCupTooltip: "lege kop",
  },
  plant: {
    label: "Plant, gras aanraken",
    tooltip: "gras aanraken",
  },
  board: {
    label: "Prikbord, wat er nieuw is in de wasserette",
    tooltip: "wat is er nieuw",
    eyebrow: "prikbord",
    heading: "wat is er nieuw",
    subtitle: "Kleine veranderingen in de wasserette, nieuwste eerst.",
    updated: (o: { date: string }) => `bijgewerkt op ${o.date}`,
    footer: "altijd open, 24/7",
    close: "sluiten",
    closeHint: "esc om te sluiten",
    tags: {
      opening: "opening",
      tv: "tv",
      notebook: "notitieboek",
      languages: "talen",
      room: "ruimte",
      coffee: "koffie",
      window: "raam",
      light: "licht",
      board: "bord",
    },
    updates: {
      "home-mid-wash": {
        title: "naar huis terwijl het draait",
        body: "Stap op de deurmat om naar huis te gaan terwijl je was draait. Natte kleren gaan mee in de mand, droge belanden op het bed.",
      },
      "bedroom-curtains": {
        title: "gordijnen en een nieuwe lamp thuis",
        body: "Klik op de gordijnen of de lamp in je kamer. Beide ruimtes worden nu lichter en donkerder met de zon, de maan en de lampen.",
      },
      "settings-lite": {
        title: "instellingen en een lichte modus",
        body: "Het tandwiel in de balk opent de instellingen. Kies licht op tragere apparaten om geheugen en batterij te sparen.",
      },
      "door-bell": {
        title: "een belletje aan de deur",
        body: "Een belletje klinkt als je binnenkomt, en telkens als iemand anders binnenkomt.",
      },
      "whats-new-board": {
        title: "een bord voor nieuwtjes",
        body: "Dit standaard toont wat nieuw is. Overdag rustig als papier, 's nachts verlicht.",
      },
      "twelve-stations": {
        title: "twaalf zenders op de tv",
        body: "Zeven nieuwe lofi-radio's vullen de afstemknop, van studiezaal tot diepe ruimte.",
      },
      "page-drag": {
        title: "bladeren door te slepen",
        body: "Sleep ergens langs de buitenrand van een pagina om hem om te slaan.",
      },
      "window-light": {
        title: "zonlicht door het raam",
        body: "Daglicht valt op de machines en de vloer, en wordt warm bij zonsopgang en zonsondergang.",
      },
      "shared-coffee": {
        title: "een pot koffie delen",
        body: "Tot zeven mensen schenken uit dezelfde kan.",
      },
      "street-view": {
        title: "de straat buiten",
        body: "Het raam kijkt uit op de straat, beschenen door zon of maan.",
      },
      "tube-counter": {
        title: "wie er is",
        body: "De buizen op de achterwand tellen iedereen in de wasserette, jij ook.",
      },
      "coffee-counter": {
        title: "koffie op de toonbank",
        body: "Zet een pot, schenk een kop in en drink hem terwijl je was draait.",
      },
      "shared-machines": {
        title: "anderen aan de was",
        body: "Zie welke machines anderen gebruiken. Hun was blijft liggen als jij de jouwe inlaadt.",
      },
      "eighteen-languages": {
        title: "open in 18 talen",
        body: "De hele wasserette spreekt jouw taal. Wissel via de wereldbol in de hoek.",
      },
      "shared-notebook": {
        title: "een notitieboek voor vreemden",
        body: "Laat een briefje achter voor wie na je komt. Volle boeken gaan op de plank.",
      },
      "lofi-tv": {
        title: "lofi op de tv",
        body: "Zet de tv aan voor lofi-radio, met een zenderknop en een volumeknop.",
      },
      opening: {
        title: "laundro.cafe gaat open",
        body: "Een stille wasserette in je browser: wassen, drogen, 5 tot 60 minuten focussen.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Buizenteller, ${o.count === 1 ? "alleen jij hier" : `${o.count} mensen hier`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "alleen jij hier" : `${o.count} mensen hier`,
    offLabel: "Buizenteller, uit",
    offTooltip: "uit",
  },
  tv: {
    stations: {
      "rainy-cafe": "regenachtig café",
      "piano-night": "pianoavond",
      "late-wash": "late was",
      "tape-hiss": "bandruis",
      "city-at-3am": "de stad om 3 uur 's nachts",
      "study-hall": "studiezaal",
      "smoky-jazz": "rokerige jazz",
      fireplace: "open haard",
      "neon-tokyo": "neon-tokio",
      "string-quartet": "strijkkwartet",
      "porch-guitar": "gitaar op de veranda",
      "deep-space": "diepe ruimte",
    },
    station: (o) => `kan. ${o.channel} · ${o.name}`,
    offLabel: "Tv, uit",
    offTooltip: "tv · uit",
    onLabel: (o) => `Tv, aan, ${o.station}`,
    screenOnLabel: (o) => `Tv-scherm, ${o.station}, kijk op YouTube`,
    screenOnTooltip: "kijk op YouTube ↗",
    screenOffLabel: "Tv-scherm, uit, zet aan",
    turnOn: "aanzetten",
    tunerLabel: (o) => `Tv-zender, ${o.station}`,
    tunerTooltip: (o) => `volgende zender · ${o.nextName}`,
    volumeLabel: (o) => `Tv-volume, ${o.percent}%`,
    volumeTooltip: (o) => `volume · ${o.percent}%`,
    powerOnLabel: "Aan/uit-knop van de tv, aan, zet uit",
    turnOff: "uitzetten",
    powerOffLabel: "Aan/uit-knop van de tv, uit, zet aan",
    noSignal: "geen signaal",
  },
  shelf: {
    loadingLabel: "Plank, zoeken naar volle notitieboeken",
    loadingTooltip: "even op de plank kijken…",
    offlineLabel: "Plank, op dit moment offline",
    offlineTooltip: "de plank is op dit moment offline",
    emptyLabel: "Plank, nog geen volle notitieboeken",
    emptyTooltip: "nog geen volle notitieboeken",
    readyLabel: "Bekijk de plank met volle notitieboeken",
    bookCount: (o) =>
      o.count === 1 ? "1 vol notitieboek" : `${o.count} volle notitieboeken`,
    bookLabel: (o) =>
      `Open notitieboek nr. ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o) =>
      `${o.count} ${o.count === 1 ? "berichtje" : "berichtjes"}`,
  },
  notebook: {
    objectLabel: "Open het notitieboek",
    objectTooltip: "berichtjes van vreemden",
    number: (o) => `Nr. ${o.number}`,
    dialogLabel: (o) => `Notitieboek nr. ${o.number}`,
    daySpan: (o) => `${o.from} – ${o.to}`,
    since: (o) => `sinds ${o.day}`,
    insideCover: "binnenkant omslag",
    insideCoverAndPage: (o) => `binnenkant omslag · blz. ${o.page}`,
    page: (o) => `blz. ${o.page}`,
    pages: (o) => `blz. ${o.left}–${o.right}`,
    pageButtonLabel: (o) => `Pagina ${o.page}, ga naar een andere pagina`,
    previousPage: "Vorige pagina",
    nextPage: "Volgende pagina",
    scrubberLabel: "Pagina",
    goToPage: "ga naar pagina",
    pageInputLabel: (o) => `Paginanummer, 1 tot ${o.pageCount}`,
    report: "melden",
    reported: "gemeld",
    opening: "notitieboek openen…",
    missing: (o) => `er is geen notitieboek nr. ${o.number}`,
    full: (o) => `notitieboek nr. ${o.number} is vol · alleen lezen`,
    someoneWritingInNotebook:
      "iemand schrijft in het notitieboek · wacht je beurt af",
    someoneWriting: "iemand is nu aan het schrijven · wacht je beurt af",
    comeBackToWrite: "kom over twee minuten terug om er nog een te schrijven",
    startsNext: (o) => `dit berichtje begint notitieboek nr. ${o.number}`,
    writePromptBeforeKeys: "schrijf een berichtje voor de volgende · ",
    writePromptAfterKeys: " om het op te slaan",
    textareaLabel: "Schrijf een berichtje in het notitieboek",
    notifyWhenFree: "laat me weten als het vrij is",
    notifyPending: "we laten het je weten",
    saveNote: "berichtje opslaan",
    savingNote: "opslaan…",
    close: "sluiten",
    freeNotificationTitle: "het notitieboek is vrij",
    freeNotificationBody: "jouw beurt om te schrijven",
    leaveFailures: {
      offline:
        "het notitieboek is op dit moment offline · je berichtje blijft hier staan",
      rate_limited: "één berichtje per twee minuten · probeer het zo weer",
      contains_link: "geen links in het notitieboek",
      too_long: "te lang voor het notitieboek · maak het iets korter",
      sign_off_too_long: "de ondertekening is te lang",
      empty_body: "schrijf eerst iets",
      unknown: "er ging iets mis · probeer het opnieuw",
    },
  },
  firstVisit: {
    garments: {
      tee: "T-shirt",
      jeans: "spijkerbroek",
      sweater: "trui",
      towel: "handdoek",
      socks: "sokken",
      shirt: "overhemd",
    },
    garmentLabel: (o) => `In de mand: ${o.garment}`,
    basketEmpty: "gooi de kleren van de vloer hierin",
    basketPartial: (o) =>
      `${o.count} van ${o.total} erin · doe er meer bij, of ga naar de deur`,
    basketFull: "alles erin · ga naar de deur",
    basketWet: "de kleren zijn nog nat · droog ze in de wasserette",
    lampOffTooltip: "lamp uit",
    lampOnTooltip: "lamp aan",
    lampOffLabel: "Doe de lamp uit",
    lampOnLabel: "Doe de lamp aan",
    curtainCloseTooltip: "doe de gordijnen dicht",
    curtainOpenTooltip: "doe de gordijnen open",
    curtainCloseLabel: "Doe de gordijnen dicht",
    curtainOpenLabel: "Doe de gordijnen open",
    doorReadyTooltip: "breng het naar de wasserette",
    doorWaitingTooltip: "raap eerst je was op",
    doorAwayTooltip: "terug naar de wasserette · je was draait nog",
    doorAwayLabel: "Terug naar de wasserette, je was zit nog in de machine",
    doorReadyLabel: "Breng de mand naar de wasserette",
    doorWaitingLabel: "Deur naar de wasserette, raap eerst je was op",
    justListen: "gewoon luisteren →",
  },
} satisfies LaundromatCopy;
