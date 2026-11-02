/** The X app's consumer key pair and the owner's access token pair, which sign requests as the owner. */
export type XUserCredentials = {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
};
