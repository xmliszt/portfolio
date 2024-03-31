'use client';

import { motion, Variants } from 'framer-motion';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

import { BigMoonSVG } from './svg/big-moon';
import { PaulSVG } from './svg/paul';
import { SandSVG } from './svg/sand';
import { SandwormSVG } from './svg/sand-worm';
import { SmallMoonSVG } from './svg/small-moon';
import { StormOverlaySVG } from './svg/storm-overlay';
import { SunSVG } from './svg/sun';

type DuneLightDarkThemeToggleProps = {
  sizeInPixels?: number;
  ringPaddingInPixels?: number;
};

export function DuneLightDarkThemeToggle(props: DuneLightDarkThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const buttonVariants: Variants = {
    normal: {
      padding: '0px',
    },
    'on-hover': {
      padding: props.ringPaddingInPixels ?? '5px',
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
    <motion.button
      className={cn(
        'relative grid place-items-center rounded-full shadow-lg transition-[box-shadow]'
      )}
      initial={resolvedTheme === 'light' ? 'light-theme' : 'dark-theme'}
      animate={[
        'normal',
        resolvedTheme === 'light' ? 'light-theme' : 'dark-theme',
      ]}
      whileHover={[
        'on-hover',
        resolvedTheme === 'light' ? 'light-hover' : 'dark-hover',
        'hover-glowing',
      ]}
      transition={{
        duration: 0.3,
      }}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
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
        <StormOverlaySVG />
        <SandSVG />
      </motion.div>
      <motion.div
        style={{
          background:
            'linear-gradient(90deg, rgba(209,173,103,1) 0%, rgba(242,198,115,1) 50%, rgba(209,173,103,1) 100%)',
        }}
        className='absolute left-0 top-0 z-0 h-full w-full rounded-full'
        variants={backgroundVariants}
      />
    </motion.button>
  );
}
