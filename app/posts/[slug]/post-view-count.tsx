"use client";

import { useContext } from "react";

import { PostViewsContext } from "./post-views-context";

export function PostViewCount() {
  const views = useContext(PostViewsContext);
  return <div>{views == null ? " " : `${views} views`}</div>;
}
