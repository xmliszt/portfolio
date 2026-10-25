"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckoutElementsProvider,
  ContactDetailsElement,
  ExpressCheckoutElement,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import type { Appearance } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js/pure";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { SETTINGS_META_CLASS } from "@/app/laundromat/settings/settings-meta-class";
import { SceneThemeContext } from "@/app/laundromat/themes/scene-theme-context";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import type { SceneTokens } from "@/lib/laundromat/scene-config";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { themes } from "@/lib/laundromat/themes/themes";
import { STRIPE_LOCALES } from "@/lib/laundromat/tip/stripe-locales";
import { cn } from "@/lib/utils";

import type { StartTipResult } from "./tip-actions";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const IS_TEST_MODE = PUBLISHABLE_KEY.startsWith("pk_test_");
const SKELETON_HEIGHTS_PX = [48, 14, 44, 96, 48];
const SYSTEM_FONT =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

// Stripe.js must load once per page and language, and only when someone opens the checkout.
const stripeByLocale: {
  [locale: string]: ReturnType<typeof loadStripe> | undefined;
} = {};

function getStripe(locale: LaundromatLocale) {
  const stripeLocale = STRIPE_LOCALES[locale];
  const stripe =
    stripeByLocale[stripeLocale] ??
    loadStripe(PUBLISHABLE_KEY, { locale: stripeLocale });
  stripeByLocale[stripeLocale] = stripe;
  return stripe;
}

function getCheckoutAppearance(options: {
  tokens: SceneTokens;
  colorScheme: "dark" | "light";
}): Appearance {
  const { tokens } = options;
  return {
    theme: options.colorScheme === "dark" ? "night" : "stripe",
    variables: {
      colorPrimary: tokens.accent,
      colorBackground: tokens.panel,
      colorText: tokens.inkHi,
      colorTextSecondary: tokens.ink,
      colorTextPlaceholder: tokens.ink,
      colorDanger: tokens.danger,
      fontFamily: SYSTEM_FONT,
      fontSizeBase: "15px",
      borderRadius: "8px",
      spacingUnit: "3px",
    },
    rules: {
      ".Input": {
        border: `1px solid ${tokens.edge}`,
        boxShadow: "none",
      },
      ".Input:focus": {
        border: `1px solid ${tokens.accent}`,
        boxShadow: "none",
      },
      ".Tab": {
        border: `1px solid ${tokens.edge}`,
        backgroundColor: tokens.panel,
        boxShadow: "none",
      },
      ".Tab--selected": {
        borderColor: tokens.accent,
        backgroundColor: tokens.faceTop,
      },
      ".TabLabel--selected": { color: tokens.inkHi },
      ".TabIcon--selected": { fill: tokens.inkHi },
      ".Label": { color: tokens.ink },
    },
  };
}

type StripeCheckoutProps = {
  cents: number;
  startTip: (options: { cents: number }) => Promise<StartTipResult>;
  onConfirm: (options: { sessionId: string }) => void;
  onPayingChange: (isPaying: boolean) => void;
  onPaid: (options: { sessionId: string }) => void;
};

type Session =
  | { kind: "loading" }
  | { kind: "ready"; sessionId: string; clientSecret: string }
  | { kind: "unavailable" };

/** Open a Stripe Checkout Session for a tip of `cents` and show its payment form in the room's colours: a wallet button when the browser has one, then email and card or PayNow, calling `onPaid` once Stripe confirms the payment. */
export function StripeCheckout(props: StripeCheckoutProps) {
  const theme = useContext(SceneThemeContext);
  const tokens = theme?.tokens ?? sceneConfig.tokens;
  const colorScheme = themes[theme?.themeId ?? "classic"].colorScheme;
  const appearance = useMemo(
    () => getCheckoutAppearance({ tokens, colorScheme }),
    [tokens, colorScheme]
  );
  const { copy } = useLaundromatCopy();
  const [session, setSession] = useState<Session>({ kind: "loading" });
  const startedRef = useRef<{
    cents: number;
    result: Promise<StartTipResult>;
  }>(undefined);
  const { startTip, cents } = props;

  useEffect(() => {
    let isCurrent = true;
    setSession({ kind: "loading" });
    if (startedRef.current?.cents !== cents) {
      startedRef.current = { cents, result: startTip({ cents }) };
    }
    void startedRef.current.result
      .catch(() => ({ kind: "unavailable" }) as const)
      .then((result) => {
        if (!isCurrent) return;
        setSession(
          result.kind === "started"
            ? {
                kind: "ready",
                sessionId: result.sessionId,
                clientSecret: result.clientSecret,
              }
            : { kind: "unavailable" }
        );
      });
    return () => {
      isCurrent = false;
    };
  }, [startTip, cents]);

  switch (session.kind) {
    case "loading":
      return <CheckoutSkeleton />;
    case "unavailable":
      return (
        <p role="alert" className="m-0 text-[14px] text-[var(--lm-ink)]">
          {copy.tip.unavailable}
        </p>
      );
    case "ready":
      return (
        <CheckoutElementsProvider
          key={session.sessionId}
          stripe={getStripe(copy.locale)}
          options={{
            clientSecret: session.clientSecret,
            elementsOptions: { appearance },
          }}
        >
          <CheckoutForm
            sessionId={session.sessionId}
            onConfirm={props.onConfirm}
            onPayingChange={props.onPayingChange}
            onPaid={props.onPaid}
          />
        </CheckoutElementsProvider>
      );
    default: {
      const unhandled: never = session;
      return unhandled;
    }
  }
}

function CheckoutSkeleton() {
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

type CheckoutFormProps = {
  sessionId: string;
  onConfirm: (options: { sessionId: string }) => void;
  onPayingChange: (isPaying: boolean) => void;
  onPaid: (options: { sessionId: string }) => void;
};

function CheckoutForm(props: CheckoutFormProps) {
  const { copy } = useLaundromatCopy();
  const checkoutState = useCheckoutElements();
  const [isPaying, setIsPaying] = useState(false);
  const isPayingRef = useRef(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [error, setError] = useState<string>();

  if (checkoutState.type === "loading") return <CheckoutSkeleton />;
  if (checkoutState.type === "error") {
    return (
      <p role="alert" className="m-0 text-[14px] text-[var(--lm-ink)]">
        {copy.tip.unavailable}
      </p>
    );
  }
  const { checkout } = checkoutState;

  async function pay(
    confirmOptions: Parameters<typeof checkout.confirm>[0] = {}
  ) {
    if (isPayingRef.current) {
      confirmOptions.expressCheckoutConfirmEvent?.paymentFailed();
      return;
    }
    isPayingRef.current = true;
    setIsPaying(true);
    setError(undefined);
    props.onPayingChange(true);
    props.onConfirm({ sessionId: props.sessionId });
    const result = await checkout.confirm({
      ...confirmOptions,
      redirect: "if_required",
    });
    if (result.type === "error") {
      setError(result.error.message);
      isPayingRef.current = false;
      setIsPaying(false);
      props.onPayingChange(false);
      return;
    }
    props.onPaid({ sessionId: props.sessionId });
  }

  return (
    <form
      className="flex flex-col gap-y-3 [font-family:system-ui,-apple-system,sans-serif]"
      onSubmit={(event) => {
        event.preventDefault();
        void pay();
      }}
    >
      {IS_TEST_MODE && (
        <span
          className={cn(
            SETTINGS_META_CLASS,
            "self-start rounded-[4px] bg-[color-mix(in_oklab,var(--lm-accent)_16%,transparent)] px-1.5 py-0.5 text-[var(--lm-accent-hi)]"
          )}
        >
          {copy.tip.testMode}
        </span>
      )}
      <ExpressCheckoutElement
        onReady={(event) =>
          setHasWallet(event.availablePaymentMethods !== undefined)
        }
        onConfirm={(event) => void pay({ expressCheckoutConfirmEvent: event })}
      />
      {hasWallet && (
        <div
          className={cn(
            SETTINGS_META_CLASS,
            "flex items-center gap-x-3 opacity-50 before:h-px before:flex-1 before:bg-[var(--lm-edge)] after:h-px after:flex-1 after:bg-[var(--lm-edge)]"
          )}
        >
          {copy.tip.orPayWith}
        </div>
      )}
      <ContactDetailsElement />
      <PaymentElement options={{ layout: "tabs" }} />
      {error !== undefined && (
        <p role="alert" className="m-0 text-[13px] text-[var(--lm-danger)]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPaying}
        className="flex h-12 w-full cursor-pointer items-center justify-center rounded-[8px] bg-[var(--lm-accent)] text-[16px] font-medium text-[var(--lm-accent-ink)] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_1px_2px_rgb(0_0_0/0.5)] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--lm-accent-ink),inset_0_0_0_3.5px_var(--lm-accent-hi)] disabled:cursor-default"
      >
        {isPaying ? (
          <span
            aria-label={copy.tip.processing}
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
          />
        ) : (
          copy.tip.pay({ amount: checkout.total.total.amount })
        )}
      </button>
      <p
        className={cn(
          SETTINGS_META_CLASS,
          "m-0 text-center normal-case opacity-40"
        )}
      >
        {copy.tip.poweredBy}
      </p>
    </form>
  );
}
