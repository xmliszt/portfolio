"use client";

import { useCallback, useState } from "react";
import { useReducedMotion } from "motion/react";

import { PRINTER_KEY_CLASS } from "@/app/laundromat/settings/printer-key-class";
import { SETTINGS_META_CLASS } from "@/app/laundromat/settings/settings-meta-class";
import { TOOLBAR_BUTTON_CLASS } from "@/app/laundromat/toolbar-button-class";
import { ToolbarLabel } from "@/app/laundromat/toolbar-label";
import { tipCopy } from "@/lib/laundromat/tip/tip-copy";
import { cn } from "@/lib/utils";

import { CloseKey } from "./close-key";
import { TIP_FACEPLATE_CLASS, TIP_HEADING_CLASS } from "./tip-classes";
import { TipCoin } from "./tip-coin";
import { TipCoinCloseUp } from "./tip-coin-close-up";
import { TipModal } from "./tip-modal";
import { TipReceipt } from "./tip-receipt";
import { TipSwap } from "./tip-swap";
import { useTip } from "./use-tip";

/** Show the visitor's newest tip token in the toolbar once they have one, opening the printed ticket of every token they keep, each with its coin to look at up close and a key to drop it in a washer. */
export function PocketButton() {
  const tip = useTip();
  const [isOpen, setIsOpen] = useState(false);
  const [viewingCode, setViewingCode] = useState<string>();
  const [lastViewedCode, setLastViewedCode] = useState<string>();
  const close = useCallback(() => {
    setIsOpen(false);
    setViewingCode(undefined);
  }, []);
  const leaveCloseUp = useCallback(() => setViewingCode(undefined), []);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const newest = tip?.tokens.at(0);
  const viewing = tip?.tokens.find(({ code }) => code === viewingCode);
  if (tip === undefined || newest === undefined) return null;

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={TOOLBAR_BUTTON_CLASS}
        onClick={() => setIsOpen(true)}
      >
        <TipCoin metal="brass" label="" sizePx={12} />
        <ToolbarLabel open={isOpen}>
          {tipCopy.pocketLabel({ number: newest.number })}
        </ToolbarLabel>
      </button>
      <TipModal
        open={isOpen}
        labelledBy="pocket-heading"
        onClose={viewing === undefined ? close : leaveCloseUp}
      >
        <div className={TIP_FACEPLATE_CLASS}>
          <TipSwap
            swapKey={viewing?.code ?? "list"}
            reducedMotion={prefersReducedMotion}
          >
            {viewing === undefined ? (
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center justify-between gap-x-3">
                  <h2 id="pocket-heading" className={TIP_HEADING_CLASS}>
                    {tipCopy.pocketHeading}
                  </h2>
                  <CloseKey onClose={close} />
                </div>
                <p
                  className={cn(
                    SETTINGS_META_CLASS,
                    "m-0 normal-case opacity-60"
                  )}
                >
                  {tipCopy.keepCode}
                </p>
                {tip.tokens.map((token) => (
                  <div key={token.code} className="flex flex-col gap-y-2">
                    <TipReceipt token={token} printing={false} hint={false} />
                    <div className="flex items-center gap-x-3">
                      <button
                        type="button"
                        aria-label={tipCopy.viewCoin({ number: token.number })}
                        className="grid size-11 shrink-0 cursor-zoom-in place-items-center rounded-full outline-none focus-visible:shadow-[0_0_0_2px_var(--lm-panel),0_0_0_3.5px_var(--lm-accent)]"
                        autoFocus={token.code === lastViewedCode}
                        onClick={() => {
                          setViewingCode(token.code);
                          setLastViewedCode(token.code);
                        }}
                      >
                        <TipCoin
                          metal="brass"
                          label={String(token.number)}
                          sizePx={40}
                          shine
                        />
                      </button>
                      <button
                        type="button"
                        className={cn(
                          PRINTER_KEY_CLASS,
                          "h-10 flex-1 justify-center px-3"
                        )}
                        onClick={() => {
                          close();
                          tip.holdToken(token.code);
                        }}
                      >
                        {tipCopy.dropInWasher}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <TipCoinCloseUp
                token={viewing}
                headingId="pocket-heading"
                onBack={leaveCloseUp}
                onClose={close}
              />
            )}
          </TipSwap>
        </div>
      </TipModal>
    </>
  );
}
