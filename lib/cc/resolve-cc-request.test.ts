import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveCcRequest } from "./resolve-cc-request";

const request = (options: {
  hostname: string;
  pathname: string;
  search?: string;
}) => ({
  hostname: options.hostname,
  pathname: options.pathname,
  search: options.search ?? "",
});

test("serves the overview at the root of the subdomain", () => {
  assert.deepEqual(
    resolveCcRequest(request({ hostname: "cc.liyuxuan.dev", pathname: "/" })),
    { kind: "rewrite", pathname: "/cc" }
  );
});

test("prefixes other paths on the subdomain with the base path", () => {
  assert.deepEqual(
    resolveCcRequest(
      request({ hostname: "cc.localhost", pathname: "/calendar" })
    ),
    { kind: "rewrite", pathname: "/cc/calendar" }
  );
});

test("leaves paths already under the base path alone on the subdomain", () => {
  assert.deepEqual(
    resolveCcRequest(request({ hostname: "cc.liyuxuan.dev", pathname: "/cc" })),
    { kind: "pass" }
  );
});

test("redirects the portfolio's /cc paths to the subdomain", () => {
  assert.deepEqual(
    resolveCcRequest(
      request({
        hostname: "liyuxuan.dev",
        pathname: "/cc/insights",
        search: "?a=1",
      })
    ),
    { kind: "redirect", url: "https://cc.liyuxuan.dev/insights?a=1" }
  );
});

test("passes other hosts through", () => {
  assert.deepEqual(
    resolveCcRequest(request({ hostname: "paws.garden", pathname: "/cc" })),
    { kind: "pass" }
  );
});
