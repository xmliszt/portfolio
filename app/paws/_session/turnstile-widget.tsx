"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

import type { createCaptchaTokens } from "@/lib/paws/auth/create-captcha-tokens";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      appearance: "interaction-only";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileWidgetProps = {
  siteKey: string;
  captchaTokens: ReturnType<typeof createCaptchaTokens>;
};

/** Render a Cloudflare Turnstile widget that stays hidden unless it needs the visitor, puts each token it gets into `captchaTokens`, and fetches a new one whenever a token is taken. */
export function TurnstileWidget(props: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const turnstile = window.turnstile;
    const container = containerRef.current;
    if (!isLoaded || turnstile === undefined || container === null) return;
    const widgetId = turnstile.render(container, {
      sitekey: props.siteKey,
      appearance: "interaction-only",
      callback: (token) => props.captchaTokens.put(token),
      "expired-callback": () => props.captchaTokens.clear(),
      "error-callback": () => props.captchaTokens.clear(),
    });
    if (widgetId === undefined) return;
    const stopListening = props.captchaTokens.onTaken(() =>
      turnstile.reset(widgetId)
    );
    return () => {
      stopListening();
      turnstile.remove(widgetId);
    };
  }, [isLoaded, props.siteKey, props.captchaTokens]);

  function handleReady() {
    setIsLoaded(true);
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={handleReady}
      />
      <div
        ref={containerRef}
        className="fixed bottom-4 left-1/2 z-[110] -translate-x-1/2"
      />
    </>
  );
}
