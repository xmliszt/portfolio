import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export function SandSVG() {
  const { resolvedTheme } = useTheme();
  return (
    <motion.svg
      className='absolute bottom-[-30%] z-40'
      width='100%'
      height='120%'
      viewBox='0 0 176 122'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <motion.path
        d='M130.967 12.9298C128.862 12.2281 114.3 2.40351 112.546 0.649124C112.546 2.40351 113.248 7.31579 105.528 12.9298C95.8793 19.9474 91.5612 23.319 90.6163 31.3509C88.8619 46.2632 18.6864 91 17.8092 92.7544C16.932 94.5088 48.5087 133.105 58.1578 131.351C65.8771 129.947 130.965 130.474 133.596 131.351C137.69 133.105 176.932 117.14 181.844 116.439C205.526 97.1404 177.283 42.2281 176.581 40.1228C175.704 37.4912 159.037 27.8421 157.283 26.0877C155.528 24.3333 133.599 13.807 130.967 12.9298Z'
        animate={{
          fill: resolvedTheme === 'light' ? '#90855D' : '#635C40',
        }}
      />
      <motion.path
        d='M28.4975 54.0198L2.23302 67.1941L1.35754 68.0724C1.35754 68.0724 -3.01994 72.4638 5.73494 84.7598C14.4898 97.0558 18.8672 95.2992 18.8672 95.2992C25.2874 90.9078 43.0305 79.4901 62.6413 68.9506C87.0675 55.8233 89.7623 40.9519 91.5135 31.2879L91.5323 31.1844C93.2832 21.5232 102.914 15.3752 107.291 12.7404C111.668 10.1055 113.421 1.52632 112.544 0.649096C111.924 0.0288158 108.458 1.02989 106.415 2.20094L92.4077 11.8621L75.7736 25.9146L52.1355 43.4803L28.4975 54.0198Z'
        animate={{
          fill: resolvedTheme === 'light' ? '#DECA81' : '#B4A468',
        }}
      />
    </motion.svg>
  );
}
