import { motion, Variants } from 'framer-motion';

export function StormOverlaySVG() {
  const variants: Variants = {
    'light-theme': {
      opacity: 0,
      stdDeviation: 29.7,
      translateX: 0,
      translateY: 0,
    },
    'dark-theme': {
      opacity: 0,
    },
    'light-hover': {
      scale: [1, 1.1, 1],
      opacity: [0, 1, 0],
      translateX: [0, '5%', 0],
      translateY: [0, '3%', 0],
      transition: {
        ease: 'easeInOut',
        duration: 6,
        repeat: Infinity,
        times: [0, 0.5, 1],
      },
    },
  };

  return (
    <motion.svg
      className='absolute bottom-0 z-50'
      width='100%'
      height='100%'
      viewBox='0 0 181 181'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      variants={variants}
    >
      <g opacity='0.42' filter='url(#filter0_f_36_5)'>
        <ellipse
          cx='62.103'
          cy='147.168'
          rx='76.103'
          ry='69.8325'
          fill='#463804'
        />
      </g>
      <g opacity='0.42' filter='url(#filter1_f_36_5)'>
        <ellipse
          cx='157.897'
          cy='69.8325'
          rx='76.103'
          ry='69.8325'
          fill='#967708'
        />
      </g>
      <g opacity='0.42' filter='url(#filter2_f_36_5)'>
        <ellipse
          cx='102.549'
          cy='124.082'
          rx='76.103'
          ry='69.8325'
          fill='#847438'
        />
      </g>
      <defs>
        <filter
          id='filter0_f_36_5'
          x='-73.4'
          y='17.9351'
          width='271.006'
          height='258.465'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='BackgroundImageFix'
            result='shape'
          />
          <motion.feGaussianBlur
            variants={variants}
            result='effect1_foregroundBlur_36_5'
          />
        </filter>
        <filter
          id='filter1_f_36_5'
          x='22.394'
          y='-59.4'
          width='271.006'
          height='258.465'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='BackgroundImageFix'
            result='shape'
          />
          <motion.feGaussianBlur
            variants={variants}
            result='effect1_foregroundBlur_36_5'
          />
        </filter>
        <filter
          id='filter2_f_36_5'
          x='-32.9537'
          y='-5.15'
          width='271.006'
          height='258.465'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='BackgroundImageFix'
            result='shape'
          />
          <motion.feGaussianBlur
            variants={variants}
            result='effect1_foregroundBlur_36_5'
          />
        </filter>
      </defs>
    </motion.svg>
  );
}
