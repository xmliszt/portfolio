import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
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
    shareImage: {
      headline: "laundry yang tenang di browser kamu.",
      subline:
        "cuci, keringkan, fokus, lofi, kopi, buku catatan untuk orang asing, atau sekadar melamun",
    },
  },
  toolbar: {
    soundOn: "suara nyala",
    soundOff: "suara mati",
    language: "Bahasa",
    settings: "pengaturan",
    builtBy: {
      beforeClaude: "dibuat dengan ❤️ oleh Li Yuxuan & ",
      afterClaude: "",
    },
    updateAvailable: "muat ulang untuk laundry terbaru",
  },
  themes: {
    heading: "tema",
    seasonal: "musiman",
    seasonalOn: "Berubah pada momen khusus",
    seasonalOff: "Mempertahankan tema pilihanmu",
    hint: "Pilih tema",
    names: { classic: "bawaan", light: "linen", halloween: "halloween" },
  },
  settings: {
    heading: "pengaturan",
    rendering: "tampilan",
    renderingHint:
      "lite mematikan cahaya lembut, goyangan tanaman, dan zoom ke buku catatan dan papan. membantu di perangkat yang lebih lambat atau saat memori menipis.",
    qualityAuto: "otomatis",
    qualityAutoHint: (o: { quality: string }) =>
      `memakai ${o.quality} di perangkat ini`,
    qualityFull: "penuh",
    qualityFullHint: "semua cahaya dan gerakan",
    qualityLite: "lite",
    qualityLiteHint: "lebih ringan untuk memori dan baterai",
    close: "tutup",
    closeHint: "esc untuk menutup",
    temperature: "suhu",
    weather: "cuaca",
    placeLabel: "lokasi cuaca",
    placePlaceholder: "cari kota",
    placeLive: "langsung",
    placeNearYou: "di dekatmu",
    placeSearching: "mencari…",
    placeNoResults: "tidak ada tempat ditemukan",
    conditionLabel: "langit",
    conditionLive: "cuaca langsung",
    weatherHint:
      "cuaca langsung diperkirakan dari alamat IP-mu, jadi kadang bisa meleset. pilih kota atau langit untuk mengaturnya sendiri. satuan suhu mengikuti tempatnya sampai kamu memilih satu.",
    roomSounds: "suara ruangan",
    roomSoundsHint:
      "suara dari ruangan dan orang-orang di dalamnya. mematikan atau mengecilkan satu suara hanya mengubahnya untukmu.",
    roomSoundsAllOn: "nyalakan semua",
    roomSoundsAllOff: "matikan semua",
    roomSoundOn: "nyala",
    roomSoundOff: "mati",
    roomSoundVolume: (o: { sound: string }) => `volume ${o.sound}`,
    roomMix: {
      play: "putar mix ruangan",
      playing: "memutar mix-mu",
      playLabel: "putar mix ruangan dengan level pilihanmu",
      stopLabel: "hentikan mix ruangan",
    },
    ticket: {
      heading: "tiket laundry",
      hint: "cetak tiket untuk menyimpan pengaturanmu sebagai file kecil dan menyalin link-nya. buka link itu, atau masukkan file-nya di sini, di perangkat mana pun untuk memulihkannya.",
      print: "cetak",
      insert: "masukkan",
      printLabel:
        "cetak tiket laundry, yang menyimpan pengaturanmu ke file dan menyalin link-nya",
      insertLabel: "masukkan tiket laundry, yang memuat pengaturanmu dari file",
      ready: "siap",
      printing: "mencetak…",
      saved: "tersimpan",
      linkCopied: "link disalin",
      linkLabel: "link ke tiket laundry-mu",
      copyLink: "salin link",
      copied: "disalin",
      linkHint:
        "buka link ini di perangkat lain untuk membawa pengaturanmu ke sana.",
      reading: "membaca…",
      loaded: "termuat",
      unreadable: "bukan tiket",
      title: "tiket laundry",
      number: (o: { number: string }) => `no. ${o.number}`,
      tv: (o: { percent: number }) => `tv ${o.percent}%`,
    },
    roomSound: {
      machines: {
        label: "mesin",
        hint: "mesin cuci dan pengering yang berputar",
      },
      "shop-bell": { label: "bel toko", hint: "berbunyi saat seseorang masuk" },
      unloading: {
        label: "mengambil cucian",
        hint: "bunyi kait pintu saat seseorang mengambil cuciannya",
      },
      coffee: {
        label: "kopi",
        hint: "bunyi gelegak seduhan dan bip saat siap",
      },
      tv: { label: "semut tv", hint: "desis dari tv tanpa sinyal" },
      lamp: {
        label: "lampu",
        hint: "lampu berkedip saat menyala dan berbunyi klik saat mati",
      },
      weather: {
        label: "cuaca",
        hint: "hujan dan guntur di luar jendela",
      },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
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
    needsWashingTooltip: "cuci dulu",
    alreadyWashedTooltip: "sudah dicuci · keringkan berikutnya",
    alreadyDryTooltip: "sudah kering · bawa pulang",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `cucianmu menunggu di ${o.name}`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "pakaianmu masih dicuci"
        : "pakaianmu masih dikeringkan",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `cucianmu sudah selesai · di ${o.name}`,
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
    readyTooltip: "pulang · bawa cucian bersihmu",
    awayLabel: "Keset, pulang dan tinggalkan cucian di mesin",
    awayTooltip: "pulang · cucianmu tetap di mesin",
    wetLabel: "Keset, pulang dengan cucian basah",
    wetTooltip: "pulang · pakaiannya masih basah",
    dirtyLabel: "Keset, masukkan pakaian ke mesin cuci sebelum pulang",
    dirtyTooltip: "cuci dulu · masukkan pakaian ke mesin cuci",
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
    othersBrewingMachineLabel: "Mesin kopi, orang lain sedang menyeduh",
    othersBrewingSwitchLabel: "Sakelar mesin kopi, orang lain sedang menyeduh",
    othersBrewingFlaskLabel: "Teko kopi, orang lain sedang menyeduh",
    othersBrewingTooltip: (o: { time: string }) =>
      `orang lain sedang menyeduh · selesai pukul ${o.time}`,
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
    blessings: [
      "hoki",
      "rezeki",
      "ketenangan",
      "kebahagiaan",
      "kesehatan",
      "tidur nyenyak",
      "cucian bersih",
      "kopi hangat",
      "fokus",
      "kebaikan",
      "sinar matahari",
      "kabar baik",
    ],
    blessing: (o: { count: number; word: string }) => `+${o.count} ${o.word}`,
  },
  toyBox: {
    closedLabel:
      "Kotak mainan bertuliskan 1955, buka kotak mainan “It is the Future”",
    closedTooltip: "buka kotak mainan “It is the Future”",
    setLabel: "Mainan mobil terbang, mainkan",
    setTooltip: "mainkan",
  },
  instantCamera: {
    objectLabel: "Kamera instan, ambil foto",
    objectTooltip: "ambil foto",
    toolbar: "ambil foto",
    viewfinderLabel:
      "Jendela bidik. Seret untuk membingkai foto, seret sudutnya untuk mengubah ukuran, tekan Enter untuk memotret.",
    hint: "seret untuk membingkai · tarik sudut untuk mengubah ukuran",
    snapFailed: "fotonya tidak jadi · coba lagi",
    putDown: "taruh",
    shutter: "Ambil foto",
    portrait: "potret",
    landscape: "lanskap",
    turnToLandscape: "Putar kamera ke lanskap",
    turnToPortrait: "Putar kamera ke potret",
    cardLabel: "Fotomu",
    photoAlt: "Foto instanmu",
    notePlaceholder: "tulis catatan kecil…",
    noteLabel: "Catatan di foto",
    retake: "ulangi",
    copy: "salin",
    done: "selesai",
    copied: "foto disalin",
    copyFailed: "foto tidak bisa disalin di sini",
    shareOn: (o: { platform: string }) => `Bagikan ke ${o.platform}`,
    share: "bagikan",
    shareLabel: "Bagikan foto",
    more: "lainnya",
    moreLabel: "Cara lain untuk berbagi",
    download: "unduh",
    downloadLabel: "Unduh foto",
    downloaded: "foto diunduh",
    shareText: "dipotret di laundro.cafe",
    handoff: {
      copiedTitle: "Foto disalin",
      savedTitle: "Foto disimpan",
      opening: (o: { platform: string; seconds: number }) =>
        `Membuka ${o.platform} dalam ${o.seconds}…`,
      pasteInPost: { before: "Tempel foto ke postinganmu dengan ", after: "." },
      pasteInChat: {
        before: "Pilih obrolan, lalu tempel foto dengan ",
        after: ".",
      },
      pasteInNewPost: {
        before: "Mulai postingan, lalu tempel foto dengan ",
        after: ".",
      },
      pickFromDownloads: (o: { file: string }) =>
        `Klik Buat, lalu pilih ${o.file} dari unduhanmu.`,
      blocked: "Browser-mu menahan tab baru.",
      openNow: (o: { platform: string }) => `Buka ${o.platform} sekarang`,
      open: (o: { platform: string }) => `Buka ${o.platform}`,
      cancel: "Batal",
      pasteReminder: (o: { platform: string; keys: string }) =>
        `foto disalin · tempel ke ${o.platform} dengan ${o.keys}`,
      savedReminder: (o: { platform: string }) =>
        `foto disimpan · tambahkan di ${o.platform} lewat buat`,
    },
    mastodon: {
      ask: "mastodon perlu tahu servermu",
      server: "servermu",
      post: "posting",
    },
  },
  board: {
    label: "Papan pengumuman, apa yang baru di laundromat",
    tooltip: "apa yang baru",
    eyebrow: "papan pengumuman",
    heading: "apa yang baru",
    subtitle: "Perubahan kecil di laundromat, yang terbaru lebih dulu.",
    updated: (o: { date: string }) => `diperbarui ${o.date}`,
    footer: "selalu buka, 24/7",
    close: "tutup",
    closeHint: "esc untuk menutup",
    tags: {
      opening: "pembukaan",
      tv: "tv",
      notebook: "buku catatan",
      languages: "bahasa",
      room: "ruangan",
      coffee: "kopi",
      window: "jendela",
      light: "cahaya",
      board: "papan",
    },
    updates: {
      "halloween-theme": {
        title: "halloween di kedua ruangan",
        body: "Halloween telah tiba di laundro.cafe. Pilih Halloween dari tombol tema, atau aktifkan Musiman untuk mengikuti perayaan.",
      },
      "light-appearance": {
        title: "ruangan bernuansa linen",
        body: "Pilih Linen lewat tombol tema untuk dinding yang lebih hangat dan tombol berwarna kertas. Aktifkan Musiman untuk mengikuti momen khusus atau pertahankan temamu.",
      },
      "tip-coin-machine": {
        title: "beri tip di mesin koin",
        body: "Kalau mau mendukung laundro.cafe, kamu bisa memberi tip kecil di mesin koin dekat meja. Koinmu jatuh ke dalam toples dan mesin mencetak token untukmu. Masukkan ke mesin cuci atau pengering untuk pesta cuci atau pesta pengeringan yang bisa dilihat semua orang di ruangan. Terima kasih atas dukunganmu.",
      },
      "instant-camera": {
        title: "memotret ruangan",
        body: "Ambil kamera instan di kursi bar atau di kasur, bingkai bagian mana pun dari ruangan, lalu jepret. Tulis catatan singkat di cetakan fotonya, lalu bagikan atau salin untuk dikirim ke teman.",
      },
      "notebook-doodles": {
        title: "menggambar di buku catatan",
        body: "Ganti pena buku catatan dari tulis ke gambar dan tinggalkan gambar kecil untuk orang berikutnya. Siapa pun di laundry yang sedang membuka buku catatan akan melihat gambarnya muncul sendiri di halaman.",
      },
      "weather-anywhere": {
        title: "pilih cuaca di luar",
        body: "Di pengaturan, pilih kota untuk melihat cuacanya di jendela dan di panel, atau pilih langitnya sendiri. Bawaannya tetap cuaca langsung.",
      },
      "room-sound-mixer": {
        title: "racik suara ruangan sesukamu",
        body: "Setiap suara ruangan di pengaturan sekarang punya penggeser sendiri, jadi hujan bisa lebih keras dan mesin lebih pelan. Putar mix ruangan untuk mendengar semuanya bersama, dan cetak tiket laundry untuk menyimpan pengaturanmu atau membawanya ke perangkat lain.",
      },
      "weather-panel": {
        title: "cuaca, di dalam dan di luar",
        body: "Panel di atas jendela menampilkan cuaca di tempatmu, dengan suhu tertinggi dan terendah hari ini serta kualitas udara. Jendela juga menampilkannya, hujan, salju, kabut, atau badai, lengkap dengan suaranya. Kotamu ditebak secara kasar dari koneksimu. Saat udara jadi tidak sehat, pembersih udara di pojok menyala.",
      },
      "room-sound-dials": {
        title: "pilih suara yang kamu dengar",
        body: "Pengaturan sekarang punya kenop untuk tiap suara ruangan, dari mesin sampai bel toko. Matikan yang tidak ingin kamu dengar. Untuk yang lain, ruangan tetap sama.",
      },
      "home-mid-wash": {
        title: "pulang selagi mencuci",
        body: "Injak keset untuk pulang selagi cucianmu berjalan. Pakaian basah dibawa pulang di keranjang, yang kering mendarat di kasur.",
      },
      "bedroom-curtains": {
        title: "gorden dan lampu baru di rumah",
        body: "Klik gorden atau lampu di kamarmu. Kedua ruangan kini jadi lebih terang dan gelap mengikuti matahari, bulan, dan lampu.",
      },
      "settings-lite": {
        title: "pengaturan dan mode ringan",
        body: "Ikon roda gigi di toolbar membuka pengaturan. Pilih mode ringan di perangkat yang lambat untuk menghemat memori dan baterai.",
      },
      "door-bell": {
        title: "lonceng di pintu",
        body: "Lonceng kecil berbunyi saat kamu masuk, dan setiap kali ada orang lain datang.",
      },
      "whats-new-board": {
        title: "papan untuk kabar baru",
        body: "Papan ini menampilkan yang baru. Siang hari seperti kertas, malam hari menyala.",
      },
      "twelve-stations": {
        title: "dua belas saluran di tv",
        body: "Tujuh radio lofi baru mengisi tombol tuner, dari ruang belajar sampai luar angkasa.",
      },
      "page-drag": {
        title: "balik halaman dengan menyeret",
        body: "Seret di mana saja sepanjang tepi luar halaman untuk membaliknya.",
      },
      "window-light": {
        title: "sinar matahari dari jendela",
        body: "Cahaya siang sampai ke mesin dan lantai, dan menghangat saat matahari terbit dan terbenam.",
      },
      "shared-coffee": {
        title: "berbagi seteko kopi",
        body: "Hingga tujuh orang bisa menuang dari teko yang sama.",
      },
      "street-view": {
        title: "jalanan di luar",
        body: "Jendela menghadap ke jalan, diterangi matahari atau bulan.",
      },
      "tube-counter": {
        title: "siapa yang ada di sini",
        body: "Tabung di dinding belakang menghitung semua orang di laundromat, termasuk kamu.",
      },
      "coffee-counter": {
        title: "kopi di meja",
        body: "Seduh seteko, tuang secangkir, dan minum selagi cucianmu berputar.",
      },
      "shared-machines": {
        title: "orang lain mencuci",
        body: "Lihat mesin mana yang dipakai pengunjung lain. Cucian mereka tetap di tempat saat kamu memasukkan cucianmu.",
      },
      "eighteen-languages": {
        title: "buka dalam 18 bahasa",
        body: "Seluruh laundromat berbicara dalam bahasamu. Ganti lewat globe di pojok.",
      },
      "shared-notebook": {
        title: "buku catatan untuk orang asing",
        body: "Tinggalkan catatan untuk orang berikutnya. Buku yang penuh disimpan di rak.",
      },
      "lofi-tv": {
        title: "lofi di tv",
        body: "Nyalakan TV untuk radio lofi, dengan kenop tuner dan volume.",
      },
      opening: {
        title: "laundro.cafe dibuka",
        body: "Laundromat yang tenang di browsermu: cuci, keringkan, fokus 5 sampai 60 menit.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Penghitung tabung, ${o.count === 1 ? "cuma kamu di sini" : `${o.count} orang di sini`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "cuma kamu di sini" : `${o.count} orang di sini`,
    offLabel: "Penghitung tabung, mati",
    offTooltip: "mati",
  },
  airPurifier: {
    label: (o: { aqi: number }) => `Pembersih udara, menyala, AQI ${o.aqi}`,
    tooltip: "pembersih udara · membersihkan udara",
    offLabel: "Pembersih udara, mati",
    offTooltip: "mati",
  },
  weatherPanel: {
    conditions: {
      sunny: "cerah",
      clear: "cerah",
      cloudy: "berawan",
      fog: "kabut",
      rain: "hujan",
      snow: "salju",
      thunder: "badai petir",
    },
    outside: "di luar",
    high: "T",
    low: "R",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `Panel cuaca, ${o.temperature} ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "baik",
      moderate: "sedang",
      sensitive: "tidak sehat bagi yang sensitif",
      unhealthy: "tidak sehat",
      veryUnhealthy: "sangat tidak sehat",
      hazardous: "berbahaya",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `kualitas udara ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `udara ${o.band}`,
    offLabel: "Panel cuaca, belum ada data",
    offTooltip: "belum ada data",
  },
  tv: {
    stations: {
      "rainy-cafe": "kafe saat hujan",
      "piano-night": "malam piano",
      "late-wash": "cucian larut malam",
      "tape-hiss": "desis kaset",
      "city-at-3am": "kota jam 3 pagi",
      "study-hall": "ruang belajar",
      "smoky-jazz": "jazz berasap",
      fireplace: "perapian",
      "neon-tokyo": "tokyo neon",
      "string-quartet": "kuartet gesek",
      "porch-guitar": "gitar di teras",
      "deep-space": "luar angkasa",
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
    beKind: "Tolong saling bersikap baik, ya.",
    reportRule: (o: { count: number }) =>
      `Catatan yang dilaporkan ${o.count} orang akan dihapus selamanya.`,
    reportDialog: {
      title: "Laporkan catatan ini?",
      body: "Laporan membantu buku catatan tetap jadi tempat yang ramah.",
      reasonLabel: "alasan (opsional)",
      reasonPlaceholder: "apa yang salah dengan catatan ini?",
      cancel: "batal",
      confirm: "laporkan",
    },
    opening: "membuka buku catatan…",
    missing: (o: { number: number }) =>
      `tidak ada buku catatan No. ${o.number}`,
    full: (o: { number: number }) =>
      `buku catatan No. ${o.number} sudah penuh · hanya bisa dibaca`,
    someoneWritingInNotebook:
      "seseorang sedang menulis di buku catatan · tunggu giliranmu",
    someoneWriting: "seseorang sedang menulis · tunggu giliranmu",
    comeBackToWrite: "kembali dua menit lagi untuk menulis yang berikutnya",
    startsNext: (o: { number: number }) =>
      `catatan ini membuka buku catatan No. ${o.number}`,
    writePrompt: "tulis catatan untuk orang berikutnya",
    writePromptBeforeKeys: "tulis catatan untuk orang berikutnya · ",
    writePromptAfterKeys: " untuk menyimpannya",
    textareaLabel: "Tulis catatan di buku catatan",
    notifyWhenFree: "kabari aku saat giliranku",
    notifyPending: "nanti kami kabari",
    saveNote: "simpan catatanku",
    saveDoodle: "simpan gambarku",
    penModeLabel: "Pena",
    penModes: { write: "tulis", draw: "gambar" },
    drawPrompt: "gambar sesuatu untuk orang berikutnya",
    doodleMoved: (o: { page: number }) =>
      `halaman ini sudah tidak muat · menggambar di hlm. ${o.page}`,
    doodleBookFull:
      "tidak ada ruang untuk gambar di buku catatan ini · tulis catatan saja",
    inkFull: "tinta sudah tidak muat · simpan atau urungkan",
    someoneDrawingInNotebook:
      "seseorang sedang menggambar di buku catatan · tunggu giliranmu",
    padLabel: "Ruang gambar di buku catatan",
    drawingNow: "menggambar…",
    someoneDrawingNow: "seseorang sedang menggambar…",
    undo: "urungkan",
    clear: "hapus",
    savingNote: "menyimpan…",
    close: "tutup",
    freeNotificationTitle: "buku catatan sudah bisa dipakai",
    freeNotificationBody: "giliranmu menulis",
    leaveFailures: {
      offline: "buku catatan sedang offline · catatanmu tetap di sini",
      rate_limited: "satu catatan tiap dua menit · coba lagi sebentar lagi",
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
    basketWet: "pakaiannya masih basah · keringkan di laundromat",
    lampOffTooltip: "matikan lampu",
    lampOnTooltip: "nyalakan lampu",
    lampOffLabel: "Matikan lampu",
    lampOnLabel: "Nyalakan lampu",
    curtainCloseTooltip: "tutup gorden",
    curtainOpenTooltip: "buka gorden",
    curtainCloseLabel: "Tutup gorden",
    curtainOpenLabel: "Buka gorden",
    bedTooltip: "pergi tidur",
    bedLabel: "Pergi tidur",
    goodNight: "Selamat tidur",
    notSleepy: "nggak mau tidur lagi",
    doorReadyTooltip: "bawa ke laundry",
    doorWaitingTooltip: "ambil cucianmu dulu",
    doorAwayTooltip: "kembali ke laundromat · cucianmu ada di mesin",
    doorAwayLabel: "Kembali ke laundromat, cucianmu masih di mesin",
    doorReadyLabel: "Bawa keranjang ke laundry",
    doorWaitingLabel: "Pintu ke laundry, ambil cucianmu dulu",
    justListen: "dengarkan saja →",
  },
  tip: {
    machineLabel: "Mesin koin, beri tip",
    machineTooltip: "beri tip",
    machineScreenIdle: "TIP",
    machineScreenThanks: "MAKASIH",
    jarLoadingLabel: "Toples tip",
    jarLoadingTooltip: "toples tip",
    jarLabel: (o: { count: number }) =>
      `Toples tip, ${o.count} token di dalamnya`,
    jarTooltip: (o: { count: number }) => `${o.count} token di dalam toples`,
    dialogLabel: "Mesin koin",
    close: "Tutup",
    screen: {
      pick: "masukkan koin",
      custom: "ketik jumlahnya",
      checkout: (o: { amount: string }) => `tip ${o.amount}`,
      waiting: "menunggu pembayaran",
      notPaid: "pembayaran gagal",
      dropping: "mengeluarkan token",
      token: "terima kasih",
      restore: "ketik kode token",
      checking: "membaca kode",
      notFound: "kode tidak ditemukan",
      misread: "cek kodenya",
      offline: "coba lagi nanti",
    },
    note: "terima kasih!",
    pitch:
      "Setiap tip mencetak satu token. Masukkan ke mesin cuci atau pengering untuk pesta cuci atau pesta pengeringan yang bisa dilihat semua orang di sini. Koin lebih besar, lebih banyak pemakaian.",
    coinLabel: (o: { amount: string; uses: number }) =>
      `Tip ${o.amount}, token untuk ${o.uses} kali pakai`,
    coinUses: (o: { count: number }) => `${o.count} kali pakai`,
    usesLeft: (o: { left: number; total: number }) =>
      `sisa ${o.left} dari ${o.total}`,
    leftNotice: (o: { left: number }) =>
      o.left === 0
        ? "itu pemakaian terakhirnya"
        : `token ini masih bisa dipakai ${o.left} kali`,
    other: "jumlah lain",
    otherLabel: "Jumlah lain",
    insert: "masukkan",
    secure: "pembayaran aman lewat stripe",
    haveCode: "punya kode token?",
    change: "ganti",
    testMode: "mode uji · tidak ada uang yang berpindah",
    orPayWith: "atau",
    pay: (o: { amount: string }) => `Bayar ${o.amount}`,
    processing: "Memproses",
    unavailable: "Mesin koin sedang istirahat. Coba lagi sebentar lagi.",
    waitingForBank: "Menunggu bankmu",
    waitingNote: "Kamu bisa menutup ini. Tokenmu akan masuk ke sakumu.",
    poweredBy: "Powered by stripe",
    receiptKind: "token tip",
    receiptNumber: (o: { number: string }) => `no. ${o.number}`,
    receiptCode: "kode token",
    receiptNote: "terima kasih atas dukunganmu",
    keepCode: "Simpan kodenya untuk membawa token ini ke perangkat lain.",
    copyLink: "salin link",
    copied: "disalin",
    save: "simpan",
    done: "Selesai",
    restore: "pulihkan",
    back: "kembali",
    pocketLabel: (o: { number: number }) => `token no. ${o.number}`,
    pocketHeading: "tokenmu",
    dropInMachine: "masukkan ke mesin",
    dropInMachineHint:
      "Masukkan ke mesin cuci atau pengering untuk pesta cuci atau pesta pengeringan yang bisa dilihat semua orang di sini.",
    usedOn: (o: { date: string }) => `dipakai di mesin · ${o.date}`,
    holdHint: "ketuk mesin cuci atau pengering",
    viewCoin: (o: { number: number }) => `Lihat token no. ${o.number}`,
    turnCoin: "Balik koinnya",
    coinNumberCaption: "no.",
    coinBackNote: "terima kasih",
    coinRim: "terima kasih",
    trayHeading: "toples tip",
    traySummary: (o: { count: number; isShining: boolean }) =>
      `${o.count} token di dalam toples${o.isShining ? " · punyamu berkilau" : ""}`,
    trayHint: "ketuk tokenmu untuk memakainya",
    trayPitch:
      "Beri tip di mesin koin untuk mendapat token. Masukkan ke mesin cuci atau pengering untuk pesta cuci yang bisa dilihat semua orang di sini.",
    trayLeaveTip: "beri tip",
    receiptDescription: (o: { code: string; link: string }) =>
      `Terima kasih atas tipmu untuk laundro.cafe! Kode tokenmu: ${o.code}; kalau tokenmu hilang, pulihkan di perangkat mana pun lewat ${o.link}.`,
    copyCode: "Salin kode",
    codeCopied: "Kode disalin",
    trayCoinLabel: (o: { number: number; date: string; isOwn: boolean }) =>
      `Koin ${o.number}, ${o.date}${o.isOwn ? ", punyamu, lihat lebih dekat" : ""}`,
  },
} satisfies LaundromatCopy;
