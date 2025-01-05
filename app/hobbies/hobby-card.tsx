'use client';

import Image from 'next/image';
import Link from 'next/link';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

type HobbyCardProps = {
  href: string;
  coverImageUrl: string;
  coverImageAlt: string;
  title: string;
  synopsis: string;
};

export function HobbyCard(props: HobbyCardProps) {
  return (
    <Link href={props.href} className='rounded-lg shadow-md'>
      <div className='group relative justify-center overflow-hidden rounded-lg'>
        <AspectRatio ratio={3 / 2}>
          <Image
            className='m-0 h-full'
            src={props.coverImageUrl}
            alt={props.coverImageAlt}
            fill
          />
        </AspectRatio>
        <div
          className={cn(
            'absolute bottom-0 left-0 w-full p-2',
            'transition-transform ease-in-out [transition-duration:400ms]',
            'group-hover:translate-y-[-10px] group-hover:scale-[0.98]'
          )}
        >
          <div
            className={cn(
              'h-auto w-full rounded-lg border-t border-t-stone-600 bg-[rgba(0,0,0,0.7)] p-2 pt-3 text-white shadow-[0_-5px_15px_rgba(0,0,0,0.6)]',
              'transition-[box-shadow] ease-in-out [transition-duration:400ms]',
              'group-hover:shadow-none'
            )}
          >
            <h3 className='m-0 mb-2 text-sm font-semibold text-white'>
              {props.title}
            </h3>
            <p className='text-xs'>{props.synopsis}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
