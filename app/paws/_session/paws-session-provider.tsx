"use client";

import { useEffect, useMemo, useState } from "react";

import { createCaptchaTokens } from "@/lib/paws/auth/create-captcha-tokens";
import { createCodeTypeStore } from "@/lib/paws/auth/create-code-type-store";
import { normalizeEmail } from "@/lib/paws/auth/normalize-email";
import { readPawsSession } from "@/lib/paws/auth/read-paws-session";
import { sendEmailCode } from "@/lib/paws/auth/send-email-code";
import { signInAsGuest } from "@/lib/paws/auth/sign-in-as-guest";
import { verifyEmailCode } from "@/lib/paws/auth/verify-email-code";
import type { PawsSession, PawsSessionActions } from "@/lib/paws/session-types";
import { createPawsBrowserClient } from "@/lib/paws/supabase/create-paws-browser-client";

import { PawsSessionContext } from "./paws-session-context";
import { TurnstileWidget } from "./turnstile-widget";

const CAPTCHA_TIMEOUT_MS = 30_000;
const GUEST_RETRY_MS = 5_000;

type PawsSessionProviderProps = {
  children: React.ReactNode;
};

/** Provide the paws session: create the browser Supabase client from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, sign a visitor without a session in as an anonymous guest with a Turnstile token (none when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is not set), keep the Realtime token current, and offer the email code sign-in actions. */
export function PawsSessionProvider(props: PawsSessionProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [client, setClient] =
    useState<ReturnType<typeof createPawsBrowserClient>>();
  const [session, setSession] = useState<PawsSession>({ kind: "loading" });
  const [needsGuest, setNeedsGuest] = useState(false);
  const [guestAttempt, setGuestAttempt] = useState(0);
  const [captchaTokens] = useState(() =>
    createCaptchaTokens({
      timeoutMs: CAPTCHA_TIMEOUT_MS,
      schedule: ({ run, delayMs }) => {
        const timer = window.setTimeout(run, delayMs);
        return () => window.clearTimeout(timer);
      },
    })
  );
  const [codeTypes] = useState(() =>
    createCodeTypeStore({ storage: () => window.sessionStorage })
  );

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return;
    const created = createPawsBrowserClient({ url, anonKey });
    setClient(created);
    const { data } = created.auth.onAuthStateChange((_event, next) => {
      setSession(readPawsSession(next));
      setNeedsGuest(next === null);
      if (next !== null) void created.realtime.setAuth(next.access_token);
    });
    return () => {
      data.subscription.unsubscribe();
      void created.removeAllChannels();
      void created.auth.stopAutoRefresh();
      setClient(undefined);
      setSession({ kind: "loading" });
    };
  }, []);

  useEffect(() => {
    if (client === undefined || !needsGuest) return;
    const run: { isCancelled: boolean; cancelRetry?: () => void } = {
      isCancelled: false,
    };
    void (async () => {
      const captchaToken = siteKey ? await captchaTokens.take() : undefined;
      if (run.isCancelled) return;
      const signedIn = await signInAsGuest({ auth: client.auth, captchaToken });
      if (run.isCancelled || signedIn.kind === "signedIn") return;
      const timer = window.setTimeout(
        () => setGuestAttempt((attempt) => attempt + 1),
        GUEST_RETRY_MS
      );
      run.cancelRetry = () => window.clearTimeout(timer);
    })();
    return () => {
      run.isCancelled = true;
      run.cancelRetry?.();
    };
  }, [client, needsGuest, guestAttempt, siteKey, captchaTokens]);

  const isGuest = session.kind === "guest";
  const actions = useMemo<PawsSessionActions>(
    () => ({
      async sendEmailCode(options) {
        if (client === undefined) return { kind: "failed" };
        const email = normalizeEmail(options.email);
        const sent = await sendEmailCode({
          auth: client.auth,
          email,
          isGuest,
          takeCaptchaToken: async () =>
            siteKey ? captchaTokens.take() : undefined,
        });
        if (sent.kind !== "sent") return sent;
        codeTypes.set({ email, codeType: sent.codeType });
        return { kind: "sent" };
      },
      async verifyEmailCode(options) {
        if (client === undefined) return { kind: "failed" };
        const email = normalizeEmail(options.email);
        return verifyEmailCode({
          auth: client.auth,
          email,
          code: options.code,
          codeType: codeTypes.get(email) ?? "email",
        });
      },
      async signOut() {
        await client?.auth.signOut();
      },
    }),
    [client, isGuest, siteKey, captchaTokens, codeTypes]
  );

  const value = useMemo(
    () => ({ session, actions, client }),
    [session, actions, client]
  );

  return (
    <PawsSessionContext.Provider value={value}>
      {siteKey ? (
        <TurnstileWidget siteKey={siteKey} captchaTokens={captchaTokens} />
      ) : undefined}
      {props.children}
    </PawsSessionContext.Provider>
  );
}
