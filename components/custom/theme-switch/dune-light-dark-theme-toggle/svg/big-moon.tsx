import { motion, Variants } from 'framer-motion';

export function BigMoonSVG() {
  const variants: Variants = {
    'light-theme': {
      translateX: '150%',
      translateY: '20%',
      transition: {
        type: 'spring',
        duration: 0.6,
        ease: 'easeOut',
      },
    },
    'dark-theme': {
      translateX: '20%',
      translateY: '-15%',
      transition: {
        type: 'spring',
        duration: 0.6,
        ease: 'easeOut',
      },
    },
    'hover-glowing': {
      stdDeviation: [2, 6, 2],
      transition: {
        duration: 5,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
        repeat: Infinity,
      },
    },
    'dark-hover': {
      translateX: '25%',
      translateY: '-18%',
    },
  };

  return (
    <motion.svg
      className='absolute top-0 z-10'
      width='150%'
      height='150%'
      viewBox='0 0 200 100'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      variants={variants}
    >
      <g filter='url(#filter0_d_10_69)'>
        <circle cx='44.7193' cy='7.70175' r='30.7018' fill='#A9A9A9' />
      </g>
      <circle cx='66.6491' cy='17.3509' r='1.75439' fill='#B6B6B6' />
      <circle cx='58.7544' cy='25.2456' r='2.63158' fill='#B6B6B6' />
      <circle cx='58.7544' cy='16.4737' r='0.877193' fill='#B6B6B6' />
      <circle cx='64.0175' cy='23.4912' r='0.877193' fill='#B6B6B6' />
      <circle cx='51.7368' cy='32.2632' r='0.877193' fill='#B6B6B6' />
      <circle cx='42.0877' cy='24.3684' r='1.75439' fill='#B6B6B6' />
      <circle cx='33.3158' cy='29.6316' r='1.75439' fill='#B6B6B6' />
      <defs>
        <filter
          id='filter0_d_10_69'
          x='0.917547'
          y='-36.1'
          width='87.6035'
          height='87.6035'
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
            result='effect1_dropShadow_10_69'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow_10_69'
            result='shape'
          />
        </filter>
      </defs>
    </motion.svg>
  );
}
