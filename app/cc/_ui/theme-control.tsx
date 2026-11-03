"use client";

import { useContext } from "react";

import { CC_THEME_PREFERENCES } from "@/lib/cc/theme/cc-theme";
import { cn } from "@/lib/utils";

import { CcThemeContext } from "./cc-theme-context";

const LABELS = { auto: "AUTO", light: "LIGHT", dark: "DARK" } as const;

export function ThemeControl() {
  const context = useContext(CcThemeContext);
  if (context === undefined) return null;

  return (
    <div role="group" aria-label="Theme" className="flex w-fit border">
      {CC_THEME_PREFERENCES.map((preference) => (
        <button
          key={preference}
          type="button"
          aria-pressed={context.preference === preference}
          onClick={() => context.setPreference(preference)}
          className={cn(
            "h-6 px-2 text-[10.5px] font-semibold tracking-[0.04em] not-first:border-l",
            context.preference === preference
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LABELS[preference]}
        </button>
      ))}
    </div>
  );
}
