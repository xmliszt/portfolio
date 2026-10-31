import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const fr = {
  locale: "fr",
  decorations: {
    skeleton: { label: "Squelette : dis bonjour" },
    pumpkin: {
      label: "Citrouille : tapote-la",
    },
    ghost: { label: "Fantôme : fais bouh" },
  },
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
    shareImage: {
      headline: "une laverie tranquille dans ton navigateur.",
      subline:
        "laver, sécher, se concentrer, lofi, café, un carnet pour des inconnus, ou juste rêvasser",
    },
  },
  toolbar: {
    soundOn: "son activé",
    soundOff: "son coupé",
    language: "Langue",
    settings: "réglages",
    builtBy: {
      beforeClaude: "fait avec ❤️ par Li Yuxuan et ",
      afterClaude: "",
    },
    updateAvailable: "recharge pour la laverie mise à jour",
  },
  otherApps: {
    heading: "autres applis",
    hint: "D’autres petites choses du même créateur. Chacune s’ouvre dans un nouvel onglet.",
  },
  themes: {
    heading: "thèmes",
    seasonal: "saisonnier",
    seasonalOn: "Change pour les occasions spéciales",
    seasonalOff: "Garde le thème choisi",
    hint: "Choisissez un thème",
    names: { classic: "par défaut", light: "lin", halloween: "halloween" },
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
    temperature: "température",
    weather: "météo",
    placeLabel: "lieu de la météo",
    placePlaceholder: "chercher une ville",
    placeLive: "en direct",
    placeNearYou: "près de toi",
    placeSearching: "recherche…",
    placeNoResults: "aucun lieu trouvé",
    conditionLabel: "ciel",
    conditionLive: "météo en direct",
    weatherHint:
      "la météo en direct est estimée d'après ton adresse IP, elle peut donc parfois se tromper. choisis une ville ou un ciel pour la régler toi-même. l'unité de température suit le lieu tant que tu n'en choisis pas une.",
    roomSounds: "sons de la salle",
    roomSoundsHint:
      "les sons de la salle et des gens qui s'y trouvent. couper ou baisser un son ne le change que pour toi.",
    roomSoundsAllOn: "tout activer",
    roomSoundsAllOff: "tout couper",
    roomSoundOn: "act.",
    roomSoundOff: "coupé",
    roomSoundVolume: (o: { sound: string }) => `volume : ${o.sound}`,
    roomMix: {
      play: "écouter le mix de la salle",
      playing: "ton mix en cours",
      playLabel: "écouter le mix de la salle à tes niveaux",
      stopLabel: "arrêter le mix de la salle",
    },
    ticket: {
      heading: "ticket de laverie",
      hint: "imprime un ticket pour garder tes réglages dans un petit fichier et copier un lien vers eux. ouvre le lien, ou insère le fichier ici, sur n'importe quel appareil pour les retrouver.",
      print: "imprimer",
      insert: "insérer",
      printLabel:
        "imprimer un ticket de laverie, qui enregistre tes réglages dans un fichier et copie un lien vers eux",
      insertLabel:
        "insérer un ticket de laverie, qui charge tes réglages depuis un fichier",
      ready: "prêt",
      printing: "impression…",
      saved: "enregistré",
      linkCopied: "lien copié",
      linkLabel: "lien vers ton ticket de laverie",
      copyLink: "copier le lien",
      copied: "copié",
      linkHint:
        "ouvre ce lien sur un autre appareil pour y retrouver tes réglages.",
      reading: "lecture…",
      loaded: "chargé",
      unreadable: "illisible",
      title: "ticket de laverie",
      number: (o: { number: string }) => `n° ${o.number}`,
      tv: (o: { percent: number }) => `télé ${o.percent}%`,
    },
    roomSound: {
      machines: {
        label: "machines",
        hint: "lave-linge et sèche-linge qui tournent",
      },
      "shop-bell": { label: "clochette", hint: "sonne quand quelqu'un entre" },
      unloading: {
        label: "déchargement",
        hint: "un loquet quand quelqu'un récupère son linge",
      },
      coffee: {
        label: "café",
        hint: "le glouglou de l'infusion et le bip quand c'est prêt",
      },
      tv: {
        label: "neige de la télé",
        hint: "le souffle de la télé sans signal",
      },
      lamp: {
        label: "lampe",
        hint: "la lampe qui grésille en s'allumant et claque en s'éteignant",
      },
      weather: {
        label: "météo",
        hint: "pluie et tonnerre derrière la fenêtre",
      },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
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
    needsWashingTooltip: "lave-le d'abord",
    alreadyWashedTooltip: "déjà lavé · passe au séchage",
    alreadyDryTooltip: "déjà sec · rapporte-le chez toi",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `ton linge t'attend dans ${o.name}`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "ton linge est encore en train de laver"
        : "ton linge est encore en train de sécher",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `ton linge est prêt · dans ${o.name}`,
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
    readyTooltip: "rentrer chez toi · emporte ton linge propre",
    awayLabel:
      "Paillasson, rentre chez toi et laisse ton linge dans la machine",
    awayTooltip: "rentrer chez toi · ton linge reste dans la machine",
    wetLabel: "Paillasson, rentre chez toi avec le linge mouillé",
    wetTooltip: "rentrer chez toi · le linge est encore mouillé",
    dirtyLabel: "Paillasson, mets le linge dans un lave-linge avant de rentrer",
    dirtyTooltip: "lave-le d'abord · mets le linge dans un lave-linge",
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
    blessings: [
      "chance",
      "fortune",
      "calme",
      "joie",
      "santé",
      "bon sommeil",
      "linge propre",
      "café chaud",
      "concentration",
      "gentillesse",
      "soleil",
      "bonnes nouvelles",
    ],
    blessing: (o: { count: number; word: string }) => `+${o.count} ${o.word}`,
  },
  toyBox: {
    closedLabel:
      "Boîte à jouet marquée 1955, ouvrir la boîte à jouet « C’est le futur »",
    closedTooltip: "ouvrir la boîte à jouet « C’est le futur »",
    setLabel: "Voiture volante jouet, jouer",
    setTooltip: "jouer",
  },
  instantCamera: {
    objectLabel: "Appareil photo instantané, prendre une photo",
    objectTooltip: "prendre une photo",
    toolbar: "prendre une photo",
    viewfinderLabel:
      "Viseur. Fais glisser pour cadrer la photo, tire un coin pour la redimensionner, appuie sur Entrée pour la prendre.",
    hint: "glisse pour cadrer · tire un coin pour redimensionner",
    snapFailed: "la photo n'est pas sortie · réessaie",
    putDown: "poser",
    shutter: "Prendre la photo",
    portrait: "portrait",
    landscape: "paysage",
    turnToLandscape: "Tourner l'appareil en paysage",
    turnToPortrait: "Tourner l'appareil en portrait",
    cardLabel: "Ta photo",
    photoAlt: "Ta photo instantanée",
    notePlaceholder: "écris un petit mot…",
    noteLabel: "Mot sur la photo",
    retake: "reprendre",
    copy: "copier",
    done: "terminé",
    copied: "photo copiée",
    copyFailed: "impossible de copier la photo ici",
    shareOn: (o: { platform: string }) => `Partager sur ${o.platform}`,
    share: "partager",
    shareLabel: "Partager la photo",
    more: "plus",
    moreLabel: "Autres façons de partager",
    download: "télécharger",
    downloadLabel: "Télécharger la photo",
    downloaded: "photo téléchargée",
    shareText: "photo prise à laundro.cafe",
    handoff: {
      copiedTitle: "Photo copiée",
      savedTitle: "Photo enregistrée",
      opening: (o: { platform: string; seconds: number }) =>
        `Ouverture de ${o.platform} dans ${o.seconds}…`,
      pasteInPost: {
        before: "Colle la photo dans ta publication avec ",
        after: ".",
      },
      pasteInChat: {
        before: "Choisis une discussion, puis colle la photo avec ",
        after: ".",
      },
      pasteInNewPost: {
        before: "Commence une publication, puis colle la photo avec ",
        after: ".",
      },
      pickFromDownloads: (o: { file: string }) =>
        `Clique sur Créer, puis choisis ${o.file} dans tes téléchargements.`,
      blocked: "Ton navigateur a retenu le nouvel onglet.",
      openNow: (o: { platform: string }) => `Ouvrir ${o.platform} maintenant`,
      open: (o: { platform: string }) => `Ouvrir ${o.platform}`,
      cancel: "Annuler",
      pasteReminder: (o: { platform: string; keys: string }) =>
        `photo copiée · colle-la dans ${o.platform} avec ${o.keys}`,
      savedReminder: (o: { platform: string }) =>
        `photo enregistrée · ajoute-la dans ${o.platform} avec créer`,
    },
    mastodon: {
      ask: "mastodon doit connaître ton serveur",
      server: "ton serveur",
      post: "publier",
    },
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
      "dreamcore-station": {
        title: "une chaîne dreamcore à la télé",
        body: "Tournez le cadran au-delà de l'espace lointain pour une radio dreamcore de musique ambiante douce et pleine d'écho.",
      },
      "halloween-theme": {
        title: "halloween dans les pièces",
        body: "Choisissez Halloween dans les thèmes ou activez le mode saisonnier pour suivre les occasions. Avec le thème Halloween, allumez la télé pour écouter une station de musique d’Halloween en direct; touche les décorations pour une petite surprise.",
      },
      "light-appearance": {
        title: "une pièce couleur lin",
        body: "Choisissez Lin avec le bouton des thèmes pour des murs plus chauds et des commandes couleur papier. Activez Saisonnier pour suivre les occasions spéciales, ou gardez votre thème.",
      },
      "tip-coin-machine": {
        title: "laisser un pourboire à la machine à pièces",
        body: "Si tu souhaites soutenir laundro.cafe, laisse un petit pourboire à la machine à pièces près du comptoir. Ta pièce tombe dans le bocal et la machine t’imprime un jeton. Glisse-le dans un lave-linge ou un sèche-linge pour un lavage en fête ou un séchage en fête que tout le monde dans la salle peut voir. Merci pour ton soutien.",
      },
      "instant-camera": {
        title: "prends une photo de la pièce",
        body: "Prends l'appareil photo instantané sur le tabouret ou sur le lit, cadre n'importe quel coin de la pièce et déclenche. Écris un petit mot sur le tirage, puis partage-le ou copie-le pour l'envoyer à un ami.",
      },
      "notebook-doodles": {
        title: "dessine dans le carnet",
        body: "Passe le stylo du carnet d'écrire à dessiner et laisse un petit dessin à la prochaine personne. Chaque personne dans la laverie qui a le carnet ouvert le voit se dessiner tout seul sur la page.",
      },
      "weather-anywhere": {
        title: "choisis la météo dehors",
        body: "Dans les réglages, choisis une ville pour voir sa météo par la fenêtre et sur le panneau, ou choisis toi-même le ciel. Par défaut, c'est toujours la météo en direct.",
      },
      "room-sound-mixer": {
        title: "mixe la salle à ta façon",
        body: "Chaque son de la salle a maintenant son propre curseur dans les réglages, pour que la pluie soit plus forte et les machines plus douces. Écoute le mix de la salle pour les entendre ensemble, et imprime un ticket de laverie pour garder tes réglages ou les emporter sur un autre appareil.",
      },
      "weather-panel": {
        title: "la météo, dedans et dehors",
        body: "Un panneau au-dessus de la fenêtre affiche la météo là où tu es, avec les températures max et min du jour et la qualité de l'air. Les fenêtres la montrent aussi, pluie, neige, brouillard ou orage, avec le son qui va avec. Ta ville est devinée à peu près d'après ta connexion. Quand l'air devient mauvais, un purificateur se met en marche dans le coin.",
      },
      "room-sound-dials": {
        title: "choisis les sons que tu entends",
        body: "Les réglages ont maintenant un bouton rotatif pour chaque son de la salle, des machines à la clochette. Coupe ceux que tu préfères ne pas entendre. Pour les autres, la salle reste la même.",
      },
      "home-mid-wash": {
        title: "rentre pendant que ça tourne",
        body: "Passe sur le paillasson pour rentrer pendant que ton linge tourne. Le linge mouillé rentre dans le panier, le linge sec finit sur le lit.",
      },
      "bedroom-curtains": {
        title: "des rideaux et une nouvelle lampe chez toi",
        body: "Clique sur les rideaux ou la lampe de ta chambre. Les deux pièces s'éclairent et s'assombrissent désormais avec le soleil, la lune et les lampes.",
      },
      "settings-lite": {
        title: "des réglages et un mode léger",
        body: "L'engrenage de la barre ouvre les réglages. Passe en mode léger sur les appareils lents pour économiser mémoire et batterie.",
      },
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
  airPurifier: {
    label: (o: { aqi: number }) =>
      `Purificateur d'air, en marche, AQI ${o.aqi}`,
    tooltip: "purificateur d'air · nettoie l'air",
    offLabel: "Purificateur d'air, éteint",
    offTooltip: "éteint",
  },
  weatherPanel: {
    conditions: {
      sunny: "ensoleillé",
      clear: "dégagé",
      cloudy: "nuageux",
      fog: "brouillard",
      rain: "pluie",
      snow: "neige",
      thunder: "orage",
    },
    outside: "dehors",
    high: "max",
    low: "min",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `Panneau météo, ${o.temperature} ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "bonne",
      moderate: "moyenne",
      sensitive: "mauvaise pour les sensibles",
      unhealthy: "mauvaise",
      veryUnhealthy: "très mauvaise",
      hazardous: "dangereuse",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `qualité de l'air ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `air ${o.band}`,
    offLabel: "Panneau météo, pas de relevé",
    offTooltip: "pas encore de relevé",
  },
  tv: {
    stations: {
      halloween: "halloween",
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
      dreamcore: "dreamcore",
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
    beKind: "Soyez gentils les uns avec les autres.",
    reportRule: (o: { count: number }) =>
      `Une note signalée par ${o.count} personnes est retirée pour de bon.`,
    reportDialog: {
      title: "Signaler ce mot ?",
      body: "Les signalements aident à garder le carnet bienveillant.",
      reasonLabel: "motif (facultatif)",
      reasonPlaceholder: "qu'est-ce qui ne va pas ?",
      cancel: "annuler",
      confirm: "signaler",
    },
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
    writePrompt: "écris un mot pour la prochaine personne",
    writePromptBeforeKeys: "écris un mot pour la prochaine personne · ",
    writePromptAfterKeys: " pour l'enregistrer",
    textareaLabel: "Écrire un mot dans le carnet",
    notifyWhenFree: "préviens-moi quand il est libre",
    notifyPending: "on te préviendra",
    saveNote: "enregistrer mon mot",
    saveDoodle: "enregistrer mon dessin",
    penModeLabel: "Stylo",
    penModes: { write: "écrire", draw: "dessiner" },
    drawPrompt: "dessine quelque chose pour la prochaine personne",
    doodleMoved: (o: { page: number }) =>
      `plus de place sur cette page · dessin sur la p. ${o.page}`,
    doodleBookFull:
      "plus de place pour un dessin dans ce carnet · écris plutôt un mot",
    inkFull: "plus de place pour l'encre · enregistre ou annule",
    someoneDrawingInNotebook:
      "quelqu'un dessine dans le carnet · attends ton tour",
    padLabel: "Espace de dessin dans le carnet",
    drawingNow: "dessin en cours…",
    someoneDrawingNow: "quelqu'un dessine…",
    undo: "annuler",
    clear: "effacer",
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
    basketWet: "le linge est encore mouillé · sèche-le à la laverie",
    lampOffTooltip: "éteindre la lampe",
    lampOnTooltip: "allumer la lampe",
    lampOffLabel: "Éteindre la lampe",
    lampOnLabel: "Allumer la lampe",
    curtainCloseTooltip: "fermer les rideaux",
    curtainOpenTooltip: "ouvrir les rideaux",
    curtainCloseLabel: "Fermer les rideaux",
    curtainOpenLabel: "Ouvrir les rideaux",
    bedTooltip: "aller dormir",
    bedLabel: "Aller dormir",
    goodNight: "Bonne nuit",
    notSleepy: "j'veux plus dormir",
    doorReadyTooltip: "l'emporter à la laverie",
    doorWaitingTooltip: "ramasse d'abord ton linge",
    doorAwayTooltip: "retour à la laverie · ton linge est dans la machine",
    doorAwayLabel: "Retour à la laverie, ton linge est encore dans la machine",
    doorReadyLabel: "Emporter le panier à la laverie",
    doorWaitingLabel: "Porte vers la laverie, ramasse d'abord ton linge",
    justListen: "juste écouter →",
  },
  tip: {
    machineLabel: "Machine à pièces, laisser un pourboire",
    machineTooltip: "laisser un pourboire",
    machineScreenIdle: "PIÈCES",
    machineScreenThanks: "MERCI",
    jarLoadingLabel: "Bocal à pourboires",
    jarLoadingTooltip: "bocal à pourboires",
    jarLabel: (o: { count: number }) =>
      `Bocal à pourboires, ${o.count} ${o.count === 1 ? "jeton" : "jetons"} à l'intérieur`,
    jarTooltip: (o: { count: number }) =>
      `${o.count} ${o.count === 1 ? "jeton" : "jetons"} dans le bocal`,
    dialogLabel: "Machine à pièces",
    close: "Fermer",
    screen: {
      pick: "insère une pièce",
      custom: "tape le montant",
      checkout: (o: { amount: string }) => `pourboire ${o.amount}`,
      waiting: "attente du paiement",
      notPaid: "paiement non abouti",
      dropping: "sortie du jeton",
      token: "merci",
      restore: "tape le code du jeton",
      checking: "lecture du code",
      notFound: "code introuvable",
      misread: "vérifie le code",
      offline: "réessaie plus tard",
    },
    note: "merci !",
    pitch:
      "Chaque pourboire imprime un jeton. Glisse-le dans un lave-linge ou un sèche-linge pour un lavage en fête ou un séchage en fête que tout le monde ici peut voir. Plus la pièce est grosse, plus il sert.",
    coinLabel: (o: { amount: string; uses: number }) =>
      `Pourboire de ${o.amount}, un jeton de ${o.uses} ${o.uses === 1 ? "utilisation" : "utilisations"}`,
    coinUses: (o: { count: number }) =>
      `${o.count} ${o.count === 1 ? "utilisation" : "utilisations"}`,
    usesLeft: (o: { left: number; total: number }) =>
      `encore ${o.left} sur ${o.total}`,
    leftNotice: (o: { left: number }) =>
      o.left === 0
        ? "c'était sa dernière utilisation"
        : `encore ${o.left} ${o.left === 1 ? "utilisation" : "utilisations"} sur ce jeton`,
    other: "autre montant",
    otherLabel: "Autre montant",
    insert: "insérer",
    secure: "paiement sécurisé par stripe",
    haveCode: "tu as un code de jeton ?",
    change: "changer",
    testMode: "mode test · aucun argent ne circule",
    orPayWith: "ou",
    pay: (o: { amount: string }) => `Payer ${o.amount}`,
    processing: "Traitement en cours",
    unavailable:
      "La machine à pièces se repose. Réessaie dans un petit moment.",
    waitingForBank: "En attente de ta banque",
    waitingNote: "Tu peux fermer ceci. Ton jeton arrivera dans ta poche.",
    poweredBy: "Powered by stripe",
    receiptKind: "jeton de pourboire",
    receiptNumber: (o: { number: string }) => `n° ${o.number}`,
    receiptCode: "code du jeton",
    receiptNote: "merci pour ton soutien",
    keepCode: "Garde le code pour retrouver ce jeton sur un autre appareil.",
    copyLink: "copier le lien",
    copied: "copié",
    save: "enregistrer",
    done: "Terminé",
    restore: "récupérer",
    back: "retour",
    pocketLabel: (o: { number: number }) => `jeton n° ${o.number}`,
    pocketHeading: "tes jetons",
    dropInMachine: "mets-le dans une machine",
    dropInMachineHint:
      "Glisse-le dans un lave-linge ou un sèche-linge pour un lavage en fête ou un séchage en fête que tout le monde ici peut voir.",
    usedOn: (o: { date: string }) => `utilisé dans une machine · ${o.date}`,
    holdHint: "touche un lave-linge ou un sèche-linge",
    viewCoin: (o: { number: number }) => `Regarder le jeton n° ${o.number}`,
    turnCoin: "Retourner la pièce",
    coinNumberCaption: "n°",
    coinBackNote: "merci",
    coinRim: "merci",
    trayHeading: "bocal à pourboires",
    traySummary: (o: { count: number; isShining: boolean }) =>
      `${o.count} ${o.count === 1 ? "jeton" : "jetons"} dans le bocal${o.isShining ? " · les tiens brillent" : ""}`,
    trayHint: "touche ton jeton pour l'utiliser",
    trayPitch:
      "Laisse un pourboire à la machine à pièces pour un jeton. Glisse-le dans un lave-linge ou un sèche-linge pour un lavage en fête que tout le monde ici peut voir.",
    trayLeaveTip: "laisser un pourboire",
    receiptDescription: (o: { code: string; link: string }) =>
      `Merci pour ton pourboire à laundro.cafe ! Le code de ton jeton : ${o.code} ; si tu perds ton jeton, récupère-le sur tout appareil via ${o.link}.`,
    copyCode: "Copier le code",
    codeCopied: "Code copié",
    trayCoinLabel: (o: { number: number; date: string; isOwn: boolean }) =>
      `Pièce ${o.number}, ${o.date}${o.isOwn ? ", la tienne, regarde de plus près" : ""}`,
  },
} satisfies LaundromatCopy;
