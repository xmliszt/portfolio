"use client";

import { useLaundromatCopy } from "./i18n/use-laundromat-copy";

/** Render the laundromat's screen-reader heading and introduction in the visitor's language. */
export function LaundromatIntro() {
  const { copy } = useLaundromatCopy();
  return (
    <>
      <h1 className="sr-only">{copy.site.name}</h1>
      <p className="sr-only">{copy.site.intro}</p>
    </>
  );
}
