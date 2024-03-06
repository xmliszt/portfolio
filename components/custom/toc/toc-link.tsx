'use client';

import { cn, isAtCurrentTOC, slugify } from '@/lib/utils';

import { useTOC } from './toc-provider';

type TOCLinkProps = {
  entry: Page['toc'][0];
};

export function TOCLink(props: TOCLinkProps) {
  const { hash, setHash } = useTOC();
  return (
    <a
      href={props.entry.url}
      className={cn(
        isAtCurrentTOC(hash, props.entry.title) ? 'font-bold' : 'font-normal'
      )}
      onClick={() => {
        setHash(slugify(props.entry.title));
      }}
    >
      {props.entry.title}
    </a>
  );
}
