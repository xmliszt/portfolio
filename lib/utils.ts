import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  // hash the input if it is not a string
  if (typeof input !== 'string') return '';
  const parts = input.split(' ');
  const encodedParts = parts.map((part) =>
    encodeURIComponent(part.toLowerCase())
  );
  return 'anchor:' + encodedParts.join('-');
}

export function isAtCurrentTOC(hash: string, tocTitle: string) {
  return hash === slugify(tocTitle);
}
