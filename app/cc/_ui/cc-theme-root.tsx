"use client";

import { useEffect, useState } from "react";

import {
  CC_THEME_COOKIE,
  type CcTheme,
  type CcThemePreference,
} from "@/lib/cc/theme/cc-theme";
import { resolveTheme } from "@/lib/cc/theme/resolve-theme";

import { CcThemeContext } from "./cc-theme-context";

type CcThemeRootProps = {
  preference: CcThemePreference;
  theme: CcTheme;
  className: string;
  children: React.ReactNode;
};

const CLOCK_CHECK_MS = 60_000;

export function CcThemeRoot(props: CcThemeRootProps) {
  const [preference, setPreferenceState] = useState(props.preference);
  const [theme, setTheme] = useState(props.theme);

  useEffect(() => {
    function update() {
      setTheme(resolveTheme({ preference, now: new Date() }));
    }
    update();
    if (preference !== "auto") return;
    const interval = setInterval(update, CLOCK_CHECK_MS);
    return () => clearInterval(interval);
  }, [preference]);

  function setPreference(next: CcThemePreference) {
    document.cookie = `${CC_THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setPreferenceState(next);
  }

  return (
    <CcThemeContext.Provider value={{ preference, setPreference }}>
      <div data-theme={theme} className={props.className}>
        {props.children}
      </div>
    </CcThemeContext.Provider>
  );
}
