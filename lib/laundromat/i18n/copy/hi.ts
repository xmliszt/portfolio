import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
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
    shareImage: {
      headline: "तुम्हारे ब्राउज़र में एक शांत लॉन्ड्री।",
      subline:
        "धोना, सुखाना, फ़ोकस, lofi, कॉफ़ी, अजनबियों के लिए एक नोटबुक, या बस खो जाना",
    },
  },
  toolbar: {
    soundOn: "आवाज़ चालू",
    soundOff: "आवाज़ बंद",
    language: "भाषा",
    settings: "सेटिंग्स",
    builtBy: {
      beforeClaude: "Li Yuxuan और ",
      afterClaude: " ने ❤️ से बनाया",
    },
    updateAvailable: "अपडेट हुई लॉन्ड्री के लिए रीफ़्रेश करें",
  },
  settings: {
    heading: "सेटिंग्स",
    rendering: "रेंडरिंग",
    renderingHint:
      "लाइट में नरम रोशनी, पौधे का हिलना और नोटबुक व बोर्ड पर ज़ूम बंद हो जाते हैं। धीमे डिवाइस पर या कम मेमोरी में यह मदद करता है।",
    qualityAuto: "ऑटो",
    qualityAutoHint: (o: { quality: string }) =>
      `इस डिवाइस पर ${o.quality} चुनता है`,
    qualityFull: "पूरा",
    qualityFullHint: "सारी रोशनी और हलचल",
    qualityLite: "लाइट",
    qualityLiteHint: "मेमोरी और बैटरी पर हल्का",
    close: "बंद करें",
    closeHint: "बंद करने के लिए esc",
    temperature: "तापमान",
    weather: "मौसम",
    placeLabel: "मौसम की जगह",
    placePlaceholder: "कोई शहर खोजें",
    placeLive: "लाइव",
    placeNearYou: "आपके पास",
    placeSearching: "खोज रहे हैं…",
    placeNoResults: "कोई जगह नहीं मिली",
    conditionLabel: "आसमान",
    conditionLive: "लाइव मौसम",
    weatherHint:
      "लाइव मौसम का अनुमान आपके IP पते से लगाया जाता है, इसलिए कभी-कभी यह गलत हो सकता है। इसे खुद तय करने के लिए कोई शहर या आसमान चुनें। तापमान की इकाई तब तक जगह के हिसाब से रहती है जब तक आप खुद कोई इकाई न चुनें।",
    roomSounds: "कमरे की आवाज़ें",
    roomSoundsHint:
      "कमरे और उसमें मौजूद लोगों की आवाज़ें। किसी को बंद या धीमा करने पर वह सिर्फ़ आपके लिए बदलती है।",
    roomSoundsAllOn: "सब चालू",
    roomSoundsAllOff: "सब बंद",
    roomSoundOn: "चालू",
    roomSoundOff: "बंद",
    roomSoundVolume: (o: { sound: string }) => `${o.sound} का वॉल्यूम`,
    roomMix: {
      play: "कमरे का मिक्स चलाएँ",
      playing: "आपका मिक्स चल रहा है",
      playLabel: "कमरे का मिक्स आपके स्तरों पर चलाएँ",
      stopLabel: "कमरे का मिक्स रोकें",
    },
    ticket: {
      heading: "लॉन्ड्री की पर्ची",
      hint: "अपनी सेटिंग्स को एक छोटी फ़ाइल में रखने और उनका लिंक कॉपी करने के लिए पर्ची प्रिंट करें। किसी भी डिवाइस पर लिंक खोलें, या फ़ाइल यहाँ डालें, और सेटिंग्स वापस पाएँ।",
      print: "प्रिंट",
      insert: "डालें",
      printLabel:
        "लॉन्ड्री की पर्ची प्रिंट करें, जो आपकी सेटिंग्स एक फ़ाइल में सहेजती है और उनका लिंक कॉपी करती है",
      insertLabel:
        "लॉन्ड्री की पर्ची डालें, जो एक फ़ाइल से आपकी सेटिंग्स लोड करती है",
      ready: "तैयार",
      printing: "छाप रहा…",
      saved: "सहेज ली",
      linkCopied: "लिंक कॉपी हुआ",
      linkLabel: "आपकी लॉन्ड्री की पर्ची का लिंक",
      copyLink: "लिंक कॉपी",
      copied: "कॉपी हुआ",
      linkHint:
        "अपनी सेटिंग्स वहाँ ले जाने के लिए यह लिंक किसी दूसरे डिवाइस पर खोलें।",
      reading: "पढ़ रहा…",
      loaded: "लोड हो गई",
      unreadable: "पर्ची नहीं",
      title: "लॉन्ड्री की पर्ची",
      number: (o: { number: string }) => `नं. ${o.number}`,
      tv: (o: { percent: number }) => `टीवी ${o.percent}%`,
    },
    roomSound: {
      machines: { label: "मशीनें", hint: "चलती हुई वॉशिंग मशीनें और ड्रायर" },
      "shop-bell": {
        label: "दरवाज़े की घंटी",
        hint: "किसी के अंदर आने पर बजती है",
      },
      unloading: {
        label: "कपड़े निकालना",
        hint: "कोई कपड़े निकाले तो दरवाज़े की कुंडी",
      },
      coffee: {
        label: "कॉफ़ी",
        hint: "बनती कॉफ़ी की गुड़गुड़ और तैयार होने की बीप",
      },
      tv: { label: "टीवी की खरखर", hint: "बिना सिग्नल वाले टीवी की सरसराहट" },
      lamp: { label: "लैंप", hint: "लैंप का टिमटिमाकर जलना और क्लिक से बुझना" },
      weather: { label: "मौसम", hint: "खिड़की के बाहर बारिश और गरज" },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
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
    needsWashingTooltip: "पहले धो लो",
    alreadyWashedTooltip: "धुल चुके हैं · अब सुखाओ",
    alreadyDryTooltip: "सूख चुके हैं · घर ले जाओ",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `तुम्हारे कपड़े ${o.name} में इंतज़ार कर रहे हैं`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "तुम्हारे कपड़े अभी धुल रहे हैं"
        : "तुम्हारे कपड़े अभी सूख रहे हैं",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `तुम्हारे कपड़े तैयार हैं · ${o.name} में`,
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
    readyTooltip: "घर लौटो · साफ़ कपड़े साथ ले जाओ",
    awayLabel: "डोरमैट, कपड़े मशीन में छोड़कर घर लौटो",
    awayTooltip: "घर लौटो · कपड़े मशीन में ही रहेंगे",
    wetLabel: "डोरमैट, गीले कपड़े लेकर घर लौटो",
    wetTooltip: "घर लौटो · कपड़े अभी गीले हैं",
    dirtyLabel: "डोरमैट, घर जाने से पहले कपड़े वॉशर में डालो",
    dirtyTooltip: "पहले धो लो · कपड़े वॉशर में डालो",
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
    othersBrewingMachineLabel: "कॉफ़ी मशीन, कोई और कॉफ़ी बना रहा है",
    othersBrewingSwitchLabel: "कॉफ़ी मशीन का स्विच, कोई और कॉफ़ी बना रहा है",
    othersBrewingFlaskLabel: "कॉफ़ी जग, कोई और कॉफ़ी बना रहा है",
    othersBrewingTooltip: (o: { time: string }) =>
      `कोई और कॉफ़ी बना रहा है · ${o.time} पर खत्म`,
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
    blessings: [
      "भाग्य",
      "समृद्धि",
      "शांति",
      "खुशी",
      "सेहत",
      "अच्छी नींद",
      "साफ़ कपड़े",
      "गरम कॉफ़ी",
      "एकाग्रता",
      "दया",
      "धूप",
      "अच्छी खबर",
    ],
    blessing: (o: { count: number; word: string }) => `+${o.count} ${o.word}`,
  },
  toyBox: {
    closedLabel:
      "1955 लिखा खिलौने का डिब्बा, “यह भविष्य है” खिलौने का डिब्बा खोलो",
    closedTooltip: "“यह भविष्य है” खिलौने का डिब्बा खोलो",
    setLabel: "उड़ने वाली खिलौना कार, चलाओ",
    setTooltip: "चलाओ",
  },
  instantCamera: {
    objectLabel: "इंस्टेंट कैमरा, फ़ोटो खींचो",
    objectTooltip: "फ़ोटो खींचो",
    toolbar: "फ़ोटो खींचो",
    viewfinderLabel:
      "व्यूफ़ाइंडर। फ़ोटो का फ़्रेम चुनने के लिए खींचें, साइज़ बदलने के लिए कोना खींचें, फ़ोटो लेने के लिए Enter दबाएँ।",
    hint: "फ़्रेम चुनने के लिए खींचें · साइज़ के लिए कोना खींचें",
    snapFailed: "फ़ोटो नहीं बनी · फिर से कोशिश करें",
    putDown: "नीचे रखो",
    shutter: "फ़ोटो खींचें",
    portrait: "पोर्ट्रेट",
    landscape: "लैंडस्केप",
    turnToLandscape: "कैमरा लैंडस्केप में घुमाएँ",
    turnToPortrait: "कैमरा पोर्ट्रेट में घुमाएँ",
    cardLabel: "आपकी फ़ोटो",
    photoAlt: "आपकी इंस्टेंट फ़ोटो",
    notePlaceholder: "एक छोटा-सा नोट लिखें…",
    noteLabel: "फ़ोटो पर नोट",
    retake: "फिर से खींचो",
    copy: "कॉपी",
    done: "हो गया",
    copied: "फ़ोटो कॉपी हो गई",
    copyFailed: "फ़ोटो यहाँ कॉपी नहीं हो सकी",
    shareOn: (o: { platform: string }) => `${o.platform} पर शेयर करें`,
    more: "और",
    moreLabel: "शेयर करने के और तरीके",
    shareText: "laundro.cafe पर खींची गई",
    handoff: {
      copiedTitle: "फ़ोटो कॉपी हो गई",
      savedTitle: "फ़ोटो सेव हो गई",
      opening: (o: { platform: string; seconds: number }) =>
        `${o.seconds} में ${o.platform} खुल रहा है…`,
      pasteInPost: {
        before: "",
        after: " से फ़ोटो अपनी पोस्ट में पेस्ट करें।",
      },
      pasteInChat: {
        before: "कोई चैट चुनें, फिर ",
        after: " से फ़ोटो पेस्ट करें।",
      },
      pasteInNewPost: {
        before: "नई पोस्ट शुरू करें, फिर ",
        after: " से फ़ोटो पेस्ट करें।",
      },
      pickFromDownloads: (o: { file: string }) =>
        `बनाएँ पर क्लिक करें, फिर अपने डाउनलोड में से ${o.file} चुनें।`,
      blocked: "आपके ब्राउज़र ने नया टैब रोक लिया।",
      openNow: (o: { platform: string }) => `${o.platform} अभी खोलें`,
      open: (o: { platform: string }) => `${o.platform} खोलें`,
      cancel: "रद्द करें",
      pasteReminder: (o: { platform: string; keys: string }) =>
        `फ़ोटो कॉपी हो गई · ${o.keys} से इसे ${o.platform} में पेस्ट करें`,
      savedReminder: (o: { platform: string }) =>
        `फ़ोटो सेव हो गई · ${o.platform} में बनाएँ से इसे जोड़ें`,
    },
    mastodon: {
      ask: "mastodon को आपका सर्वर जानना है",
      server: "आपका सर्वर",
      post: "पोस्ट करें",
    },
  },
  board: {
    label: "सूचना बोर्ड, लॉन्ड्रोमैट में नया क्या है",
    tooltip: "नया क्या है",
    eyebrow: "सूचना बोर्ड",
    heading: "नया क्या है",
    subtitle: "लॉन्ड्रोमैट में छोटे बदलाव, सबसे नए पहले।",
    updated: (o: { date: string }) => `${o.date} को अपडेट किया`,
    footer: "हमेशा खुला, 24/7",
    close: "बंद करें",
    closeHint: "बंद करने के लिए esc",
    tags: {
      opening: "शुरुआत",
      tv: "टीवी",
      notebook: "नोटबुक",
      languages: "भाषाएँ",
      room: "कमरा",
      coffee: "कॉफ़ी",
      window: "खिड़की",
      light: "रोशनी",
      board: "बोर्ड",
    },
    updates: {
      "instant-camera": {
        title: "कमरे की फ़ोटो खींचें",
        body: "स्टूल या बिस्तर पर रखा इंस्टेंट कैमरा उठाइए, कमरे का कोई भी हिस्सा फ़्रेम कीजिए और फ़ोटो खींचिए। प्रिंट पर एक छोटा नोट लिखिए, फिर उसे शेयर कीजिए या किसी दोस्त को भेजने के लिए कॉपी कीजिए।",
      },
      "notebook-doodles": {
        title: "नोटबुक में ड्रॉइंग बनाएँ",
        body: "नोटबुक के पेन को लिखने से ड्रॉइंग पर बदलिए और अगले आने वाले के लिए एक छोटी ड्रॉइंग छोड़िए। लॉन्ड्री में जिसके पास भी नोटबुक खुली है, उसे यह पन्ने पर अपने आप बनती दिखती है।",
      },
      "weather-anywhere": {
        title: "बाहर का मौसम चुनें",
        body: "सेटिंग्स में कोई शहर चुनें और खिड़की और पैनल पर उसका मौसम देखें, या आसमान खुद चुनें। डिफ़ॉल्ट रूप से लाइव मौसम ही रहता है।",
      },
      "room-sound-mixer": {
        title: "कमरे को अपने हिसाब से मिक्स करें",
        body: "सेटिंग्स में अब कमरे की हर आवाज़ का अपना स्लाइडर है, ताकि बारिश तेज़ और मशीनें धीमी हो सकें। सबको एक साथ सुनने के लिए कमरे का मिक्स चलाएँ, और अपनी सेटिंग्स रखने या दूसरे डिवाइस पर ले जाने के लिए लॉन्ड्री की पर्ची प्रिंट करें।",
      },
      "weather-panel": {
        title: "अंदर और बाहर का मौसम",
        body: "खिड़की के ऊपर एक पैनल आपकी जगह का मौसम दिखाता है, आज के सबसे ज़्यादा और सबसे कम तापमान और हवा की गुणवत्ता के साथ। खिड़कियों में भी बारिश, बर्फ़, कोहरा या तूफ़ान दिखता है, आवाज़ के साथ। आपका शहर आपके कनेक्शन से मोटे तौर पर अंदाज़ा लगाया जाता है। हवा ख़राब होने पर कोने में एयर प्यूरीफ़ायर चालू हो जाता है।",
      },
      "room-sound-dials": {
        title: "चुनें कि आप क्या सुनें",
        body: "सेटिंग्स में अब कमरे की हर आवाज़ के लिए एक डायल है, मशीनों से लेकर दरवाज़े की घंटी तक। जो न सुनना चाहें उसे बंद कर दें। बाकी सबके लिए कमरा वैसा ही रहता है।",
      },
      "home-mid-wash": {
        title: "धुलाई के बीच घर जाओ",
        body: "डोरमैट पर कदम रखो और कपड़े धुलते समय घर लौट जाओ। गीले कपड़े टोकरी में घर आते हैं, सूखे बिस्तर पर।",
      },
      "bedroom-curtains": {
        title: "घर पर पर्दे और नया लैंप",
        body: "अपने कमरे के पर्दों या लैंप पर क्लिक करो। दोनों कमरे अब सूरज, चाँद और लैंप के साथ रोशन और अँधेरे होते हैं।",
      },
      "settings-lite": {
        title: "सेटिंग्स और लाइट मोड",
        body: "टूलबार का गियर सेटिंग्स खोलता है। धीमे डिवाइस पर लाइट चुनो, इससे मेमोरी और बैटरी बचती है।",
      },
      "door-bell": {
        title: "दरवाज़े पर एक घंटी",
        body: "जब आप अंदर आते हैं, और जब भी कोई और आता है, एक छोटी घंटी बजती है।",
      },
      "whats-new-board": {
        title: "नई बातों के लिए एक बोर्ड",
        body: "यह स्टैंड बताता है कि नया क्या है। दिन में काग़ज़ जैसा शांत, रात में रोशन।",
      },
      "twelve-stations": {
        title: "टीवी पर बारह स्टेशन",
        body: "सात नए लोफ़ी रेडियो ट्यूनर डायल भरते हैं, स्टडी हॉल से गहरे अंतरिक्ष तक।",
      },
      "page-drag": {
        title: "खींचकर पन्ने पलटें",
        body: "पन्ना पलटने के लिए उसके बाहरी किनारे पर कहीं से भी खींचें।",
      },
      "window-light": {
        title: "खिड़की से आती धूप",
        body: "दिन की रोशनी मशीनों और फ़र्श तक पहुँचती है, और सुबह-शाम गर्म हो जाती है।",
      },
      "shared-coffee": {
        title: "एक केतली कॉफ़ी साथ में",
        body: "सात लोग तक एक ही फ़्लास्क से कॉफ़ी डाल सकते हैं।",
      },
      "street-view": {
        title: "बाहर की सड़क",
        body: "खिड़की से सड़क दिखती है, सूरज या चाँद की रोशनी में।",
      },
      "tube-counter": {
        title: "कौन यहाँ है",
        body: "पीछे की दीवार पर लगी ट्यूबें लॉन्ड्रोमैट में मौजूद सबको गिनती हैं, आपको भी।",
      },
      "coffee-counter": {
        title: "काउंटर पर कॉफ़ी",
        body: "एक केतली बनाइए, कप भरिए, और कपड़े घूमते रहें तब तक पीजिए।",
      },
      "shared-machines": {
        title: "दूसरे भी कपड़े धो रहे हैं",
        body: "देखिए दूसरे कौन-सी मशीनें चला रहे हैं। आपके कपड़े डालने पर उनके कपड़े अपनी जगह रहते हैं।",
      },
      "eighteen-languages": {
        title: "18 भाषाओं में खुला",
        body: "पूरा लॉन्ड्रोमैट आपकी भाषा बोलता है। कोने के ग्लोब से बदलिए।",
      },
      "shared-notebook": {
        title: "अजनबियों के लिए नोटबुक",
        body: "अगले आने वाले के लिए एक नोट छोड़िए। भरी नोटबुकें शेल्फ़ पर रखी जाती हैं।",
      },
      "lofi-tv": {
        title: "टीवी पर लोफ़ी",
        body: "लोफ़ी रेडियो के लिए टीवी चालू कीजिए, ट्यूनर और वॉल्यूम नॉब के साथ।",
      },
      opening: {
        title: "laundro.cafe खुला",
        body: "आपके ब्राउज़र में एक शांत लॉन्ड्रोमैट: धोइए, सुखाइए, 5 से 60 मिनट ध्यान लगाइए।",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `ट्यूब काउंटर, ${o.count === 1 ? "यहाँ सिर्फ़ तुम" : `यहाँ ${o.count} लोग`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "यहाँ सिर्फ़ तुम" : `यहाँ ${o.count} लोग`,
    offLabel: "ट्यूब काउंटर, बंद",
    offTooltip: "बंद",
  },
  airPurifier: {
    label: (o: { aqi: number }) => `एयर प्यूरीफ़ायर, चालू, AQI ${o.aqi}`,
    tooltip: "एयर प्यूरीफ़ायर · हवा साफ़ कर रहा है",
    offLabel: "एयर प्यूरीफ़ायर, बंद",
    offTooltip: "बंद",
  },
  weatherPanel: {
    conditions: {
      sunny: "धूप",
      clear: "साफ़",
      cloudy: "बादल",
      fog: "कोहरा",
      rain: "बारिश",
      snow: "बर्फ़",
      thunder: "आंधी-तूफ़ान",
    },
    outside: "बाहर",
    high: "अधि",
    low: "न्यू",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `मौसम पैनल, ${o.temperature} ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "अच्छी",
      moderate: "मध्यम",
      sensitive: "संवेदनशील लोगों के लिए अस्वस्थ",
      unhealthy: "अस्वस्थ",
      veryUnhealthy: "बहुत अस्वस्थ",
      hazardous: "खतरनाक",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `हवा की गुणवत्ता ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `हवा ${o.band}`,
    offLabel: "मौसम पैनल, कोई रीडिंग नहीं",
    offTooltip: "अभी कोई रीडिंग नहीं",
  },
  tv: {
    stations: {
      "rainy-cafe": "बारिश वाला कैफ़े",
      "piano-night": "पियानो की रात",
      "late-wash": "देर रात की धुलाई",
      "tape-hiss": "टेप की सरसराहट",
      "city-at-3am": "रात 3 बजे का शहर",
      "study-hall": "पढ़ाई का कमरा",
      "smoky-jazz": "धुएँ भरा जैज़",
      fireplace: "अलाव",
      "neon-tokyo": "नियॉन टोक्यो",
      "string-quartet": "स्ट्रिंग चौकड़ी",
      "porch-guitar": "बरामदे की गिटार",
      "deep-space": "गहरा अंतरिक्ष",
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
    comeBackToWrite: "दूसरा नोट लिखने के लिए दो मिनट बाद आना",
    startsNext: (o: { number: number }) =>
      `यह नोट नोटबुक नं. ${o.number} की शुरुआत करेगा`,
    writePrompt: "अगले व्यक्ति के लिए एक नोट लिखो",
    writePromptBeforeKeys: "अगले व्यक्ति के लिए एक नोट लिखो · ",
    writePromptAfterKeys: " दबाकर सहेजो",
    textareaLabel: "नोटबुक में एक नोट लिखो",
    notifyWhenFree: "खाली होने पर बताना",
    notifyPending: "हम बता देंगे",
    saveNote: "मेरा नोट सहेजो",
    saveDoodle: "मेरी ड्रॉइंग सहेजो",
    penModeLabel: "पेन",
    penModes: { write: "लिखो", draw: "बनाओ" },
    drawPrompt: "अगले व्यक्ति के लिए कुछ बनाओ",
    doodleMoved: (o: { page: number }) =>
      `इस पेज पर जगह नहीं बची · पृ. ${o.page} पर बना रहे हैं`,
    doodleBookFull:
      "इस नोटबुक में ड्रॉइंग के लिए जगह नहीं है · इसके बजाय एक नोट लिखो",
    inkFull: "स्याही के लिए और जगह नहीं · सहेजो या वापस लो",
    someoneDrawingInNotebook:
      "कोई नोटबुक में ड्रॉइंग बना रहा है · अपनी बारी का इंतज़ार करो",
    padLabel: "नोटबुक में ड्रॉइंग की जगह",
    drawingNow: "बना रहे हैं…",
    someoneDrawingNow: "कोई ड्रॉइंग बना रहा है…",
    undo: "वापस",
    clear: "मिटाओ",
    savingNote: "सहेज रहे हैं…",
    close: "बंद करो",
    freeNotificationTitle: "नोटबुक खाली है",
    freeNotificationBody: "तुम्हारी लिखने की बारी",
    leaveFailures: {
      offline: "नोटबुक अभी ऑफ़लाइन है · तुम्हारा नोट यहीं रहेगा",
      rate_limited: "हर दो मिनट में एक नोट · थोड़ी देर में फिर कोशिश करो",
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
    basketWet: "कपड़े अभी गीले हैं · लॉन्ड्रोमैट में सुखाओ",
    lampOffTooltip: "लैंप बंद करो",
    lampOnTooltip: "लैंप चालू करो",
    lampOffLabel: "लैंप बंद करो",
    lampOnLabel: "लैंप चालू करो",
    curtainCloseTooltip: "पर्दे बंद करो",
    curtainOpenTooltip: "पर्दे खोलो",
    curtainCloseLabel: "पर्दे बंद करो",
    curtainOpenLabel: "पर्दे खोलो",
    bedTooltip: "सोने चलो",
    bedLabel: "सोने चलो",
    goodNight: "शुभ रात्रि",
    notSleepy: "अब नहीं सोना",
    doorReadyTooltip: "इसे लॉन्ड्री तक ले चलो",
    doorWaitingTooltip: "पहले अपने कपड़े उठाओ",
    doorAwayTooltip: "लॉन्ड्रोमैट वापस जाओ · कपड़े मशीन में हैं",
    doorAwayLabel: "लॉन्ड्रोमैट वापस जाओ, कपड़े अभी मशीन में हैं",
    doorReadyLabel: "टोकरी लॉन्ड्री तक ले चलो",
    doorWaitingLabel: "लॉन्ड्री का दरवाज़ा, पहले अपने कपड़े उठाओ",
    justListen: "बस सुनो →",
  },
} satisfies LaundromatCopy;
