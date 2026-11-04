"use client";

import { useState } from "react";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { deleteAccount } from "@/app/paws/_ui/delete-account";
import { RisoButton } from "@/app/paws/_ui/riso-button";

import { RoomSheet } from "./room-sheet";

type DeleteDataSheetProps = {
  accessToken: string | undefined;
  onDeleted: () => Promise<void>;
  onClose: () => void;
};

/** Render a sheet over the room that asks before deleting the signed-in visitor's account with `accessToken`, calls `onDeleted` once it is gone, and says so. */
export function DeleteDataSheet(props: DeleteDataSheetProps) {
  const { copy } = usePawsCopy();
  const [step, setStep] = useState<
    "asking" | "deleting" | "failed" | "deleted"
  >("asking");

  async function handleDelete() {
    if (props.accessToken === undefined) return;
    setStep("deleting");
    const result = await deleteAccount({ accessToken: props.accessToken });
    if (result.kind === "failed" || result.kind === "unreachable") {
      setStep("failed");
      return;
    }
    await props.onDeleted();
    setStep("deleted");
  }

  return (
    <RoomSheet title={copy.deleteData.title} onClose={props.onClose}>
      {step === "deleted" ? (
        <p role="status" className="px-1 text-[13px] leading-relaxed">
          {copy.deleteData.done}
        </p>
      ) : (
        <div className="flex flex-col gap-y-4 px-1">
          <p className="text-[13px] leading-relaxed">{copy.deleteData.body}</p>
          {step === "failed" && (
            <p
              role="alert"
              className="border-l-[3px] border-[var(--pw-pink)] pl-2"
            >
              {copy.deleteData.failed}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-x-2 gap-y-2">
            <RisoButton
              variant="quiet"
              disabled={step === "deleting"}
              onClick={props.onClose}
            >
              {copy.deleteData.keep}
            </RisoButton>
            <RisoButton
              variant="primary"
              disabled={step === "deleting" || props.accessToken === undefined}
              onClick={handleDelete}
            >
              {step === "deleting"
                ? copy.deleteData.deleting
                : copy.deleteData.confirm}
            </RisoButton>
          </div>
        </div>
      )}
    </RoomSheet>
  );
}
