"use client";

import { useEffect, useState } from "react";

const MAC_PLATFORM = /Mac|iPhone|iPad/;
const MOD_KEY = "mod";

type ShortcutHintProps = {
  keys: string[];
  label: string | undefined;
};

/** Draw `keys` as key caps in the system font, followed by `label`; `"mod"` shows as ⌘ on Apple platforms and ctrl elsewhere. */
export function ShortcutHint(props: ShortcutHintProps) {
  const [modifier, setModifier] = useState("⌘");

  useEffect(() => {
    if (!MAC_PLATFORM.test(navigator.platform)) setModifier("ctrl");
  }, []);

  return (
    <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap">
      <span className="inline-flex translate-y-[-0.5px] items-center gap-x-[3px] align-middle">
        {props.keys.map((key) => (
          <kbd
            key={key}
            className="inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-[4px] border border-[var(--lm-detail)] px-[4px] font-sans text-[11px] leading-none normal-case"
          >
            {key === MOD_KEY ? modifier : key}
          </kbd>
        ))}
      </span>
      {props.label === undefined ? null : <span>{props.label}</span>}
    </span>
  );
}
