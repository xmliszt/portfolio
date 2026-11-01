import mapValues from "lodash/mapValues.js";

import { isJsonObject } from "./is-json-object";
import { isPlatformId } from "./is-platform-id";
import type {
  SmartCampaignEdit,
  SmartCampaignForm,
  SmartCampaignState,
} from "./smart-campaign-state";

function readText(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function readFlag(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readForm(options: {
  value: unknown;
  defaultForm: SmartCampaignForm;
}): SmartCampaignForm | undefined {
  if (!isJsonObject(options.value)) return undefined;
  const form = options.value;
  const fallback = options.defaultForm;
  const languages = isJsonObject(form.languages) ? form.languages : {};
  const media = isJsonObject(form.media) ? form.media : {};
  return {
    name: readText(form.name, fallback.name),
    link: readText(form.link, fallback.link),
    thoughts: readText(form.thoughts, fallback.thoughts),
    makersNote: readText(form.makersNote, fallback.makersNote),
    platformIds: Array.isArray(form.platformIds)
      ? form.platformIds.flatMap((id) =>
          typeof id === "string" && isPlatformId(id) ? [id] : []
        )
      : fallback.platformIds,
    languages: mapValues(fallback.languages, (language, id) => {
      const stored = languages[id];
      return stored === "en" || stored === "zh" ? stored : language;
    }),
    startDate:
      typeof form.startDate === "string" &&
      /^(\d{4}-\d{2}-\d{2})?$/.test(form.startDate)
        ? form.startDate
        : fallback.startDate,
    lengthDays:
      typeof form.lengthDays === "number" &&
      Number.isInteger(form.lengthDays) &&
      form.lengthDays >= 1
        ? form.lengthDays
        : fallback.lengthDays,
    media: {
      promo: readFlag(media.promo, fallback.media.promo),
      features: readFlag(media.features, fallback.media.features),
      images: readFlag(media.images, fallback.media.images),
      notes: readText(media.notes, fallback.media.notes),
    },
  };
}

function readEdits(value: unknown) {
  if (!isJsonObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(
      ([ref, edit]): [string, SmartCampaignEdit][] =>
        isJsonObject(edit)
          ? [
              [
                ref,
                {
                  title: readText(edit.title, ""),
                  body: readText(edit.body, ""),
                  hashtags: readText(edit.hashtags, ""),
                  target: readText(edit.target, ""),
                },
              ],
            ]
          : []
    )
  );
}

/** Return the smart campaign kept in localStorage, with `defaultForm` values for fields that are missing or of the wrong type. */
export function parseStoredSmartCampaign(options: {
  value: unknown;
  defaultForm: SmartCampaignForm;
}): SmartCampaignState {
  const stored = isJsonObject(options.value) ? options.value : {};
  return {
    form:
      readForm({ value: stored.form, defaultForm: options.defaultForm }) ??
      options.defaultForm,
    promptForm: readForm({
      value: stored.promptForm,
      defaultForm: options.defaultForm,
    }),
    reply: readText(stored.reply, ""),
    edits: readEdits(stored.edits),
    removedRefs: Array.isArray(stored.removedRefs)
      ? stored.removedRefs.flatMap((ref) =>
          typeof ref === "string" ? [ref] : []
        )
      : [],
    createdCampaignId:
      typeof stored.createdCampaignId === "string"
        ? stored.createdCampaignId
        : undefined,
  };
}
