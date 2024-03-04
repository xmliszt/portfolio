'use client';

import { isMobile, isTablet } from 'react-device-detect';

import { cn } from '@/lib/utils';

type ShadowSubtitleProps = {
  children: React.ReactNode;
};

export function ShadowSubtitle(props: ShadowSubtitleProps) {
  return (
    <h2
      className={cn(
        'absolute -bottom-8 left-0 -z-10 m-0 origin-top text-3xl font-bold text-muted-foreground [mask:linear-gradient(transparent_2%,black_98%)]',
        isMobile || isTablet
          ? 'skew-x-[30deg] scale-y-100 opacity-75'
          : 'skew-x-0 scale-y-0 opacity-0',
        'transition-[opacity_transform] duration-300 ease-out group-hover:skew-x-[30deg] group-hover:scale-y-100 group-hover:opacity-75'
      )}
    >
      {props.children}
    </h2>
  );
}
