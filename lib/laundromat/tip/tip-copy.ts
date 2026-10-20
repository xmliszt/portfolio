import { formatSgd } from "./format-sgd";
import { CUSTOM_TIP_CENTS } from "./tip-amounts";

function tips(count: number) {
  return `${count} ${count === 1 ? "tip" : "tips"}`;
}

export const tipCopy = {
  machineLabel: "Coin machine, leave a tip",
  machineTooltip: "leave a tip",
  jarLoadingLabel: "Tip jar",
  jarLoadingTooltip: "tip jar",
  jarLabel: (o: { count: number }) => `Tip jar, ${tips(o.count)} so far`,
  jarTooltip: (o: { count: number }) => `${tips(o.count)} so far`,

  dialogLabel: "Coin machine",
  siteName: "laundro.cafe",
  payNowLabel: "PayNow code",
  close: "Close",
  screen: {
    pick: "insert coin",
    custom: "key in amount",
    checkout: (o: { cents: number }) => `${formatSgd(o.cents)} tip`,
    dropping: "dispensing token",
    token: "thank you",
    restore: "key in token code",
    checking: "reading code",
    notFound: "code not found",
    misread: "check the code",
  },
  note: "keeps the dryers warm. thank you!",
  signature: "— yuxuan",
  coinLabel: (o: { cents: number }) => `Tip ${formatSgd(o.cents)}`,
  other: "other amount",
  otherLabel: "Other amount",
  customPlaceholder: `S$ ${CUSTOM_TIP_CENTS.min / 100} – ${CUSTOM_TIP_CENTS.max / 100}`,
  insert: "insert",
  secure: "secure checkout by stripe",
  haveCode: "have a token code?",

  change: "change",
  testMode: "test mode · no money moves",
  orPayWith: "or",
  card: "card",
  payNow: "paynow",
  email: "Email",
  cardNumber: "Card number",
  expiry: "MM / YY",
  cvc: "CVC",
  pay: (o: { cents: number }) => `Pay ${formatSgd(o.cents)}`,
  processing: "Processing",
  payNowSteps:
    "On this phone? Screenshot the code, then scan it from photos in your bank app.",
  payNowWaiting: "Waiting for your bank",
  simulatePayNow: "test mode: simulate payment",
  poweredBy: "Powered by stripe",

  receiptKind: "tip token",
  receiptNumber: (o: { number: number }) =>
    `no. ${String(o.number).padStart(3, "0")}`,
  receiptCode: "token code",
  receiptNote: "thank you for the coin",
  keepCode: "Keep the code to bring this token to another device.",
  copyLink: "copy link",
  copied: "copied",
  save: "save",
  done: "Done",

  restorePlaceholder: "LC1.XXXXX-XXXXX-XX",
  restore: "bring it back",
  back: "back",

  pocketLabel: (o: { number: number }) => `token no. ${o.number}`,
  pocketHeading: "your tokens",
  dropInWasher: "drop in a washer",
  viewCoin: (o: { number: number }) => `Look at token no. ${o.number}`,
  turnCoin: "Turn the coin over",
  turnHint: "drag to turn",
  flip: "flip",
  coinNumberCaption: "no.",
  coinBackNote: "thank you",
  holdHint: "tap a washer for a golden wash",
  goldenReadout: "GOLD",
  trayHeading: "tip jar",
  traySummary: (o: { count: number }) => `${tips(o.count)} · yours shine`,
  trayCoinLabel: (o: { number: number; date: string; isOwn: boolean }) =>
    `Coin ${o.number}, ${o.date}${o.isOwn ? ", yours, look closer" : ""}`,
};
