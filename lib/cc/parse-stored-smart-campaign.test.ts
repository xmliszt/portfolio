import mapValues from "lodash/mapValues.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { parseStoredSmartCampaign } from "./parse-stored-smart-campaign";
import { PLATFORMS } from "./platforms";
import type { SmartCampaignForm } from "./smart-campaign-state";

const DEFAULT_FORM: SmartCampaignForm = {
  name: "",
  link: "",
  thoughts: "",
  makersNote: "A note.",
  platformIds: [],
  languages: mapValues(PLATFORMS, (platform) =>
    platform.id === "xiaohongshu" ? "zh" : "en"
  ),
  startDate: "",
  lengthDays: 14,
  media: { promo: true, features: false, images: false, notes: "" },
};

test("returns an empty campaign for a value that is not an object", () => {
  assert.deepEqual(
    parseStoredSmartCampaign({ value: "broken", defaultForm: DEFAULT_FORM }),
    {
      form: DEFAULT_FORM,
      promptForm: undefined,
      reply: "",
      edits: {},
      removedRefs: [],
      createdCampaignId: undefined,
    }
  );
});

test("keeps valid fields and falls back to the default form for the rest", () => {
  const state = parseStoredSmartCampaign({
    value: {
      form: {
        name: "Paws",
        platformIds: ["x", "mastodon", 3, "xiaohongshu"],
        languages: { x: "zh", threads: "fr" },
        startDate: "3 Nov",
        lengthDays: 0,
        media: { promo: false, images: "yes" },
      },
      reply: "```json\n{}\n```",
      edits: {
        "x-1": { title: 1, body: "Edited", hashtags: "#cats" },
        "x-2": "not an edit",
      },
      removedRefs: ["x-3", 4],
      createdCampaignId: "campaign-id",
    },
    defaultForm: DEFAULT_FORM,
  });
  assert.equal(state.form.name, "Paws");
  assert.equal(state.form.makersNote, "A note.");
  assert.deepEqual(state.form.platformIds, ["x", "xiaohongshu"]);
  assert.equal(state.form.languages.x, "zh");
  assert.equal(state.form.languages.threads, "en");
  assert.equal(state.form.languages.xiaohongshu, "zh");
  assert.equal(state.form.startDate, "");
  assert.equal(state.form.lengthDays, 14);
  assert.deepEqual(state.form.media, {
    promo: false,
    features: false,
    images: false,
    notes: "",
  });
  assert.equal(state.promptForm, undefined);
  assert.equal(state.reply, "```json\n{}\n```");
  assert.deepEqual(state.edits, {
    "x-1": { title: "", body: "Edited", hashtags: "#cats", target: "" },
  });
  assert.deepEqual(state.removedRefs, ["x-3"]);
  assert.equal(state.createdCampaignId, "campaign-id");
});
