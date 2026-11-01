"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { incrementPostView } from "./increment-post-view";
import { PostViewsContext } from "./post-views-context";

type PostViewsProviderProps = {
  slug: string;
  children: ReactNode;
};

export function PostViewsProvider(props: PostViewsProviderProps) {
  const [views, setViews] = useState<number>();
  const countedSlugRef = useRef<string>(undefined);

  useEffect(() => {
    // React runs effects twice in development; count each visit once.
    if (countedSlugRef.current === props.slug) return;
    countedSlugRef.current = props.slug;
    incrementPostView({ slug: props.slug })
      .then((result) => setViews(result.views))
      .catch(() => setViews(undefined));
  }, [props.slug]);

  return (
    <PostViewsContext.Provider value={views}>
      {props.children}
    </PostViewsContext.Provider>
  );
}
