'use client';

import { motion } from 'motion/react';

import type { CraftStation } from '@/app/craft/types';

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
      <motion.p
        className='text-muted-foreground'
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
      {/* Code */}
      <Sandbox code={props.station.code} />
    </motion.div>
  );
}
