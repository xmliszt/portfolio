import { motion, Variants } from 'framer-motion';

export function SunSVG() {
  const variants: Variants = {
    'light-theme': {
      translateX: '0%',
      translateY: '-35%',
      stdDeviation: 8,
      scale: 1,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1,
        ease: 'easeOut',
      },
    },
    'dark-theme': {
      translateX: '-150%',
      translateY: '-25%',
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
    'hover-glowing': {
      stdDeviation: [8, 2, 8],
      transition: {
        duration: 4,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
        repeat: Infinity,
      },
    },
    'light-hover': {
      translateY: '-25%',
    },
  };

  return (
    <motion.svg
      className='absolute top-0 z-10'
      width='200%'
      height='200%'
      viewBox='0 0 200 100'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      variants={variants}
    >
      <g filter='url(#filter0_d_10_114)'>
        <circle cx='53.5263' cy='14.9123' r='39.4737' fill='#FFF59C' />
      </g>
      <defs>
        <filter
          id='filter0_d_10_114'
          x='0.952627'
          y='-37.6614'
          width='105.147'
          height='105.147'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset />
          <motion.feGaussianBlur variants={variants} />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 1 0 0 0 0 0.78 0 0 0 0 0 0 0 0 1 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow_10_114'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_10_114'
            result='shape'
          />
        </filter>
      </defs>
    </motion.svg>
  );
}
