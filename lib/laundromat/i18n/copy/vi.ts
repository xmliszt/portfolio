import type { RoomSoundGroup } from "@/lib/laundromat/audio/room-sound-groups";
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
    shareImage: {
      headline: "một tiệm giặt yên tĩnh trong trình duyệt của bạn.",
      subline:
        "giặt, sấy, tập trung, lofi, cà phê, cuốn sổ cho người lạ, hoặc chỉ ngồi thả hồn",
    },
  },
  toolbar: {
    soundOn: "đang bật tiếng",
    soundOff: "đang tắt tiếng",
    share: "chia sẻ",
    linkCopied: "đã sao chép liên kết",
    shareText:
      "Một tiệm giặt yên tĩnh trong trình duyệt của bạn. Bỏ đồ vào máy, để đồng hồ chạy, và đọc những lời nhắn người khác để lại.",
    language: "Ngôn ngữ",
    settings: "cài đặt",
    builtBy: {
      beforeClaude: "được làm với ❤️ bởi Li Yuxuan & ",
      afterClaude: "",
    },
    updateAvailable: "tải lại để vào tiệm giặt đã cập nhật",
  },
  settings: {
    heading: "cài đặt",
    rendering: "hiển thị",
    renderingHint:
      "bản nhẹ bỏ ánh sáng dịu, cây đung đưa và hiệu ứng phóng to vào sổ tay và bảng tin. hữu ích trên máy chậm hoặc khi bộ nhớ sắp đầy.",
    qualityAuto: "tự động",
    qualityAutoHint: (o: { quality: string }) =>
      `dùng ${o.quality} trên máy này`,
    qualityFull: "đầy đủ",
    qualityFullHint: "mọi ánh sáng và chuyển động",
    qualityLite: "nhẹ",
    qualityLiteHint: "nhẹ hơn cho bộ nhớ và pin",
    close: "đóng",
    closeHint: "esc để đóng",
    temperature: "nhiệt độ",
    weather: "thời tiết",
    placeLabel: "vị trí thời tiết",
    placePlaceholder: "tìm thành phố",
    placeLive: "trực tiếp",
    placeNearYou: "gần bạn",
    placeSearching: "đang tìm…",
    placeNoResults: "không tìm thấy nơi nào",
    conditionLabel: "bầu trời",
    conditionLive: "thời tiết trực tiếp",
    weatherHint:
      "thời tiết trực tiếp được ước tính từ địa chỉ IP của bạn nên đôi khi có thể sai. chọn một thành phố hoặc bầu trời để tự đặt. đơn vị nhiệt độ theo nơi đó cho đến khi bạn tự chọn.",
    roomSounds: "âm thanh trong tiệm",
    roomSoundsHint:
      "âm thanh từ tiệm và những người trong đó. tắt hay vặn nhỏ một âm chỉ thay đổi cho riêng bạn.",
    roomSoundsAllOn: "bật hết",
    roomSoundsAllOff: "tắt hết",
    roomSoundOn: "bật",
    roomSoundOff: "tắt",
    roomSoundVolume: (o: { sound: string }) => `âm lượng ${o.sound}`,
    roomMix: {
      play: "phát bản phối của tiệm",
      playing: "đang phát bản phối",
      playLabel: "phát bản phối của tiệm theo mức của bạn",
      stopLabel: "dừng bản phối của tiệm",
    },
    ticket: {
      heading: "phiếu giặt",
      hint: "in một phiếu để giữ cài đặt của bạn thành một tệp nhỏ và sao chép liên kết tới chúng. mở liên kết, hoặc nạp tệp vào đây, trên bất kỳ máy nào để lấy lại.",
      print: "in",
      insert: "nạp",
      printLabel:
        "in phiếu giặt, lưu cài đặt của bạn vào một tệp và sao chép liên kết tới chúng",
      insertLabel: "nạp phiếu giặt, tải cài đặt của bạn từ một tệp",
      ready: "sẵn sàng",
      printing: "đang in…",
      saved: "đã lưu",
      linkCopied: "đã sao chép",
      linkLabel: "liên kết tới phiếu giặt của bạn",
      copyLink: "sao chép",
      copied: "đã sao chép",
      linkHint:
        "mở liên kết này trên máy khác để mang cài đặt của bạn sang đó.",
      reading: "đang đọc…",
      loaded: "đã tải",
      unreadable: "phiếu lỗi",
      title: "phiếu giặt",
      number: (o: { number: string }) => `số ${o.number}`,
      tv: (o: { percent: number }) => `tv ${o.percent}%`,
    },
    roomSound: {
      machines: { label: "máy móc", hint: "máy giặt và máy sấy đang quay" },
      "shop-bell": { label: "chuông cửa", hint: "reo khi có người bước vào" },
      unloading: {
        label: "lấy đồ",
        hint: "tiếng chốt cửa khi ai đó lấy đồ giặt",
      },
      coffee: {
        label: "cà phê",
        hint: "tiếng sôi lục bục khi pha và tiếng bíp khi xong",
      },
      tv: { label: "nhiễu tv", hint: "tiếng rè của tv không có tín hiệu" },
      lamp: { label: "đèn", hint: "đèn chập chờn khi bật và kêu tách khi tắt" },
      weather: { label: "thời tiết", hint: "mưa và sấm ngoài cửa sổ" },
    } satisfies { [group in RoomSoundGroup]: { label: string; hint: string } },
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
    needsWashingTooltip: "giặt trước đã",
    alreadyWashedTooltip: "đã giặt rồi · giờ sấy",
    alreadyDryTooltip: "đã khô rồi · mang về nhà",
    elsewhereLoadedTooltip: (o: { name: string }) =>
      `đồ của bạn đang chờ ở ${o.name}`,
    elsewhereRunningTooltip: (o: { kind: MachineKind }) =>
      o.kind === "washer"
        ? "quần áo của bạn vẫn đang giặt"
        : "quần áo của bạn vẫn đang sấy",
    elsewhereDoneTooltip: (o: { name: string }) =>
      `đồ của bạn xong rồi · ở ${o.name}`,
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
    readyTooltip: "về nhà · mang đồ sạch theo",
    awayLabel: "Thảm chùi chân, về nhà và để đồ lại trong máy",
    awayTooltip: "về nhà · đồ vẫn ở trong máy",
    wetLabel: "Thảm chùi chân, về nhà với đồ còn ướt",
    wetTooltip: "về nhà · quần áo vẫn còn ướt",
    dirtyLabel: "Thảm chùi chân, cho quần áo vào máy giặt trước khi về nhà",
    dirtyTooltip: "giặt trước đã · cho quần áo vào máy giặt",
  },
  laundryBasket: {
    labels: {
      empty: "Giỏ đồ giặt, trống",
      dirty: "Giỏ đồ giặt, quần áo cần giặt",
      wet: "Giỏ đồ giặt, quần áo ướt cần sấy",
      folded: "Giỏ đồ giặt, quần áo sạch và khô",
    },
    tooltips: {
      empty: "giỏ · trống",
      dirty: "đồ bẩn · cho vào máy giặt",
      wet: "đồ ướt · cho vào máy sấy",
      folded: "sạch và khô · sẵn sàng về nhà",
    },
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
    othersBrewingMachineLabel: "Máy pha cà phê, người khác đang pha",
    othersBrewingSwitchLabel: "Công tắc máy pha cà phê, người khác đang pha",
    othersBrewingFlaskLabel: "Bình cà phê, người khác đang pha",
    othersBrewingTooltip: (o: { time: string }) =>
      `người khác đang pha · xong lúc ${o.time}`,
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
  board: {
    label: "Bảng tin, có gì mới ở tiệm giặt",
    tooltip: "có gì mới",
    eyebrow: "bảng tin",
    heading: "có gì mới",
    subtitle: "Những thay đổi nhỏ ở tiệm giặt, mới nhất ở trên.",
    updated: (o: { date: string }) => `cập nhật ${o.date}`,
    footer: "luôn mở cửa, 24/7",
    close: "đóng",
    closeHint: "esc để đóng",
    tags: {
      opening: "khai trương",
      tv: "tv",
      notebook: "sổ tay",
      languages: "ngôn ngữ",
      room: "tiệm",
      coffee: "cà phê",
      window: "cửa sổ",
      light: "ánh sáng",
      board: "bảng tin",
    },
    updates: {
      "notebook-doodles": {
        title: "vẽ vào sổ",
        body: "Chuyển bút của sổ từ viết sang vẽ và để lại một hình vẽ nhỏ cho người đến sau. Bất kỳ ai trong tiệm giặt đang mở sổ đều thấy hình vẽ tự hiện dần trên trang.",
      },
      "weather-anywhere": {
        title: "chọn thời tiết bên ngoài",
        body: "Trong cài đặt, chọn một thành phố để xem thời tiết ở đó qua cửa sổ và trên bảng, hoặc tự chọn bầu trời. Mặc định vẫn là thời tiết trực tiếp.",
      },
      "room-sound-mixer": {
        title: "tự phối âm thanh trong tiệm",
        body: "Mỗi âm thanh trong tiệm giờ có thanh trượt riêng trong phần cài đặt, để tiếng mưa to hơn và tiếng máy nhỏ hơn. Phát bản phối của tiệm để nghe tất cả cùng lúc, và in một phiếu giặt để giữ cài đặt của bạn hoặc mang sang máy khác.",
      },
      "weather-panel": {
        title: "thời tiết, trong và ngoài",
        body: "Một bảng phía trên cửa sổ cho biết thời tiết nơi bạn ở, kèm nhiệt độ cao nhất, thấp nhất hôm nay và chất lượng không khí. Cửa sổ cũng cho thấy điều đó, mưa, tuyết, sương mù hay giông bão, kèm âm thanh. Thành phố của bạn được đoán đại khái từ kết nối. Khi không khí trở nên kém, máy lọc không khí ở góc sẽ bật lên.",
      },
      "room-sound-dials": {
        title: "chọn âm thanh bạn nghe",
        body: "Phần cài đặt giờ có một núm vặn cho từng âm thanh trong tiệm, từ máy giặt đến chuông cửa. Tắt những âm bạn không muốn nghe. Với người khác, tiệm vẫn như cũ.",
      },
      "home-mid-wash": {
        title: "về nhà khi máy đang chạy",
        body: "Bước lên thảm chùi chân để về nhà trong lúc máy đang giặt. Đồ ướt về nhà trong giỏ, đồ khô nằm trên giường.",
      },
      "bedroom-curtains": {
        title: "rèm và đèn mới ở nhà",
        body: "Bấm vào rèm hoặc đèn trong phòng. Giờ cả hai căn phòng sáng lên và tối đi theo mặt trời, mặt trăng và đèn.",
      },
      "settings-lite": {
        title: "cài đặt và chế độ nhẹ",
        body: "Bánh răng trên thanh công cụ mở phần cài đặt. Chọn chế độ nhẹ trên máy chậm để tiết kiệm bộ nhớ và pin.",
      },
      "door-bell": {
        title: "chuông trên cửa",
        body: "Một chiếc chuông nhỏ reo khi bạn bước vào, và mỗi khi có người khác đến.",
      },
      "whats-new-board": {
        title: "bảng tin cho điều mới",
        body: "Tấm bảng này cho biết có gì mới. Ban ngày lặng như giấy, ban đêm sáng đèn.",
      },
      "twelve-stations": {
        title: "mười hai kênh trên tv",
        body: "Bảy đài lofi mới lấp đầy nút dò kênh, từ phòng tự học đến vũ trụ sâu thẳm.",
      },
      "page-drag": {
        title: "kéo để lật trang",
        body: "Kéo ở bất kỳ đâu dọc mép ngoài của trang để lật.",
      },
      "window-light": {
        title: "nắng qua khung cửa sổ",
        body: "Ánh nắng chạm tới máy giặt và sàn nhà, và ấm lên lúc bình minh và hoàng hôn.",
      },
      "shared-coffee": {
        title: "chung một ấm cà phê",
        body: "Tối đa bảy người có thể rót từ cùng một bình.",
      },
      "street-view": {
        title: "con phố bên ngoài",
        body: "Cửa sổ nhìn ra phố, dưới nắng hay ánh trăng.",
      },
      "tube-counter": {
        title: "ai đang ở đây",
        body: "Các ống đèn trên tường sau đếm mọi người trong tiệm, kể cả bạn.",
      },
      "coffee-counter": {
        title: "cà phê trên quầy",
        body: "Pha một ấm, rót một tách và nhâm nhi khi đồ đang quay.",
      },
      "shared-machines": {
        title: "người khác cũng đang giặt",
        body: "Xem người khác đang dùng máy nào. Đồ của họ vẫn ở nguyên chỗ khi bạn cho đồ vào.",
      },
      "eighteen-languages": {
        title: "mở cửa bằng 18 ngôn ngữ",
        body: "Cả tiệm giặt nói ngôn ngữ của bạn. Đổi từ quả địa cầu ở góc.",
      },
      "shared-notebook": {
        title: "sổ tay cho người lạ",
        body: "Để lại lời nhắn cho người đến sau. Sổ đầy sẽ lên kệ.",
      },
      "lofi-tv": {
        title: "lofi trên tv",
        body: "Bật tv để nghe radio lofi, có núm dò kênh và âm lượng.",
      },
      opening: {
        title: "laundro.cafe khai trương",
        body: "Một tiệm giặt yên tĩnh trong trình duyệt: giặt, sấy, tập trung 5 đến 60 phút.",
      },
    },
  },
  tubeDisplay: {
    label: (o: { count: number }) =>
      `Bộ đếm đèn ống, ${o.count === 1 ? "chỉ có bạn ở đây" : `${o.count} người ở đây`}`,
    tooltip: (o: { count: number }) =>
      o.count === 1 ? "chỉ có bạn ở đây" : `${o.count} người ở đây`,
    offLabel: "Bộ đếm đèn ống, tắt",
    offTooltip: "tắt",
  },
  airPurifier: {
    label: (o: { aqi: number }) => `Máy lọc không khí, đang chạy, AQI ${o.aqi}`,
    tooltip: "máy lọc không khí · đang lọc",
    offLabel: "Máy lọc không khí, tắt",
    offTooltip: "tắt",
  },
  weatherPanel: {
    conditions: {
      sunny: "nắng",
      clear: "trời quang",
      cloudy: "nhiều mây",
      fog: "sương mù",
      rain: "mưa",
      snow: "tuyết",
      thunder: "giông",
    },
    outside: "bên ngoài",
    high: "C",
    low: "T",
    label: (o: { temperature: string; condition: string; place: string }) =>
      `Bảng thời tiết, ${o.temperature} ${o.condition}, ${o.place}`,
    tooltip: (o: { temperature: string; condition: string; place: string }) =>
      `${o.temperature} · ${o.condition} · ${o.place}`,
    aqi: "AQI",
    aqiBands: {
      good: "tốt",
      moderate: "trung bình",
      sensitive: "kém với người nhạy cảm",
      unhealthy: "kém",
      veryUnhealthy: "rất kém",
      hazardous: "nguy hại",
    },
    airLabel: (o: { aqi: number; band: string }) =>
      `chất lượng không khí ${o.band}, AQI ${o.aqi}`,
    airTooltip: (o: { aqi: number; band: string }) => `không khí ${o.band}`,
    offLabel: "Bảng thời tiết, chưa có số đo",
    offTooltip: "chưa có số đo",
  },
  tv: {
    stations: {
      "rainy-cafe": "quán cà phê ngày mưa",
      "piano-night": "đêm piano",
      "late-wash": "mẻ giặt khuya",
      "tape-hiss": "tiếng rè băng",
      "city-at-3am": "phố lúc 3 giờ sáng",
      "study-hall": "phòng tự học",
      "smoky-jazz": "jazz khói",
      fireplace: "lò sưởi",
      "neon-tokyo": "tokyo đèn neon",
      "string-quartet": "tứ tấu đàn dây",
      "porch-guitar": "guitar hiên nhà",
      "deep-space": "vũ trụ sâu thẳm",
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
    comeBackToWrite: "hai phút nữa quay lại để viết thêm một lời nhắn nhé",
    startsNext: (o: { number: number }) =>
      `lời nhắn này mở đầu sổ số ${o.number}`,
    writePromptBeforeKeys: "viết một lời nhắn cho người đến sau · ",
    writePromptAfterKeys: " để lưu",
    textareaLabel: "Viết lời nhắn vào sổ",
    notifyWhenFree: "báo mình khi đến lượt",
    notifyPending: "sẽ báo bạn",
    saveNote: "lưu lời nhắn",
    saveDoodle: "lưu hình vẽ",
    penModeLabel: "Bút",
    penModes: { write: "viết", draw: "vẽ" },
    drawPrompt: "vẽ gì đó cho người đến sau",
    doodleMoved: (o: { page: number }) =>
      `trang này hết chỗ · đang vẽ ở tr. ${o.page}`,
    doodleBookFull: "sổ này không còn chỗ để vẽ · viết lời nhắn thay nhé",
    inkFull: "hết chỗ cho mực · lưu lại hoặc hoàn tác",
    someoneDrawingInNotebook: "có người đang vẽ vào sổ · chờ đến lượt bạn",
    padLabel: "Chỗ vẽ trong sổ",
    drawingNow: "đang vẽ…",
    someoneDrawingNow: "có người đang vẽ…",
    undo: "hoàn tác",
    clear: "xóa",
    savingNote: "đang lưu…",
    close: "đóng",
    freeNotificationTitle: "cuốn sổ đã rảnh",
    freeNotificationBody: "đến lượt bạn viết",
    leaveFailures: {
      offline: "sổ hiện đang ngoại tuyến · lời nhắn của bạn vẫn ở đây",
      rate_limited: "mỗi hai phút một lời nhắn · lát nữa thử lại nhé",
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
    basketWet: "quần áo vẫn còn ướt · sấy ở tiệm giặt",
    lampOffTooltip: "tắt đèn",
    lampOnTooltip: "bật đèn",
    lampOffLabel: "Tắt đèn",
    lampOnLabel: "Bật đèn",
    curtainCloseTooltip: "kéo rèm lại",
    curtainOpenTooltip: "kéo rèm ra",
    curtainCloseLabel: "Kéo rèm lại",
    curtainOpenLabel: "Kéo rèm ra",
    bedTooltip: "đi ngủ",
    bedLabel: "Đi ngủ",
    goodNight: "Chúc ngủ ngon",
    notSleepy: "hết muốn ngủ rồi",
    doorReadyTooltip: "mang ra tiệm giặt",
    doorWaitingTooltip: "nhặt đồ trước đã",
    doorAwayTooltip: "quay lại tiệm giặt · đồ đang ở trong máy",
    doorAwayLabel: "Quay lại tiệm giặt, đồ vẫn còn trong máy",
    doorReadyLabel: "Mang giỏ ra tiệm giặt",
    doorWaitingLabel: "Cửa ra tiệm giặt, nhặt đồ trước đã",
    justListen: "chỉ nghe thôi →",
  },
} satisfies LaundromatCopy;
