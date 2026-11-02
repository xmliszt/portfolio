/** A reference to a blob stored on the account's data server, as a post embed expects it. */
export type BlobRef = {
  $type: "blob";
  ref: { $link: string };
  mimeType: string;
  size: number;
};
