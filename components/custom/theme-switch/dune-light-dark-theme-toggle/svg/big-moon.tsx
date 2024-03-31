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
      filter: 'drop-shadow(0 0 5px #A9A9A9)',
      transition: {
        type: 'spring',
        duration: 0.6,
        ease: 'easeOut',
      },
    },
    'hover-glowing': {
      filter: [
        'drop-shadow(0 0 5px #A9A9A9)',
        'drop-shadow(0 0 15px #A9A9A9)',
        'drop-shadow(0 0 5px #A9A9A9)',
      ],
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
      <circle cx='44.7193' cy='7.70175' r='30.7018' fill='#A9A9A9' />
      <circle cx='66.6491' cy='17.3509' r='1.75439' fill='#B6B6B6' />
      <circle cx='58.7544' cy='25.2456' r='2.63158' fill='#B6B6B6' />
      <circle cx='58.7544' cy='16.4737' r='0.877193' fill='#B6B6B6' />
      <circle cx='64.0175' cy='23.4912' r='0.877193' fill='#B6B6B6' />
      <circle cx='51.7368' cy='32.2632' r='0.877193' fill='#B6B6B6' />
      <circle cx='42.0877' cy='24.3684' r='1.75439' fill='#B6B6B6' />
      <circle cx='33.3158' cy='29.6316' r='1.75439' fill='#B6B6B6' />
    </motion.svg>
  );
}
