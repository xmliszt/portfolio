"use client";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import {
  PRINTER_ICON_CLASS,
  PRINTER_KEY_CLASS,
} from "@/app/laundromat/settings/printer-key-class";
import type { TipToken } from "@/lib/laundromat/tip/tip-token";

import { CloseKey } from "./close-key";
import { TIP_HEADING_CLASS } from "./tip-classes";
import { TipCoinViewer } from "./tip-coin-viewer";

type TipCoinCloseUpProps = {
  token: TipToken;
  headingId: string;
  onBack: () => void;
  onClose: () => void;
};

/** Show `token`'s coin up close under a heading with its number, a back key that calls `onBack` and a close key that calls `onClose`. */
export function TipCoinCloseUp(props: TipCoinCloseUpProps) {
  const { copy } = useLaundromatCopy();
  return (
    <div className="flex flex-col gap-y-5">
      <div className="flex items-center justify-between gap-x-3">
        <button
          type="button"
          className={PRINTER_KEY_CLASS}
          onClick={props.onBack}
        >
          <svg aria-hidden viewBox="0 0 12 12" className={PRINTER_ICON_CLASS}>
            <path d="M7.5 2.5L4 6l3.5 3.5" />
          </svg>
          {copy.tip.back}
        </button>
        <h2 id={props.headingId} className={TIP_HEADING_CLASS}>
          {copy.tip.pocketLabel({ number: props.token.number })}
        </h2>
        <CloseKey onClose={props.onClose} />
      </div>
      <TipCoinViewer token={props.token} />
    </div>
  );
}
