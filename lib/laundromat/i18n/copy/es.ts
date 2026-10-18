import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const es = {
  locale: "es",
  languageName: "Español",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: un temporizador de concentración acogedor con lofi",
    description:
      "Haz la colada como temporizador de concentración en una lavandería tranquila. Lavar, secar, concentrarte, lofi, café, un cuaderno para desconocidos o simplemente desconectar. Gratis, sin registro.",
    intro:
      "Una lavandería tranquila en tu navegador. Pon una lavadora o una secadora de 5 a 60 minutos como temporizador de concentración y recibe un aviso cuando termine, escucha emisoras lo-fi en la tele, prepárate un café y deja una nota escrita a mano en el cuaderno compartido. Los cuadernos llenos van a la estantería.",
    keywords: [
      "lavandería",
      "temporizador de concentración",
      "pomodoro",
      "lofi",
      "música para trabajar",
      "estudia conmigo",
      "acogedor",
      "cuaderno compartido",
    ],
    inspiredBy: "inspirado en",
    openGraphLocale: "es_ES",
    shareImage: {
      headline: "una lavandería tranquila en tu navegador.",
      subline:
        "lavar, secar, concentrarte, lofi, café, un cuaderno para desconocidos o simplemente desconectar",
    },
  },
  toolbar: {
    soundOn: "sonido activado",
    soundOff: "sonido desactivado",
    language: "Idioma",
    settings: "ajustes",
    builtBy: {
      beforeClaude: "hecho con ❤️ por Li Yuxuan y ",
      afterClaude: "",
    },
    updateAvailable: "recarga para la lavandería actualizada",
  },
  settings: {
    heading: "ajustes",
    rendering: "gráficos",
    renderingHint:
      "lite quita la luz suave, el vaivén de la planta y el zoom hacia el cuaderno y el tablón. ayuda en dispositivos más lentos o con poca memoria.",
    qualityAuto: "auto",
    qualityAutoHint: (o: { quality: string }) =>
      `en este dispositivo: ${o.quality}`,
    qualityFull: "completo",
    qualityFullHint: "toda la luz y el movimiento",
    qualityLite: "lite",
    qualityLiteHint: "más ligero para la memoria y la batería",
    close: "cerrar",
    closeHint: "esc para cerrar",
    temperature: "temperatura",
    weather: "tiempo",
    placeLabel: "ubicación del tiempo",
    placePlaceholder: "busca una ciudad",
    placeLive: "en vivo",
    placeNearYou: "cerca de ti",
    placeSearching: "buscando…",
    placeNoResults: "no se encontraron lugares",
    conditionLabel: "cielo",
    conditionLive: "tiempo en vivo",
    weatherHint:
      "el tiempo en vivo se calcula a partir de tu dirección IP, así que a veces puede fallar. elige una ciudad o un cielo para fijarlo tú. la unidad de temperatura sigue al lugar hasta que elijas una.",
    roomSounds: "sonidos de la sala",
    roomSoundsHint:
      "sonidos de la sala y de la gente que hay en ella. si apagas o bajas uno, solo cambia para ti.",
    roomSoundsAllOn: "todo encendido",
    roomSoundsAllOff: "todo apagado",
    roomSoundOn: "enc.",
    roomSoundOff: "apag.",
    roomSoundVolume: (o: { sound: string }) => `volumen: ${o.sound}`,
    roomMix: {
      play: "escuchar la mezcla de la sala",
      playing: "suena tu mezcla",
      playLabel: "escuchar la mezcla de la sala a tus niveles",
      stopLabel: "parar la mezcla de la sala",
    },
    ticket: {
      heading: "resguardo de lavandería",
      hint: "imprime un resguardo para guardar tus ajustes en un archivo pequeño y copiar un enlace a ellos. abre el enlace, o inserta el archivo aquí, en cualquier dispositivo para recuperarlos.",
      print: "imprimir",
      insert: "insertar",
      printLabel:
        "imprimir un resguardo de lavandería, que guarda tus ajustes en un archivo y copia un enlace a ellos",
      insertLabel:
        "insertar un resguardo de lavandería, que carga tus ajustes desde un archivo",
      ready: "listo",
      printing: "imprimiendo…",
      saved: "guardado",
      linkCopied: "link copiado",
      linkLabel: "enlace a tu resguardo de lavandería",
      copyLink: "copiar enlace",
      copied: "copiado",
      linkHint:
        "abre este enlace en otro dispositivo para llevar tus ajustes allí.",
      reading: "leyendo…",
      loaded: "cargado",
      unreadable: "no válido",
      title: "resguardo de lavandería",
      number: (o: { number: string }) => `n.º ${o.number}`,
      tv: (o: { percent: number }) => `tele ${o.percent}%`,
    },
    roomSound: {
      machines: { label: "máquinas", hint: "lavadoras y secadoras girando" },
      "shop-bell": { label: "campanilla", hint: "suena cuando entra alguien" },
      unloading: {
        label: "recogida",
        hint: "un pestillo cuando alguien saca su ropa",
      },
      coffee: {
        label: "café",
        hint: "el borboteo al hacer café y el pitido de listo",
      },
      tv: {
        label: "estática de la tele",
        hint: "el siseo de la tele sin señal",
      },
      lamp: {
        label: "lámpara",
        hint: "la lámpara parpadea al encenderse y hace clic al apagarse",
      },
      weather: {
        label: "tiempo",
        hint: "lluvia y truenos al otro lado de la ventana",
      },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
  },
  tabDone: "listo",
  readoutDone: "listo",
  matWelcome: "bienvenidos",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "Lavadora" : "Secadora"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, libre`,
    freeTooltip: (o: { name: string }) => `${o.name} · libre`,
    loadedLabel: (o: { name: string }) =>
      `${o.name}, cargada, lista para empezar`,
    loadedTooltip: (o: { name: string }) => `${o.name} · cargada`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, ${o.kind === "washer" ? "lavando" : "secando"}, quedan ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "lavando" : "secando"} · termina a las ${o.time}`,
    doneLabel: (o: { name: string }) => `${o.name}, lista, saca tu ropa`,
    doneTooltip: (o: { name: string }) => `${o.name} · lista`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, ${o.kind === "washer" ? "lavando" : "secando"} la ropa de otra persona, quedan ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `otra persona está ${o.kind === "washer" ? "lavando" : "secando"} · termina a las ${o.time}`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, tiene la ropa de otra persona`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · ropa de otra persona, sin empezar`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, la ropa de otra persona está lista`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · de otra persona, lista`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · lista`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "saca tu ropa y elige una secadora"
        : "tu ropa ya está seca",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name}, ${{ dial: "selector", start: "botón de inicio", door: "puerta" }[o.control]}: lo está usando otra persona`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "lavado" : "secado"} de otra persona · termina a las ${o.time}`,
    othersLoadedTooltip: "ropa de otra persona · aún sin empezar",
    othersDoneTooltip: "ropa de otra persona · esperando a su dueño",
    doneAt: (o: { time: string }) => `termina a las ${o.time}`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name}, programa, ${o.minutes} minutos`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `girar · ${o.minutes} min → ${o.nextMinutes} min`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name}, iniciar, ${o.kind === "washer" ? "lavado" : "secado"} de ${o.minutes} minutos${o.canNotify ? ", te avisa al terminar" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `iniciar · ${o.kind === "washer" ? "lavado" : "secado"} de ${o.minutes} min${o.canNotify ? " · te avisa" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, avísame cuando termine el ${o.kind === "washer" ? "lavado" : "secado"}`,
    remindTooltip: (o: { doneAt: string }) => `avísame · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) =>
      `${o.name}, iniciar, ${o.reminderOn ? "aviso activado, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) =>
      `aviso activado · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name}, iniciar`,
    loadFirstTooltip: "primero mete la ropa",
    needsWashingTooltip: "lávala primero",
    alreadyWashedTooltip: "ya está lavada · ahora a secar",
    alreadyDryTooltip: "ya está seca · llévatela a casa",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `tu ropa te espera en ${o.name}`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "tu ropa todavía se está lavando"
        : "tu ropa todavía se está secando",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `tu ropa está lista · en ${o.name}`,
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "lavando" : "secando"} · ${o.doneAt}`,
    doneDoorTooltip: "abrir la puerta · sacar la ropa",
    loadedDoorTooltip: "abrir la puerta · volver a sacar la ropa",
    loadableDoorTooltip: "meter la ropa",
    doorLabel: (o: { name: string }) => `${o.name}, puerta`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name}, puerta, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `Felpudo, llévate tu ropa ${o.laundry === "folded" ? "seca" : "lavada"} a casa`,
    readyTooltip: "volver a casa · llévate la ropa limpia",
    awayLabel: "Felpudo, vuelve a casa y deja la ropa en la máquina",
    awayTooltip: "volver a casa · tu ropa se queda en la máquina",
    wetLabel: "Felpudo, vuelve a casa con la ropa mojada",
    wetTooltip: "volver a casa · la ropa sigue mojada",
    dirtyLabel: "Felpudo, mete la ropa en una lavadora antes de volver a casa",
    dirtyTooltip: "lávala primero · mete la ropa en una lavadora",
  },
  laundryBasket: {
    labels: {
      empty: "Cesto de la ropa, vacío",
      dirty: "Cesto de la ropa, ropa para lavar",
      wet: "Cesto de la ropa, ropa mojada para secar",
      folded: "Cesto de la ropa, ropa limpia y seca",
    },
    tooltips: {
      empty: "cesto · vacío",
      dirty: "ropa sucia · a una lavadora",
      wet: "ropa mojada · a una secadora",
      folded: "limpia y seca · lista para volver a casa",
    },
  },
  coffee: {
    machineLabel: "Cafetera",
    brewingMachineLabel: "Cafetera, preparando café",
    brewingTooltip: "preparando…",
    idleSwitchLabel: "Interruptor de la cafetera, preparar un café",
    idleSwitchTooltip: "preparar un café",
    brewingSwitchLabel: "Interruptor de la cafetera, preparando café",
    readyMachineLabel: "Cafetera, hay café en la jarra",
    readyMachineTooltip: "el café está listo",
    topUpSwitchLabel: "Interruptor de la cafetera, rellenar la jarra",
    topUpSwitchTooltip: "rellenar la jarra",
    fullSwitchLabel: "Interruptor de la cafetera, la jarra está llena",
    fullSwitchTooltip: "la jarra está llena · sirve una taza primero",
    emptyFlaskLabel: "Jarra de café, vacía",
    emptyFlaskTooltip: "la jarra está vacía",
    brewingFlaskLabel: "Jarra de café, preparando café",
    othersBrewingMachineLabel: "Cafetera, otra persona está preparando café",
    othersBrewingSwitchLabel:
      "Interruptor de la cafetera, otra persona está preparando café",
    othersBrewingFlaskLabel: "Jarra de café, otra persona está preparando café",
    othersBrewingTooltip: (o: { time: string }) =>
      `otra persona está preparando café · termina a las ${o.time}`,
    pourLabel: "Jarra de café, servir una taza",
    pourTooltip: "servir una taza",
    cupFullFlaskLabel: "Jarra de café, termina tu taza primero",
    cupFullFlaskTooltip: "termina tu taza primero",
    fullCupLabel: "Taza de café, beber",
    fullCupTooltip: "beber",
    emptyCupLabel: "Taza de café, vacía",
    emptyCupTooltip: "taza vacía",
  },
  plant: {
    label: "Planta, tocar pasto",
    tooltip: "tocar pasto",
    blessings: [
      "suerte",
      "fortuna",
      "calma",
      "alegría",
      "salud",
      "buen sueño",
      "ropa limpia",
      "café caliente",
      "concentración",
      "bondad",
      "sol",
      "buenas noticias",
    ],
    blessing: (o: { count: number; word: string }) => `+${o.count} ${o.word}`,
  },
  toyBox: {
    closedLabel:
      "Caja de juguete con el año 1955, abrir la caja de juguete de “Es el futuro”",
    closedTooltip: "abrir la caja de juguete de “Es el futuro”",
    setLabel: "Coche volador de juguete, jugar",
    setTooltip: "jugar",
  },
  instantCamera: {
    objectLabel: "Cámara instantánea, hacer una foto",
    objectTooltip: "hacer una foto",
    toolbar: "hacer una foto",
    viewfinderLabel:
      "Visor. Arrastra para encuadrar la foto, arrastra una esquina para cambiar su tamaño y pulsa Intro para hacerla.",
    hint: "arrastra para encuadrar · tira de una esquina para cambiar el tamaño",
    snapFailed: "la foto no salió · inténtalo de nuevo",
    putDown: "dejar",
    shutter: "Hacer la foto",
    portrait: "vertical",
    landscape: "horizontal",
    turnToLandscape: "Girar la cámara en horizontal",
    turnToPortrait: "Girar la cámara en vertical",
    cardLabel: "Tu foto",
    photoAlt: "Tu foto instantánea",
    notePlaceholder: "escribe una notita…",
    noteLabel: "Nota en la foto",
    retake: "repetir",
    copy: "copiar",
    done: "listo",
    copied: "foto copiada",
    copyFailed: "aquí no se pudo copiar la foto",
    shareOn: (o: { platform: string }) => `Compartir en ${o.platform}`,
    share: "compartir",
    shareLabel: "Compartir la foto",
    more: "más",
    moreLabel: "Más formas de compartir",
    shareText: "foto hecha en laundro.cafe",
    handoff: {
      copiedTitle: "Foto copiada",
      savedTitle: "Foto guardada",
      opening: (o: { platform: string; seconds: number }) =>
        `Abriendo ${o.platform} en ${o.seconds}…`,
      pasteInPost: {
        before: "Pega la foto en tu publicación con ",
        after: ".",
      },
      pasteInChat: { before: "Elige un chat y pega la foto con ", after: "." },
      pasteInNewPost: {
        before: "Empieza una publicación y pega la foto con ",
        after: ".",
      },
      pickFromDownloads: (o: { file: string }) =>
        `Haz clic en Crear y elige ${o.file} en tus descargas.`,
      blocked: "Tu navegador ha frenado la nueva pestaña.",
      openNow: (o: { platform: string }) => `Abrir ${o.platform} ahora`,
      open: (o: { platform: string }) => `Abrir ${o.platform}`,
      cancel: "Cancelar",
      pasteReminder: (o: { platform: string; keys: string }) =>
        `foto copiada · pégala en ${o.platform} con ${o.keys}`,
      savedReminder: (o: { platform: string }) =>
        `foto guardada · añádela en ${o.platform} con crear`,
    },
    mastodon: {
      ask: "mastodon necesita saber cuál es tu servidor",
      server: "tu servidor",
      post: "publicar",
    },
  },
  board: {
    label: "Tablón, novedades de la lavandería",
    tooltip: "novedades",
    eyebrow: "tablón de anuncios",
    heading: "novedades",
    subtitle: "Pequeños cambios en la lavandería, los más recientes primero.",
    updated: (o: { date: string }) => `actualizado el ${o.date}`,
    footer: "siempre abierto, 24/7",
    close: "cerrar",
    closeHint: "esc para cerrar",
    tags: {
      opening: "apertura",
      tv: "tv",
      notebook: "cuaderno",
      languages: "idiomas",
      room: "sala",
      coffee: "café",
      window: "ventana",
      light: "luz",
      board: "tablón",
    },
    updates: {
      "instant-camera": {
        title: "haz una foto del lugar",
        body: "Coge la cámara instantánea del taburete o de la cama, encuadra cualquier rincón y dispara. Escribe una nota corta en la foto impresa y luego compártela o cópiala para mandársela a un amigo.",
      },
      "notebook-doodles": {
        title: "dibuja en el cuaderno",
        body: "Cambia la pluma del cuaderno de escribir a dibujar y deja un pequeño dibujo para quien llegue después. Cualquiera en la lavandería con el cuaderno abierto ve cómo se dibuja solo en la página.",
      },
      "weather-anywhere": {
        title: "elige el tiempo de afuera",
        body: "En los ajustes, elige una ciudad para ver su tiempo por la ventana y en el panel, o elige tú el cielo. Por defecto sigue siendo el tiempo en vivo.",
      },
      "room-sound-mixer": {
        title: "mezcla la sala a tu gusto",
        body: "Cada sonido de la sala tiene ahora su propio control deslizante en los ajustes, para que la lluvia suene más fuerte y las máquinas más bajo. Escucha la mezcla de la sala para oírlos juntos e imprime un resguardo de lavandería para guardar tus ajustes o llevarlos a otro dispositivo.",
      },
      "weather-panel": {
        title: "el tiempo, dentro y fuera",
        body: "Un panel sobre la ventana muestra el tiempo donde estás, con la máxima y la mínima de hoy y la calidad del aire. Las ventanas también lo muestran, lluvia, nieve, niebla o tormenta, con su sonido. Tu ciudad se calcula a grandes rasgos a partir de tu conexión. Cuando el aire se vuelve dañino, un purificador se enciende en la esquina.",
      },
      "room-sound-dials": {
        title: "elige qué sonidos oyes",
        body: "Los ajustes tienen ahora un dial para cada sonido de la sala, desde las máquinas hasta la campanilla. Apaga los que no quieras oír. Para los demás, la sala sigue igual.",
      },
      "home-mid-wash": {
        title: "vuelve a casa mientras lava",
        body: "Pisa el felpudo para volver a casa mientras se lava tu ropa. La ropa mojada viaja en el cesto y la seca acaba en la cama.",
      },
      "bedroom-curtains": {
        title: "cortinas y una lámpara nueva en casa",
        body: "Haz clic en las cortinas o en la lámpara de tu cuarto. Las dos habitaciones ahora se iluminan y oscurecen con el sol, la luna y las lámparas.",
      },
      "settings-lite": {
        title: "ajustes y un modo ligero",
        body: "El engranaje de la barra abre los ajustes. Cambia a ligero en dispositivos lentos para ahorrar memoria y batería.",
      },
      "door-bell": {
        title: "una campanilla en la puerta",
        body: "Una campanilla suena cuando entras, y cada vez que entra alguien más.",
      },
      "whats-new-board": {
        title: "un tablón de novedades",
        body: "Este soporte muestra lo nuevo. De día descansa como papel y de noche se ilumina.",
      },
      "twelve-stations": {
        title: "doce canales en la tele",
        body: "Siete radios lofi nuevas llenan el dial, de la sala de estudio al espacio profundo.",
      },
      "page-drag": {
        title: "pasa páginas arrastrando",
        body: "Arrastra desde cualquier punto del borde exterior de una página para pasarla.",
      },
      "window-light": {
        title: "sol por la ventana",
        body: "La luz del día llega a las máquinas y al suelo, y se vuelve cálida al amanecer y al atardecer.",
      },
      "shared-coffee": {
        title: "comparte una cafetera",
        body: "Hasta siete personas pueden servirse de la misma jarra.",
      },
      "street-view": {
        title: "la calle de afuera",
        body: "La ventana da a la calle, iluminada por el sol o la luna.",
      },
      "tube-counter": {
        title: "quién está aquí",
        body: "Los tubos de la pared del fondo cuentan a todos en la lavandería, tú incluido.",
      },
      "coffee-counter": {
        title: "café en el mostrador",
        body: "Prepara una cafetera, sírvete una taza y tómala mientras gira la ropa.",
      },
      "shared-machines": {
        title: "otros lavando",
        body: "Mira qué máquinas usan los demás. Su ropa se queda en su sitio cuando cargas la tuya.",
      },
      "eighteen-languages": {
        title: "abierto en 18 idiomas",
        body: "Toda la lavandería habla tu idioma. Cámbialo desde el globo de la esquina.",
      },
      "shared-notebook": {
        title: "un cuaderno para desconocidos",
        body: "Deja una nota para quien llegue después. Los cuadernos llenos van a la estantería.",
      },
      "lofi-tv": {
        title: "lofi en la tele",
        body: "Enciende la tele para escuchar radio lofi, con dial y perilla de volumen.",
      },
      opening: {
        title: "abre laundro.cafe",
        body: "Una lavandería tranquila en tu navegador: lava, seca y concéntrate de 5 a 60 minutos.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Contador de tubos, ${o.count === 1 ? "solo tú aquí" : `${o.count} personas aquí`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "solo tú aquí" : `${o.count} personas aquí`,
    offLabel: "Contador de tubos, apagado",
    offTooltip: "apagado",
  },
  airPurifier: {
    label: (o: { aqi: number }) =>
      `Purificador de aire, encendido, AQI ${o.aqi}`,
    tooltip: "purificador de aire · limpiando el aire",
    offLabel: "Purificador de aire, apagado",
    offTooltip: "apagado",
  },
  weatherPanel: {
    conditions: {
      sunny: "soleado",
      clear: "despejado",
      cloudy: "nublado",
      fog: "niebla",
      rain: "lluvia",
      snow: "nieve",
      thunder: "tormenta",
    },
    outside: "afuera",
    high: "máx",
    low: "mín",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `Panel del tiempo, ${o.temperature} ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "buena",
      moderate: "moderada",
      sensitive: "dañina para sensibles",
      unhealthy: "dañina",
      veryUnhealthy: "muy dañina",
      hazardous: "peligrosa",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `calidad del aire ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `aire ${o.band}`,
    offLabel: "Panel del tiempo, sin lectura",
    offTooltip: "aún sin lectura",
  },
  tv: {
    stations: {
      "rainy-cafe": "café con lluvia",
      "piano-night": "noche de piano",
      "late-wash": "colada tardía",
      "tape-hiss": "siseo de cinta",
      "city-at-3am": "la ciudad a las 3 a. m.",
      "study-hall": "sala de estudio",
      "smoky-jazz": "jazz humeante",
      fireplace: "chimenea",
      "neon-tokyo": "tokio de neón",
      "string-quartet": "cuarteto de cuerda",
      "porch-guitar": "guitarra en el porche",
      "deep-space": "espacio profundo",
    },
    station: (o: { channel: string; name: string }) =>
      `c. ${o.channel} · ${o.name}`,
    offLabel: "Tele, apagada",
    offTooltip: "tele · apagada",
    onLabel: (o: { station: string }) => `Tele, encendida, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `Pantalla de la tele, ${o.station}, ver en YouTube`,
    screenOnTooltip: "ver en YouTube ↗",
    screenOffLabel: "Pantalla de la tele, apagada, encender",
    turnOn: "encender",
    tunerLabel: (o: { station: string }) => `Canal de la tele, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) =>
      `siguiente emisora · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) =>
      `Volumen de la tele, ${o.percent} %`,
    volumeTooltip: (o: { percent: number }) => `volumen · ${o.percent} %`,
    powerOnLabel: "Botón de encendido de la tele, encendida, apagar",
    turnOff: "apagar",
    powerOffLabel: "Botón de encendido de la tele, apagada, encender",
    noSignal: "sin señal",
  },
  shelf: {
    loadingLabel: "Estantería, buscando cuadernos llenos",
    loadingTooltip: "mirando la estantería…",
    offlineLabel: "Estantería, sin conexión por ahora",
    offlineTooltip: "la estantería está sin conexión por ahora",
    emptyLabel: "Estantería, todavía no hay cuadernos llenos",
    emptyTooltip: "todavía no hay cuadernos llenos",
    readyLabel: "Mirar la estantería de cuadernos llenos",
    bookCount: (o: { count: number }) =>
      o.count === 1 ? "1 cuaderno lleno" : `${o.count} cuadernos llenos`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `Abrir el cuaderno n.º ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) =>
      `${o.count} ${o.count === 1 ? "nota" : "notas"}`,
  },
  notebook: {
    objectLabel: "Abrir el cuaderno",
    objectTooltip: "notas de desconocidos",
    number: (o: { number: number }) => `n.º ${o.number}`,
    dialogLabel: (o: { number: number }) => `Cuaderno n.º ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `desde el ${o.day}`,
    insideCover: "contracubierta",
    insideCoverAndPage: (o: { page: number }) =>
      `contracubierta · p. ${o.page}`,
    page: (o: { page: number }) => `p. ${o.page}`,
    pages: (o: { left: number; right: number }) => `pp. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `Página ${o.page}, ir a otra página`,
    previousPage: "Página anterior",
    nextPage: "Página siguiente",
    scrubberLabel: "Página",
    goToPage: "ir a la página",
    pageInputLabel: (o: { pageCount: number }) =>
      `Número de página, del 1 al ${o.pageCount}`,
    report: "denunciar",
    reported: "denunciada",
    opening: "abriendo el cuaderno…",
    missing: (o: { number: number }) => `no existe el cuaderno n.º ${o.number}`,
    full: (o: { number: number }) =>
      `el cuaderno n.º ${o.number} está lleno · solo lectura`,
    someoneWritingInNotebook:
      "alguien está escribiendo en el cuaderno · espera tu turno",
    someoneWriting: "alguien está escribiendo ahora · espera tu turno",
    comeBackToWrite: "vuelve en dos minutos para escribir otra",
    startsNext: (o: { number: number }) =>
      `esta nota abre el cuaderno n.º ${o.number}`,
    writePrompt: "escribe una nota para la próxima persona",
    writePromptBeforeKeys: "escribe una nota para la próxima persona · ",
    writePromptAfterKeys: " para guardarla",
    textareaLabel: "Escribir una nota en el cuaderno",
    notifyWhenFree: "avísame cuando esté libre",
    notifyPending: "te avisaremos",
    saveNote: "guardar mi nota",
    saveDoodle: "guardar mi dibujo",
    penModeLabel: "Pluma",
    penModes: { write: "escribir", draw: "dibujar" },
    drawPrompt: "dibuja algo para la próxima persona",
    doodleMoved: (o: { page: number }) =>
      `no queda espacio en esta página · dibujando en la p. ${o.page}`,
    doodleBookFull:
      "no hay espacio para un dibujo en este cuaderno · mejor escribe una nota",
    inkFull: "no queda espacio para más tinta · guárdalo o deshaz",
    someoneDrawingInNotebook:
      "alguien está dibujando en el cuaderno · espera tu turno",
    padLabel: "Espacio para dibujar en el cuaderno",
    drawingNow: "dibujando…",
    someoneDrawingNow: "alguien está dibujando…",
    undo: "deshacer",
    clear: "borrar",
    savingNote: "guardando…",
    close: "cerrar",
    freeNotificationTitle: "el cuaderno está libre",
    freeNotificationBody: "te toca escribir",
    leaveFailures: {
      offline:
        "el cuaderno está sin conexión por ahora · tu nota se queda aquí",
      rate_limited: "una nota cada dos minutos · vuelve a intentarlo pronto",
      contains_link: "nada de enlaces en el cuaderno",
      too_long: "demasiado larga para el cuaderno · acórtala un poco",
      sign_off_too_long: "la firma es demasiado larga",
      empty_body: "escribe algo primero",
      unknown: "algo salió mal · inténtalo de nuevo",
    },
  },
  firstVisit: {
    garments: {
      tee: "camiseta",
      jeans: "vaqueros",
      sweater: "jersey",
      towel: "toalla",
      socks: "calcetines",
      shirt: "camisa",
    },
    garmentLabel: (o: { garment: string }) => `Echar al cesto: ${o.garment}`,
    basketEmpty: "echa aquí la ropa del suelo",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.count} de ${o.total} dentro · añade más o ve a la puerta`,
    basketFull: "todo dentro · ve a la puerta",
    basketWet: "la ropa sigue mojada · sécala en la lavandería",
    lampOffTooltip: "apagar la lámpara",
    lampOnTooltip: "encender la lámpara",
    lampOffLabel: "Apagar la lámpara",
    lampOnLabel: "Encender la lámpara",
    curtainCloseTooltip: "cerrar las cortinas",
    curtainOpenTooltip: "abrir las cortinas",
    curtainCloseLabel: "Cerrar las cortinas",
    curtainOpenLabel: "Abrir las cortinas",
    bedTooltip: "irse a dormir",
    bedLabel: "Irse a dormir",
    goodNight: "Buenas noches",
    notSleepy: "ya no quiero dormir",
    doorReadyTooltip: "llevarlo a la lavandería",
    doorWaitingTooltip: "primero recoge tu ropa",
    doorAwayTooltip: "volver a la lavandería · tu ropa está en la máquina",
    doorAwayLabel: "Volver a la lavandería, tu ropa sigue en la máquina",
    doorReadyLabel: "Llevar el cesto a la lavandería",
    doorWaitingLabel: "Puerta a la lavandería, primero recoge tu ropa",
    justListen: "solo escuchar →",
  },
} satisfies LaundromatCopy;
