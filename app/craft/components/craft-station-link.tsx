'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

import type { CraftStation } from '@/app/craft/types';
import { cn } from '@/lib/utils';

type CraftStationLinkProps = {
  station: CraftStation;
};

export function CraftStationLink(props: CraftStationLinkProps) {
  return (
    <Link href={`/craft/${props.station.id}`} prefetch>
      <motion.div
        layoutId={`craft_station.container.${props.station.id}`}
        className={cn(
          'group bg-background flex h-20 w-full flex-col justify-center overflow-hidden rounded-lg border p-4 text-left',
          'transition-shadow duration-300 hover:shadow-md'
        )}
      >
        <motion.div
          layoutId={`craft_station.title.${props.station.id}`}
          className='shrink-0 truncate text-sm font-semibold'
        >
          {props.station.title}
        </motion.div>
        <div className='text-muted-foreground mt-2 flex shrink-0 items-center gap-x-2 text-xs'>
          {props.station.tags.map((tag) => (
            <motion.span
              layoutId={`craft_station.tag.${props.station.id}.${tag}`}
              className='bg-muted rounded-md border px-2.5 py-1'
              key={tag}
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </Link>
  );
}
