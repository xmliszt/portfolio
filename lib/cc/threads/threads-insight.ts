/** One metric in the body of Threads' `GET /{media-id}/insights`. */
export type ThreadsInsight = {
  name: string;
  values?: { value?: number }[];
  total_value?: { value?: number };
};
