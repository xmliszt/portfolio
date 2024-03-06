'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useTOC } from '@/components/custom/toc/toc-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { slugify } from '@/lib/utils';

type ScrollAreaWithTOCTrackerProps = {
  children: React.ReactNode;
};

export function ScrollAreaWithTOCTracker(props: ScrollAreaWithTOCTrackerProps) {
  const { setHash } = useTOC();
  const anchors = useRef<NodeListOf<HTMLAnchorElement> | null>(null);
  const router = useRouter();

  return (
    <ScrollArea
      className='h-screen w-screen'
      onLoad={() => {
        anchors.current = document.querySelectorAll('a[id^="anchor:"]');
      }}
      onScroll={() => {
        anchors.current?.forEach((anchor) => {
          // Get the top position of the anchor
          const rect = anchor.getBoundingClientRect();
          if (rect.top > 0 && rect.top < 50) {
            const location = window.location.toString().split('#')[0];
            const newHash = slugify(anchor.innerHTML);
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
