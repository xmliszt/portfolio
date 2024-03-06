'use client';

import { MoonStars, SunHorizon } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          }}
          className='transition-transform duration-300 ease-out hover:scale-125'
        >
          {resolvedTheme === 'dark' ? (
            <MoonStars size={24} />
          ) : (
            <SunHorizon size={24} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {resolvedTheme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'}
      </TooltipContent>
    </Tooltip>
  );
}
