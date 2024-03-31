'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { AspectRatio } from '@/components/ui/aspect-ratio';
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
      transition: {
        delay: 0.3,
        duration: 0.5,
      },
    },
    hidden: {
      bottom: -20,
      opacity: 0,
    },
  };

  return (
    <Link href={props.href}>
      <HoverPerspectiveContainer>
        <div className='relative justify-center overflow-hidden'>
          <AspectRatio ratio={3 / 2}>
            <Image
              className='m-0 h-full'
              src={props.coverImageUrl}
              alt={props.coverImageAlt}
              fill
            />
          </AspectRatio>
          <motion.div
            className='absolute left-0 h-auto w-full rounded-t-lg border-t border-t-stone-600 bg-[rgba(0,0,0,0.3)] p-2 pt-3 text-white shadow-[0_-5px_15px_rgba(0,0,0,0.4)] backdrop-blur-[5px]'
            initial='hidden'
            whileInView='visible'
            variants={hoverVariants}
          >
            <h3 className='m-0 text-sm font-bold text-white md:text-base'>
              {props.title}
            </h3>
            <p className='text-xs md:text-sm'>{props.synopsis}</p>
          </motion.div>
        </div>
      </HoverPerspectiveContainer>
    </Link>
  );
}
