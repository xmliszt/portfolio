/** What publishing a post on its platform returned: the new post's id and live URL, or why it failed. */
export type PublishResult =
  | { kind: "ok"; platformPostId: string; url: string | undefined }
  | { kind: "error"; message: string };
