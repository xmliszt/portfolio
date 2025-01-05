'use client';

import { Disc } from '@phosphor-icons/react';
import { MusicNote } from '@phosphor-icons/react/dist/ssr';

import { Bgm } from '@/components/custom/bgm/bgm';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { useFloatingNavigation } from './floating-navigation-provider';

type FloatingNavigationBarProps = {
  children: React.ReactNode;
};

export function FloatingNavigationBar(props: FloatingNavigationBarProps) {
  const { isOpen, setIsOpen } = useFloatingNavigation();
  const bgmState = Bgm.getInstance().store();

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
              <div className='absolute z-20 flex h-full w-full items-center justify-center'>
                {bgmState.isPlaying ? (
                  <Disc
                    size={24}
                    className='animate-spin transition-transform'
                  />
                ) : (
                  <MusicNote size={24} />
                )}
              </div>
              <div
                className={cn(
                  'z-10 h-full w-full rounded-full border p-2 text-secondary-foreground shadow-sm backdrop-blur-lg',
                  'transition-[transform_background_box-shadow] duration-300 group-hover:scale-105 group-hover:bg-background group-hover:shadow-lg'
                )}
              ></div>
            </div>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent>menu</TooltipContent>
      </Tooltip>

      <DrawerContent
        className={cn(
          'flex flex-col gap-12 rounded-none rounded-t-lg focus-visible:outline-none',
          // hide the drawer handle
          '[&>*:first-child]:hidden'
        )}
      >
        {/* Custom drawer handle */}
        <div className='mx-auto mt-2 h-1 w-[60px] cursor-grab rounded-full bg-foreground' />
        {props.children}
      </DrawerContent>
    </Drawer>
  );
}
