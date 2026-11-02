/** A Bluesky reply's thread references: the top post of the thread and the post it answers, each by URI and CID. */
export type BlueskyReplyRef = {
  root: { uri: string; cid: string };
  parent: { uri: string; cid: string };
};
