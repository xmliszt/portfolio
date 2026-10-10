import {
  LAUNDROMAT_BASE_PATH,
  LAUNDROMAT_HOSTNAMES,
  LAUNDROMAT_ORIGIN,
  PORTFOLIO_HOSTNAMES,
} from "./hosts";

type LaundromatRequest = {
  hostname: string;
  pathname: string;
  search: string;
};

type LaundromatRequestResolution =
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect"; url: string }
  | { kind: "pass" };

/** Decide how `proxy.ts` routes a request: serve the laundromat on its subdomain, send the portfolio's `/laundromat` paths to the subdomain, or leave it alone. */
export function resolveLaundromatRequest(
  request: LaundromatRequest
): LaundromatRequestResolution {
  const hostname = request.hostname.toLowerCase();
  const isUnderBasePath =
    request.pathname === LAUNDROMAT_BASE_PATH ||
    request.pathname.startsWith(`${LAUNDROMAT_BASE_PATH}/`);

  if (LAUNDROMAT_HOSTNAMES.includes(hostname)) {
    if (isUnderBasePath) return { kind: "pass" };
    return {
      kind: "rewrite",
      pathname:
        request.pathname === "/"
          ? LAUNDROMAT_BASE_PATH
          : `${LAUNDROMAT_BASE_PATH}${request.pathname}`,
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
