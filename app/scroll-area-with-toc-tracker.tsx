"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useTOC } from "@/components/custom/toc/toc-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { slugify } from "@/lib/utils";

type ScrollAreaWithTOCTrackerProps = { children: React.ReactNode };

export function ScrollAreaWithTOCTracker(props: ScrollAreaWithTOCTrackerProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { setHash } = useTOC();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (scrollerRef.current?.scrollTop ?? 0 > 0) {
      scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  return (
    <ScrollArea
      ref={scrollerRef}
      className="h-screen w-screen"
      onScroll={() => {
        const anchors = document.querySelectorAll('a[id^="anchor:"]');
        anchors.forEach((anchor) => {
          // Get the top position of the anchor
          const rect = anchor.getBoundingClientRect();
          if (rect.top > 0 && rect.top < 50) {
            const location = window.location.toString().split("#")[0];
            const newHash = slugify(anchor.innerHTML);
            console.log("newHash", newHash);
            setHash(newHash);
            router.replace(`${location}#${newHash}`, { scroll: false });
          }
        });
      }}
    >
      {props.children}
    </ScrollArea>
  );
}
