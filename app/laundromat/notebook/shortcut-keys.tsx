"use client";

import { useEffect, useState } from "react";

const MAC_PLATFORM = /Mac|iPhone|iPad/;

/** Draw the leave-note shortcut as key caps in the system font. */
export function ShortcutKeys() {
  const [modifier, setModifier] = useState("⌘");

  useEffect(() => {
    if (!MAC_PLATFORM.test(navigator.platform)) setModifier("ctrl");
  }, []);

  return (
    <span className="inline-flex translate-y-[-0.5px] items-center gap-x-[3px] align-middle">
      {[modifier, "↵"].map((key) => (
        <kbd
          key={key}
          className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-[4px] border border-[var(--lm-detail)] px-[4px] font-sans text-[11px] leading-none normal-case"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
