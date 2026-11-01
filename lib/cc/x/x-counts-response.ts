/** Body of X's `GET /2/tweets/counts/recent`. */
export type XCountsResponse = {
  data?: {
    start: string;
    end: string;
    post_count?: number;
  }[];
};
