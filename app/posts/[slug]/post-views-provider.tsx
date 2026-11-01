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
    if (countedSlugRef.current === props.slug) return;
    countedSlugRef.current = props.slug;
    incrementPostView({ slug: props.slug })
      .then((result) => setViews(result.views))
      .catch((error) => console.error(error));
  }, [props.slug]);

  return (
    <PostViewsContext.Provider value={views}>
      {props.children}
    </PostViewsContext.Provider>
  );
}
