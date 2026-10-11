import type { GarmentKind } from "@/lib/laundromat/first-visit/bedroom-config";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { LeaveEntryFailureReason } from "@/lib/laundromat/notebook/describe-leave-failure";
import type { MachineKind } from "@/lib/laundromat/scene-config";
import type { TvStationId } from "@/lib/laundromat/tv/tv-state";

type Machine = { kind: MachineKind; number: number };

export const id = {
  locale: "id",
  languageName: "Bahasa Indonesia",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: timer fokus yang nyaman di laundry, dengan lofi",
    description:
      "Cuci baju sebagai timer fokus di laundry yang tenang. Cuci, keringkan, fokus, lofi, kopi, buku catatan untuk orang asing, atau sekadar melamun. Gratis, tanpa daftar.",
    intro:
      "Laundry yang tenang di browser kamu. Nyalakan mesin cuci atau pengering selama 5 sampai 60 menit sebagai timer fokus dan dapatkan notifikasi saat selesai, putar stasiun lo-fi di TV, seduh kopi, dan tinggalkan catatan tulisan tangan di buku catatan bersama. Buku catatan yang sudah penuh disimpan di rak.",
    keywords: [
      "laundry",
      "timer fokus",
      "pomodoro",
      "lofi",
      "musik kerja",
      "belajar",
      "nyaman",
      "buku catatan bersama",
    ],
    inspiredBy: "terinspirasi dari",
    openGraphLocale: "id_ID",
  },
  toolbar: {
    soundOn: "suara nyala",
    soundOff: "suara mati",
    share: "bagikan",
    linkCopied: "tautan disalin",
    shareText:
      "Laundry yang tenang di browser kamu. Masukkan cucian, biarkan timer berjalan, dan baca catatan yang ditinggalkan orang-orang.",
    language: "Bahasa",
  },
  tabDone: "selesai",
  readoutDone: "beres",
  matWelcome: "halo",
  machine: {
    name: (machine: Machine) =>
      `${machine.kind === "washer" ? "Mesin cuci" : "Pengering"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, kosong`,
    freeTooltip: (o: { name: string }) => `${o.name} · kosong`,
    loadedLabel: (o: { name: string }) =>
      `${o.name}, sudah diisi, siap dinyalakan`,
    loadedTooltip: (o: { name: string }) => `${o.name} · sudah diisi`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, sedang ${o.kind === "washer" ? "mencuci" : "mengeringkan"}, sisa ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `${o.kind === "washer" ? "mencuci" : "mengeringkan"} · selesai pukul ${o.time}`,
    doneLabel: (o: { name: string }) => `${o.name}, selesai, ambil cucianmu`,
    doneTooltip: (o: { name: string }) => `${o.name} · selesai`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, sedang ${o.kind === "washer" ? "mencuci" : "mengeringkan"} cucian orang lain, sisa ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `orang lain sedang ${o.kind === "washer" ? "mencuci" : "mengeringkan"} · selesai pukul ${o.time}`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, ada cucian orang lain di dalamnya`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · cucian orang lain, belum mulai`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, cucian orang lain sudah selesai`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · punya orang lain, selesai`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · selesai`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "ambil cucianmu dan pilih pengering"
        : "cucianmu sudah kering",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.control === "dial" ? "Pemutar" : o.control === "start" ? "Tombol mulai" : "Pintu"} ${o.name}, sedang dipakai orang lain`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `cucian orang lain sedang ${o.kind === "washer" ? "dicuci" : "dikeringkan"} · selesai pukul ${o.time}`,
    othersLoadedTooltip: "cucian orang lain · belum dimulai",
    othersDoneTooltip: "cucian orang lain · menunggu pemiliknya",
    doneAt: (o: { time: string }) => `selesai pukul ${o.time}`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `Siklus ${o.name}, ${o.minutes} menit`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `putar · ${o.minutes} menit → ${o.nextMinutes} menit`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `Tombol mulai ${o.name}, ${o.kind === "washer" ? "cuci" : "pengeringan"} ${o.minutes} menit${o.canNotify ? ", kamu akan diberi tahu saat selesai" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `mulai · ${o.kind === "washer" ? "cuci" : "pengeringan"} ${o.minutes} menit${o.canNotify ? " · kamu akan diberi tahu" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, ingatkan aku saat ${o.kind === "washer" ? "cucian" : "pengeringan"} selesai`,
    remindTooltip: (o: { doneAt: string }) => `ingatkan aku · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) =>
      `Tombol mulai ${o.name}, ${o.reminderOn ? "pengingat aktif, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) =>
      `pengingat aktif · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `Tombol mulai ${o.name}`,
    loadFirstTooltip: "masukkan cucian dulu",
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `${o.kind === "washer" ? "mencuci" : "mengeringkan"} · ${o.doneAt}`,
    doneDoorTooltip: "buka pintu · ambil cucian",
    loadedDoorTooltip: "buka pintu · keluarkan lagi cucian",
    loadableDoorTooltip: "masukkan cucian",
    doorLabel: (o: { name: string }) => `Pintu ${o.name}`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `Pintu ${o.name}, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `Keset, bawa pulang cucianmu yang ${o.laundry === "folded" ? "sudah kering" : "sudah dicuci"}`,
    readyTooltip: "pulang · bawa cucianmu",
    waitingLabel: "Keset, jalan pulang setelah cucianmu selesai",
    waitingTooltip: "jalan pulang · selesaikan cucianmu dulu",
  },
  laundryBasket: {
    labels: {
      empty: "Keranjang cucian, kosong",
      dirty: "Keranjang cucian, pakaian untuk dicuci",
      wet: "Keranjang cucian, pakaian basah untuk dikeringkan",
      folded: "Keranjang cucian, pakaian bersih dan kering",
    },
    tooltips: {
      empty: "keranjang · kosong",
      dirty: "pakaian kotor · ke mesin cuci",
      wet: "pakaian basah · ke mesin pengering",
      folded: "bersih dan kering · siap pulang",
    },
  },
  coffee: {
    machineLabel: "Mesin kopi",
    brewingMachineLabel: "Mesin kopi, sedang menyeduh",
    brewingTooltip: "menyeduh…",
    idleSwitchLabel: "Sakelar mesin kopi, seduh kopi",
    idleSwitchTooltip: "seduh kopi",
    brewingSwitchLabel: "Sakelar mesin kopi, sedang menyeduh",
    readyMachineLabel: "Mesin kopi, ada kopi di teko",
    readyMachineTooltip: "kopinya siap",
    topUpSwitchLabel: "Sakelar mesin kopi, isi ulang teko",
    topUpSwitchTooltip: "isi ulang teko",
    fullSwitchLabel: "Sakelar mesin kopi, teko sudah penuh",
    fullSwitchTooltip: "teko penuh · tuang secangkir dulu",
    emptyFlaskLabel: "Teko kopi, kosong",
    emptyFlaskTooltip: "teko kosong",
    brewingFlaskLabel: "Teko kopi, sedang menyeduh",
    pourLabel: "Teko kopi, tuang secangkir",
    pourTooltip: "tuang secangkir",
    cupFullFlaskLabel: "Teko kopi, habiskan cangkirmu dulu",
    cupFullFlaskTooltip: "habiskan cangkirmu dulu",
    fullCupLabel: "Cangkir kopi, minum",
    fullCupTooltip: "minum",
    emptyCupLabel: "Cangkir kopi, kosong",
    emptyCupTooltip: "cangkir kosong",
  },
  plant: {
    label: "Tanaman, sentuh rumput",
    tooltip: "sentuh rumput",
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Penghitung tabung, ${o.count === 1 ? "cuma kamu di sini" : `${o.count} orang di sini`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "cuma kamu di sini" : `${o.count} orang di sini`,
    offLabel: "Penghitung tabung, mati",
    offTooltip: "mati",
  },
  tv: {
    stations: {
      "rainy-cafe": "kafe saat hujan",
      "piano-night": "malam piano",
      "late-wash": "cucian larut malam",
      "tape-hiss": "desis kaset",
      "city-at-3am": "kota jam 3 pagi",
    } satisfies { [id in TvStationId]: string },
    station: (o: { channel: string; name: string }) =>
      `ch ${o.channel} · ${o.name}`,
    offLabel: "TV, mati",
    offTooltip: "tv · mati",
    onLabel: (o: { station: string }) => `TV, menyala, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `Layar TV, ${o.station}, tonton di YouTube`,
    screenOnTooltip: "tonton di YouTube ↗",
    screenOffLabel: "Layar TV, mati, nyalakan",
    turnOn: "nyalakan",
    tunerLabel: (o: { station: string }) => `Saluran TV, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) =>
      `stasiun berikutnya · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `Volume TV, ${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `volume · ${o.percent}%`,
    powerOnLabel: "Daya TV, menyala, matikan",
    turnOff: "matikan",
    powerOffLabel: "Daya TV, mati, nyalakan",
    noSignal: "tak ada sinyal",
  },
  shelf: {
    loadingLabel: "Rak, mencari buku catatan yang sudah penuh",
    loadingTooltip: "memeriksa rak…",
    offlineLabel: "Rak, sedang offline",
    offlineTooltip: "raknya sedang offline",
    emptyLabel: "Rak, belum ada buku catatan yang penuh",
    emptyTooltip: "belum ada buku catatan yang penuh",
    readyLabel: "Lihat rak buku catatan yang sudah penuh",
    bookCount: (o: { count: number }) => `${o.count} buku catatan penuh`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `Buka buku catatan No. ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) => `${o.count} catatan`,
  },
  notebook: {
    objectLabel: "Buka buku catatan",
    objectTooltip: "catatan dari orang asing",
    number: (o: { number: number }) => `No. ${o.number}`,
    dialogLabel: (o: { number: number }) => `Buku catatan No. ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `sejak ${o.day}`,
    insideCover: "sampul dalam",
    insideCoverAndPage: (o: { page: number }) =>
      `sampul dalam · hlm. ${o.page}`,
    page: (o: { page: number }) => `hlm. ${o.page}`,
    pages: (o: { left: number; right: number }) => `hlm. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `Halaman ${o.page}, pindah ke halaman lain`,
    previousPage: "Halaman sebelumnya",
    nextPage: "Halaman berikutnya",
    scrubberLabel: "Halaman",
    goToPage: "ke halaman",
    pageInputLabel: (o: { pageCount: number }) =>
      `Nomor halaman, 1 sampai ${o.pageCount}`,
    report: "laporkan",
    reported: "dilaporkan",
    opening: "membuka buku catatan…",
    missing: (o: { number: number }) =>
      `tidak ada buku catatan No. ${o.number}`,
    full: (o: { number: number }) =>
      `buku catatan No. ${o.number} sudah penuh · hanya bisa dibaca`,
    someoneWritingInNotebook:
      "seseorang sedang menulis di buku catatan · tunggu giliranmu",
    someoneWriting: "seseorang sedang menulis · tunggu giliranmu",
    startsNext: (o: { number: number }) =>
      `catatan ini membuka buku catatan No. ${o.number}`,
    writePromptBeforeKeys: "tulis catatan untuk orang berikutnya · ",
    writePromptAfterKeys: " untuk menyimpannya",
    textareaLabel: "Tulis catatan di buku catatan",
    notifyWhenFree: "kabari aku saat giliranku",
    notifyPending: "nanti kami kabari",
    saveNote: "simpan catatanku",
    savingNote: "menyimpan…",
    close: "tutup",
    freeNotificationTitle: "buku catatan sudah bisa dipakai",
    freeNotificationBody: "giliranmu menulis",
    leaveFailures: {
      offline: "buku catatan sedang offline · catatanmu tetap di sini",
      rate_limited: "satu catatan tiap dua menit · coba lagi sebentar lagi",
      daily_limit_reached: "cukup sekian catatan hari ini · kembali lagi besok",
      contains_link: "tidak boleh ada tautan di buku catatan",
      too_long: "terlalu panjang untuk buku catatan · persingkat sedikit",
      sign_off_too_long: "salam penutupnya terlalu panjang",
      empty_body: "tulis sesuatu dulu",
      unknown: "ada yang salah · coba lagi",
    } satisfies { [reason in LeaveEntryFailureReason]: string },
  },
  firstVisit: {
    garments: {
      tee: "kaus",
      jeans: "jin",
      sweater: "sweter",
      towel: "handuk",
      socks: "kaus kaki",
      shirt: "kemeja",
    } satisfies { [kind in GarmentKind]: string },
    garmentLabel: (o: { garment: string }) =>
      `Masukkan ${o.garment} ke keranjang`,
    basketEmpty: "lempar baju-baju di lantai ke sini",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.count} dari ${o.total} masuk · tambah lagi, atau ke pintu`,
    basketFull: "semua masuk · ke pintu",
    lampOffTooltip: "matikan lampu",
    lampOnTooltip: "nyalakan lampu",
    lampOffLabel: "Matikan lampu",
    lampOnLabel: "Nyalakan lampu",
    doorReadyTooltip: "bawa ke laundry",
    doorWaitingTooltip: "ambil cucianmu dulu",
    doorReadyLabel: "Bawa keranjang ke laundry",
    doorWaitingLabel: "Pintu ke laundry, ambil cucianmu dulu",
    justListen: "dengarkan saja →",
  },
} satisfies LaundromatCopy;
