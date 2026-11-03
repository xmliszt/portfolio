import { CcField } from "@/app/cc/_ui/cc-field";
import { CcSelect } from "@/app/cc/_ui/cc-select";
import { Panel } from "@/app/cc/_ui/panel";
import type { SmartCampaignLanguage } from "@/lib/cc/build-smart-campaign-plan";
import {
  CAMPAIGN_KIND_LABEL,
  CAMPAIGN_KINDS,
  type CampaignKind,
} from "@/lib/cc/campaign-plan";
import { PLATFORM_IDS, type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import type { SmartCampaignForm } from "@/lib/cc/smart-campaign-state";

type SmartCampaignFormPanelProps = {
  form: SmartCampaignForm;
  current: { name: string; startDate: string | undefined } | undefined;
  onChange: (form: SmartCampaignForm) => void;
};

const KIND_HINT = {
  launch: "The first time you introduce the product.",
  "follow-up": "People may have seen the launch; a new angle, no intro posts.",
  "feature-update": "Something new shipped; the posts lead with it.",
  event: "A date-bound moment: a reminder the day before, then the day.",
} as const satisfies { [kind in CampaignKind]: string };

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
      className="max-w-[960px] flex-[1_1_100%]"
      bodyClassName="flex flex-col gap-y-3 px-3 py-2.5"
    >
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <CcField label="KIND" htmlFor="smart-kind">
          <CcSelect
            id="smart-kind"
            className="w-[200px]"
            value={form.kind}
            onChange={(kind) => update({ kind })}
            options={CAMPAIGN_KINDS.map((kind) => ({
              value: kind,
              label: CAMPAIGN_KIND_LABEL[kind],
            }))}
          />
        </CcField>
        <span className="text-muted-foreground min-h-7 py-3 text-[12px]">
          {KIND_HINT[form.kind]}
        </span>
      </div>
      <CcField
        label={`WHAT THIS CAMPAIGN SHOULD FOCUS ON${form.kind === "launch" ? " · OPTIONAL" : ""}`}
        htmlFor="smart-intent"
      >
        <textarea
          id="smart-intent"
          rows={3}
          placeholder="e.g. second laundro.cafe campaign: focus on the shared notebook and the late-night regulars, not the intro"
          className="cc-input resize-y"
          value={form.intent}
          onChange={(event) => update({ intent: event.target.value })}
        />
      </CcField>
      <div className="flex flex-wrap gap-x-3 gap-y-3">
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
      <CcField
        label="WHAT'S ALREADY OUT THERE · OPTIONAL · EARLIER POSTS CC DIDN'T TRACK"
        htmlFor="smart-earlier"
      >
        <textarea
          id="smart-earlier"
          rows={3}
          placeholder="Earlier posts, dates, what did well"
          className="cc-input resize-y"
          value={form.earlierPosts}
          onChange={(event) => update({ earlierPosts: event.target.value })}
        />
      </CcField>
      <fieldset className="flex flex-col gap-y-2">
        <legend className="text-muted-foreground mb-1.5 text-[10.5px] tracking-[0.04em] uppercase">
          PLATFORMS · LANGUAGE
        </legend>
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_IDS.map((platformId) => {
            const isSelected = form.platformIds.includes(platformId);
            return (
              <div
                key={platformId}
                className="flex min-h-7 items-center justify-between gap-x-2 border px-3"
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
                  <CcSelect
                    aria-label={`${PLATFORMS[platformId].label} language`}
                    className="w-[96px]"
                    value={form.languages[platformId]}
                    onChange={(language) =>
                      changeLanguage(platformId, language)
                    }
                    options={[
                      { value: "en", label: "English" },
                      { value: "zh", label: "中文" },
                    ]}
                  />
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
        <CcField label="STARTS (SGT)" htmlFor="smart-start">
          <input
            id="smart-start"
            type="date"
            className="cc-input"
            value={form.startDate}
            onChange={(event) => update({ startDate: event.target.value })}
          />
        </CcField>
        {form.kind === "event" && (
          <CcField label="EVENT DAY (SGT)" htmlFor="smart-event">
            <input
              id="smart-event"
              type="date"
              className="cc-input"
              value={form.eventDate}
              onChange={(event) => update({ eventDate: event.target.value })}
            />
          </CcField>
        )}
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
        <legend className="text-muted-foreground mb-1.5 text-[10.5px] tracking-[0.04em] uppercase">
          MEDIA I HAVE
        </legend>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {MEDIA_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex min-h-7 items-center gap-x-2 text-[12px]"
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
        {form.kind !== "launch" && (
          <input
            aria-label="New media for this campaign"
            placeholder="New media for this campaign, e.g. a clip of the notebook filling up, 4 screenshots of visitors' notes"
            className="cc-input"
            value={form.media.newMedia}
            onChange={(event) =>
              update({
                media: { ...form.media, newMedia: event.target.value },
              })
            }
          />
        )}
      </fieldset>
    </Panel>
  );
}
