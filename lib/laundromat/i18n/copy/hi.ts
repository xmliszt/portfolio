import type { GarmentKind } from "@/lib/laundromat/first-visit/bedroom-config";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { LeaveEntryFailureReason } from "@/lib/laundromat/notebook/describe-leave-failure";
import type { MachineKind } from "@/lib/laundromat/scene-config";
import type { TvStationId } from "@/lib/laundromat/tv/tv-state";

type Machine = { kind: MachineKind; number: number };

export const hi = {
  locale: "hi",
  languageName: "हिन्दी",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: लॉन्ड्री में एक सुकून भरा फ़ोकस टाइमर, lofi के साथ",
    description:
      "एक शांत लॉन्ड्री में कपड़े धोने को फ़ोकस टाइमर बनाओ। धोना, सुखाना, फ़ोकस, lofi, कॉफ़ी, अजनबियों के लिए एक नोटबुक, या बस खो जाना। मुफ़्त, बिना साइन-अप।",
    intro:
      "तुम्हारे ब्राउज़र में एक शांत लॉन्ड्री। फ़ोकस टाइमर के लिए वॉशिंग मशीन या ड्रायर को 5 से 60 मिनट तक चलाओ और पूरा होने पर सूचना पाओ, टीवी पर lo-fi स्टेशन चलाओ, एक कॉफ़ी बनाओ, और साझा नोटबुक में हाथ से लिखा एक नोट छोड़ जाओ। भरी हुई नोटबुकें शेल्फ़ पर रखी जाती हैं।",
    keywords: [
      "लॉन्ड्री",
      "फ़ोकस टाइमर",
      "pomodoro",
      "lofi",
      "काम के लिए संगीत",
      "पढ़ाई",
      "सुकून",
      "साझा नोटबुक",
    ],
    inspiredBy: "प्रेरणा",
    openGraphLocale: "hi_IN",
  },
  toolbar: {
    soundOn: "आवाज़ चालू",
    soundOff: "आवाज़ बंद",
    share: "शेयर करो",
    linkCopied: "लिंक कॉपी हो गया",
    shareText:
      "तुम्हारे ब्राउज़र में एक शांत लॉन्ड्री। कपड़े डालो, टाइमर चलने दो, और लोगों के छोड़े हुए नोट पढ़ो।",
    language: "भाषा",
  },
  tabDone: "हो गया",
  readoutDone: "पूरा",
  matWelcome: "स्वागत",
  machine: {
    name: (machine: Machine) =>
      `${machine.kind === "washer" ? "वॉशिंग मशीन" : "ड्रायर"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, खाली`,
    freeTooltip: (o: { name: string }) => `${o.name} · खाली`,
    loadedLabel: (o: { name: string }) =>
      `${o.name}, कपड़े अंदर हैं, चलाने के लिए तैयार`,
    loadedTooltip: (o: { name: string }) => `${o.name} · कपड़े अंदर`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, ${o.kind === "washer" ? "धुलाई" : "सुखाई"} चल रही है, ${o.remaining} बाकी`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "धुलाई" : "सुखाई"} · ${o.time} पर खत्म`,
    doneLabel: (o: { name: string }) =>
      `${o.name}, हो गया, अपने कपड़े निकाल लो`,
    doneTooltip: (o: { name: string }) => `${o.name} · हो गया`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, किसी और के कपड़े ${o.kind === "washer" ? "धुल" : "सूख"} रहे हैं, ${o.remaining} बाकी`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `कोई और कपड़े ${o.kind === "washer" ? "धो" : "सुखा"} रहा है · ${o.time} पर खत्म`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, इसमें किसी और के कपड़े हैं`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · किसी और के कपड़े, शुरू नहीं हुआ`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, किसी और के कपड़े तैयार हैं`,
    othersDoneTooltip: (o: { name: string }) => `${o.name} · किसी और के, तैयार`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · हो गया`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "अपने कपड़े निकालो और एक ड्रायर चुनो"
        : "तुम्हारे कपड़े सूख गए",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.name} का ${o.control === "dial" ? "डायल" : o.control === "start" ? "स्टार्ट बटन" : "दरवाज़ा"}, कोई और इस्तेमाल कर रहा है`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `किसी और की ${o.kind === "washer" ? "धुलाई" : "सुखाई"} · ${o.time} पर खत्म`,
    othersLoadedTooltip: "किसी और के कपड़े · अभी शुरू नहीं हुआ",
    othersDoneTooltip: "किसी और के कपड़े · अपने मालिक का इंतज़ार",
    doneAt: (o: { time: string }) => `${o.time} पर खत्म`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `${o.name} का साइकल, ${o.minutes} मिनट`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `घुमाओ · ${o.minutes} मिनट → ${o.nextMinutes} मिनट`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `${o.name} का स्टार्ट बटन, ${o.minutes} मिनट की ${o.kind === "washer" ? "धुलाई" : "सुखाई"}${o.canNotify ? ", पूरा होने पर सूचना मिलेगी" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `शुरू करो · ${o.minutes} मिनट की ${o.kind === "washer" ? "धुलाई" : "सुखाई"}${o.canNotify ? " · सूचना मिलेगी" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, ${o.kind === "washer" ? "धुलाई" : "सुखाई"} पूरी होने पर मुझे याद दिलाना`,
    remindTooltip: (o: { doneAt: string }) => `याद दिलाना · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) =>
      `${o.name} का स्टार्ट बटन, ${o.reminderOn ? "रिमाइंडर चालू, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `रिमाइंडर चालू · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `${o.name} का स्टार्ट बटन`,
    loadFirstTooltip: "पहले कपड़े डालो",
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "धुलाई" : "सुखाई"} चल रही है · ${o.doneAt}`,
    doneDoorTooltip: "दरवाज़ा खोलो · कपड़े निकालो",
    loadedDoorTooltip: "दरवाज़ा खोलो · कपड़े वापस निकालो",
    loadableDoorTooltip: "कपड़े डालो",
    doorLabel: (o: { name: string }) => `${o.name} का दरवाज़ा`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `${o.name} का दरवाज़ा, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `स्वागत मैट, अपने ${o.laundry === "folded" ? "सूखे" : "धुले"} कपड़े घर ले जाओ`,
    readyTooltip: "घर चलो · कपड़े साथ ले जाओ",
    waitingLabel: "स्वागत मैट, कपड़े तैयार होने पर घर का रास्ता",
    waitingTooltip: "घर का रास्ता · पहले अपनी धुलाई पूरी करो",
  },
  laundryBasket: {
    labels: {
      empty: "कपड़ों की टोकरी, खाली",
      dirty: "कपड़ों की टोकरी, धोने के कपड़े",
      wet: "कपड़ों की टोकरी, सुखाने के गीले कपड़े",
      folded: "कपड़ों की टोकरी, साफ़ सूखे कपड़े",
    },
    tooltips: {
      empty: "टोकरी · खाली",
      dirty: "मैले कपड़े · वॉशर में डालो",
      wet: "गीले कपड़े · ड्रायर में डालो",
      folded: "साफ़ और सूखे · घर जाने को तैयार",
    },
  },
  coffee: {
    machineLabel: "कॉफ़ी मशीन",
    brewingMachineLabel: "कॉफ़ी मशीन, कॉफ़ी बन रही है",
    brewingTooltip: "बन रही है…",
    idleSwitchLabel: "कॉफ़ी मशीन का स्विच, कॉफ़ी बनाओ",
    idleSwitchTooltip: "एक कॉफ़ी बनाओ",
    brewingSwitchLabel: "कॉफ़ी मशीन का स्विच, कॉफ़ी बन रही है",
    readyMachineLabel: "कॉफ़ी मशीन, जग में कॉफ़ी है",
    readyMachineTooltip: "कॉफ़ी तैयार है",
    topUpSwitchLabel: "कॉफ़ी मशीन का स्विच, जग फिर से भरो",
    topUpSwitchTooltip: "जग भरो",
    fullSwitchLabel: "कॉफ़ी मशीन का स्विच, जग भरा हुआ है",
    fullSwitchTooltip: "जग भरा है · पहले एक कप डालो",
    emptyFlaskLabel: "कॉफ़ी जग, ख़ाली",
    emptyFlaskTooltip: "जग ख़ाली है",
    brewingFlaskLabel: "कॉफ़ी जग, कॉफ़ी बन रही है",
    pourLabel: "कॉफ़ी जग, एक कप डालो",
    pourTooltip: "एक कप डालो",
    cupFullFlaskLabel: "कॉफ़ी जग, पहले अपना कप ख़त्म करो",
    cupFullFlaskTooltip: "पहले कप ख़त्म करो",
    fullCupLabel: "कॉफ़ी का कप, पियो",
    fullCupTooltip: "पियो",
    emptyCupLabel: "कॉफ़ी का कप, ख़ाली",
    emptyCupTooltip: "ख़ाली कप",
  },
  plant: {
    label: "पौधा, घास छुओ",
    tooltip: "घास छुओ",
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `ट्यूब काउंटर, ${o.count === 1 ? "यहाँ सिर्फ़ तुम" : `यहाँ ${o.count} लोग`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "यहाँ सिर्फ़ तुम" : `यहाँ ${o.count} लोग`,
    offLabel: "ट्यूब काउंटर, बंद",
    offTooltip: "बंद",
  },
  tv: {
    stations: {
      "rainy-cafe": "बारिश वाला कैफ़े",
      "piano-night": "पियानो की रात",
      "late-wash": "देर रात की धुलाई",
      "tape-hiss": "टेप की सरसराहट",
      "city-at-3am": "रात 3 बजे का शहर",
    } satisfies { [id in TvStationId]: string },
    station: (o: { channel: string; name: string }) =>
      `चैनल ${o.channel} · ${o.name}`,
    offLabel: "टीवी, बंद",
    offTooltip: "टीवी · बंद",
    onLabel: (o: { station: string }) => `टीवी, चालू, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `टीवी स्क्रीन, ${o.station}, YouTube पर देखो`,
    screenOnTooltip: "YouTube पर देखो ↗",
    screenOffLabel: "टीवी स्क्रीन, बंद, चालू करो",
    turnOn: "चालू करो",
    tunerLabel: (o: { station: string }) => `टीवी चैनल, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) => `अगला स्टेशन · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `टीवी की आवाज़, ${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `आवाज़ · ${o.percent}%`,
    powerOnLabel: "टीवी पावर, चालू, बंद करो",
    turnOff: "बंद करो",
    powerOffLabel: "टीवी पावर, बंद, चालू करो",
    noSignal: "सिग्नल नहीं",
  },
  shelf: {
    loadingLabel: "शेल्फ़, भरी हुई नोटबुकें देखी जा रही हैं",
    loadingTooltip: "शेल्फ़ देख रहे हैं…",
    offlineLabel: "शेल्फ़, अभी ऑफ़लाइन है",
    offlineTooltip: "शेल्फ़ अभी ऑफ़लाइन है",
    emptyLabel: "शेल्फ़, अभी कोई भरी हुई नोटबुक नहीं",
    emptyTooltip: "अभी कोई भरी हुई नोटबुक नहीं",
    readyLabel: "भरी हुई नोटबुकों की शेल्फ़ देखो",
    bookCount: (o: { count: number }) =>
      o.count === 1 ? "1 भरी हुई नोटबुक" : `${o.count} भरी हुई नोटबुकें`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `नोटबुक नं. ${o.number} खोलो, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) => `${o.count} नोट`,
  },
  notebook: {
    objectLabel: "नोटबुक खोलो",
    objectTooltip: "अजनबियों के नोट",
    number: (o: { number: number }) => `नं. ${o.number}`,
    dialogLabel: (o: { number: number }) => `नोटबुक नं. ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `${o.day} से`,
    insideCover: "अंदर का कवर",
    insideCoverAndPage: (o: { page: number }) => `अंदर का कवर · पृ. ${o.page}`,
    page: (o: { page: number }) => `पृ. ${o.page}`,
    pages: (o: { left: number; right: number }) => `पृ. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `पेज ${o.page}, किसी और पेज पर जाओ`,
    previousPage: "पिछला पेज",
    nextPage: "अगला पेज",
    scrubberLabel: "पेज",
    goToPage: "पेज पर जाओ",
    pageInputLabel: (o: { pageCount: number }) =>
      `पेज नंबर, 1 से ${o.pageCount}`,
    report: "रिपोर्ट करो",
    reported: "रिपोर्ट हो गया",
    opening: "नोटबुक खुल रही है…",
    missing: (o: { number: number }) => `नोटबुक नं. ${o.number} नहीं है`,
    full: (o: { number: number }) =>
      `नोटबुक नं. ${o.number} भर चुकी है · सिर्फ़ पढ़ सकते हो`,
    someoneWritingInNotebook:
      "कोई नोटबुक में लिख रहा है · अपनी बारी का इंतज़ार करो",
    someoneWriting: "कोई अभी लिख रहा है · अपनी बारी का इंतज़ार करो",
    startsNext: (o: { number: number }) =>
      `यह नोट नोटबुक नं. ${o.number} की शुरुआत करेगा`,
    writePromptBeforeKeys: "अगले व्यक्ति के लिए एक नोट लिखो · ",
    writePromptAfterKeys: " दबाकर सहेजो",
    textareaLabel: "नोटबुक में एक नोट लिखो",
    notifyWhenFree: "खाली होने पर बताना",
    notifyPending: "हम बता देंगे",
    saveNote: "मेरा नोट सहेजो",
    savingNote: "सहेज रहे हैं…",
    close: "बंद करो",
    freeNotificationTitle: "नोटबुक खाली है",
    freeNotificationBody: "तुम्हारी लिखने की बारी",
    leaveFailures: {
      offline: "नोटबुक अभी ऑफ़लाइन है · तुम्हारा नोट यहीं रहेगा",
      rate_limited: "हर दो मिनट में एक नोट · थोड़ी देर में फिर कोशिश करो",
      daily_limit_reached: "आज के लिए इतने नोट काफ़ी हैं · कल फिर आना",
      contains_link: "नोटबुक में लिंक नहीं",
      too_long: "नोटबुक के लिए बहुत लंबा है · थोड़ा छोटा करो",
      sign_off_too_long: "नाम वाली लाइन बहुत लंबी है",
      empty_body: "पहले कुछ लिखो",
      unknown: "कुछ गड़बड़ हो गई · फिर कोशिश करो",
    } satisfies { [reason in LeaveEntryFailureReason]: string },
  },
  firstVisit: {
    garments: {
      tee: "टी-शर्ट",
      jeans: "जींस",
      sweater: "स्वेटर",
      towel: "तौलिया",
      socks: "मोज़े",
      shirt: "शर्ट",
    } satisfies { [kind in GarmentKind]: string },
    garmentLabel: (o: { garment: string }) => `${o.garment} को टोकरी में डालो`,
    basketEmpty: "फ़र्श पर पड़े कपड़े यहाँ डालो",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.total} में से ${o.count} अंदर · और डालो, या दरवाज़े की ओर चलो`,
    basketFull: "सब अंदर · दरवाज़े की ओर चलो",
    lampOffTooltip: "लैंप बंद करो",
    lampOnTooltip: "लैंप चालू करो",
    lampOffLabel: "लैंप बंद करो",
    lampOnLabel: "लैंप चालू करो",
    doorReadyTooltip: "इसे लॉन्ड्री तक ले चलो",
    doorWaitingTooltip: "पहले अपने कपड़े उठाओ",
    doorReadyLabel: "टोकरी लॉन्ड्री तक ले चलो",
    doorWaitingLabel: "लॉन्ड्री का दरवाज़ा, पहले अपने कपड़े उठाओ",
    justListen: "बस सुनो →",
  },
} satisfies LaundromatCopy;
