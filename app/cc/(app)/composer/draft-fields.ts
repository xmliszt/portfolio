export type PostAsset = { file: string; alt: string };

export type DraftFields = {
  title: string;
  body: string;
  hashtagsText: string;
  target: string;
  link: string;
  assets: readonly PostAsset[];
};
