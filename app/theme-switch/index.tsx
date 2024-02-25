'use client';

import { MoonStars, SunHorizon } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      }}
      className='hover:scale-125 transition-transform ease-out duration-300'
    >
      {resolvedTheme === 'dark' ? (
        <MoonStars size={24} />
      ) : (
        <SunHorizon size={24} />
      )}
    </button>
  );
}
