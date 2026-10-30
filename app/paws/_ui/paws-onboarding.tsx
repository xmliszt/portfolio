"use client";

import { useEffect, useId, useRef, useState } from "react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { useUiSound } from "@/app/paws/_room/use-ui-sound";
import type { SavedCat } from "@/lib/paws/cat-api-types";
import type { CatLook } from "@/lib/paws/cat-look";
import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import type { PawsSession, PawsSessionActions } from "@/lib/paws/session-types";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

import { CatMaker } from "./cat-maker";
import { fetchSavedCat } from "./fetch-saved-cat";
import { FloatingCard } from "./floating-card";
import { putCat } from "./put-cat";
import { RisoButton } from "./riso-button";
import { SignInPanel } from "./sign-in-panel";
import { VoiceStep } from "./voice-step";

const DEFAULT_VOICE = {
  age: "adult",
  voice: "soft",
  mood: "chatty",
} satisfies VoiceSettings;

type OnboardingStep =
  | { kind: "watching" }
  | { kind: "signIn"; message: string | undefined }
  | { kind: "loadingCat"; failed: boolean }
  | {
      kind: "maker";
      look: CatLook;
      voice: VoiceSettings;
      hasOwnMeow: boolean;
      busy: boolean;
      notice: string | undefined;
    }
  | { kind: "voice"; look: CatLook; voice: VoiceSettings };

type PawsOnboardingProps = {
  session: PawsSession;
  actions: PawsSessionActions;
  hasCat: boolean;
  onBringCatIn: (cat: SavedCat) => void;
};

/** Render the corner flow that takes a watcher through sign-in, making a cat and giving it a sound, then hands the saved cat over; with `hasCat`, it reopens the same flow so a member can change the look or give a borrowed meow its own sound. */
export function PawsOnboarding(props: PawsOnboardingProps) {
  const playUi = useUiSound();
  const { copy } = usePawsCopy();

  const [step, setStep] = useState<OnboardingStep>({ kind: "watching" });
  const startButtonId = useId();
  const shouldFocusStartRef = useRef(false);
  const flowRef = useRef(0);
  const signOutRef = useRef(props.actions.signOut);
  const session = props.session;
  const accessToken =
    session.kind === "member" ? session.accessToken : undefined;
  const isLoadingCat = step.kind === "loadingCat" && !step.failed;

  if (step.kind === "signIn" && session.kind === "member") {
    setStep({ kind: "loadingCat", failed: false });
  }
  if (
    (step.kind === "loadingCat" ||
      step.kind === "maker" ||
      step.kind === "voice") &&
    session.kind === "guest"
  ) {
    setStep({ kind: "signIn", message: undefined });
  }

  useEffect(() => {
    signOutRef.current = props.actions.signOut;
  }, [props.actions.signOut]);

  useEffect(() => {
    if (step.kind !== "watching" || !shouldFocusStartRef.current) return;
    shouldFocusStartRef.current = false;
    document.getElementById(startButtonId)?.focus();
  }, [step.kind, startButtonId]);

  useEffect(() => {
    if (!isLoadingCat || accessToken === undefined) return;
    const controller = new AbortController();
    void fetchSavedCat({ accessToken, signal: controller.signal }).then(
      (response) => {
        if (controller.signal.aborted) return;
        switch (response.kind) {
          case "found":
            setStep({
              kind: "maker",
              look: response.cat.look,
              voice: response.cat.voice,
              hasOwnMeow: response.cat.hasOwnMeow,
              busy: false,
              notice: undefined,
            });
            return;
          case "none":
            setStep({
              kind: "maker",
              look: shuffleCatLook({ random: Math.random }),
              voice: DEFAULT_VOICE,
              hasOwnMeow: false,
              busy: false,
              notice: undefined,
            });
            return;
          case "unreachable":
            setStep({ kind: "loadingCat", failed: true });
            return;
          case "signInRequired":
            void signOutRef.current().then(() => {
              if (!controller.signal.aborted)
                setStep({ kind: "signIn", message: copy.signIn.signInAgain });
            });
            return;
          default: {
            const unhandled: never = response;
            return unhandled;
          }
        }
      }
    );
    return () => controller.abort();
  }, [isLoadingCat, accessToken]);

  async function requireSignIn() {
    const flow = flowRef.current;
    await signOutRef.current();
    if (flow === flowRef.current)
      setStep({ kind: "signIn", message: copy.signIn.signInAgain });
  }

  function close() {
    flowRef.current += 1;
    shouldFocusStartRef.current = true;
    setStep({ kind: "watching" });
  }

  function finish(cat: SavedCat) {
    flowRef.current += 1;
    shouldFocusStartRef.current = true;
    setStep({ kind: "watching" });
    props.onBringCatIn(cat);
  }

  function handleStart() {
    setStep(
      session.kind === "member"
        ? { kind: "loadingCat", failed: false }
        : { kind: "signIn", message: undefined }
    );
  }

  function handleRetryLoad() {
    setStep({ kind: "loadingCat", failed: false });
  }

  async function keepLookAndBringIn(options: {
    look: CatLook;
    voice: VoiceSettings;
    accessToken: string;
  }) {
    const flow = flowRef.current;
    setStep({
      kind: "maker",
      look: options.look,
      voice: options.voice,
      hasOwnMeow: true,
      busy: true,
      notice: undefined,
    });
    const response = await putCat({
      accessToken: options.accessToken,
      cat: { look: options.look, voice: options.voice },
    });
    if (flow !== flowRef.current) return;
    switch (response.kind) {
      case "saved":
        finish(response.cat);
        return;
      case "signInRequired":
        await requireSignIn();
        return;
      case "invalid":
      case "unreachable":
        playUi("refused");
        setStep({
          kind: "maker",
          look: options.look,
          voice: options.voice,
          hasOwnMeow: true,
          busy: false,
          notice: copy.maker.saveFailed,
        });
        return;
      default: {
        const unhandled: never = response;
        return unhandled;
      }
    }
  }

  function handleLookChange(look: CatLook) {
    if (step.kind === "maker") setStep({ ...step, look, notice: undefined });
  }

  function handleMakerPrimary() {
    if (step.kind !== "maker") return;
    if (!step.hasOwnMeow) {
      playUi("stepNext");
      setStep({ kind: "voice", look: step.look, voice: step.voice });
    } else if (accessToken)
      void keepLookAndBringIn({
        look: step.look,
        voice: step.voice,
        accessToken,
      });
  }

  function handleVoiceChange(voice: VoiceSettings) {
    playUi("optionPick");
    if (step.kind === "voice") setStep({ ...step, voice });
  }

  function handleBackToMaker() {
    if (step.kind !== "voice") return;
    playUi("stepNext");
    setStep({
      kind: "maker",
      look: step.look,
      voice: step.voice,
      hasOwnMeow: false,
      busy: false,
      notice: undefined,
    });
  }

  function handleSignInRequired() {
    void requireSignIn();
  }

  if (session.kind === "loading") return null;

  switch (step.kind) {
    case "watching":
      return (
        <div className="pointer-events-auto absolute bottom-4 left-4 z-10 sm:bottom-6 sm:left-6">
          <RisoButton
            variant="primary"
            id={startButtonId}
            onClick={handleStart}
          >
            {session.kind !== "member"
              ? copy.watch.signInToBring
              : props.hasCat
                ? copy.watch.yourCat
                : copy.watch.bringYourCat}
          </RisoButton>
        </div>
      );
    case "signIn":
      return (
        <SignInPanel
          actions={props.actions}
          message={step.message}
          onClose={close}
        />
      );
    case "loadingCat":
      return (
        <FloatingCard
          title={copy.maker.title}
          onClose={close}
          footer={
            step.failed && (
              <RisoButton variant="primary" onClick={handleRetryLoad}>
                {copy.common.tryAgain}
              </RisoButton>
            )
          }
        >
          <p
            role="status"
            className={
              step.failed
                ? "border-l-[3px] border-[var(--pw-pink)] pl-2"
                : "text-[var(--pw-ink-soft)]"
            }
          >
            {step.failed ? copy.maker.loadFailed : copy.maker.loading}
          </p>
        </FloatingCard>
      );
    case "maker":
      return (
        <CatMaker
          look={step.look}
          primaryLabel={step.hasOwnMeow ? copy.voice.bringIn : copy.maker.next}
          busy={step.busy}
          notice={step.notice}
          onLookChange={handleLookChange}
          onPrimary={handleMakerPrimary}
          onClose={close}
        />
      );
    case "voice":
      if (accessToken === undefined) return null;
      return (
        <VoiceStep
          accessToken={accessToken}
          look={step.look}
          voice={step.voice}
          onVoiceChange={handleVoiceChange}
          onBack={handleBackToMaker}
          onSignInRequired={handleSignInRequired}
          onBringCatIn={finish}
          onClose={close}
        />
      );
    default: {
      const unhandled: never = step;
      return unhandled;
    }
  }
}
