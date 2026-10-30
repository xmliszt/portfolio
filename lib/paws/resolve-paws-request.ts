import { PORTFOLIO_HOSTNAMES } from "@/lib/laundromat/hosts";

import { PAWS_BASE_PATH, PAWS_HOSTNAMES, PAWS_ORIGIN } from "./paws-hosts";

type PawsRequest = { hostname: string; pathname: string; search: string };

type PawsRequestResolution =
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect"; url: string }
  | { kind: "pass" };

/** Decide how `proxy.ts` routes a request: serve the paws page on its subdomain, send the portfolio's `/paws` paths to that subdomain, or leave it alone. */
export function resolvePawsRequest(request: PawsRequest): PawsRequestResolution {
  const hostname = request.hostname.toLowerCase();
  const isUnderBasePath =
    request.pathname === PAWS_BASE_PATH || request.pathname.startsWith(`${PAWS_BASE_PATH}/`);

  if (PAWS_HOSTNAMES.includes(hostname)) {
    if (isUnderBasePath) return { kind: "pass" };
    return {
      kind: "rewrite",
      pathname: request.pathname === "/" ? PAWS_BASE_PATH : `${PAWS_BASE_PATH}${request.pathname}`,
    };
  }

  if (PORTFOLIO_HOSTNAMES.includes(hostname) && isUnderBasePath) {
    const subdomainPathname = request.pathname.slice(PAWS_BASE_PATH.length) || "/";
    return { kind: "redirect", url: `${PAWS_ORIGIN}${subdomainPathname}${request.search}` };
  }

  return { kind: "pass" };
}
