"use client";

import { useEffect, useState } from "react";

import type { RevealStep } from "@/lib/paws/chat/get-reveal-steps";

type RevealedTextProps = {
  text: string;
  steps: RevealStep[];
};

/** Render `text` showing more of it at each of `steps`, keeping the hidden rest in place so the bubble keeps its size. */
export function RevealedText(props: RevealedTextProps) {
  const [shown, setShown] = useState(0);
  const characters = Array.from(props.text);

  useEffect(() => {
    const timers = props.steps.map((step) =>
      window.setTimeout(() => setShown(step.characters), step.atMs)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [props.steps]);

  return (
    <>
      <span className="sr-only">{props.text}</span>
      <span aria-hidden>
        {characters.slice(0, shown).join("")}
        <span className="opacity-0">{characters.slice(shown).join("")}</span>
      </span>
    </>
  );
}
