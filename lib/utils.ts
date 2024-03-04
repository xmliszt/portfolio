import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  // hash the input if it is not a string
  if (typeof input !== 'string') {
    input = JSON.stringify(input);
  }
  const parts = input.split(' ');
  const encodedParts = parts.map((part) =>
    encodeURIComponent(part.toLowerCase())
  );
  console.log(encodedParts);
  return encodedParts.join('-');
}
