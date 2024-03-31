import { motion, Variants } from 'framer-motion';

export function SmallMoonSVG() {
  const variants: Variants = {
    'light-theme': {
      translateX: '150%',
      translateY: '20%',
      transition: {
        duration: 0.7,
        ease: 'easeOut',
      },
    },
    'dark-theme': {
      translateX: '16%',
      translateY: '-5%',
      transition: {
        type: 'spring',
        duration: 0.7,
        ease: 'easeOut',
      },
    },
    'hover-glowing': {
      stdDeviation: [2, 7, 2],
      transition: {
        duration: 4,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
        repeat: Infinity,
        delay: 1,
      },
    },
    'dark-hover': {
      translateX: '14%',
      translateY: '-3%',
    },
  };
  return (
    <motion.svg
      className='absolute top-[-20%] z-20'
      width='150%'
      height='150%'
      viewBox='0 0 200 100'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      variants={variants}
    >
      <g filter='url(#filter0_d_10_79)'>
        <circle cx='25.5263' cy='22.614' r='10.5263' fill='#6D6D6D' />
      </g>
      <circle cx='29.5526' cy='27.5' r='0.5' fill='#606060' />
      <circle cx='26.0526' cy='29' r='1' fill='#606060' />
      <circle cx='28.5526' cy='30.5' r='0.5' fill='#606060' />
      <circle cx='31.5526' cy='28.5' r='0.5' fill='#606060' />
      <circle cx='32.0526' cy='26' r='1' fill='#606060' />
      <defs>
        <filter
          id='filter0_d_10_79'
          x='0.9'
          y='-2.01228'
          width='49.2526'
          height='49.2526'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'
            result='hardAlpha'
          />
          <feOffset />
          <motion.feGaussianBlur variants={variants} />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow_10_79'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_10_79'
            result='shape'
          />
        </filter>
      </defs>
    </motion.svg>
  );
}
