import { createContext } from "react";

/** The post's view count after this visit is counted; `undefined` until the count arrives. */
export const PostViewsContext = createContext<number | undefined>(undefined);
