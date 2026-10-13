import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const fr = {
  locale: "fr",
  languageName: "Français",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe : un minuteur de concentration cosy, avec du lofi",
    description:
      "Fais ta lessive comme minuteur de concentration dans une laverie tranquille. Laver, sécher, se concentrer, lofi, café, un carnet pour des inconnus, ou juste rêvasser. Gratuit, sans inscription.",
    intro:
      "Une laverie tranquille dans ton navigateur. Lance un lave-linge ou un sèche-linge de 5 à 60 minutes comme minuteur de concentration et reçois une notification à la fin, écoute des stations lo-fi à la télé, prépare un café et laisse un mot écrit à la main dans le carnet partagé. Les carnets remplis vont sur l'étagère.",
    keywords: [
      "laverie",
      "minuteur de concentration",
      "pomodoro",
      "lofi",
      "musique pour travailler",
      "étudier avec moi",
      "cosy",
      "carnet partagé",
    ],
    inspiredBy: "inspiré de",
    openGraphLocale: "fr_FR",
  },
  toolbar: {
    soundOn: "son activé",
    soundOff: "son coupé",
    share: "partager",
    linkCopied: "lien copié",
    shareText:
      "Une laverie tranquille dans ton navigateur. Lance une machine, laisse tourner le minuteur et lis les mots que les autres ont laissés.",
    language: "Langue",
    settings: "réglages",
    builtBy: "fait avec ❤️ par Li Yuxuan",
    updateAvailable: "mis à jour · recharger",
  },
  settings: {
    heading: "réglages",
    rendering: "rendu",
    renderingHint:
      "lite retire la lumière douce, le balancement de la plante et le zoom vers le carnet et le panneau. utile sur les appareils plus lents ou quand la mémoire manque.",
    qualityAuto: "auto",
    qualityAutoHint: (o: { quality: string }) =>
      `sur cet appareil : ${o.quality}`,
    qualityFull: "complet",
    qualityFullHint: "toute la lumière et le mouvement",
    qualityLite: "lite",
    qualityLiteHint: "plus léger pour la mémoire et la batterie",
    close: "fermer",
    closeHint: "échap pour fermer",
  },
  tabDone: "fini",
  readoutDone: "fini",
  matWelcome: "bienvenue",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "Lave-linge" : "Sèche-linge"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, libre`,
    freeTooltip: (o: { name: string }) => `${o.name} · libre`,
    loadedLabel: (o: { name: string }) => `${o.name}, chargé, prêt à démarrer`,
    loadedTooltip: (o: { name: string }) => `${o.name} · chargé`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, ${o.kind === "washer" ? "lavage" : "séchage"} en cours, encore ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "lavage" : "séchage"} en cours · fini à ${o.time}`,
    doneLabel: (o: { name: string }) => `${o.name}, fini, sors ton linge`,
    doneTooltip: (o: { name: string }) => `${o.name} · fini`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, ${o.kind === "washer" ? "lave" : "sèche"} le linge de quelqu'un d'autre, encore ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `quelqu'un fait ${o.kind === "washer" ? "une lessive" : "un séchage"} · fini à ${o.time}`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, le linge de quelqu'un d'autre est dedans`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · linge de quelqu'un d'autre, pas lancé`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, le linge de quelqu'un d'autre est prêt`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · à quelqu'un d'autre, fini`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · fini`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "sors ton linge et choisis un sèche-linge"
        : "ton linge est sec",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name}, ${{ dial: "sélecteur", start: "bouton de démarrage", door: "porte" }[o.control]} : quelqu'un d'autre s'en sert`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "lavage" : "séchage"} de quelqu'un d'autre · fini à ${o.time}`,
    othersLoadedTooltip: "linge de quelqu'un d'autre · pas encore lancé",
    othersDoneTooltip:
      "le linge de quelqu'un d'autre · attend son propriétaire",
    doneAt: (o: { time: string }) => `fini à ${o.time}`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name}, programme, ${o.minutes} minutes`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `tourner · ${o.minutes} min → ${o.nextMinutes} min`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name}, démarrer, ${o.kind === "washer" ? "lavage" : "séchage"} de ${o.minutes} minutes${o.canNotify ? ", te prévient à la fin" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `démarrer · ${o.kind === "washer" ? "lavage" : "séchage"} de ${o.minutes} min${o.canNotify ? " · te prévient" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, me prévenir à la fin du ${o.kind === "washer" ? "lavage" : "séchage"}`,
    remindTooltip: (o: { doneAt: string }) => `me prévenir · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) =>
      `${o.name}, démarrer, ${o.reminderOn ? "rappel activé, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `rappel activé · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name}, démarrer`,
    loadFirstTooltip: "mets d'abord du linge",
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "lavage" : "séchage"} en cours · ${o.doneAt}`,
    doneDoorTooltip: "ouvrir la porte · sortir le linge",
    loadedDoorTooltip: "ouvrir la porte · ressortir le linge",
    loadableDoorTooltip: "mettre le linge",
    doorLabel: (o: { name: string }) => `${o.name}, porte`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name}, porte, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `Paillasson, rentre chez toi avec ton linge ${o.laundry === "folded" ? "sec" : "lavé"}`,
    readyTooltip: "rentrer · emporte ton linge",
    waitingLabel: "Paillasson, le chemin du retour une fois ton linge fini",
    waitingTooltip: "le chemin du retour · finis d'abord ta lessive",
  },
  laundryBasket: {
    labels: {
      empty: "Panier à linge, vide",
      dirty: "Panier à linge, linge à laver",
      wet: "Panier à linge, linge mouillé à sécher",
      folded: "Panier à linge, linge propre et sec",
    },
    tooltips: {
      empty: "panier · vide",
      dirty: "linge sale · dans une machine à laver",
      wet: "linge mouillé · dans un sèche-linge",
      folded: "propre et sec · prêt à rentrer",
    },
  },
  coffee: {
    machineLabel: "Machine à café",
    brewingMachineLabel: "Machine à café, café en préparation",
    brewingTooltip: "ça coule…",
    idleSwitchLabel: "Bouton de la machine à café, préparer un café",
    idleSwitchTooltip: "préparer un café",
    brewingSwitchLabel: "Bouton de la machine à café, café en préparation",
    readyMachineLabel: "Machine à café, du café dans la verseuse",
    readyMachineTooltip: "le café est prêt",
    topUpSwitchLabel: "Bouton de la machine à café, remplir la verseuse",
    topUpSwitchTooltip: "remplir la verseuse",
    fullSwitchLabel: "Bouton de la machine à café, la verseuse est pleine",
    fullSwitchTooltip: "la verseuse est pleine · sers une tasse d'abord",
    emptyFlaskLabel: "Verseuse, vide",
    emptyFlaskTooltip: "la verseuse est vide",
    brewingFlaskLabel: "Verseuse, café en préparation",
    othersBrewingMachineLabel: "Machine à café, quelqu'un fait du café",
    othersBrewingSwitchLabel:
      "Bouton de la machine à café, quelqu'un fait du café",
    othersBrewingFlaskLabel: "Verseuse, quelqu'un fait du café",
    othersBrewingTooltip: (o: { time: string }) =>
      `quelqu'un fait du café · fini à ${o.time}`,
    pourLabel: "Verseuse, servir une tasse",
    pourTooltip: "servir une tasse",
    cupFullFlaskLabel: "Verseuse, finis ta tasse d'abord",
    cupFullFlaskTooltip: "finis ta tasse d'abord",
    fullCupLabel: "Tasse de café, boire",
    fullCupTooltip: "boire",
    emptyCupLabel: "Tasse de café, vide",
    emptyCupTooltip: "tasse vide",
  },
  plant: {
    label: "Plante, toucher de l'herbe",
    tooltip: "toucher de l'herbe",
  },
  board: {
    label: "Panneau, les nouveautés de la laverie",
    tooltip: "quoi de neuf",
    eyebrow: "panneau d'affichage",
    heading: "quoi de neuf",
    subtitle:
      "Petits changements dans la laverie, les plus récents en premier.",
    updated: (o: { date: string }) => `mis à jour le ${o.date}`,
    footer: "toujours ouvert, 24 h/24",
    close: "fermer",
    closeHint: "échap pour fermer",
    tags: {
      opening: "ouverture",
      tv: "télé",
      notebook: "carnet",
      languages: "langues",
      room: "salle",
      coffee: "café",
      window: "fenêtre",
      light: "lumière",
      board: "panneau",
    },
    updates: {
      "door-bell": {
        title: "une clochette à la porte",
        body: "Une clochette tinte quand tu entres, et chaque fois que quelqu'un d'autre arrive.",
      },
      "whats-new-board": {
        title: "un panneau des nouveautés",
        body: "Ce présentoir montre ce qui est nouveau. Mat comme du papier le jour, il s'éclaire la nuit.",
      },
      "twelve-stations": {
        title: "douze chaînes à la télé",
        body: "Sept nouvelles radios lofi remplissent le cadran, de la salle d'étude à l'espace lointain.",
      },
      "page-drag": {
        title: "tourner les pages en glissant",
        body: "Fais glisser n'importe où le long du bord extérieur d'une page pour la tourner.",
      },
      "window-light": {
        title: "le soleil par la fenêtre",
        body: "La lumière du jour atteint les machines et le sol, et se réchauffe au lever et au coucher du soleil.",
      },
      "shared-coffee": {
        title: "partager une cafetière",
        body: "Jusqu'à sept personnes se servent dans la même verseuse.",
      },
      "street-view": {
        title: "la rue dehors",
        body: "La fenêtre donne sur la rue, éclairée par le soleil ou la lune.",
      },
      "tube-counter": {
        title: "qui est là",
        body: "Les tubes du mur du fond comptent tout le monde dans la laverie, toi compris.",
      },
      "coffee-counter": {
        title: "du café sur le comptoir",
        body: "Prépare une cafetière, sers-toi une tasse et bois-la pendant que le linge tourne.",
      },
      "shared-machines": {
        title: "les autres font leur lessive",
        body: "Vois quelles machines les autres utilisent. Leur linge reste en place quand tu charges le tien.",
      },
      "eighteen-languages": {
        title: "ouvert en 18 langues",
        body: "Toute la laverie parle ta langue. Change-la depuis le globe dans le coin.",
      },
      "shared-notebook": {
        title: "un carnet pour les inconnus",
        body: "Laisse un mot à la prochaine personne. Les carnets pleins vont sur l'étagère.",
      },
      "lofi-tv": {
        title: "du lofi à la télé",
        body: "Allume la télé pour la radio lofi, avec un bouton de chaînes et un de volume.",
      },
      opening: {
        title: "laundro.cafe ouvre",
        body: "Une laverie calme dans ton navigateur : laver, sécher, se concentrer de 5 à 60 minutes.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Compteur à tubes, ${o.count === 1 ? "rien que toi ici" : `${o.count} personnes ici`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "rien que toi ici" : `${o.count} personnes ici`,
    offLabel: "Compteur à tubes, éteint",
    offTooltip: "éteint",
  },
  tv: {
    stations: {
      "rainy-cafe": "café sous la pluie",
      "piano-night": "nuit au piano",
      "late-wash": "lessive tardive",
      "tape-hiss": "souffle de cassette",
      "city-at-3am": "la ville à 3 h",
      "study-hall": "salle d'étude",
      "smoky-jazz": "jazz enfumé",
      fireplace: "coin du feu",
      "neon-tokyo": "tokyo néon",
      "string-quartet": "quatuor à cordes",
      "porch-guitar": "guitare sous le porche",
      "deep-space": "espace lointain",
    },
    station: (o: { channel: string; name: string }) =>
      `ch ${o.channel} · ${o.name}`,
    offLabel: "Télé, éteinte",
    offTooltip: "télé · éteinte",
    onLabel: (o: { station: string }) => `Télé, allumée, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `Écran de la télé, ${o.station}, regarder sur YouTube`,
    screenOnTooltip: "regarder sur YouTube ↗",
    screenOffLabel: "Écran de la télé, éteint, allumer",
    turnOn: "allumer",
    tunerLabel: (o: { station: string }) => `Chaîne de la télé, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) =>
      `station suivante · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) =>
      `Volume de la télé, ${o.percent} %`,
    volumeTooltip: (o: { percent: number }) => `volume · ${o.percent} %`,
    powerOnLabel: "Alimentation de la télé, allumée, éteindre",
    turnOff: "éteindre",
    powerOffLabel: "Alimentation de la télé, éteinte, allumer",
    noSignal: "pas de signal",
  },
  shelf: {
    loadingLabel: "Étagère, recherche de carnets remplis",
    loadingTooltip: "coup d'œil à l'étagère…",
    offlineLabel: "Étagère, hors ligne pour le moment",
    offlineTooltip: "l'étagère est hors ligne pour le moment",
    emptyLabel: "Étagère, aucun carnet rempli pour l'instant",
    emptyTooltip: "aucun carnet rempli pour l'instant",
    readyLabel: "Regarder l'étagère des carnets remplis",
    bookCount: (o: { count: number }) =>
      o.count === 1 ? "1 carnet rempli" : `${o.count} carnets remplis`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `Ouvrir le carnet nº ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) =>
      `${o.count} ${o.count === 1 ? "mot" : "mots"}`,
  },
  notebook: {
    objectLabel: "Ouvrir le carnet",
    objectTooltip: "des mots d'inconnus",
    number: (o: { number: number }) => `nº ${o.number}`,
    dialogLabel: (o: { number: number }) => `Carnet nº ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `depuis le ${o.day}`,
    insideCover: "contre-plat",
    insideCoverAndPage: (o: { page: number }) => `contre-plat · p. ${o.page}`,
    page: (o: { page: number }) => `p. ${o.page}`,
    pages: (o: { left: number; right: number }) => `p. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `Page ${o.page}, aller à une autre page`,
    previousPage: "Page précédente",
    nextPage: "Page suivante",
    scrubberLabel: "Page",
    goToPage: "aller à la page",
    pageInputLabel: (o: { pageCount: number }) =>
      `Numéro de page, de 1 à ${o.pageCount}`,
    report: "signaler",
    reported: "signalé",
    opening: "ouverture du carnet…",
    missing: (o: { number: number }) => `il n'y a pas de carnet nº ${o.number}`,
    full: (o: { number: number }) =>
      `le carnet nº ${o.number} est plein · lecture seule`,
    someoneWritingInNotebook:
      "quelqu'un écrit dans le carnet · attends ton tour",
    someoneWriting: "quelqu'un est en train d'écrire · attends ton tour",
    comeBackToWrite: "reviens dans deux minutes pour en écrire un autre",
    startsNext: (o: { number: number }) =>
      `ce mot ouvre le carnet nº ${o.number}`,
    writePromptBeforeKeys: "écris un mot pour la prochaine personne · ",
    writePromptAfterKeys: " pour l'enregistrer",
    textareaLabel: "Écrire un mot dans le carnet",
    notifyWhenFree: "préviens-moi quand il est libre",
    notifyPending: "on te préviendra",
    saveNote: "enregistrer mon mot",
    savingNote: "enregistrement…",
    close: "fermer",
    freeNotificationTitle: "le carnet est libre",
    freeNotificationBody: "à toi d'écrire",
    leaveFailures: {
      offline: "le carnet est hors ligne pour le moment · ton mot reste ici",
      rate_limited: "un mot toutes les deux minutes · réessaie bientôt",
      contains_link: "pas de liens dans le carnet",
      too_long: "trop long pour le carnet · raccourcis un peu",
      sign_off_too_long: "la signature est trop longue",
      empty_body: "écris d'abord quelque chose",
      unknown: "un problème est survenu · réessaie",
    },
  },
  firstVisit: {
    garments: {
      tee: "t-shirt",
      jeans: "jean",
      sweater: "pull",
      towel: "serviette",
      socks: "chaussettes",
      shirt: "chemise",
    },
    garmentLabel: (o: { garment: string }) =>
      `Mettre dans le panier : ${o.garment}`,
    basketEmpty: "jette ici les vêtements qui traînent par terre",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.count} sur ${o.total} dedans · ajoute-en d'autres, ou va vers la porte`,
    basketFull: "tout est dedans · va vers la porte",
    lampOffTooltip: "éteindre la lampe",
    lampOnTooltip: "allumer la lampe",
    lampOffLabel: "Éteindre la lampe",
    lampOnLabel: "Allumer la lampe",
    doorReadyTooltip: "l'emporter à la laverie",
    doorWaitingTooltip: "ramasse d'abord ton linge",
    doorReadyLabel: "Emporter le panier à la laverie",
    doorWaitingLabel: "Porte vers la laverie, ramasse d'abord ton linge",
    justListen: "juste écouter →",
  },
} satisfies LaundromatCopy;
