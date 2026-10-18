import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { MachineKind } from "@/lib/laundromat/scene-config";

export const ptBR = {
  locale: "pt-BR",
  languageName: "Português (Brasil)",
  site: {
    name: "laundro.cafe",
    title:
      "laundro.cafe: um timer de foco aconchegante numa lavanderia, com lofi",
    description:
      "Lave a roupa como timer de foco numa lavanderia tranquila. Lavar, secar, focar, lofi, café, um caderno para desconhecidos ou só desligar. Grátis, sem cadastro.",
    intro:
      "Uma lavanderia tranquila no seu navegador. Ligue uma lavadora ou secadora de 5 a 60 minutos como timer de foco e receba uma notificação quando terminar, ouça estações lo-fi na TV, passe um café e deixe um recado escrito à mão no caderno compartilhado. Os cadernos cheios vão para a estante.",
    keywords: [
      "lavanderia",
      "timer de foco",
      "pomodoro",
      "lofi",
      "música para trabalhar",
      "estude comigo",
      "aconchegante",
      "caderno compartilhado",
    ],
    inspiredBy: "inspirado em",
    openGraphLocale: "pt_BR",
    shareImage: {
      headline: "uma lavanderia tranquila no seu navegador.",
      subline:
        "lavar, secar, focar, lofi, café, um caderno para desconhecidos ou só desligar",
    },
  },
  toolbar: {
    soundOn: "som ligado",
    soundOff: "som desligado",
    share: "compartilhar",
    linkCopied: "link copiado",
    shareText:
      "Uma lavanderia tranquila no seu navegador. Coloque uma leva de roupa, deixe o timer rodar e leia os recados que as pessoas deixaram.",
    language: "Idioma",
    settings: "configurações",
    builtBy: {
      beforeClaude: "feito com ❤️ por Li Yuxuan e ",
      afterClaude: "",
    },
    updateAvailable: "recarregue para a lavanderia atualizada",
  },
  settings: {
    heading: "configurações",
    rendering: "renderização",
    renderingHint:
      "o lite tira a luz suave, o balanço da planta e o zoom no caderno e no mural. ajuda em aparelhos mais lentos ou quando falta memória.",
    qualityAuto: "auto",
    qualityAutoHint: (o: { quality: string }) =>
      `usa ${o.quality} neste aparelho`,
    qualityFull: "completo",
    qualityFullHint: "toda a luz e o movimento",
    qualityLite: "lite",
    qualityLiteHint: "mais leve para a memória e a bateria",
    close: "fechar",
    closeHint: "esc para fechar",
    temperature: "temperatura",
    weather: "tempo",
    placeLabel: "local do tempo",
    placePlaceholder: "buscar uma cidade",
    placeLive: "ao vivo",
    placeNearYou: "perto de você",
    placeSearching: "buscando…",
    placeNoResults: "nenhum lugar encontrado",
    conditionLabel: "céu",
    conditionLive: "tempo ao vivo",
    weatherHint:
      "o tempo ao vivo é estimado pelo seu endereço IP, então às vezes pode errar. escolha uma cidade ou um céu para definir você mesmo. a unidade de temperatura segue o lugar até você escolher uma.",
    roomSounds: "sons da lavanderia",
    roomSoundsHint:
      "sons da lavanderia e das pessoas nela. desligar ou abaixar um só muda para você.",
    roomSoundsAllOn: "ligar todos",
    roomSoundsAllOff: "desligar todos",
    roomSoundOn: "lig.",
    roomSoundOff: "desl.",
    roomSoundVolume: (o: { sound: string }) => `volume: ${o.sound}`,
    roomMix: {
      play: "tocar a mixagem da lavanderia",
      playing: "tocando sua mixagem",
      playLabel: "tocar a mixagem da lavanderia nos seus níveis",
      stopLabel: "parar a mixagem da lavanderia",
    },
    ticket: {
      heading: "tíquete da lavanderia",
      hint: "imprima um tíquete para guardar suas configurações num arquivo pequeno e copiar um link para elas. abra o link, ou insira o arquivo aqui, em qualquer aparelho para recuperá-las.",
      print: "imprimir",
      insert: "inserir",
      printLabel:
        "imprimir um tíquete da lavanderia, que salva suas configurações num arquivo e copia um link para elas",
      insertLabel:
        "inserir um tíquete da lavanderia, que carrega suas configurações de um arquivo",
      ready: "pronto",
      printing: "imprimindo…",
      saved: "salvo",
      linkCopied: "link copiado",
      linkLabel: "link para seu tíquete da lavanderia",
      copyLink: "copiar link",
      copied: "copiado",
      linkHint:
        "abra este link em outro aparelho para levar suas configurações para lá.",
      reading: "lendo…",
      loaded: "carregado",
      unreadable: "inválido",
      title: "tíquete da lavanderia",
      number: (o: { number: string }) => `nº ${o.number}`,
      tv: (o: { percent: number }) => `tv ${o.percent}%`,
    },
    roomSound: {
      machines: { label: "máquinas", hint: "lavadoras e secadoras girando" },
      "shop-bell": { label: "sininho", hint: "toca quando alguém entra" },
      unloading: {
        label: "retirada",
        hint: "a trava da porta quando alguém tira a roupa",
      },
      coffee: {
        label: "café",
        hint: "o borbulhar do preparo e o bipe de pronto",
      },
      tv: { label: "chiado da tv", hint: "o chiado da tv sem sinal" },
      lamp: {
        label: "luminária",
        hint: "a luminária piscando ao acender e estalando ao apagar",
      },
      weather: {
        label: "tempo",
        hint: "chuva e trovões do lado de fora da janela",
      },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
  },
  tabDone: "pronto",
  readoutDone: "fim",
  matWelcome: "bem-vindo",
  machine: {
    name: (machine: { kind: MachineKind; number: number }) =>
      `${machine.kind === "washer" ? "Lavadora" : "Secadora"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, livre`,
    freeTooltip: (o: { name: string }) => `${o.name} · livre`,
    loadedLabel: (o: { name: string }) =>
      `${o.name}, carregada, pronta para começar`,
    loadedTooltip: (o: { name: string }) => `${o.name} · carregada`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, ${o.kind === "washer" ? "lavando" : "secando"}, faltam ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "lavando" : "secando"} · termina às ${o.time}`,
    doneLabel: (o: { name: string }) => `${o.name}, pronta, tire sua roupa`,
    doneTooltip: (o: { name: string }) => `${o.name} · pronta`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, ${o.kind === "washer" ? "lavando" : "secando"} a roupa de outra pessoa, faltam ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `outra pessoa está ${o.kind === "washer" ? "lavando" : "secando"} · termina às ${o.time}`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, tem a roupa de outra pessoa`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · roupa de outra pessoa, não iniciada`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, a roupa de outra pessoa está pronta`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · de outra pessoa, pronta`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · pronta`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "tire sua roupa e escolha uma secadora"
        : "sua roupa está seca",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name}, ${{ dial: "seletor", start: "botão de início", door: "porta" }[o.control]}: outra pessoa está usando`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "lavagem" : "secagem"} de outra pessoa · termina às ${o.time}`,
    othersLoadedTooltip: "roupa de outra pessoa · ainda não iniciada",
    othersDoneTooltip: "roupa de outra pessoa · esperando o dono",
    doneAt: (o: { time: string }) => `termina às ${o.time}`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name}, ciclo, ${o.minutes} minutos`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `girar · ${o.minutes} min → ${o.nextMinutes} min`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name}, iniciar, ${o.kind === "washer" ? "lavagem" : "secagem"} de ${o.minutes} minutos${o.canNotify ? ", avisa você quando terminar" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `iniciar · ${o.kind === "washer" ? "lavagem" : "secagem"} de ${o.minutes} min${o.canNotify ? " · avisa você" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, me avise quando a ${o.kind === "washer" ? "lavagem" : "secagem"} terminar`,
    remindTooltip: (o: { doneAt: string }) => `me avise · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) =>
      `${o.name}, iniciar, ${o.reminderOn ? "lembrete ativado, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) =>
      `lembrete ativado · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name}, iniciar`,
    loadFirstTooltip: "coloque a roupa primeiro",
    needsWashingTooltip: "lave primeiro",
    alreadyWashedTooltip: "já lavada · agora é secar",
    alreadyDryTooltip: "já está seca · leve para casa",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `sua roupa está esperando na ${o.name}`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "suas roupas ainda estão lavando"
        : "suas roupas ainda estão secando",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `sua roupa está pronta · na ${o.name}`,
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "lavando" : "secando"} · ${o.doneAt}`,
    doneDoorTooltip: "abrir a porta · tirar a roupa",
    loadedDoorTooltip: "abrir a porta · tirar a roupa de volta",
    loadableDoorTooltip: "colocar a roupa",
    doorLabel: (o: { name: string }) => `${o.name}, porta`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name}, porta, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `Capacho, leve sua roupa ${o.laundry === "folded" ? "seca" : "lavada"} para casa`,
    readyTooltip: "voltar para casa · leve a roupa limpa",
    awayLabel: "Capacho, volte para casa e deixe a roupa na máquina",
    awayTooltip: "voltar para casa · a roupa fica na máquina",
    wetLabel: "Capacho, volte para casa com a roupa molhada",
    wetTooltip: "voltar para casa · a roupa ainda está molhada",
    dirtyLabel:
      "Capacho, coloque a roupa numa lavadora antes de voltar para casa",
    dirtyTooltip: "lave primeiro · coloque a roupa numa lavadora",
  },
  laundryBasket: {
    labels: {
      empty: "Cesto de roupa, vazio",
      dirty: "Cesto de roupa, roupa para lavar",
      wet: "Cesto de roupa, roupa molhada para secar",
      folded: "Cesto de roupa, roupa limpa e seca",
    },
    tooltips: {
      empty: "cesto · vazio",
      dirty: "roupa suja · para a lavadora",
      wet: "roupa molhada · para a secadora",
      folded: "limpa e seca · pronta pra ir pra casa",
    },
  },
  coffee: {
    machineLabel: "Cafeteira",
    brewingMachineLabel: "Cafeteira, passando café",
    brewingTooltip: "passando…",
    idleSwitchLabel: "Botão da cafeteira, passar um café",
    idleSwitchTooltip: "passar um café",
    brewingSwitchLabel: "Botão da cafeteira, passando café",
    readyMachineLabel: "Cafeteira, tem café na jarra",
    readyMachineTooltip: "o café está pronto",
    topUpSwitchLabel: "Botão da cafeteira, completar a jarra",
    topUpSwitchTooltip: "completar a jarra",
    fullSwitchLabel: "Botão da cafeteira, a jarra está cheia",
    fullSwitchTooltip: "a jarra está cheia · sirva uma xícara antes",
    emptyFlaskLabel: "Jarra de café, vazia",
    emptyFlaskTooltip: "a jarra está vazia",
    brewingFlaskLabel: "Jarra de café, passando café",
    othersBrewingMachineLabel: "Cafeteira, outra pessoa está passando café",
    othersBrewingSwitchLabel:
      "Botão da cafeteira, outra pessoa está passando café",
    othersBrewingFlaskLabel: "Jarra de café, outra pessoa está passando café",
    othersBrewingTooltip: (o: { time: string }) =>
      `outra pessoa está passando café · termina às ${o.time}`,
    pourLabel: "Jarra de café, servir uma xícara",
    pourTooltip: "servir uma xícara",
    cupFullFlaskLabel: "Jarra de café, termine sua xícara antes",
    cupFullFlaskTooltip: "termine sua xícara antes",
    fullCupLabel: "Xícara de café, beber",
    fullCupTooltip: "beber",
    emptyCupLabel: "Xícara de café, vazia",
    emptyCupTooltip: "xícara vazia",
  },
  plant: {
    label: "Planta, tocar na grama",
    tooltip: "tocar na grama",
    blessings: [
      "sorte",
      "fortuna",
      "calma",
      "alegria",
      "saúde",
      "sono bom",
      "roupa limpa",
      "café quentinho",
      "foco",
      "gentileza",
      "sol",
      "boas notícias",
    ],
    blessing: (o: { count: number; word: string }) => `+${o.count} ${o.word}`,
  },
  toyBox: {
    closedLabel:
      "Caixa de brinquedo com 1955, abrir a caixa de brinquedo de “De Volta para o Futuro”",
    closedTooltip: "abrir a caixa de brinquedo de “De Volta para o Futuro”",
    setLabel: "Carro voador de brinquedo, jogar",
    setTooltip: "jogar",
  },
  board: {
    label: "Mural, novidades da lavanderia",
    tooltip: "novidades",
    eyebrow: "mural de avisos",
    heading: "novidades",
    subtitle: "Pequenas mudanças na lavanderia, as mais recentes primeiro.",
    updated: (o: { date: string }) => `atualizado em ${o.date}`,
    footer: "sempre aberto, 24/7",
    close: "fechar",
    closeHint: "esc para fechar",
    tags: {
      opening: "inauguração",
      tv: "tv",
      notebook: "caderno",
      languages: "idiomas",
      room: "salão",
      coffee: "café",
      window: "janela",
      light: "luz",
      board: "mural",
    },
    updates: {
      "notebook-doodles": {
        title: "desenhe no caderno",
        body: "Troque a caneta do caderno de escrever para desenhar e deixe um pequeno desenho para quem chegar depois. Quem estiver na lavanderia com o caderno aberto vê o desenho surgir sozinho na página.",
      },
      "weather-anywhere": {
        title: "escolha o tempo lá fora",
        body: "Nas configurações, escolha uma cidade para ver o tempo dela pela janela e no painel, ou escolha o céu você mesmo. O padrão continua sendo o tempo ao vivo.",
      },
      "room-sound-mixer": {
        title: "mixe a lavanderia do seu jeito",
        body: "Cada som da lavanderia nas configurações agora tem seu próprio controle deslizante, então a chuva pode ficar mais alta e as máquinas mais baixas. Toque a mixagem da lavanderia para ouvir tudo junto e imprima um tíquete da lavanderia para guardar suas configurações ou levá-las para outro aparelho.",
      },
      "weather-panel": {
        title: "o tempo, dentro e fora",
        body: "Um painel acima da janela mostra o tempo onde você está, com a máxima e a mínima de hoje e a qualidade do ar. As janelas também mostram, chuva, neve, neblina ou tempestade, com o som certo. Sua cidade é um palpite aproximado a partir da sua conexão. Quando o ar fica ruim, um purificador liga no canto.",
      },
      "room-sound-dials": {
        title: "escolha os sons que você ouve",
        body: "As configurações agora têm um botão giratório para cada som da lavanderia, das máquinas ao sininho. Desligue os que você prefere não ouvir. Para os outros, a lavanderia continua igual.",
      },
      "home-mid-wash": {
        title: "volte para casa enquanto lava",
        body: "Pise no capacho para voltar para casa enquanto a roupa lava. A roupa molhada vai no cesto, a seca vai para a cama.",
      },
      "bedroom-curtains": {
        title: "cortinas e uma luminária nova em casa",
        body: "Clique nas cortinas ou na luminária do seu quarto. Os dois ambientes agora clareiam e escurecem com o sol, a lua e as luminárias.",
      },
      "settings-lite": {
        title: "ajustes e um modo leve",
        body: "A engrenagem na barra abre os ajustes. Mude para o modo leve em aparelhos mais lentos para poupar memória e bateria.",
      },
      "door-bell": {
        title: "um sininho na porta",
        body: "Um sininho toca quando você entra, e sempre que outra pessoa chega.",
      },
      "whats-new-board": {
        title: "um mural de novidades",
        body: "Este painel mostra o que há de novo. De dia repousa como papel, à noite se acende.",
      },
      "twelve-stations": {
        title: "doze canais na tv",
        body: "Sete novas rádios lofi preenchem o dial, da sala de estudos ao espaço profundo.",
      },
      "page-drag": {
        title: "vire páginas arrastando",
        body: "Arraste em qualquer ponto da borda externa de uma página para virá-la.",
      },
      "window-light": {
        title: "sol pela janela",
        body: "A luz do dia chega às máquinas e ao chão, e fica quente no nascer e no pôr do sol.",
      },
      "shared-coffee": {
        title: "um bule de café para todos",
        body: "Até sete pessoas se servem da mesma garrafa.",
      },
      "street-view": {
        title: "a rua lá fora",
        body: "A janela dá para a rua, iluminada pelo sol ou pela lua.",
      },
      "tube-counter": {
        title: "quem está aqui",
        body: "Os tubos da parede do fundo contam todos na lavanderia, incluindo você.",
      },
      "coffee-counter": {
        title: "café no balcão",
        body: "Passe um bule, sirva uma xícara e beba enquanto a roupa gira.",
      },
      "shared-machines": {
        title: "outros lavando roupa",
        body: "Veja quais máquinas os outros estão usando. A roupa deles fica no lugar quando você coloca a sua.",
      },
      "eighteen-languages": {
        title: "aberto em 18 idiomas",
        body: "A lavanderia inteira fala o seu idioma. Troque pelo globo no canto.",
      },
      "shared-notebook": {
        title: "um caderno para desconhecidos",
        body: "Deixe um bilhete para quem chegar depois. Cadernos cheios vão para a estante.",
      },
      "lofi-tv": {
        title: "lofi na tv",
        body: "Ligue a tv para ouvir rádio lofi, com botões de sintonia e volume.",
      },
      opening: {
        title: "laundro.cafe abre",
        body: "Uma lavanderia tranquila no navegador: lave, seque e foque de 5 a 60 minutos.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Contador de válvulas, ${o.count === 1 ? "só você aqui" : `${o.count} pessoas aqui`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "só você aqui" : `${o.count} pessoas aqui`,
    offLabel: "Contador de válvulas, desligado",
    offTooltip: "desligado",
  },
  airPurifier: {
    label: (o: { aqi: number }) => `Purificador de ar, ligado, AQI ${o.aqi}`,
    tooltip: "purificador de ar · limpando o ar",
    offLabel: "Purificador de ar, desligado",
    offTooltip: "desligado",
  },
  weatherPanel: {
    conditions: {
      sunny: "ensolarado",
      clear: "céu limpo",
      cloudy: "nublado",
      fog: "neblina",
      rain: "chuva",
      snow: "neve",
      thunder: "trovoada",
    },
    outside: "lá fora",
    high: "máx",
    low: "mín",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `Painel do tempo, ${o.temperature} ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "boa",
      moderate: "moderada",
      sensitive: "ruim para sensíveis",
      unhealthy: "ruim",
      veryUnhealthy: "muito ruim",
      hazardous: "perigosa",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `qualidade do ar ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `ar ${o.band}`,
    offLabel: "Painel do tempo, sem leitura",
    offTooltip: "ainda sem leitura",
  },
  tv: {
    stations: {
      "rainy-cafe": "café na chuva",
      "piano-night": "noite de piano",
      "late-wash": "lavagem tardia",
      "tape-hiss": "chiado de fita",
      "city-at-3am": "a cidade às 3 da manhã",
      "study-hall": "sala de estudos",
      "smoky-jazz": "jazz enfumaçado",
      fireplace: "lareira",
      "neon-tokyo": "tóquio neon",
      "string-quartet": "quarteto de cordas",
      "porch-guitar": "violão na varanda",
      "deep-space": "espaço profundo",
    },
    station: (o: { channel: string; name: string }) =>
      `can. ${o.channel} · ${o.name}`,
    offLabel: "TV, desligada",
    offTooltip: "tv · desligada",
    onLabel: (o: { station: string }) => `TV, ligada, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `Tela da TV, ${o.station}, assistir no YouTube`,
    screenOnTooltip: "assistir no YouTube ↗",
    screenOffLabel: "Tela da TV, desligada, ligar",
    turnOn: "ligar",
    tunerLabel: (o: { station: string }) => `Canal da TV, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) =>
      `próxima estação · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `Volume da TV, ${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `volume · ${o.percent}%`,
    powerOnLabel: "Botão de ligar da TV, ligada, desligar",
    turnOff: "desligar",
    powerOffLabel: "Botão de ligar da TV, desligada, ligar",
    noSignal: "sem sinal",
  },
  shelf: {
    loadingLabel: "Estante, procurando cadernos cheios",
    loadingTooltip: "olhando a estante…",
    offlineLabel: "Estante, offline no momento",
    offlineTooltip: "a estante está offline no momento",
    emptyLabel: "Estante, ainda não há cadernos cheios",
    emptyTooltip: "ainda não há cadernos cheios",
    readyLabel: "Ver a estante de cadernos cheios",
    bookCount: (o: { count: number }) =>
      o.count === 1 ? "1 caderno cheio" : `${o.count} cadernos cheios`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `Abrir o caderno nº ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) =>
      `${o.count} ${o.count === 1 ? "recado" : "recados"}`,
  },
  notebook: {
    objectLabel: "Abrir o caderno",
    objectTooltip: "recados de desconhecidos",
    number: (o: { number: number }) => `nº ${o.number}`,
    dialogLabel: (o: { number: number }) => `Caderno nº ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `desde ${o.day}`,
    insideCover: "contracapa",
    insideCoverAndPage: (o: { page: number }) => `contracapa · p. ${o.page}`,
    page: (o: { page: number }) => `p. ${o.page}`,
    pages: (o: { left: number; right: number }) => `pp. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `Página ${o.page}, ir para outra página`,
    previousPage: "Página anterior",
    nextPage: "Próxima página",
    scrubberLabel: "Página",
    goToPage: "ir para a página",
    pageInputLabel: (o: { pageCount: number }) =>
      `Número da página, de 1 a ${o.pageCount}`,
    report: "denunciar",
    reported: "denunciado",
    opening: "abrindo o caderno…",
    missing: (o: { number: number }) => `não existe caderno nº ${o.number}`,
    full: (o: { number: number }) =>
      `o caderno nº ${o.number} está cheio · só leitura`,
    someoneWritingInNotebook:
      "alguém está escrevendo no caderno · espere sua vez",
    someoneWriting: "alguém está escrevendo agora · espere sua vez",
    comeBackToWrite: "volte daqui a dois minutos para escrever outro",
    startsNext: (o: { number: number }) =>
      `este recado abre o caderno nº ${o.number}`,
    writePrompt: "escreva um recado para a próxima pessoa",
    writePromptBeforeKeys: "escreva um recado para a próxima pessoa · ",
    writePromptAfterKeys: " para salvar",
    textareaLabel: "Escrever um recado no caderno",
    notifyWhenFree: "me avise quando estiver livre",
    notifyPending: "a gente te avisa",
    saveNote: "salvar meu recado",
    saveDoodle: "salvar meu desenho",
    penModeLabel: "Caneta",
    penModes: { write: "escrever", draw: "desenhar" },
    drawPrompt: "desenhe algo para a próxima pessoa",
    doodleMoved: (o: { page: number }) =>
      `não há mais espaço nesta página · desenhando na p. ${o.page}`,
    doodleBookFull:
      "não há espaço para um desenho neste caderno · escreva um recado",
    inkFull: "não há mais espaço para tinta · salve ou desfaça",
    someoneDrawingInNotebook:
      "alguém está desenhando no caderno · espere sua vez",
    padLabel: "Espaço para desenhar no caderno",
    drawingNow: "desenhando…",
    someoneDrawingNow: "alguém está desenhando…",
    undo: "desfazer",
    clear: "limpar",
    savingNote: "salvando…",
    close: "fechar",
    freeNotificationTitle: "o caderno está livre",
    freeNotificationBody: "sua vez de escrever",
    leaveFailures: {
      offline: "o caderno está offline no momento · seu recado fica aqui",
      rate_limited:
        "um recado a cada dois minutos · tente de novo daqui a pouco",
      contains_link: "nada de links no caderno",
      too_long: "longo demais para o caderno · encurte um pouco",
      sign_off_too_long: "a assinatura está longa demais",
      empty_body: "escreva alguma coisa primeiro",
      unknown: "algo deu errado · tente de novo",
    },
  },
  firstVisit: {
    garments: {
      tee: "camiseta",
      jeans: "calça jeans",
      sweater: "suéter",
      towel: "toalha",
      socks: "meias",
      shirt: "camisa",
    },
    garmentLabel: (o: { garment: string }) => `Pôr no cesto: ${o.garment}`,
    basketEmpty: "jogue aqui as roupas do chão",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.count} de ${o.total} dentro · coloque mais ou vá até a porta`,
    basketFull: "tudo dentro · vá até a porta",
    basketWet: "a roupa ainda está molhada · seque na lavanderia",
    lampOffTooltip: "apagar a luminária",
    lampOnTooltip: "acender a luminária",
    lampOffLabel: "Apagar a luminária",
    lampOnLabel: "Acender a luminária",
    curtainCloseTooltip: "fechar as cortinas",
    curtainOpenTooltip: "abrir as cortinas",
    curtainCloseLabel: "Fechar as cortinas",
    curtainOpenLabel: "Abrir as cortinas",
    bedTooltip: "ir dormir",
    bedLabel: "Ir dormir",
    goodNight: "Boa noite",
    notSleepy: "não quero mais dormir",
    doorReadyTooltip: "levar para a lavanderia",
    doorWaitingTooltip: "pegue sua roupa primeiro",
    doorAwayTooltip: "voltar à lavanderia · sua roupa está na máquina",
    doorAwayLabel: "Voltar à lavanderia, sua roupa ainda está na máquina",
    doorReadyLabel: "Levar o cesto para a lavanderia",
    doorWaitingLabel: "Porta para a lavanderia, pegue sua roupa primeiro",
    justListen: "só ouvir →",
  },
} satisfies LaundromatCopy;
