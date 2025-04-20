'use client';

import { motion } from 'motion/react';

import App from '@/app/craft/stations/text-morph-effect/App';
import type { CraftStation } from '@/app/craft/types';
import { Ratings } from '@/components/ui/ratings';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { Sandbox } from './sandbox';

type CraftStationModalContentProps = {
  station: CraftStation;
};

export function CraftStationModalContent(props: CraftStationModalContentProps) {
  return (
    <motion.div className='flex flex-col gap-y-4 pt-8 pb-24'>
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
          <ScrollArea className='w-full'>
            <div className='flex gap-x-2'>
              {props.station.tags.map((tag) => (
                <motion.span
                  layoutId={`craft_station.tag.${props.station.id}.${tag}`}
                  key={tag}
                  className='bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-sm whitespace-nowrap'
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </div>
        <div className='hidden shrink-0 grow md:block'>
          <Ratings id={`craft_station.${props.station.id}`} />
        </div>
      </div>
      {/* Code */}
      <Sandbox codes={props.station.codes} />
      {/* Display ratings on smaller screens */}
      <div className='block md:hidden'>
        <Ratings id={`craft_station.${props.station.id}`} />
      </div>
      <App />
    </motion.div>
  );
}
