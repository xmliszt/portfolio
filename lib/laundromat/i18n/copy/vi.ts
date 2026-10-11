import type { GarmentKind } from "@/lib/laundromat/first-visit/bedroom-config";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { LeaveEntryFailureReason } from "@/lib/laundromat/notebook/describe-leave-failure";
import type { MachineKind } from "@/lib/laundromat/scene-config";
import type { TvStationId } from "@/lib/laundromat/tv/tv-state";

type Machine = { kind: MachineKind; number: number };

export const vi = {
  locale: "vi",
  languageName: "Tiếng Việt",
  site: {
    name: "laundro.cafe",
    title: "laundro.cafe: hẹn giờ tập trung ấm cúng trong tiệm giặt, cùng lofi",
    description:
      "Giặt đồ như một bộ hẹn giờ tập trung trong một tiệm giặt yên tĩnh. Giặt, sấy, tập trung, lofi, cà phê, cuốn sổ cho người lạ, hoặc chỉ ngồi thả hồn. Miễn phí, không cần đăng ký.",
    intro:
      "Một tiệm giặt yên tĩnh trong trình duyệt của bạn. Chạy máy giặt hoặc máy sấy từ 5 đến 60 phút làm bộ hẹn giờ tập trung và nhận thông báo khi xong, mở các kênh lo-fi trên TV, pha một tách cà phê và viết tay một lời nhắn trong cuốn sổ chung. Sổ viết kín sẽ được xếp lên kệ.",
    keywords: [
      "tiệm giặt",
      "hẹn giờ tập trung",
      "pomodoro",
      "lofi",
      "nhạc làm việc",
      "học cùng",
      "ấm cúng",
      "sổ chung",
    ],
    inspiredBy: "lấy cảm hứng từ",
    openGraphLocale: "vi_VN",
  },
  toolbar: {
    soundOn: "đang bật tiếng",
    soundOff: "đang tắt tiếng",
    share: "chia sẻ",
    linkCopied: "đã sao chép liên kết",
    shareText:
      "Một tiệm giặt yên tĩnh trong trình duyệt của bạn. Bỏ đồ vào máy, để đồng hồ chạy, và đọc những lời nhắn người khác để lại.",
    language: "Ngôn ngữ",
  },
  tabDone: "xong",
  readoutDone: "xong",
  matWelcome: "chào mừng",
  machine: {
    name: (machine: Machine) =>
      `${machine.kind === "washer" ? "Máy giặt" : "Máy sấy"} ${machine.number}`,
    freeLabel: (o: { name: string }) => `${o.name}, đang trống`,
    freeTooltip: (o: { name: string }) => `${o.name} · trống`,
    loadedLabel: (o: { name: string }) => `${o.name}, đã có đồ, sẵn sàng chạy`,
    loadedTooltip: (o: { name: string }) => `${o.name} · đã có đồ`,
    runningLabel: (o: { name: string; kind: MachineKind; remaining: string }) =>
      `${o.name}, đang ${o.kind === "washer" ? "giặt" : "sấy"}, còn ${o.remaining}`,
    runningTooltip: (o: { kind: MachineKind; time: string }) =>
      `đang ${o.kind === "washer" ? "giặt" : "sấy"} · xong lúc ${o.time}`,
    doneLabel: (o: { name: string }) => `${o.name}, xong rồi, lấy đồ ra nhé`,
    doneTooltip: (o: { name: string }) => `${o.name} · xong`,
    othersRunningLabel: (o: {
      name: string;
      kind: MachineKind;
      remaining: string;
    }) =>
      `${o.name}, đang ${o.kind === "washer" ? "giặt" : "sấy"} đồ của người khác, còn ${o.remaining}`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `người khác đang ${o.kind === "washer" ? "giặt" : "sấy"} · xong lúc ${o.time}`,
    othersLoadedLabel: (o: { name: string }) =>
      `${o.name}, có đồ giặt của người khác bên trong`,
    othersLoadedTooltip: (o: { name: string }) =>
      `${o.name} · đồ của người khác, chưa chạy`,
    othersDoneLabel: (o: { name: string }) =>
      `${o.name}, đồ của người khác đã xong`,
    othersDoneTooltip: (o: { name: string }) =>
      `${o.name} · của người khác, xong`,
    doneNotificationTitle: (o: { name: string }) => `${o.name} · xong`,
    doneNotificationBody: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "lấy đồ ra và chọn một máy sấy"
        : "đồ của bạn đã khô",
  },
  machineControl: {
    controlInUseLabel: (o: {
      name: string;
      control: "dial" | "start" | "door";
    }) =>
      `${o.control === "dial" ? "Núm xoay" : o.control === "start" ? "Nút bắt đầu" : "Cửa"} ${o.name}, người khác đang dùng`,
    othersRunningTooltip: (o: { kind: MachineKind; time: string }) =>
      `lượt ${o.kind === "washer" ? "giặt" : "sấy"} của người khác · xong lúc ${o.time}`,
    othersLoadedTooltip: "đồ giặt của người khác · chưa chạy",
    othersDoneTooltip: "đồ của người khác · đang chờ chủ",
    doneAt: (o: { time: string }) => `xong lúc ${o.time}`,
    dialLabel: (o: { name: string; minutes: number }) =>
      `Chu trình ${o.name}, ${o.minutes} phút`,
    dialTooltip: (o: { minutes: number; nextMinutes: number }) =>
      `xoay · ${o.minutes} phút → ${o.nextMinutes} phút`,
    startLabel: (o: {
      name: string;
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `Nút bắt đầu ${o.name}, ${o.kind === "washer" ? "giặt" : "sấy"} ${o.minutes} phút${o.canNotify ? ", báo cho bạn khi xong" : ""}`,
    startTooltip: (o: {
      kind: MachineKind;
      minutes: number;
      canNotify: boolean;
    }) =>
      `bắt đầu · ${o.kind === "washer" ? "giặt" : "sấy"} ${o.minutes} phút${o.canNotify ? " · sẽ báo bạn" : ""}`,
    remindLabel: (o: { name: string; kind: MachineKind }) =>
      `${o.name}, nhắc mình khi ${o.kind === "washer" ? "giặt" : "sấy"} xong`,
    remindTooltip: (o: { doneAt: string }) => `nhắc mình · ${o.doneAt}`,
    runningStartLabel: (o: {
      name: string;
      reminderOn: boolean;
      doneAt: string;
    }) =>
      `Nút bắt đầu ${o.name}, ${o.reminderOn ? "đã bật nhắc, " : ""}${o.doneAt}`,
    reminderOnTooltip: (o: { doneAt: string }) => `đã bật nhắc · ${o.doneAt}`,
    idleStartLabel: (o: { name: string }) => `Nút bắt đầu ${o.name}`,
    loadFirstTooltip: "bỏ đồ vào trước đã",
    runningDoorTooltip: (o: { kind: MachineKind; doneAt: string }) =>
      `đang ${o.kind === "washer" ? "giặt" : "sấy"} · ${o.doneAt}`,
    doneDoorTooltip: "mở cửa · lấy đồ ra",
    loadedDoorTooltip: "mở cửa · lấy đồ ra lại",
    loadableDoorTooltip: "bỏ đồ vào",
    doorLabel: (o: { name: string }) => `Cửa ${o.name}`,
    doorLabelWithHint: (o: { name: string; hint: string }) =>
      `Cửa ${o.name}, ${o.hint}`,
  },
  entranceMat: {
    readyLabel: (o: { laundry: "wet" | "folded" }) =>
      `Thảm chào mừng, mang đồ ${o.laundry === "folded" ? "đã khô" : "đã giặt"} về nhà`,
    readyTooltip: "về nhà · mang đồ theo",
    waitingLabel: "Thảm chào mừng, đường về nhà khi đồ đã xong",
    waitingTooltip: "đường về nhà · giặt xong đồ đã",
  },
  coffee: {
    machineLabel: "Máy pha cà phê",
    brewingMachineLabel: "Máy pha cà phê, đang pha",
    brewingTooltip: "đang pha…",
    idleSwitchLabel: "Công tắc máy pha cà phê, pha một tách",
    idleSwitchTooltip: "pha một tách",
    brewingSwitchLabel: "Công tắc máy pha cà phê, đang pha",
    readyMachineLabel: "Máy pha cà phê, bình còn cà phê",
    readyMachineTooltip: "cà phê xong rồi",
    topUpSwitchLabel: "Công tắc máy pha cà phê, pha thêm cho đầy bình",
    topUpSwitchTooltip: "pha thêm cho đầy",
    fullSwitchLabel: "Công tắc máy pha cà phê, bình đã đầy",
    fullSwitchTooltip: "bình đầy · rót một tách trước đã",
    emptyFlaskLabel: "Bình cà phê, trống",
    emptyFlaskTooltip: "bình đã hết",
    brewingFlaskLabel: "Bình cà phê, đang pha",
    pourLabel: "Bình cà phê, rót một tách",
    pourTooltip: "rót một tách",
    cupFullFlaskLabel: "Bình cà phê, uống hết tách trước đã",
    cupFullFlaskTooltip: "uống hết tách trước đã",
    fullCupLabel: "Tách cà phê, uống",
    fullCupTooltip: "uống",
    emptyCupLabel: "Tách cà phê, trống",
    emptyCupTooltip: "tách trống",
  },
  plant: {
    label: "Chậu cây, chạm vào cỏ",
    tooltip: "chạm vào cỏ",
  },
  tv: {
    stations: {
      "rainy-cafe": "quán cà phê ngày mưa",
      "piano-night": "đêm piano",
      "late-wash": "mẻ giặt khuya",
      "tape-hiss": "tiếng rè băng",
      "city-at-3am": "phố lúc 3 giờ sáng",
    } satisfies { [id in TvStationId]: string },
    station: (o: { channel: string; name: string }) =>
      `kênh ${o.channel} · ${o.name}`,
    offLabel: "TV, tắt",
    offTooltip: "tv · tắt",
    onLabel: (o: { station: string }) => `TV, đang bật, ${o.station}`,
    screenOnLabel: (o: { station: string }) =>
      `Màn hình TV, ${o.station}, xem trên YouTube`,
    screenOnTooltip: "xem trên YouTube ↗",
    screenOffLabel: "Màn hình TV, đang tắt, bật lên",
    turnOn: "bật",
    tunerLabel: (o: { station: string }) => `Kênh TV, ${o.station}`,
    tunerTooltip: (o: { nextName: string }) => `kênh tiếp theo · ${o.nextName}`,
    volumeLabel: (o: { percent: number }) => `Âm lượng TV, ${o.percent}%`,
    volumeTooltip: (o: { percent: number }) => `âm lượng · ${o.percent}%`,
    powerOnLabel: "Nguồn TV, đang bật, tắt đi",
    turnOff: "tắt",
    powerOffLabel: "Nguồn TV, đang tắt, bật lên",
    noSignal: "mất sóng",
  },
  shelf: {
    loadingLabel: "Kệ, đang tìm những cuốn sổ đã viết kín",
    loadingTooltip: "đang xem kệ…",
    offlineLabel: "Kệ, hiện đang ngoại tuyến",
    offlineTooltip: "kệ hiện đang ngoại tuyến",
    emptyLabel: "Kệ, chưa có cuốn sổ nào viết kín",
    emptyTooltip: "chưa có cuốn sổ nào viết kín",
    readyLabel: "Xem kệ sổ đã viết kín",
    bookCount: (o: { count: number }) => `${o.count} cuốn sổ đã viết kín`,
    bookLabel: (o: { number: number; span: string; entries: string }) =>
      `Mở sổ số ${o.number}, ${o.span}, ${o.entries}`,
    entryCount: (o: { count: number }) => `${o.count} lời nhắn`,
  },
  notebook: {
    objectLabel: "Mở cuốn sổ",
    objectTooltip: "lời nhắn từ người lạ",
    number: (o: { number: number }) => `Số ${o.number}`,
    dialogLabel: (o: { number: number }) => `Sổ số ${o.number}`,
    daySpan: (o: { from: string; to: string }) => `${o.from} – ${o.to}`,
    since: (o: { day: string }) => `từ ${o.day}`,
    insideCover: "bìa trong",
    insideCoverAndPage: (o: { page: number }) => `bìa trong · tr. ${o.page}`,
    page: (o: { page: number }) => `tr. ${o.page}`,
    pages: (o: { left: number; right: number }) => `tr. ${o.left}–${o.right}`,
    pageButtonLabel: (o: { page: number }) =>
      `Trang ${o.page}, chuyển sang trang khác`,
    previousPage: "Trang trước",
    nextPage: "Trang sau",
    scrubberLabel: "Trang",
    goToPage: "đến trang",
    pageInputLabel: (o: { pageCount: number }) =>
      `Số trang, từ 1 đến ${o.pageCount}`,
    report: "báo cáo",
    reported: "đã báo cáo",
    opening: "đang mở sổ…",
    missing: (o: { number: number }) => `không có sổ số ${o.number}`,
    full: (o: { number: number }) => `sổ số ${o.number} đã kín · chỉ đọc`,
    someoneWritingInNotebook: "có người đang viết vào sổ · chờ đến lượt bạn",
    someoneWriting: "có người đang viết · chờ đến lượt bạn",
    startsNext: (o: { number: number }) =>
      `lời nhắn này mở đầu sổ số ${o.number}`,
    writePromptBeforeKeys: "viết một lời nhắn cho người đến sau · ",
    writePromptAfterKeys: " để lưu",
    textareaLabel: "Viết lời nhắn vào sổ",
    notifyWhenFree: "báo mình khi đến lượt",
    notifyPending: "sẽ báo bạn",
    saveNote: "lưu lời nhắn",
    savingNote: "đang lưu…",
    close: "đóng",
    freeNotificationTitle: "cuốn sổ đã rảnh",
    freeNotificationBody: "đến lượt bạn viết",
    leaveFailures: {
      offline: "sổ hiện đang ngoại tuyến · lời nhắn của bạn vẫn ở đây",
      rate_limited: "mỗi hai phút một lời nhắn · lát nữa thử lại nhé",
      daily_limit_reached: "hôm nay vậy là đủ rồi · mai quay lại nhé",
      contains_link: "không được để liên kết trong sổ",
      too_long: "dài quá so với cuốn sổ · rút gọn một chút",
      sign_off_too_long: "phần ký tên dài quá",
      empty_body: "viết gì đó trước đã",
      unknown: "có lỗi xảy ra · thử lại nhé",
    } satisfies { [reason in LeaveEntryFailureReason]: string },
  },
  firstVisit: {
    garments: {
      tee: "áo phông",
      jeans: "quần jean",
      sweater: "áo len",
      towel: "khăn tắm",
      socks: "tất",
      shirt: "áo sơ mi",
    } satisfies { [kind in GarmentKind]: string },
    garmentLabel: (o: { garment: string }) => `Bỏ ${o.garment} vào giỏ`,
    basketEmpty: "ném quần áo dưới sàn vào đây",
    basketPartial: (o: { count: number; total: number }) =>
      `${o.count}/${o.total} đã vào giỏ · bỏ thêm, hoặc ra cửa`,
    basketFull: "đủ cả rồi · ra cửa thôi",
    lampOffTooltip: "tắt đèn",
    lampOnTooltip: "bật đèn",
    lampOffLabel: "Tắt đèn",
    lampOnLabel: "Bật đèn",
    doorReadyTooltip: "mang ra tiệm giặt",
    doorWaitingTooltip: "nhặt đồ trước đã",
    doorReadyLabel: "Mang giỏ ra tiệm giặt",
    doorWaitingLabel: "Cửa ra tiệm giặt, nhặt đồ trước đã",
    justListen: "chỉ nghe thôi →",
  },
} satisfies LaundromatCopy;
