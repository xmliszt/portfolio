import {
  LAUNDROMAT_HOSTNAMES,
  REDIRECTED_LAUNDROMAT_HOSTNAMES,
} from "@/lib/laundromat/hosts";

const OWN_HOSTNAMES = [
  ...LAUNDROMAT_HOSTNAMES,
  ...REDIRECTED_LAUNDROMAT_HOSTNAMES,
];
const MAX_HOST_LENGTH = 253;

/** Return the lowercase host of the `referrer` URL without a trailing dot, or `undefined` when it is empty, not an http(s) URL, longer than 253 characters, or one of laundro.cafe's own hosts. */
export function getReferrerHost(referrer: string) {
  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (host === "" || host.length > MAX_HOST_LENGTH) return undefined;
    return OWN_HOSTNAMES.includes(host) ? undefined : host;
  } catch {
    return undefined;
  }
}
