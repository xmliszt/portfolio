"use client";

import { cn, isAtCurrentTOC, normalizeTOCHash } from "@/lib/utils";

import { useTOC } from "./toc-provider";

type TOCLinkProps = {
  entry: Page["toc"][0];
};

export function TOCLink(props: TOCLinkProps) {
  const { hash, setHash } = useTOC();
  const url =
    props.entry.url && props.entry.url.startsWith("#")
      ? props.entry.url
      : `#${props.entry.url}`;
  const targetHash = normalizeTOCHash(url);

  return (
    <a
      href={url}
      className={cn(
        "text-xs",
        isAtCurrentTOC(hash, url)
          ? "font-semibold"
          : "font-normal"
      )}
      onClick={(event) => {
        event.preventDefault();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("toc:navigate", { detail: { hash: targetHash } })
          );
        }
        setHash(targetHash);
        const target = document.getElementById(targetHash);
        if (target) {
          try {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          } catch {
            target.scrollIntoView();
          }
        }
        if (typeof window !== "undefined") {
          const nextUrl = `${window.location.pathname}${window.location.search}#${targetHash}`;
          window.history.replaceState(null, "", nextUrl);
        }
      }}
    >
      {props.entry.title}
    </a>
  );
}
