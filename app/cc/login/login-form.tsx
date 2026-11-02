"use client";

import { useActionState } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";

import { signIn, type SignInState } from "./sign-in";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, {
    kind: "idle",
  } satisfies SignInState);

  return (
    <form
      action={formAction}
      aria-label="Sign in"
      className="bg-card flex w-full max-w-[380px] flex-col gap-y-3 border p-7"
    >
      <div className="flex flex-col gap-y-1">
        <span className="text-primary font-[family-name:var(--cc-font-display)] text-xl font-bold tracking-[0.04em]">
          CC//
        </span>
        <span className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase">
          CC.LIYUXUAN.DEV · RESTRICTED
        </span>
      </div>
      <CcField label="EMAIL" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="cc-input"
        />
      </CcField>
      <CcField label="PASSWORD" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="cc-input"
        />
      </CcField>
      {state.kind === "error" && (
        <p role="alert" className="text-cc-warn">
          {state.message}
        </p>
      )}
      <CcButton type="submit" variant="primary" disabled={isPending}>
        {isPending ? "SIGNING IN…" : "SIGN IN"}
      </CcButton>
      <span className="text-muted-foreground text-[11px]">
        No sign-up. Only one email is allowed in.
      </span>
    </form>
  );
}
