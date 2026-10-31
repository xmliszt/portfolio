"use client";

import {
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

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
    }
  | { kind: "voice"; look: CatLook; voice: VoiceSettings };

export type PawsOnboardingHandle = { start: () => void };

type PawsOnboardingProps = {
  session: PawsSession;
  actions: PawsSessionActions;
  handleRef: RefObject<PawsOnboardingHandle | undefined>;
  onBringCatIn: (cat: SavedCat) => void;
};

/** Render the corner flow that takes a watcher through sign-in, making a cat and picking its voice, then hands the saved cat over; `start`, exposed through `handleRef`, opens it, and for a member with a cat it reopens the same flow to change the look and the voice. */
export function PawsOnboarding(props: PawsOnboardingProps) {
  const playUi = useUiSound();
  const { copy } = usePawsCopy();

  const [step, setStep] = useState<OnboardingStep>({ kind: "watching" });
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

  useImperativeHandle(props.handleRef, () => ({ start: handleStart }));

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
            });
            return;
          case "none":
            setStep({
              kind: "maker",
              look: shuffleCatLook({ random: Math.random }),
              voice: DEFAULT_VOICE,
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
    setStep({ kind: "watching" });
  }

  function finish(cat: SavedCat) {
    flowRef.current += 1;
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

  function handleLookChange(look: CatLook) {
    if (step.kind === "maker") setStep({ ...step, look });
  }

  function handleMakerPrimary() {
    if (step.kind !== "maker") return;
    playUi("stepNext");
    setStep({ kind: "voice", look: step.look, voice: step.voice });
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
    });
  }

  function handleSignInRequired() {
    void requireSignIn();
  }

  if (session.kind === "loading") return null;

  switch (step.kind) {
    case "watching":
      return null;
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
