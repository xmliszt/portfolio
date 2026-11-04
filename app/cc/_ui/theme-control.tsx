"use client";

import { useContext } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { CC_THEME_PREFERENCES } from "@/lib/cc/theme/cc-theme";
import { cn } from "@/lib/utils";

import { CcThemeContext } from "./cc-theme-context";

const OPTIONS = {
  auto: { label: "Auto", Icon: Monitor },
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
} as const;

export function ThemeControl() {
  const context = useContext(CcThemeContext);
  if (context === undefined) return null;

  return (
    <div
      role="group"
      aria-label="Theme"
      className="grid w-full grid-cols-3 border"
    >
      {CC_THEME_PREFERENCES.map((preference) => {
        const { label, Icon } = OPTIONS[preference];
        return (
          <button
            key={preference}
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={context.preference === preference}
            onClick={() => context.setPreference(preference)}
            className={cn(
              "flex h-6 items-center justify-center not-first:border-l",
              context.preference === preference
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
