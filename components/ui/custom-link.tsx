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
    <div className='relative w-fit group [&>*]:cursor-alias'>
      <Link href={href}>{children}</Link>
      <span
        className={cn(
          'absolute bottom-0 left-0 bg-foreground rounded-full',
          'group-hover:opacity-100 group-hover:w-full group-hover:h-[1px] opacity-0 transition-[opacity_width] ease-in-out duration-300 w-0 h-0'
        )}
      ></span>
    </div>
  );
}
