"use client";

import { useEffect, useId, useRef, useState } from "react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { useUiSound } from "@/app/paws/_room/use-ui-sound";
import type { PawsCopy } from "@/lib/paws/i18n/paws-copy";
import { fillCopy } from "@/lib/paws/maker/fill-copy";
import { CODE_LENGTH, readCodeInput } from "@/lib/paws/maker/read-code-input";
import type { PawsSessionActions } from "@/lib/paws/session-types";
import { cn } from "@/lib/utils";

import { CodeBoxes } from "./code-boxes";
import { FloatingCard } from "./floating-card";
import { FOCUS_RING_CLASS } from "./focus-ring-class";
import { RisoButton } from "./riso-button";
import { TEXT_FIELD_CLASS } from "./text-field-class";

type Notice = "tooSoon" | "sendFailed" | "wrongCode" | "verifyFailed";

type SignInStep =
  | { kind: "email"; busy: boolean; notice: Notice | undefined }
  | {
      kind: "code";
      busy: "sending" | "verifying" | undefined;
      notice: Notice | undefined;
    };

function noticeText(options: { copy: PawsCopy; notice: Notice }) {
  const { copy, notice } = options;
  switch (notice) {
    case "tooSoon":
      return copy.signIn.tooSoon;
    case "sendFailed":
      return copy.signIn.sendFailed;
    case "wrongCode":
      return copy.signIn.wrongCode;
    case "verifyFailed":
      return copy.signIn.verifyFailed;
    default: {
      const unhandled: never = notice;
      return unhandled;
    }
  }
}

type SignInPanelProps = {
  actions: PawsSessionActions;
  message: string | undefined;
  onClose: () => void;
};

/** Render the corner card that signs a visitor in with a 6-digit code sent to their email. */
export function SignInPanel(props: SignInPanelProps) {
  const playUi = useUiSound();
  const { copy } = usePawsCopy();

  const emailId = useId();
  const codeId = useId();
  const noticeId = useId();
  const formId = useId();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [step, setStep] = useState<SignInStep>({
    kind: "email",
    busy: false,
    notice: undefined,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = step.kind === "email" ? step.busy : step.busy !== undefined;

  useEffect(() => {
    if (!isBusy && document.activeElement === document.body)
      inputRef.current?.focus();
  }, [isBusy]);

  async function sendCode(options: { from: SignInStep["kind"] }) {
    setStep(
      options.from === "email"
        ? { kind: "email", busy: true, notice: undefined }
        : { kind: "code", busy: "sending", notice: undefined }
    );
    const result = await props.actions.sendEmailCode({ email: email.trim() });
    playUi(result.kind === "sent" ? "codeSent" : "refused");
    switch (result.kind) {
      case "sent":
        setCode("");
        setStep({ kind: "code", busy: undefined, notice: undefined });
        return;
      case "tooSoon":
      case "failed": {
        const notice = result.kind === "tooSoon" ? "tooSoon" : "sendFailed";
        setStep(
          options.from === "email"
            ? { kind: "email", busy: false, notice }
            : { kind: "code", busy: undefined, notice }
        );
        return;
      }
      default: {
        const unhandled: never = result;
        return unhandled;
      }
    }
  }

  async function verifyCode(typed: string) {
    setStep({ kind: "code", busy: "verifying", notice: undefined });
    const result = await props.actions.verifyEmailCode({
      email: email.trim(),
      code: typed,
    });
    playUi(result.kind === "verified" ? "signedIn" : "refused");
    switch (result.kind) {
      case "verified":
        return;
      case "wrongCode":
        setCode("");
        setStep({ kind: "code", busy: undefined, notice: "wrongCode" });
        return;
      case "failed":
        setCode("");
        setStep({ kind: "code", busy: undefined, notice: "verifyFailed" });
        return;
      default: {
        const unhandled: never = result;
        return unhandled;
      }
    }
  }

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const typed = readCodeInput(event.target.value);
    setCode(typed);
    if (typed.length === CODE_LENGTH && typed !== code) void verifyCode(typed);
  }

  function handleCodeFocus() {
    setIsCodeFocused(true);
  }

  function handleCodeBlur() {
    setIsCodeFocused(false);
  }

  function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendCode({ from: "email" });
  }

  function handleCodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (code.length === CODE_LENGTH) void verifyCode(code);
  }

  function handleResend() {
    void sendCode({ from: "code" });
  }

  function handleChangeEmail() {
    setCode("");
    setStep({ kind: "email", busy: false, notice: undefined });
  }

  const notice = step.notice && (
    <p
      id={noticeId}
      role="alert"
      className="border-l-[3px] border-[var(--pw-pink)] pl-2"
    >
      {noticeText({ copy, notice: step.notice })}
    </p>
  );

  return (
    <FloatingCard
      title={copy.signIn.title}
      onClose={props.onClose}
      footer={
        step.kind === "email" ? (
          <RisoButton
            variant="primary"
            type="submit"
            form={formId}
            disabled={step.busy}
          >
            {step.busy ? copy.signIn.sending : copy.signIn.sendCode}
          </RisoButton>
        ) : (
          <RisoButton
            variant="primary"
            type="submit"
            form={formId}
            disabled={step.busy !== undefined || code.length !== CODE_LENGTH}
          >
            {step.busy === "verifying"
              ? copy.signIn.verifying
              : copy.signIn.verify}
          </RisoButton>
        )
      }
    >
      {props.message && (
        <p className="text-[var(--pw-ink-soft)]">{props.message}</p>
      )}
      {(() => {
        switch (step.kind) {
          case "email":
            return (
              <form
                id={formId}
                onSubmit={handleEmailSubmit}
                className="flex flex-col gap-y-3"
              >
                <p className="text-[var(--pw-ink-soft)]">{copy.signIn.hint}</p>
                <div className="flex flex-col gap-y-1">
                  <label
                    htmlFor={emailId}
                    className="text-[12px] text-[var(--pw-ink-soft)]"
                  >
                    {copy.signIn.emailLabel}
                  </label>
                  <input
                    ref={inputRef}
                    id={emailId}
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    spellCheck={false}
                    placeholder={copy.signIn.emailPlaceholder}
                    value={email}
                    disabled={step.busy}
                    aria-describedby={step.notice ? noticeId : undefined}
                    onChange={handleEmailChange}
                    className={TEXT_FIELD_CLASS}
                  />
                </div>
                {notice}
              </form>
            );
          case "code":
            return (
              <form
                id={formId}
                onSubmit={handleCodeSubmit}
                className="flex flex-col gap-y-3"
              >
                <p role="status" className="break-words">
                  {fillCopy({
                    template: copy.signIn.codeSent,
                    values: { email: email.trim() },
                  })}
                </p>
                <div className="flex flex-col gap-y-1">
                  <label
                    htmlFor={codeId}
                    className="text-[12px] text-[var(--pw-ink-soft)]"
                  >
                    {copy.signIn.codeLabel}
                  </label>
                  <div className="relative">
                    <CodeBoxes
                      code={code}
                      focused={isCodeFocused && step.busy === undefined}
                      invalid={step.notice === "wrongCode"}
                      disabled={step.busy !== undefined}
                    />
                    <input
                      ref={inputRef}
                      id={codeId}
                      type="text"
                      required
                      autoFocus
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern={`[0-9]{${CODE_LENGTH}}`}
                      value={code}
                      disabled={step.busy !== undefined}
                      aria-describedby={step.notice ? noticeId : undefined}
                      aria-invalid={step.notice === "wrongCode"}
                      onChange={handleCodeChange}
                      onFocus={handleCodeFocus}
                      onBlur={handleCodeBlur}
                      className="absolute inset-0 size-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent outline-none selection:bg-transparent"
                    />
                  </div>
                </div>
                {notice}
                <div className="flex flex-wrap items-center gap-x-2 text-[12px]">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={step.busy !== undefined}
                    className={cn(
                      FOCUS_RING_CLASS,
                      "py-2 underline underline-offset-2 disabled:opacity-50"
                    )}
                  >
                    {step.busy === "sending"
                      ? copy.signIn.sending
                      : copy.signIn.resend}
                  </button>
                  <span aria-hidden className="text-[var(--pw-ink-soft)]">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    disabled={step.busy !== undefined}
                    className={cn(
                      FOCUS_RING_CLASS,
                      "py-2 text-[var(--pw-ink-soft)] underline underline-offset-2 disabled:opacity-50"
                    )}
                  >
                    {copy.signIn.changeEmail}
                  </button>
                </div>
              </form>
            );
          default: {
            const unhandled: never = step;
            return unhandled;
          }
        }
      })()}
    </FloatingCard>
  );
}
