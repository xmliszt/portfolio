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
        'absolute -bottom-5 left-0 -z-10 m-0 skew-x-[30deg] text-3xl font-bold text-muted-foreground opacity-50 [mask:linear-gradient(transparent_10%,black_90%)]',
        isMobile || isTablet ? 'opacity-50' : 'opacity-0',
        'transition-opacity duration-300 ease-out group-hover:opacity-50'
      )}
    >
      {props.children}
    </h2>
  );
}
