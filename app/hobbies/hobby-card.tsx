'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { HoverPerspectiveContainer } from '@/components/ui/hover-perspective-container';

type HobbyCardProps = {
  href: string;
  coverImageUrl: string;
  coverImageAlt: string;
  title: string;
  synopsis: string;
};

export function HobbyCard(props: HobbyCardProps) {
  const hoverVariants: Variants = {
    visible: {
      bottom: 0,
      opacity: 1,
      background: 'linear-gradient(transparent 0%, rgba(0, 0, 0, 1))',
      transition: {
        delay: 0.3,
        duration: 0.5,
      },
    },
    hidden: {
      bottom: -20,
      opacity: 0,
      background: 'transparent',
    },
  };

  return (
    <Link href={props.href}>
      <HoverPerspectiveContainer>
        <div className='relative flex aspect-[3/2] justify-center overflow-hidden'>
          <Image
            className='m-0 h-full'
            src={props.coverImageUrl}
            alt={props.coverImageAlt}
            width={600}
            height={400}
            layout='responsive'
          />
          <motion.div
            className='absolute left-0 h-auto w-full p-4 text-white'
            initial='hidden'
            whileInView='visible'
            variants={hoverVariants}
          >
            <h3 className='text-base font-bold text-white md:text-lg'>
              {props.title}
            </h3>
            <p className='text-sm md:text-base'>{props.synopsis}</p>
          </motion.div>
        </div>
      </HoverPerspectiveContainer>
    </Link>
  );
}
