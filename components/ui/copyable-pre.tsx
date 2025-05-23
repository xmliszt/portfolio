"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function CopyablePre({ children, raw, ...props }: any) {
  const [isCopied, setIsCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(raw);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <pre {...props} className="relative p-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="text-muted-foreground absolute top-0 right-0 p-2"
            onClick={copy}
          >
            {isCopied && (
              <span className="animate-fade-in-from-right-and-fade-out absolute top-2 right-8 z-20 text-xs opacity-0">
                Copied!
              </span>
            )}
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </TooltipTrigger>
        <TooltipContent>copy to clipboard</TooltipContent>
      </Tooltip>
      {children}
    </pre>
  );
}
