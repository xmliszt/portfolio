import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";

import { TOOLBAR_BUTTON_CLASS } from "./toolbar-button-class";
import { ToolbarLabel } from "./toolbar-label";

/** Link to Paws in a new tab: a paw print and the site's name. */
export function PawsLink() {
  return (
    <a
      href={PAWS_ORIGIN}
      target="_blank"
      rel="noopener"
      className={TOOLBAR_BUTTON_CLASS}
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="size-3 shrink-0"
        fill="currentColor"
      >
        <ellipse cx="6" cy="8" rx="2.6" ry="2.2" />
        <circle cx="2.4" cy="5" r="1.1" />
        <circle cx="4.6" cy="2.9" r="1.1" />
        <circle cx="7.4" cy="2.9" r="1.1" />
        <circle cx="9.6" cy="5" r="1.1" />
      </svg>
      <ToolbarLabel>paws.liyuxuan.dev</ToolbarLabel>
    </a>
  );
}
