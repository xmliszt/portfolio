import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  if (typeof input !== "string") return "";
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return `anchor:${normalized}`;
}

export function normalizeTOCHash(value: string) {
  if (!value) return "";
  const trimmed = value.startsWith("#") ? value.slice(1) : value;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function isAtCurrentTOC(hash: string, tocUrl: string) {
  return normalizeTOCHash(hash) === normalizeTOCHash(tocUrl);
}
