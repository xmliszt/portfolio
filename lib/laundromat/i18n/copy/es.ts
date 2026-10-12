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
  },
  toolbar: {
    soundOn: "sonido activado",
    soundOff: "sonido desactivado",
    share: "compartir",
    linkCopied: "enlace copiado",
    shareText:
      "Una lavandería tranquila en tu navegador. Mete una carga, deja que corra el temporizador y lee las notas que ha dejado la gente.",
    language: "Idioma",
    builtBy: "hecho con ❤️ por Li Yuxuan",
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
    readyTooltip: "volver a casa · llévate tu ropa",
    waitingLabel: "Felpudo, el camino a casa cuando tu ropa esté lista",
    waitingTooltip: "el camino a casa · termina primero tu colada",
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
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Contador de tubos, ${o.count === 1 ? "solo tú aquí" : `${o.count} personas aquí`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "solo tú aquí" : `${o.count} personas aquí`,
    offLabel: "Contador de tubos, apagado",
    offTooltip: "apagado",
  },
  tv: {
    stations: {
      "rainy-cafe": "café con lluvia",
      "piano-night": "noche de piano",
      "late-wash": "colada tardía",
      "tape-hiss": "siseo de cinta",
      "city-at-3am": "la ciudad a las 3 a. m.",
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
    startsNext: (o: { number: number }) =>
      `esta nota abre el cuaderno n.º ${o.number}`,
    writePromptBeforeKeys: "escribe una nota para la próxima persona · ",
    writePromptAfterKeys: " para guardarla",
    textareaLabel: "Escribir una nota en el cuaderno",
    notifyWhenFree: "avísame cuando esté libre",
    notifyPending: "te avisaremos",
    saveNote: "guardar mi nota",
    savingNote: "guardando…",
    close: "cerrar",
    freeNotificationTitle: "el cuaderno está libre",
    freeNotificationBody: "te toca escribir",
    leaveFailures: {
      offline:
        "el cuaderno está sin conexión por ahora · tu nota se queda aquí",
      rate_limited: "una nota cada dos minutos · vuelve a intentarlo pronto",
      daily_limit_reached: "ya hay bastantes notas por hoy · vuelve mañana",
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
    lampOffTooltip: "apagar la lámpara",
    lampOnTooltip: "encender la lámpara",
    lampOffLabel: "Apagar la lámpara",
    lampOnLabel: "Encender la lámpara",
    doorReadyTooltip: "llevarlo a la lavandería",
    doorWaitingTooltip: "primero recoge tu ropa",
    doorReadyLabel: "Llevar el cesto a la lavandería",
    doorWaitingLabel: "Puerta a la lavandería, primero recoge tu ropa",
    justListen: "solo escuchar →",
  },
} satisfies LaundromatCopy;
