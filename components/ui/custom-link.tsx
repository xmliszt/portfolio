'use client';

import { isMobile, isTablet } from 'react-device-detect';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export function CustomLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className='group relative inline-block w-fit [&>*]:cursor-alias'>
      <Link
        href={href}
        className={cn(
          isMobile || isTablet ? 'underline underline-offset-2' : 'no-underline'
        )}
      >
        {children}
      </Link>
      <span
        className={cn(
          'absolute bottom-0 left-0 rounded-full bg-foreground',
          'h-0 w-0 opacity-0 transition-[opacity_width] duration-300 ease-in-out group-hover:h-[1px] group-hover:w-full group-hover:opacity-100'
        )}
      ></span>
    </div>
  );
}
