'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';

import { cn } from '@/lib/utils';

import { useFloatingNavigation } from '../floating-navigation-bar/floating-navigation-provider';

type NavigationBarItemProps = {
  children: React.ReactNode;
  href: string;
};

export function NavigationBarItem(props: NavigationBarItemProps) {
  const segment = useSelectedLayoutSegment();
  const resolvedSegment =
    props.href === '/' ? 'about' : props.href.split('/')[1];
  const isCurrentPath = segment === resolvedSegment;
  const { isOpen, setIsOpen } = useFloatingNavigation();

  return (
    <Link
      href={props.href}
      className={cn(
        'rounded-lg p-2 transition-colors ease-out hover:bg-secondary',
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
