import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
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
    shareImage: {
      headline: "тиха пральня у браузері.",
      subline:
        "прання, сушіння, фокус, lofi, кава, блокнот для незнайомців або просто відпочинок",
    },
  },
  toolbar: {
    soundOn: "звук увімк.",
    soundOff: "звук вимк.",
    share: "поділитися",
    linkCopied: "посилання скопійовано",
    shareText:
      "Тиха пральня у браузері. Завантаж білизну, запусти таймер і почитай записки, які залишили інші.",
    language: "Мова",
    settings: "налаштування",
    builtBy: {
      beforeClaude: "зроблено з ❤️ — Li Yuxuan і ",
      afterClaude: "",
    },
    updateAvailable: "онови — пральня оновилася",
  },
  settings: {
    heading: "налаштування",
    rendering: "відображення",
    renderingHint:
      "lite прибирає м'яке світло, похитування рослини й наближення до нотатника та дошки. допомагає на повільніших пристроях або коли бракує пам'яті.",
    qualityAuto: "авто",
    qualityAutoHint: (o: { quality: string }) =>
      `на цьому пристрої — ${o.quality}`,
    qualityFull: "повна",
    qualityFullHint: "усе світло й увесь рух",
    qualityLite: "lite",
    qualityLiteHint: "легше для пам'яті та батареї",
    close: "закрити",
    closeHint: "esc — закрити",
    temperature: "температура",
    weather: "погода",
    placeLabel: "місце для погоди",
    placePlaceholder: "знайти місто",
    placeLive: "поточна",
    placeNearYou: "поруч із вами",
    placeSearching: "шукаємо…",
    placeNoResults: "нічого не знайдено",
    conditionLabel: "небо",
    conditionLive: "поточна погода",
    weatherHint:
      "поточну погоду визначено за вашою IP-адресою, тому іноді вона може бути неточною. виберіть місто або небо, щоб задати її самостійно. одиниці температури залежать від місця, доки ви не виберете їх самі.",
    roomSounds: "звуки пральні",
    roomSoundsHint:
      "звуки пральні та людей у ній. якщо вимкнути звук або зробити його тихішим, це зміниться лише для вас.",
    roomSoundsAllOn: "увімкнути всі",
    roomSoundsAllOff: "вимкнути всі",
    roomSoundOn: "увімк",
    roomSoundOff: "вимк",
    roomSoundVolume: (o: { sound: string }) => `гучність: ${o.sound}`,
    roomMix: {
      play: "увімкнути мікс пральні",
      playing: "грає ваш мікс",
      playLabel: "увімкнути мікс пральні з вашою гучністю",
      stopLabel: "зупинити мікс пральні",
    },
    ticket: {
      heading: "квитанція пральні",
      hint: "надрукуйте квитанцію, щоб зберегти налаштування в маленькому файлі й скопіювати посилання на них. відкрийте посилання або вставте файл сюди на будь-якому пристрої, щоб повернути їх.",
      print: "друк",
      insert: "вставити",
      printLabel:
        "надрукувати квитанцію пральні, яка зберігає налаштування у файл і копіює посилання на них",
      insertLabel:
        "вставити квитанцію пральні, яка завантажує налаштування з файлу",
      ready: "готово",
      printing: "друк…",
      saved: "збережено",
      linkCopied: "скопійовано",
      linkLabel: "посилання на вашу квитанцію пральні",
      copyLink: "копіювати посилання",
      copied: "скопійовано",
      linkHint:
        "відкрийте це посилання на іншому пристрої, щоб перенести туди налаштування.",
      reading: "читання…",
      loaded: "завантажено",
      unreadable: "не квитанція",
      title: "квитанція пральні",
      number: (o: { number: string }) => `№ ${o.number}`,
      tv: (o: { percent: number }) => `тв ${o.percent}%`,
    },
    roomSound: {
      machines: {
        label: "машини",
        hint: "крутяться пральні й сушильні машини",
      },
      "shop-bell": { label: "дзвоник", hint: "дзвенить, коли хтось заходить" },
      unloading: {
        label: "вивантаження",
        hint: "клацання дверцят, коли хтось забирає білизну",
      },
      coffee: {
        label: "кава",
        hint: "булькання під час заварювання і сигнал готовності",
      },
      tv: { label: "шум тб", hint: "шипіння телевізора без сигналу" },
      lamp: {
        label: "лампа",
        hint: "лампа мерехтить, вмикаючись, і клацає, вимикаючись",
      },
      weather: { label: "погода", hint: "дощ і грім за вікном" },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
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
    needsWashingTooltip: "спершу випери",
    alreadyWashedTooltip: "вже випрано · тепер сушити",
    alreadyDryTooltip: "вже сухе · забирай додому",
    elsewhereLoadedTooltip: (o) => `твоя білизна чекає: ${o.name}`,
    elsewhereRunningTooltip: (o) =>
      o.kind === "washer" ? "твій одяг ще переться" : "твій одяг ще сохне",
    elsewhereDoneTooltip: (o) => `твоя білизна готова · ${o.name}`,
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
    readyTooltip: "повернутися додому · візьми чисту білизну",
    awayLabel: "Килимок, повернутися додому й лишити білизну в машині",
    awayTooltip: "повернутися додому · білизна лишиться в машині",
    wetLabel: "Килимок, повернутися додому з мокрою білизною",
    wetTooltip: "повернутися додому · білизна ще мокра",
    dirtyLabel: "Килимок, поклади одяг у пральну машину, перш ніж іти додому",
    dirtyTooltip: "спершу випери · поклади одяг у пральну машину",
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
    othersBrewingMachineLabel: "Кавоварка, хтось варить каву",
    othersBrewingSwitchLabel: "Кнопка кавоварки, хтось варить каву",
    othersBrewingFlaskLabel: "Колба для кави, хтось варить каву",
    othersBrewingTooltip: (o: { time: string }) =>
      `хтось варить каву · готово о ${o.time}`,
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
    blessings: [
      "удача",
      "достаток",
      "спокій",
      "радість",
      "здоров'я",
      "міцний сон",
      "чиста білизна",
      "гаряча кава",
      "зосередженість",
      "доброта",
      "сонце",
      "добрі новини",
    ],
    blessing: (o: { count: number; word: string }) => `+${o.count} ${o.word}`,
  },
  toyBox: {
    closedLabel:
      "Коробка з іграшкою з написом 1955, відкрити коробку «Це майбутнє»",
    closedTooltip: "відкрити коробку «Це майбутнє»",
    setLabel: "Іграшкова літаюча машина, грати",
    setTooltip: "грати",
  },
  board: {
    label: "Стенд, що нового в пральні",
    tooltip: "що нового",
    eyebrow: "дошка оголошень",
    heading: "що нового",
    subtitle: "Невеликі зміни в пральні, спершу нові.",
    updated: (o: { date: string }) => `оновлено ${o.date}`,
    footer: "завжди відчинено, 24/7",
    close: "закрити",
    closeHint: "esc — закрити",
    tags: {
      opening: "відкриття",
      tv: "тб",
      notebook: "блокнот",
      languages: "мови",
      room: "зала",
      coffee: "кава",
      window: "вікно",
      light: "світло",
      board: "стенд",
    },
    updates: {
      "notebook-doodles": {
        title: "малюйте в блокноті",
        body: "Перемкніть ручку блокнота з письма на малювання і залиште невеликий малюнок тому, хто прийде наступним. Кожен у пральні, у кого відкритий блокнот, бачить, як малюнок сам з'являється на сторінці.",
      },
      "weather-anywhere": {
        title: "виберіть погоду за вікном",
        body: "У налаштуваннях можна вибрати місто й бачити його погоду у вікні та на панелі або вибрати небо самостійно. Типово лишається поточна погода.",
      },
      "room-sound-mixer": {
        title: "змішайте звуки по-своєму",
        body: "Кожен звук пральні тепер має в налаштуваннях власний повзунок, тож дощ може бути гучнішим, а машини тихішими. Увімкніть мікс пральні, щоб почути все разом, і надрукуйте квитанцію пральні, щоб зберегти налаштування або перенести їх на інший пристрій.",
      },
      "weather-panel": {
        title: "погода всередині й надворі",
        body: "Панель над вікном показує погоду там, де ви, з сьогоднішнім максимумом і мінімумом та якістю повітря. Вікна теж її показують, дощ, сніг, туман чи грозу, з відповідним звуком. Місто визначається приблизно за вашим підключенням. Коли повітря стає шкідливим, у кутку вмикається очищувач.",
      },
      "room-sound-dials": {
        title: "обирайте, що чути",
        body: "У налаштуваннях тепер є ручка для кожного звуку пральні, від машин до дзвоника. Вимкніть те, чого не хочете чути. Для інших усе лишиться як було.",
      },
      "home-mid-wash": {
        title: "додому під час прання",
        body: "Стань на килимок, щоб піти додому, поки триває прання. Мокрий одяг їде додому в кошику, сухий лягає на ліжко.",
      },
      "bedroom-curtains": {
        title: "штори і нова лампа вдома",
        body: "Натисни на штори або лампу у своїй кімнаті. Тепер обидві кімнати світлішають і темніють разом із сонцем, місяцем і лампами.",
      },
      "settings-lite": {
        title: "налаштування і легкий режим",
        body: "Шестерня на панелі відкриває налаштування. На повільних пристроях увімкни легкий режим, щоб зберегти пам'ять і батарею.",
      },
      "door-bell": {
        title: "дзвіночок на дверях",
        body: "Дзвіночок дзеленчить, коли ви заходите і коли заходить хтось інший.",
      },
      "whats-new-board": {
        title: "стенд із новинами",
        body: "Цей стенд показує, що нового. Удень він як папір, уночі світиться.",
      },
      "twelve-stations": {
        title: "дванадцять каналів на тб",
        body: "Сім нових lofi-радіо заповнили шкалу, від читальної зали до глибокого космосу.",
      },
      "page-drag": {
        title: "гортати перетягуванням",
        body: "Потягніть за будь-яке місце зовнішнього краю сторінки, щоб перегорнути її.",
      },
      "window-light": {
        title: "сонце крізь вікно",
        body: "Денне світло сягає машин і підлоги й теплішає на світанку та заході.",
      },
      "shared-coffee": {
        title: "кава на всіх",
        body: "До семи людей наливають з однієї колби.",
      },
      "street-view": {
        title: "вулиця за вікном",
        body: "Вікно виходить на вулицю, освітлену сонцем або місяцем.",
      },
      "tube-counter": {
        title: "хто тут",
        body: "Лампи на задній стіні рахують усіх у пральні, і вас теж.",
      },
      "coffee-counter": {
        title: "кава на стійці",
        body: "Заваріть кавник, налийте чашку й пийте, поки крутиться прання.",
      },
      "shared-machines": {
        title: "інші теж перуть",
        body: "Видно, якими машинами користуються інші. Їхня білизна лишається на місці, коли ви завантажуєте свою.",
      },
      "eighteen-languages": {
        title: "відчинено 18 мовами",
        body: "Уся пральня говорить вашою мовою. Перемкніть глобусом у кутку.",
      },
      "shared-notebook": {
        title: "блокнот для незнайомців",
        body: "Залиште записку тому, хто прийде наступним. Повні блокноти йдуть на полицю.",
      },
      "lofi-tv": {
        title: "lofi на тб",
        body: "Увімкніть телевізор для lofi-радіо, з ручками каналів і гучності.",
      },
      opening: {
        title: "laundro.cafe відчиняється",
        body: "Тиха пральня у браузері: періть, сушіть і зосередьтеся на 5–60 хвилин.",
      },
    },
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
  airPurifier: {
    label: (o: { aqi: number }) => `Очищувач повітря, працює, AQI ${o.aqi}`,
    tooltip: "очищувач повітря · очищує повітря",
    offLabel: "Очищувач повітря, вимкнено",
    offTooltip: "вимкнено",
  },
  weatherPanel: {
    conditions: {
      sunny: "сонячно",
      clear: "ясно",
      cloudy: "хмарно",
      fog: "туман",
      rain: "дощ",
      snow: "сніг",
      thunder: "гроза",
    },
    outside: "надворі",
    high: "макс",
    low: "мін",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `Панель погоди, ${o.temperature} ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "добра",
      moderate: "помірна",
      sensitive: "шкідлива для чутливих",
      unhealthy: "шкідлива",
      veryUnhealthy: "дуже шкідлива",
      hazardous: "небезпечна",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `якість повітря: ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `повітря: ${o.band}`,
    offLabel: "Панель погоди, немає даних",
    offTooltip: "поки немає даних",
  },
  tv: {
    stations: {
      "rainy-cafe": "дощове кафе",
      "piano-night": "ніч біля фортепіано",
      "late-wash": "пізнє прання",
      "tape-hiss": "шурхіт плівки",
      "city-at-3am": "місто о третій ночі",
      "study-hall": "читальна зала",
      "smoky-jazz": "димний джаз",
      fireplace: "камін",
      "neon-tokyo": "неоновий токіо",
      "string-quartet": "струнний квартет",
      "porch-guitar": "гітара на ґанку",
      "deep-space": "глибокий космос",
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
    comeBackToWrite: "повертайся за дві хвилини, щоб написати ще одну",
    startsNext: (o) => `із цієї записки почнеться блокнот № ${o.number}`,
    writePrompt: "напиши записку наступному",
    writePromptBeforeKeys: "напиши записку наступному · ",
    writePromptAfterKeys: ", щоб зберегти",
    textareaLabel: "Написати записку в блокноті",
    notifyWhenFree: "повідом, коли звільниться",
    notifyPending: "ми дамо знати",
    saveNote: "зберегти записку",
    saveDoodle: "зберегти малюнок",
    penModeLabel: "Ручка",
    penModes: { write: "писати", draw: "малювати" },
    drawPrompt: "намалюй щось наступному",
    doodleMoved: (o) => `на цій сторінці немає місця · малюєш на с. ${o.page}`,
    doodleBookFull:
      "у цьому блокноті немає місця для малюнка · краще напиши записку",
    inkFull: "для чорнила більше немає місця · збережи або скасуй",
    someoneDrawingInNotebook: "хтось малює в блокноті · зачекай своєї черги",
    padLabel: "Місце для малюнка в блокноті",
    drawingNow: "малюєш…",
    someoneDrawingNow: "хтось малює…",
    undo: "скасувати",
    clear: "стерти",
    savingNote: "зберігаємо…",
    close: "закрити",
    freeNotificationTitle: "блокнот вільний",
    freeNotificationBody: "твоя черга писати",
    leaveFailures: {
      offline: "блокнот зараз недоступний · твоя записка залишиться тут",
      rate_limited: "одна записка раз на дві хвилини · спробуй трохи згодом",
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
    basketWet: "білизна ще мокра · висуши її в пральні",
    lampOffTooltip: "вимкнути лампу",
    lampOnTooltip: "увімкнути лампу",
    lampOffLabel: "Вимкнути лампу",
    lampOnLabel: "Увімкнути лампу",
    curtainCloseTooltip: "засунути штори",
    curtainOpenTooltip: "розсунути штори",
    curtainCloseLabel: "Засунути штори",
    curtainOpenLabel: "Розсунути штори",
    bedTooltip: "лягти спати",
    bedLabel: "Лягти спати",
    goodNight: "На добраніч",
    notSleepy: "більше не хочу спати",
    doorReadyTooltip: "віднести в пральню",
    doorWaitingTooltip: "спершу збери білизну",
    doorAwayTooltip: "повернутися в пральню · білизна в машині",
    doorAwayLabel: "Повернутися в пральню, білизна ще в машині",
    doorReadyLabel: "Віднести кошик у пральню",
    doorWaitingLabel: "Двері до пральні, спершу збери білизну",
    justListen: "просто послухати →",
  },
} satisfies LaundromatCopy;
