import type { LaundromatLocale } from "./i18n/laundromat-locales";
import {
  LAUNDROMAT_BASE_PATH,
  LAUNDROMAT_HOSTNAMES,
  LAUNDROMAT_ORIGIN,
  PORTFOLIO_HOSTNAMES,
  REDIRECTED_LAUNDROMAT_HOSTNAMES,
} from "./hosts";

type LaundromatRequest = {
  hostname: string;
  pathname: string;
  search: string;
  locale: LaundromatLocale;
};

type LaundromatRequestResolution =
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect"; url: string }
  | { kind: "pass" };

/** Decide how `proxy.ts` routes a request: serve the laundromat on its domain with the root in `locale`, send old hostnames and the portfolio's `/laundromat` paths to that domain, or leave it alone. */
export function resolveLaundromatRequest(
  request: LaundromatRequest
): LaundromatRequestResolution {
  const hostname = request.hostname.toLowerCase();
  const isUnderBasePath =
    request.pathname === LAUNDROMAT_BASE_PATH ||
    request.pathname.startsWith(`${LAUNDROMAT_BASE_PATH}/`);

  if (LAUNDROMAT_HOSTNAMES.includes(hostname)) {
    if (request.pathname === "/" || request.pathname === LAUNDROMAT_BASE_PATH) {
      return {
        kind: "rewrite",
        pathname: `${LAUNDROMAT_BASE_PATH}/${request.locale}`,
      };
    }
    if (isUnderBasePath) return { kind: "pass" };
    return {
      kind: "rewrite",
      pathname: `${LAUNDROMAT_BASE_PATH}${request.pathname}`,
    };
  }

  if (REDIRECTED_LAUNDROMAT_HOSTNAMES.includes(hostname)) {
    return {
      kind: "redirect",
      url: `${LAUNDROMAT_ORIGIN}${request.pathname}${request.search}`,
    };
  }

  if (PORTFOLIO_HOSTNAMES.includes(hostname) && isUnderBasePath) {
    const subdomainPathname =
      request.pathname.slice(LAUNDROMAT_BASE_PATH.length) || "/";
    return {
      kind: "redirect",
      url: `${LAUNDROMAT_ORIGIN}${subdomainPathname}${request.search}`,
    };
  }

  return { kind: "pass" };
}
