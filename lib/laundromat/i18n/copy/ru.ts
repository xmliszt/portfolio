import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

function pluralize(o: {
  count: number;
  one: string;
  few: string;
  many: string;
}) {
  const form = new Intl.PluralRules("ru").select(o.count);
  return form === "one" ? o.one : form === "few" ? o.few : o.many;
}

function minutesFor(count: number) {
  return pluralize({ count, one: "минуту", few: "минуты", many: "минут" });
}

export const ru = {
  locale: "ru",
  languageName: "Русский",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: тихое место для концентрации в браузере",
    description:
      "Тихая прачечная в браузере. Стирай бельё как таймер фокуса, включи lo-fi по телевизору, свари кофе и оставь записку в общем блокноте.",
    intro:
      "Тихая прачечная в браузере. Запусти стирку или сушку на время от 5 до 60 минут как таймер фокуса и получи уведомление, когда она закончится, включи lo-fi-станции по телевизору, свари кофе и оставь рукописную записку в общем блокноте. Заполненные блокноты отправляются на полку.",
    keywords: [
      "прачечная",
      "таймер фокуса",
      "помодоро",
      "lo-fi",
      "уютно",
      "изометрия",
      "интерактив",
      "общий блокнот",
    ],
    openGraphLocale: "ru_RU",
  },
  toolbar: {
    soundOn: "звук вкл.",
    soundOff: "звук выкл.",
    share: "поделиться",
    linkCopied: "ссылка скопирована",
    shareText:
      "Тихая прачечная в браузере. Загрузи бельё, запусти таймер и почитай записки, которые оставили другие.",
    language: "Язык",
  },
  tabDone: "готово",
  readoutDone: "готово",
  matWelcome: "привет",
  machine: {
    name: (machine) =>
      `${machine.kind === "washer" ? "Стиральная машина" : "Сушилка"} ${machine.number}`,
    freeLabel: (o) => `${o.name}, свободна`,
    freeTooltip: (o) => `${o.name} · свободна`,
    loadedLabel: (o) => `${o.name}, загружена, можно запускать`,
    loadedTooltip: (o) => `${o.name} · загружена`,
    runningLabel: (o) =>
      `${o.name}, ${o.kind === "washer" ? "стирает" : "сушит"}, осталось ${o.remaining}`,
    runningTooltip: (o) =>
      `${o.kind === "washer" ? "стирка" : "сушка"} · готово в ${o.time}`,
    doneLabel: (o) => `${o.name}, готово, забери бельё`,
    doneTooltip: (o) => `${o.name} · готово`,
    othersRunningLabel: (o) =>
      `${o.name}, ${o.kind === "washer" ? "стирает" : "сушит"} чужое бельё, осталось ${o.remaining}`,
    othersRunningTooltip: (o) =>
      `кто-то ${o.kind === "washer" ? "стирает" : "сушит"} · готово в ${o.time}`,
    othersDoneLabel: (o) => `${o.name}, чужое бельё готово`,
    othersDoneTooltip: (o) => `${o.name} · чужое, готово`,
    doneNotificationTitle: (o) => `${o.name} · готово`,
    doneNotificationBody: (o) =>
      o.kind === "washer"
        ? "забери бельё и выбери сушилку"
        : "твоё бельё высохло",
  },
  machineControl: {
    controlInUseLabel: (o) =>
      `${{ dial: "Регулятор", start: "Кнопка запуска", door: "Дверца" }[o.control]} (${o.name}), используется кем-то другим`,
    othersRunningTooltip: (o) =>
      `чужая ${o.kind === "washer" ? "стирка" : "сушка"} · готово в ${o.time}`,
    othersDoneTooltip: "чужое бельё · ждёт хозяина",
    doneAt: (o) => `готово в ${o.time}`,
    dialLabel: (o) =>
      `${o.name}, программа на ${o.minutes} ${minutesFor(o.minutes)}`,
    dialTooltip: (o) => `повернуть · ${o.minutes} мин → ${o.nextMinutes} мин`,
    startLabel: (o) =>
      `${o.name}, запуск, ${o.kind === "washer" ? "стирка" : "сушка"} на ${o.minutes} ${minutesFor(o.minutes)}${o.canNotify ? ", сообщит, когда закончится" : ""}`,
    startTooltip: (o) =>
      `запуск · ${o.kind === "washer" ? "стирка" : "сушка"} ${o.minutes} мин${o.canNotify ? " · с уведомлением" : ""}`,
    remindLabel: (o) =>
      `${o.name}, напомнить, когда ${o.kind === "washer" ? "стирка" : "сушка"} закончится`,
    remindTooltip: (o) => `напомнить · ${o.doneAt}`,
    runningStartLabel: (o) =>
      `${o.name}, запуск, ${o.reminderOn ? "напоминание включено, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o) => `напоминание включено · ${o.doneAt}`,
    idleStartLabel: (o) => `${o.name}, запуск`,
    loadFirstTooltip: "сначала загрузи бельё",
    runningDoorTooltip: (o) =>
      `${o.kind === "washer" ? "стирка" : "сушка"} · ${o.doneAt}`,
    doneDoorTooltip: "открыть дверцу · забрать бельё",
    loadedDoorTooltip: "открыть дверцу · достать бельё обратно",
    loadableDoorTooltip: "загрузить бельё",
    doorLabel: (o) => `${o.name}, дверца`,
    doorLabelWithHint: (o) => `${o.name}, дверца, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o) =>
      `Коврик у входа, забери ${o.laundry === "folded" ? "сухое" : "постиранное"} бельё домой`,
    readyTooltip: "домой · забери бельё с собой",
    waitingLabel: "Коврик у входа, дорога домой, когда бельё будет готово",
    waitingTooltip: "дорога домой · сначала закончи со стиркой",
  },
  coffee: {
    machineLabel: "Кофемашина",
    brewingMachineLabel: "Кофемашина, варит кофе",
    brewingTooltip: "варится…",
    hotMachineLabel: "Кофемашина, на столе горячий кофе",
    hotMachineTooltip: "кофе на столе",
    idleSwitchLabel: "Кнопка кофемашины, сварить кофе",
    idleSwitchTooltip: "сварить кофе",
    brewingSwitchLabel: "Кнопка кофемашины, варит кофе",
    hotSwitchLabel: "Кнопка кофемашины, сварить ещё кофе",
    hotSwitchTooltip: "ещё чашку",
  },
  tv: {
    stations: {
      "rainy-cafe": "дождливое кафе",
      "piano-night": "ночь у фортепиано",
      "late-wash": "поздняя стирка",
      "tape-hiss": "шорох плёнки",
      "city-at-3am": "город в 3 часа ночи",
    },
    station: (o) => `кан. ${o.channel} · ${o.name}`,
    offLabel: "Телевизор, выключен",
    offTooltip: "тв · выкл.",
    onLabel: (o) => `Телевизор, включён, ${o.station}`,
    screenOnLabel: (o) => `Экран телевизора, ${o.station}, смотреть на YouTube`,
    screenOnTooltip: "смотреть на YouTube ↗",
    screenOffLabel: "Экран телевизора, выключен, включить",
    turnOn: "включить",
    tunerLabel: (o) => `Канал телевизора, ${o.station}`,
    tunerTooltip: (o) => `следующая станция · ${o.nextName}`,
    volumeLabel: (o) => `Громкость телевизора, ${o.percent}%`,
    volumeTooltip: (o) => `громкость · ${o.percent}%`,
    powerOnLabel: "Кнопка питания телевизора, включён, выключить",
    turnOff: "выключить",
    powerOffLabel: "Кнопка питания телевизора, выключен, включить",
    noSignal: "нет сигнала",
  },
  shelf: {
    loadingLabel: "Полка, ищем заполненные блокноты",
    loadingTooltip: "смотрим на полке…",
    offlineLabel: "Полка, сейчас недоступна",
    offlineTooltip: "полка сейчас недоступна",
    emptyLabel: "Полка, заполненных блокнотов пока нет",
    emptyTooltip: "заполненных блокнотов пока нет",
    readyLabel: "Посмотреть полку с заполненными блокнотами",
    bookCount: (o) =>
      `${o.count} ${pluralize({ count: o.count, one: "заполненный блокнот", few: "заполненных блокнота", many: "заполненных блокнотов" })}`,
    bookLabel: (o) => `Открыть блокнот № ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o) =>
      `${o.count} ${pluralize({ count: o.count, one: "запись", few: "записи", many: "записей" })}`,
  },
  notebook: {
    objectLabel: "Открыть блокнот",
    objectTooltip: "записки от незнакомцев",
    number: (o) => `№ ${o.number}`,
    dialogLabel: (o) => `Блокнот № ${o.number}`,
    daySpan: (o) => `${o.from} – ${o.to}`,
    since: (o) => `с ${o.day}`,
    insideCover: "форзац",
    insideCoverAndPage: (o) => `форзац · с. ${o.page}`,
    page: (o) => `с. ${o.page}`,
    pages: (o) => `с. ${o.left}–${o.right}`,
    pageButtonLabel: (o) => `Страница ${o.page}, перейти на другую страницу`,
    previousPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    scrubberLabel: "Страница",
    goToPage: "перейти к странице",
    pageInputLabel: (o) => `Номер страницы, от 1 до ${o.pageCount}`,
    report: "пожаловаться",
    reported: "жалоба отправлена",
    opening: "открываем блокнот…",
    missing: (o) => `блокнота № ${o.number} нет`,
    full: (o) => `блокнот № ${o.number} заполнен · только чтение`,
    someoneWritingInNotebook: "кто-то пишет в блокноте · подожди своей очереди",
    someoneWriting: "кто-то сейчас пишет · подожди своей очереди",
    startsNext: (o) => `с этой записки начнётся блокнот № ${o.number}`,
    writePromptBeforeKeys: "напиши записку следующему · ",
    writePromptAfterKeys: ", чтобы сохранить",
    textareaLabel: "Написать записку в блокноте",
    notifyWhenFree: "сообщи, когда освободится",
    notifyPending: "мы дадим знать",
    saveNote: "сохранить записку",
    savingNote: "сохраняем…",
    close: "закрыть",
    freeNotificationTitle: "блокнот свободен",
    freeNotificationBody: "твоя очередь писать",
    leaveFailures: {
      offline: "блокнот сейчас недоступен · твоя записка останется здесь",
      rate_limited: "одна записка раз в две минуты · попробуй чуть позже",
      daily_limit_reached: "на сегодня записок хватит · приходи завтра",
      contains_link: "в блокноте нельзя оставлять ссылки",
      too_long: "слишком длинно для блокнота · сократи немного",
      sign_off_too_long: "подпись слишком длинная",
      empty_body: "сначала напиши что-нибудь",
      unknown: "что-то пошло не так · попробуй ещё раз",
    },
  },
  firstVisit: {
    garments: {
      tee: "футболка",
      jeans: "джинсы",
      sweater: "свитер",
      towel: "полотенце",
      socks: "носки",
      shirt: "рубашка",
    },
    garmentLabel: (o) => `Положить в корзину: ${o.garment}`,
    basketEmpty: "закинь сюда одежду с пола",
    basketPartial: (o) =>
      `${o.count} из ${o.total} в корзине · добавь ещё или иди к двери`,
    basketFull: "всё в корзине · иди к двери",
    lampOffTooltip: "выключить лампу",
    lampOnTooltip: "включить лампу",
    lampOffLabel: "Выключить лампу",
    lampOnLabel: "Включить лампу",
    doorReadyTooltip: "отнести в прачечную",
    doorWaitingTooltip: "сначала собери бельё",
    doorReadyLabel: "Отнести корзину в прачечную",
    doorWaitingLabel: "Дверь в прачечную, сначала собери бельё",
    justListen: "просто послушать →",
  },
} satisfies LaundromatCopy;
