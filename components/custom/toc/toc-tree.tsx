'use client';

import { cn } from '@/lib/utils';

import { TOCLink } from './toc-link';
import { useTOC } from './toc-provider';

export function TOCTree() {
  const { toc, showToc } = useTOC();

  function renderTOCTree(toc: Page['toc']) {
    return (
      <ul className='m-0 space-y-0'>
        {toc.map((heading) => (
          <li key={heading.url} className='m-0 pl-1'>
            <div className='flex flex-row items-start'>
              <div className='group relative inline-block w-fit [&>*]:cursor-alias'>
                <TOCLink entry={heading} />
                <span
                  className={cn(
                    'absolute bottom-0 left-0 rounded-full bg-foreground',
                    'h-0 w-0 opacity-0 transition-[opacity_width] duration-300 group-hover:h-[1px] group-hover:w-full group-hover:opacity-100'
                  )}
                ></span>
              </div>
            </div>
            {heading.items && renderTOCTree(heading.items)}
          </li>
        ))}
      </ul>
    );
  }

  if (!showToc) return null;
  if (toc === undefined) return null;
  if (toc.length === 0) return null;

  return (
    <div
      className={cn(
        'prose prose-stone absolute top-0 h-full text-sm dark:prose-invert',
        '-right-28 md:-right-40 lg:-right-56 xl:-right-64',
        'w-48 lg:w-52 xl:w-64',
        'hidden md:block'
      )}
    >
      <nav className={cn('sticky top-24 border-t py-4')}>
        {renderTOCTree(toc)}
      </nav>
    </div>
  );
}
