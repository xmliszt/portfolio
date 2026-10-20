"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { SETTINGS_META_CLASS } from "@/app/laundromat/settings/settings-meta-class";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { tipCopy } from "@/lib/laundromat/tip/tip-copy";
import { cn } from "@/lib/utils";

import { FakePayNowCode } from "./fake-paynow-code";
import type { TipService } from "./tip-service";

type Method = "card" | "paynow";

type FakeCheckoutProps = {
  cents: number;
  service: TipService;
  onPaying: () => void;
  onPaid: (options: { sessionId: string }) => void;
};

const BOX_CLASS =
  "rounded-[8px] bg-[#0f1011] shadow-[inset_0_0_0_1px_var(--lm-edge)] focus-within:shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--lm-accent)_70%,transparent)]";
const INPUT_CLASS =
  "h-11 w-full min-w-0 bg-transparent px-3 text-[15px] text-[var(--lm-ink-hi)] outline-none";
const SKELETON_HEIGHTS_PX = [48, 14, 40, 96, 48];
const TAB_SPRING = { type: "spring", visualDuration: 0.25, bounce: 0 } as const;
const METHOD_FADE_S = 0.16;

function isApple() {
  return /iPhone|iPad|Macintosh/.test(navigator.userAgent);
}

/** Stand in for Stripe's embedded Checkout form, themed like the room: a wallet button, then a card form prefilled with a test card or a PayNow code, each paying through `service` after its delay. */
export function FakeCheckout(props: FakeCheckoutProps) {
  const { service, cents } = props;
  const [sessionId, setSessionId] = useState<string>();
  const [method, setMethod] = useState<Method>("card");
  const [isPaying, setIsPaying] = useState(false);
  const [wallet, setWallet] = useState<"Apple Pay" | "Google Pay">();
  const { quality } = useRenderQuality();

  useEffect(() => {
    let isCurrent = true;
    setWallet(isApple() ? "Apple Pay" : "Google Pay");
    void service.startTip({ cents }).then((session) => {
      if (isCurrent) setSessionId(session.sessionId);
    });
    return () => {
      isCurrent = false;
    };
  }, [service, cents]);

  async function pay() {
    if (sessionId === undefined || isPaying) return;
    setIsPaying(true);
    props.onPaying();
    await service.payTip({ sessionId });
    props.onPaid({ sessionId });
  }

  if (sessionId === undefined) {
    return (
      <div aria-busy className="flex flex-col gap-y-3">
        {SKELETON_HEIGHTS_PX.map((heightPx, index) => (
          <div
            key={index}
            className="animate-pulse rounded-[8px] bg-[color-mix(in_oklab,var(--lm-ink)_7%,transparent)] motion-reduce:animate-none"
            style={{ height: heightPx }}
          />
        ))}
      </div>
    );
  }

  const spinnerClass =
    "size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none";
  const spinner = (
    <span aria-label={tipCopy.processing} className={spinnerClass} />
  );

  return (
    <form
      className="flex flex-col gap-y-3 [font-family:system-ui,-apple-system,sans-serif]"
      onSubmit={(event) => {
        event.preventDefault();
        void pay();
      }}
    >
      <span
        className={cn(
          SETTINGS_META_CLASS,
          "self-start rounded-[4px] bg-[color-mix(in_oklab,var(--lm-accent)_16%,transparent)] px-1.5 py-0.5 text-[var(--lm-accent-hi)]"
        )}
      >
        {tipCopy.testMode}
      </span>
      <button
        type="button"
        disabled={isPaying}
        className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#000] text-[16px] font-medium text-[#fff] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.16)] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--lm-accent)]"
        onClick={() => void pay()}
      >
        {isPaying ? spinner : wallet}
      </button>
      <div
        className={cn(
          SETTINGS_META_CLASS,
          "flex items-center gap-x-3 opacity-50 before:h-px before:flex-1 before:bg-[var(--lm-edge)] after:h-px after:flex-1 after:bg-[var(--lm-edge)]"
        )}
      >
        {tipCopy.orPayWith}
      </div>
      <div
        role="tablist"
        className="grid grid-cols-2 gap-x-1 rounded-[9px] bg-[#0f1011] p-1 shadow-[inset_0_0_0_1px_var(--lm-edge)]"
      >
        {(["card", "paynow"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={method === option}
            className="relative h-8 cursor-pointer rounded-[6px] text-[13px] lowercase outline-none focus-visible:ring-1 focus-visible:ring-[var(--lm-accent)]"
            onClick={() => setMethod(option)}
          >
            {method === option && (
              <motion.span
                layoutId="checkout-method"
                className="absolute inset-0 rounded-[6px] bg-[#25272a] shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.6)]"
                transition={TAB_SPRING}
              />
            )}
            <span
              className={cn(
                "relative",
                method === option
                  ? "text-[var(--lm-ink-hi)]"
                  : "text-[var(--lm-ink)] opacity-70"
              )}
            >
              {option === "card" ? tipCopy.card : tipCopy.payNow}
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={method}
          className="flex flex-col gap-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: METHOD_FADE_S }}
        >
          {method === "card" ? (
            <>
              <label className={BOX_CLASS}>
                <span className="sr-only">{tipCopy.email}</span>
                <input
                  className={INPUT_CLASS}
                  type="email"
                  autoComplete="email"
                  placeholder={tipCopy.email}
                  defaultValue="visitor@example.com"
                />
              </label>
              <div className={cn(BOX_CLASS, "flex flex-col")}>
                <input
                  aria-label={tipCopy.cardNumber}
                  className={cn(INPUT_CLASS, "tabular-nums")}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  defaultValue="4242 4242 4242 4242"
                />
                <div className="grid grid-cols-2 shadow-[0_-1px_0_var(--lm-edge)]">
                  <input
                    aria-label={tipCopy.expiry}
                    className={cn(
                      INPUT_CLASS,
                      "shadow-[1px_0_0_var(--lm-edge)]"
                    )}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    defaultValue="12 / 34"
                  />
                  <input
                    aria-label={tipCopy.cvc}
                    className={INPUT_CLASS}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    defaultValue="123"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isPaying}
                className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[8px] bg-[var(--lm-accent)] text-[16px] font-medium text-[#1a1209] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_1px_2px_rgb(0_0_0/0.5)] outline-none focus-visible:shadow-[inset_0_0_0_2px_#1a1209,inset_0_0_0_3.5px_var(--lm-accent-hi)] disabled:cursor-default"
              >
                {isPaying ? spinner : tipCopy.pay({ cents })}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-y-3">
              <FakePayNowCode seed={sessionId} />
              <p className="m-0 max-w-[260px] text-center text-[13px] leading-5 text-pretty text-[var(--lm-ink)]">
                {tipCopy.payNowSteps}
              </p>
              <p
                role="status"
                className="m-0 flex h-12 w-full items-center justify-center gap-x-2 rounded-[8px] text-[14px] text-[var(--lm-ink)] shadow-[inset_0_0_0_1px_var(--lm-edge)]"
              >
                {quality === "lite" ? (
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-[var(--lm-accent)]"
                  />
                ) : (
                  <span aria-hidden className={spinnerClass} />
                )}
                {isPaying ? tipCopy.processing : tipCopy.payNowWaiting}
              </p>
              <button
                type="button"
                disabled={isPaying}
                className={cn(
                  SETTINGS_META_CLASS,
                  "cursor-pointer rounded-[4px] px-1.5 py-0.5 text-[var(--lm-accent-hi)] underline decoration-dotted underline-offset-4 outline-none focus-visible:shadow-[inset_0_0_0_1px_var(--lm-accent)] disabled:opacity-40"
                )}
                onClick={() => void pay()}
              >
                {tipCopy.simulatePayNow}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <p
        className={cn(
          SETTINGS_META_CLASS,
          "m-0 text-center normal-case opacity-40"
        )}
      >
        {tipCopy.poweredBy}
      </p>
    </form>
  );
}
