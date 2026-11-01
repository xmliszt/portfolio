import type { SmartCampaignLanguage } from "./build-smart-campaign-plan";
import type { PlatformId } from "./platforms";

/** What the owner fills in on the Smart campaign page. */
export type SmartCampaignForm = {
  name: string;
  link: string;
  thoughts: string;
  makersNote: string;
  platformIds: PlatformId[];
  languages: { [id in PlatformId]: SmartCampaignLanguage };
  /** First Singapore-time day ("yyyy-MM-dd"), or "" when not picked yet. */
  startDate: string;
  lengthDays: number;
  media: { promo: boolean; features: boolean; images: boolean; notes: string };
};

/** The owner's changes to one post from ChatGPT's reply. */
export type SmartCampaignEdit = {
  title: string;
  body: string;
  hashtags: string;
  target: string;
};

/** An unfinished smart campaign as kept in localStorage: the form, the form the prompt was built from, the pasted reply, edits by ref, removed refs and the campaign once created. */
export type SmartCampaignState = {
  form: SmartCampaignForm;
  promptForm: SmartCampaignForm | undefined;
  reply: string;
  edits: { [ref: string]: SmartCampaignEdit };
  removedRefs: string[];
  createdCampaignId: string | undefined;
};
