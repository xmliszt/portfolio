"use client";

import { TwitterTweetEmbed } from "react-twitter-embed";

export function TweetEmbedWrapper({ tweetId }: { tweetId: string }) {
  return <TwitterTweetEmbed tweetId={tweetId} />;
}
