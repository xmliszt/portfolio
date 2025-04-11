'use client';

import { motion } from 'motion/react';

import SkeuomorphismRollingSlider from '@/app/craft/stations/SkeuomorphismRollingSlider';
import type { CraftStation } from '@/app/craft/types';
import { Ratings } from '@/components/ui/ratings';

import { Sandbox } from './sandbox';

type CraftStationModalContentProps = {
  station: CraftStation;
};

export function CraftStationModalContent(props: CraftStationModalContentProps) {
  return (
    <motion.div className='flex flex-col gap-y-4'>
      <motion.div
        layoutId={`craft_station.title.${props.station.id}`}
        className='text-lg font-semibold'
      >
        {props.station.title}
      </motion.div>
      <div className='flex flex-col items-stretch gap-x-4 sm:flex-row sm:items-center'>
        <div className='flex grow flex-col gap-y-2'>
          <motion.p
            className='text-muted-foreground flex-1'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {props.station.description}
          </motion.p>
          <div className='flex gap-2'>
            {props.station.tags.map((tag) => (
              <motion.span
                layoutId={`craft_station.tag.${props.station.id}.${tag}`}
                key={tag}
                className='bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-sm'
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
        <div className='hidden shrink-0 grow md:block'>
          <Ratings id={`craft_station.${props.station.id}`} />
        </div>
      </div>
      {/* Code */}
      <Sandbox code={props.station.code} />
      {/* Display ratings on smaller screens */}
      <div className='block md:hidden'>
        <Ratings id={`craft_station.${props.station.id}`} />
      </div>
    </motion.div>
  );
}
