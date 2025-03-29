'use client';

import Image from 'next/image';
import Link from 'next/link';

import { AspectRatio } from './aspect-ratio';
import { HoverPerspectiveContainer } from './hover-perspective-container';

type ImagePerspectiveLinkProps = {
  src: string;
  alt: string;
  href: string;
  width?: number;
  height?: number;
};

export function ImagePerspectiveLink(props: ImagePerspectiveLinkProps) {
  return (
    <Link href={props.href}>
      <HoverPerspectiveContainer>
        <AspectRatio ratio={3 / 2}>
          <Image
            className='m-0 h-full w-full'
            src={props.src}
            alt={props.alt}
            width={props.width ?? 200}
            height={props.height ?? 200}
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            unoptimized
          />
        </AspectRatio>
      </HoverPerspectiveContainer>
    </Link>
  );
}
