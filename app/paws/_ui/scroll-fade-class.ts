/** Fades content into the paper over its first and last 12px as it scrolls under a panel's edges, instead of cutting it off. */
export const SCROLL_FADE_CLASS =
  "[mask-image:linear-gradient(to_bottom,transparent,black_12px,black_calc(100%-12px),transparent)] [scrollbar-width:thin] [scrollbar-color:var(--pw-rule)_transparent]";
