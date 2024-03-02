'use client';

import { MusicNote } from '@phosphor-icons/react/dist/ssr';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

import { ThemeSwitch } from '../theme-switch';

import { useFloatingNavigation } from './floating-navigation-provider';

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
          'fixed z-50 bottom-10 left-4 md:left-10',
          'block md:hidden',
          'cursor-pointer'
        )}
      >
        <div className='group size-10'>
          <div
            className={cn(
              'z-20 w-full h-full flex justify-center items-center absolute',
              'transition-transform ease-in-out duration-300 group-hover:scale-90 group-hover:rotate-[360deg]'
            )}
          >
            <MusicNote size={24} />
          </div>
          <div
            className={cn(
              'z-10 w-full h-full border rounded-full p-2 backdrop-blur-lg text-secondary-foreground shadow-sm',
              'group-hover:scale-105 group-hover:bg-background group-hover:shadow-lg transition-[transform_background_box-shadow] ease-in-out duration-300'
            )}
          ></div>
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
        <div className='mb-8 cursor-grab mx-auto mt-2 h-1 w-[60px] rounded-full bg-foreground'></div>
        {/* Theme switch */}
        <div className='absolute z-10 top-4 right-4'>
          <ThemeSwitch />
        </div>
        {/* Navigation items */}
        <nav className='flex flex-col gap-2 p-3'>{props.children}</nav>
      </DrawerContent>
    </Drawer>
  );
}
