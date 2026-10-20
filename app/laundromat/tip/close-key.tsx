import {
  PRINTER_ICON_CLASS,
  PRINTER_KEY_CLASS,
} from "@/app/laundromat/settings/printer-key-class";
import { tipCopy } from "@/lib/laundromat/tip/tip-copy";
import { cn } from "@/lib/utils";

type CloseKeyProps = { onClose: () => void };

/** Render a square printer key with a cross that calls `onClose`. */
export function CloseKey(props: CloseKeyProps) {
  return (
    <button
      type="button"
      aria-label={tipCopy.close}
      className={cn(PRINTER_KEY_CLASS, "w-8 justify-center px-0")}
      onClick={props.onClose}
    >
      <svg aria-hidden viewBox="0 0 12 12" className={PRINTER_ICON_CLASS}>
        <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" />
      </svg>
    </button>
  );
}
