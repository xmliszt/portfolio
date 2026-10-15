"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

/** Set every `theme-color` meta tag to the `html` background of the active theme, and restore the tags on unmount. */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (resolvedTheme === undefined) return;
    const originals = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    ).map((meta) => ({ meta, content: meta.content, media: meta.media }));
    // next-themes applies the theme class in its own effect, which runs after this one.
    const frame = requestAnimationFrame(() => {
      const color = getComputedStyle(document.documentElement).backgroundColor;
      for (const original of originals) {
        original.meta.content = color;
        original.meta.removeAttribute("media");
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      for (const original of originals) {
        original.meta.content = original.content;
        if (original.media !== "") original.meta.media = original.media;
      }
    };
  }, [resolvedTheme, pathname]);

  return null;
}
