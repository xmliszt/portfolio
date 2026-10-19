"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type NotebookFootnoteProps = {
  text: string;
  visible: boolean;
};

/** Draw `props.text` as a small line along the bottom of the screen, outside the scaled book. */
export function NotebookFootnote(props: NotebookFootnoteProps) {
  const [root, setRoot] = useState<Element>();

  useEffect(() => {
    setRoot(document.querySelector("[data-laundromat-root]") ?? document.body);
  }, []);

  if (root === undefined) return null;

  return createPortal(
    <p
      data-notebook
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 px-4 text-center font-[family-name:var(--lm-font-mono)] text-[11px] text-[var(--lm-ink)] transition-opacity duration-300",
        props.visible ? "opacity-60" : "opacity-0"
      )}
    >
      {props.text}
    </p>,
    root
  );
}
