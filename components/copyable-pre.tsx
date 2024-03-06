'use client';

import { useState } from 'react';
import { Check, Copy } from '@phosphor-icons/react';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function CopyablePre({ children, raw, ...props }: any) {
  const [isCopied, setIsCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(raw);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <pre {...props} className='relative p-4'>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className='absolute right-0 top-0 p-2 text-muted-foreground'
            onClick={copy}
          >
            {isCopied && (
              <span className='absolute right-8 top-2 z-20 animate-fade-in-from-right-and-fade-out text-xs opacity-0'>
                Copied!
              </span>
            )}
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </TooltipTrigger>
        <TooltipContent>Copy to clipboard</TooltipContent>
      </Tooltip>
      {children}
    </pre>
  );
}
