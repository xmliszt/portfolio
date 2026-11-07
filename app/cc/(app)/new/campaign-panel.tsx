"use client";

import { useState, useTransition } from "react";

import { CcButton } from "@/app/cc/_ui/cc-button";
import { CcField } from "@/app/cc/_ui/cc-field";
import { Panel } from "@/app/cc/_ui/panel";
import { saveCampaign } from "@/app/cc/(app)/_actions/save-campaign";
import { CAMPAIGN_COLORS } from "@/lib/cc/campaign-colors";
import type { CampaignRow } from "@/lib/cc/data/cc-rows";
import { formatSgt } from "@/lib/cc/format-sgt";
import { getCampaignColorVar } from "@/lib/cc/get-campaign-color-var";
import { sgtToUtc } from "@/lib/cc/sgt-to-utc";
import { cn } from "@/lib/utils";

type CampaignPanelProps = {
  campaign: CampaignRow | undefined;
};

export function CampaignPanel(props: CampaignPanelProps) {
  const [formKey, setFormKey] = useState(0);
  const [status, setStatus] = useState<
    { kind: "saved" | "error"; text: string } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();
  const campaign = props.campaign;
  const isNew = campaign === undefined;
  const startsAt =
    campaign?.starts_at === null || campaign?.starts_at === undefined
      ? undefined
      : new Date(campaign.starts_at);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = String(form.get("date") ?? "");
    const link = String(form.get("link") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    setStatus(undefined);
    startTransition(async () => {
      try {
        await saveCampaign({
          campaignId: campaign?.id,
          fields: {
            name: String(form.get("name") ?? ""),
            code: String(form.get("code") ?? ""),
            color: String(form.get("color") ?? ""),
            link: link === "" ? null : link,
            notes: notes === "" ? null : notes,
            starts_at:
              date === ""
                ? null
                : sgtToUtc({ date, time: "00:00" }).toISOString(),
          },
        });
        if (isNew) setFormKey(formKey + 1);
        setStatus({
          kind: "saved",
          text: isNew ? "Created ✓ · now the focused campaign" : "Saved ✓",
        });
      } catch {
        setStatus({ kind: "error", text: "Could not save. Try again." });
      }
    });
  }

  return (
    <Panel
      title={isNew ? "New campaign" : "Focused campaign"}
      aside={
        isNew
          ? "Code and colour mark its posts on the calendar"
          : "Switch campaigns under FOCUS in the left rail"
      }
      bodyClassName="px-3 py-2.5"
    >
      <form
        key={`${campaign?.id ?? "new"}-${formKey}`}
        onSubmit={submit}
        className="flex flex-col gap-y-3"
      >
        <div className="flex flex-wrap gap-x-3 gap-y-3">
          <div className="min-w-[200px] flex-1">
            <CcField label="NAME" htmlFor="campaign-name">
              <input
                id="campaign-name"
                name="name"
                required
                defaultValue={campaign?.name ?? ""}
                className="cc-input"
              />
            </CcField>
          </div>
          <div className="min-w-[200px] flex-1">
            <CcField label="LINK" htmlFor="campaign-link">
              <input
                id="campaign-link"
                name="link"
                type="url"
                defaultValue={campaign?.link ?? ""}
                className="cc-input"
              />
            </CcField>
          </div>
          <div className="min-w-[160px]">
            <CcField label="STARTS (SGT)" htmlFor="campaign-date">
              <input
                id="campaign-date"
                name="date"
                type="date"
                required={isNew}
                defaultValue={
                  startsAt === undefined
                    ? ""
                    : formatSgt({ date: startsAt, pattern: "yyyy-MM-dd" })
                }
                className="cc-input"
              />
            </CcField>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-3">
          <div className="w-[120px]">
            <CcField label="CODE · 2–4 LETTERS" htmlFor="campaign-code">
              <input
                id="campaign-code"
                name="code"
                required={!isNew}
                maxLength={4}
                pattern="[A-Za-z0-9]{2,4}"
                placeholder={isNew ? "From name" : undefined}
                defaultValue={campaign?.code ?? ""}
                className="cc-input uppercase"
              />
            </CcField>
          </div>
          <fieldset className="flex flex-col gap-y-1">
            <legend className="text-muted-foreground pb-1 text-[10.5px] tracking-[0.04em]">
              COLOUR{isNew ? " · LEAST USED IF UNSET" : ""}
            </legend>
            <div className="flex flex-wrap gap-x-1 gap-y-1">
              {CAMPAIGN_COLORS.map((color) => (
                <label
                  key={color}
                  title={color}
                  className="has-[:checked]:outline-foreground flex size-7 items-center justify-center border has-[:checked]:outline has-[:checked]:outline-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-1"
                >
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    defaultChecked={campaign?.color === color}
                    aria-label={color}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className="size-4"
                    style={{
                      backgroundColor: `hsl(var(${getCampaignColorVar(color)}))`,
                    }}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <CcField
          label="MAKER'S NOTE · USED IN THE CHATGPT PROMPT · EN, THEN --- AND 中文"
          htmlFor="campaign-notes"
        >
          <textarea
            id="campaign-notes"
            name="notes"
            rows={6}
            defaultValue={campaign?.notes ?? ""}
            className="cc-input"
          />
        </CcField>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <CcButton type="submit" variant="primary" disabled={isPending}>
            {isNew ? "CREATE CAMPAIGN" : "SAVE CAMPAIGN"}
          </CcButton>
          {status !== undefined && (
            <span
              role="status"
              className={cn(
                "text-[12px]",
                status.kind === "saved" ? "text-cc-ok" : "text-cc-warn"
              )}
            >
              {status.text}
            </span>
          )}
        </div>
      </form>
    </Panel>
  );
}
