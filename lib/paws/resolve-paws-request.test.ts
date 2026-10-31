import assert from "node:assert/strict";
import { test } from "node:test";

import { resolvePawsRequest } from "./resolve-paws-request";

const request = (options: {
  hostname: string;
  pathname: string;
  search?: string;
}) => ({
  hostname: options.hostname,
  pathname: options.pathname,
  search: options.search ?? "",
});

test("serves the paws page at the root of its subdomain", () => {
  assert.deepEqual(
    resolvePawsRequest(
      request({ hostname: "paws.liyuxuan.dev", pathname: "/" })
    ),
    {
      kind: "rewrite",
      pathname: "/paws",
    }
  );
});

test("prefixes other subdomain paths with the paws base path", () => {
  assert.deepEqual(
    resolvePawsRequest(
      request({ hostname: "paws.localhost", pathname: "/room" })
    ),
    {
      kind: "rewrite",
      pathname: "/paws/room",
    }
  );
});

test("passes subdomain paths that already sit under the base path", () => {
  assert.deepEqual(
    resolvePawsRequest(
      request({ hostname: "paws.liyuxuan.dev", pathname: "/paws" })
    ),
    {
      kind: "pass",
    }
  );
});

test("redirects the portfolio's /paws path to the subdomain, keeping the query", () => {
  assert.deepEqual(
    resolvePawsRequest(
      request({ hostname: "liyuxuan.dev", pathname: "/paws", search: "?a=1" })
    ),
    { kind: "redirect", url: "https://paws.liyuxuan.dev/?a=1" }
  );
});

test("leaves other hosts and paths alone", () => {
  assert.deepEqual(
    resolvePawsRequest(
      request({ hostname: "liyuxuan.dev", pathname: "/posts" })
    ),
    {
      kind: "pass",
    }
  );
  assert.deepEqual(
    resolvePawsRequest(request({ hostname: "laundro.cafe", pathname: "/" })),
    {
      kind: "pass",
    }
  );
});
