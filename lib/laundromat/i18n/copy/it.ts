import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const it = {
  locale: "it",
  languageName: "Italiano",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: un timer di concentrazione accogliente, con lofi",
    description:
      "Fai il bucato come timer di concentrazione in una lavanderia tranquilla. Lavare, asciugare, concentrarsi, lofi, caffè, un quaderno per sconosciuti o semplicemente staccare. Gratis, senza registrazione.",
    intro:
      "Una lavanderia tranquilla nel tuo browser. Avvia una lavatrice o un'asciugatrice da 5 a 60 minuti come timer di concentrazione e ricevi una notifica quando ha finito, ascolta stazioni lo-fi in TV, preparati un caffè e lascia un biglietto scritto a mano nel quaderno condiviso. I quaderni pieni finiscono sullo scaffale.",
    keywords: [
      "lavanderia",
      "timer di concentrazione",
      "pomodoro",
      "lofi",
      "musica per lavorare",
      "studia con me",
      "accogliente",
      "quaderno condiviso",
    ],
    inspiredBy: "ispirato a",
    openGraphLocale: "it_IT",
    shareImage: {
      headline: "una lavanderia tranquilla nel tuo browser.",
      subline:
        "lavare, asciugare, concentrarsi, lofi, caffè, un quaderno per sconosciuti o semplicemente staccare",
    },
  },
  toolbar: {
    soundOn: "audio attivo",
    soundOff: "audio disattivato",
    share: "condividi",
    linkCopied: "link copiato",
    shareText:
      "Una lavanderia tranquilla nel tuo browser. Carica un bucato, lascia andare il timer e leggi i biglietti che hanno lasciato gli altri.",
    language: "Lingua",
    settings: "impostazioni",
    builtBy: {
      beforeClaude: "fatto con ❤️ da Li Yuxuan e ",
      afterClaude: "",
    },
    updateAvailable: "ricarica per la lavanderia aggiornata",
  },
  settings: {
    heading: "impostazioni",
    rendering: "resa grafica",
    renderingHint:
      "lite toglie la luce morbida, l'ondeggiare della pianta e lo zoom sul quaderno e sulla bacheca. aiuta sui dispositivi più lenti o con poca memoria.",
    qualityAuto: "auto",
    qualityAutoHint: (o: { quality: string }) =>
      `usa ${o.quality} su questo dispositivo`,
    qualityFull: "completa",
    qualityFullHint: "tutta la luce e il movimento",
    qualityLite: "lite",
    qualityLiteHint: "più leggera per memoria e batteria",
    close: "chiudi",
    closeHint: "esc per chiudere",
    temperature: "temperatura",
    weather: "meteo",
    placeLabel: "luogo del meteo",
    placePlaceholder: "cerca una città",
    placeLive: "dal vivo",
    placeNearYou: "vicino a te",
    placeSearching: "ricerca…",
    placeNoResults: "nessun luogo trovato",
    conditionLabel: "cielo",
    conditionLive: "meteo dal vivo",
    weatherHint:
      "il meteo dal vivo è stimato dal tuo indirizzo IP, quindi a volte può sbagliare. scegli una città o un cielo per impostarlo tu. l'unità di temperatura segue il luogo finché non ne scegli una.",
    roomSounds: "suoni della sala",
    roomSoundsHint:
      "i suoni della sala e delle persone che ci sono. spegnerne o abbassarne uno lo cambia solo per te.",
    roomSoundsAllOn: "tutti accesi",
    roomSoundsAllOff: "tutti spenti",
    roomSoundOn: "on",
    roomSoundOff: "off",
    roomSoundVolume: (o: { sound: string }) => `volume: ${o.sound}`,
    roomMix: {
      play: "ascolta il mix della sala",
      playing: "suona il tuo mix",
      playLabel: "ascolta il mix della sala ai tuoi livelli",
      stopLabel: "ferma il mix della sala",
    },
    ticket: {
      heading: "tagliando della lavanderia",
      hint: "stampa un tagliando per tenere le tue impostazioni in un piccolo file e copiare un link alle impostazioni. apri il link, o inserisci il file qui, su qualsiasi dispositivo per riaverle.",
      print: "stampa",
      insert: "inserisci",
      printLabel:
        "stampa un tagliando della lavanderia, che salva le tue impostazioni in un file e copia un link alle impostazioni",
      insertLabel:
        "inserisci un tagliando della lavanderia, che carica le tue impostazioni da un file",
      ready: "pronto",
      printing: "stampa…",
      saved: "salvato",
      linkCopied: "link copiato",
      linkLabel: "link al tuo tagliando della lavanderia",
      copyLink: "copia link",
      copied: "copiato",
      linkHint:
        "apri questo link su un altro dispositivo per portarci le tue impostazioni.",
      reading: "lettura…",
      loaded: "caricato",
      unreadable: "non valido",
      title: "tagliando della lavanderia",
      number: (o: { number: string }) => `n. ${o.number}`,
      tv: (o: { percent: number }) => `tv ${o.percent}%`,
    },
    roomSound: {
      machines: {
        label: "macchine",
        hint: "lavatrici e asciugatrici che girano",
      },
      "shop-bell": { label: "campanello", hint: "suona quando entra qualcuno" },
      unloading: {
        label: "svuotamento",
        hint: "un chiavistello quando qualcuno ritira il bucato",
      },
      coffee: {
        label: "caffè",
        hint: "il gorgoglio dell'infusione e il bip quando è pronto",
      },
      tv: { label: "fruscio tv", hint: "il fruscio della tv senza segnale" },
      lamp: {
        label: "lampada",
        hint: "la lampada che sfarfalla accendendosi e scatta spegnendosi",
      },
      weather: {
        label: "meteo",
        hint: "pioggia e tuoni fuori dalla finestra",
      },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
  },
  tabDone: "finito",
  readoutDone: "fine",
  matWelcome: "benvenuti",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "Lavatrice" : "Asciugatrice"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, libera`,
    freeTooltip: (o: { name: string }) => `${o.name} · libera`,
    loadedLabel: (o: { name: string }) =>
      `${o.name}, caricata, pronta a partire`,
    loadedTooltip: (o: { name: string }) => `${o.name} · caricata`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, ${o.kind === "washer" ? "in lavaggio" : "in asciugatura"}, mancano ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "in lavaggio" : "in asciugatura"} · finisce alle ${o.time}`,
    doneLabel: (o: { name: string }) =>
      `${o.name}, finito, tira fuori il bucato`,
    doneTooltip: (o: { name: string }) => `${o.name} · finito`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, ${o.kind === "washer" ? "sta lavando" : "sta asciugando"} il bucato di qualcun altro, mancano ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `qualcun altro sta ${o.kind === "washer" ? "lavando" : "asciugando"} · finisce alle ${o.time}`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, c'è il bucato di qualcun altro`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · bucato di qualcun altro, non avviato`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, il bucato di qualcun altro è pronto`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · di qualcun altro, finito`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · finito`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "tira fuori il bucato e scegli un'asciugatrice"
        : "il tuo bucato è asciutto",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name}, ${{ dial: "manopola", start: "tasto di avvio", door: "oblò" }[o.control]}: lo sta usando qualcun altro`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "lavaggio" : "asciugatura"} di qualcun altro · finisce alle ${o.time}`,
    othersLoadedTooltip: "bucato di qualcun altro · non ancora avviato",
    othersDoneTooltip: "bucato di qualcun altro · aspetta il suo proprietario",
    doneAt: (o: { time: string }) => `finisce alle ${o.time}`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name}, programma, ${o.minutes} minuti`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `gira · ${o.minutes} min → ${o.nextMinutes} min`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name}, avvia, ${o.kind === "washer" ? "lavaggio" : "asciugatura"} di ${o.minutes} minuti${o.canNotify ? ", ti avvisa quando ha finito" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `avvia · ${o.kind === "washer" ? "lavaggio" : "asciugatura"} di ${o.minutes} min${o.canNotify ? " · ti avvisa" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, avvisami quando finisce ${o.kind === "washer" ? "il lavaggio" : "l'asciugatura"}`,
    remindTooltip: (o: { doneAt: string }) => `avvisami · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) =>
      `${o.name}, avvia, ${o.reminderOn ? "promemoria attivo, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) =>
      `promemoria attivo · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name}, avvia`,
    loadFirstTooltip: "prima carica il bucato",
    needsWashingTooltip: "prima lavalo",
    alreadyWashedTooltip: "già lavato · ora asciugalo",
    alreadyDryTooltip: "già asciutto · portalo a casa",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `il tuo bucato ti aspetta in ${o.name}`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "i tuoi vestiti si stanno ancora lavando"
        : "i tuoi vestiti si stanno ancora asciugando",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `il tuo bucato è pronto · in ${o.name}`,
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "in lavaggio" : "in asciugatura"} · ${o.doneAt}`,
    doneDoorTooltip: "apri l'oblò · tira fuori il bucato",
    loadedDoorTooltip: "apri l'oblò · riprendi il bucato",
    loadableDoorTooltip: "carica il bucato",
    doorLabel: (o: { name: string }) => `${o.name}, oblò`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name}, oblò, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `Zerbino, porta a casa il tuo bucato ${o.laundry === "folded" ? "asciutto" : "lavato"}`,
    readyTooltip: "torna a casa · porta con te il bucato pulito",
    awayLabel: "Zerbino, torna a casa e lascia il bucato nella macchina",
    awayTooltip: "torna a casa · il bucato resta nella macchina",
    wetLabel: "Zerbino, torna a casa con il bucato bagnato",
    wetTooltip: "torna a casa · i vestiti sono ancora bagnati",
    dirtyLabel:
      "Zerbino, metti i vestiti in una lavatrice prima di tornare a casa",
    dirtyTooltip: "prima lavali · metti i vestiti in una lavatrice",
  },
  laundryBasket: {
    labels: {
      empty: "Cesto della biancheria, vuoto",
      dirty: "Cesto della biancheria, panni da lavare",
      wet: "Cesto della biancheria, panni bagnati da asciugare",
      folded: "Cesto della biancheria, panni puliti e asciutti",
    },
    tooltips: {
      empty: "cesto · vuoto",
      dirty: "panni sporchi · in lavatrice",
      wet: "panni bagnati · nell'asciugatrice",
      folded: "puliti e asciutti · pronti per tornare a casa",
    },
  },
  coffee: {
    machineLabel: "Macchina del caffè",
    brewingMachineLabel: "Macchina del caffè, il caffè sta uscendo",
    brewingTooltip: "sta uscendo…",
    idleSwitchLabel: "Interruttore della macchina del caffè, fai un caffè",
    idleSwitchTooltip: "fai un caffè",
    brewingSwitchLabel:
      "Interruttore della macchina del caffè, il caffè sta uscendo",
    readyMachineLabel: "Macchina del caffè, c'è caffè nella caraffa",
    readyMachineTooltip: "il caffè è pronto",
    topUpSwitchLabel:
      "Interruttore della macchina del caffè, riempi la caraffa",
    topUpSwitchTooltip: "riempi la caraffa",
    fullSwitchLabel:
      "Interruttore della macchina del caffè, la caraffa è piena",
    fullSwitchTooltip: "la caraffa è piena · versa prima una tazza",
    emptyFlaskLabel: "Caraffa del caffè, vuota",
    emptyFlaskTooltip: "la caraffa è vuota",
    brewingFlaskLabel: "Caraffa del caffè, il caffè sta uscendo",
    othersBrewingMachineLabel:
      "Macchina del caffè, qualcun altro sta facendo il caffè",
    othersBrewingSwitchLabel:
      "Interruttore della macchina del caffè, qualcun altro sta facendo il caffè",
    othersBrewingFlaskLabel:
      "Caraffa del caffè, qualcun altro sta facendo il caffè",
    othersBrewingTooltip: (o: { time: string }) =>
      `qualcun altro sta facendo il caffè · finisce alle ${o.time}`,
    pourLabel: "Caraffa del caffè, versa una tazza",
    pourTooltip: "versa una tazza",
    cupFullFlaskLabel: "Caraffa del caffè, finisci prima la tua tazza",
    cupFullFlaskTooltip: "finisci prima la tazza",
    fullCupLabel: "Tazza di caffè, bevi",
    fullCupTooltip: "bevi",
    emptyCupLabel: "Tazza di caffè, vuota",
    emptyCupTooltip: "tazza vuota",
  },
  plant: {
    label: "Pianta, tocca l'erba",
    tooltip: "tocca l'erba",
  },
  board: {
    label: "Bacheca, le novità della lavanderia",
    tooltip: "novità",
    eyebrow: "bacheca",
    heading: "novità",
    subtitle: "Piccoli cambiamenti in lavanderia, i più recenti per primi.",
    updated: (o: { date: string }) => `aggiornato il ${o.date}`,
    footer: "sempre aperto, 24/7",
    close: "chiudi",
    closeHint: "esc per chiudere",
    tags: {
      opening: "apertura",
      tv: "tv",
      notebook: "quaderno",
      languages: "lingue",
      room: "sala",
      coffee: "caffè",
      window: "finestra",
      light: "luce",
      board: "bacheca",
    },
    updates: {
      "notebook-doodles": {
        title: "disegna nel quaderno",
        body: "Passa la penna del quaderno da scrivi a disegna e lascia un piccolo disegno a chi arriva dopo. Chiunque sia in lavanderia con il quaderno aperto lo vede disegnarsi da solo sulla pagina.",
      },
      "weather-anywhere": {
        title: "scegli il tempo fuori",
        body: "Nelle impostazioni scegli una città per vederne il meteo dalla finestra e sul pannello, oppure scegli tu il cielo. Di base resta il meteo dal vivo.",
      },
      "room-sound-mixer": {
        title: "mixa la sala a modo tuo",
        body: "Ogni suono della sala nelle impostazioni ora ha il suo cursore, così la pioggia può essere più forte e le macchine più piano. Ascolta il mix della sala per sentirli insieme, e stampa un tagliando della lavanderia per tenere le tue impostazioni o portarle su un altro dispositivo.",
      },
      "weather-panel": {
        title: "il meteo, dentro e fuori",
        body: "Un pannello sopra la finestra mostra il meteo dove sei, con la massima e la minima di oggi e la qualità dell'aria. Anche le finestre lo mostrano, pioggia, neve, nebbia o temporale, con il suono giusto. La tua città è una stima approssimativa dalla tua connessione. Quando l'aria diventa dannosa, un purificatore si accende nell'angolo.",
      },
      "room-sound-dials": {
        title: "scegli quali suoni sentire",
        body: "Nelle impostazioni ora c'è una manopola per ogni suono della sala, dalle macchine al campanello. Spegni quelli che preferisci non sentire. Per gli altri la sala resta uguale.",
      },
      "home-mid-wash": {
        title: "torna a casa mentre lava",
        body: "Passa sullo zerbino per tornare a casa mentre il bucato va. I vestiti bagnati tornano nel cesto, quelli asciutti finiscono sul letto.",
      },
      "bedroom-curtains": {
        title: "tende e una nuova lampada a casa",
        body: "Clicca sulle tende o sulla lampada della tua stanza. Ora entrambe le stanze si schiariscono e si scuriscono con il sole, la luna e le lampade.",
      },
      "settings-lite": {
        title: "impostazioni e una modalità leggera",
        body: "L'ingranaggio nella barra apre le impostazioni. Passa alla modalità leggera sui dispositivi lenti per risparmiare memoria e batteria.",
      },
      "door-bell": {
        title: "un campanello sulla porta",
        body: "Un campanellino suona quando entri, e ogni volta che arriva qualcun altro.",
      },
      "whats-new-board": {
        title: "una bacheca delle novità",
        body: "Questo espositore mostra le novità. Di giorno è come carta, di notte si illumina.",
      },
      "twelve-stations": {
        title: "dodici canali in tv",
        body: "Sette nuove radio lofi riempiono la manopola, dall'aula studio allo spazio profondo.",
      },
      "page-drag": {
        title: "sfoglia trascinando",
        body: "Trascina in qualsiasi punto del bordo esterno di una pagina per girarla.",
      },
      "window-light": {
        title: "il sole dalla finestra",
        body: "La luce del giorno arriva alle macchine e al pavimento, e si scalda all'alba e al tramonto.",
      },
      "shared-coffee": {
        title: "una caffettiera per tutti",
        body: "Fino a sette persone si servono dalla stessa caraffa.",
      },
      "street-view": {
        title: "la strada fuori",
        body: "La finestra dà sulla strada, illuminata dal sole o dalla luna.",
      },
      "tube-counter": {
        title: "chi c'è",
        body: "I tubi sulla parete di fondo contano tutti quelli in lavanderia, te compreso.",
      },
      "coffee-counter": {
        title: "caffè sul bancone",
        body: "Prepara una caffettiera, versati una tazza e bevila mentre il bucato gira.",
      },
      "shared-machines": {
        title: "altri fanno il bucato",
        body: "Guarda quali macchine usano gli altri. Il loro bucato resta al suo posto quando carichi il tuo.",
      },
      "eighteen-languages": {
        title: "aperto in 18 lingue",
        body: "Tutta la lavanderia parla la tua lingua. Cambiala dal globo nell'angolo.",
      },
      "shared-notebook": {
        title: "un quaderno per sconosciuti",
        body: "Lascia un biglietto a chi arriva dopo. I quaderni pieni vanno sullo scaffale.",
      },
      "lofi-tv": {
        title: "lofi in tv",
        body: "Accendi la tv per la radio lofi, con manopola dei canali e del volume.",
      },
      opening: {
        title: "apre laundro.cafe",
        body: "Una lavanderia tranquilla nel browser: lava, asciuga, concentrati da 5 a 60 minuti.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Contatore a valvole, ${o.count === 1 ? "solo tu qui" : `${o.count} persone qui`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "solo tu qui" : `${o.count} persone qui`,
    offLabel: "Contatore a valvole, spento",
    offTooltip: "spento",
  },
  airPurifier: {
    label: (o: { aqi: number }) => `Purificatore d'aria, acceso, AQI ${o.aqi}`,
    tooltip: "purificatore d'aria · pulisce l'aria",
    offLabel: "Purificatore d'aria, spento",
    offTooltip: "spento",
  },
  weatherPanel: {
    conditions: {
      sunny: "soleggiato",
      clear: "sereno",
      cloudy: "nuvoloso",
      fog: "nebbia",
      rain: "pioggia",
      snow: "neve",
      thunder: "temporale",
    },
    outside: "fuori",
    high: "max",
    low: "min",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `Pannello meteo, ${o.temperature} ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "buona",
      moderate: "discreta",
      sensitive: "dannosa per i sensibili",
      unhealthy: "dannosa",
      veryUnhealthy: "molto dannosa",
      hazardous: "pericolosa",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `qualità dell'aria ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `aria ${o.band}`,
    offLabel: "Pannello meteo, nessuna lettura",
    offTooltip: "ancora nessuna lettura",
  },
  tv: {
    stations: {
      "rainy-cafe": "caffè sotto la pioggia",
      "piano-night": "notte al piano",
      "late-wash": "bucato a tarda ora",
      "tape-hiss": "fruscio di nastro",
      "city-at-3am": "la città alle 3 di notte",
      "study-hall": "aula studio",
      "smoky-jazz": "jazz fumoso",
      fireplace: "caminetto",
      "neon-tokyo": "tokyo al neon",
      "string-quartet": "quartetto d'archi",
      "porch-guitar": "chitarra in veranda",
      "deep-space": "spazio profondo",
    },
    station: (o: { channel: string; name: string }) =>
      `can. ${o.channel} · ${o.name}`,
    offLabel: "TV, spenta",
    offTooltip: "tv · spenta",
    onLabel: (o: { station: string }) => `TV, accesa, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `Schermo della TV, ${o.station}, guarda su YouTube`,
    screenOnTooltip: "guarda su YouTube ↗",
    screenOffLabel: "Schermo della TV, spento, accendi",
    turnOn: "accendi",
    tunerLabel: (o: { station: string }) => `Canale della TV, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) =>
      `stazione successiva · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `Volume della TV, ${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `volume · ${o.percent}%`,
    powerOnLabel: "Accensione della TV, accesa, spegni",
    turnOff: "spegni",
    powerOffLabel: "Accensione della TV, spenta, accendi",
    noSignal: "nessun segnale",
  },
  shelf: {
    loadingLabel: "Scaffale, cerco i quaderni pieni",
    loadingTooltip: "do un'occhiata allo scaffale…",
    offlineLabel: "Scaffale, offline al momento",
    offlineTooltip: "lo scaffale è offline al momento",
    emptyLabel: "Scaffale, ancora nessun quaderno pieno",
    emptyTooltip: "ancora nessun quaderno pieno",
    readyLabel: "Guarda lo scaffale dei quaderni pieni",
    bookCount: (o: { count: number }) =>
      o.count === 1 ? "1 quaderno pieno" : `${o.count} quaderni pieni`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `Apri il quaderno n. ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) =>
      `${o.count} ${o.count === 1 ? "biglietto" : "biglietti"}`,
  },
  notebook: {
    objectLabel: "Apri il quaderno",
    objectTooltip: "biglietti di sconosciuti",
    number: (o: { number: number }) => `n. ${o.number}`,
    dialogLabel: (o: { number: number }) => `Quaderno n. ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `dal ${o.day}`,
    insideCover: "risguardo",
    insideCoverAndPage: (o: { page: number }) => `risguardo · p. ${o.page}`,
    page: (o: { page: number }) => `p. ${o.page}`,
    pages: (o: { left: number; right: number }) => `pp. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `Pagina ${o.page}, vai a un'altra pagina`,
    previousPage: "Pagina precedente",
    nextPage: "Pagina successiva",
    scrubberLabel: "Pagina",
    goToPage: "vai alla pagina",
    pageInputLabel: (o: { pageCount: number }) =>
      `Numero di pagina, da 1 a ${o.pageCount}`,
    report: "segnala",
    reported: "segnalato",
    opening: "apro il quaderno…",
    missing: (o: { number: number }) => `non esiste il quaderno n. ${o.number}`,
    full: (o: { number: number }) =>
      `il quaderno n. ${o.number} è pieno · solo lettura`,
    someoneWritingInNotebook:
      "qualcuno sta scrivendo nel quaderno · aspetta il tuo turno",
    someoneWriting: "qualcuno sta scrivendo adesso · aspetta il tuo turno",
    comeBackToWrite: "torna tra due minuti per scriverne un altro",
    startsNext: (o: { number: number }) =>
      `questo biglietto apre il quaderno n. ${o.number}`,
    writePrompt: "scrivi un biglietto per la prossima persona",
    writePromptBeforeKeys: "scrivi un biglietto per la prossima persona · ",
    writePromptAfterKeys: " per salvarlo",
    textareaLabel: "Scrivi un biglietto nel quaderno",
    notifyWhenFree: "avvisami quando è libero",
    notifyPending: "ti avviseremo",
    saveNote: "salva il mio biglietto",
    saveDoodle: "salva il mio disegno",
    penModeLabel: "Penna",
    penModes: { write: "scrivi", draw: "disegna" },
    drawPrompt: "disegna qualcosa per la prossima persona",
    doodleMoved: (o: { page: number }) =>
      `non c'è più spazio su questa pagina · disegni a p. ${o.page}`,
    doodleBookFull:
      "non c'è spazio per un disegno in questo quaderno · scrivi un biglietto",
    inkFull: "non c'è più spazio per l'inchiostro · salva o annulla",
    someoneDrawingInNotebook:
      "qualcuno sta disegnando nel quaderno · aspetta il tuo turno",
    padLabel: "Spazio per disegnare nel quaderno",
    drawingNow: "stai disegnando…",
    someoneDrawingNow: "qualcuno sta disegnando…",
    undo: "annulla",
    clear: "cancella",
    savingNote: "salvataggio…",
    close: "chiudi",
    freeNotificationTitle: "il quaderno è libero",
    freeNotificationBody: "tocca a te scrivere",
    leaveFailures: {
      offline: "il quaderno è offline al momento · il tuo biglietto resta qui",
      rate_limited: "un biglietto ogni due minuti · riprova tra poco",
      contains_link: "niente link nel quaderno",
      too_long: "troppo lungo per il quaderno · accorcialo un po'",
      sign_off_too_long: "la firma è troppo lunga",
      empty_body: "prima scrivi qualcosa",
      unknown: "qualcosa è andato storto · riprova",
    },
  },
  firstVisit: {
    garments: {
      tee: "maglietta",
      jeans: "jeans",
      sweater: "maglione",
      towel: "asciugamano",
      socks: "calzini",
      shirt: "camicia",
    },
    garmentLabel: (o: { garment: string }) => `Metti nel cesto: ${o.garment}`,
    basketEmpty: "butta qui i vestiti sparsi sul pavimento",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.count} su ${o.total} dentro · aggiungine altri o vai alla porta`,
    basketFull: "tutto dentro · vai alla porta",
    basketWet: "i vestiti sono ancora bagnati · asciugali in lavanderia",
    lampOffTooltip: "spegni la lampada",
    lampOnTooltip: "accendi la lampada",
    lampOffLabel: "Spegni la lampada",
    lampOnLabel: "Accendi la lampada",
    curtainCloseTooltip: "chiudi le tende",
    curtainOpenTooltip: "apri le tende",
    curtainCloseLabel: "Chiudi le tende",
    curtainOpenLabel: "Apri le tende",
    bedTooltip: "andare a dormire",
    bedLabel: "Andare a dormire",
    goodNight: "Buonanotte",
    notSleepy: "non ho più sonno",
    doorReadyTooltip: "portalo in lavanderia",
    doorWaitingTooltip: "prima raccogli il bucato",
    doorAwayTooltip: "torna in lavanderia · il bucato è nella macchina",
    doorAwayLabel: "Torna in lavanderia, il bucato è ancora nella macchina",
    doorReadyLabel: "Porta il cesto in lavanderia",
    doorWaitingLabel: "Porta della lavanderia, prima raccogli il bucato",
    justListen: "ascolta e basta →",
  },
} satisfies LaundromatCopy;
