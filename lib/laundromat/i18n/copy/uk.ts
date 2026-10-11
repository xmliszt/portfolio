import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

function pluralize(o: {
  count: number;
  one: string;
  few: string;
  many: string;
}) {
  const form = new Intl.PluralRules("uk").select(o.count);
  return form === "one" ? o.one : form === "few" ? o.few : o.many;
}

function minutesFor(count: number) {
  return pluralize({ count, one: "хвилину", few: "хвилини", many: "хвилин" });
}

export const uk = {
  locale: "uk",
  languageName: "Українська",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: затишний таймер фокусу в пральні, з lofi",
    description:
      "Пери білизну як таймер фокусу в тихій пральні. Прання, сушіння, фокус, lofi, кава, блокнот для незнайомців або просто відпочинок. Безкоштовно, без реєстрації.",
    intro:
      "Тиха пральня у браузері. Запусти прання або сушіння на час від 5 до 60 хвилин як таймер фокусу й отримай сповіщення, коли воно завершиться, вмикай lo-fi-станції на телевізорі, звари каву й залиш рукописну записку в спільному блокноті. Заповнені блокноти стають на полицю.",
    keywords: [
      "пральня",
      "таймер фокусу",
      "помодоро",
      "lofi",
      "музика для роботи",
      "навчання",
      "затишно",
      "спільний блокнот",
    ],
    inspiredBy: "за мотивами",
    openGraphLocale: "uk_UA",
  },
  toolbar: {
    soundOn: "звук увімк.",
    soundOff: "звук вимк.",
    share: "поділитися",
    linkCopied: "посилання скопійовано",
    shareText:
      "Тиха пральня у браузері. Завантаж білизну, запусти таймер і почитай записки, які залишили інші.",
    language: "Мова",
    builtBy: "зроблено з ❤️ — Li Yuxuan",
  },
  tabDone: "готово",
  readoutDone: "готово",
  matWelcome: "вітаємо",
  machine: {
    name: (machine) =>
      `${machine.kind === "washer" ? "Пральна машина" : "Сушарка"} ${machine.number}`,
    freeLabel: (o) => `${o.name}, вільна`,
    freeTooltip: (o) => `${o.name} · вільна`,
    loadedLabel: (o) => `${o.name}, завантажена, можна запускати`,
    loadedTooltip: (o) => `${o.name} · завантажена`,
    runningLabel: (o) =>
      `${o.name}, ${o.kind === "washer" ? "пере" : "сушить"}, лишилося ${o.remaining}`,
    runningTooltip: (o) =>
      `${o.kind === "washer" ? "прання" : "сушіння"} · готово о ${o.time}`,
    doneLabel: (o) => `${o.name}, готово, забери білизну`,
    doneTooltip: (o) => `${o.name} · готово`,
    othersRunningLabel: (o) =>
      `${o.name}, ${o.kind === "washer" ? "пере" : "сушить"} чужу білизну, лишилося ${o.remaining}`,
    othersRunningTooltip: (o) =>
      `хтось ${o.kind === "washer" ? "пере" : "сушить"} · готово о ${o.time}`,
    othersLoadedLabel: (o) => `${o.name}, усередині чужа білизна`,
    othersLoadedTooltip: (o) => `${o.name} · чужа білизна, не запущено`,
    othersDoneLabel: (o) => `${o.name}, чужа білизна готова`,
    othersDoneTooltip: (o) => `${o.name} · чуже, готово`,
    doneNotificationTitle: (o) => `${o.name} · готово`,
    doneNotificationBody: (o) =>
      o.kind === "washer"
        ? "забери білизну й обери сушарку"
        : "твоя білизна висохла",
  },
  machineControl: {
    controlInUseLabel: (o) =>
      `${{ dial: "Регулятор", start: "Кнопка запуску", door: "Дверцята" }[o.control]} (${o.name}), використовує хтось інший`,
    othersRunningTooltip: (o) =>
      `чуже ${o.kind === "washer" ? "прання" : "сушіння"} · готово о ${o.time}`,
    othersLoadedTooltip: "чужа білизна · ще не запущено",
    othersDoneTooltip: "чужа білизна · чекає на власника",
    doneAt: (o) => `готово о ${o.time}`,
    dialLabel: (o) =>
      `${o.name}, програма на ${o.minutes} ${minutesFor(o.minutes)}`,
    dialTooltip: (o) => `повернути · ${o.minutes} хв → ${o.nextMinutes} хв`,
    startLabel: (o) =>
      `${o.name}, запуск, ${o.kind === "washer" ? "прання" : "сушіння"} на ${o.minutes} ${minutesFor(o.minutes)}${o.canNotify ? ", сповістить, коли завершиться" : ""}`,
    startTooltip: (o) =>
      `запуск · ${o.kind === "washer" ? "прання" : "сушіння"} ${o.minutes} хв${o.canNotify ? " · зі сповіщенням" : ""}`,
    remindLabel: (o) =>
      `${o.name}, нагадати, коли ${o.kind === "washer" ? "прання" : "сушіння"} завершиться`,
    remindTooltip: (o) => `нагадати · ${o.doneAt}`,
    runningStartLabel: (o) =>
      `${o.name}, запуск, ${o.reminderOn ? "нагадування увімкнено, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o) => `нагадування увімкнено · ${o.doneAt}`,
    idleStartLabel: (o) => `${o.name}, запуск`,
    loadFirstTooltip: "спершу завантаж білизну",
    runningDoorTooltip: (o) =>
      `${o.kind === "washer" ? "прання" : "сушіння"} · ${o.doneAt}`,
    doneDoorTooltip: "відчинити дверцята · забрати білизну",
    loadedDoorTooltip: "відчинити дверцята · дістати білизну назад",
    loadableDoorTooltip: "завантажити білизну",
    doorLabel: (o) => `${o.name}, дверцята`,
    doorLabelWithHint: (o) => `${o.name}, дверцята, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o) =>
      `Килимок біля входу, забери ${o.laundry === "folded" ? "суху" : "випрану"} білизну додому`,
    readyTooltip: "додому · забери білизну з собою",
    waitingLabel: "Килимок біля входу, дорога додому, коли білизна буде готова",
    waitingTooltip: "дорога додому · спершу заверши прання",
  },
  laundryBasket: {
    labels: {
      empty: "Кошик для білизни, порожній",
      dirty: "Кошик для білизни, речі для прання",
      wet: "Кошик для білизни, мокрі речі для сушіння",
      folded: "Кошик для білизни, чисті сухі речі",
    },
    tooltips: {
      empty: "кошик · порожньо",
      dirty: "брудні речі · у пральну машину",
      wet: "мокрі речі · у сушарку",
      folded: "чисто й сухо · можна додому",
    },
  },
  coffee: {
    machineLabel: "Кавоварка",
    brewingMachineLabel: "Кавоварка, вариться кава",
    brewingTooltip: "вариться…",
    idleSwitchLabel: "Кнопка кавоварки, зварити каву",
    idleSwitchTooltip: "зварити каву",
    brewingSwitchLabel: "Кнопка кавоварки, вариться кава",
    readyMachineLabel: "Кавоварка, у колбі є кава",
    readyMachineTooltip: "кава готова",
    topUpSwitchLabel: "Кнопка кавоварки, долити колбу",
    topUpSwitchTooltip: "долити колбу",
    fullSwitchLabel: "Кнопка кавоварки, колба повна",
    fullSwitchTooltip: "колба повна · спершу налий чашку",
    emptyFlaskLabel: "Колба для кави, порожня",
    emptyFlaskTooltip: "колба порожня",
    brewingFlaskLabel: "Колба для кави, вариться",
    pourLabel: "Колба для кави, налити чашку",
    pourTooltip: "налити чашку",
    cupFullFlaskLabel: "Колба для кави, спершу допий чашку",
    cupFullFlaskTooltip: "спершу допий",
    fullCupLabel: "Чашка кави, випити",
    fullCupTooltip: "випити",
    emptyCupLabel: "Чашка кави, порожня",
    emptyCupTooltip: "порожня чашка",
  },
  plant: {
    label: "Рослина, торкнутися трави",
    tooltip: "торкнутися трави",
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Ламповий лічильник, ${o.count === 1 ? "тут лише ти" : `тут ${o.count} ${pluralize({ count: o.count, one: "людина", few: "людини", many: "людей" })}`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1
        ? "тут лише ти"
        : `тут ${o.count} ${pluralize({ count: o.count, one: "людина", few: "людини", many: "людей" })}`,
    offLabel: "Ламповий лічильник, вимкнено",
    offTooltip: "вимкнено",
  },
  tv: {
    stations: {
      "rainy-cafe": "дощове кафе",
      "piano-night": "ніч біля фортепіано",
      "late-wash": "пізнє прання",
      "tape-hiss": "шурхіт плівки",
      "city-at-3am": "місто о третій ночі",
    },
    station: (o) => `кан. ${o.channel} · ${o.name}`,
    offLabel: "Телевізор, вимкнено",
    offTooltip: "тв · вимк.",
    onLabel: (o) => `Телевізор, увімкнено, ${o.station}`,
    screenOnLabel: (o) => `Екран телевізора, ${o.station}, дивитися на YouTube`,
    screenOnTooltip: "дивитися на YouTube ↗",
    screenOffLabel: "Екран телевізора, вимкнено, увімкнути",
    turnOn: "увімкнути",
    tunerLabel: (o) => `Канал телевізора, ${o.station}`,
    tunerTooltip: (o) => `наступна станція · ${o.nextName}`,
    volumeLabel: (o) => `Гучність телевізора, ${o.percent}%`,
    volumeTooltip: (o) => `гучність · ${o.percent}%`,
    powerOnLabel: "Кнопка живлення телевізора, увімкнено, вимкнути",
    turnOff: "вимкнути",
    powerOffLabel: "Кнопка живлення телевізора, вимкнено, увімкнути",
    noSignal: "немає сигналу",
  },
  shelf: {
    loadingLabel: "Полиця, шукаємо заповнені блокноти",
    loadingTooltip: "дивимося на полиці…",
    offlineLabel: "Полиця, зараз недоступна",
    offlineTooltip: "полиця зараз недоступна",
    emptyLabel: "Полиця, заповнених блокнотів поки немає",
    emptyTooltip: "заповнених блокнотів поки немає",
    readyLabel: "Подивитися полицю із заповненими блокнотами",
    bookCount: (o) =>
      `${o.count} ${pluralize({ count: o.count, one: "заповнений блокнот", few: "заповнені блокноти", many: "заповнених блокнотів" })}`,
    bookLabel: (o) => `Відкрити блокнот № ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o) =>
      `${o.count} ${pluralize({ count: o.count, one: "запис", few: "записи", many: "записів" })}`,
  },
  notebook: {
    objectLabel: "Відкрити блокнот",
    objectTooltip: "записки від незнайомців",
    number: (o) => `№ ${o.number}`,
    dialogLabel: (o) => `Блокнот № ${o.number}`,
    daySpan: (o) => `${o.from} – ${o.to}`,
    since: (o) => `з ${o.day}`,
    insideCover: "форзац",
    insideCoverAndPage: (o) => `форзац · с. ${o.page}`,
    page: (o) => `с. ${o.page}`,
    pages: (o) => `с. ${o.left}–${o.right}`,
    pageButtonLabel: (o) => `Сторінка ${o.page}, перейти на іншу сторінку`,
    previousPage: "Попередня сторінка",
    nextPage: "Наступна сторінка",
    scrubberLabel: "Сторінка",
    goToPage: "перейти до сторінки",
    pageInputLabel: (o) => `Номер сторінки, від 1 до ${o.pageCount}`,
    report: "поскаржитися",
    reported: "скаргу надіслано",
    opening: "відкриваємо блокнот…",
    missing: (o) => `блокнота № ${o.number} немає`,
    full: (o) => `блокнот № ${o.number} заповнено · лише читання`,
    someoneWritingInNotebook: "хтось пише в блокноті · зачекай своєї черги",
    someoneWriting: "хтось зараз пише · зачекай своєї черги",
    startsNext: (o) => `із цієї записки почнеться блокнот № ${o.number}`,
    writePromptBeforeKeys: "напиши записку наступному · ",
    writePromptAfterKeys: ", щоб зберегти",
    textareaLabel: "Написати записку в блокноті",
    notifyWhenFree: "повідом, коли звільниться",
    notifyPending: "ми дамо знати",
    saveNote: "зберегти записку",
    savingNote: "зберігаємо…",
    close: "закрити",
    freeNotificationTitle: "блокнот вільний",
    freeNotificationBody: "твоя черга писати",
    leaveFailures: {
      offline: "блокнот зараз недоступний · твоя записка залишиться тут",
      rate_limited: "одна записка раз на дві хвилини · спробуй трохи згодом",
      daily_limit_reached: "на сьогодні записок досить · повертайся завтра",
      contains_link: "у блокноті не можна залишати посилання",
      too_long: "задовго для блокнота · скороти трохи",
      sign_off_too_long: "підпис задовгий",
      empty_body: "спершу напиши щось",
      unknown: "щось пішло не так · спробуй ще раз",
    },
  },
  firstVisit: {
    garments: {
      tee: "футболка",
      jeans: "джинси",
      sweater: "светр",
      towel: "рушник",
      socks: "шкарпетки",
      shirt: "сорочка",
    },
    garmentLabel: (o) => `Покласти в кошик: ${o.garment}`,
    basketEmpty: "закинь сюди одяг із підлоги",
    basketPartial: (o) =>
      `${o.count} з ${o.total} у кошику · додай ще або йди до дверей`,
    basketFull: "усе в кошику · йди до дверей",
    lampOffTooltip: "вимкнути лампу",
    lampOnTooltip: "увімкнути лампу",
    lampOffLabel: "Вимкнути лампу",
    lampOnLabel: "Увімкнути лампу",
    doorReadyTooltip: "віднести в пральню",
    doorWaitingTooltip: "спершу збери білизну",
    doorReadyLabel: "Віднести кошик у пральню",
    doorWaitingLabel: "Двері до пральні, спершу збери білизну",
    justListen: "просто послухати →",
  },
} satisfies LaundromatCopy;
