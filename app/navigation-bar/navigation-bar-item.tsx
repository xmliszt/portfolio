'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFloatingNavigation } from '../floating-navigation-bar/floating-navigation-provider';

type NavigationBarItemProps = {
  children: React.ReactNode;
  href: string;
};

export function NavigationBarItem(props: NavigationBarItemProps) {
  const pathname = usePathname();
  const isCurrentPath = pathname === props.href;
  const { isOpen, setIsOpen } = useFloatingNavigation();

  return (
    <Link
      href={props.href}
      className={cn(
        'p-2 rounded-lg hover:bg-secondary transition-colors ease-out',
        isCurrentPath ? 'font-bold' : 'font-normal'
      )}
      onClick={() => {
        isOpen && setIsOpen(false);
      }}
    >
      {props.children}
    </Link>
  );
}
