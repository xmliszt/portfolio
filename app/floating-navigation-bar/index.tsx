'use client';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { MusicNote } from '@phosphor-icons/react/dist/ssr';
import {
  FloatingNavigationProvider,
  useFloatingNavigation,
} from './floating-navigation-provider';

type FloatingNavigationBarProps = {
  children: React.ReactNode;
};

export function FloatingNavigationBar(props: FloatingNavigationBarProps) {
  const { isOpen, setIsOpen } = useFloatingNavigation();
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DrawerTrigger
        asChild
        className={cn(
          'fixed z-50 bottom-10 left-4',
          'block md:hidden',
          'cursor-pointer group hover:rotate-[30deg] hover:scale-110 transition-transform ease-in-out duration-300'
        )}
      >
        <div className='border rounded-full p-2 bg-secondary opacity-70 text-secondary-foreground shadow-lg'>
          <MusicNote className='group-hover:scale-110 transition-transform ease-in-out duration-300' />
        </div>
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'rounded-none rounded-t-lg focus-visible:outline-none',
          // hide the drawer handle
          '[&>*:first-child]:hidden'
        )}
      >
        {/* Custom drawer handle */}
        <div className='mx-auto mt-2 h-1 w-[60px] rounded-full bg-foreground'></div>
        <nav className='flex flex-col gap-2 p-3'>{props.children}</nav>
      </DrawerContent>
    </Drawer>
  );
}
