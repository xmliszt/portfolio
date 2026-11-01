import { PORTFOLIO_HOSTNAMES } from "@/lib/laundromat/hosts";

import { CC_BASE_PATH, CC_HOSTNAMES, CC_ORIGIN } from "./cc-hosts";

type CcRequest = { hostname: string; pathname: string; search: string };

type CcRequestResolution =
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect"; url: string }
  | { kind: "pass" };

/** Decide how `proxy.ts` routes a request: serve the command center on its subdomain, send the portfolio's `/cc` paths to that subdomain, or leave it alone. */
export function resolveCcRequest(request: CcRequest): CcRequestResolution {
  const hostname = request.hostname.toLowerCase();
  const isUnderBasePath =
    request.pathname === CC_BASE_PATH ||
    request.pathname.startsWith(`${CC_BASE_PATH}/`);

  if (CC_HOSTNAMES.includes(hostname)) {
    if (isUnderBasePath) return { kind: "pass" };
    return {
      kind: "rewrite",
      pathname:
        request.pathname === "/"
          ? CC_BASE_PATH
          : `${CC_BASE_PATH}${request.pathname}`,
    };
  }

  if (PORTFOLIO_HOSTNAMES.includes(hostname) && isUnderBasePath) {
    const subdomainPathname =
      request.pathname.slice(CC_BASE_PATH.length) || "/";
    return {
      kind: "redirect",
      url: `${CC_ORIGIN}${subdomainPathname}${request.search}`,
    };
  }

  return { kind: "pass" };
}
