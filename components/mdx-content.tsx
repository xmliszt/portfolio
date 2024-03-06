import * as runtime from 'react/jsx-runtime';
import Image from 'next/image';

import { slugify } from '@/lib/utils';

import { HoverPerspectiveContainer } from './custom/hover-perspective-container';
import { CustomLink } from './ui/custom-link';
import { BadgeGroup } from './badge-group';
import { CopyablePre } from './copyable-pre';
import { PhotoBentoGrid } from './photo-bento-grid';
import { WavingAvatar } from './waving-avatar';

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
            <a className='' href='#top'>
              {props.children}
            </a>
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
            <a className='' href='#top'>
              {props.children}
            </a>
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
            <a className='' href='#top'>
              {props.children}
            </a>
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
            <a className='' href='#top'>
              {props.children}
            </a>
          </h4>
        ),
        img: (props: any) => (
          <HoverPerspectiveContainer>
            <Image
              className='h-auto w-full rounded-lg shadow-lg'
              src={props.src}
              alt={props.alt}
              width={100}
              height={100}
              unoptimized
              {...props}
            />
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
        WavingAvatar,
        BadgeGroup,
        PhotoBentoGrid,
      }}
    />
  );
}
