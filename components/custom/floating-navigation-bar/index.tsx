'use client';

import { MusicNote } from '@phosphor-icons/react/dist/ssr';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger
            asChild
            className={cn(
              'fixed bottom-10 left-4 z-50 md:left-10',
              'block md:hidden',
              'cursor-pointer'
            )}
          >
            <div className='group size-10'>
              <div
                className={cn(
                  'absolute z-20 flex h-full w-full items-center justify-center',
                  'transition-transform duration-300 ease-in-out group-hover:rotate-[360deg] group-hover:scale-90'
                )}
              >
                <MusicNote size={24} />
              </div>
              <div
                className={cn(
                  'z-10 h-full w-full rounded-full border p-2 text-secondary-foreground shadow-sm backdrop-blur-lg',
                  'transition-[transform_background_box-shadow] duration-300 ease-in-out group-hover:scale-105 group-hover:bg-background group-hover:shadow-lg'
                )}
              ></div>
            </div>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent>Menu</TooltipContent>
      </Tooltip>

      <DrawerContent
        className={cn(
          'rounded-none rounded-t-lg focus-visible:outline-none',
          // hide the drawer handle
          '[&>*:first-child]:hidden'
        )}
      >
        {/* Custom drawer handle */}
        <div className='mx-auto mb-8 mt-2 h-1 w-[60px] cursor-grab rounded-full bg-foreground'></div>
        {/* Theme switch */}
        <div className='absolute right-4 top-4 z-10'>
          <ThemeSwitch />
        </div>
        {/* Navigation items */}
        <nav className='flex flex-col gap-2 p-3'>{props.children}</nav>
      </DrawerContent>
    </Drawer>
  );
}
