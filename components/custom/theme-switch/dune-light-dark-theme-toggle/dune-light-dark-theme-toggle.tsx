'use client';

import { motion, Variants } from 'motion/react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

import { BigMoonSVG } from './svg/big-moon';
import { PaulSVG } from './svg/paul';
import { SandSVG } from './svg/sand';
import { SandwormSVG } from './svg/sand-worm';
import { SmallMoonSVG } from './svg/small-moon';
import { SunSVG } from './svg/sun';

type DuneLightDarkThemeToggleProps = {
  sizeInPixels?: number;
  showRing?: boolean;
};

export function DuneLightDarkThemeToggle(props: DuneLightDarkThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const buttonVariants: Variants = {
    normal: {
      padding: '0px',
    },
    'on-hover': {
      padding: props.showRing ? '5%' : '0px',
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  };

  const backgroundVariants: Variants = {
    normal: {
      rotate: 0,
    },
    'on-hover': {
      rotate: 180,
      transition: {
        max: 720,
        type: 'inertia',
        velocity: 1500,
      },
    },
  };

  const contentVariants: Variants = {
    'light-theme': {
      background: '#FFFBD3',
    },
    'dark-theme': {
      background: '#313027',
    },
  };

  return (
    <div className='grid place-items-end'>
      <motion.button
        className={cn(
          'relative grid place-items-center rounded-full p-2 shadow-lg transition-[box-shadow]'
        )}
        initial={resolvedTheme === 'light' ? 'light-theme' : 'dark-theme'}
        animate={[
          'normal',
          resolvedTheme === 'light' ? 'light-theme' : 'dark-theme',
          resolvedTheme === 'light' ? 'sand-storm' : 'worm-moving',
          'glowing',
        ]}
        whileHover={[
          'on-hover',
          resolvedTheme === 'light' ? 'light-hover' : 'dark-hover',
        ]}
        transition={{
          duration: 0.3,
        }}
        onClick={() => {
          if (document.startViewTransition) {
            document.startViewTransition(() => {
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
            });
          } else {
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          }
        }}
        variants={buttonVariants}
      >
        <motion.div
          style={{
            width: props.sizeInPixels,
            height: props.sizeInPixels,
          }}
          className={cn(
            'relative z-10 overflow-hidden rounded-full bg-[#FFFBD3] shadow-inner',
            props.sizeInPixels ? 'size-auto' : 'size-8 sm:size-16'
          )}
          variants={contentVariants}
        >
          <SunSVG />
          <BigMoonSVG />
          <SmallMoonSVG />
          <PaulSVG />
          <SandwormSVG />
          <SandSVG />
        </motion.div>
        <motion.div
          style={{
            background:
              'linear-gradient(90deg, rgba(209,173,103,1) 0%, rgba(255,236,196,1) 50%, rgba(209,173,103,1) 100%)',
          }}
          className='absolute left-0 top-0 z-0 h-full w-full rounded-full'
          variants={backgroundVariants}
        />
      </motion.button>
    </div>
  );
}
