import { motion, Variants } from 'motion/react';

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
      filter: 'drop-shadow(0 0 5px #6D6D6D)',
      transition: {
        type: 'spring',
        duration: 0.7,
        ease: 'easeOut',
      },
    },
    glowing: {
      filter: [
        'drop-shadow(0 0 5px #6D6D6D)',
        'drop-shadow(0 0 15px #6D6D6D)',
        'drop-shadow(0 0 5px #6D6D6D)',
      ],
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
      <circle cx='25.5263' cy='22.614' r='10.5263' fill='#6D6D6D' />
      <circle cx='29.5526' cy='27.5' r='0.5' fill='#606060' />
      <circle cx='26.0526' cy='29' r='1' fill='#606060' />
      <circle cx='28.5526' cy='30.5' r='0.5' fill='#606060' />
      <circle cx='31.5526' cy='28.5' r='0.5' fill='#606060' />
      <circle cx='32.0526' cy='26' r='1' fill='#606060' />
    </motion.svg>
  );
}
