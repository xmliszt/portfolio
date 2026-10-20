"use client";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import {
  PRINTER_ICON_CLASS,
  PRINTER_KEY_CLASS,
} from "@/app/laundromat/settings/printer-key-class";
import { SETTINGS_META_CLASS } from "@/app/laundromat/settings/settings-meta-class";
import { formatTipDate } from "@/lib/laundromat/tip/format-tip-date";
import type { TipToken } from "@/lib/laundromat/tip/tip-token";
import { cn } from "@/lib/utils";

import { CloseKey } from "./close-key";
import { TIP_HEADING_CLASS } from "./tip-classes";
import { TipCoin } from "./tip-coin";
import { TipCoinViewer } from "./tip-coin-viewer";
import { useTip } from "./use-tip";

type TipCoinCloseUpProps = {
  token: TipToken;
  headingId: string;
  onBack: () => void;
  onClose: () => void;
};

/** Show `token`'s coin up close under a heading with its number, a back key that calls `onBack`, a close key that calls `onClose`, and below it a key that picks the token up to drop in a machine, or when it was used if it is spent. */
export function TipCoinCloseUp(props: TipCoinCloseUpProps) {
  const { copy } = useLaundromatCopy();
  const tip = useTip();
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
      {props.token.spentAt === undefined ? (
        <button
          type="button"
          className={cn(
            PRINTER_KEY_CLASS,
            "h-10 w-full justify-center px-3 text-[var(--lm-accent-hi)]"
          )}
          onClick={() => {
            tip?.holdToken(props.token.code);
            props.onClose();
          }}
        >
          <TipCoin metal="brass" label="" sizePx={14} />
          {copy.tip.dropInMachine}
        </button>
      ) : (
        <p className={cn(SETTINGS_META_CLASS, "m-0 text-center opacity-60")}>
          {copy.tip.usedOn({
            date: formatTipDate({
              isoDate: props.token.spentAt,
              locale: copy.locale,
            }),
          })}
        </p>
      )}
    </div>
  );
}
