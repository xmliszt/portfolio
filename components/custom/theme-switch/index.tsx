'use client';

import { useTheme } from 'next-themes';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { DuneLightDarkThemeToggle } from './dune-light-dark-theme-toggle';

export function ThemeSwitch() {
  const { resolvedTheme } = useTheme();
  return (
    <Tooltip>
      <TooltipTrigger>
        <DuneLightDarkThemeToggle />
      </TooltipTrigger>
      <TooltipContent>
        {resolvedTheme === 'dark'
          ? 'switch to light mode'
          : 'switch to dark mode'}
      </TooltipContent>
    </Tooltip>
  );
}
