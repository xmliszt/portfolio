'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { HoverPerspectiveContainer } from './hover-perspective-container';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type Film = {
  originalTitle: string;
  alternativeTitle: string;
  year: number;
  posterUrl: string;
  href: string;
};

type FilmGridProps = {
  films: Film[];
};

export function FilmGrid(props: FilmGridProps) {
  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
      {props.films.map((film) => (
        <Tooltip key={film.originalTitle}>
          <TooltipTrigger asChild>
            <Link href={film.href} target='_blank' className='cursor-alias'>
              <HoverPerspectiveContainer className='border border-primary'>
                <div className='relative flex aspect-[2/3] w-full flex-col gap-y-2 bg-card'>
                  <Image
                    className='m-0'
                    src={film.posterUrl}
                    alt={film.originalTitle}
                    width={200}
                    height={300}
                    layout='responsive'
                    unoptimized
                  />
                  <motion.div
                    className='absolute bottom-0 z-10 flex w-full flex-col justify-between gap-2 rounded-t-xl border-t border-t-stone-600 bg-[rgba(0,0,0,0.4)] p-2 pt-3 shadow-[0_-5px_15px_rgba(0,0,0,0.4)] [&_*]:text-white'
                    initial={{
                      backdropFilter: 'blur(0px)',
                      translateY: '10px',
                      opacity: 0,
                    }}
                    animate={{
                      backdropFilter: 'blur(5px)',
                      translateY: '0px',
                      opacity: 1,
                      transition: {
                        delay: 0.5,
                        ease: 'easeOut',
                        bounce: 0,
                      },
                    }}
                  >
                    <div className='leading-tight'>
                      <div className='text-sm font-bold md:text-base'>
                        {film.originalTitle}
                      </div>
                      <div className='truncate text-xs italic text-muted-foreground md:text-sm'>
                        {film.alternativeTitle}
                      </div>
                    </div>
                    <div className='m-0 h-max w-full text-right text-xs md:text-sm'>
                      {film.year}
                    </div>
                  </motion.div>
                </div>
              </HoverPerspectiveContainer>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='bottom' sideOffset={6}>
            {`${film.originalTitle} (${film.year}) - ${film.alternativeTitle}`}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
