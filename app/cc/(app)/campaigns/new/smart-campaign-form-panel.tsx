import { CcField } from "@/app/cc/_ui/cc-field";
import { Panel } from "@/app/cc/_ui/panel";
import type { SmartCampaignLanguage } from "@/lib/cc/build-smart-campaign-plan";
import { PLATFORM_IDS, type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import type { SmartCampaignForm } from "@/lib/cc/smart-campaign-state";

type SmartCampaignFormPanelProps = {
  form: SmartCampaignForm;
  current: { name: string; startDate: string | undefined } | undefined;
  onChange: (form: SmartCampaignForm) => void;
};

const MEDIA_OPTIONS = [
  { key: "promo", label: "Promo video" },
  { key: "features", label: "Features video" },
  { key: "images", label: "Image set" },
] as const;

export function SmartCampaignFormPanel(props: SmartCampaignFormPanelProps) {
  const form = props.form;
  const currentStartDate = props.current?.startDate;

  function update(fields: Partial<SmartCampaignForm>) {
    props.onChange({ ...form, ...fields });
  }

  function togglePlatform(platformId: PlatformId, isSelected: boolean) {
    update({
      platformIds: PLATFORM_IDS.filter((id) =>
        id === platformId ? isSelected : form.platformIds.includes(id)
      ),
    });
  }

  function changeLanguage(
    platformId: PlatformId,
    language: SmartCampaignLanguage
  ) {
    update({ languages: { ...form.languages, [platformId]: language } });
  }

  return (
    <Panel
      title="Product"
      aside="CC plans the posts; ChatGPT writes them"
      className="flex-[1_1_100%]"
      bodyClassName="flex flex-col gap-y-4 px-[18px] py-4"
    >
      <div className="flex flex-wrap gap-x-4 gap-y-4">
        <div className="min-w-[200px] flex-1">
          <CcField label="PRODUCT NAME" htmlFor="smart-name">
            <input
              id="smart-name"
              className="cc-input"
              value={form.name}
              onChange={(event) => update({ name: event.target.value })}
            />
          </CcField>
        </div>
        <div className="min-w-[200px] flex-1">
          <CcField label="PRODUCT LINK" htmlFor="smart-link">
            <input
              id="smart-link"
              type="url"
              className="cc-input"
              value={form.link}
              onChange={(event) => update({ link: event.target.value })}
            />
          </CcField>
        </div>
      </div>
      <CcField
        label="HOW I THINK ABOUT IT · WHY IT EXISTS, THE FEELING"
        htmlFor="smart-thoughts"
      >
        <textarea
          id="smart-thoughts"
          rows={4}
          className="cc-input resize-y"
          value={form.thoughts}
          onChange={(event) => update({ thoughts: event.target.value })}
        />
      </CcField>
      <CcField
        label="MAKER'S NOTE · OPTIONAL · SAVED AS THE CAMPAIGN'S NOTE"
        htmlFor="smart-note"
      >
        <textarea
          id="smart-note"
          rows={6}
          className="cc-input resize-y"
          value={form.makersNote}
          onChange={(event) => update({ makersNote: event.target.value })}
        />
      </CcField>
      <fieldset className="flex flex-col gap-y-2">
        <legend className="text-muted-foreground mb-1.5 text-[11px] tracking-[0.14em]">
          PLATFORMS · LANGUAGE
        </legend>
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_IDS.map((platformId) => {
            const isSelected = form.platformIds.includes(platformId);
            return (
              <div
                key={platformId}
                className="flex min-h-11 items-center justify-between gap-x-2 border px-3"
              >
                <label className="flex items-center gap-x-2 text-[12px]">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(event) =>
                      togglePlatform(platformId, event.target.checked)
                    }
                  />
                  {PLATFORMS[platformId].label}
                </label>
                {isSelected && (
                  <select
                    aria-label={`${PLATFORMS[platformId].label} language`}
                    className="cc-input w-auto py-1"
                    value={form.languages[platformId]}
                    onChange={(event) =>
                      changeLanguage(
                        platformId,
                        event.target.value === "zh" ? "zh" : "en"
                      )
                    }
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <CcField label="STARTS (SGT)" htmlFor="smart-start">
          <input
            id="smart-start"
            type="date"
            className="cc-input"
            value={form.startDate}
            onChange={(event) => update({ startDate: event.target.value })}
          />
        </CcField>
        <CcField label="LENGTH (DAYS)" htmlFor="smart-length">
          <input
            id="smart-length"
            type="number"
            min={1}
            max={60}
            className="cc-input w-24"
            value={form.lengthDays}
            onChange={(event) =>
              update({
                lengthDays: Math.max(1, Math.round(Number(event.target.value))),
              })
            }
          />
        </CcField>
      </div>
      {form.startDate !== "" &&
        currentStartDate !== undefined &&
        props.current !== undefined && (
          <p
            role="status"
            className={
              form.startDate < currentStartDate
                ? "text-cc-warn text-[12px]"
                : "text-muted-foreground text-[12px]"
            }
          >
            {form.startDate < currentStartDate
              ? `This starts before ${props.current.name} (${currentStartDate}), so every screen keeps showing ${props.current.name}. Pick a later date to make this one current.`
              : `Once created, this becomes the campaign every screen shows, in place of ${props.current.name}.`}
          </p>
        )}
      <fieldset className="flex flex-col gap-y-2">
        <legend className="text-muted-foreground mb-1.5 text-[11px] tracking-[0.14em]">
          MEDIA I HAVE
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {MEDIA_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex min-h-11 items-center gap-x-2 text-[12px]"
            >
              <input
                type="checkbox"
                checked={form.media[option.key]}
                onChange={(event) =>
                  update({
                    media: {
                      ...form.media,
                      [option.key]: event.target.checked,
                    },
                  })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
        <input
          aria-label="Notes on the media"
          placeholder="Notes on the media, e.g. promo in 16x9 and 9x16, 6 images"
          className="cc-input"
          value={form.media.notes}
          onChange={(event) =>
            update({ media: { ...form.media, notes: event.target.value } })
          }
        />
      </fieldset>
    </Panel>
  );
}
