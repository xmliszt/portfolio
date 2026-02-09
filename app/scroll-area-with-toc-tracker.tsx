"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useTOC } from "@/components/custom/toc/toc-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { normalizeTOCHash } from "@/lib/utils";

type ScrollAreaWithTOCTrackerProps = { children: React.ReactNode };

export function ScrollAreaWithTOCTracker(props: ScrollAreaWithTOCTrackerProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { hash, setHash } = useTOC();
  const ignoreScrollUntilRef = useRef(0);
  const targetHashRef = useRef<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (scrollerRef.current?.scrollTop ?? 0 > 0) {
      scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentHash = normalizeTOCHash(window.location.hash);
    if (currentHash) {
      setHash(currentHash);
    }
  }, [pathname, setHash]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ hash?: string }>).detail;
      if (!detail?.hash) return;

      targetHashRef.current = detail.hash;
      ignoreScrollUntilRef.current = performance.now() + 800;
    };

    window.addEventListener("toc:navigate", handleNavigate);
    return () => window.removeEventListener("toc:navigate", handleNavigate);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!scrollerRef.current) return;
    if (normalizeTOCHash(window.location.hash)) return;

    const syncFirstAnchor = () => {
      if (!scrollerRef.current) return;
      if (scrollerRef.current.scrollTop > 1) return;

      const anchors = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-toc-anchor="true"][id^="anchor:"]'
        )
      );
      const firstAnchorId = anchors[0]?.getAttribute("id") ?? "";
      if (!firstAnchorId || firstAnchorId === hash) return;

      const location = window.location.toString().split("#")[0];
      setHash(firstAnchorId);
      router.replace(`${location}#${firstAnchorId}`, { scroll: false });
    };

    const frame = window.requestAnimationFrame(syncFirstAnchor);
    return () => window.cancelAnimationFrame(frame);
  }, [hash, pathname, router, setHash]);

  return (
    <ScrollArea
      ref={scrollerRef}
      className="h-screen w-screen"
      onScroll={(event) => {
        const now = performance.now();
        const anchors: HTMLElement[] = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[data-toc-anchor="true"][id^="anchor:"]'
          )
        );

        if (anchors.length === 0) return;

        const viewport = event.currentTarget as HTMLElement;
        const scrollTop = viewport.scrollTop;
        const remaining = viewport.scrollHeight - scrollTop - viewport.clientHeight;
        if (scrollTop <= 1) {
          const firstAnchorId = anchors[0]?.getAttribute("id") ?? "";
          if (!firstAnchorId || firstAnchorId === hash) return;
          const location = window.location.toString().split("#")[0];
          setHash(firstAnchorId);
          router.replace(`${location}#${firstAnchorId}`, { scroll: false });
          return;
        }

        if (remaining <= 1) {
          const lastAnchorId = anchors.at(-1)?.getAttribute("id") ?? "";
          if (!lastAnchorId || lastAnchorId === hash) return;
          const location = window.location.toString().split("#")[0];
          setHash(lastAnchorId);
          router.replace(`${location}#${lastAnchorId}`, { scroll: false });
          return;
        }

        let bestAnchor: HTMLElement | null = null;
        let bestTop = Number.POSITIVE_INFINITY;
        let lastAboveAnchor: HTMLElement | null = null;
        let lastAboveTop = Number.NEGATIVE_INFINITY;

        for (const anchor of anchors) {
          const top = anchor.getBoundingClientRect().top;
          if (top >= 0 && top < bestTop) {
            bestTop = top;
            bestAnchor = anchor;
          }

          if (top < 0 && top > lastAboveTop) {
            lastAboveTop = top;
            lastAboveAnchor = anchor;
          }
        }

        const activeAnchor = bestAnchor ?? lastAboveAnchor;
        if (!activeAnchor) return;

        const newHash = activeAnchor.getAttribute("id") ?? "";
        if (!newHash) return;
        if (newHash === hash) return;

        if (
          targetHashRef.current &&
          now < ignoreScrollUntilRef.current &&
          newHash !== targetHashRef.current
        ) {
          return;
        }

        if (newHash === targetHashRef.current) {
          targetHashRef.current = null;
        }

        const location = window.location.toString().split("#")[0];
        setHash(newHash);
        router.replace(`${location}#${newHash}`, { scroll: false });
      }}
    >
      {props.children}
    </ScrollArea>
  );
}
