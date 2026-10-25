"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { HANDWRITING_FONT_FAMILIES } from "@/app/laundromat/notebook/handwriting-fonts";
import {
  PRINTER_ICON_CLASS,
  PRINTER_KEY_CLASS,
} from "@/app/laundromat/settings/printer-key-class";
import { SETTINGS_LCD_CLASS } from "@/app/laundromat/settings/settings-lcd-class";
import { SETTINGS_META_CLASS } from "@/app/laundromat/settings/settings-meta-class";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { formatSgd } from "@/lib/laundromat/tip/format-sgd";
import { formatTipDate } from "@/lib/laundromat/tip/format-tip-date";
import { getTipUses } from "@/lib/laundromat/tip/get-tip-uses";
import { parseCustomTip } from "@/lib/laundromat/tip/parse-custom-tip";
import { parseTokenCode } from "@/lib/laundromat/tip/parse-token-code";
import {
  CUSTOM_TIP_CENTS,
  TIP_COINS_CENTS,
} from "@/lib/laundromat/tip/tip-amounts";
import { COIN_METALS } from "@/lib/laundromat/tip/tip-coin-metals";
import type { TipToken } from "@/lib/laundromat/tip/tip-token";
import { TOKEN_CODE_PLACEHOLDER } from "@/lib/laundromat/tip/token-code-format";
import { cn } from "@/lib/utils";

import { CloseKey } from "./close-key";
import { StripeCheckout } from "./stripe-checkout";
import { TIP_FACEPLATE_CLASS } from "./tip-classes";
import { TipCoin } from "./tip-coin";
import { TipReceipt } from "./tip-receipt";
import type { TipState } from "./tip-state";
import { useMeasuredHeight } from "./use-measured-height";

export type CoinPanelStep =
  | { kind: "pick" }
  | { kind: "checkout"; cents: number }
  | { kind: "waiting"; cents: number; sessionId: string }
  | { kind: "token"; token: TipToken; fresh: boolean }
  | { kind: "restore" };

type RestoreStatus = "idle" | "checking" | "misread" | "notFound" | "offline";

const SPRING = { type: "spring", visualDuration: 0.38, bounce: 0.12 } as const;
const STEP_ENTER = { duration: 0.26, ease: [0.23, 1, 0.32, 1] } as const;
const STEP_EXIT = { duration: 0.14, ease: [0.4, 0, 1, 1] } as const;
const COIN_SIZE_PX = 64;
const SUMMARY_COIN_SIZE_PX = 34;
const SCREEN_FADE_S = 0.12;
const RISE_PX = { enter: 10, exit: 6 };
const ENTER_BLUR = "blur(3px)";
const HOVER_LIFT_PX = 3;
const TAP_SCALE = 0.92;
const SCREWS = [
  "top-1.5 left-1.5",
  "top-1.5 right-1.5",
  "bottom-1.5 left-1.5",
  "bottom-1.5 right-1.5",
];

const CUSTOM_TIP_PLACEHOLDER = `S$ ${CUSTOM_TIP_CENTS.min / 100} – ${CUSTOM_TIP_CENTS.max / 100}`;
const SCREEN_CLASS = cn(
  SETTINGS_LCD_CLASS,
  "h-8 flex-1 px-3 text-[12px] normal-case"
);
const WIDE_KEY_CLASS = cn(PRINTER_KEY_CLASS, "h-10 w-full justify-center px-3");
const FIELD_CLASS =
  "h-11 w-full min-w-0 rounded-[7px] bg-[var(--lm-display)] px-3 font-[family-name:var(--lm-font-mono)] text-[16px] tracking-[0.04em] text-[var(--lm-glow)] [text-shadow:0_0_6px_color-mix(in_oklab,var(--lm-glow)_60%,transparent)] shadow-[inset_0_1px_3px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.04)] outline-none placeholder:text-[color-mix(in_oklab,var(--lm-glow)_35%,transparent)] placeholder:[text-shadow:none] focus-visible:shadow-[inset_0_1px_3px_rgb(0_0_0/0.9),inset_0_0_0_1.5px_color-mix(in_oklab,var(--lm-glow)_60%,transparent)]";

type CoinMachinePanelProps = {
  tip: TipState;
  step: CoinPanelStep;
  restoreCode: string | undefined;
  resumeSessionId: string | undefined;
  onStepChange: (step: CoinPanelStep) => void;
  onBusyChange: (isBusy: boolean) => void;
  onClose: () => void;
};

function coinLabel(cents: number) {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? String(dollars) : dollars.toFixed(2);
}

/** Show the coin machine's faceplate: a screen that names each step, what a tip gets, a tray of coins to pick from with how many uses each one's token gets, the checkout, the coin while the payment settles and its token is made, and the printed token, or a field to bring back a token from its code. */
export function CoinMachinePanel(props: CoinMachinePanelProps) {
  const { copy } = useLaundromatCopy();
  const { tip, step } = props;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { quality } = useRenderQuality();
  const isRich = quality === "full" && !prefersReducedMotion;
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const [restoreText, setRestoreText] = useState(props.restoreCode ?? "");
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus>("idle");
  const { ref: contentRef, heightPx: contentHeightPx } =
    useMeasuredHeight<HTMLDivElement>();
  const firstCoinRef = useRef<HTMLButtonElement>(null);
  const customCents = parseCustomTip(customText);
  const [isPaying, setIsPaying] = useState(false);
  const [isNotPaid, setIsNotPaid] = useState(false);
  const isDispensing =
    tip.machine.kind === "inserting" || tip.machine.kind === "dispensing";
  const isBusy =
    (step.kind === "checkout" && isPaying) ||
    (step.kind === "waiting" && isDispensing);
  const { onBusyChange } = props;
  useEffect(() => onBusyChange(isBusy), [isBusy, onBusyChange]);

  const screen = (() => {
    switch (step.kind) {
      case "pick":
        if (isCustomOpen) return copy.tip.screen.custom;
        return isNotPaid ? copy.tip.screen.notPaid : copy.tip.screen.pick;
      case "checkout":
        return copy.tip.screen.checkout({ amount: formatSgd(step.cents) });
      case "waiting":
        return isDispensing
          ? copy.tip.screen.dropping
          : copy.tip.screen.waiting;
      case "token":
        return copy.tip.screen.token;
      case "restore":
        return restoreStatus === "idle"
          ? copy.tip.screen.restore
          : copy.tip.screen[restoreStatus];
      default: {
        const unhandled: never = step;
        return unhandled;
      }
    }
  })();

  useEffect(() => {
    if (step.kind === "pick") {
      firstCoinRef.current?.focus({ preventScroll: true });
    }
  }, [step.kind]);

  async function restore(text: string) {
    const code = parseTokenCode(text);
    if (code === undefined) {
      setRestoreStatus("misread");
      return;
    }
    setRestoreStatus("checking");
    const result = await tip
      .restoreToken({ code })
      .catch(() => ({ kind: "unavailable" }) as const);
    if (result.kind !== "restored") {
      setRestoreStatus(result.kind === "unknown" ? "notFound" : "offline");
      return;
    }
    setRestoreStatus("idle");
    props.onStepChange({ kind: "token", token: result.token, fresh: false });
  }

  const submittedRestoreCodeRef = useRef<string>(undefined);
  useEffect(() => {
    const code = props.restoreCode;
    if (code === undefined || code === submittedRestoreCodeRef.current) return;
    submittedRestoreCodeRef.current = code;
    setRestoreText(code);
    props.onStepChange({ kind: "restore" });
    void restore(code);
  });

  async function handlePaid(options: { sessionId: string; cents: number }) {
    props.onStepChange({ kind: "waiting", ...options });
    const token = await tip.settleTip({ sessionId: options.sessionId });
    setIsNotPaid(token === undefined);
    props.onStepChange(
      token === undefined
        ? { kind: "pick" }
        : { kind: "token", token, fresh: true }
    );
  }

  const resumedSessionIdRef = useRef<string>(undefined);
  useEffect(() => {
    const sessionId = props.resumeSessionId;
    if (sessionId === undefined || sessionId === resumedSessionIdRef.current) {
      return;
    }
    resumedSessionIdRef.current = sessionId;
    const pending = tip.findPendingTip(sessionId);
    if (pending !== undefined) {
      void handlePaid({ sessionId, cents: pending.cents });
    }
  });

  function pickCoin(cents: number) {
    setIsPaying(false);
    setIsNotPaid(false);
    props.onStepChange({ kind: "checkout", cents });
  }

  function coin(options: { cents: number; sizePx: number; rich: boolean }) {
    return (
      <TipCoin
        metal={COIN_METALS[options.cents] ?? "brass"}
        label={coinLabel(options.cents)}
        caption={options.rich ? "S$" : undefined}
        sizePx={options.sizePx}
        engraved={options.rich}
        shine={options.rich && isRich}
      />
    );
  }

  const body = (() => {
    switch (step.kind) {
      case "pick":
        return (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <p
                className="m-0 text-[22px] leading-6 text-pretty text-[var(--lm-ink-hi)]"
                style={{ fontFamily: HANDWRITING_FONT_FAMILIES.latin }}
              >
                {copy.tip.note}
              </p>
              <p
                className={cn(
                  SETTINGS_META_CLASS,
                  "m-0 text-pretty normal-case opacity-80"
                )}
              >
                {copy.tip.pitch}
              </p>
            </div>
            <div className="grid grid-cols-4 justify-items-center gap-x-2 rounded-[14px] bg-[linear-gradient(180deg,var(--lm-well),var(--lm-panel))] px-3 pt-4 pb-5 shadow-[inset_0_2px_6px_rgb(0_0_0/0.85),inset_0_-1px_0_rgb(255_255_255/0.04),0_1px_0_rgb(255_255_255/0.04)]">
              {TIP_COINS_CENTS.map((cents, index) => (
                <motion.button
                  key={cents}
                  ref={index === 0 ? firstCoinRef : undefined}
                  type="button"
                  aria-label={copy.tip.coinLabel({
                    amount: formatSgd(cents),
                    uses: getTipUses(cents),
                  })}
                  className="flex cursor-pointer flex-col items-center gap-y-2 rounded-[10px] outline-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--lm-ink-hi)] focus-visible:outline-dashed"
                  whileHover={isRich ? { y: -HOVER_LIFT_PX } : undefined}
                  whileTap={{ scale: TAP_SCALE }}
                  transition={SPRING}
                  onClick={() => pickCoin(cents)}
                >
                  <motion.span
                    layoutId={`tip-coin-${cents}`}
                    className="block"
                    transition={SPRING}
                  >
                    {coin({ cents, sizePx: COIN_SIZE_PX, rich: true })}
                  </motion.span>
                  <span
                    aria-hidden
                    className={cn(SETTINGS_META_CLASS, "text-[var(--lm-ink)]")}
                  >
                    {copy.tip.coinUses({ count: getTipUses(cents) })}
                  </span>
                </motion.button>
              ))}
            </div>
            {isCustomOpen && (
              <div className="flex flex-col gap-y-2">
                <form
                  className="flex gap-x-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (customCents !== undefined) pickCoin(customCents);
                  }}
                >
                  <label className="flex min-w-0 flex-1">
                    <span className="sr-only">{copy.tip.otherLabel}</span>
                    <input
                      autoFocus
                      inputMode="decimal"
                      placeholder={CUSTOM_TIP_PLACEHOLDER}
                      className={FIELD_CLASS}
                      value={customText}
                      onChange={(event) => setCustomText(event.target.value)}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={customCents === undefined}
                    className={cn(
                      PRINTER_KEY_CLASS,
                      "h-11 disabled:cursor-default disabled:opacity-40"
                    )}
                  >
                    {copy.tip.insert}
                  </button>
                </form>
                {customCents !== undefined && (
                  <p className={cn(SETTINGS_META_CLASS, "m-0 opacity-80")}>
                    {copy.tip.coinUses({ count: getTipUses(customCents) })}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between gap-x-2">
              {isCustomOpen ? (
                <span />
              ) : (
                <button
                  type="button"
                  className={PRINTER_KEY_CLASS}
                  onClick={() => setIsCustomOpen(true)}
                >
                  {copy.tip.other}
                </button>
              )}
              <button
                type="button"
                className={PRINTER_KEY_CLASS}
                onClick={() => props.onStepChange({ kind: "restore" })}
              >
                {copy.tip.haveCode}
              </button>
            </div>
            <span
              className={cn(
                SETTINGS_META_CLASS,
                "flex items-center justify-center gap-x-1.5 opacity-80"
              )}
            >
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className={PRINTER_ICON_CLASS}
              >
                <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
                <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
              </svg>
              {copy.tip.secure}
            </span>
          </div>
        );
      case "checkout":
        return (
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-x-3">
              <motion.span
                layoutId={`tip-coin-${step.cents}`}
                className="block"
                transition={SPRING}
              >
                {coin({
                  cents: step.cents,
                  sizePx: SUMMARY_COIN_SIZE_PX,
                  rich: false,
                })}
              </motion.span>
              <span className="flex flex-1 flex-col">
                <span className="font-[family-name:var(--lm-font-display)] text-[15px] text-[var(--lm-ink-hi)]">
                  {copy.site.name}
                </span>
                <span className={cn(SETTINGS_META_CLASS, "opacity-80")}>
                  {copy.tip.coinUses({ count: getTipUses(step.cents) })}
                </span>
              </span>
              <button
                type="button"
                disabled={isPaying}
                className={cn(PRINTER_KEY_CLASS, "disabled:opacity-40")}
                onClick={() => props.onStepChange({ kind: "pick" })}
              >
                {copy.tip.change}
              </button>
            </div>
            <StripeCheckout
              cents={step.cents}
              startTip={tip.startTip}
              onConfirm={tip.rememberTip}
              onPayingChange={setIsPaying}
              onPaid={({ sessionId }) =>
                void handlePaid({ sessionId, cents: step.cents })
              }
            />
          </div>
        );
      case "waiting":
        return (
          <div className="flex flex-col items-center gap-y-4 pt-2 pb-4">
            {coin({ cents: step.cents, sizePx: COIN_SIZE_PX, rich: false })}
            {!isDispensing && (
              <>
                <p
                  role="status"
                  className="m-0 flex items-center gap-x-2 text-[14px] text-[var(--lm-ink-hi)]"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-3.5 rounded-full border-2 border-current border-t-transparent",
                      isRich && "animate-spin"
                    )}
                  />
                  {copy.tip.waitingForBank}
                </p>
                <p
                  className={cn(
                    SETTINGS_META_CLASS,
                    "m-0 max-w-[260px] text-center normal-case opacity-80"
                  )}
                >
                  {copy.tip.waitingNote}
                </p>
              </>
            )}
          </div>
        );
      case "token": {
        const token =
          tip.tokens.find(({ code }) => code === step.token.code) ?? step.token;
        return (
          <div className="flex flex-col gap-y-4">
            <TipReceipt token={token} printing={step.fresh} hint />
            <div className="flex flex-col gap-y-2">
              {token.usesLeft > 0 || token.spentAt === undefined ? (
                <>
                  <p
                    className={cn(
                      SETTINGS_META_CLASS,
                      "m-0 text-center text-pretty text-[var(--lm-accent-hi)] normal-case"
                    )}
                  >
                    {copy.tip.dropInMachineHint}
                  </p>
                  <button
                    type="button"
                    className={cn(WIDE_KEY_CLASS, "text-[var(--lm-accent-hi)]")}
                    onClick={() => {
                      tip.holdToken(token.code);
                      props.onClose();
                    }}
                  >
                    <TipCoin metal="brass" label="" sizePx={14} />
                    {copy.tip.dropInMachine}
                  </button>
                </>
              ) : (
                <p
                  className={cn(
                    SETTINGS_META_CLASS,
                    "m-0 text-center opacity-80"
                  )}
                >
                  {copy.tip.usedOn({
                    date: formatTipDate({
                      isoDate: token.spentAt,
                      locale: copy.locale,
                    }),
                  })}
                </p>
              )}
              <button
                type="button"
                className={WIDE_KEY_CLASS}
                onClick={props.onClose}
              >
                {copy.tip.done}
              </button>
            </div>
          </div>
        );
      }
      case "restore":
        return (
          <form
            className="flex flex-col gap-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void restore(restoreText);
            }}
          >
            <input
              autoFocus
              aria-label={copy.tip.screen.restore}
              aria-invalid={
                restoreStatus === "misread" || restoreStatus === "notFound"
              }
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className={cn(FIELD_CLASS, "uppercase placeholder:normal-case")}
              placeholder={TOKEN_CODE_PLACEHOLDER}
              value={restoreText}
              onChange={(event) => {
                setRestoreText(event.target.value);
                setRestoreStatus("idle");
              }}
            />
            <div className="flex justify-between gap-x-2">
              <button
                type="button"
                className={PRINTER_KEY_CLASS}
                onClick={() => props.onStepChange({ kind: "pick" })}
              >
                {copy.tip.back}
              </button>
              <button
                type="submit"
                disabled={restoreStatus === "checking"}
                className={cn(PRINTER_KEY_CLASS, "disabled:opacity-40")}
              >
                {copy.tip.restore}
              </button>
            </div>
          </form>
        );
      default: {
        const unhandled: never = step;
        return unhandled;
      }
    }
  })();

  return (
    <LayoutGroup>
      <div className={cn(TIP_FACEPLATE_CLASS, "gap-y-3 px-3")}>
        {SCREWS.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={cn(
              "absolute size-1 rounded-full bg-[var(--lm-detail)] shadow-[inset_0_-0.5px_0_var(--lm-control-edge),0_0.5px_0_rgb(255_255_255/0.06)]",
              corner
            )}
          />
        ))}
        <div className="flex items-center gap-x-2 px-1">
          <span role="status" className={SCREEN_CLASS}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={screen}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: SCREEN_FADE_S }}
              >
                {screen}
              </motion.span>
            </AnimatePresence>
          </span>
          {!isBusy && <CloseKey onClose={props.onClose} />}
        </div>
        <motion.div
          className="relative overflow-hidden"
          initial={false}
          animate={{ height: contentHeightPx ?? "auto" }}
          transition={prefersReducedMotion ? { duration: 0 } : SPRING}
        >
          <div ref={contentRef} className="p-1">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={step.kind}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : {
                        opacity: 0,
                        y: RISE_PX.enter,
                        ...(isRich && { filter: ENTER_BLUR }),
                      }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  ...(isRich && { filter: "blur(0px)" }),
                  transition: STEP_ENTER,
                }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0, transition: STEP_EXIT }
                    : { opacity: 0, y: -RISE_PX.exit, transition: STEP_EXIT }
                }
              >
                {body}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
