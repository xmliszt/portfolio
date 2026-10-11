import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveLaundromatRequest } from "./resolve-laundromat-request";

test("rewrites the domain root to the visitor's locale page", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "laundro.cafe",
      pathname: "/",
      search: "",
      locale: "ja",
    }),
    { kind: "rewrite", pathname: "/laundromat/ja" }
  );
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "laundro.cafe",
      pathname: "/laundromat",
      search: "",
      locale: "en",
    }),
    { kind: "rewrite", pathname: "/laundromat/en" }
  );
});

test("rewrites other domain paths under /laundromat", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "Laundromat.Localhost",
      pathname: "/lab",
      search: "?hour=18.5",
      locale: "fr",
    }),
    { kind: "rewrite", pathname: "/laundromat/lab" }
  );
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "laundro.cafe",
      pathname: "/ko",
      search: "",
      locale: "en",
    }),
    { kind: "rewrite", pathname: "/laundromat/ko" }
  );
});

test("serves the domain's own robots.txt, sitemap.xml and favicon.ico", () => {
  for (const pathname of ["/robots.txt", "/sitemap.xml", "/favicon.ico"]) {
    assert.deepEqual(
      resolveLaundromatRequest({
        hostname: "laundro.cafe",
        pathname,
        search: "",
        locale: "en",
      }),
      { kind: "rewrite", pathname: `/laundromat${pathname}` }
    );
  }
});

test("does not prefix a domain path twice", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "laundro.cafe",
      pathname: "/laundromat/lab",
      search: "",
      locale: "en",
    }),
    { kind: "pass" }
  );
});

test("redirects the old hostnames to laundro.cafe", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "laundromat.liyuxuan.dev",
      pathname: "/lab",
      search: "?focus=shelf",
      locale: "en",
    }),
    { kind: "redirect", url: "https://laundro.cafe/lab?focus=shelf" }
  );
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "www.laundro.cafe",
      pathname: "/",
      search: "",
      locale: "en",
    }),
    { kind: "redirect", url: "https://laundro.cafe/" }
  );
});

test("redirects the portfolio's /laundromat paths to laundro.cafe", () => {
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "www.liyuxuan.dev",
      pathname: "/laundromat",
      search: "",
      locale: "en",
    }),
    { kind: "redirect", url: "https://laundro.cafe/" }
  );
  assert.deepEqual(
    resolveLaundromatRequest({
      hostname: "liyuxuan.dev",
      pathname: "/laundromat/lab",
      search: "?focus=shelf",
      locale: "en",
    }),
    { kind: "redirect", url: "https://laundro.cafe/lab?focus=shelf" }
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
    assert.deepEqual(resolveLaundromatRequest({ ...request, locale: "en" }), {
      kind: "pass",
    });
  }
});
