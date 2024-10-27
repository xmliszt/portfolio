import * as runtime from 'react/jsx-runtime';
import Image from 'next/image';
import Link from 'next/link';

import { slugify } from '@/lib/utils';

import { AspectRatio } from './ui/aspect-ratio';
import { BackToTopLink } from './ui/back-to-top-link';
import { BadgeGroup } from './ui/badge-group';
import { BookGrid } from './ui/book-grid';
import { CopyablePre } from './ui/copyable-pre';
import { CustomLink } from './ui/custom-link';
import { ExternalActionButtonLink } from './ui/external-action-button-link';
import { FilmGrid } from './ui/film-grid';
import { HoverPerspectiveContainer } from './ui/hover-perspective-container';
import { LoadMoreLinks } from './ui/load-more-links';
import { PhotoBentoGrid } from './ui/photo-bento-grid';
import { Ratings } from './ui/ratings';

interface MdxProps {
  code: string;
  components?: Record<string, React.ComponentType>;
}

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

export function MDXContent({ code, components }: MdxProps) {
  const Component = useMDXComponent(code);
  return (
    <Component
      components={{
        ...components,
        h1: (props: any) => (
          <h1 {...props}>
            <a
              id={slugify(props.children)}
              className='relative -top-16 block max-h-1 w-32 [visibility:hidden]'
            >
              {props.children}
            </a>
            <BackToTopLink>{props.children}</BackToTopLink>
          </h1>
        ),
        h2: (props: any) => (
          <h2 {...props}>
            <a
              id={slugify(props.children)}
              className='relative -top-16 block max-h-1 w-32 [visibility:hidden]'
            >
              {props.children}
            </a>
            <BackToTopLink>{props.children}</BackToTopLink>
          </h2>
        ),
        h3: (props: any) => (
          <h3 {...props}>
            <a
              id={slugify(props.children)}
              className='relative -top-16 block max-h-1 w-32 [visibility:hidden]'
            >
              {props.children}
            </a>
            {props.children}
          </h3>
        ),
        h4: (props: any) => (
          <h4 {...props}>
            <a
              id={slugify(props.children)}
              className='relative -top-16 block max-h-1 w-32 [visibility:hidden]'
            >
              {props.children}
            </a>
            {props.children}
          </h4>
        ),
        img: (props: any) => (
          <HoverPerspectiveContainer>
            <AspectRatio ratio={3 / 2}>
              <Image
                className='m-0 h-full w-full'
                src={props.src}
                alt={props.alt}
                width={200}
                height={200}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                unoptimized
                {...props}
              />
            </AspectRatio>
          </HoverPerspectiveContainer>
        ),
        a: (props: any) => (
          <CustomLink href={props.href} {...props}>
            {props.children}
          </CustomLink>
        ),
        pre: (props: any) => (
          <CopyablePre {...props}>{props.children}</CopyablePre>
        ),
        BadgeGroup,
        PhotoBentoGrid,
        ExternalActionButtonLink,
        LoadMoreLinks,
        CustomLink,
        FilmGrid,
        BookGrid,
        Ratings,
        Link,
      }}
    />
  );
}
