import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveLaundromatRequest } from "./resolve-laundromat-request";

test("rewrites the subdomain root to /laundromat", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "laundromat.liyuxuan.dev",
      pathname: "/",
      search: "",
    }),
    { kind: "rewrite", pathname: "/laundromat" }
  );
});

test("rewrites subdomain paths under /laundromat", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "Laundromat.Localhost",
      pathname: "/lab",
      search: "?hour=18.5",
    }),
    { kind: "rewrite", pathname: "/laundromat/lab" }
  );
});

test("does not prefix a subdomain path twice", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "laundromat.liyuxuan.dev",
      pathname: "/laundromat/lab",
      search: "",
    }),
    { kind: "pass" }
  );
});

test("redirects the portfolio's /laundromat paths to the subdomain", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "www.liyuxuan.dev",
      pathname: "/laundromat",
      search: "",
    }),
    { kind: "redirect", url: "https://laundromat.liyuxuan.dev/" }
  );
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "liyuxuan.dev",
      pathname: "/laundromat/lab",
      search: "?focus=shelf",
    }),
    { kind: "redirect", url: "https://laundromat.liyuxuan.dev/lab?focus=shelf" }
  );
});

test("leaves localhost, previews and other portfolio paths alone", () => {
  const requests = [
    { hostname: "localhost", pathname: "/laundromat", search: "" },
    {
      hostname: "portfolio-git-x.vercel.app",
      pathname: "/laundromat",
      search: "",
    },
    { hostname: "www.liyuxuan.dev", pathname: "/laundromats", search: "" },
    { hostname: "www.liyuxuan.dev", pathname: "/about", search: "" },
  ];
  for (const request of requests) {
    assert.deepEqual(resolveLaundromatRequest(request), { kind: "pass" });
  }
});
