"use client";

import { useContext } from "react";

import { PostViewsContext } from "./post-views-context";

export function PostViewCount() {
  const views = useContext(PostViewsContext);
  return (
    <div className={views == null ? "invisible" : undefined}>
      {views ?? 0} views
    </div>
  );
}
