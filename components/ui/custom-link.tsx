import { cn } from '@/lib/utils';
import Link from 'next/link';

export function CustomLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className='relative group [&>*]:cursor-alias'>
      <Link href={href}>{children}</Link>
      <span
        className={cn(
          'absolute bottom-0 bg-foreground rounded-full',
          'group-hover:opacity-100 group-hover:w-full group-hover:h-[2px] opacity-0 transition-[opacity_width] ease-in-out duration-300 w-0 h-0'
        )}
      ></span>
    </div>
  );
}
